import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FavoriteFile, Bookmark, BookmarksData, BookmarkIconType, ICON_TYPE_LABELS } from './types';
import { getHtmlContent } from './webviewContent';

export class CodeAnchorProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private decorationTypes?: Map<BookmarkIconType, vscode.TextEditorDecorationType>;

  constructor(private context: vscode.ExtensionContext) {}

  setDecorationTypes(decorationTypes: Map<BookmarkIconType, vscode.TextEditorDecorationType>) {
    this.decorationTypes = decorationTypes;
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log('Resolving webview view...');
    this._view = webviewView;

    // カスタムアイコンのディレクトリを取得
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
    } catch (error) {
      console.error('Error setting webview HTML:', error);
    }

    // アイコンパスを送信
    this.sendIconPaths(webviewView);

    // メッセージハンドラ
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
        case 'refresh':
          this.refresh();
          break;
        case 'ready':
          console.log('Webview ready, sending initial data');
          this.sendIconPaths(webviewView);
          this.refresh();
          break;
      }
    });

    this.refresh();
  }

  // カスタムアイコンのディレクトリを取得
  private getCustomIconDirectories(): vscode.Uri[] {
    const dirs = new Set<string>();
    const config = vscode.workspace.getConfiguration('code-anchor');
    const iconTypes: BookmarkIconType[] = ['default', 'todo', 'bug', 'note', 'important', 'question'];
    
    iconTypes.forEach(iconType => {
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
          const dir = path.dirname(absolutePath);
          dirs.add(dir);
        }
      }
    });
    
    return Array.from(dirs).map(dir => vscode.Uri.file(dir));
  }

  // アイコンパスを webview に送信
  private sendIconPaths(webviewView: vscode.WebviewView) {
    const iconTypes: BookmarkIconType[] = ['default', 'todo', 'bug', 'note', 'important', 'question'];
    const iconPaths: { [key: string]: string } = {};
    
    iconTypes.forEach(iconType => {
      const iconPath = this.getIconPath(iconType);
      try {
        const webviewUri = webviewView.webview.asWebviewUri(vscode.Uri.file(iconPath));
        iconPaths[iconType] = webviewUri.toString();
        console.log(`Icon path for ${iconType}: ${iconPath} -> ${iconPaths[iconType]}`);
      } catch (error) {
        console.error(`Error converting icon path for ${iconType}:`, error);
        // フォールバック：デフォルトアイコンを使用
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

  private async addFavorite(filePath: string, description: string) {
    if (!filePath.trim()) {
      vscode.window.showErrorMessage('File path is required');
      return;
    }

    const favorites = this.context.globalState.get<{ [key: string]: FavoriteFile }>('favorites', {});
    favorites[filePath] = { path: filePath, description };
    await this.context.globalState.update('favorites', favorites);

    this.refresh();
    vscode.window.showInformationMessage(`Added "${filePath}" to favorites`);
  }

  private async editFavorite(oldPath: string, newPath: string, description: string) {
    const favorites = this.context.globalState.get<{ [key: string]: FavoriteFile }>('favorites', {});
    
    if (oldPath !== newPath) {
      delete favorites[oldPath];
    }
    
    favorites[newPath] = { path: newPath, description };
    await this.context.globalState.update('favorites', favorites);

    this.refresh();
    vscode.window.showInformationMessage(`Updated "${newPath}"`);
  }

  private async removeFavorite(filePath: string) {
    const favorites = this.context.globalState.get<{ [key: string]: FavoriteFile }>('favorites', {});
    delete favorites[filePath];
    await this.context.globalState.update('favorites', favorites);
    this.refresh();
  }

  private async openFile(filePath: string) {
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
    } catch (error) {
      vscode.window.showErrorMessage(`Cannot open file: ${filePath}`);
    }
  }

  // カスタムアイコンパスを取得
  private getIconPath(iconType: BookmarkIconType): string {
    const config = vscode.workspace.getConfiguration('code-anchor');
    let customPath = config.get<string>(`icons.${iconType}`);
    
    if (customPath && customPath.trim() !== '') {
      // 引用符を除去
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

  private async addBookmark() {
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

    const iconTypeItems = Object.entries(ICON_TYPE_LABELS).map(([value, label]) => {
      const iconPath = this.getIconPath(value as BookmarkIconType);
      return {
        label,
        value: value as BookmarkIconType,
        iconPath: vscode.Uri.file(iconPath)
      };
    });

    const selectedIconType = await vscode.window.showQuickPick(iconTypeItems, {
      placeHolder: 'Select bookmark icon type',
    });

    if (!selectedIconType) return;

    const label = await vscode.window.showInputBox({
      prompt: 'Enter bookmark label',
      placeHolder: 'e.g. TODO',
    });

    if (label === undefined) return;

    const bookmarksPath = this.getBookmarksPath();
    let bookmarks: BookmarksData = {};

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

  private async addFavoriteFromEditor() {
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

    if (description === undefined) return;

    await this.addFavorite(relativePath, description);
  }

  async addFavoriteFromCommand() {
    await this.addFavoriteFromEditor();
  }

  private async addBookmarkManual(filePath: string, lineStr: string, label: string, iconType?: string) {
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
    let bookmarks: BookmarksData = {};

    if (fs.existsSync(bookmarksPath)) {
      const content = fs.readFileSync(bookmarksPath, 'utf-8');
      bookmarks = JSON.parse(content);
    }

    if (!bookmarks[filePath]) {
      bookmarks[filePath] = [];
    }

    // 同じ行に既存のブックマークがあれば削除（上書き）
    bookmarks[filePath] = bookmarks[filePath].filter(b => b.line !== line);

    bookmarks[filePath].push({ line, label: label || '', iconType: (iconType as any) || 'default' });
    
    this.saveBookmarks(bookmarks);
    this.refresh();
    
    const editor = vscode.window.activeTextEditor;
    if (editor && vscode.workspace.asRelativePath(editor.document.uri) === filePath && this.decorationTypes) {
      this.updateDecorations(editor);
    }
    
    vscode.window.showInformationMessage(`Bookmark added: ${filePath}:${line + 1}`);
  }

  private async editBookmark(filePath: string, oldLine: number, newLineStr: string, label: string, iconType?: string) {
    const newLine = parseInt(newLineStr) - 1;
    if (isNaN(newLine) || newLine < 0) {
      vscode.window.showErrorMessage('Invalid line number');
      return;
    }

    const bookmarksPath = this.getBookmarksPath();
    if (!fs.existsSync(bookmarksPath)) return;

    const content = fs.readFileSync(bookmarksPath, 'utf-8');
    const bookmarks: BookmarksData = JSON.parse(content);

    if (bookmarks[filePath]) {
      const index = bookmarks[filePath].findIndex(b => b.line === oldLine);
      if (index !== -1) {
        const currentIconType = bookmarks[filePath][index].iconType || 'default';
        bookmarks[filePath][index] = { 
          line: newLine, 
          label, 
          iconType: (iconType as any) || currentIconType 
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

  private async removeBookmark(filePath: string, line: number) {
    const bookmarksPath = this.getBookmarksPath();
    if (!fs.existsSync(bookmarksPath)) return;

    const content = fs.readFileSync(bookmarksPath, 'utf-8');
    const bookmarks: BookmarksData = JSON.parse(content);

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

  private async jumpToBookmark(filePath: string, line: number) {
    await this.openFile(filePath);
    
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = new vscode.Position(line, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }
  }

  private getBookmarksPath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return '';

    const vscodeFolder = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
    if (!fs.existsSync(vscodeFolder)) {
      fs.mkdirSync(vscodeFolder);
    }

    return path.join(vscodeFolder, 'bookmarks.json');
  }

  private saveBookmarks(bookmarks: BookmarksData) {
    const bookmarksPath = this.getBookmarksPath();
    fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2));
  }

  private loadBookmarks(): BookmarksData {
    const bookmarksPath = this.getBookmarksPath();
    if (!fs.existsSync(bookmarksPath)) return {};

    const content = fs.readFileSync(bookmarksPath, 'utf-8');
    return JSON.parse(content);
  }

  private getHtmlContent(): string {
    return getHtmlContent();
  }

  updateDecorations(editor: vscode.TextEditor) {
    if (!this.decorationTypes) return;

    const bookmarks = this.loadBookmarks();
    const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
    
    const decorationsByType: Map<BookmarkIconType, vscode.DecorationOptions[]> = new Map();
    
    if (bookmarks[relativePath]) {
      for (const bookmark of bookmarks[relativePath]) {
        const iconType = bookmark.iconType || 'default';
        const range = new vscode.Range(bookmark.line, 0, bookmark.line, 0);
        
        if (!decorationsByType.has(iconType)) {
          decorationsByType.set(iconType, []);
        }
        
        decorationsByType.get(iconType)!.push({
          range,
          hoverMessage: `${ICON_TYPE_LABELS[iconType]}: ${bookmark.label}`,
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
      const favorites = this.context.globalState.get('favorites', {});
      const bookmarks = this.loadBookmarks();
      
      console.log('Sending update to webview - favorites:', favorites, 'bookmarks:', bookmarks);
      
      this._view.webview.postMessage({
        command: 'update',
        favorites: favorites,
        bookmarks: bookmarks,
      });
    } else {
      console.log('Webview not initialized yet');
    }
  }
}