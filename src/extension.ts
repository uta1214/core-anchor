import * as vscode from 'vscode';
import * as path from 'path';
import { CodeAnchorProvider } from './codeAnchorProvider';
import { BookmarkIconType } from './types';

// 各アイコンタイプのデコレーション
const decorationTypes: Map<BookmarkIconType, vscode.TextEditorDecorationType> = new Map();

export function activate(context: vscode.ExtensionContext) {
  const provider = new CodeAnchorProvider(context);

  // 各アイコンタイプのデコレーションを作成
  const iconTypes: BookmarkIconType[] = ['default', 'todo', 'bug', 'note', 'important', 'question'];
  
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

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('code-anchor.mainView', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.refresh', () => {
      provider.refresh();
    })
  );

  // ブックマーク追加コマンド（引数なしに変更）
  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.addBookmark', async () => {
      await provider.addBookmarkFromCommand();
    })
  );

  // お気に入り追加コマンドを追加
  context.subscriptions.push(
    vscode.commands.registerCommand('code-anchor.addFavorite', async () => {
      await provider.addFavoriteFromCommand();
    })
  );

  // アクティブエディタ変更時にデコレーションを更新
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        provider.updateDecorations(editor);
      }
    })
  );

  // 初期デコレーション適用
  if (vscode.window.activeTextEditor) {
    provider.updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {}