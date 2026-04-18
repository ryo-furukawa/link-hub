import { useState } from 'react';
import { ExternalLink, FileText, Link as LinkIcon, MoveHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Source } from '../../../types/pages';

export default function SourceRow({
  src,
  sectionId = null,
  onDragStart,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
  onDropOnSource,
}: {
  src: Source;
  sectionId?: string | null;
  onDragStart: (e: React.DragEvent, sourceId: string, sectionId: string | null) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onMove: (sourceId: string, fromSectionId: string | null) => void;
  onEdit: (src: Source) => void;
  onDelete: (sectionId: string | null, sourceId: string) => void;
  onDropOnSource: (draggedId: string, targetId: string, sectionId: string | null, after: boolean) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, src.id, sectionId)}
      onDragEnd={(e) => { onDragEnd(e); setIsDragOver(false); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const draggedId = e.dataTransfer.getData("sourceId");
        const fromSectionId = e.dataTransfer.getData("fromSectionId") || null;
        if (draggedId && draggedId !== src.id) {
          const isSameArea = fromSectionId === (sectionId ?? '') || (!fromSectionId && sectionId === null);
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const after = e.clientY > rect.top + rect.height / 2;
          onDropOnSource(draggedId, src.id, sectionId, after, isSameArea);
        }
        setIsDragOver(false);
      }}
      className={`flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group/item transition-all border bg-white cursor-grab active:cursor-grabbing shadow-sm mb-1 ${isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-transparent hover:border-slate-100'}`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${src.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
          {src.type === 'link' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
        <div className="truncate">
          <p className="font-bold text-sm text-slate-700 truncate">{src.title}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono italic">
            {src.type === 'link' ? src.url : src.content}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onMove(src.id, sectionId)}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
          title="セクション移動"
        >
          <MoveHorizontal className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(src)}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white"
          title="編集"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {src.type === 'link' && (
          <a href={src.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button type="button" onClick={() => onDelete(sectionId, src.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-white">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
