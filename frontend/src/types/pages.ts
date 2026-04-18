export type Source = {
  id: string;
  page_id: string;
  section_id: string | null;
  type: 'link' | 'note';
  url: string | null;
  title: string;
  memo: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: string;
  page_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
};

// バックエンドAPIのレスポンス型
export type Page = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

// フロントエンドのローカル状態用（既存UI互換）
export type LocalPage = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  updatedAt: string;
  unclassifiedSources: Source[];
  sections: Section[];
};
