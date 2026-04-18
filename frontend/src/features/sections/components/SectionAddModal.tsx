import { X } from 'lucide-react';
import { useCreateSection } from '../hooks/useCreateSection';

export default function SectionAddModal({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const createSection = useCreateSection(pageId);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('sectionTitle') as string;
    createSection.mutate({ pageId, name }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-xl text-slate-800">新規セクション</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-5">
            <input name="sectionTitle" required autoFocus className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="例: 参考URL, 議事録など" />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">セクションを作成</button>
          </div>
        </form>
      </div>
    </div>
  );
}
