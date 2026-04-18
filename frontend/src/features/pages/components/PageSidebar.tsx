import { useState } from 'react';
import { Clock, Settings2, Trash2 } from 'lucide-react';
import type { Page, Tag } from '../../../types/pages';

function getAllTags(pages: Page[]): Tag[] {
  const seen = new Set<string>();
  const tags: Tag[] = [];
  for (const page of pages) {
    for (const tag of page.tags) {
      if (!seen.has(tag.id)) {
        seen.add(tag.id);
        tags.push(tag);
      }
    }
  }
  return tags.sort((a, b) => a.name.localeCompare(b.name));
}

export default function PageSidebar({
  pages,
  isLoading,
  searchQuery,
  selectedPageId,
  onSelect,
  onEdit,
  onDelete,
}: {
  pages: Page[];
  isLoading: boolean;
  searchQuery: string;
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  onEdit: (page: Page) => void;
  onDelete: (page: Page) => void;
}) {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

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

  return (
    <aside className="w-72 border-r border-slate-200 bg-white overflow-y-auto hidden md:flex md:flex-col">
      {allTags.length > 0 && (
        <div className="px-4 pt-4 pb-2 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">タグで絞り込み</p>
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                  selectedTagIds.has(tag.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-1 flex-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2 text-center">PROJECT PAGES</h2>
        {isLoading && <p className="text-xs text-slate-400 text-center">読み込み中...</p>}
        {filtered.map(page => (
          <div
            key={page.id}
            onClick={() => onSelect(page.id)}
            className={`group p-3 rounded-xl cursor-pointer transition-all ${selectedPageId === page.id ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm truncate flex-1">{page.title}</h3>
              <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => onEdit(page)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                  <Settings2 className="w-3 h-3" />
                </button>
                <button onClick={() => onDelete(page)} className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {page.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {page.tags.map(tag => (
                  <span key={tag.id} className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-medium">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px] font-mono">
              <Clock className="w-3 h-3" />{page.updated_at.slice(0, 10)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && !isLoading && (
          <p className="text-xs text-slate-300 text-center pt-4">該当するページがありません</p>
        )}
      </div>
    </aside>
  );
}
