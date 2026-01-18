// メインロジック

const vscode = acquireVsCodeApi();
const expandedFolders = new Set();
const expandedFiles = new Set();
let iconPaths = {};
let currentFavoriteMode = 'global';
let favoritesMeta = { folderOrder: [], fileOrder: {} };
let bookmarksMeta = { fileOrder: [], bookmarkSortType: {} };
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