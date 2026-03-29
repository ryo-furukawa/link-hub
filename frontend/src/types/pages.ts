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

export type Page = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  updatedAt: string;
  unclassifiedSources: Source[];
  sections: Section[];
};
