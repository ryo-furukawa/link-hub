import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdateSource } from '../hooks/useUpdateSource';
import type { Source } from '../../../types/pages';

export default function SourceEditModal({
  source,
  pageId,
  onClose,
}: {
  source: Source;
  pageId: string;
  onClose: () => void;
}) {
  const updateSource = useUpdateSource(pageId);
  const form = useForm<{ title: string; url: string; memo: string; content: string }>();

  useEffect(() => {
    form.reset({ title: source.title, url: source.url ?? '', memo: source.memo, content: source.content });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const onSubmit = form.handleSubmit((data) => {
    updateSource.mutate(
      { id: source.id, pageId, title: data.title, url: data.url, memo: data.memo, content: data.content },
      { onSuccess: onClose }
    );
  });

  return (
    <div key={source.id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={onSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-xl text-slate-800 tracking-tight">ソースを編集</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 space-y-5">
            <input
              {...form.register('title', { required: true })}
              autoFocus
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="タイトル"
            />
            {source.type === 'link' ? (
              <input
                {...form.register('url')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="URL"
              />
            ) : (
              <textarea
                {...form.register('content')}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                placeholder="内容"
              />
            )}
            <button
              type="submit"
              disabled={updateSource.isPending}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {updateSource.isPending ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
