import { Trash2, X } from 'lucide-react';
import { useUpdateSection } from '../hooks/useUpdateSection';
import { useDeleteSection } from '../hooks/useDeleteSection';
import type { Section } from '../../../types/pages';

export default function SectionEditModal({
  section,
  pageId,
  onClose,
}: {
  section: Section;
  pageId: string;
  onClose: () => void;
}) {
  const updateSection = useUpdateSection(pageId);
  const deleteSection = useDeleteSection(pageId);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('editSectionTitle') as string;
    updateSection.mutate({ id: section.id, pageId, name }, { onSuccess: onClose });
  };

  const onDelete = () => {
    deleteSection.mutate(section.id, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-xl text-slate-800">セクション編集</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-5">
            <input name="editSectionTitle" defaultValue={section.name} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <div className="flex gap-3">
              <button type="button" onClick={onDelete} className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />削除
              </button>
              <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">更新</button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">※削除するとセクション内のソースは未分類エリアに残ります</p>
          </div>
        </form>
      </div>
    </div>
  );
}
