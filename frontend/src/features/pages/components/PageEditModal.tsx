import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdatePage } from '../hooks/useUpdatePage';
import type { Page } from '../../../types/pages';

export default function PageEditModal({ page, onClose }: { page: Page; onClose: () => void }) {
  const updatePage = useUpdatePage();
  const form = useForm<{ title: string; description: string }>({
    defaultValues: { title: page.title, description: page.description },
  });

  const onSubmit = form.handleSubmit((data) => {
    updatePage.mutate(
      { id: page.id, title: data.title, description: data.description },
      { onSuccess: onClose }
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-xl text-slate-800 tracking-tight">ページを編集</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-5">
            <input
              {...form.register('title', { required: true })}
              autoFocus
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="プロジェクトタイトル"
            />
            <textarea
              {...form.register('description')}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
              placeholder="簡単な説明..."
            />
            <button
              type="submit"
              disabled={updatePage.isPending}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {updatePage.isPending ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
