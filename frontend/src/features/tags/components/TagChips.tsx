import { Plus, Tag as TagIcon, X } from 'lucide-react';
import type { Tag } from '../../../types/pages';

export default function TagChips({
  tags,
  onDetach,
  onManage,
}: {
  tags: Tag[];
  onDetach: (tagId: string) => void;
  onManage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map(tag => (
        <span key={tag.id} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
          <TagIcon className="w-3 h-3" />
          {tag.name}
          <button type="button" onClick={() => onDetach(tag.id)} className="ml-1 hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onManage}
        className="flex items-center gap-1 px-3 py-1 border border-dashed border-slate-300 text-slate-400 rounded-full text-xs hover:border-indigo-400 hover:text-indigo-500 transition-all"
      >
        <Plus className="w-3 h-3" /> タグ追加
      </button>
    </div>
  );
}
