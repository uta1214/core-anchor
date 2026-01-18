// UI共通処理

function safeId(str) { 
  return 'id-' + encodeURIComponent(str).replace(/%/g, '_'); 
}

function escapeHtml(text) { 
  const div = document.createElement('div'); 
  div.textContent = text; 
  return div.innerHTML; 
}

// Context Menu
function showContextMenu(e, items) {
  e.preventDefault();
  e.stopPropagation();
  
  const menu = document.getElementById('contextMenu');
  menu.innerHTML = '';
  
  items.forEach(item => {
    if (item.separator) {
      const sep = document.createElement('div');
      sep.className = 'context-menu-separator';
      menu.appendChild(sep);
    } else {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.textContent = item.label;
      menuItem.onclick = () => {
        hideContextMenu();
        item.action();
      };
      menu.appendChild(menuItem);
    }
  });
  
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  menu.classList.add('active');
}

function hideContextMenu() {
  const menu = document.getElementById('contextMenu');
  menu.classList.remove('active');
}

document.addEventListener('click', hideContextMenu);
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('.folder-header, .file-header, .item')) {
    hideContextMenu();
  }
});

// Icon Select
function toggleIconSelect(selectId) {
  const options = document.getElementById(selectId + 'Options');
  if (!options) return;
  document.querySelectorAll('.custom-select-options').forEach(opt => {
    if (opt.id !== selectId + 'Options') opt.classList.remove('active');
  });
  options.classList.toggle('active');
}

function selectIcon(selectId, iconType, label) {
  const img = document.getElementById(selectId + 'Image');
  const text = document.getElementById(selectId + 'Text');
  const options = document.getElementById(selectId + 'Options');
  if (img && iconPaths[iconType]) img.src = iconPaths[iconType];
  if (text) text.textContent = label;
  if (options) options.classList.remove('active');
  if (selectId === 'bookmarkIconSelect') selectedBookmarkIcon = iconType;
  else editIconSelects.set(selectId, iconType);
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select-options').forEach(opt => opt.classList.remove('active'));
  }
});

function setIconImages() {
  const img = document.getElementById('bookmarkIconSelectImage');
  if (img && iconPaths['default']) img.src = iconPaths['default'];
  const opts = document.getElementById('bookmarkIconSelectOptions');
  if (opts) {
    opts.innerHTML = '';
    Object.keys(ICON_LABELS).forEach(iconType => {
      const opt = document.createElement('div');
      opt.className = 'custom-select-option';
      opt.onclick = () => selectIcon('bookmarkIconSelect', iconType, ICON_LABELS[iconType]);
      opt.innerHTML = '<img class="custom-select-icon" src="' + (iconPaths[iconType] || '') + '" /><span>' + ICON_LABELS[iconType] + '</span>';
      opts.appendChild(opt);
    });
  }
  
  const filterOpts = document.getElementById('iconFilterSelectOptions');
  if (filterOpts) {
    filterOpts.innerHTML = '';
    
    const allOpt = document.createElement('div');
    allOpt.className = 'custom-select-option';
    allOpt.onclick = () => selectIconFilter('', 'All Icons');
    allOpt.innerHTML = '<span style="margin-left:22px;">All Icons</span>';
    filterOpts.appendChild(allOpt);
    
    Object.keys(ICON_LABELS).forEach(iconType => {
      const opt = document.createElement('div');
      opt.className = 'custom-select-option';
      opt.onclick = () => selectIconFilter(iconType, ICON_LABELS[iconType]);
      opt.innerHTML = '<img class="custom-select-icon" src="' + (iconPaths[iconType] || '') + '" /><span>' + ICON_LABELS[iconType] + '</span>';
      filterOpts.appendChild(opt);
    });
  }
}

function selectIconFilter(iconType, label) {
  const img = document.getElementById('iconFilterSelectImage');
  const text = document.getElementById('iconFilterSelectText');
  const options = document.getElementById('iconFilterSelectOptions');
  
  if (iconType === '') {
    if (img) {
      img.style.visibility = 'hidden';
      img.src = '';
    }
  } else {
    if (img && iconPaths[iconType]) {
      img.src = iconPaths[iconType];
      img.style.visibility = 'visible';
    }
  }
  
  if (text) text.textContent = label;
  if (options) options.classList.remove('active');
  currentIconFilter = iconType;
  filterBookmarks();
}

// Keyboard Events
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const favoriteForm = document.getElementById('favoriteForm');
    const bookmarkForm = document.getElementById('bookmarkForm');
    
    if (favoriteForm && favoriteForm.classList.contains('active') && e.target.closest('#favoriteForm')) {
      cancelAddFavorite();
      e.preventDefault();
      return;
    }
    
    if (bookmarkForm && bookmarkForm.classList.contains('active') && e.target.closest('#bookmarkForm')) {
      cancelAddBookmark();
      e.preventDefault();
      return;
    }
    
    const activeEditForm = e.target.closest('.edit-form.active');
    if (activeEditForm) {
      activeEditForm.classList.remove('active');
      editingFavorite = null;
      editingBookmark = null;
      e.preventDefault();
      return;
    }
  }
  
  if (e.key === 'Enter' && !e.shiftKey) {
    const favoriteForm = document.getElementById('favoriteForm');
    const bookmarkForm = document.getElementById('bookmarkForm');
    
    if (favoriteForm && favoriteForm.classList.contains('active')) {
      if (e.target.closest('#favoriteForm')) {
        addFavorite();
        e.preventDefault();
      }
    } else if (bookmarkForm && bookmarkForm.classList.contains('active')) {
      if (e.target.closest('#bookmarkForm')) {
        addBookmarkManual();
        e.preventDefault();
      }
    }
    
    const activeEditForm = document.querySelector('.edit-form.active');
    if (activeEditForm && e.target.closest('.edit-form.active')) {
      const formId = activeEditForm.id;
      if (formId.startsWith('edit-fav-')) {
        if (editingFavorite) {
          saveEditFavorite(editingFavorite);
          e.preventDefault();
        }
      } else if (formId.startsWith('edit-bm-')) {
        if (editingBookmark) {
          const [filePath, line] = editingBookmark.split(':');
          saveEditBookmark(filePath, parseInt(line));
          e.preventDefault();
        }
      }
    }
  }
});