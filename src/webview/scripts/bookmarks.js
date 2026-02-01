// Bookmarks関連処理

let editingBookmark = null;
let allBookmarksData = null;
let selectedBookmarkIcon = 'default';
const editIconSelects = new Map();
let currentIconFilter = '';

function toggleBookmarkForm() {
  const form = document.getElementById('bookmarkForm');
  form.classList.toggle('active');
  if (form.classList.contains('active')) document.getElementById('bookmarkFile').focus();
}

function cancelAddBookmark() {
  document.getElementById('bookmarkForm').classList.remove('active');
  document.getElementById('bookmarkFile').value = '';
  document.getElementById('bookmarkLine').value = '';
  document.getElementById('bookmarkLabel').value = '';
  selectedBookmarkIcon = 'default';
  selectIcon('bookmarkIconSelect', 'default', 'Default');
}

function addBookmarkManual() {
  const filePath = document.getElementById('bookmarkFile').value;
  const line = document.getElementById('bookmarkLine').value;
  const label = document.getElementById('bookmarkLabel').value;
  if (filePath && line) {
    vscode.postMessage({ command: 'addBookmarkManual', filePath, line, label: label || '', iconType: selectedBookmarkIcon });
    cancelAddBookmark();
  }
}

function startEditBookmark(filePath, line) {
  document.querySelectorAll('.edit-form').forEach(f => f.classList.remove('active'));
  const form = document.getElementById('edit-bm-' + safeId(filePath + line));
  if (form) { 
    form.classList.add('active'); 
    editingBookmark = filePath + ':' + line; 
  }
}

function saveEditBookmark(filePath, oldLine) {
  const form = document.getElementById('edit-bm-' + safeId(filePath + oldLine));
  if (!form) return;
  const newLine = form.querySelector('.edit-line').value;
  const label = form.querySelector('.edit-label').value;
  const selectId = 'editIconSelect-' + safeId(filePath + oldLine);
  const iconType = editIconSelects.get(selectId) || 'default';
  vscode.postMessage({ command: 'editBookmark', filePath, oldLine, newLine, label, iconType });
  form.classList.remove('active');
  editingBookmark = null;
  editIconSelects.delete(selectId);
}

function cancelEditBookmark(filePath, line) {
  const form = document.getElementById('edit-bm-' + safeId(filePath + line));
  if (form) form.classList.remove('active');
  editingBookmark = null;
  editIconSelects.delete('editIconSelect-' + safeId(filePath + line));
}

function removeBookmark(filePath, line) { 
  vscode.postMessage({ command: 'removeBookmark', filePath, line }); 
}

function jumpToBookmark(filePath, line) { 
  vscode.postMessage({ command: 'jumpToBookmark', filePath, line }); 
}

function toggleFileGroup(fileId) {
  const icon = document.getElementById('fileicon-' + fileId);
  const items = document.getElementById('fileitems-' + fileId);
  if (!icon || !items) return;
  const wasExpanded = items.classList.contains('expanded');
  if (wasExpanded) {
    expandedFiles.delete(fileId);
    items.classList.remove('expanded');
    icon.classList.remove('expanded');
    items.style.display = 'none';
  } else {
    expandedFiles.add(fileId);
    items.classList.add('expanded');
    icon.classList.add('expanded');
    items.style.display = 'block';
  }
  saveState();
}

function filterBookmarks() {
  const searchText = document.getElementById('bookmarkSearch').value.toLowerCase();
  if (!allBookmarksData) return;
  
  let filtered = {};
  
  if (currentIconFilter) {
    Object.entries(allBookmarksData).forEach(([filePath, marks]) => {
      const filteredMarks = marks.filter(mark => {
        const iconType = mark.iconType || 'default';
        return iconType === currentIconFilter;
      });
      if (filteredMarks.length > 0) {
        filtered[filePath] = filteredMarks;
      }
    });
  } else {
    filtered = JSON.parse(JSON.stringify(allBookmarksData));
  }
  
  if (searchText !== '') {
    const searchFiltered = {};
    Object.entries(filtered).forEach(([filePath, marks]) => {
      const filteredMarks = marks.filter(mark => {
        return filePath.toLowerCase().includes(searchText) ||
               mark.label.toLowerCase().includes(searchText) ||
               ('line ' + (mark.line + 1)).includes(searchText);
      });
      
      if (filteredMarks.length > 0) {
        searchFiltered[filePath] = filteredMarks;
      }
    });
    filtered = searchFiltered;
  }
  
  updateBookmarks(filtered);
}

function updateBookmarks(bookmarks) {
  const container = document.getElementById('bookmarks');
  const debug = document.getElementById('bookmarkDebug');
  if (!bookmarks) {
    debug.textContent = 'ERROR';
    container.innerHTML = '<div class="empty-text">Error</div>';
    return;
  }
  const entries = Object.entries(bookmarks);
  let total = 0;
  entries.forEach(([,marks]) => total += marks.length);
  debug.textContent = entries.length + ' files, ' + total + ' bookmarks';
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-text">No bookmarks</div>';
    return;
  }
  
  let files = entries.map(([filePath]) => filePath);
  if (bookmarksMeta.fileOrder && bookmarksMeta.fileOrder.length > 0) {
    files = bookmarksMeta.fileOrder.filter(f => bookmarks[f]);
    entries.forEach(([filePath]) => {
      if (!files.includes(filePath)) files.push(filePath);
    });
  }
  
  container.innerHTML = '';
  files.forEach(filePath => {
    const marks = bookmarks[filePath];
    const fileId = safeId(filePath);
    const isExpanded = expandedFiles.has(fileId);
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-group';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'file-header';
    headerDiv.onclick = () => toggleFileGroup(fileId);
    headerDiv.oncontextmenu = (e) => showContextMenu(e, [
      { label: 'Sort by Line Number', action: () => vscode.postMessage({ command: 'sortBookmarks', filePath, sortType: 'line' }) },
      { label: 'Sort by Added Order', action: () => vscode.postMessage({ command: 'sortBookmarks', filePath, sortType: 'order' }) },
      { separator: true },
      { label: 'Delete All Bookmarks', action: () => vscode.postMessage({ command: 'deleteAllBookmarks', filePath }) },
    ]);
    
    // ファイルアイコンを取得
    const fileIconSrc = fileIcons[filePath] || '';
    const fileIconHtml = fileIconSrc ? '<img src="' + fileIconSrc + '" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" />' : '📄 ';
    
    headerDiv.innerHTML = '<span id="fileicon-' + fileId + '" class="file-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="file-name">' + fileIconHtml + escapeHtml(filePath) + '</span><span class="file-count">(' + marks.length + ')</span>';
    
    const itemsDiv = document.createElement('div');
    itemsDiv.id = 'fileitems-' + fileId;
    itemsDiv.className = 'file-items' + (isExpanded ? ' expanded' : '');
    itemsDiv.style.display = isExpanded ? 'block' : 'none';
    
    marks.forEach(mark => {
      const bmId = safeId(filePath + mark.line);
      const labelEsc = escapeHtml(mark.label);
      const iconType = mark.iconType || 'default';
      const iconLabel = ICON_LABELS[iconType] || 'Default';
      const selectId = 'editIconSelect-' + bmId;
      const iconSrc = iconPaths[iconType] || '';
      const safeFilePath = filePath.replace(/'/g, "\\'").replace(/\\\\/g, "\\\\");
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.innerHTML = '<div class="item-content" onclick="jumpToBookmark(\'' + safeFilePath + '\', ' + mark.line + ')"><div class="item-desc"><img src="' + iconSrc + '" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" /> ' + labelEsc + '</div><div class="item-line">Line ' + (mark.line + 1) + '</div></div><div class="item-buttons"><button class="btn" onclick="event.stopPropagation(); startEditBookmark(\'' + safeFilePath + '\', ' + mark.line + ')"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" stroke-width="1.5"/></svg></button><button class="btn" onclick="event.stopPropagation(); removeBookmark(\'' + safeFilePath + '\', ' + mark.line + ')"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" stroke-width="1.5"/></svg></button></div>';
      const editForm = document.createElement('div');
      editForm.id = 'edit-bm-' + bmId;
      editForm.className = 'edit-form';
      editForm.innerHTML = '<input type="text" class="edit-line" placeholder="Line number" value="' + (mark.line + 1) + '" /><input type="text" class="edit-label" placeholder="Label" value="' + labelEsc + '" /><div class="custom-select" id="' + selectId + '"><div class="custom-select-trigger" onclick="toggleIconSelect(\'' + selectId + '\')"><div class="custom-select-value"><img class="custom-select-icon" id="' + selectId + 'Image" src="' + iconSrc + '" /><span id="' + selectId + 'Text">' + iconLabel + '</span></div><span class="custom-select-arrow">∨</span></div><div class="custom-select-options" id="' + selectId + 'Options"></div></div><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditBookmark(\'' + safeFilePath + '\', ' + mark.line + ')">Save</button><button class="cancel-btn" onclick="cancelEditBookmark(\'' + safeFilePath + '\', ' + mark.line + ')">Cancel</button></div>';
      const opts = editForm.querySelector('.custom-select-options');
      Object.keys(ICON_LABELS).forEach(type => {
        // 'all'アイコンは編集時のセレクトに表示しない
        if (type === 'all') return;
        
        const opt = document.createElement('div');
        opt.className = 'custom-select-option';
        opt.onclick = () => selectIcon(selectId, type, ICON_LABELS[type]);
        opt.innerHTML = '<img class="custom-select-icon" src="' + (iconPaths[type] || '') + '" /><span>' + ICON_LABELS[type] + '</span>';
        opts.appendChild(opt);
      });
      const wrapper = document.createElement('div');
      wrapper.appendChild(itemDiv);
      wrapper.appendChild(editForm);
      itemsDiv.appendChild(wrapper);
      editIconSelects.set(selectId, iconType);
    });
    
    fileDiv.appendChild(headerDiv);
    fileDiv.appendChild(itemsDiv);
    container.appendChild(fileDiv);
  });
}