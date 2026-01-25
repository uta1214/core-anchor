// Favorites関連処理

let editingFavorite = null;
let allFavoritesData = null;
let currentFolderDepth = 1;

function increaseFolderDepth() {
  console.log('increaseFolderDepth called, current:', currentFolderDepth);
  currentFolderDepth++;
  console.log('new depth:', currentFolderDepth);
  updateFolderDepthDisplay();
  saveState();
  vscode.postMessage({ command: 'setFolderDepth', depth: currentFolderDepth });
  if (allFavoritesData) {
    updateFavorites(allFavoritesData);
  }
}

function decreaseFolderDepth() {
  console.log('decreaseFolderDepth called, current:', currentFolderDepth);
  if (currentFolderDepth > 0) {
    currentFolderDepth--;
    console.log('new depth:', currentFolderDepth);
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
  debug.textContent = entries.length + ' favorites (' + currentFavoriteMode + ', depth: ' + currentFolderDepth + ')';
  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-text">No files</div>';
    return;
  }
  
  // ツリー構造を構築
  const tree = buildFolderTree(entries, currentFolderDepth);
  
  container.innerHTML = '';
  renderFolderTree(tree, container, '', 0);
}

function buildFolderTree(entries, depth) {
  const tree = {};
  
  entries.forEach(([path, data]) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const folderParts = parts.slice(0, -1);
    
    if (depth === 0 || folderParts.length === 0) {
      // 深度0またはルートファイル
      if (!tree['__root__']) {
        tree['__root__'] = { type: 'files', files: [] };
      }
      tree['__root__'].files.push({ fullPath: path, fileName, data });
    } else {
      // 下からdepth個のフォルダを取得
      const startIndex = Math.max(0, folderParts.length - depth);
      const relevantParts = folderParts.slice(startIndex);
      
      // ツリーを構築
      let currentLevel = tree;
      relevantParts.forEach((folderName, index) => {
        if (!currentLevel[folderName]) {
          currentLevel[folderName] = {
            type: 'folder',
            children: {},
            files: []
          };
        }
        currentLevel = currentLevel[folderName].children;
      });
      
      // ファイルを追加
      const lastFolder = relevantParts[relevantParts.length - 1];
      let parent = tree;
      for (let i = 0; i < relevantParts.length - 1; i++) {
        parent = parent[relevantParts[i]].children;
      }
      parent[lastFolder].files.push({ fullPath: path, fileName, data });
    }
  });
  
  return tree;
}

function renderFolderTree(node, container, parentPath, level) {
  const keys = Object.keys(node).sort();
  
  keys.forEach(key => {
    if (key === '__root__') {
      // ルートファイルを直接表示
      node[key].files.forEach(({ fullPath, fileName, data }) => {
        const wrapper = createFileItemElement(fullPath, fileName, data);
        container.appendChild(wrapper);
      });
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
      
      // ファイル数をカウント（子フォルダ含む）
      const fileCount = countFilesInTree(item);
      
      headerDiv.innerHTML = '<span id="icon-' + folderId + '" class="folder-icon' + (isExpanded ? ' expanded' : '') + '">▶</span><span class="folder-name">📁 ' + escapeHtml(key) + '</span><span class="folder-count">(' + fileCount + ')</span>';
      
      const itemsDiv = document.createElement('div');
      itemsDiv.id = 'items-' + folderId;
      itemsDiv.className = 'folder-items' + (isExpanded ? ' expanded' : '');
      itemsDiv.style.display = isExpanded ? 'block' : 'none';
      
      folderDiv.appendChild(headerDiv);
      folderDiv.appendChild(itemsDiv);
      container.appendChild(folderDiv);
      
      if (isExpanded) {
        // 子フォルダを再帰的にレンダリング
        renderFolderTree(item.children, itemsDiv, currentPath, level + 1);
        
        // このフォルダのファイルを表示
        item.files.forEach(({ fullPath, fileName, data }) => {
          const wrapper = createFileItemElement(fullPath, fileName, data);
          wrapper.style.marginLeft = '0px';
          itemsDiv.appendChild(wrapper);
        });
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

function createFileItemElement(fullPath, fileName, data) {
  const pathId = safeId(fullPath);
  const pathEsc = escapeHtml(fullPath);
  const descEsc = escapeHtml(data.description || '');
  const safeFullPath = fullPath.replace(/'/g, "\\'").replace(/\\\\/g, "\\\\");
  
  const wrapper = document.createElement('div');
  
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';
  itemDiv.innerHTML = '<div class="item-content" onclick="openFile(\'' + safeFullPath + '\')"><div class="item-file">' + escapeHtml(fileName) + '</div><div class="item-desc">' + descEsc + '</div></div><div class="item-buttons"><button class="btn" onclick="startEditFavorite(\'' + safeFullPath + '\')">✏️</button><button class="btn" onclick="removeFavorite(\'' + safeFullPath + '\')">×</button></div>';
  
  const editForm = document.createElement('div');
  editForm.id = 'edit-fav-' + pathId;
  editForm.className = 'edit-form';
  editForm.innerHTML = '<input type="text" class="edit-path" value="' + pathEsc + '" /><input type="text" class="edit-desc" value="' + descEsc + '" /><div class="edit-form-buttons"><button class="save-btn" onclick="saveEditFavorite(\'' + safeFullPath + '\')">Save</button><button class="cancel-btn" onclick="cancelEditFavorite(\'' + safeFullPath + '\')">Cancel</button></div>';
  
  wrapper.appendChild(itemDiv);
  wrapper.appendChild(editForm);
  
  return wrapper;
}

// グローバルに公開
window.increaseFolderDepth = increaseFolderDepth;
window.decreaseFolderDepth = decreaseFolderDepth;