import { useState } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { useTagList } from '../hooks/useTagList';
import { usePageTagList } from '../hooks/usePageTagList';
import { useCreateTag } from '../hooks/useCreateTag';
import { useAttachTag } from '../hooks/useAttachTag';
import { useDetachTag } from '../hooks/useDetachTag';

export default function TagManageModal({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const { data: allTags = [] } = useTagList();
  const { data: pageTags = [] } = usePageTagList(pageId);
  const createTag = useCreateTag();
  const attachTag = useAttachTag(pageId);
  const detachTag = useDetachTag(pageId);
  const [newTagName, setNewTagName] = useState('');

  const handleCreate = () => {
    if (!newTagName.trim()) return;
    createTag.mutate(newTagName.trim(), { onSuccess: () => setNewTagName('') });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-xl text-slate-800">タグを管理</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="flex gap-2">
            <input
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="新しいタグ名..."
            />
            <button
              type="button"
              disabled={!newTagName.trim() || createTag.isPending}
              onClick={handleCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              作成
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allTags.length === 0 && <p className="text-center text-slate-300 text-xs py-4">タグがありません</p>}
            {allTags.map(tag => {
              const attached = pageTags.some(t => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => attached
                    ? detachTag.mutate({ pageId, tagId: tag.id })
                    : attachTag.mutate({ pageId, tagId: tag.id })
                  }
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-bold ${attached ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2"><TagIcon className="w-3 h-3" />{tag.name}</span>
                  {attached && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">付与済み</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
