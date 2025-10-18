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
const codeAnchorProvider_1 = require("./codeAnchorProvider");
// 各アイコンタイプのデコレーション
const decorationTypes = new Map();
function activate(context) {
    const provider = new codeAnchorProvider_1.CodeAnchorProvider(context);
    // 各アイコンタイプのデコレーションを作成
    const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question'];
    iconTypes.forEach(iconType => {
        const iconPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.file(iconPath),
            gutterIconSize: 'contain',
        });
        decorationTypes.set(iconType, decorationType);
    });
    // プロバイダーにデコレーションタイプを設定
    provider.setDecorationTypes(decorationTypes);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('code-anchor.mainView', provider));
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.refresh', () => {
        provider.refresh();
    }));
    // ブックマーク追加コマンド（引数なしに変更）
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.addBookmark', async () => {
        await provider.addBookmarkFromCommand();
    }));
    // お気に入り追加コマンドを追加
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.addFavorite', async () => {
        await provider.addFavoriteFromCommand();
    }));
    // アクティブエディタ変更時にデコレーションを更新
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            provider.updateDecorations(editor);
        }
    }));
    // 初期デコレーション適用
    if (vscode.window.activeTextEditor) {
        provider.updateDecorations(vscode.window.activeTextEditor);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map