import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function getHtmlContent(): string {
  const htmlPath = path.join(__dirname, 'template.html');
  const uiJsPath = path.join(__dirname, 'scripts', 'ui.js');
  const favoritesJsPath = path.join(__dirname, 'scripts', 'favorites.js');
  const bookmarksJsPath = path.join(__dirname, 'scripts', 'bookmarks.js');
  const mainJsPath = path.join(__dirname, 'scripts', 'main.js');

  // テーマ設定を取得
  const config = vscode.workspace.getConfiguration('core-anchor');
  const theme = config.get<string>('ui.theme', 'classic');
  
  // テーマに応じたCSSファイルを選択
  const cssFileName = `styles-${theme}.css`;
  const cssPath = path.join(__dirname, cssFileName);

  const html = fs.readFileSync(htmlPath, 'utf-8');
  const css = fs.readFileSync(cssPath, 'utf-8');
  const uiJs = fs.readFileSync(uiJsPath, 'utf-8');
  const favoritesJs = fs.readFileSync(favoritesJsPath, 'utf-8');
  const bookmarksJs = fs.readFileSync(bookmarksJsPath, 'utf-8');
  const mainJs = fs.readFileSync(mainJsPath, 'utf-8');

  return html
    .replace('<!-- CSS_PLACEHOLDER -->', `<style>${css}</style>`)
    .replace('<!-- SCRIPT_PLACEHOLDER -->', `
      <script>
        ${uiJs}
        ${mainJs}
        ${favoritesJs}
        ${bookmarksJs}
      </script>
  `);
}