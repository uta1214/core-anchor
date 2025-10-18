export function getHtmlContent(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      padding: 10px;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
    }
    .section {
      margin-bottom: 20px;
    }
    .section-header {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 11px;
    }
    .add-btn-container {
      margin: 8px 0;
      text-align: center;
    }
    .toggle-add-btn {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 11px;
      width: 100%;
    }
    .toggle-add-btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .add-form {
      display: none;
      margin: 8px 0;
      padding: 8px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
    }
    .add-form.active {
      display: block;
    }
    .add-form input {
      width: 100%;
      padding: 4px;
      margin-bottom: 4px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      font-family: var(--vscode-font-family);
      box-sizing: border-box;
    }
    .add-form button {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      width: 100%;
      margin-top: 4px;
    }
    .add-form button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .item {
      padding: 6px;
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .item-content {
      flex: 1;
      cursor: pointer;
    }
    .item-file {
      font-size: 11px;
      color: var(--vscode-foreground);
      margin-bottom: 2px;
    }
    .item-desc {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
    }
    .item-line {
      font-size: 9px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .item-buttons {
      display: flex;
      gap: 4px;
    }
    .btn {
      background: none;
      border: none;
      color: var(--vscode-foreground);
      cursor: pointer;
      padding: 2px 6px;
      opacity: 0.6;
      font-size: 12px;
    }
    .btn:hover {
      opacity: 1;
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .folder-group {
      margin-bottom: 8px;
    }
    .folder-header {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      cursor: pointer;
      user-select: none;
      background: var(--vscode-sideBar-background);
    }
    .folder-header:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .folder-icon {
      margin-right: 6px;
      font-size: 12px;
      transition: transform 0.2s;
      display: inline-block;
    }
    .folder-icon.expanded {
      transform: rotate(90deg);
    }
    .folder-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }
    .folder-count {
      margin-left: 6px;
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
    }
    .folder-items {
      padding-left: 16px;
    }
    .folder-items.expanded {
      display: block;
    }
    .file-group {
      margin-bottom: 8px;
    }
    .file-header {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      cursor: pointer;
      user-select: none;
      background: var(--vscode-sideBar-background);
    }
    .file-header:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .file-icon {
      margin-right: 6px;
      font-size: 12px;
      transition: transform 0.2s;
      display: inline-block;
    }
    .file-icon.expanded {
      transform: rotate(90deg);
    }
    .file-name {
      font-size: 11px;
      font-weight: 500;
      color: var(--vscode-foreground);
      flex: 1;
    }
    .file-count {
      margin-left: 6px;
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
    }
    .file-items {
      padding-left: 16px;
    }
    .file-items.expanded {
      display: block;
    }
    .edit-form {
      display: none;
      padding: 8px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      margin-top: 4px;
    }
    .edit-form.active {
      display: block;
    }
    .edit-form input, .edit-form select {
      width: 100%;
      padding: 4px;
      margin-bottom: 4px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      font-family: var(--vscode-font-family);
      box-sizing: border-box;
    }
    .edit-form-buttons {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }
    .edit-form-buttons button {
      flex: 1;
      padding: 4px 8px;
      cursor: pointer;
      border: none;
      font-size: 11px;
    }
    .save-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .save-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .cancel-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .cancel-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .separator {
      border-top: 1px solid var(--vscode-panel-border);
      margin: 15px 0;
    }
    .info-text {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 8px;
    }
    .empty-text {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      padding: 8px;
      text-align: center;
    }
    
    /* カスタムセレクトボックスのスタイル */
    .custom-select {
      position: relative;
      width: 100%;
      margin-bottom: 4px;
    }
    .custom-select-trigger {
      width: 100%;
      padding: 4px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .custom-select-trigger:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .custom-select-value {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .custom-select-icon {
      width: 16px;
      height: 16px;
      object-fit: contain;
    }
    .custom-select-arrow {
      font-size: 10px;
    }
    .custom-select-options {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
    }
    .custom-select-options.active {
      display: block;
    }
    .custom-select-option {
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .custom-select-option:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .custom-select-option.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-header">⭐ Favorite Files</div>
    <div id="favorites"></div>
    <div class="add-btn-container">
      <button class="toggle-add-btn" onclick="toggleFavoriteForm()">+ Add File</button>
    </div>
    <div class="add-form" id="favoriteForm">
      <input type="text" id="filePath" placeholder="File path (e.g. src/main.c)" />
      <input type="text" id="fileDesc" placeholder="Description (e.g. Entry point)" />
      <div class="edit-form-buttons">
        <button class="save-btn" onclick="addFavorite()">Add</button>
        <button class="cancel-btn" onclick="cancelAddFavorite()">Cancel</button>
      </div>
    </div>
  </div>

  <div class="separator"></div>

  <div class="section">
    <div class="section-header">🔖 Bookmarks</div>
    <div id="bookmarks"></div>
    <div class="add-btn-container">
      <button class="toggle-add-btn" onclick="toggleBookmarkForm()">+ Add Bookmark</button>
    </div>
    <div class="add-form" id="bookmarkForm">
      <input type="text" id="bookmarkFile" placeholder="File path (e.g. src/main.c)" />
      <input type="text" id="bookmarkLine" placeholder="Line number (e.g. 42)" />
      <input type="text" id="bookmarkLabel" placeholder="Label (e.g. TODO)" />
      <div class="custom-select" id="bookmarkIconSelect">
        <div class="custom-select-trigger" onclick="toggleIconSelect('bookmarkIconSelect')">
          <div class="custom-select-value">
            <img class="custom-select-icon" id="bookmarkIconSelectImage" src="" />
            <span id="bookmarkIconSelectText">Default</span>
          </div>
          <span class="custom-select-arrow">▼</span>
        </div>
        <div class="custom-select-options" id="bookmarkIconSelectOptions">
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'default', 'Default')">
            <img class="custom-select-icon" src="" data-icon="default" />
            <span>Default</span>
          </div>
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'todo', 'TODO')">
            <img class="custom-select-icon" src="" data-icon="todo" />
            <span>TODO</span>
          </div>
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'bug', 'Bug')">
            <img class="custom-select-icon" src="" data-icon="bug" />
            <span>Bug</span>
          </div>
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'note', 'Note')">
            <img class="custom-select-icon" src="" data-icon="note" />
            <span>Note</span>
          </div>
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'important', 'Important')">
            <img class="custom-select-icon" src="" data-icon="important" />
            <span>Important</span>
          </div>
          <div class="custom-select-option" onclick="selectIcon('bookmarkIconSelect', 'question', 'Question')">
            <img class="custom-select-icon" src="" data-icon="question" />
            <span>Question</span>
          </div>
        </div>
      </div>
      <div class="edit-form-buttons">
        <button class="save-btn" onclick="addBookmarkManual()">Add</button>
        <button class="cancel-btn" onclick="cancelAddBookmark()">Cancel</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let editingFavorite = null;
    let editingBookmark = null;
    let addingFavorite = false;
    let addingBookmark = false;
    
    const expandedFolders = new Set();
    const expandedFiles = new Set();
    
    let selectedBookmarkIcon = 'default';
    const editIconSelects = new Map();

    // 状態の読み込み
    function loadState() {
      const state = vscode.getState();
      if (state) {
        if (state.expandedFolders) {
          state.expandedFolders.forEach(id => expandedFolders.add(id));
        }
        if (state.expandedFiles) {
          state.expandedFiles.forEach(id => expandedFiles.add(id));
        }
      }
    }

    // 状態の保存
    function saveState() {
      vscode.setState({
        expandedFolders: Array.from(expandedFolders),
        expandedFiles: Array.from(expandedFiles)
      });
    }
    
    // アイコン画像のパスを設定
    function setIconImages() {
      const icons = ['default', 'todo', 'bug', 'note', 'important', 'question'];
      icons.forEach(icon => {
        const images = document.querySelectorAll(\`img[data-icon="\${icon}"]\`);
        images.forEach(img => {
          img.src = \`\${vscode.getState()?.resourcePath || ''}/bookmark-\${icon}.png\`;
        });
      });
      
      // 初期選択のアイコンを設定
      const bookmarkIconSelectImage = document.getElementById('bookmarkIconSelectImage');
      if (bookmarkIconSelectImage) {
        bookmarkIconSelectImage.src = \`\${vscode.getState()?.resourcePath || ''}/bookmark-default.png\`;
      }
    }
    
    function toggleIconSelect(selectId) {
      const options = document.getElementById(selectId + 'Options');
      const allOptions = document.querySelectorAll('.custom-select-options');
      
      allOptions.forEach(opt => {
        if (opt.id !== selectId + 'Options') {
          opt.classList.remove('active');
        }
      });
      
      options.classList.toggle('active');
    }
    
    function selectIcon(selectId, iconType, label) {
      const img = document.getElementById(selectId + 'Image');
      const text = document.getElementById(selectId + 'Text');
      const options = document.getElementById(selectId + 'Options');
      
      img.src = \`\${vscode.getState()?.resourcePath || ''}/bookmark-\${iconType}.png\`;
      text.textContent = label;
      options.classList.remove('active');
      
      if (selectId === 'bookmarkIconSelect') {
        selectedBookmarkIcon = iconType;
      } else {
        editIconSelects.set(selectId, iconType);
      }
    }
    
    // 外側クリックで閉じる
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select-options').forEach(opt => {
          opt.classList.remove('active');
        });
      }
    });

    window.addEventListener('load', () => {
      loadState();
      vscode.postMessage({ command: 'ready' });
    });
    
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'update') {
        updateFavorites(message.favorites);
        updateBookmarks(message.bookmarks);
      } else if (message.command === 'setResourcePath') {
        const state = vscode.getState() || {};
        state.resourcePath = message.path;
        vscode.setState(state);
        setIconImages();
      }
    });

    // グローバルキーボードイベントハンドラ
    document.addEventListener('keydown', (e) => {
      const activeEditForm = document.querySelector('.edit-form.active');
      const activeFavoriteForm = document.getElementById('favoriteForm');
      const activeBookmarkForm = document.getElementById('bookmarkForm');
      
      if (activeEditForm) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (editingFavorite) {
            cancelEditFavorite(editingFavorite);
          } else if (editingBookmark) {
            const [filePath, line] = editingBookmark.split(':');
            cancelEditBookmark(filePath, parseInt(line));
          }
        } else if (e.key === 'Enter' && !e.shiftKey) {
          if (document.querySelector('.custom-select-options.active')) {
            return;
          }
          
          e.preventDefault();
          if (editingFavorite) {
            saveEditFavorite(editingFavorite);
          } else if (editingBookmark) {
            const [filePath, line] = editingBookmark.split(':');
            saveEditBookmark(filePath, parseInt(line));
          }
        }
      }
      else if (activeFavoriteForm && activeFavoriteForm.classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelAddFavorite();
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          addFavorite();
        }
      }
      else if (activeBookmarkForm && activeBookmarkForm.classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelAddBookmark();
        } else if (e.key === 'Enter' && !e.shiftKey) {
          if (document.querySelector('.custom-select-options.active')) {
            return;
          }
          
          e.preventDefault();
          addBookmarkManual();
        }
      }
    });

    function toggleFavoriteForm() {
      const form = document.getElementById('favoriteForm');
      form.classList.toggle('active');
      if (form.classList.contains('active')) {
        addingFavorite = true;
        document.getElementById('filePath').focus();
      } else {
        addingFavorite = false;
      }
    }

    function toggleBookmarkForm() {
      const form = document.getElementById('bookmarkForm');
      form.classList.toggle('active');
      if (form.classList.contains('active')) {
        addingBookmark = true;
        document.getElementById('bookmarkFile').focus();
      } else {
        addingBookmark = false;
      }
    }

    function cancelAddFavorite() {
      const form = document.getElementById('favoriteForm');
      form.classList.remove('active');
      document.getElementById('filePath').value = '';
      document.getElementById('fileDesc').value = '';
      addingFavorite = false;
    }

    function cancelAddBookmark() {
      const form = document.getElementById('bookmarkForm');
      form.classList.remove('active');
      document.getElementById('bookmarkFile').value = '';
      document.getElementById('bookmarkLine').value = '';
      document.getElementById('bookmarkLabel').value = '';
      selectedBookmarkIcon = 'default';
      selectIcon('bookmarkIconSelect', 'default', 'Default');
      addingBookmark = false;
    }

    function addFavorite() {
      const path = document.getElementById('filePath').value;
      const description = document.getElementById('fileDesc').value;
      
      if (path) {
        vscode.postMessage({ command: 'addFavorite', path, description });
        document.getElementById('filePath').value = '';
        document.getElementById('fileDesc').value = '';
        document.getElementById('favoriteForm').classList.remove('active');
        addingFavorite = false;
      }
    }

    function addBookmarkManual() {
      const filePath = document.getElementById('bookmarkFile').value;
      const line = document.getElementById('bookmarkLine').value;
      const label = document.getElementById('bookmarkLabel').value;
      const iconType = selectedBookmarkIcon;
      
      if (filePath && line && label) {
        vscode.postMessage({ command: 'addBookmarkManual', filePath, line, label, iconType });
        document.getElementById('bookmarkFile').value = '';
        document.getElementById('bookmarkLine').value = '';
        document.getElementById('bookmarkLabel').value = '';
        selectedBookmarkIcon = 'default';
        selectIcon('bookmarkIconSelect', 'default', 'Default');
        document.getElementById('bookmarkForm').classList.remove('active');
        addingBookmark = false;
      }
    }

    function startEditFavorite(path, description) {
      document.querySelectorAll('.edit-form').forEach(form => form.classList.remove('active'));
      
      const editForm = document.getElementById('edit-fav-' + btoa(path));
      editForm.classList.add('active');
      editingFavorite = path;
      editingBookmark = null;
      
      const firstInput = editForm.querySelector('input');
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }

    function saveEditFavorite(oldPath) {
      const editForm = document.getElementById('edit-fav-' + btoa(oldPath));
      const newPath = editForm.querySelector('.edit-path').value;
      const description = editForm.querySelector('.edit-desc').value;
      
      vscode.postMessage({ command: 'editFavorite', oldPath, newPath, description });
      editForm.classList.remove('active');
      editingFavorite = null;
    }

    function cancelEditFavorite(path) {
      const editForm = document.getElementById('edit-fav-' + btoa(path));
      editForm.classList.remove('active');
      editingFavorite = null;
    }

    function startEditBookmark(filePath, line) {
      document.querySelectorAll('.edit-form').forEach(form => form.classList.remove('active'));
      
      const editForm = document.getElementById('edit-bm-' + btoa(filePath + line));
      editForm.classList.add('active');
      editingBookmark = filePath + ':' + line;
      editingFavorite = null;
      
      const firstInput = editForm.querySelector('input');
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }

    function saveEditBookmark(filePath, oldLine) {
      const editForm = document.getElementById('edit-bm-' + btoa(filePath + oldLine));
      const newLine = editForm.querySelector('.edit-line').value;
      const label = editForm.querySelector('.edit-label').value;
      const selectId = 'editIconSelect-' + btoa(filePath + oldLine);
      const iconType = editIconSelects.get(selectId) || 'default';
      
      vscode.postMessage({ command: 'editBookmark', filePath, oldLine, newLine, label, iconType });
      editForm.classList.remove('active');
      editingBookmark = null;
      editIconSelects.delete(selectId);
    }

    function cancelEditBookmark(filePath, line) {
      const editForm = document.getElementById('edit-bm-' + btoa(filePath + line));
      editForm.classList.remove('active');
      editingBookmark = null;
      const selectId = 'editIconSelect-' + btoa(filePath + line);
      editIconSelects.delete(selectId);
    }

    function removeFavorite(path) {
      vscode.postMessage({ command: 'removeFavorite', path });
    }

    function openFile(path) {
      vscode.postMessage({ command: 'openFile', path });
    }

    function removeBookmark(filePath, line) {
      vscode.postMessage({ command: 'removeBookmark', filePath, line });
    }

    function jumpToBookmark(filePath, line) {
      vscode.postMessage({ command: 'jumpToBookmark', filePath, line });
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function toggleFolder(folderId) {
      const icon = document.getElementById('icon-' + folderId);
      const items = document.getElementById('items-' + folderId);
      
      if (!icon || !items) {
        console.error('要素が見つかりません');
        return;
      }
      
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
      
      if (!icon || !items) {
        console.error('要素が見つかりません');
        return;
      }
      
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
      container.innerHTML = '';

      const entries = Object.entries(favorites);
      
      if (entries.length === 0) {
        container.innerHTML = '<div class="empty-text">No files registered</div>';
        return;
      }

      const folderMap = new Map();
      
      entries.forEach(([path, data]) => {
        const parts = path.split('/');
        const fileName = parts[parts.length - 1];
        const folderPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
        
        if (!folderMap.has(folderPath)) {
          folderMap.set(folderPath, []);
        }
        folderMap.get(folderPath).push({ fullPath: path, fileName, data });
      });

      Array.from(folderMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([folderPath, files]) => {
        const folderId = btoa(folderPath);
        
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder-group';
        
        const isExpanded = expandedFolders.has(folderId);
        
        const folderHeader = document.createElement('div');
        folderHeader.className = 'folder-header';
        folderHeader.onclick = () => toggleFolder(folderId);
        folderHeader.innerHTML = 
          '<span id="icon-' + folderId + '" class="folder-icon' + (isExpanded ? ' expanded' : '') + '">▶</span>' +
          '<span class="folder-name">📁 ' + escapeHtml(folderPath) + '</span>' +
          '<span class="folder-count">(' + files.length + ')</span>';
        
        const folderItems = document.createElement('div');
        folderItems.id = 'items-' + folderId;
        folderItems.className = 'folder-items' + (isExpanded ? ' expanded' : '');
        folderItems.style.display = isExpanded ? 'block' : 'none';
        
        files.forEach(({ fullPath, fileName, data }) => {
          const pathId = btoa(fullPath);
          const pathEsc = escapeHtml(fullPath);
          const descEsc = escapeHtml(data.description || 'No description');
          
          const itemDiv = document.createElement('div');
          itemDiv.innerHTML = 
            '<div class="item">' +
              '<div class="item-content" onclick="openFile(\\'' + fullPath.replace(/'/g, "\\\\'") + '\\')">' +
                '<div class="item-file">' + escapeHtml(fileName) + '</div>' +
                '<div class="item-desc">' + descEsc + '</div>' +
              '</div>' +
              '<div class="item-buttons">' +
                '<button class="btn" onclick="startEditFavorite(\\'' + fullPath.replace(/'/g, "\\\\'") + '\\', \\'' + (data.description || '').replace(/'/g, "\\\\'") + '\\')">✏️</button>' +
                '<button class="btn" onclick="removeFavorite(\\'' + fullPath.replace(/'/g, "\\\\'") + '\\')">×</button>' +
              '</div>' +
            '</div>' +
            '<div id="edit-fav-' + pathId + '" class="edit-form">' +
              '<input type="text" class="edit-path" value="' + pathEsc + '" />' +
              '<input type="text" class="edit-desc" value="' + descEsc + '" />' +
              '<div class="edit-form-buttons">' +
                '<button class="save-btn" onclick="saveEditFavorite(\\'' + fullPath.replace(/'/g, "\\\\'") + '\\')">Save</button>' +
                '<button class="cancel-btn" onclick="cancelEditFavorite(\\'' + fullPath.replace(/'/g, "\\\\'") + '\\')">Cancel</button>' +
              '</div>' +
            '</div>';
          folderItems.appendChild(itemDiv);
        });
        
        folderDiv.appendChild(folderHeader);
        folderDiv.appendChild(folderItems);
        container.appendChild(folderDiv);
      });
    }

    function updateBookmarks(bookmarks) {
      const container = document.getElementById('bookmarks');
      container.innerHTML = '';

      const entries = Object.entries(bookmarks);
      if (entries.length === 0) {
        container.innerHTML = '<div class="empty-text">No bookmarks</div>';
        return;
      }

      entries.forEach(([filePath, marks]) => {
        const fileId = btoa(filePath);
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file-group';
        
        const isExpanded = expandedFiles.has(fileId);
        
        const fileHeader = document.createElement('div');
        fileHeader.className = 'file-header';
        fileHeader.onclick = () => toggleFileGroup(fileId);
        
        const fileEsc = escapeHtml(filePath);
        fileHeader.innerHTML = 
          '<span id="fileicon-' + fileId + '" class="file-icon' + (isExpanded ? ' expanded' : '') + '">▶</span>' +
          '<span class="file-name">📄 ' + fileEsc + '</span>' +
          '<span class="file-count">(' + marks.length + ')</span>';
        
        const fileItems = document.createElement('div');
        fileItems.id = 'fileitems-' + fileId;
        fileItems.className = 'file-items' + (isExpanded ? ' expanded' : '');
        fileItems.style.display = isExpanded ? 'block' : 'none';
        
        const resourcePath = vscode.getState()?.resourcePath || '';
        
        marks.forEach(mark => {
          const bmId = btoa(filePath + mark.line);
          const labelEsc = escapeHtml(mark.label);
          const iconType = mark.iconType || 'default';
          const iconLabels = {
            'default': 'Default',
            'todo': 'TODO',
            'bug': 'Bug',
            'note': 'Note',
            'important': 'Important',
            'question': 'Question'
          };
          const iconLabel = iconLabels[iconType] || 'Default';
          const selectId = 'editIconSelect-' + bmId;
          
          const itemDiv = document.createElement('div');
          itemDiv.innerHTML =
            '<div class="item">' +
              '<div class="item-content" onclick="jumpToBookmark(\\'' + filePath.replace(/'/g, "\\\\'") + '\\', ' + mark.line + ')">' +
                '<div class="item-desc">' +
                  '<img src="' + resourcePath + '/bookmark-' + iconType + '.png" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;" /> ' +
                  labelEsc +
                '</div>' +
                '<div class="item-line">Line ' + (mark.line + 1) + '</div>' +
              '</div>' +
              '<div class="item-buttons">' +
                '<button class="btn" onclick="startEditBookmark(\\'' + filePath.replace(/'/g, "\\\\'") + '\\', ' + mark.line + ')">✏️</button>' +
                '<button class="btn" onclick="removeBookmark(\\'' + filePath.replace(/'/g, "\\\\'") + '\\', ' + mark.line + ')">×</button>' +
              '</div>' +
            '</div>' +
            '<div id="edit-bm-' + bmId + '" class="edit-form">' +
              '<input type="text" class="edit-line" value="' + (mark.line + 1) + '" />' +
              '<input type="text" class="edit-label" value="' + labelEsc + '" />' +
              '<div class="custom-select" id="' + selectId + '">' +
                '<div class="custom-select-trigger" onclick="toggleIconSelect(\\'' + selectId + '\\')">' +
                  '<div class="custom-select-value">' +
                    '<img class="custom-select-icon" id="' + selectId + 'Image" src="' + resourcePath + '/bookmark-' + iconType + '.png" />' +
                    '<span id="' + selectId + 'Text">' + iconLabel + '</span>' +
                  '</div>' +
                  '<span class="custom-select-arrow">▼</span>' +
                '</div>' +
                '<div class="custom-select-options" id="' + selectId + 'Options">' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'default\\', \\'Default\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-default.png" />' +
                    '<span>Default</span>' +
                  '</div>' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'todo\\', \\'TODO\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-todo.png" />' +
                    '<span>TODO</span>' +
                  '</div>' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'bug\\', \\'Bug\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-bug.png" />' +
                    '<span>Bug</span>' +
                  '</div>' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'note\\', \\'Note\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-note.png" />' +
                    '<span>Note</span>' +
                  '</div>' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'important\\', \\'Important\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-important.png" />' +
                    '<span>Important</span>' +
                  '</div>' +
                  '<div class="custom-select-option" onclick="selectIcon(\\'' + selectId + '\\', \\'question\\', \\'Question\\')">' +
                    '<img class="custom-select-icon" src="' + resourcePath + '/bookmark-question.png" />' +
                    '<span>Question</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="edit-form-buttons">' +
                '<button class="save-btn" onclick="saveEditBookmark(\\'' + filePath.replace(/'/g, "\\\\'") + '\\', ' + mark.line + ')">Save</button>' +
                '<button class="cancel-btn" onclick="cancelEditBookmark(\\'' + filePath.replace(/'/g, "\\\\'") + '\\', ' + mark.line + ')">Cancel</button>' +
              '</div>' +
            '</div>';
          fileItems.appendChild(itemDiv);
          
          // 編集用セレクトの初期値を設定
          editIconSelects.set(selectId, iconType);
        });
        
        fileDiv.appendChild(fileHeader);
        fileDiv.appendChild(fileItems);
        container.appendChild(fileDiv);
      });
    }
  </script>
</body>
</html>`;
}