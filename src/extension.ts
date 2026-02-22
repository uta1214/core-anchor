import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CoreAnchorProvider } from './coreAnchorProvider';
import { BookmarkIconType, BookmarksData } from './types';

const decorationTypes: Map<BookmarkIconType, vscode.TextEditorDecorationType> = new Map();

// カスタムアイコンパスを取得する関数
function getIconPath(context: vscode.ExtensionContext, iconType: BookmarkIconType): string {
  const config = vscode.workspace.getConfiguration('core-anchor');
  let customPath = config.get<string>(`icons.${iconType}`);
  
  
  
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
    } else {
      
    }
  }
  
  const defaultPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
  
  return defaultPath;
}

// デコレーションタイプを更新する関数
function updateDecorationTypes(context: vscode.ExtensionContext, provider: CoreAnchorProvider) {
  
  
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
  
  const iconTypes: BookmarkIconType[] = ['default', 'todo', 'bug', 'note', 'important', 'question', 'all'];
  
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
function getBookmarksPath(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return '';
  
  const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
  if (!fs.existsSync(vscodeFolder)) {
    fs.mkdirSync(vscodeFolder);
  }
  
  return path.join(vscodeFolder, 'bookmarks.json');
}

// ブックマークを読み込む
function loadBookmarks(): BookmarksData {
  const bookmarksPath = getBookmarksPath();
  if (!fs.existsSync(bookmarksPath)) return {};
  
  try {
    const content = fs.readFileSync(bookmarksPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return {};
  }
}

// ブックマークを保存する
function saveBookmarks(bookmarks: BookmarksData) {
  const bookmarksPath = getBookmarksPath();
  try {
    fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
}

export function activate(context: vscode.ExtensionContext) {
  
  
  const provider = new CoreAnchorProvider(context);

  updateDecorationTypes(context, provider);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('core-anchor.mainView', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.refresh', () => {
      
      provider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.addBookmark', async () => {
      
      await provider.addBookmarkFromCommand();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.addFavorite', async () => {
      
      await provider.addFavoriteFromCommand();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.moveBookmarkUp', async () => {
      
      await provider.moveBookmarkUp();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.moveBookmarkDown', async () => {
      
      await provider.moveBookmarkDown();
    })
  );

  // デバッグ用：手動でdecorationを更新
  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.refreshDecorations', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        provider.updateDecorations(editor);
        vscode.window.showInformationMessage('Core Anchor: Decorations refreshed');
      } else {
        vscode.window.showWarningMessage('Core Anchor: No active editor');
      }
    })
  );

  // ショートカットでカーソル行のブックマーク情報を表示
  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.showBookmarkAtCursor', () => {
      provider.showBookmarkAtCursor();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.goToPreviousBookmark', () => {
      console.log('[Core Anchor] Go to previous bookmark command');
      
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
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
      } else {
        // 前のブックマークがない場合は最後のブックマークにループ
        targetBookmark = fileBookmarks.sort((a, b) => b.line - a.line)[0];
      }
      
      console.log('[Core Anchor] Jump to previous bookmark:', { 
        currentLine, 
        targetLine: targetBookmark.line, 
        label: targetBookmark.label 
      });
      
      // ブックマークにジャンプ
      const position = new vscode.Position(targetBookmark.line, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
      
      // ハイライト
      provider.highlightBookmark(relativePath, targetBookmark.line);
      
      vscode.window.showInformationMessage(`Bookmark: ${targetBookmark.label || 'Line ' + (targetBookmark.line + 1)}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('core-anchor.goToNextBookmark', () => {
      console.log('[Core Anchor] Go to next bookmark command');
      
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      
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
      } else {
        // 次のブックマークがない場合は最初のブックマークにループ
        targetBookmark = fileBookmarks.sort((a, b) => a.line - b.line)[0];
      }
      
      console.log('[Core Anchor] Jump to next bookmark:', { 
        currentLine, 
        targetLine: targetBookmark.line, 
        label: targetBookmark.label 
      });
      
      // ブックマークにジャンプ
      const position = new vscode.Position(targetBookmark.line, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
      
      // ハイライト
      provider.highlightBookmark(relativePath, targetBookmark.line);
      
      vscode.window.showInformationMessage(`Bookmark: ${targetBookmark.label || 'Line ' + (targetBookmark.line + 1)}`);
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        provider.updateDecorations(editor);
      }
    })
  );

  // ドキュメント変更時にブックマークの行番号を調整
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || event.document !== editor.document) return;
      
      const relativePath = vscode.workspace.asRelativePath(event.document.uri);
      const bookmarks = loadBookmarks();
      
      if (!bookmarks[relativePath] || bookmarks[relativePath].length === 0) return;
      
      let needsUpdate = false;

      // -----------------------------------------------------------------------
      // 各 contentChange を「下から上の順」で独立処理する。
      //
      // 【なぜ下から上か】
      //   下の変更を先に処理してもブックマーク配列の行番号は上の変更に
      //   無関係に更新できる。逆順にすることで「複数 change の合算」が
      //   不要になり、Find & Replace / マルチカーソル / Git revert hunk など
      //   複数 change が同時に届くケースを正確に処理できる。
      //
      // 【旧実装の問題点】
      //   totalLineDiff を全 change で合算していたため、
      //   複数 change の間にあるブックマークが誤ったシフト量で動いていた。
      //   また "net lineDiff >= 0" のとき削除フィルターをスキップしていたため、
      //   「3行選択して5行ペースト」のような操作で選択範囲内のブックマークが
      //   消えずに残るバグがあった。
      // -----------------------------------------------------------------------
      const sortedChanges = [...event.contentChanges].sort(
        (a, b) => b.range.start.line - a.range.start.line
      );

      for (const change of sortedChanges) {
        const startLine  = change.range.start.line;
        const endLine    = change.range.end.line;
        const startChar  = change.range.start.character;
        const endChar    = change.range.end.character;
        const newText    = change.text;

        // 挿入テキストに含まれる改行数
        const newLineCount    = newText.split('\n').length - 1;
        // 選択範囲がまたぐ行数（同一行なら 0）
        const deletedLineCount = endLine - startLine;
        // 正: 行が増える / 負: 行が減る / 0: 変化なし
        const lineDiff = newLineCount - deletedLineCount;

        // ── ① 複数行削除がある場合: 削除範囲内のブックマークを除去 ──────────
        // lineDiff の正負に関わらず、複数行にまたがる変更があれば
        // その範囲内のブックマークは対象コードが消えているので削除する。
        if (deletedLineCount > 0) {
          // endChar === 0 のとき endLine は「次の行の先頭」を指しているだけで
          // endLine 自体の内容は残る。実際に消える最終行は endLine - 1。
          // 例) Ctrl+Shift+K で5行目を削除 → start:(5,0) end:(6,0)
          //     → 実際に消えるのは5行目だけ。6行目は残る。
          const effectiveEndLine = endChar === 0 ? endLine - 1 : endLine;

          // 行結合 (Backspace / Delete) の判定:
          //   ・Backspace で行 N を行 N-1 に結合 → start:(N-1, len>0) end:(N, 0)
          //   ・Delete   で行 N を行 N+1 に結合 → start:(N, len>0) end:(N+1, 0)
          //   どちらも "前の行の途中から削除が始まり (startChar > 0)、
          //   次の行の先頭で終わる (endChar === 0)" という形。
          //   この場合は行そのものが消えるのではなく内容が合流するだけなので
          //   ブックマークを削除しない（後の shift で位置を調整する）。
          //   Ctrl+Shift+K は startChar === 0 なので行結合ではない。
          const isLineJoin =
            endChar === 0 && startChar > 0 && newText === '';

          if (!isLineJoin) {
            const before = bookmarks[relativePath].length;
            bookmarks[relativePath] = bookmarks[relativePath].filter(bm => {
              if (bm.line < startLine)        return true; // 変更より上: 保持
              // startChar > 0 のとき startLine 自体の先頭部分は消えていない。
              // 例) start(5,5) end(7,8) → 5行目の先頭5文字は残る → bm.line===5 は保持。
              if (bm.line === startLine && startChar > 0) return true;
              if (bm.line > effectiveEndLine) return true; // 変更より下: 保持（後でシフト）
              return false;                                 // 削除範囲内: 除去
            });
            if (bookmarks[relativePath].length !== before) {
              needsUpdate = true;
            }
          }
        }

        // ── ② 行数が変化した場合: 変更より下にあるブックマークをシフト ────
        if (lineDiff !== 0) {
          // シフト基準行の計算:
          //   削除がある場合 → 削除が終わった行 (effectiveEndLine) より後をシフト
          //   削除がない場合 → 挿入開始行 (startLine) より後（または同行）をシフト
          const effectiveEndForShift =
            deletedLineCount > 0
              ? (endChar === 0 ? endLine - 1 : endLine)
              : startLine;

          // 行の先頭 (startChar === 0) に純粋に行が挿入された場合:
          //   その行自体のブックマークも下に追い出す必要がある。
          //   例) 5行目の先頭で Enter → 5行目のブックマークは6行目へ。
          //   ただし選択範囲がある場合（deletedLineCount > 0）は
          //   その行の内容が置き換わっているので追い出し不要（①で除去済み）。
          const pushCurrentLine = startChar === 0 && deletedLineCount === 0;

          for (const bm of bookmarks[relativePath]) {
            if (pushCurrentLine && bm.line === startLine) {
              // ブックマーク行の先頭への挿入 → ブックマークも押し下げる
              bm.line += lineDiff;
              needsUpdate = true;
            } else if (bm.line > effectiveEndForShift) {
              // 変更より後ろの行は全てシフト
              bm.line += lineDiff;
              needsUpdate = true;
            }
          }
        }
      }

      if (needsUpdate) {
        saveBookmarks(bookmarks);
        provider.updateDecorations(editor);
        provider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
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
    })
  );

  // 初期化完了後、既に開いているエディタにデコレーションを適用
  // decorationTypesが設定された後に実行されることを保証
  if (vscode.window.activeTextEditor) {
    provider.updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {
  
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
}