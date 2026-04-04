export type Source = {
  id: string;
  type: 'link' | 'text';
  label: string;
  url?: string;
  content?: string;
};

export type Section = {
  id: string;
  title: string;
  sources: Source[];
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
