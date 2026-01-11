export function getHtmlContent(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { padding: 10px; font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
    .section { margin-bottom: 20px; }
    .section-header { font-weight: bold; margin-bottom: 8px; font-size: 11px; display: flex; align-items: center; justify-content: space-between; }
    .section-title { flex: 1; }
    .icon-filter { display: flex; align-items: center; }
    .search-container { margin: 8px 0; }
    .search-input { width: 100%; padding: 6px 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); font-family: var(--vscode-font-family); box-sizing: border-box; font-size: 11px; }
    .search-input:focus { outline: 1px solid var(--vscode-focusBorder); }
    .search-input::placeholder { color: var(--vscode-input-placeholderForeground); }
    .mode-switch { display: flex; gap: 4px; }
    .mode-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; padding: 2px 8px; cursor: pointer; font-size: 10px; }
    .mode-btn:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .mode-btn.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    .add-btn-container { margin: 8px 0; text-align: center; display: flex; flex-direction: column; gap: 4px; }
    .toggle-add-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; padding: 4px 12px; cursor: pointer; font-size: 11px; width: 100%; }
    .toggle-add-btn:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .quick-add-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    .quick-add-btn:hover { background: var(--vscode-button-hoverBackground); }
    .add-form { display: none; margin: 8px 0; padding: 8px; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); }
    .add-form.active { display: block; }
    .add-form input { width: 100%; padding: 4px; margin-bottom: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); font-family: var(--vscode-font-family); box-sizing: border-box; }
    .add-form button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 8px; cursor: pointer; width: 100%; margin-top: 4px; }
    .add-form button:hover { background: var(--vscode-button-hoverBackground); }
    .item { padding: 6px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center; position: relative; }
    .item:hover { background: var(--vscode-list-hoverBackground); }
    .item-content { flex: 1; cursor: pointer; }
    .item-file { font-size: 11px; color: var(--vscode-foreground); margin-bottom: 2px; }
    .item-desc { font-size: 10px; color: var(--vscode-descriptionForeground); }
    .item-line { font-size: 9px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
    .item-buttons { display: flex; gap: 4px; }
    .btn { background: none; border: none; color: var(--vscode-foreground); cursor: pointer; padding: 2px 6px; opacity: 0.6; font-size: 12px; }
    .btn:hover { opacity: 1; background: var(--vscode-button-secondaryHoverBackground); }
    .folder-group { margin-bottom: 8px; }
    .folder-header { display: flex; align-items: center; padding: 4px 6px; cursor: pointer; user-select: none; background: var(--vscode-sideBar-background); }
    .folder-header:hover { background: var(--vscode-list-hoverBackground); }
    .folder-icon { margin-right: 6px; font-size: 12px; transition: transform 0.2s; display: inline-block; }
    .folder-icon.expanded { transform: rotate(90deg); }
    .folder-name { font-size: 12px; font-weight: 500; color: var(--vscode-foreground); }
    .folder-count { margin-left: 6px; font-size: 10px; color: var(--vscode-descriptionForeground); }
    .folder-items { padding-left: 16px; display: none; }
    .folder-items.expanded { display: block; }
    .file-group { margin-bottom: 8px; }
    .file-header { display: flex; align-items: center; padding: 4px 6px; cursor: pointer; user-select: none; background: var(--vscode-sideBar-background); }
    .file-header:hover { background: var(--vscode-list-hoverBackground); }
    .file-icon { margin-right: 6px; font-size: 12px; transition: transform 0.2s; display: inline-block; }
    .file-icon.expanded { transform: rotate(90deg); }
    .file-name { font-size: 11px; font-weight: 500; color: var(--vscode-foreground); flex: 1; }
    .file-count { margin-left: 6px; font-size: 10px; color: var(--vscode-descriptionForeground); }
    .file-items { padding-left: 16px; display: none; }
    .file-items.expanded { display: block; }
    .edit-form { display: none; padding: 8px; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); margin-top: 4px; }
    .edit-form.active { display: block; }
    .edit-form input, .edit-form select { width: 100%; padding: 4px; margin-bottom: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); font-family: var(--vscode-font-family); box-sizing: border-box; }
    .edit-form-buttons { display: flex; gap: 4px; margin-top: 4px; }
    .edit-form-buttons button { flex: 1; padding: 4px 8px; cursor: pointer; border: none; font-size: 11px; }
    .save-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    .save-btn:hover { background: var(--vscode-button-hoverBackground); }
    .cancel-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
    .cancel-btn:hover { background: var(--vscode-button-hoverBackground); }
    .separator { border-top: 1px solid var(--vscode-panel-border); margin: 15px 0; }
    .empty-text { font-size: 11px; color: var(--vscode-descriptionForeground); padding: 8px; text-align: center; }
    .debug-info { font-size: 9px; color: var(--vscode-descriptionForeground); padding: 4px; background: var(--vscode-input-background); margin: 4px 0; font-family: monospace; }
    .custom-select { position: relative; width: 100%; margin-bottom: 4px; }
    .custom-select-trigger { width: 100%; padding: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); cursor: pointer; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; }
    .custom-select-trigger:hover { background: var(--vscode-list-hoverBackground); }
    .custom-select-value { display: flex; align-items: center; gap: 6px; }
    .custom-select-icon { width: 16px; height: 16px; object-fit: contain; }
    .custom-select-arrow { font-size: 10px; }
    .custom-select-options { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); max-height: 200px; overflow-y: auto; z-index: 1000; }
    .custom-select-options.active { display: block; }
    .custom-select-option { padding: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .custom-select-option:hover { background: var(--vscode-list-hoverBackground); }
    .context-menu { display: none; position: fixed; background: var(--vscode-menu-background); border: 1px solid var(--vscode-menu-border); box-shadow: 0 2px 8px rgba(0,0,0,0.3); z-index: 10000; min-width: 150px; }
    .context-menu.active { display: block; }
    .context-menu-item { padding: 6px 12px; cursor: pointer; font-size: 11px; color: var(--vscode-menu-foreground); }
    .context-menu-item:hover { background: var(--vscode-menu-selectionBackground); color: var(--vscode-menu-selectionForeground); }
    .context-menu-separator { height: 1px; background: var(--vscode-menu-separatorBackground); margin: 4px 0; }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-header">
      <span class="section-title">⭐ Favorite Files</span>
      <div class="mode-switch">
        <button class="mode-btn" id="globalModeBtn" onclick="switchFavoriteMode('global')">Global</button>
        <button class="mode-btn" id="localModeBtn" onclick="switchFavoriteMode('local')">Local</button>
      </div>
    </div>
    <div class="search-container">
      <input type="text" id="favoriteSearch" class="search-input" placeholder="🔍 Search favorites..." oninput="filterFavorites()" />
    </div>
    <div class="debug-info" id="favoriteDebug">Waiting...</div>
    <div id="favorites"></div>
    <div class="add-btn-container">
      <button class="toggle-add-btn quick-add-btn" onclick="quickAddCurrentFile()">⭐ Quick Add Current File</button>
      <button class="toggle-add-btn" onclick="toggleFavoriteForm()">+ Add File</button>
    </div>
    <div class="add-form" id="favoriteForm">
      <input type="text" id="filePath" placeholder="File path" />
      <input type="text" id="fileDesc" placeholder="Description" />
      <div class="edit-form-buttons">
        <button class="save-btn" onclick="addFavorite()">Add</button>
        <button class="cancel-btn" onclick="cancelAddFavorite()">Cancel</button>
      </div>
    </div>
  </div>
  <div class="separator"></div>
  <div class="section">
    <div class="section-header">
      <span class="section-title">📖 Bookmarks</span>
      <div class="icon-filter">
        <div class="custom-select" id="iconFilterSelect" style="width: 120px;">
          <div class="custom-select-trigger" onclick="toggleIconSelect('iconFilterSelect')">
            <div class="custom-select-value">
              <img class="custom-select-icon" id="iconFilterSelectImage" src="" />
              <span id="iconFilterSelectText">All Icons</span>
            </div>
            <span class="custom-select-arrow">▼</span>
          </div>
          <div class="custom-select-options" id="iconFilterSelectOptions"></div>
        </div>
      </div>
    </div>
    <div class="search-container">
      <input type="text" id="bookmarkSearch" class="search-input" placeholder="🔍 Search bookmarks..." oninput="filterBookmarks()" />
    </div>
    <div class="debug-info" id="bookmarkDebug">Waiting...</div>
    <div id="bookmarks"></div>
    <div class="add-btn-container">
      <button class="toggle-add-btn" onclick="toggleBookmarkForm()">+ Add Bookmark</button>
    </div>
    <div class="add-form" id="bookmarkForm">
      <input type="text" id="bookmarkFile" placeholder="File path" />
      <input type="text" id="bookmarkLine" placeholder="Line number" />
      <input type="text" id="bookmarkLabel" placeholder="Label" />
      <div class="custom-select" id="bookmarkIconSelect">
        <div class="custom-select-trigger" onclick="toggleIconSelect('bookmarkIconSelect')">
          <div class="custom-select-value">
            <img class="custom-select-icon" id="bookmarkIconSelectImage" src="" />
            <span id="bookmarkIconSelectText">Default</span>
          </div>
          <span class="custom-select-arrow">▼</span>
        </div>
        <div class="custom-select-options" id="bookmarkIconSelectOptions"></div>
      </div>
      <div class="edit-form-buttons">
        <button class="save-btn" onclick="addBookmarkManual()">Add</button>
        <button class="cancel-btn" onclick="cancelAddBookmark()">Cancel</button>
      </div>
    </div>
  </div>

  <!-- Context Menu -->
  <div class="context-menu" id="contextMenu"></div>

  <script>
    const vscode = acquireVsCodeApi();
    let editingFavorite = null, editingBookmark = null;
    const expandedFolders = new Set(), expandedFiles = new Set();
    let selectedBookmarkIcon = 'default';
    const editIconSelects = new Map();
    let iconPaths = {};
    let currentFavoriteMode = 'global';
    let favoritesMeta = { folderOrder: [], fileOrder: {} };
    let bookmarksMeta = { fileOrder: [], bookmarkSortType: {} };
    let allFavoritesData = null;
    let allBookmarksData = null;
    let currentIconFilter = '';
    const ICON_LABELS = {'default':'Default','todo':'TODO','bug':'Bug','note':'Note','important':'Important','question':'Question','all':'All'};
    
    function safeId(str) { return 'id-' + encodeURIComponent(str).replace(/%/g, '_'); }
    function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
    
    function loadState() {
      const state = vscode.getState();
      if (state) {
        if (state.expandedFolders) state.expandedFolders.forEach(id => expandedFolders.add(id));
        if (state.expandedFiles) state.expandedFiles.forEach(id => expandedFiles.add(id));
        if (state.iconPaths) iconPaths = state.iconPaths;
        if (state.favoriteMode) currentFavoriteMode = state.favoriteMode;
      }
      updateModeButtons();
    }
    
    function saveState() {
      vscode.setState({ 
        expandedFolders: Array.from(expandedFolders), 
        expandedFiles: Array.from(expandedFiles), 
        iconPaths: iconPaths,
        favoriteMode: currentFavoriteMode
      });
    }
    
    function updateModeButtons() {
      const globalBtn = document.getElementById('globalModeBtn');
      const localBtn = document.getElementById('localModeBtn');
      
      if (globalBtn && localBtn) {
        globalBtn.classList.toggle('active', currentFavoriteMode === 'global');
        localBtn.classList.toggle('active', currentFavoriteMode === 'local');
      }
    }
    
    function switchFavoriteMode(mode) {
      currentFavoriteMode = mode;
      updateModeButtons();
      saveState();
      vscode.postMessage({ command: 'switchFavoriteMode', mode: mode });
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
      
      // アイコンフィルタのドロップダウンも更新
      const filterOpts = document.getElementById('iconFilterSelectOptions');
      if (filterOpts) {
        filterOpts.innerHTML = '';
        
        // "All Icons" オプション
        const allOpt = document.createElement('div');
        allOpt.className = 'custom-select-option';
        allOpt.onclick = () => selectIconFilter('', 'All Icons');
        allOpt.innerHTML = '<span style="margin-left:22px;">All Icons</span>';
        filterOpts.appendChild(allOpt);
        
        // 各アイコンタイプ
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
        // "All Icons" の場合はアイコンを非表示
        if (img) {
          img.style.visibility = 'hidden';
          img.src = '';
        }
      } else {
        // アイコンタイプが選ばれた場合はアイコンを表示
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
    
    // キーボードイベントハンドラを追加
    document.addEventListener('keydown', (e) => {
      // Escキー: フォーカス中のフォームだけをキャンセル
      if (e.key === 'Escape') {
        const favoriteForm = document.getElementById('favoriteForm');
        const bookmarkForm = document.getElementById('bookmarkForm');
        
        // フォーカスがどのフォーム内にあるか確認
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
        
        // 編集フォーム内でEscが押された場合
        const activeEditForm = e.target.closest('.edit-form.active');
        if (activeEditForm) {
          activeEditForm.classList.remove('active');
          editingFavorite = null;
          editingBookmark = null;
          e.preventDefault();
          return;
        }
      }
      
      // Enterキー: フォームを送信
      if (e.key === 'Enter' && !e.shiftKey) {
        const favoriteForm = document.getElementById('favoriteForm');
        const bookmarkForm = document.getElementById('bookmarkForm');
        
        if (favoriteForm && favoriteForm.classList.contains('active')) {
          // Favorite追加フォーム内でEnter
          if (e.target.closest('#favoriteForm')) {
            addFavorite();
            e.preventDefault();
          }
        } else if (bookmarkForm && bookmarkForm.classList.contains('active')) {
          // Bookmark追加フォーム内でEnter
          if (e.target.closest('#bookmarkForm')) {
            addBookmarkManual();
            e.preventDefault();
          }
        }
        
        // 編集フォーム内でEnter
        const activeEditForm = document.querySelector('.edit-form.active');
        if (activeEditForm && e.target.closest('.edit-form.active')) {
          const formId = activeEditForm.id;
          if (formId.startsWith('edit-fav-')) {
            // Favorite編集フォーム
            if (editingFavorite) {
              saveEditFavorite(editingFavorite);
              e.preventDefault();
            }
          } else if (formId.startsWith('edit-bm-')) {
            // Bookmark編集フォーム
            if (editingBookmark) {
              const [filePath, line] = editingBookmark.split(':');
              saveEditBookmark(filePath, parseInt(line));
              e.preventDefault();
            }
          }
        }
      }
    });
    
    window.addEventListener('load', () => { loadState(); vscode.postMessage({ command: 'ready' }); });
    
    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.command === 'update') {
        favoritesMeta = msg.favoritesMeta || { folderOrder: [], fileOrder: {} };
        bookmarksMeta = msg.bookmarksMeta || { fileOrder: [], bookmarkSortType: {} };
        allFavoritesData = msg.favorites;
        allBookmarksData = msg.bookmarks;
        updateFavorites(msg.favorites);
        updateBookmarks(msg.bookmarks);
      } else if (msg.command === 'setIconPaths') {
        iconPaths = msg.paths;
        saveState();
        setIconImages();
      } else if (msg.command === 'setFavoriteMode') {
        currentFavoriteMode = msg.mode;
        updateModeButtons();
        saveState();
      }
    });
    
    function filterFavorites() {
      const searchText = document.getElementById('favoriteSearch').value.toLowerCase();
      if (!allFavoritesData) return;
      
      if (searchText === '') {
        updateFavorites(allFavoritesData);
        return;
      }
      
      const filtered = {};
      Object.entries(allFavoritesData).forEach(([path, data]) => {
        const fileName = path.split('/').pop() || '';
        const folderPath = path.split('/').slice(0, -1).join('/') || '(root)';
        
        if (path.toLowerCase().includes(searchText) ||
            fileName.toLowerCase().includes(searchText) ||
            folderPath.toLowerCase().includes(searchText) ||
            (data.description && data.description.toLowerCase().includes(searchText))) {
          filtered[path] = data;
        }
      });
      
      updateFavorites(filtered);
    }
    
    function filterBookmarks() {
      const searchText = document.getElementById('bookmarkSearch').value.toLowerCase();
      if (!allBookmarksData) return;
      
      let filtered = {};
      
      // まずアイコンフィルタを適用
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
      
      // 検索テキストでさらに絞り込み
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
    
    function toggleFavoriteForm() {
      const form = document.getElementById('favoriteForm');
      form.classList.toggle('active');
      if (form.classList.contains('active')) document.getElementById('filePath').focus();
    }
    
    function toggleBookmarkForm() {
      const form = document.getElementById('bookmarkForm');
      form.classList.toggle('active');
      if (form.classList.contains('active')) document.getElementById('bookmarkFile').focus();
    }
    
    function cancelAddFavorite() {
      document.getElementById('favoriteForm').classList.remove('active');
      document.getElementById('filePath').value = '';
      document.getElementById('fileDesc').value = '';
    }
    
    function cancelAddBookmark() {
      document.getElementById('bookmarkForm').classList.remove('active');
      document.getElementById('bookmarkFile').value = '';
      document.getElementById('bookmarkLine').value = '';
      document.getElementById('bookmarkLabel').value = '';
      selectedBookmarkIcon = 'default';
      selectIcon('bookmarkIconSelect', 'default', 'Default');
    }
    
    function addFavorite() {
      const path = document.getElementById('filePath').value;
      const description = document.getElementById('fileDesc').value;
      if (path) {
        vscode.postMessage({ command: 'addFavorite', path, description });
        cancelAddFavorite();
      }
    }
    
    function quickAddCurrentFile() {
      vscode.postMessage({ command: 'quickAddCurrentFile' });
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
    
    function startEditFavorite(path) {
      document.querySelectorAll('.edit-form').forEach(f => f.classList.remove('active'));
      const form = document.getElementById('edit-fav-' + safeId(path));
      if (form) { form.classList.add('active'); editingFavorite = path; }
    }
    
    function saveEditFavorite(oldPath) {
      const form = document.getElementById('edit-fav-' + safeId(oldPath));
      if (!form) return;
      const newPath = form.querySelector('.edit-path').value;
      const description = form.querySelector('.edit-desc').value;
      vscode.postMessage({ command: 'editFavorite', oldPath, newPath, description });
      form.classList.remove('active');
      editingFavorite = null;
    }
    
    function cancelEditFavorite(path) {
      const form = document.getElementById('edit-fav-' + safeId(path));
      if (form) form.classList.remove('active');
      editingFavorite = null;
    }
    
    function startEditBookmark(filePath, line) {
      document.querySelectorAll('.edit-form').forEach(f => f.classList.remove('active'));
      const form = document.getElementById('edit-bm-' + safeId(filePath + line));
      if (form) { form.classList.add('active'); editingBookmark = filePath + ':' + line; }
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
    
    function removeFavorite(path) { vscode.postMessage({ command: 'removeFavorite', path }); }
    function openFile(path) { vscode.postMessage({ command: 'openFile', path }); }
    function removeBookmark(filePath, line) { vscode.postMessage({ command: 'removeBookmark', filePath, line }); }
    function jumpToBookmark(filePath, line) { vscode.postMessage({ command: 'jumpToBookmark', filePath, line }); }
    
    function toggleFolder(folderId) {
      const icon = document.getElementById('icon-' + folderId);
      const items = document.getElementById('items-' + folderId);
      if (!icon || !items) return;
      const wasExpanded = items.classList.contains('expanded');
      if (wasExpanded) {
        expandedFolders.delete(folderId);
        items.classList.remove('expanded');
        icon.classList.remove('expanded');
        items.style.display = 'none';
      } else {
        expandedFolders.add(folderId);
        items.classList.add('expanded');
        icon.classList.add('expanded');
        items.style.display = 'block';
      }
      saveState();
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
    
    function updateFavorites(favorites) {
      const container = document.getElementById('favorites');
      const debug = document.getElementById('favoriteDebug');
      if (!favorites) {
        debug.textContent = 'ERROR';
        container.innerHTML = '<div class="empty-text">Error</div>';
        return;
      }
      const entries = Object.entries(favorites);
      debug.textContent = entries.length + ' favorites (' + currentFavoriteMode + ')';
      if (entries.length === 0) {
        container.innerHTML = '<div class="empty-text">No files</div>';
        return;
      }
      const folderMap = new Map();
      entries.forEach(([path, data]) => {
        const parts = path.split('/');
        const fileName = parts[parts.length - 1];
        const folderPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
        if (!folderMap.has(folderPath)) folderMap.set(folderPath, []);
        folderMap.get(folderPath).push({ fullPath: path, fileName, data });
      });
      
      // フォルダをソート
      let folders = Array.from(folderMap.keys());
      if (favoritesMeta.folderOrder && favoritesMeta.folderOrder.length > 0) {
        folders = favoritesMeta.folderOrder.filter(f => folderMap.has(f));
        // 新しいフォルダを追加
        folderMap.forEach((_, folder) => {
          if (!folders.includes(folder)) folders.push(folder);
        });
      }
      
      container.innerHTML = '';
      folders.forEach(folderPath => {
        const files = folderMap.get(folderPath);
        const folderId = safeId(folderPath);
        const isExpanded = expandedFolders.has(folderId);
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-group';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'folder-header';
        headerDiv.onclick = () => toggleFolder(folderId);
        headerDiv.oncontextmenu = (e) => showContextMenu(e, [
          { label: 'Sort by Name (A-Z)', action: () => vscode.postMessage({ command: 'sortFavoriteFiles', folderPath, sortType: 'name' }) },
          { label: 'Sort by Added Order', action: () => vscode.postMessage({ command: 'sortFavoriteFiles', folderPath, sortType: 'order' }) },
          { separator: true },
          { label: 'Delete All Files', action: () => vscode.postMessage({ command: 'deleteAllFavorites', folderPath }) },
        ]);
        headerDiv.innerHTML = '<span id="icon-' + folderId + '" class="folder-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="folder-name">📁 ' + escapeHtml(folderPath) + '</span><span class="folder-count">(' + files.length + ')</span>';
        
        const itemsDiv = document.createElement('div');
        itemsDiv.id = 'items-' + folderId;
        itemsDiv.className = 'folder-items' + (isExpanded ? ' expanded' : '');
        itemsDiv.style.display = isExpanded ? 'block' : 'none';
        
        // ファイルをソート
        let sortedFiles = files;
        if (favoritesMeta.fileOrder && favoritesMeta.fileOrder[folderPath]) {
          const order = favoritesMeta.fileOrder[folderPath];
          sortedFiles = [];
          order.forEach(filePath => {
            const file = files.find(f => f.fullPath === filePath);
            if (file) sortedFiles.push(file);
          });
          // 新しいファイルを追加
          files.forEach(file => {
            if (!sortedFiles.includes(file)) sortedFiles.push(file);
          });
        }
        
        sortedFiles.forEach(({ fullPath, fileName, data }) => {
          const pathId = safeId(fullPath);
          const pathEsc = escapeHtml(fullPath);
          const descEsc = escapeHtml(data.description || '');
          const safeFullPath = fullPath.replace(/'/g, "\\\\'").replace(/\\\\\\\\/g, "\\\\\\\\");
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item';
          itemDiv.innerHTML = '<div class="item-content" onclick="openFile(\\'' + safeFullPath + '\\')"><div class="item-file">' + escapeHtml(fileName) + '</div><div class="item-desc">' + descEsc + '</div></div><div class="item-buttons"><button class="btn" onclick="startEditFavorite(\\'' + safeFullPath + '\\')">✏️</button><button class="btn" onclick="removeFavorite(\\'' + safeFullPath + '\\')">×</button></div>';
          const editForm = document.createElement('div');
          editForm.id = 'edit-fav-' + pathId;
          editForm.className = 'edit-form';
          editForm.innerHTML = '<input type="text" class="edit-path" value="' + pathEsc + '" /><input type="text" class="edit-desc" value="' + descEsc + '" /><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditFavorite(\\'' + safeFullPath + '\\')">Save</button><button class="cancel-btn" onclick="cancelEditFavorite(\\'' + safeFullPath + '\\')">Cancel</button></div>';
          const wrapper = document.createElement('div');
          wrapper.appendChild(itemDiv);
          wrapper.appendChild(editForm);
          itemsDiv.appendChild(wrapper);
        });
        
        folderDiv.appendChild(headerDiv);
        folderDiv.appendChild(itemsDiv);
        container.appendChild(folderDiv);
      });
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
      
      // ファイルをソート
      let files = entries.map(([filePath]) => filePath);
      if (bookmarksMeta.fileOrder && bookmarksMeta.fileOrder.length > 0) {
        files = bookmarksMeta.fileOrder.filter(f => bookmarks[f]);
        // 新しいファイルを追加
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
        headerDiv.innerHTML = '<span id="fileicon-' + fileId + '" class="file-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="file-name">📄 ' + escapeHtml(filePath) + '</span><span class="file-count">(' + marks.length + ')</span>';
        
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
          const safeFilePath = filePath.replace(/'/g, "\\\\'").replace(/\\\\\\\\/g, "\\\\\\\\");
          const itemDiv = document.createElement('div');
          itemDiv.className = 'item';
          itemDiv.innerHTML = '<div class="item-content" onclick="jumpToBookmark(\\'' + safeFilePath + '\\', ' + mark.line + ')"><div class="item-desc"><img src="' + iconSrc + '" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;" /> ' + labelEsc + '</div><div class="item-line">Line ' + (mark.line + 1) + '</div></div><div class="item-buttons"><button class="btn" onclick="startEditBookmark(\\'' + safeFilePath + '\\', ' + mark.line + ')">✏️</button><button class="btn" onclick="removeBookmark(\\'' + safeFilePath + '\\', ' + mark.line + ')">×</button></div>';
          const editForm = document.createElement('div');
          editForm.id = 'edit-bm-' + bmId;
          editForm.className = 'edit-form';
          editForm.innerHTML = '<input type="text" class="edit-line" value="' + (mark.line + 1) + '" /><input type="text" class="edit-label" value="' + labelEsc + '" /><div class="custom-select" id="' + selectId + '"><div class="custom-select-trigger" onclick="toggleIconSelect(\\'' + selectId + '\\')"><div class="custom-select-value"><img class="custom-select-icon" id="' + selectId + 'Image" src="' + iconSrc + '" /><span id="' + selectId + 'Text">' + iconLabel + '</span></div><span class="custom-select-arrow">▼</span></div><div class="custom-select-options" id="' + selectId + 'Options"></div></div><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditBookmark(\\'' + safeFilePath + '\\', ' + mark.line + ')">Save</button><button class="cancel-btn" onclick="cancelEditBookmark(\\'' + safeFilePath + '\\', ' + mark.line + ')">Cancel</button></div>';
          const opts = editForm.querySelector('.custom-select-options');
          Object.keys(ICON_LABELS).forEach(type => {
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
  </script>
</body>
</html>`;
}