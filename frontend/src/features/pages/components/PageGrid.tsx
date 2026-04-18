import { useState } from 'react';
import { Clock, Plus, Search, Settings2, Trash2 } from 'lucide-react';
import TagCreateModal from '../../tags/components/TagCreateModal';
import type { Page, Tag } from '../../../types/pages';

function getAllTags(pages: Page[]): Tag[] {
  const seen = new Set<string>();
  const tags: Tag[] = [];
  for (const page of pages) {
    for (const tag of page.tags) {
      if (!seen.has(tag.id)) { seen.add(tag.id); tags.push(tag); }
    }
  }
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}

export default function PageGrid({
  pages,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
}: {
  pages: Page[];
  isLoading: boolean;
  onSelect: (id: string) => void;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const allTags = getAllTags(pages);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) { next.delete(tagId); } else { next.add(tagId); }
      return next;
    });
  };

  const filtered = pages
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p =>
      selectedTagIds.size === 0 ||
      [...selectedTagIds].some(tid => p.tags.some(t => t.id === tid))
    );

  if (isLoading) {
    return <p className="text-xs text-slate-400 text-center pt-20">読み込み中...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text" placeholder="タイトルで検索..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-all shadow-sm"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {allTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              selectedTagIds.has(tag.id)
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {tag.name}
          </button>
        ))}
        <button
          onClick={() => setIsCreatingTag(true)}
          className="p-1 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
          title="タグを作成"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{filtered.length} pages</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(page => (
          <div
            key={page.id}
            onClick={() => onSelect(page.id)}
            className="group bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 flex-1">{page.title}</h3>
              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(page)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                  <Settings2 className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete(page)} className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {page.description && (
              <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">{page.description}</p>
            )}
            {page.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {page.tags.map(tag => (
                  <span key={tag.id} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-400 rounded text-[10px] font-medium">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-300 font-mono">
              <Clock className="w-3 h-3" />{page.updated_at.slice(0, 10)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-slate-300 col-span-full text-center pt-10">該当するページがありません</p>
        )}
      </div>
      {isCreatingTag && <TagCreateModal onClose={() => setIsCreatingTag(false)} />}
    </div>
  );
}
