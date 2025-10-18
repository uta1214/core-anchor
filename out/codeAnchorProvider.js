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
const types_1 = require("./types");
const webviewContent_1 = require("./webviewContent");
class CodeAnchorProvider {
    constructor(context) {
        this.context = context;
    }
    setDecorationTypes(decorationTypes) {
        this.decorationTypes = decorationTypes;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))]
        };
        webviewView.webview.html = this.getHtmlContent();
        // リソースパスを送信
        const resourcePath = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))).toString();
        webviewView.webview.postMessage({
            command: 'setResourcePath',
            path: resourcePath
        });
        // メッセージハンドラ
        webviewView.webview.onDidReceiveMessage(async (message) => {
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
                case 'refresh':
                    this.refresh();
                    break;
                case 'ready':
                    // リソースパスを再送信
                    const resourcePath = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))).toString();
                    webviewView.webview.postMessage({
                        command: 'setResourcePath',
                        path: resourcePath
                    });
                    this.refresh();
                    break;
            }
        });
        this.refresh();
    }
    async addFavorite(filePath, description) {
        if (!filePath.trim()) {
            vscode.window.showErrorMessage('ファイルパスを入力してください');
            return;
        }
        const favorites = this.context.globalState.get('favorites', {});
        favorites[filePath] = { path: filePath, description };
        await this.context.globalState.update('favorites', favorites);
        this.refresh();
        vscode.window.showInformationMessage(`「${filePath}」を追加しました`);
    }
    async editFavorite(oldPath, newPath, description) {
        const favorites = this.context.globalState.get('favorites', {});
        if (oldPath !== newPath) {
            delete favorites[oldPath];
        }
        favorites[newPath] = { path: newPath, description };
        await this.context.globalState.update('favorites', favorites);
        this.refresh();
        vscode.window.showInformationMessage(`「${newPath}」を更新しました`);
    }
    async removeFavorite(filePath) {
        const favorites = this.context.globalState.get('favorites', {});
        delete favorites[filePath];
        await this.context.globalState.update('favorites', favorites);
        this.refresh();
    }
    async openFile(filePath) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('ワークスペースが開かれていません');
            return;
        }
        const fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
        const uri = vscode.Uri.file(fullPath);
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(document);
        }
        catch (error) {
            vscode.window.showErrorMessage(`ファイルを開けません: ${filePath}`);
        }
    }
    async addBookmark() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('開いているファイルがありません');
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('ワークスペースが開かれていません');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const line = editor.selection.active.line;
        const iconTypeItems = Object.entries(types_1.ICON_TYPE_LABELS).map(([value, label]) => ({
            label,
            value: value
        }));
        const selectedIconType = await vscode.window.showQuickPick(iconTypeItems, {
            placeHolder: 'Select bookmark icon type',
        });
        if (!selectedIconType)
            return;
        const label = await vscode.window.showInputBox({
            prompt: 'ブックマークのラベルを入力してください',
            placeHolder: '例: TODO',
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
        vscode.window.showInformationMessage(`ブックマークを追加しました: ${line + 1}行目`);
    }
    async addBookmarkFromCommand() {
        await this.addBookmark();
    }
    async addFavoriteFromEditor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('開いているファイルがありません');
            return;
        }
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('ワークスペースが開かれていません');
            return;
        }
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const description = await vscode.window.showInputBox({
            prompt: 'ファイルの説明を入力してください',
            placeHolder: '例: Entry point',
        });
        if (description === undefined)
            return;
        await this.addFavorite(relativePath, description);
    }
    async addFavoriteFromCommand() {
        await this.addFavoriteFromEditor();
    }
    async addBookmarkManual(filePath, lineStr, label, iconType) {
        if (!filePath.trim() || !lineStr.trim() || !label.trim()) {
            vscode.window.showErrorMessage('すべての項目を入力してください');
            return;
        }
        const line = parseInt(lineStr) - 1;
        if (isNaN(line) || line < 0) {
            vscode.window.showErrorMessage('正しい行番号を入力してください');
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
        bookmarks[filePath].push({ line, label, iconType: iconType || 'default' });
        this.saveBookmarks(bookmarks);
        this.refresh();
        const editor = vscode.window.activeTextEditor;
        if (editor && vscode.workspace.asRelativePath(editor.document.uri) === filePath && this.decorationTypes) {
            this.updateDecorations(editor);
        }
        vscode.window.showInformationMessage(`ブックマークを追加しました: ${filePath}:${line + 1}`);
    }
    async editBookmark(filePath, oldLine, newLineStr, label, iconType) {
        const newLine = parseInt(newLineStr) - 1;
        if (isNaN(newLine) || newLine < 0) {
            vscode.window.showErrorMessage('正しい行番号を入力してください');
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
        vscode.window.showInformationMessage(`ブックマークを更新しました`);
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
        if (this._view) {
            this._view.webview.postMessage({
                command: 'update',
                favorites: this.context.globalState.get('favorites', {}),
                bookmarks: this.loadBookmarks(),
            });
        }
    }
}
exports.CodeAnchorProvider = CodeAnchorProvider;
//# sourceMappingURL=codeAnchorProvider.js.map