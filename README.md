# Core Anchor

A powerful VS Code extension for managing your favorite files and bookmarks with a beautiful, customizable interface.

## Features

### 📁 Favorite Files
- **Quick Add**: Instantly add the current file to favorites with `Ctrl+Alt+F` (Mac: `Cmd+Alt+F`)
- **Virtual Folders**: Organize favorites into custom folders with drag-and-drop support
  - Create nested folder structures
  - Color-code folders for better organization
  - Move files and folders with drag-and-drop
- **Hierarchical Display**: View files organized by folder structure
- **Global & Local Modes**: Manage favorites globally or per workspace
- **Relative & Absolute Paths**: Choose between relative or absolute file paths
- **Search & Filter**: Quickly find your favorite files
- **File Type Icons**: Automatically displays icons based on file types

### 🔖 Bookmarks
- **Multiple Icon Types**: Default, TODO, Bug, Note, Important, Question
- **Gutter Icons**: Visual indicators in the editor gutter
- **Line Navigation**: Jump to bookmarked lines instantly
- **Quick Info**: Show bookmark details at cursor position with `Ctrl+Alt+I` (Mac: `Cmd+Alt+I`)
- **Move Up/Down**: Adjust bookmark positions with `Ctrl+Alt+U/D` (Mac: `Cmd+Alt+U/D`)
- **Navigate Between Bookmarks**: Jump to previous/next bookmark with `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`)
- **Auto-Adjustment**: Bookmarks automatically adjust when code changes
- **Filtering**: Filter bookmarks by icon type
- **Sorting**: Sort by line number or added order

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
4. Choose a folder to organize the file (or leave uncategorized)

### Managing Virtual Folders
- **Create Folder**: Click "New Folder" button in Favorites section
- **Rename Folder**: Right-click on folder and select "Rename"
- **Change Color**: Right-click on folder and select "Change Color"
- **Create Subfolder**: Right-click on folder and select "Create Subfolder"
- **Move Items**: Drag and drop files or folders to reorganize
- **Delete Folder**: Right-click on folder and select "Delete"

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
| Move Bookmark Up | `Ctrl+Alt+U` | `Cmd+Alt+U` |
| Move Bookmark Down | `Ctrl+Alt+D` | `Cmd+Alt+D` |
| Show Bookmark at Cursor | `Ctrl+Alt+I` | `Cmd+Alt+I` |
| Go to Previous Bookmark | `Ctrl+Alt+Up` | `Cmd+Alt+Up` |
| Go to Next Bookmark | `Ctrl+Alt+Down` | `Cmd+Alt+Down` |

## Configuration

### UI Theme
Change the appearance of Core Anchor sidebar in Settings:
- Search for `Core Anchor: UI Theme`
- Choose from: `classic`, `modern`, `soft`, `pop`

### Section Visibility
Show or hide Favorites section or Bookmarks section independently:
- `Core Anchor: Show Favorites` - Toggle Favorites section
- `Core Anchor: Show Bookmarks` - Toggle Bookmarks section

### Custom Icons
Use your own icons for bookmarks in Settings:
- Search for `Core Anchor: Icons`
- Set custom icon paths for each bookmark type
- Paths can be absolute or relative to workspace root

### Default Path Type
Choose default path type when adding favorites:
- `Core Anchor: Favorites Default Path Type`
- Options: `relative` (from workspace root) or `absolute` (full file path)

**Important**: This extension is designed for working across multiple repositories with similar file structures. Global favorites allow you to quickly access files with the same path structure across different projects. For example, if you have `src/components/Header.tsx` as a favorite, it will open that file in any repository that has the same path structure.

### Preview Mode
Control whether files open in preview mode or as pinned tabs:
- `Core Anchor: Open in Preview`
- Enable to open files in preview mode (default)
- Disable to always open files in pinned tabs

### Bookmark Tooltip
Show or hide bookmark details on hover:
- `Core Anchor: Show Bookmark Tooltip`
- Shows line number and description when hovering over bookmarks

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
Right-click on items for quick actions:

**Folders:**
- Sort files by name or added order
- Rename folder
- Change folder color
- Create subfolder
- Delete folder

**Files:**
- Edit file description
- Remove from favorites
- Open file to the side

**Bookmarks:**
- Sort by line number or added order
- Edit bookmark
- Delete bookmark
- Delete all bookmarks in file

### Drag and Drop
- Drag files between folders to reorganize
- Drag folders to create nested structures
- Drop files onto folders to move them

### Opening Files
- **Single Click**: Opens file in preview mode (if enabled)
- **Ctrl+Click** (Mac: **Cmd+Click**): Opens file to the side

## Troubleshooting

### Bookmarks not showing
1. Check if the file is in the current workspace
2. Reload VS Code window (`Ctrl+R` / Mac: `Cmd+R`)

### Icons not appearing
1. Verify icon paths are correct in Settings
2. Use absolute paths or paths relative to workspace root
3. Reload VS Code after changing icon settings

### Theme not changing
1. Check if the theme is properly selected in Settings
2. Reload VS Code window (`Ctrl+R` / Mac: `Cmd+R`)

### Virtual folders disappeared
- Virtual folders are saved in metadata files
- Make sure `.vscode` folder is not in your `.gitignore` if you want to share folders with team

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
- **仮想フォルダ**: ドラッグ&ドロップでお気に入りをカスタムフォルダに整理
  - ネストされたフォルダ構造を作成
  - フォルダを色分けして整理
  - ドラッグ&ドロップでファイルとフォルダを移動
- **階層表示**: フォルダ構造別にファイルを表示
- **グローバル & ローカルモード**: グローバルまたはワークスペースごとにお気に入りを管理
- **相対パス & 絶対パス**: 相対パスまたは絶対パスを選択可能
- **検索 & フィルター**: お気に入りファイルを素早く検索
- **ファイルタイプアイコン**: ファイルタイプに基づいて自動的にアイコンを表示

### 🔖 ブックマーク
- **複数のアイコンタイプ**: デフォルト、TODO、バグ、メモ、重要、質問
- **ガターアイコン**: エディタのガターに視覚的なインジケータを表示
- **行ナビゲーション**: ブックマークした行に即座にジャンプ
- **クイック情報**: `Ctrl+Alt+I` (Mac: `Cmd+Alt+I`) でカーソル位置のブックマーク詳細を表示
- **上下移動**: `Ctrl+Alt+U/D` (Mac: `Cmd+Alt+U/D`) でブックマーク位置を調整
- **ブックマーク間の移動**: `Ctrl+Alt+Up/Down` (Mac: `Cmd+Alt+Up/Down`) で前後のブックマークにジャンプ
- **自動調整**: コード変更時にブックマークが自動的に調整
- **フィルタリング**: アイコンタイプでブックマークをフィルター
- **ソート**: 行番号または追加順でソート

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
4. ファイルを整理するフォルダを選択（または未分類のまま）

### 仮想フォルダの管理
- **フォルダ作成**: お気に入りセクションの「New Folder」ボタンをクリック
- **フォルダ名変更**: フォルダを右クリックして「Rename」を選択
- **色変更**: フォルダを右クリックして「Change Color」を選択
- **サブフォルダ作成**: フォルダを右クリックして「Create Subfolder」を選択
- **アイテム移動**: ファイルやフォルダをドラッグ&ドロップで整理
- **フォルダ削除**: フォルダを右クリックして「Delete」を選択

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
| ブックマークを上に移動 | `Ctrl+Alt+U` | `Cmd+Alt+U` |
| ブックマークを下に移動 | `Ctrl+Alt+D` | `Cmd+Alt+D` |
| カーソル位置のブックマーク表示 | `Ctrl+Alt+I` | `Cmd+Alt+I` |
| 前のブックマークへ移動 | `Ctrl+Alt+Up` | `Cmd+Alt+Up` |
| 次のブックマークへ移動 | `Ctrl+Alt+Down` | `Cmd+Alt+Down` |

## 設定

### UIテーマ
設定でCore Anchorサイドバーの外観を変更できます：
- `Core Anchor: UI Theme` を検索
- `classic`、`modern`、`soft`、`pop` から選択

### セクションの表示
お気に入りセクションとブックマークセクションを個別に表示/非表示にできます：
- `Core Anchor: Show Favorites` - お気に入りセクションの表示切り替え
- `Core Anchor: Show Bookmarks` - ブックマークセクションの表示切り替え

### カスタムアイコン
設定でブックマーク用に独自のアイコンを使用できます：
- `Core Anchor: Icons` を検索
- 各ブックマークタイプのカスタムアイコンパスを設定
- パスは絶対パスまたはワークスペースルートからの相対パスを指定可能

### デフォルトパスタイプ
お気に入り追加時のデフォルトパスタイプを選択：
- `Core Anchor: Favorites Default Path Type`
- オプション: `relative`（ワークスペースルートからの相対パス）または `absolute`（完全なファイルパス）

**重要**: この拡張機能は、似たようなファイル構成を持つ複数のリポジトリ間での作業を想定して設計されています。グローバルお気に入りを使用すると、同じパス構造を持つファイルに異なるプロジェクト間で素早くアクセスできます。例えば、`src/components/Header.tsx` をお気に入りに追加すると、同じパス構造を持つあらゆるリポジトリでそのファイルを開くことができます。

### プレビューモード
ファイルをプレビューモードで開くか、固定タブとして開くかを制御できます：
- `Core Anchor: Open in Preview`
- 有効にするとプレビューモードで開く（デフォルト）
- 無効にすると常に固定タブで開く

### ブックマークツールチップ
ホバー時のブックマーク詳細表示の切り替え：
- `Core Anchor: Show Bookmark Tooltip`
- ブックマークにホバーした際に行番号と説明を表示

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
アイテムを右クリックして素早くアクション：

**フォルダ:**
- ファイルを名前または追加順で並べ替え
- フォルダ名を変更
- フォルダの色を変更
- サブフォルダを作成
- フォルダを削除

**ファイル:**
- ファイルの説明を編集
- お気に入りから削除
- ファイルを横に開く

**ブックマーク:**
- 行番号または追加順でソート
- ブックマークを編集
- ブックマークを削除
- ファイル内のすべてのブックマークを削除

### ドラッグ&ドロップ
- ファイルをフォルダ間でドラッグして整理
- フォルダをドラッグしてネスト構造を作成
- ファイルをフォルダにドロップして移動

### ファイルを開く
- **シングルクリック**: プレビューモードでファイルを開く（有効な場合）
- **Ctrl+クリック** (Mac: **Cmd+クリック**): ファイルを横に開く

## トラブルシューティング

### ブックマークが表示されない
1. ファイルが現在のワークスペースにあるか確認
2. VS Codeウィンドウをリロード (`Ctrl+R` / Mac: `Cmd+R`)

### アイコンが表示されない
1. 設定でアイコンパスが正しいか確認
2. 絶対パスまたはワークスペースルートからの相対パスを使用
3. アイコン設定変更後、VS Codeをリロード

### テーマが変わらない
1. 設定でテーマが正しく選択されているか確認
2. VS Codeウィンドウをリロード (`Ctrl+R` / Mac: `Cmd+R`)

### 仮想フォルダが消えた
- 仮想フォルダはメタデータファイルに保存されます
- チームとフォルダを共有したい場合は、`.vscode` フォルダが `.gitignore` に含まれていないことを確認してください

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