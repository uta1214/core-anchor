import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CodeAnchorProvider } from './codeAnchorProvider';
import { BookmarkIconType } from './types';

const decorationTypes: Map<BookmarkIconType, vscode.TextEditorDecorationType> = new Map();

// カスタムアイコンパスを取得する関数
function getIconPath(context: vscode.ExtensionContext, iconType: BookmarkIconType): string {
  const config = vscode.workspace.getConfiguration('code-anchor');
  let customPath = config.get<string>(`icons.${iconType}`);
  
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
    } else {
      console.log(`Custom icon not found for ${iconType} at path: ${absolutePath}, falling back to default`);
    }
  }
  
  // デフォルトのアイコンを使用
  const defaultPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
  console.log(`Using default icon for ${iconType}:`, defaultPath);
  return defaultPath;
}

// デコレーションタイプを更新する関数
function updateDecorationTypes(context: vscode.ExtensionContext, provider: CodeAnchorProvider) {
  console.log('Updating decoration types...');
  
  // 既存のデコレーションを破棄
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
  
  // 各アイコンタイプのデコレーションを作成
  const iconTypes: BookmarkIconType[] = ['default', 'todo', 'bug', 'note', 'important', 'question'];
  
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

export function activate(context: vscode.ExtensionContext) {
  console.log('Code Anchor extension is activating...');
  
  const provider = new CodeAnchorProvider(context);

  // 初期デコレーション設定
  updateDecorationTypes(context, provider);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('code-anchor.mainView', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.refresh', () => {
      console.log('Refresh command executed');
      provider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.addBookmark', async () => {
      console.log('Add bookmark command executed');
      await provider.addBookmarkFromCommand();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.addFavorite', async () => {
      console.log('Add favorite command executed');
      await provider.addFavoriteFromCommand();
    })
  );

  // アクティブエディタ変更時にデコレーションを更新
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        console.log('Active editor changed:', editor.document.fileName);
        provider.updateDecorations(editor);
      }
    })
  );

  // 設定変更時にデコレーションを再作成
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      // code-anchor.icons の設定が変更された場合
      if (e.affectsConfiguration('code-anchor.icons')) {
        console.log('Icon configuration changed, updating decorations...');
        updateDecorationTypes(context, provider);
        // Webviewも更新
        provider.refresh();
      }
    })
  );

  // 初期デコレーション適用
  if (vscode.window.activeTextEditor) {
    provider.updateDecorations(vscode.window.activeTextEditor);
  }
  
  console.log('Code Anchor extension activated successfully');
}

export function deactivate() {
  console.log('Code Anchor extension is deactivating...');
  // デコレーションタイプを破棄
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
}