// メインロジック

const vscode = acquireVsCodeApi();
const expandedFolders = new Set();
const expandedFiles = new Set();
let iconPaths = {};
let currentFavoriteMode = 'global';
let favoritesMeta = { folderOrder: [], fileOrder: {} };
let bookmarksMeta = { fileOrder: [], bookmarkSortType: {} };
let showFavorites = true;
let showBookmarks = true;
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
    if (state.showFavorites !== undefined) showFavorites = state.showFavorites;
    if (state.showBookmarks !== undefined) showBookmarks = state.showBookmarks;
  } else {
    currentFolderDepth = 1;
  }
  updateModeButtons();
  updateFolderDepthDisplay();
  updateSectionVisibility();
  console.log('State loaded, folderDepth:', currentFolderDepth, 'showFavorites:', showFavorites, 'showBookmarks:', showBookmarks);
}

function saveState() {
  vscode.setState({ 
    expandedFolders: Array.from(expandedFolders), 
    expandedFiles: Array.from(expandedFiles), 
    iconPaths: iconPaths,
    favoriteMode: currentFavoriteMode,
    folderDepth: currentFolderDepth,
    showFavorites: showFavorites,
    showBookmarks: showBookmarks
  });
}

function updateSectionVisibility() {
  const sections = document.querySelectorAll('.section');
  const separator = document.querySelector('.separator');
  
  if (sections.length >= 2) {
    // 最初のsectionがFavorites、2番目がBookmarks
    const favoritesSection = sections[0];
    const bookmarksSection = sections[1];
    
    if (favoritesSection) {
      favoritesSection.style.display = showFavorites ? 'block' : 'none';
    }
    if (bookmarksSection) {
      bookmarksSection.style.display = showBookmarks ? 'block' : 'none';
    }
  }
  
  if (separator) {
    separator.style.display = (showFavorites && showBookmarks) ? 'block' : 'none';
  }
}

window.addEventListener('load', () => { 
  loadState(); 
  vscode.postMessage({ command: 'ready' }); 
});

window.addEventListener('message', event => {
  const msg = event.data;
  console.log('Received message:', msg.command, msg);
  
  if (msg.command === 'update') {
    favoritesMeta = msg.favoritesMeta || { folderOrder: [], fileOrder: {} };
    bookmarksMeta = msg.bookmarksMeta || { fileOrder: [], bookmarkSortType: {} };
    allFavoritesData = msg.favorites;
    allBookmarksData = msg.bookmarks;
    console.log('Update received, folderDepth:', currentFolderDepth, 'favorites:', msg.favorites);
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
    console.log('setFolderDepth received:', msg.depth);
    currentFolderDepth = msg.depth;
    updateFolderDepthDisplay();
    saveState();
    if (allFavoritesData) {
      console.log('Re-rendering favorites with depth:', currentFolderDepth);
      updateFavorites(allFavoritesData);
    }
  } else if (msg.command === 'setSectionVisibility') {
    console.log('setSectionVisibility received:', msg);
    if (msg.showFavorites !== undefined) showFavorites = msg.showFavorites;
    if (msg.showBookmarks !== undefined) showBookmarks = msg.showBookmarks;
    updateSectionVisibility();
    saveState();
  }
});