// Favorites関連処理

let editingFavorite = null;
let allFavoritesData = null;

function switchFavoriteMode(mode) {
  currentFavoriteMode = mode;
  updateModeButtons();
  saveState();
  vscode.postMessage({ command: 'switchFavoriteMode', mode: mode });
}

function updateModeButtons() {
  const globalBtn = document.getElementById('globalModeBtn');
  const localBtn = document.getElementById('localModeBtn');
  
  if (globalBtn && localBtn) {
    globalBtn.classList.toggle('active', currentFavoriteMode === 'global');
    localBtn.classList.toggle('active', currentFavoriteMode === 'local');
  }
}

function toggleFavoriteForm() {
  const form = document.getElementById('favoriteForm');
  form.classList.toggle('active');
  if (form.classList.contains('active')) document.getElementById('filePath').focus();
}

function cancelAddFavorite() {
  document.getElementById('favoriteForm').classList.remove('active');
  document.getElementById('filePath').value = '';
  document.getElementById('fileDesc').value = '';
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

function startEditFavorite(path) {
  document.querySelectorAll('.edit-form').forEach(f => f.classList.remove('active'));
  const form = document.getElementById('edit-fav-' + safeId(path));
  if (form) { 
    form.classList.add('active'); 
    editingFavorite = path; 
  }
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

function removeFavorite(path) { 
  vscode.postMessage({ command: 'removeFavorite', path }); 
}

function openFile(path) { 
  vscode.postMessage({ command: 'openFile', path }); 
}

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
  
  let folders = Array.from(folderMap.keys());
  if (favoritesMeta.folderOrder && favoritesMeta.folderOrder.length > 0) {
    folders = favoritesMeta.folderOrder.filter(f => folderMap.has(f));
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
    
    let sortedFiles = files;
    if (favoritesMeta.fileOrder && favoritesMeta.fileOrder[folderPath]) {
      const order = favoritesMeta.fileOrder[folderPath];
      sortedFiles = [];
      order.forEach(filePath => {
        const file = files.find(f => f.fullPath === filePath);
        if (file) sortedFiles.push(file);
      });
      files.forEach(file => {
        if (!sortedFiles.includes(file)) sortedFiles.push(file);
      });
    }
    
    sortedFiles.forEach(({ fullPath, fileName, data }) => {
      const pathId = safeId(fullPath);
      const pathEsc = escapeHtml(fullPath);
      const descEsc = escapeHtml(data.description || '');
      const safeFullPath = fullPath.replace(/'/g, "\\'").replace(/\\\\/g, "\\\\");
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item';
      itemDiv.innerHTML = '<div class="item-content" onclick="openFile(\'' + safeFullPath + '\')"><div class="item-file">' + escapeHtml(fileName) + '</div><div class="item-desc">' + descEsc + '</div></div><div class="item-buttons"><button class="btn" onclick="startEditFavorite(\'' + safeFullPath + '\')">✏️</button><button class="btn" onclick="removeFavorite(\'' + safeFullPath + '\')">×</button></div>';
      const editForm = document.createElement('div');
      editForm.id = 'edit-fav-' + pathId;
      editForm.className = 'edit-form';
      editForm.innerHTML = '<input type="text" class="edit-path" value="' + pathEsc + '" /><input type="text" class="edit-desc" value="' + descEsc + '" /><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditFavorite(\'' + safeFullPath + '\')">Save</button><button class="cancel-btn" onclick="cancelEditFavorite(\'' + safeFullPath + '\')">Cancel</button></div>';
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