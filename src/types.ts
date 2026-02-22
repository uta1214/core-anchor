export interface FavoriteFile {
  path: string;
  description: string;
  order?: number; // 追加順
  isRelative?: boolean; // 相対パスかどうか (デフォルト: true)
  virtualFolderId?: string | null; // 仮想フォルダID (nullの場合はWorkspace Rootに表示)
}

export type BookmarkIconType = 'default' | 'todo' | 'bug' | 'note' | 'important' | 'question' | 'all';

export interface Bookmark {
  line: number;
  label: string;
  iconType?: BookmarkIconType;
  order?: number; // 追加順
}

export interface BookmarksData {
  [filePath: string]: Bookmark[];
}

export const ICON_TYPE_LABELS: Record<BookmarkIconType, string> = {
  default: 'Default',
  todo: 'TODO',
  bug: 'Bug',
  note: 'Note',
  important: 'Important',
  question: 'Question',
  all: 'All'
};

export type FavoriteMode = 'global' | 'local';

export type SortType = 'name' | 'order' | 'manual' | 'line';

export interface VirtualFolder {
  id: string;
  name: string;
  order: number;
  color?: string; // フォルダの色
  parentId?: string | null; // 親フォルダのID（nullまたはundefinedはルート）
}

export interface FavoritesMeta {
  folderOrder: string[]; // フォルダの順序
  fileOrder: { [folderPath: string]: string[] }; // フォルダ内のファイル順序
  virtualFolders?: VirtualFolder[]; // 仮想フォルダ
}

export interface BookmarksMeta {
  fileOrder: string[]; // ファイルの順序
  bookmarkSortType: { [filePath: string]: SortType }; // 旧: ファイルごとのソートタイプ（後方互換のため残す）
  globalSortType?: SortType; // 全ブックマーク共通のソートタイプ
}