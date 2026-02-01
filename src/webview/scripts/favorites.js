// Favorites関連処理

let editingFavorite = null;
let allFavoritesData = null;
let currentFolderDepth = 1;
let fileIcons = {}; // ファイルアイコンのマッピング

// 共通SVGアイコン
const EDIT_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.5 3.5L12.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>';
const DELETE_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const FOLDER_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3H6.5L8 5H14.5V13H1.5V3Z" stroke="currentColor" stroke-width="1.5"/></svg>';

function increaseFolderDepth() {
  
  currentFolderDepth++;
  
  updateFolderDepthDisplay();
  saveState();
  vscode.postMessage({ command: 'setFolderDepth', depth: currentFolderDepth });
  if (allFavoritesData) {
    updateFavorites(allFavoritesData);
  }
}

function decreaseFolderDepth() {
  
  if (currentFolderDepth > 0) {
    currentFolderDepth--;
    
    updateFolderDepthDisplay();
    saveState();
    vscode.postMessage({ command: 'setFolderDepth', depth: currentFolderDepth });
    if (allFavoritesData) {
      updateFavorites(allFavoritesData);
    }
  }
}

function updateFolderDepthDisplay() {
  const display = document.getElementById('folderDepthDisplay');
  if (display) {
    display.textContent = currentFolderDepth.toString();
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
  debug.textContent = entries.length + ' favorites (' + currentFavoriteMode + ', depth: ' + currentFolderDepth + ')';
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-text">No files</div>';
    return;
  }
  
  const tree = buildFolderTree(entries, currentFolderDepth);
  
  container.innerHTML = '';
  
  const folderId = safeId('__workspace_root__');
  const isExpanded = expandedFolders.has(folderId);
  
  const folderDiv = document.createElement('div');
  folderDiv.className = 'folder-group';
  
  const headerDiv = document.createElement('div');
  headerDiv.className = 'folder-header';
  headerDiv.onclick = () => toggleFolder(folderId);
  
  const totalFiles = countAllFilesInTree(tree);
  headerDiv.innerHTML = '<span id="icon-' + folderId + '" class="folder-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="folder-name">' + FOLDER_ICON + '<span style="margin-left: 4px;">Workspace Files</span></span><span class="folder-count">(' + totalFiles + ')</span>';
  
  const itemsDiv = document.createElement('div');
  itemsDiv.id = 'items-' + folderId;
  itemsDiv.className = 'folder-items' + (isExpanded ? ' expanded' : '');
  itemsDiv.style.display = isExpanded ? 'block' : 'none';
  
  folderDiv.appendChild(headerDiv);
  folderDiv.appendChild(itemsDiv);
  container.appendChild(folderDiv);
  
  if (isExpanded) {
    renderFolderTree(tree, itemsDiv, '', 0);
  }
}

function buildFolderTree(entries, depth) {
  const tree = {};
  
  entries.forEach(([path, data]) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const folderParts = parts.slice(0, -1);
    
    if (depth === 0 || folderParts.length === 0) {
      if (!tree['__root__']) {
        tree['__root__'] = { type: 'files', files: [] };
      }
      tree['__root__'].files.push({ fullPath: path, fileName, data });
    } else {
      const startIndex = Math.max(0, folderParts.length - depth);
      const relevantParts = folderParts.slice(startIndex);
      
      let currentLevel = tree;
      relevantParts.forEach((folderName, index) => {
        if (!currentLevel[folderName]) {
          currentLevel[folderName] = {
            type: 'folder',
            children: {},
            files: []
          };
        }
        if (index < relevantParts.length - 1) {
          currentLevel = currentLevel[folderName].children;
        }
      });
      
      const lastFolder = relevantParts[relevantParts.length - 1];
      let targetLevel = tree;
      for (let i = 0; i < relevantParts.length - 1; i++) {
        targetLevel = targetLevel[relevantParts[i]].children;
      }
      targetLevel[lastFolder].files.push({ fullPath: path, fileName, data });
    }
  });
  
  return tree;
}

function renderFolderTree(node, container, parentPath, level) {
  const keys = Object.keys(node).sort();
  
  keys.forEach(key => {
    if (key === '__root__') {
      const rootFiles = node[key].files;
      if (rootFiles.length > 0) {
        rootFiles.forEach(({ fullPath, fileName, data }) => {
          const wrapper = createFileItemElement(fullPath, fileName, data);
          wrapper.style.marginLeft = '0px';
          container.appendChild(wrapper);
        });
      }
      return;
    }
    
    const item = node[key];
    if (item.type === 'folder') {
      const currentPath = parentPath ? parentPath + '/' + key : key;
      const folderId = safeId(currentPath + '-level-' + level);
      const isExpanded = expandedFolders.has(folderId);
      
      const folderDiv = document.createElement('div');
      folderDiv.className = 'folder-group';
      folderDiv.style.marginLeft = (level * 16) + 'px';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'folder-header';
      headerDiv.onclick = () => toggleFolder(folderId);
      
      const fileCount = countFilesInTree(item);
      
      headerDiv.innerHTML = '<span id="icon-' + folderId + '" class="folder-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="folder-name">' + FOLDER_ICON + '<span style="margin-left: 4px;">' + escapeHtml(key) + '</span></span><span class="folder-count">(' + fileCount + ')</span>';
      
      const itemsDiv = document.createElement('div');
      itemsDiv.id = 'items-' + folderId;
      itemsDiv.className = 'folder-items' + (isExpanded ? ' expanded' : '');
      itemsDiv.style.display = isExpanded ? 'block' : 'none';
      
      folderDiv.appendChild(headerDiv);
      folderDiv.appendChild(itemsDiv);
      container.appendChild(folderDiv);
      
      if (isExpanded) {
        item.files.forEach(({ fullPath, fileName, data }) => {
          const wrapper = createFileItemElement(fullPath, fileName, data);
          wrapper.style.marginLeft = '0px';
          itemsDiv.appendChild(wrapper);
        });
        
        renderFolderTree(item.children, itemsDiv, currentPath, level + 1);
      }
    }
  });
}

function countFilesInTree(node) {
  let count = node.files.length;
  Object.values(node.children).forEach(child => {
    if (child.type === 'folder') {
      count += countFilesInTree(child);
    }
  });
  return count;
}

function countAllFilesInTree(tree) {
  let count = 0;
  Object.keys(tree).forEach(key => {
    if (key === '__root__') {
      count += tree[key].files.length;
    } else if (tree[key].type === 'folder') {
      count += countFilesInTree(tree[key]);
    }
  });
  return count;
}

function createFileItemElement(fullPath, fileName, data) {
  const pathId = safeId(fullPath);
  const pathEsc = escapeHtml(fullPath);
  const descEsc = escapeHtml(data.description || '');
  const safeFullPath = fullPath.replace(/'/g, "\\'").replace(/\\\\/g, "\\\\");
  
  // ファイルアイコンを取得（TypeScriptから送られたマッピングを使用）
  const iconSrc = fileIcons[fullPath] || '';
  const fileIconHtml = iconSrc ? '<img src="' + iconSrc + '" style="width:14px;height:14px;vertical-align:middle;" />' : '';
  
  const wrapper = document.createElement('div');
  
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';
  itemDiv.innerHTML = '<div class="item-content" onclick="openFile(\'' + safeFullPath + '\')"><div class="item-file">' + fileIconHtml + '<span style="margin-left: 4px;">' + escapeHtml(fileName) + '</span></div><div class="item-desc">' + descEsc + '</div></div><div class="item-buttons"><button class="btn" onclick="startEditFavorite(\'' + safeFullPath + '\'); event.stopPropagation();">' + EDIT_ICON + '</button><button class="btn" onclick="removeFavorite(\'' + safeFullPath + '\'); event.stopPropagation();">' + DELETE_ICON + '</button></div>';
  
  const editForm = document.createElement('div');
  editForm.id = 'edit-fav-' + pathId;
  editForm.className = 'edit-form';
  editForm.innerHTML = '<input type="text" class="edit-path" placeholder="File path" value="' + pathEsc + '" /><input type="text" class="edit-desc" placeholder="Description" value="' + descEsc + '" /><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditFavorite(\'' + safeFullPath + '\')">Save</button><button class="cancel-btn" onclick="cancelEditFavorite(\'' + safeFullPath + '\')">Cancel</button></div>';
  
  wrapper.appendChild(itemDiv);
  wrapper.appendChild(editForm);
  
  return wrapper;
}

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