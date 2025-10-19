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
const codeAnchorProvider_1 = require("./codeAnchorProvider");
const decorationTypes = new Map();
// カスタムアイコンパスを取得する関数
function getIconPath(context, iconType) {
    const config = vscode.workspace.getConfiguration('code-anchor');
    let customPath = config.get(`icons.${iconType}`);
    console.log(`Getting icon path for ${iconType}:`, customPath);
    // カスタムパスが設定されていて、ファイルが存在する場合はそれを使用
    if (customPath && customPath.trim() !== '') {
        // 引用符を除去
        customPath = customPath.trim().replace(/^["']|["']$/g, '');
        let absolutePath = customPath;
        // 相対パスの場合、ワークスペースフォルダからの相対パスとして解決
        if (!path.isAbsolute(customPath)) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                absolutePath = path.join(workspaceFolders[0].uri.fsPath, customPath);
            }
        }
        console.log(`Resolved absolute path for ${iconType}:`, absolutePath);
        // ファイルが存在するか確認
        if (fs.existsSync(absolutePath)) {
            console.log(`Custom icon found for ${iconType}:`, absolutePath);
            return absolutePath;
        }
        else {
            console.log(`Custom icon not found for ${iconType} at path: ${absolutePath}, falling back to default`);
        }
    }
    // デフォルトのアイコンを使用
    const defaultPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
    console.log(`Using default icon for ${iconType}:`, defaultPath);
    return defaultPath;
}
// デコレーションタイプを更新する関数
function updateDecorationTypes(context, provider) {
    console.log('Updating decoration types...');
    // 既存のデコレーションを破棄
    decorationTypes.forEach(decoration => decoration.dispose());
    decorationTypes.clear();
    // 各アイコンタイプのデコレーションを作成
    const iconTypes = ['default', 'todo', 'bug', 'note', 'important', 'question'];
    iconTypes.forEach(iconType => {
        const iconPath = getIconPath(context, iconType);
        const decorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: vscode.Uri.file(iconPath),
            gutterIconSize: 'contain',
        });
        decorationTypes.set(iconType, decorationType);
        console.log(`Created decoration for ${iconType} with icon:`, iconPath);
    });
    // プロバイダーにデコレーションタイプを設定
    provider.setDecorationTypes(decorationTypes);
    // 現在のエディタのデコレーションを更新
    if (vscode.window.activeTextEditor) {
        provider.updateDecorations(vscode.window.activeTextEditor);
    }
    console.log('Decoration types updated successfully');
}
function activate(context) {
    console.log('Code Anchor extension is activating...');
    const provider = new codeAnchorProvider_1.CodeAnchorProvider(context);
    // 初期デコレーション設定
    updateDecorationTypes(context, provider);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('code-anchor.mainView', provider));
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.refresh', () => {
        console.log('Refresh command executed');
        provider.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.addBookmark', async () => {
        console.log('Add bookmark command executed');
        await provider.addBookmarkFromCommand();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('code-anchor.addFavorite', async () => {
        console.log('Add favorite command executed');
        await provider.addFavoriteFromCommand();
    }));
    // アクティブエディタ変更時にデコレーションを更新
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            console.log('Active editor changed:', editor.document.fileName);
            provider.updateDecorations(editor);
        }
    }));
    // 設定変更時にデコレーションを再作成
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        // code-anchor.icons の設定が変更された場合
        if (e.affectsConfiguration('code-anchor.icons')) {
            console.log('Icon configuration changed, updating decorations...');
            updateDecorationTypes(context, provider);
            // Webviewも更新
            provider.refresh();
        }
    }));
    // 初期デコレーション適用
    if (vscode.window.activeTextEditor) {
        provider.updateDecorations(vscode.window.activeTextEditor);
    }
    console.log('Code Anchor extension activated successfully');
}
function deactivate() {
    console.log('Code Anchor extension is deactivating...');
    // デコレーションタイプを破棄
    decorationTypes.forEach(decoration => decoration.dispose());
    decorationTypes.clear();
}
//# sourceMappingURL=extension.js.map