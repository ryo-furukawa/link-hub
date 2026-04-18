import { X } from 'lucide-react';
import { useCreateSource } from '../hooks/useCreateSource';

export default function SourceAddModal({
  pageId,
  sectionId,
  onClose,
}: {
  pageId: string;
  sectionId: string | null;
  onClose: () => void;
}) {
  const createSource = useCreateSource(pageId);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = fd.get('sourceType') as 'link' | 'note';
    const title = fd.get('sourceLabel') as string;
    const content = fd.get('sourceContent') as string;
    createSource.mutate(
      {
        pageId,
        type,
        title,
        url: type === 'link' ? content : undefined,
        content: type === 'note' ? content : undefined,
        section_id: sectionId ?? undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-xl text-slate-800">ソースを追加</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-5">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="sourceType" value="link" defaultChecked className="hidden peer" />
                <div className="text-center py-2 rounded-lg peer-checked:bg-white peer-checked:shadow-sm text-sm font-bold text-slate-500 peer-checked:text-indigo-600 transition-all">リンク</div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="radio" name="sourceType" value="note" className="hidden peer" />
                <div className="text-center py-2 rounded-lg peer-checked:bg-white peer-checked:shadow-sm text-sm font-bold text-slate-500 peer-checked:text-indigo-600 transition-all">メモ</div>
              </label>
            </div>
            <input name="sourceLabel" required autoFocus className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="表示ラベル" />
            <textarea name="sourceContent" required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32" placeholder="URLまたは内容を入力..." />
            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
