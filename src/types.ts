export interface FavoriteFile {
  path: string;
  description: string;
  order?: number; // 追加順
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

export interface FavoritesMeta {
  folderOrder: string[]; // フォルダの順序
  fileOrder: { [folderPath: string]: string[] }; // フォルダ内のファイル順序
}

export interface BookmarksMeta {
  fileOrder: string[]; // ファイルの順序
  bookmarkSortType: { [filePath: string]: SortType }; // ファイルごとのソートタイプ
}