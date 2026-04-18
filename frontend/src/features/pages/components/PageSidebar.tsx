import { Clock, Settings2, Trash2 } from 'lucide-react';
import type { Page } from '../../../types/pages';

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
  return (
    <aside className="w-72 border-r border-slate-200 bg-white overflow-y-auto hidden md:block">
      <div className="p-4 space-y-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2 text-center">PROJECT PAGES</h2>
        {isLoading && <p className="text-xs text-slate-400 text-center">読み込み中...</p>}
        {pages
          .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(page => (
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
              <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px] font-mono">
                <Clock className="w-3 h-3" />{page.updated_at.slice(0, 10)}
              </div>
            </div>
          ))
        }
      </div>
    </aside>
  );
}
