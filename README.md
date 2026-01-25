# Code Anchor

A powerful VS Code extension for managing your favorite files and bookmarks with a beautiful, customizable interface.

お気に入りファイルとブックマークを管理するための強力なVS Code拡張機能。美しくカスタマイズ可能なインターフェース付き。

## Features / 機能

### 📁 Favorite Files / お気に入りファイル
- **Quick Add**: Instantly add the current file to favorites with `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`)
- **Hierarchical Display**: View files organized by folder structure with adjustable depth
- **Global & Local Modes**: Manage favorites globally or per workspace
- **Search & Filter**: Quickly find your favorite files

**クイック追加**: `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`) で現在のファイルを即座にお気に入りに追加  
**階層表示**: 調整可能な深さでフォルダ構造別にファイルを表示  
**グローバル & ローカルモード**: グローバルまたはワークスペースごとにお気に入りを管理  
**検索 & フィルター**: お気に入りファイルを素早く検索

### 🔖 Bookmarks / ブックマーク
- **Multiple Icon Types**: Default, TODO, Bug, Note, Important, Question
- **Gutter Icons**: Visual indicators in the editor gutter
- **Line Navigation**: Jump to bookmarked lines instantly
- **Move Up/Down**: Adjust bookmark positions with `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`)
- **Auto-Adjustment**: Bookmarks automatically adjust when code changes

**複数のアイコンタイプ**: デフォルト、TODO、バグ、メモ、重要、質問  
**ガターアイコン**: エディタのガターに視覚的なインジケータを表示  
**行ナビゲーション**: ブックマークした行に即座にジャンプ  
**上下移動**: `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`) でブックマーク位置を調整  
**自動調整**: コード変更時にブックマークが自動的に調整

### 🎨 4 Beautiful Themes / 4つの美しいテーマ
- **Classic**: Original, simple design / オリジナルのシンプルなデザイン
- **Modern**: Compact and clean / コンパクトでクリーン
- **Soft**: Gentle gradients and soft colors / やわらかいグラデーションと柔らかい色
- **Pop**: Colorful and vibrant / カラフルで華やか

### 📱 Responsive Design / レスポンシブデザイン
- Automatically adjusts to sidebar width
- Font sizes and spacing optimize for narrow sidebars
- Elements hide gracefully when space is limited

サイドバーの幅に自動調整  
フォントサイズと余白が狭いサイドバーに最適化  
スペースが限られている場合、要素が適切に非表示

## Installation / インストール

1. Open VS Code / VS Codeを開く
2. Press `Ctrl+P` (Mac: `Cmd+P`) / `Ctrl+P` (Mac: `Cmd+P`) を押す
3. Type `ext install code-anchor` / `ext install code-anchor` と入力
4. Press Enter / Enterを押す

Or search for "Code Anchor" in the Extensions view (`Ctrl+Shift+X` / Mac: `Cmd+Shift+X`).

または拡張機能ビュー (`Ctrl+Shift+X` / Mac: `Cmd+Shift+X`) で「Code Anchor」を検索。

## Usage / 使い方

### Adding Favorites / お気に入りの追加
1. Open a file you want to add to favorites / お気に入りに追加したいファイルを開く
2. Press `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`) OR right-click and select "Code Anchor: Add to Favorites"
3. Enter an optional description / オプションで説明を入力

### Adding Bookmarks / ブックマークの追加
1. Place cursor on the line you want to bookmark / ブックマークしたい行にカーソルを置く
2. Press `Ctrl+Alt+B` (Mac: `Cmd+Alt+B`) OR right-click and select "Code Anchor: Add Bookmark"
3. Select bookmark type (Default, TODO, Bug, etc.) / ブックマークタイプを選択（デフォルト、TODO、バグなど）
4. Enter a label / ラベルを入力

### Keyboard Shortcuts / キーボードショートカット

| Command / コマンド | Windows/Linux | Mac |
|---|---|---|
| Add Bookmark / ブックマークを追加 | `Ctrl+Alt+B` | `Cmd+Alt+B` |
| Add Favorite / お気に入りに追加 | `Ctrl+Alt+F` | `Cmd+Alt+F` |
| Move Bookmark Up / ブックマークを上に移動 | `Ctrl+Alt+Up` | `Cmd+Alt+Up` |
| Move Bookmark Down / ブックマークを下に移動 | `Ctrl+Alt+Down` | `Cmd+Alt+Down` |

## Configuration / 設定

### UI Theme / UIテーマ
Change the appearance of Code Anchor sidebar:

Code Anchorサイドバーの外観を変更：

```json
{
  "code-anchor.ui.theme": "modern"  // "classic", "modern", "soft", "pop"
}
```

### Section Visibility / セクションの表示
Show or hide specific sections:

特定のセクションの表示/非表示：

```json
{
  "code-anchor.ui.showFavorites": true,  // Show Favorites section / お気に入りセクションを表示
  "code-anchor.ui.showBookmarks": true   // Show Bookmarks section / ブックマークセクションを表示
}
```

### Custom Icons / カスタムアイコン
Use your own icons for bookmarks:

ブックマーク用に独自のアイコンを使用：

```json
{
  "code-anchor.icons.todo": "path/to/your/icon.png",
  "code-anchor.icons.bug": "path/to/bug-icon.png"
}
```

Paths can be absolute or relative to workspace root.

パスは絶対パスまたはワークスペースルートからの相対パスを指定できます。

### Folder Depth / フォルダ階層の深さ
Adjust how many folder levels to display:

表示するフォルダ階層の深さを調整：

- Use the `+` and `-` buttons in the Favorites section header
- お気に入りセクションのヘッダーにある `+` と `-` ボタンを使用

## Data Storage / データ保存

### Favorites / お気に入り
- **Global**: `~/.vscode/code-anchor-favorites.json`
- **Local**: `.vscode/favorites.json` (in workspace)

### Bookmarks / ブックマーク
- **Local only**: `.vscode/bookmarks.json` (in workspace)

## Tips / ヒント

### For Narrow Sidebars / 狭いサイドバーの場合
The UI automatically adapts to sidebar width:
- **280px or less**: Smaller fonts and compact spacing
- **220px or less**: Hides counts and descriptions
- **180px or less**: Ultra-compact mode

UIはサイドバーの幅に自動的に適応します：
- **280px以下**: フォントが小さくなり、間隔がコンパクトに
- **220px以下**: カウントと説明が非表示
- **180px以下**: 超コンパクトモード

### Search Effectively / 効果的な検索
Search boxes support filtering by:
- File name / ファイル名
- Folder path / フォルダパス
- Description / 説明
- Bookmark label / ブックマークラベル

### Context Menus / コンテキストメニュー
Right-click on folders and files for quick actions:
- Sort by name or date / 名前または日付で並べ替え
- Delete all items / すべてのアイテムを削除
- And more / その他

フォルダとファイルを右クリックして素早くアクション：

## Troubleshooting / トラブルシューティング

### Bookmarks not showing / ブックマークが表示されない
1. Check if the file is in the current workspace / ファイルが現在のワークスペースにあるか確認
2. Reload VS Code window (`Ctrl+R` / Mac: `Cmd+R`) / VS Codeウィンドウをリロード
3. Check `.vscode/bookmarks.json` exists / `.vscode/bookmarks.json` が存在するか確認

### Icons not appearing / アイコンが表示されない
1. Verify icon paths are correct / アイコンパスが正しいか確認
2. Use absolute paths or paths relative to workspace root / 絶対パスまたはワークスペースルートからの相対パスを使用
3. Restart VS Code after changing icon settings / アイコン設定変更後、VS Codeを再起動

### Theme not changing / テーマが変わらない
1. Make sure you've compiled the extension: `npm run compile` / 拡張機能をコンパイル済みか確認
2. Reload VS Code window / VS Codeウィンドウをリロード
3. Check if all CSS files exist in `out/webview/` / すべてのCSSファイルが `out/webview/` に存在するか確認

## Contributing / コントリビューション

Contributions are welcome! Please feel free to submit issues and pull requests.

コントリビューション歓迎！issueやプルリクエストをお気軽に提出してください。

## License / ライセンス

MIT

## Support / サポート

If you encounter any problems or have suggestions, please file an issue on GitHub.

問題が発生した場合や提案がある場合は、GitHubでissueを作成してください。

---

by uta