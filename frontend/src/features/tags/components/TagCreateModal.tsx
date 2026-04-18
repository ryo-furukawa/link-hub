import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateTag } from '../hooks/useCreateTag';

export default function TagCreateModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const createTag = useCreateTag();

  const handleCreate = () => {
    if (!name.trim()) return;
    createTag.mutate(name.trim(), { onSuccess: () => setName('') });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-xl text-slate-800">タグを作成</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-4">
          <div className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="タグ名..."
            />
            <button
              type="button"
              disabled={!name.trim() || createTag.isPending}
              onClick={handleCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              作成
            </button>
          </div>
          {createTag.isSuccess && (
            <p className="text-xs text-indigo-500 text-center">作成しました</p>
          )}
          <button type="button" onClick={onClose} className="w-full py-2 text-sm text-slate-400 hover:text-slate-600">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
