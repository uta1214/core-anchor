// メインロジック

const vscode = acquireVsCodeApi();
const expandedFolders = new Set();
const expandedFiles = new Set();
let iconPaths = {};
let currentFavoriteMode = 'global';
let favoritesMeta = { folderOrder: [], fileOrder: {} };
let bookmarksMeta = { fileOrder: [], bookmarkSortType: {} };
let sectionCollapsed = { favorites: false, bookmarks: false }; // セクション折りたたみ状態
const ICON_LABELS = {
  'default': 'Default',
  'todo': 'TODO',
  'bug': 'Bug',
  'note': 'Note',
  'important': 'Important',
  'question': 'Question',
  'all': 'All'
};

function loadState() {
  const state = vscode.getState();
  if (state) {
    if (state.expandedFolders) state.expandedFolders.forEach(id => expandedFolders.add(id));
    if (state.expandedFiles) state.expandedFiles.forEach(id => expandedFiles.add(id));
    if (state.iconPaths) iconPaths = state.iconPaths;
    if (state.favoriteMode) currentFavoriteMode = state.favoriteMode;
    if (state.folderDepth !== undefined) {
      currentFolderDepth = state.folderDepth;
    } else {
      currentFolderDepth = 1;
    }
    if (state.sectionCollapsed) {
      sectionCollapsed = state.sectionCollapsed;
    }
  } else {
    currentFolderDepth = 1;
  }
  updateModeButtons();
  updateFolderDepthDisplay();
  updateSectionCollapseStates();
  
}

function saveState() {
  vscode.setState({ 
    expandedFolders: Array.from(expandedFolders), 
    expandedFiles: Array.from(expandedFiles), 
    iconPaths: iconPaths,
    favoriteMode: currentFavoriteMode,
    folderDepth: currentFolderDepth,
    sectionCollapsed: sectionCollapsed
  });
}

function toggleSection(sectionName) {
  sectionCollapsed[sectionName] = !sectionCollapsed[sectionName];
  updateSectionCollapseState(sectionName);
  saveState();
}

function updateSectionCollapseState(sectionName) {
  const content = document.getElementById(sectionName + 'Content');
  const icon = document.getElementById(sectionName + 'CollapseIcon');
  
  if (content && icon) {
    if (sectionCollapsed[sectionName]) {
      content.style.display = 'none';
      icon.textContent = '▶';
    } else {
      content.style.display = 'block';
      icon.textContent = '▼';
    }
  }
}

function updateSectionCollapseStates() {
  updateSectionCollapseState('favorites');
  updateSectionCollapseState('bookmarks');
}

window.addEventListener('load', () => { 
  loadState(); 
  vscode.postMessage({ command: 'ready' }); 
});

window.addEventListener('message', event => {
  const msg = event.data;
  
  
  if (msg.command === 'update') {
    favoritesMeta = msg.favoritesMeta || { folderOrder: [], fileOrder: {} };
    bookmarksMeta = msg.bookmarksMeta || { fileOrder: [], bookmarkSortType: {} };
    allFavoritesData = msg.favorites;
    allBookmarksData = msg.bookmarks;
    // ファイルアイコンのマッピングを更新
    if (msg.fileIcons) {
      fileIcons = msg.fileIcons;
    }
    
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
  } else if (msg.command === 'setFolderDepth') {
    
    currentFolderDepth = msg.depth;
    updateFolderDepthDisplay();
    saveState();
    if (allFavoritesData) {
      
      updateFavorites(allFavoritesData);
    }
  }
});

// グローバルに公開
window.toggleSection = toggleSection;