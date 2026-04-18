import { ChevronDown, GripVertical, Plus, Settings2 } from 'lucide-react';
import SourceRow from '../../sources/components/SourceRow';
import type { Section, Source } from '../../../types/pages';

export default function SectionBlock({
  section,
  sources,
  dragOverId,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onDropOnSource,
  onAddSource,
  onEdit,
  onMoveSource,
  onEditSource,
  onDeleteSource,
}: {
  section: Section;
  sources: Source[];
  dragOverId: string | null;
  onDragOver: (e: React.DragEvent, targetId: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragStart: (e: React.DragEvent, sourceId: string, fromSectionId: string | null) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDropOnSource: (draggedId: string, targetId: string, sectionId: string | null, after: boolean, isSameArea: boolean) => void;
  onAddSource: (sectionId: string) => void;
  onEdit: (section: Section) => void;
  onMoveSource: (sourceId: string, fromSectionId: string | null) => void;
  onEditSource: (src: Source) => void;
  onDeleteSource: (sectionId: string | null, sourceId: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
      <div
        onClick={() => onEdit(section)}
        className="px-6 py-4 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-slate-300" />
          <h3 className="font-bold text-slate-700 flex items-center gap-2 tracking-tight uppercase text-xs tracking-widest">
            <ChevronDown className="w-4 h-4 text-indigo-500" />
            {section.name}
            <span className="text-[10px] font-normal text-slate-400 ml-2">({sources.length})</span>
          </h3>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onAddSource(section.id)} className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(section)} className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        onDragOver={(e) => onDragOver(e, section.id)}
        onDrop={(e) => onDrop(e, section.id)}
        className={`p-2 space-y-1 transition-colors min-h-[50px] ${dragOverId === section.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' : ''}`}
      >
        {sources.map(src => (
          <SourceRow
            key={src.id} src={src} sectionId={section.id}
            onDragStart={onDragStart} onDragEnd={onDragEnd}
            onMove={onMoveSource}
            onEdit={onEditSource}
            onDelete={onDeleteSource}
            onDropOnSource={onDropOnSource}
          />
        ))}
        {sources.length === 0 && (
          <div className="py-4 text-center text-slate-200 text-[10px] uppercase tracking-tighter">Empty Section</div>
        )}
      </div>
    </div>
  );
}
