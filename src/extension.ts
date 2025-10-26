import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { CodeAnchorProvider } from './codeAnchorProvider';
import { BookmarkIconType, BookmarksData } from './types';

const decorationTypes: Map<BookmarkIconType, vscode.TextEditorDecorationType> = new Map();

// カスタムアイコンパスを取得する関数
function getIconPath(context: vscode.ExtensionContext, iconType: BookmarkIconType): string {
  const config = vscode.workspace.getConfiguration('code-anchor');
  let customPath = config.get<string>(`icons.${iconType}`);
  
  console.log(`Getting icon path for ${iconType}:`, customPath);
  
  if (customPath && customPath.trim() !== '') {
    customPath = customPath.trim().replace(/^["']|["']$/g, '');
    
    let absolutePath = customPath;
    
    if (!path.isAbsolute(customPath)) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders && workspaceFolders.length > 0) {
        absolutePath = path.join(workspaceFolders[0].uri.fsPath, customPath);
      }
    }
    
    console.log(`Resolved absolute path for ${iconType}:`, absolutePath);
    
    if (fs.existsSync(absolutePath)) {
      console.log(`Custom icon found for ${iconType}:`, absolutePath);
      return absolutePath;
    } else {
      console.log(`Custom icon not found for ${iconType} at path: ${absolutePath}, falling back to default`);
    }
  }
  
  const defaultPath = context.asAbsolutePath(path.join('resources', `bookmark-${iconType}.png`));
  console.log(`Using default icon for ${iconType}:`, defaultPath);
  return defaultPath;
}

// デコレーションタイプを更新する関数
function updateDecorationTypes(context: vscode.ExtensionContext, provider: CodeAnchorProvider) {
  console.log('Updating decoration types...');
  
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
  
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
  
  provider.setDecorationTypes(decorationTypes);
  
  if (vscode.window.activeTextEditor) {
    provider.updateDecorations(vscode.window.activeTextEditor);
  }
  
  console.log('Decoration types updated successfully');
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
  console.log('Code Anchor extension is activating...');
  
  const provider = new CodeAnchorProvider(context);

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

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        console.log('Active editor changed:', editor.document.fileName);
        provider.updateDecorations(editor);
      }
    })
  );

  // ドキュメント変更時にブックマークの行番号を調整（改行時のみ）
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || event.document !== editor.document) return;
      
      const relativePath = vscode.workspace.asRelativePath(event.document.uri);
      const bookmarks = loadBookmarks();
      
      if (!bookmarks[relativePath] || bookmarks[relativePath].length === 0) return;
      
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
          } else if (lineDiff < 0) {
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
            if (bookmark.line < minAffectedLine) return true;
            // maxDeletedLineより後ろは残す（後で行番号調整）
            if (bookmark.line > maxDeletedLine) return true;
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
          } else if (bookmark.line > minAffectedLine) {
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
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('code-anchor.icons')) {
        console.log('Icon configuration changed, updating decorations...');
        updateDecorationTypes(context, provider);
        provider.refresh();
      }
    })
  );

  if (vscode.window.activeTextEditor) {
    provider.updateDecorations(vscode.window.activeTextEditor);
  }
  
  console.log('Code Anchor extension activated successfully');
}

export function deactivate() {
  console.log('Code Anchor extension is deactivating...');
  decorationTypes.forEach(decoration => decoration.dispose());
  decorationTypes.clear();
}