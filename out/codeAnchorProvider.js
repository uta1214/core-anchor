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
const webviewContent_1 = require("./webviewContent");
class CodeAnchorProvider {
    constructor(context) {
        this.context = context;
        this.favoriteMode = 'global'; // デフォルトはGlobal
        // 前回のモードを復元
        this.favoriteMode = this.context.workspaceState.get('favoriteMode', 'global');
    }
    setDecorationTypes(decorationTypes) {
        this.decorationTypes = decorationTypes;
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
                case 'refresh':
                    this.refresh();
                    break;
                case 'ready':
                    console.log('Webview ready, sending initial data');
                    this.sendIconPaths(webviewView);
                    this.sendFavoriteMode();
                    this.refresh();
                    break;
            }
        });
        this.refresh();
    }
    getCustomIconDirectories() {
        const dirs = new Set();
        const config = vscode.workspace.getConfiguration('code-anchor');
        const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question'];
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
    sendIconPaths(webviewView) {
        const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question'];
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
            return JSON.parse(content);
        }
        catch (error) {
            console.error('Error loading favorites:', error);
            return {};
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
    // モード切り替え
    async switchFavoriteMode(mode) {
        this.favoriteMode = mode;
        await this.context.workspaceState.update('favoriteMode', mode);
        this.sendFavoriteMode();
        this.refresh();
        vscode.window.showInformationMessage(`Switched to ${mode} favorites`);
    }
    async addFavorite(filePath, description) {
        if (!filePath.trim()) {
            vscode.window.showErrorMessage('File path is required');
            return;
        }
        const favorites = this.loadFavorites();
        favorites[filePath] = { path: filePath, description };
        this.saveFavorites(favorites);
        this.refresh();
        vscode.window.showInformationMessage(`Added "${filePath}" to favorites`);
    }
    async editFavorite(oldPath, newPath, description) {
        const favorites = this.loadFavorites();
        if (oldPath !== newPath) {
            delete favorites[oldPath];
        }
        favorites[newPath] = { path: newPath, description };
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
            await vscode.window.showTextDocument(document);
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
        const iconTypeItems = Object.entries(types_1.ICON_TYPE_LABELS).map(([value, label]) => {
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
        // 同じ行に既存のブックマークがあれば削除（上書き）
        bookmarks[relativePath] = bookmarks[relativePath].filter(b => b.line !== line);
        bookmarks[relativePath].push({
            line,
            label,
            iconType: selectedIconType.value
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
        // 同じ行に既存のブックマークがあれば削除（上書き）
        bookmarks[filePath] = bookmarks[filePath].filter(b => b.line !== line);
        bookmarks[filePath].push({ line, label: label || '', iconType: iconType || 'default' });
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
                bookmarks[filePath][index] = {
                    line: newLine,
                    label,
                    iconType: iconType || currentIconType
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
        return (0, webviewContent_1.getHtmlContent)();
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
            console.log('Sending update to webview - favorites:', favorites, 'bookmarks:', bookmarks);
            this._view.webview.postMessage({
                command: 'update',
                favorites: favorites,
                bookmarks: bookmarks,
            });
        }
        else {
            console.log('Webview not initialized yet');
        }
    }
}
exports.CodeAnchorProvider = CodeAnchorProvider;
//# sourceMappingURL=codeAnchorProvider.js.map