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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const coreAnchorProvider_1 = require("./coreAnchorProvider");
const decorationTypes = new Map();
// カスタムアイコンパスを取得する関数
function getIconPath(context, iconType) {
    const config = vscode.workspace.getConfiguration('core-anchor');
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
        else {
        }
    }
    const defaultPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
    return defaultPath;
}
// デコレーションタイプを更新する関数
function updateDecorationTypes(context, provider) {
    decorationTypes.forEach(decoration => decoration.dispose());
    decorationTypes.clear();
    const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question', 'all'];
    iconTypes.forEach(iconType => {
        const iconPath = getIconPath(context, iconType);
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.file(iconPath),
            gutterIconSize: 'contain',
        });
        decorationTypes.set(iconType, decorationType);
    });
    provider.setDecorationTypes(decorationTypes);
    if (vscode.window.activeTextEditor) {
        provider.updateDecorations(vscode.window.activeTextEditor);
    }
}
// ブックマークファイルのパスを取得
function getBookmarksPath() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders)
        return '';
    const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
    if (!fs.existsSync(vscodeFolder)) {
        fs.mkdirSync(vscodeFolder);
    }
    return path.join(vscodeFolder, 'bookmarks.json');
}
// ブックマークを読み込む
function loadBookmarks() {
    const bookmarksPath = getBookmarksPath();
    if (!fs.existsSync(bookmarksPath))
        return {};
    try {
        const content = fs.readFileSync(bookmarksPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        console.error('Error loading bookmarks:', error);
        return {};
    }
}
// ブックマークを保存する
function saveBookmarks(bookmarks) {
    const bookmarksPath = getBookmarksPath();
    try {
        fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2));
    }
    catch (error) {
        console.error('Error saving bookmarks:', error);
    }
}
function activate(context) {
    const provider = new coreAnchorProvider_1.CoreAnchorProvider(context);
    updateDecorationTypes(context, provider);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('core-anchor.mainView', provider));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.refresh', () => {
        provider.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.addBookmark', async () => {
        await provider.addBookmarkFromCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.addFavorite', async () => {
        await provider.addFavoriteFromCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.moveBookmarkUp', async () => {
        await provider.moveBookmarkUp();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.moveBookmarkDown', async () => {
        await provider.moveBookmarkDown();
    }));
    // デバッグ用：手動でdecorationを更新
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.refreshDecorations', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            provider.updateDecorations(editor);
            vscode.window.showInformationMessage('Core Anchor: Decorations refreshed');
        }
        else {
            vscode.window.showWarningMessage('Core Anchor: No active editor');
        }
    }));
    // ショートカットでカーソル行のブックマーク情報を表示
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.showBookmarkAtCursor', () => {
        provider.showBookmarkAtCursor();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.goToPreviousBookmark', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const bookmarks = loadBookmarks();
        const fileBookmarks = bookmarks[relativePath] || [];
        if (fileBookmarks.length === 0) {
            vscode.window.showInformationMessage('No bookmarks in this file');
            return;
        }
        const currentLine = editor.selection.active.line;
        // 現在行より前のブックマークを探す（降順にソート）
        const previousBookmarks = fileBookmarks
            .filter(bm => bm.line < currentLine)
            .sort((a, b) => b.line - a.line);
        let targetBookmark;
        if (previousBookmarks.length > 0) {
            targetBookmark = previousBookmarks[0];
        }
        else {
            // 前のブックマークがない場合は最後のブックマークにループ
            targetBookmark = fileBookmarks.sort((a, b) => b.line - a.line)[0];
        }
        // ブックマークにジャンプ
        const position = new vscode.Position(targetBookmark.line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        vscode.window.showInformationMessage(`Bookmark: ${targetBookmark.label || 'Line ' + (targetBookmark.line + 1)}`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('core-anchor.goToNextBookmark', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
        const bookmarks = loadBookmarks();
        const fileBookmarks = bookmarks[relativePath] || [];
        if (fileBookmarks.length === 0) {
            vscode.window.showInformationMessage('No bookmarks in this file');
            return;
        }
        const currentLine = editor.selection.active.line;
        // 現在行より後のブックマークを探す（昇順にソート）
        const nextBookmarks = fileBookmarks
            .filter(bm => bm.line > currentLine)
            .sort((a, b) => a.line - b.line);
        let targetBookmark;
        if (nextBookmarks.length > 0) {
            targetBookmark = nextBookmarks[0];
        }
        else {
            // 次のブックマークがない場合は最初のブックマークにループ
            targetBookmark = fileBookmarks.sort((a, b) => a.line - b.line)[0];
        }
        // ブックマークにジャンプ
        const position = new vscode.Position(targetBookmark.line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        vscode.window.showInformationMessage(`Bookmark: ${targetBookmark.label || 'Line ' + (targetBookmark.line + 1)}`);
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            provider.updateDecorations(editor);
        }
    }));
    // ドキュメント変更時にブックマークの行番号を調整（改行時のみ）
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document !== editor.document)
            return;
        const relativePath = vscode.workspace.asRelativePath(event.document.uri);
        const bookmarks = loadBookmarks();
        if (!bookmarks[relativePath] || bookmarks[relativePath].length === 0)
            return;
        let needsUpdate = false;
        let totalLineDiff = 0;
        let minAffectedLine = Infinity;
        let maxDeletedLine = -1;
        let hasLineStartChange = false;
        let lineStartChangeLine = -1;
        let isLineJoin = false; // 行結合かどうか
        // 全ての変更を解析
        for (const change of event.contentChanges) {
            const startLine = change.range.start.line;
            const endLine = change.range.end.line;
            const startChar = change.range.start.character;
            const endChar = change.range.end.character;
            const newText = change.text;
            const newLineCount = newText.split('\n').length - 1;
            const deletedLineCount = endLine - startLine;
            const lineDiff = newLineCount - deletedLineCount;
            if (lineDiff !== 0) {
                totalLineDiff += lineDiff;
                minAffectedLine = Math.min(minAffectedLine, startLine);
                if (lineDiff > 0) {
                    // 行が追加された場合（改行）
                    if (startChar === 0) {
                        hasLineStartChange = true;
                        lineStartChangeLine = startLine;
                    }
                }
                else if (lineDiff < 0) {
                    // 行が削除された場合
                    maxDeletedLine = Math.max(maxDeletedLine, endLine);
                    // 行結合の検知: endLine行の先頭（文字位置0）から削除が始まっている
                    // これはBackspaceで前の行と結合するケース
                    if (endLine > startLine && endChar === 0 && newText === '') {
                        isLineJoin = true;
                    }
                }
            }
        }
        // ブックマークを調整
        if (totalLineDiff !== 0) {
            // 削除範囲内のブックマークを除外（ただし行結合の場合は除く）
            if (totalLineDiff < 0 && maxDeletedLine >= 0 && !isLineJoin) {
                const originalLength = bookmarks[relativePath].length;
                bookmarks[relativePath] = bookmarks[relativePath].filter(bookmark => {
                    // minAffectedLineより前は残す
                    if (bookmark.line < minAffectedLine)
                        return true;
                    // maxDeletedLineより後ろは残す（後で行番号調整）
                    if (bookmark.line > maxDeletedLine)
                        return true;
                    // 削除範囲内は削除
                    return false;
                });
                if (bookmarks[relativePath].length !== originalLength) {
                    needsUpdate = true;
                }
            }
            // 残ったブックマークの行番号を調整
            for (const bookmark of bookmarks[relativePath]) {
                if (hasLineStartChange && bookmark.line === lineStartChangeLine) {
                    // ブックマーク行の先頭で改行 → ブックマークを移動
                    bookmark.line += totalLineDiff;
                    needsUpdate = true;
                }
                else if (bookmark.line > minAffectedLine) {
                    // それ以降の行のブックマークも移動
                    bookmark.line += totalLineDiff;
                    needsUpdate = true;
                }
            }
        }
        if (needsUpdate) {
            saveBookmarks(bookmarks);
            provider.updateDecorations(editor);
            provider.refresh();
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('core-anchor.icons')) {
            updateDecorationTypes(context, provider);
            provider.refresh();
        }
        if (e.affectsConfiguration('core-anchor.ui.theme')) {
            provider.reloadWebview();
        }
        if (e.affectsConfiguration('core-anchor.ui.showFavorites') ||
            e.affectsConfiguration('core-anchor.ui.showBookmarks')) {
            provider.reloadWebview();
        }
    }));
    // 初期化完了後、既に開いているエディタにデコレーションを適用
    // decorationTypesが設定された後に実行されることを保証
    if (vscode.window.activeTextEditor) {
        provider.updateDecorations(vscode.window.activeTextEditor);
    }
}
function deactivate() {
    decorationTypes.forEach(decoration => decoration.dispose());
    decorationTypes.clear();
}
//# sourceMappingURL=extension.js.map