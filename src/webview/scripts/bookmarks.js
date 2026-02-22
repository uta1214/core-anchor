// Bookmarks関連処理

let editingBookmark = null;
let allBookmarksData = null;
let selectedBookmarkIcon = 'default';
const editIconSelects = new Map();
let currentIconFilter = '';
let highlightedBookmark = null; // { filePath, line } - ハイライト中のブックマーク
let bookmarksDefaultExpandState = 'collapsed'; // 初期開閉状態
let globalBookmarkSortType = 'line'; // グローバルソートタイプ

function toggleBookmarkForm() {
  const form = document.getElementById('bookmarkForm');
  form.classList.toggle('active');
  if (form.classList.contains('active')) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        document.getElementById('bookmarkFile').focus();
      });
    });
  }
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

function toggleEditBookmark(filePath, line) {
  const form = document.getElementById('edit-bm-' + safeId(filePath + line));
  
  if (form && form.classList.contains('active')) {
    // 既に開いている場合はキャンセル
    cancelEditBookmark(filePath, line);
  } else {
    // 閉じている場合は開く
    startEditBookmark(filePath, line);
  }
}

function startEditBookmark(filePath, line) {
  document.querySelectorAll('.edit-form').forEach(f => f.classList.remove('active'));
  const form = document.getElementById('edit-bm-' + safeId(filePath + line));
  if (form) { 
    form.classList.add('active'); 
    editingBookmark = filePath + ':' + line;
    
    // 自動フォーカス
    setTimeout(() => {
      const lineInput = form.querySelector('.edit-line');
      if (lineInput) {
        lineInput.focus();
        lineInput.select();
      }
    }, 50);
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
  // ハイライトを設定（バックエンドからの通知を待たずに先行設定）
  highlightedBookmark = { filePath, line };
  console.log('[Core Anchor] Jump to bookmark:', { filePath, line });
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
    icon.style.transform = 'rotate(0deg)';
    items.style.display = 'none';
  } else {
    expandedFiles.add(fileId);
    items.classList.add('expanded');
    icon.classList.add('expanded');
    icon.style.transform = 'rotate(90deg)';
    items.style.display = 'block';
  }
  saveState();
}

// グローバルソートタイプを切り替える
function setSortType(sortType) {
  globalBookmarkSortType = sortType;
  vscode.postMessage({ command: 'sortBookmarks', sortType });
  updateGlobalSortButtons();
}

function updateGlobalSortButtons() {
  const btnLine = document.getElementById('globalSortBtnLine');
  const btnOrder = document.getElementById('globalSortBtnOrder');
  if (btnLine) btnLine.classList.toggle('sort-btn-active', globalBookmarkSortType === 'line');
  if (btnOrder) btnOrder.classList.toggle('sort-btn-active', globalBookmarkSortType === 'order');
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
  
  // 初回判定（expandedFilesが空 = まだユーザーが手動で開閉していない）
  const isFirstRender = expandedFiles.size === 0;
  
  files.forEach(filePath => {
    const marks = bookmarks[filePath];
    const fileId = safeId(filePath);
    
    // 初回かつ設定が expanded の場合は全て展開
    let isExpanded = expandedFiles.has(fileId);
    if (isFirstRender && bookmarksDefaultExpandState === 'expanded') {
      isExpanded = true;
      expandedFiles.add(fileId);
    }
    
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-group';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'file-header';
    headerDiv.onclick = () => toggleFileGroup(fileId);
    headerDiv.oncontextmenu = (e) => showContextMenu(e, [
      { label: 'Delete All Bookmarks', action: () => vscode.postMessage({ command: 'deleteAllBookmarks', filePath }) },
    ]);

    // 展開アイコン
    const expandSpan = document.createElement('span');
    expandSpan.id = 'fileicon-' + fileId;
    expandSpan.className = 'file-icon' + (isExpanded ? ' expanded' : '');
    expandSpan.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:16px;transition:transform 0.2s;' + (isExpanded ? 'transform:rotate(90deg);' : '');
    expandSpan.innerHTML = EXPAND_ICON;

    // ファイル名
    const fileIconSrc = fileIcons[filePath] || '';
    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'file-name';
    if (fileIconSrc) {
      const img = document.createElement('img');
      img.src = fileIconSrc;
      img.style.cssText = 'width:14px;height:14px;vertical-align:middle;margin-right:4px;';
      fileNameSpan.appendChild(img);
    } else {
      fileNameSpan.appendChild(document.createTextNode('📄 '));
    }
    fileNameSpan.appendChild(document.createTextNode(filePath));

    // バッジ（件数）
    const countSpan = document.createElement('span');
    countSpan.className = 'file-count';
    countSpan.textContent = marks.length;

    headerDiv.appendChild(expandSpan);
    headerDiv.appendChild(fileNameSpan);
    headerDiv.appendChild(countSpan);
    
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
      
      // ツールチップ用のテキストを作成
      const tooltipText = filePath + '\nLine ' + (mark.line + 1) + ': ' + mark.label;
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      
      // ハイライト判定
      if (highlightedBookmark && highlightedBookmark.filePath === filePath && highlightedBookmark.line === mark.line) {
        itemDiv.classList.add('bm-highlighted');
      }
      
      // item-contentを作成
      const itemContent = document.createElement('div');
      itemContent.className = 'item-content';
      // title属性を削除（ホバー表示なし）
      itemContent.onclick = () => jumpToBookmark(filePath, mark.line);
      
      const itemDesc = document.createElement('div');
      itemDesc.className = 'item-desc';
      itemDesc.innerHTML = '<img src="' + iconSrc + '" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" /> ' + labelEsc;
      
      const itemLine = document.createElement('div');
      itemLine.className = 'item-line';
      itemLine.textContent = 'Line ' + (mark.line + 1);
      
      itemContent.appendChild(itemDesc);
      itemContent.appendChild(itemLine);
      
      // ボタンを作成
      const itemButtons = document.createElement('div');
      itemButtons.className = 'item-buttons';
      
      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.setAttribute('title', 'Edit bookmark');
      editBtn.onclick = (e) => {
        e.stopPropagation();
        toggleEditBookmark(filePath, mark.line);
      };
      editBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" stroke-width="1.5"/></svg>';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn';
      deleteBtn.setAttribute('title', 'Delete bookmark');
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        removeBookmark(filePath, mark.line);
      };
      deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3V1.5C5 1.22386 5.22386 1 5.5 1H10.5C10.7761 1 11 1.22386 11 1.5V3M2 3H14M12.5 3V13.5C12.5 13.7761 12.2761 14 12 14H4C3.72386 14 3.5 13.7761 3.5 13.5V3" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 6.5V10.5M9.5 6.5V10.5" stroke="currentColor" stroke-width="1.5"/></svg>';
      
      itemButtons.appendChild(editBtn);
      itemButtons.appendChild(deleteBtn);
      
      itemDiv.appendChild(itemContent);
      itemDiv.appendChild(itemButtons);
      
      const editForm = document.createElement('div');
      editForm.id = 'edit-bm-' + bmId;
      editForm.className = 'edit-form';
      editForm.innerHTML = `
        <input type="text" class="edit-line" placeholder="Line number" value="${mark.line + 1}" />
        <input type="text" class="edit-label" placeholder="Label" value="${labelEsc}" />
        <div class="custom-select" id="${selectId}">
          <div class="custom-select-trigger">
            <div class="custom-select-value">
              <img class="custom-select-icon" id="${selectId}Image" src="${iconSrc}" />
              <span id="${selectId}Text">${iconLabel}</span>
            </div>
            <span class="custom-select-arrow">∨</span>
          </div>
          <div class="custom-select-options" id="${selectId}Options"></div>
        </div>
        <div class="edit-form-buttons">
          <button class="save-btn">Save</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      `;
      
      // 🔧 FIX: DOMイベントとして追加（XSS対策）
      const customSelectTrigger = editForm.querySelector('.custom-select-trigger');
      const saveBtn = editForm.querySelector('.save-btn');
      const cancelBtn = editForm.querySelector('.cancel-btn');
      
      if (customSelectTrigger) customSelectTrigger.onclick = () => toggleIconSelect(selectId);
      if (saveBtn) saveBtn.onclick = () => saveEditBookmark(filePath, mark.line);
      if (cancelBtn) cancelBtn.onclick = () => cancelEditBookmark(filePath, mark.line);
      const opts = editForm.querySelector('.custom-select-options');
      Object.keys(ICON_LABELS).forEach(type => {
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