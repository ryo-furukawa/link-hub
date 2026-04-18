import { ExternalLink, FileText, Link as LinkIcon, Pencil, X } from 'lucide-react';
import type { Source } from '../../../types/pages';

export default function SourceDetailPanel({
  source,
  onClose,
  onEdit,
}: {
  source: Source | null;
  onClose: () => void;
  onEdit: (src: Source) => void;
}) {
  return (
    <>
      {source && (
        <div className="fixed inset-0 z-40" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${source ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {source && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg shrink-0 ${source.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                  {source.type === 'link' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <h2 className="font-bold text-lg text-slate-800 truncate">{source.title}</h2>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => onEdit(source)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                  title="編集"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {source.type === 'link' && source.url && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL</p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-mono break-all"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {source.url}
                  </a>
                </div>
              )}

              {source.type === 'note' && source.content && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">内容</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4">
                    {source.content}
                  </p>
                </div>
              )}

              {source.memo && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">メモ</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4">
                    {source.memo}
                  </p>
                </div>
              )}

              <div className="text-[10px] text-slate-300 font-mono space-y-0.5 pt-4 border-t border-slate-100">
                <p>作成: {source.created_at.slice(0, 10)}</p>
                <p>更新: {source.updated_at.slice(0, 10)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
