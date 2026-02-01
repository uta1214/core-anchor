# Core Anchor

A powerful VS Code extension for managing your favorite files and bookmarks with a beautiful, customizable interface.

## Features

### 📁 Favorite Files
- **Quick Add**: Instantly add the current file to favorites with `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`)
- **Hierarchical Display**: View files organized by folder structure with adjustable depth
- **Global & Local Modes**: Manage favorites globally or per workspace
- **Search & Filter**: Quickly find your favorite files
- **File Type Icons**: Automatically displays icons based on file types

### 🔖 Bookmarks
- **Multiple Icon Types**: Default, TODO, Bug, Note, Important, Question
- **Gutter Icons**: Visual indicators in the editor gutter
- **Line Navigation**: Jump to bookmarked lines instantly
- **Move Up/Down**: Adjust bookmark positions with `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`)
- **Auto-Adjustment**: Bookmarks automatically adjust when code changes
- **Filtering**: Filter bookmarks by icon type

### 🎨 4 Beautiful Themes
- **Classic**: Original, simple design (Recommended)
- **Modern**: Compact and clean
- **Soft**: Gentle gradients and soft colors
- **Pop**: Colorful and vibrant

### 📱 Responsive Design
- Automatically adjusts to sidebar width
- Font sizes and spacing optimize for different sidebar widths
- Elements hide gracefully when space is limited

## Installation

1. Open VS Code
2. Press `Ctrl+P` (Mac: `Cmd+P`)
3. Type `ext install core-anchor`
4. Press Enter

Or search for "Core Anchor" in the Extensions view (`Ctrl+Shift+X` / Mac: `Cmd+Shift+X`).

## Usage

### Adding Favorites
1. Open a file you want to add to favorites
2. Press `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`) OR right-click and select "Core Anchor: Add to Favorites"
3. Enter an optional description

### Adding Bookmarks
1. Place cursor on the line you want to bookmark
2. Press `Ctrl+Alt+B` (Mac: `Cmd+Alt+B`) OR right-click and select "Core Anchor: Add Bookmark"
3. Select bookmark type (Default, TODO, Bug, etc.)
4. Enter a label

### Keyboard Shortcuts

| Command | Windows/Linux | Mac |
|---|---|---|
| Add Bookmark | `Ctrl+Alt+B` | `Cmd+Alt+B` |
| Add Favorite | `Ctrl+Alt+F` | `Cmd+Alt+F` |
| Move Bookmark Up | `Ctrl+Alt+Up` | `Cmd+Alt+Up` |
| Move Bookmark Down | `Ctrl+Alt+Down` | `Cmd+Alt+Down` |

## Configuration

### UI Theme
Change the appearance of Core Anchor sidebar. Options: `classic`, `modern`, `soft`, `pop`

### Section Visibility
Show or hide Favorites section or Bookmarks section independently.

### Custom Icons
Use your own icons for bookmarks. Paths can be absolute or relative to workspace root.

### Folder Depth
Adjust how many folder levels to display using the `+` and `-` buttons in the Favorites section header.

**Important**: This extension is designed for working across multiple repositories with similar file structures. Global favorites allow you to quickly access files with the same path structure across different projects. For example, if you have `src/components/Header.tsx` as a favorite, it will open that file in any repository that has the same path structure.

### Preview Mode
Control whether files open in preview mode or as pinned tabs.

## Data Storage

### Favorites
- **Global**: `~/.vscode/core-anchor-favorites.json`
- **Local**: `.vscode/favorites.json` (in workspace)

### Bookmarks
- **Local only**: `.vscode/bookmarks.json` (in workspace)

## Tips

### Search Effectively
Search boxes support filtering by:
- File name
- Folder path
- Description
- Bookmark label

### Context Menus
Right-click on folders and files for quick actions:
- Sort by name or date
- Delete all items
- And more

## Troubleshooting

### Bookmarks not showing
1. Check if the file is in the current workspace
2. Reload VS Code window (`Ctrl+R` / Mac: `Cmd+R`)
3. Check `.vscode/bookmarks.json` exists

### Icons not appearing
1. Verify icon paths are correct
2. Use absolute paths or paths relative to workspace root
3. Restart VS Code after changing icon settings

### Theme not changing
1. Make sure you've compiled the extension: `npm run compile`
2. Reload VS Code window
3. Check if all CSS files exist in `out/webview/`

## Credits

This extension uses icons from [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme) by Philipp Kief, licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Support

If you encounter any problems or have suggestions, please file an issue on GitHub.

---

## 日本語版 (Japanese)

VS Codeでお気に入りファイルとブックマークを管理するための強力な拡張機能。美しくカスタマイズ可能なインターフェース付き。

## 機能

### 📁 お気に入りファイル
- **クイック追加**: `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`) で現在のファイルを即座にお気に入りに追加
- **階層表示**: 調整可能な深さでフォルダ構造別にファイルを表示
- **グローバル & ローカルモード**: グローバルまたはワークスペースごとにお気に入りを管理
- **検索 & フィルター**: お気に入りファイルを素早く検索
- **ファイルタイプアイコン**: ファイルタイプに基づいて自動的にアイコンを表示

### 🔖 ブックマーク
- **複数のアイコンタイプ**: デフォルト、TODO、バグ、メモ、重要、質問
- **ガターアイコン**: エディタのガターに視覚的なインジケータを表示
- **行ナビゲーション**: ブックマークした行に即座にジャンプ
- **上下移動**: `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`) でブックマーク位置を調整
- **自動調整**: コード変更時にブックマークが自動的に調整
- **フィルタリング**: アイコンタイプでブックマークをフィルター

### 🎨 4つの美しいテーマ
- **Classic**: オリジナルのシンプルなデザイン（推奨）
- **Modern**: コンパクトでクリーン
- **Soft**: やわらかいグラデーションと柔らかい色
- **Pop**: カラフルで華やか

### 📱 レスポンシブデザイン
- サイドバーの幅に自動調整
- さまざまなサイドバー幅に合わせてフォントサイズと余白を最適化
- スペースが限られている場合、要素が適切に非表示

## インストール

1. VS Codeを開く
2. `Ctrl+P` (Mac: `Cmd+P`) を押す
3. `ext install core-anchor` と入力
4. Enterを押す

または拡張機能ビュー (`Ctrl+Shift+X` / Mac: `Cmd+Shift+X`) で「Core Anchor」を検索。

## 使い方

### お気に入りの追加
1. お気に入りに追加したいファイルを開く
2. `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`) を押す、または右クリックして「Core Anchor: Add to Favorites」を選択
3. オプションで説明を入力

### ブックマークの追加
1. ブックマークしたい行にカーソルを置く
2. `Ctrl+Alt+B` (Mac: `Cmd+Alt+B`) を押す、または右クリックして「Core Anchor: Add Bookmark」を選択
3. ブックマークタイプを選択（デフォルト、TODO、バグなど）
4. ラベルを入力

### キーボードショートカット

| コマンド | Windows/Linux | Mac |
|---|---|---|
| ブックマークを追加 | `Ctrl+Alt+B` | `Cmd+Alt+B` |
| お気に入りに追加 | `Ctrl+Alt+F` | `Cmd+Alt+F` |
| ブックマークを上に移動 | `Ctrl+Alt+Up` | `Cmd+Alt+Up` |
| ブックマークを下に移動 | `Ctrl+Alt+Down` | `Cmd+Alt+Down` |

## 設定

### UIテーマ
Core Anchorサイドバーの外観を変更できます。オプション: `classic`, `modern`, `soft`, `pop`

### セクションの表示
お気に入りセクションとブックマークセクションを個別に表示/非表示にできます。

### カスタムアイコン
ブックマーク用に独自のアイコンを使用できます。パスは絶対パスまたはワークスペースルートからの相対パスを指定できます。

### フォルダ階層の深さ
お気に入りセクションのヘッダーにある `+` と `-` ボタンを使用して、表示するフォルダ階層の深さを調整できます。

**重要**: この拡張機能は、似たようなファイル構成を持つ複数のリポジトリ間での作業を想定して設計されています。グローバルお気に入りを使用すると、同じパス構造を持つファイルに異なるプロジェクト間で素早くアクセスできます。例えば、`src/components/Header.tsx` をお気に入りに追加すると、同じパス構造を持つあらゆるリポジトリでそのファイルを開くことができます。

### プレビューモード
ファイルをプレビューモードで開くか、固定タブとして開くかを制御できます。

## データ保存

### お気に入り
- **グローバル**: `~/.vscode/core-anchor-favorites.json`
- **ローカル**: `.vscode/favorites.json` (ワークスペース内)

### ブックマーク
- **ローカルのみ**: `.vscode/bookmarks.json` (ワークスペース内)

## ヒント

### 効果的な検索
検索ボックスは以下でフィルタリング可能：
- ファイル名
- フォルダパス
- 説明
- ブックマークラベル

### コンテキストメニュー
フォルダとファイルを右クリックして素早くアクション：
- 名前または日付で並べ替え
- すべてのアイテムを削除
- その他

## トラブルシューティング

### ブックマークが表示されない
1. ファイルが現在のワークスペースにあるか確認
2. VS Codeウィンドウをリロード (`Ctrl+R` / Mac: `Cmd+R`)
3. `.vscode/bookmarks.json` が存在するか確認

### アイコンが表示されない
1. アイコンパスが正しいか確認
2. 絶対パスまたはワークスペースルートからの相対パスを使用
3. アイコン設定変更後、VS Codeを再起動

### テーマが変わらない
1. 拡張機能をコンパイル済みか確認: `npm run compile`
2. VS Codeウィンドウをリロード
3. すべてのCSSファイルが `out/webview/` に存在するか確認

## クレジット

この拡張機能は、Philipp Kief氏による [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme) のアイコンを使用しており、MITライセンスの下で提供されています。

## コントリビューション

コントリビューション歓迎！issueやプルリクエストをお気軽に提出してください。

## ライセンス

MIT

## サポート

問題が発生した場合や提案がある場合は、GitHubでissueを作成してください。

---

by uta