export interface FavoriteFile {
  path: string;
  description: string;
}

export type BookmarkIconType = 'default' | 'todo' | 'bug' | 'note' | 'important' | 'question';

export interface Bookmark {
  line: number;
  label: string;
  iconType?: BookmarkIconType; // アイコンタイプを追加
}

export interface BookmarksData {
  [filePath: string]: Bookmark[];
}

// アイコンタイプの表示名
export const ICON_TYPE_LABELS: Record<BookmarkIconType, string> = {
  default: '📌 Default',
  todo: '✅ TODO',
  bug: '🐛 Bug',
  note: '📝 Note',
  important: '⚠️ Important',
  question: '❓ Question'
};