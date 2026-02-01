"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeAnchorProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const types_1 = require("./types");
const index_1 = require("./webview/index");
class CodeAnchorProvider {
    constructor(context) {
        this.context = context;
        this.favoriteMode = 'global';
        this.nextFavoriteOrder = 0;
        this.nextBookmarkOrder = 0;
        this.favoriteMode = this.context.workspaceState.get('favoriteMode', 'global');
    }
    setDecorationTypes(decorationTypes) {
        this.decorationTypes = decorationTypes;
    }
    reloadWebview() {
        if (this._view) {
            console.log('Reloading webview...');
            try {
                this._view.webview.html = this.getHtmlContent();
                this.sendIconPaths(this._view);
                this.sendFavoriteMode();
                const folderDepth = this.context.workspaceState.get('folderDepth', 1);
                this._view.webview.postMessage({
                    command: 'setFolderDepth',
                    depth: folderDepth
                });
                // セクションの表示設定を送信（追加）
                const config = vscode.workspace.getConfiguration('code-anchor');
                const showFavorites = config.get('ui.showFavorites', true);
                const showBookmarks = config.get('ui.showBookmarks', true);
                this._view.webview.postMessage({
                    command: 'setSectionVisibility',
                    showFavorites: showFavorites,
                    showBookmarks: showBookmarks
                });
                this.refresh();
                console.log('Webview reloaded successfully');
            }
            catch (error) {
                console.error('Error reloading webview:', error);
            }
        }
    }
    resolveWebviewView(webviewView) {
        console.log('Resolving webview view...');
        this._view = webviewView;
        const customIconDirs = this.getCustomIconDirectories();
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'resources')),
                ...(vscode.workspace.workspaceFolders || []).map(folder => folder.uri),
                ...customIconDirs
            ]
        };
        try {
            webviewView.webview.html = this.getHtmlContent();
            console.log('Webview HTML set successfully');
        }
        catch (error) {
            console.error('Error setting webview HTML:', error);
        }
        this.sendIconPaths(webviewView);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('Received message from webview:', message.command);
            switch (message.command) {
                case 'addFavorite':
                    await this.addFavorite(message.path, message.description);
                    break;
                case 'quickAddCurrentFile':
                    await this.quickAddCurrentFile();
                    break;
                case 'editFavorite':
                    await this.editFavorite(message.oldPath, message.newPath, message.description);
                    break;
                case 'removeFavorite':
                    await this.removeFavorite(message.path);
                    break;
                case 'openFile':
                    await this.openFile(message.path);
                    break;
                case 'addBookmarkManual':
                    await this.addBookmarkManual(message.filePath, message.line, message.label, message.iconType);
                    break;
                case 'editBookmark':
                    await this.editBookmark(message.filePath, message.oldLine, message.newLine, message.label, message.iconType);
                    break;
                case 'removeBookmark':
                    await this.removeBookmark(message.filePath, message.line);
                    break;
                case 'jumpToBookmark':
                    await this.jumpToBookmark(message.filePath, message.line);
                    break;
                case 'switchFavoriteMode':
                    await this.switchFavoriteMode(message.mode);
                    break;
                case 'setFolderDepth':
                    await this.setFolderDepth(message.depth);
                    break;
                case 'sortFavoriteFolders':
                    await this.sortFavoriteFolders(message.sortType);
                    break;
                case 'sortFavoriteFiles':
                    await this.sortFavoriteFiles(message.folderPath, message.sortType);
                    break;
                case 'sortBookmarkFiles':
                    await this.sortBookmarkFiles(message.sortType);
                    break;
                case 'sortBookmarks':
                    await this.sortBookmarks(message.filePath, message.sortType);
                    break;
                case 'reorderFavoriteFolders':
                    await this.reorderFavoriteFolders(message.folders);
                    break;
                case 'reorderFavoriteFiles':
                    await this.reorderFavoriteFiles(message.folderPath, message.files);
                    break;
                case 'reorderBookmarkFiles':
                    await this.reorderBookmarkFiles(message.files);
                    break;
                case 'reorderBookmarks':
                    await this.reorderBookmarks(message.filePath, message.bookmarks);
                    break;
                case 'refresh':
                    this.refresh();
                    break;
                case 'ready':
                    console.log('Webview ready, sending initial data');
                    this.sendIconPaths(webviewView);
                    this.sendFavoriteMode();
                    const folderDepth = this.context.workspaceState.get('folderDepth', 1);
                    webviewView.webview.postMessage({
                        command: 'setFolderDepth',
                        depth: folderDepth
                    });
                    // セクションの表示設定を送信
                    const config = vscode.workspace.getConfiguration('code-anchor');
                    const showFavorites = config.get('ui.showFavorites', true);
                    const showBookmarks = config.get('ui.showBookmarks', true);
                    webviewView.webview.postMessage({
                        command: 'setSectionVisibility',
                        showFavorites: showFavorites,
                        showBookmarks: showBookmarks
                    });
                    this.refresh();
                    break;
            }
        });
        this.refresh();
    }
    getCustomIconDirectories() {
        const dirs = new Set();
        const config = vscode.workspace.getConfiguration('code-anchor');
        const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question', 'all'];
        iconTypes.forEach(iconType => {
            let customPath = config.get(`icons.${iconType}`);
            if (customPath && customPath.trim() !== '') {
                customPath = customPath.trim().replace(/^["']|["']$/g, '');
                let absolutePath = customPath;
                if (!path.isAbsolute(customPath)) {
                    const workspaceFolders = vscode.workspace.workspaceFolders;
                    if (workspaceFolders && workspaceFolders.length > 0) {
                        absolutePath = path.join(workspaceFolders[0].uri.fsPath, customPath);
                    }
                }
                if (fs.existsSync(absolutePath)) {
                    const dir = path.dirname(absolutePath);
                    dirs.add(dir);
                }
            }
        });
        return Array.from(dirs).map(dir => vscode.Uri.file(dir));
    }
    getMaterialIconName(filePath) {
        const fileName = filePath.split('/').pop() || '';
        const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';
        const lowerFileName = fileName.toLowerCase();
        // 特殊なファイル名のマッピング
        const specialFiles = {
            'package.json': 'nodejs',
            'package-lock.json': 'nodejs',
            'tsconfig.json': 'tsconfig',
            'webpack.config.js': 'webpack',
            'dockerfile': 'docker',
            'docker-compose.yml': 'docker',
            'makefile': 'settings',
            '.gitignore': 'git',
            '.gitattributes': 'git',
            'readme.md': 'markdown',
            'readme': 'info',
            'license': 'certificate',
            '.env': 'tune',
            '.env.local': 'tune',
            '.eslintrc': 'eslint',
            '.prettierrc': 'prettier',
        };
        for (const [key, icon] of Object.entries(specialFiles)) {
            if (lowerFileName === key || lowerFileName.startsWith(key + '.')) {
                return icon;
            }
        }
        // 拡張子のマッピング
        const extensionMap = {
            // JavaScript/TypeScript
            'js': 'javascript',
            'jsx': 'react',
            'ts': 'typescript',
            'tsx': 'react_ts',
            'mjs': 'javascript',
            'cjs': 'javascript',
            // C/C++
            'c': 'c',
            'h': 'h',
            'cpp': 'cpp',
            'cc': 'cpp',
            'cxx': 'cpp',
            'hpp': 'cpp',
            'hxx': 'cpp',
            // Python
            'py': 'python',
            'pyc': 'python',
            'pyd': 'python',
            'pyw': 'python',
            // Java
            'java': 'java',
            'class': 'java',
            'jar': 'java',
            // Web
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'sass',
            'sass': 'sass',
            'less': 'less',
            // PHP
            'php': 'php',
            // Go
            'go': 'go',
            // Rust
            'rs': 'rust',
            // Ruby
            'rb': 'ruby',
            // Shell
            'sh': 'shell',
            'bash': 'shell',
            'zsh': 'shell',
            'fish': 'shell',
            // Data/Config
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'toml': 'toml',
            'xml': 'xml',
            'ini': 'settings',
            'conf': 'settings',
            'config': 'settings',
            // Markdown/Docs
            'md': 'markdown',
            'txt': 'document',
            // SQL
            'sql': 'database',
            // Other
            'proto': 'proto',
            'graphql': 'graphql',
            'gql': 'graphql',
            'vue': 'vue',
            'svelte': 'svelte',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'r': 'r',
            'dart': 'dart',
            'lua': 'lua',
            'perl': 'perl',
            'pl': 'perl',
        };
        if (extension && extensionMap[extension]) {
            return extensionMap[extension];
        }
        return 'file';
    }
    sendIconPaths(webviewView) {
        const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question', 'all'];
        const iconPaths = {};
        iconTypes.forEach(iconType => {
            const iconPath = this.getIconPath(iconType);
            try {
                const webviewUri = webviewView.webview.asWebviewUri(vscode.Uri.file(iconPath));
                iconPaths[iconType] = webviewUri.toString();
                console.log(`Icon path for ${iconType}: ${iconPath} -> ${iconPaths[iconType]}`);
            }
            catch (error) {
                console.error(`Error converting icon path for ${iconType}:`, error);
                const defaultPath = this.context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
                const webviewUri = webviewView.webview.asWebviewUri(vscode.Uri.file(defaultPath));
                iconPaths[iconType] = webviewUri.toString();
            }
        });
        console.log('Sending icon paths to webview:', iconPaths);
        webviewView.webview.postMessage({
            command: 'setIconPaths',
            paths: iconPaths
        });
    }
    sendFavoriteMode() {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'setFavoriteMode',
                mode: this.favoriteMode
            });
        }
    }
    // Global Favoritesのパスを取得
    getGlobalFavoritesPath() {
        const homeDir = os.homedir();
        const configDir = path.join(homeDir, '.vscode');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        return path.join(configDir, 'code-anchor-favorites.json');
    }
    // Local Favoritesのパスを取得
    getLocalFavoritesPath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return '';
        const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
        if (!fs.existsSync(vscodeFolder)) {
            fs.mkdirSync(vscodeFolder);
        }
        return path.join(vscodeFolder, 'favorites.json');
    }
    // Favorites Metaのパスを取得
    getFavoritesMetaPath() {
        if (this.favoriteMode === 'global') {
            const homeDir = os.homedir();
            const configDir = path.join(homeDir, '.vscode');
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            return path.join(configDir, 'code-anchor-favorites-meta.json');
        }
        else {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders)
                return '';
            const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
            if (!fs.existsSync(vscodeFolder)) {
                fs.mkdirSync(vscodeFolder);
            }
            return path.join(vscodeFolder, 'favorites-meta.json');
        }
    }
    // Bookmarks Metaのパスを取得
    getBookmarksMetaPath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return '';
        const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
        if (!fs.existsSync(vscodeFolder)) {
            fs.mkdirSync(vscodeFolder);
        }
        return path.join(vscodeFolder, 'bookmarks-meta.json');
    }
    // 現在のモードに応じたFavoritesパスを取得
    getCurrentFavoritesPath() {
        return this.favoriteMode === 'global'
            ? this.getGlobalFavoritesPath()
            : this.getLocalFavoritesPath();
    }
    // Favoritesを読み込む
    loadFavorites() {
        const favoritesPath = this.getCurrentFavoritesPath();
        if (!favoritesPath || !fs.existsSync(favoritesPath)) {
            return {};
        }
        try {
            const content = fs.readFileSync(favoritesPath, 'utf-8');
            const favorites = JSON.parse(content);
            // orderを初期化
            let maxOrder = 0;
            Object.values(favorites).forEach((fav) => {
                if (fav.order !== undefined && fav.order > maxOrder) {
                    maxOrder = fav.order;
                }
            });
            this.nextFavoriteOrder = maxOrder + 1;
            return favorites;
        }
        catch (error) {
            console.error('Error loading favorites:', error);
            return {};
        }
    }
    // Favorites Metaを読み込む
    loadFavoritesMeta() {
        const metaPath = this.getFavoritesMetaPath();
        if (!metaPath || !fs.existsSync(metaPath)) {
            return { folderOrder: [], fileOrder: {} };
        }
        try {
            const content = fs.readFileSync(metaPath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error loading favorites meta:', error);
            return { folderOrder: [], fileOrder: {} };
        }
    }
    // Bookmarks Metaを読み込む
    loadBookmarksMeta() {
        const metaPath = this.getBookmarksMetaPath();
        if (!metaPath || !fs.existsSync(metaPath)) {
            return { fileOrder: [], bookmarkSortType: {} };
        }
        try {
            const content = fs.readFileSync(metaPath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error loading bookmarks meta:', error);
            return { fileOrder: [], bookmarkSortType: {} };
        }
    }
    // Favoritesを保存する
    saveFavorites(favorites) {
        const favoritesPath = this.getCurrentFavoritesPath();
        if (!favoritesPath) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }
        try {
            fs.writeFileSync(favoritesPath, JSON.stringify(favorites, null, 2));
        }
        catch (error) {
            console.error('Error saving favorites:', error);
            vscode.window.showErrorMessage('Failed to save favorites');
        }
    }
    // Favorites Metaを保存
    saveFavoritesMeta(meta) {
        const metaPath = this.getFavoritesMetaPath();
        if (!metaPath) {
            return;
        }
        try {
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        }
        catch (error) {
            console.error('Error saving favorites meta:', error);
        }
    }
    // Bookmarks Metaを保存
    saveBookmarksMeta(meta) {
        const metaPath = this.getBookmarksMetaPath();
        if (!metaPath) {
            return;
        }
        try {
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        }
        catch (error) {
            console.error('Error saving bookmarks meta:', error);
        }
    }
    // モード切り替え
    async switchFavoriteMode(mode) {
        this.favoriteMode = mode;
        await this.context.workspaceState.update('favoriteMode', mode);
        this.sendFavoriteMode();
        this.refresh();
        vscode.window.showInformationMessage(`Switched to ${mode} favorites`);
    }
    // フォルダの深さをセット
    async setFolderDepth(depth) {
        await this.context.workspaceState.update('folderDepth', depth);
        if (this._view) {
            this._view.webview.postMessage({
                command: 'setFolderDepth',
                depth: depth
            });
        }
    }
    // Favoriteフォルダをソート
    async sortFavoriteFolders(sortType) {
        const favorites = this.loadFavorites();
        const meta = this.loadFavoritesMeta();
        const folderMap = new Map();
        Object.keys(favorites).forEach(filePath => {
            const parts = filePath.split('/');
            const folderPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
            if (!folderMap.has(folderPath)) {
                folderMap.set(folderPath, []);
            }
        });
        let folders = Array.from(folderMap.keys());
        if (sortType === 'name') {
            folders.sort((a, b) => a.localeCompare(b));
        }
        else if (sortType === 'order') {
            // 追加順（現在の順序を保持）
            folders = folders;
        }
        meta.folderOrder = folders;
        this.saveFavoritesMeta(meta);
        this.refresh();
        vscode.window.showInformationMessage('Folders sorted');
    }
    // Favoriteファイル（フォルダ内）をソート
    async sortFavoriteFiles(folderPath, sortType) {
        const favorites = this.loadFavorites();
        const meta = this.loadFavoritesMeta();
        const filesInFolder = Object.entries(favorites)
            .filter(([filePath]) => {
            const parts = filePath.split('/');
            const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
            return folder === folderPath;
        })
            .map(([filePath, data]) => ({ filePath, data }));
        if (sortType === 'name') {
            filesInFolder.sort((a, b) => {
                const nameA = a.filePath.split('/').pop() || '';
                const nameB = b.filePath.split('/').pop() || '';
                return nameA.localeCompare(nameB);
            });
        }
        else if (sortType === 'order') {
            filesInFolder.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
        }
        meta.fileOrder[folderPath] = filesInFolder.map(f => f.filePath);
        this.saveFavoritesMeta(meta);
        this.refresh();
        vscode.window.showInformationMessage('Files sorted');
    }
    // Bookmarkファイルをソート
    async sortBookmarkFiles(sortType) {
        const bookmarks = this.loadBookmarks();
        const meta = this.loadBookmarksMeta();
        let files = Object.keys(bookmarks);
        if (sortType === 'name') {
            files.sort((a, b) => a.localeCompare(b));
        }
        else if (sortType === 'order') {
            // 追加順（現在の順序を保持）
            files = files;
        }
        meta.fileOrder = files;
        this.saveBookmarksMeta(meta);
        this.refresh();
        vscode.window.showInformationMessage('Bookmark files sorted');
    }
    // Bookmarks（ファイル内）をソート
    async sortBookmarks(filePath, sortType) {
        const bookmarks = this.loadBookmarks();
        const meta = this.loadBookmarksMeta();
        if (!bookmarks[filePath])
            return;
        if (sortType === 'line') {
            bookmarks[filePath].sort((a, b) => a.line - b.line);
        }
        else if (sortType === 'order') {
            bookmarks[filePath].sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        meta.bookmarkSortType[filePath] = sortType;
        this.saveBookmarks(bookmarks);
        this.saveBookmarksMeta(meta);
        this.refresh();
        vscode.window.showInformationMessage('Bookmarks sorted');
    }
    // Favoriteフォルダを並び替え（ドラッグ&ドロップ）
    async reorderFavoriteFolders(folders) {
        const meta = this.loadFavoritesMeta();
        meta.folderOrder = folders;
        this.saveFavoritesMeta(meta);
        this.refresh();
    }
    // Favoriteファイルを並び替え（ドラッグ&ドロップ）
    async reorderFavoriteFiles(folderPath, files) {
        const meta = this.loadFavoritesMeta();
        meta.fileOrder[folderPath] = files;
        this.saveFavoritesMeta(meta);
        this.refresh();
    }
    // Bookmarkファイルを並び替え（ドラッグ&ドロップ）
    async reorderBookmarkFiles(files) {
        const meta = this.loadBookmarksMeta();
        meta.fileOrder = files;
        this.saveBookmarksMeta(meta);
        this.refresh();
    }
    // Bookmarksを並び替え（ドラッグ&ドロップ）
    async reorderBookmarks(filePath, bookmarkLines) {
        const bookmarks = this.loadBookmarks();
        if (!bookmarks[filePath])
            return;
        // 行番号の順序でブックマークを並び替え
        const reordered = [];
        bookmarkLines.forEach(line => {
            const bookmark = bookmarks[filePath].find(b => b.line === line);
            if (bookmark) {
                reordered.push(bookmark);
            }
        });
        bookmarks[filePath] = reordered;
        this.saveBookmarks(bookmarks);
        this.refresh();
    }
    async addFavorite(filePath, description) {
        if (!filePath.trim()) {
            vscode.window.showErrorMessage('File path is required');
            return;
        }
        const favorites = this.loadFavorites();
        favorites[filePath] = {
            path: filePath,
            description,
            order: this.nextFavoriteOrder++
        };
        this.saveFavorites(favorites);
        this.refresh();
        vscode.window.showInformationMessage(`Added "${filePath}" to favorites`);
    }
    // Quick Add: 現在のファイルを説明なしで追加
    async quickAddCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        // 既に登録されているか確認
        const favorites = this.loadFavorites();
        if (favorites[relativePath]) {
            vscode.window.showInformationMessage(`"${relativePath}" is already in favorites`);
            return;
        }
        await this.addFavorite(relativePath, '');
    }
    async editFavorite(oldPath, newPath, description) {
        const favorites = this.loadFavorites();
        const oldOrder = favorites[oldPath]?.order;
        if (oldPath !== newPath) {
            delete favorites[oldPath];
        }
        favorites[newPath] = {
            path: newPath,
            description,
            order: oldOrder !== undefined ? oldOrder : this.nextFavoriteOrder++
        };
        this.saveFavorites(favorites);
        this.refresh();
        vscode.window.showInformationMessage(`Updated "${newPath}"`);
    }
    async removeFavorite(filePath) {
        const favorites = this.loadFavorites();
        delete favorites[filePath];
        this.saveFavorites(favorites);
        this.refresh();
    }
    async openFile(filePath) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }
        const fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
        const uri = vscode.Uri.file(fullPath);
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            // 設定からプレビューモードを取得
            const config = vscode.workspace.getConfiguration('code-anchor');
            const openInPreview = config.get('ui.openInPreview', true);
            await vscode.window.showTextDocument(document, {
                preview: openInPreview
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Cannot open file: ${filePath}`);
        }
    }
    getIconPath(iconType) {
        const config = vscode.workspace.getConfiguration('code-anchor');
        let customPath = config.get(`icons.${iconType}`);
        if (customPath && customPath.trim() !== '') {
            customPath = customPath.trim().replace(/^["']|["']$/g, '');
            let absolutePath = customPath;
            if (!path.isAbsolute(customPath)) {
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders && workspaceFolders.length > 0) {
                    absolutePath = path.join(workspaceFolders[0].uri.fsPath, customPath);
                }
            }
            if (fs.existsSync(absolutePath)) {
                return absolutePath;
            }
        }
        return this.context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
    }
    async addBookmark() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const line = editor.selection.active.line;
        const iconTypeItems = Object.entries(types_1.ICON_TYPE_LABELS)
            .filter(([value]) => value !== 'all') // 'all'アイコンは除外
            .map(([value, label]) => {
            const iconPath = this.getIconPath(value);
            return {
                label,
                value: value,
                iconPath: vscode.Uri.file(iconPath)
            };
        });
        const selectedIconType = await vscode.window.showQuickPick(iconTypeItems, {
            placeHolder: 'Select bookmark icon type',
        });
        if (!selectedIconType)
            return;
        const label = await vscode.window.showInputBox({
            prompt: 'Enter bookmark label',
            placeHolder: 'e.g. TODO',
        });
        if (label === undefined)
            return;
        const bookmarksPath = this.getBookmarksPath();
        let bookmarks = {};
        if (fs.existsSync(bookmarksPath)) {
            const content = fs.readFileSync(bookmarksPath, 'utf-8');
            bookmarks = JSON.parse(content);
        }
        if (!bookmarks[relativePath]) {
            bookmarks[relativePath] = [];
        }
        // orderを初期化
        let maxOrder = 0;
        bookmarks[relativePath].forEach(b => {
            if (b.order !== undefined && b.order > maxOrder) {
                maxOrder = b.order;
            }
        });
        // 同じ行に既存のブックマークがあれば削除（上書き）
        bookmarks[relativePath] = bookmarks[relativePath].filter(b => b.line !== line);
        bookmarks[relativePath].push({
            line,
            label,
            iconType: selectedIconType.value,
            order: maxOrder + 1
        });
        this.saveBookmarks(bookmarks);
        this.refresh();
        if (this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`Bookmark added at line ${line + 1}`);
    }
    async addBookmarkFromCommand() {
        await this.addBookmark();
    }
    async addFavoriteFromEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const description = await vscode.window.showInputBox({
            prompt: 'Enter file description',
            placeHolder: 'e.g. Entry point',
        });
        if (description === undefined)
            return;
        await this.addFavorite(relativePath, description);
    }
    async addFavoriteFromCommand() {
        await this.addFavoriteFromEditor();
    }
    // ブックマークを上に移動
    async moveBookmarkUp() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const currentLine = editor.selection.active.line;
        const bookmarks = this.loadBookmarks();
        if (!bookmarks[relativePath]) {
            vscode.window.showInformationMessage('No bookmarks in this file');
            return;
        }
        // 現在行のブックマークを探す
        const bookmarkIndex = bookmarks[relativePath].findIndex(b => b.line === currentLine);
        if (bookmarkIndex === -1) {
            vscode.window.showInformationMessage('No bookmark on current line');
            return;
        }
        // 1行上に移動できるか確認
        const newLine = currentLine - 1;
        if (newLine < 0) {
            vscode.window.showInformationMessage('Already at the top');
            return;
        }
        // 移動先に既にブックマークがあるか確認
        const existingIndex = bookmarks[relativePath].findIndex(b => b.line === newLine);
        if (existingIndex !== -1) {
            vscode.window.showInformationMessage('Bookmark already exists on target line');
            return;
        }
        // ブックマークを移動
        bookmarks[relativePath][bookmarkIndex].line = newLine;
        this.saveBookmarks(bookmarks);
        this.refresh();
        if (this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`Bookmark moved to line ${newLine + 1}`);
    }
    // ブックマークを下に移動
    async moveBookmarkDown() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const currentLine = editor.selection.active.line;
        const bookmarks = this.loadBookmarks();
        if (!bookmarks[relativePath]) {
            vscode.window.showInformationMessage('No bookmarks in this file');
            return;
        }
        // 現在行のブックマークを探す
        const bookmarkIndex = bookmarks[relativePath].findIndex(b => b.line === currentLine);
        if (bookmarkIndex === -1) {
            vscode.window.showInformationMessage('No bookmark on current line');
            return;
        }
        // 1行下に移動できるか確認
        const newLine = currentLine + 1;
        if (newLine >= editor.document.lineCount) {
            vscode.window.showInformationMessage('Already at the bottom');
            return;
        }
        // 移動先に既にブックマークがあるか確認
        const existingIndex = bookmarks[relativePath].findIndex(b => b.line === newLine);
        if (existingIndex !== -1) {
            vscode.window.showInformationMessage('Bookmark already exists on target line');
            return;
        }
        // ブックマークを移動
        bookmarks[relativePath][bookmarkIndex].line = newLine;
        this.saveBookmarks(bookmarks);
        this.refresh();
        if (this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`Bookmark moved to line ${newLine + 1}`);
    }
    async addBookmarkManual(filePath, lineStr, label, iconType) {
        if (!filePath.trim() || !lineStr.trim()) {
            vscode.window.showErrorMessage('File path and line number are required');
            return;
        }
        const line = parseInt(lineStr) - 1;
        if (isNaN(line) || line < 0) {
            vscode.window.showErrorMessage('Invalid line number');
            return;
        }
        const bookmarksPath = this.getBookmarksPath();
        let bookmarks = {};
        if (fs.existsSync(bookmarksPath)) {
            const content = fs.readFileSync(bookmarksPath, 'utf-8');
            bookmarks = JSON.parse(content);
        }
        if (!bookmarks[filePath]) {
            bookmarks[filePath] = [];
        }
        // orderを初期化
        let maxOrder = 0;
        bookmarks[filePath].forEach(b => {
            if (b.order !== undefined && b.order > maxOrder) {
                maxOrder = b.order;
            }
        });
        // 同じ行に既存のブックマークがあれば削除（上書き）
        bookmarks[filePath] = bookmarks[filePath].filter(b => b.line !== line);
        bookmarks[filePath].push({
            line,
            label: label || '',
            iconType: iconType || 'default',
            order: maxOrder + 1
        });
        this.saveBookmarks(bookmarks);
        this.refresh();
        const editor = vscode.window.activeTextEditor;
        if (editor && vscode.workspace.asRelativePath(editor.document.uri) === filePath && this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`Bookmark added: ${filePath}:${line + 1}`);
    }
    async editBookmark(filePath, oldLine, newLineStr, label, iconType) {
        const newLine = parseInt(newLineStr) - 1;
        if (isNaN(newLine) || newLine < 0) {
            vscode.window.showErrorMessage('Invalid line number');
            return;
        }
        const bookmarksPath = this.getBookmarksPath();
        if (!fs.existsSync(bookmarksPath))
            return;
        const content = fs.readFileSync(bookmarksPath, 'utf-8');
        const bookmarks = JSON.parse(content);
        if (bookmarks[filePath]) {
            const index = bookmarks[filePath].findIndex(b => b.line === oldLine);
            if (index !== -1) {
                const currentIconType = bookmarks[filePath][index].iconType || 'default';
                const currentOrder = bookmarks[filePath][index].order;
                bookmarks[filePath][index] = {
                    line: newLine,
                    label,
                    iconType: iconType || currentIconType,
                    order: currentOrder
                };
            }
        }
        this.saveBookmarks(bookmarks);
        this.refresh();
        const editor = vscode.window.activeTextEditor;
        if (editor && vscode.workspace.asRelativePath(editor.document.uri) === filePath && this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`Bookmark updated`);
    }
    async removeBookmark(filePath, line) {
        const bookmarksPath = this.getBookmarksPath();
        if (!fs.existsSync(bookmarksPath))
            return;
        const content = fs.readFileSync(bookmarksPath, 'utf-8');
        const bookmarks = JSON.parse(content);
        if (bookmarks[filePath]) {
            bookmarks[filePath] = bookmarks[filePath].filter(b => b.line !== line);
            if (bookmarks[filePath].length === 0) {
                delete bookmarks[filePath];
            }
        }
        this.saveBookmarks(bookmarks);
        this.refresh();
        const editor = vscode.window.activeTextEditor;
        if (editor && this.decorationTypes) {
            this.updateDecorations(editor);
        }
    }
    // ファイル内の全ブックマークを削除
    async deleteAllBookmarks(filePath) {
        const bookmarksPath = this.getBookmarksPath();
        if (!fs.existsSync(bookmarksPath))
            return;
        const content = fs.readFileSync(bookmarksPath, 'utf-8');
        const bookmarks = JSON.parse(content);
        if (bookmarks[filePath]) {
            const count = bookmarks[filePath].length;
            delete bookmarks[filePath];
            this.saveBookmarks(bookmarks);
            this.refresh();
            const editor = vscode.window.activeTextEditor;
            if (editor && this.decorationTypes) {
                this.updateDecorations(editor);
            }
            vscode.window.showInformationMessage(`Deleted ${count} bookmarks from ${filePath}`);
        }
    }
    // フォルダ内の全Favoritesを削除
    async deleteAllFavorites(folderPath) {
        const favorites = this.loadFavorites();
        const filesToDelete = Object.keys(favorites).filter(filePath => {
            const parts = filePath.split('/');
            const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
            return folder === folderPath;
        });
        if (filesToDelete.length > 0) {
            filesToDelete.forEach(filePath => {
                delete favorites[filePath];
            });
            this.saveFavorites(favorites);
            this.refresh();
            vscode.window.showInformationMessage(`Deleted ${filesToDelete.length} files from favorites`);
        }
    }
    async jumpToBookmark(filePath, line) {
        await this.openFile(filePath);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const position = new vscode.Position(line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        }
    }
    getBookmarksPath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return '';
        const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
        if (!fs.existsSync(vscodeFolder)) {
            fs.mkdirSync(vscodeFolder);
        }
        return path.join(vscodeFolder, 'bookmarks.json');
    }
    saveBookmarks(bookmarks) {
        const bookmarksPath = this.getBookmarksPath();
        fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2));
    }
    loadBookmarks() {
        const bookmarksPath = this.getBookmarksPath();
        if (!fs.existsSync(bookmarksPath))
            return {};
        const content = fs.readFileSync(bookmarksPath, 'utf-8');
        return JSON.parse(content);
    }
    getHtmlContent() {
        return (0, index_1.getHtmlContent)();
    }
    updateDecorations(editor) {
        if (!this.decorationTypes)
            return;
        const bookmarks = this.loadBookmarks();
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const decorationsByType = new Map();
        if (bookmarks[relativePath]) {
            for (const bookmark of bookmarks[relativePath]) {
                const iconType = bookmark.iconType || 'default';
                const range = new vscode.Range(bookmark.line, 0, bookmark.line, 0);
                if (!decorationsByType.has(iconType)) {
                    decorationsByType.set(iconType, []);
                }
                decorationsByType.get(iconType).push({
                    range,
                    hoverMessage: `${types_1.ICON_TYPE_LABELS[iconType]}: ${bookmark.label}`,
                });
            }
        }
        this.decorationTypes.forEach((decorationType, iconType) => {
            const decorations = decorationsByType.get(iconType) || [];
            editor.setDecorations(decorationType, decorations);
        });
    }
    refresh() {
        console.log('Refreshing webview...');
        if (this._view) {
            const favorites = this.loadFavorites();
            const bookmarks = this.loadBookmarks();
            const favoritesMeta = this.loadFavoritesMeta();
            const bookmarksMeta = this.loadBookmarksMeta();
            // ファイルアイコンのマッピングを生成
            const fileIcons = {};
            Object.keys(favorites).forEach(filePath => {
                const iconName = this.getMaterialIconName(filePath);
                const iconPath = path.join(this.context.extensionPath, 'resources', 'file-icons', `${iconName}.svg`);
                try {
                    if (fs.existsSync(iconPath)) {
                        const iconUri = this._view.webview.asWebviewUri(vscode.Uri.file(iconPath));
                        fileIcons[filePath] = iconUri.toString();
                    }
                    else {
                        // フォールバック: デフォルトのfileアイコン
                        const defaultIconPath = path.join(this.context.extensionPath, 'resources', 'file-icons', 'file.svg');
                        if (fs.existsSync(defaultIconPath)) {
                            const iconUri = this._view.webview.asWebviewUri(vscode.Uri.file(defaultIconPath));
                            fileIcons[filePath] = iconUri.toString();
                        }
                    }
                }
                catch (error) {
                    console.error(`Error loading icon for ${filePath}:`, error);
                }
            });
            // Bookmarksのファイルアイコンも生成
            Object.keys(bookmarks).forEach(filePath => {
                // 既に生成済みの場合はスキップ
                if (fileIcons[filePath])
                    return;
                const iconName = this.getMaterialIconName(filePath);
                const iconPath = path.join(this.context.extensionPath, 'resources', 'file-icons', `${iconName}.svg`);
                try {
                    if (fs.existsSync(iconPath)) {
                        const iconUri = this._view.webview.asWebviewUri(vscode.Uri.file(iconPath));
                        fileIcons[filePath] = iconUri.toString();
                    }
                    else {
                        // フォールバック: デフォルトのfileアイコン
                        const defaultIconPath = path.join(this.context.extensionPath, 'resources', 'file-icons', 'file.svg');
                        if (fs.existsSync(defaultIconPath)) {
                            const iconUri = this._view.webview.asWebviewUri(vscode.Uri.file(defaultIconPath));
                            fileIcons[filePath] = iconUri.toString();
                        }
                    }
                }
                catch (error) {
                    console.error(`Error loading icon for ${filePath}:`, error);
                }
            });
            console.log('Sending update to webview - favorites:', favorites, 'bookmarks:', bookmarks);
            this._view.webview.postMessage({
                command: 'update',
                favorites: favorites,
                bookmarks: bookmarks,
                favoritesMeta: favoritesMeta,
                bookmarksMeta: bookmarksMeta,
                fileIcons: fileIcons,
            });
        }
        else {
            console.log('Webview not initialized yet');
        }
    }
}
exports.CodeAnchorProvider = CodeAnchorProvider;
//# sourceMappingURL=codeAnchorProvider.js.map