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
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))]
    };

    webviewView.webview.html = this.getHtmlContent();

    // リソースパスを送信
    const resourcePath = webviewView.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))
    ).toString();
    
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
          const resourcePath = webviewView.webview.asWebviewUri(
            vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))
          ).toString();
          
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

  private async addFavorite(filePath: string, description: string) {
    if (!filePath.trim()) {
      vscode.window.showErrorMessage('ファイルパスを入力してください');
      return;
    }

    const favorites = this.context.globalState.get<{ [key: string]: FavoriteFile }>('favorites', {});
    favorites[filePath] = { path: filePath, description };
    await this.context.globalState.update('favorites', favorites);

    this.refresh();
    vscode.window.showInformationMessage(`「${filePath}」を追加しました`);
  }

  private async editFavorite(oldPath: string, newPath: string, description: string) {
    const favorites = this.context.globalState.get<{ [key: string]: FavoriteFile }>('favorites', {});
    
    if (oldPath !== newPath) {
      delete favorites[oldPath];
    }
    
    favorites[newPath] = { path: newPath, description };
    await this.context.globalState.update('favorites', favorites);

    this.refresh();
    vscode.window.showInformationMessage(`「${newPath}」を更新しました`);
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
      vscode.window.showErrorMessage('ワークスペースが開かれていません');
      return;
    }

    const fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
    const uri = vscode.Uri.file(fullPath);

    try {
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document);
    } catch (error) {
      vscode.window.showErrorMessage(`ファイルを開けません: ${filePath}`);
    }
  }

  private async addBookmark() {
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

    const iconTypeItems = Object.entries(ICON_TYPE_LABELS).map(([value, label]) => ({
      label,
      value: value as BookmarkIconType
    }));

    const selectedIconType = await vscode.window.showQuickPick(iconTypeItems, {
      placeHolder: 'Select bookmark icon type',
    });

    if (!selectedIconType) return;

    const label = await vscode.window.showInputBox({
      prompt: 'ブックマークのラベルを入力してください',
      placeHolder: '例: TODO',
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

  private async addFavoriteFromEditor() {
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

    if (description === undefined) return;

    await this.addFavorite(relativePath, description);
  }

  async addFavoriteFromCommand() {
    await this.addFavoriteFromEditor();
  }

  private async addBookmarkManual(filePath: string, lineStr: string, label: string, iconType?: string) {
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
    let bookmarks: BookmarksData = {};

    if (fs.existsSync(bookmarksPath)) {
      const content = fs.readFileSync(bookmarksPath, 'utf-8');
      bookmarks = JSON.parse(content);
    }

    if (!bookmarks[filePath]) {
      bookmarks[filePath] = [];
    }

    bookmarks[filePath].push({ line, label, iconType: (iconType as any) || 'default' });
    
    this.saveBookmarks(bookmarks);
    this.refresh();
    
    const editor = vscode.window.activeTextEditor;
    if (editor && vscode.workspace.asRelativePath(editor.document.uri) === filePath && this.decorationTypes) {
      this.updateDecorations(editor);
    }
    
    vscode.window.showInformationMessage(`ブックマークを追加しました: ${filePath}:${line + 1}`);
  }

  private async editBookmark(filePath: string, oldLine: number, newLineStr: string, label: string, iconType?: string) {
    const newLine = parseInt(newLineStr) - 1;
    if (isNaN(newLine) || newLine < 0) {
      vscode.window.showErrorMessage('正しい行番号を入力してください');
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
    
    vscode.window.showInformationMessage(`ブックマークを更新しました`);
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
    if (this._view) {
      this._view.webview.postMessage({
        command: 'update',
        favorites: this.context.globalState.get('favorites', {}),
        bookmarks: this.loadBookmarks(),
      });
    }
  }
}