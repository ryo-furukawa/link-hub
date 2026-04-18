import { useState } from 'react';
import { FolderPlus, Plus } from 'lucide-react';
import { usePageList } from '../hooks/usePageList';
import { useUpdateSource } from '../../sources/hooks/useUpdateSource';
import { useSourceList } from '../../sources/hooks/useSourceList';
import { useDeleteSource } from '../../sources/hooks/useDeleteSource';
import { useReorderSources } from '../../sources/hooks/useReorderSources';
import { useSectionList } from '../../sections/hooks/useSectionList';
import { useReorderSections } from '../../sections/hooks/useReorderSections';
import { usePageTagList } from '../../tags/hooks/usePageTagList';
import { useDetachTag } from '../../tags/hooks/useDetachTag';

import SourceRow from '../../sources/components/SourceRow';
import SourceAddModal from '../../sources/components/SourceAddModal';
import SourceEditModal from '../../sources/components/SourceEditModal';
import SourceMoveModal from '../../sources/components/SourceMoveModal';
import SectionBlock from '../../sections/components/SectionBlock';
import SectionAddModal from '../../sections/components/SectionAddModal';
import SectionEditModal from '../../sections/components/SectionEditModal';
import TagChips from '../../tags/components/TagChips';
import TagManageModal from '../../tags/components/TagManageModal';
import PageEditModal from './PageEditModal';

import type { Section, Source } from '../../../types/pages';

export default function PageDetail({ pageId }: { pageId: string }) {
  const { data: apiPages = [] } = usePageList();
  const page = apiPages.find(p => p.id === pageId) ?? null;

  const { data: apiSections = [] } = useSectionList(pageId);
  const { data: apiSources = [] } = useSourceList(pageId);
  const updateSource = useUpdateSource(pageId);
  const deleteSource = useDeleteSource(pageId);
  const reorderSources = useReorderSources(pageId);
  const reorderSections = useReorderSections(pageId);
  const { data: pageTags = [] } = usePageTagList(pageId);
  const detachTag = useDetachTag(pageId);

  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [addingSourceSectionId, setAddingSourceSectionId] = useState<string | null | undefined>(undefined);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [movingSource, setMovingSource] = useState<{ sourceId: string; fromSectionId: string | null } | null>(null);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [sectionDragOverId, setSectionDragOverId] = useState<string | null>(null);

  const handleMoveSource = (sourceId: string, targetSectionId: string) => {
    const src = apiSources.find(s => s.id === sourceId);
    if (!src) return;
    updateSource.mutate({
      id: sourceId,
      pageId,
      title: src.title,
      url: src.url ?? undefined,
      memo: src.memo,
      content: src.content,
      section_id: targetSectionId === 'unclassified' ? null : targetSectionId,
    });
  };

  const handleDragStart = (e: React.DragEvent, sourceId: string, fromSectionId: string | null) => {
    e.dataTransfer.setData("sourceId", sourceId);
    e.dataTransfer.setData("fromSectionId", fromSectionId || "");
    (e.currentTarget as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
  };

  const handleDropOnSource = (draggedId: string, targetId: string, sectionId: string | null, after: boolean, isSameArea: boolean) => {
    if (!isSameArea) {
      handleMoveSource(draggedId, sectionId ?? 'unclassified');
      return;
    }
    const areaSources = apiSources
      .filter(s => sectionId ? s.section_id === sectionId : s.section_id === null)
      .sort((a, b) => a.position - b.position);
    const without = areaSources.filter(s => s.id !== draggedId);
    const insertIndex = without.findIndex(s => s.id === targetId);
    if (insertIndex === -1) return;
    without.splice(after ? insertIndex + 1 : insertIndex, 0, areaSources.find(s => s.id === draggedId)!);
    reorderSources.mutate({ pageId, sourceIds: without.map(s => s.id) });
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("sourceId");
    const fromSectionId = e.dataTransfer.getData("fromSectionId") || null;
    const isSameArea = fromSectionId === targetId || (!fromSectionId && targetId === 'unclassified');
    if (isSameArea) {
      const sectionId = targetId === 'unclassified' ? null : targetId;
      const areaSources = apiSources
        .filter(s => sectionId ? s.section_id === sectionId : s.section_id === null)
        .sort((a, b) => a.position - b.position);
      const without = areaSources.filter(s => s.id !== sourceId);
      const dragged = areaSources.find(s => s.id === sourceId);
      if (dragged) {
        without.push(dragged);
        reorderSources.mutate({ pageId, sourceIds: without.map(s => s.id) });
      }
    } else {
      handleMoveSource(sourceId, targetId);
    }
    setDragOverId(null);
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.setData("sectionId", sectionId);
    e.stopPropagation();
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("sectionId");
    if (!draggedId || draggedId === targetSectionId) { setSectionDragOverId(null); return; }
    const ordered = [...apiSections].sort((a, b) => a.position - b.position);
    const without = ordered.filter(s => s.id !== draggedId);
    const insertIndex = without.findIndex(s => s.id === targetSectionId);
    if (insertIndex === -1) { setSectionDragOverId(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    without.splice(after ? insertIndex + 1 : insertIndex, 0, ordered.find(s => s.id === draggedId)!);
    reorderSections.mutate({ pageId, sectionIds: without.map(s => s.id) });
    setSectionDragOverId(null);
  };

  if (!page) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{page.title}</h2>
            <p className="mt-3 text-slate-500 leading-relaxed text-lg">{page.description}</p>
          </div>
        </div>
        <div className="mt-6">
          <TagChips
            tags={pageTags}
            onDetach={(tagId) => detachTag.mutate({ pageId, tagId })}
            onManage={() => setIsManagingTags(true)}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => setAddingSourceSectionId(null)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> ソースを追加
          </button>
          <button onClick={() => setIsAddingSection(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FolderPlus className="w-4 h-4" /> セクション追加
          </button>
          <button onClick={() => setIsEditingPage(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95">
            ページ編集
          </button>
        </div>
      </div>

      {/* Unclassified Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Page Direct Sources</h3>
          <span className="text-[10px] text-slate-300">ドラッグして整理</span>
        </div>
        <div
          onDragOver={(e) => handleDragOver(e, 'unclassified')}
          onDrop={(e) => handleDrop(e, 'unclassified')}
          className={`rounded-2xl border-2 border-dashed transition-all p-2 ${dragOverId === 'unclassified' ? 'bg-indigo-50 border-indigo-400 scale-[1.01]' : 'bg-white border-transparent shadow-sm'}`}
        >
          {apiSources.filter(s => s.section_id === null).map(src => (
            <SourceRow
              key={src.id} src={src} sectionId={null}
              onDragStart={handleDragStart} onDragEnd={handleDragEnd}
              onMove={(sourceId, fromSectionId) => setMovingSource({ sourceId, fromSectionId })}
              onEdit={setEditingSource}
              onDelete={(_secId, srcId) => deleteSource.mutate(srcId)}
              onDropOnSource={handleDropOnSource}
            />
          ))}
          {apiSources.filter(s => s.section_id === null).length === 0 && (
            <div className="py-8 text-center text-slate-300 text-xs italic">ここにソースをドラッグ</div>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6 pb-20">
        {apiSections.map(section => (
          <SectionBlock
            key={section.id}
            section={section}
            sources={apiSources.filter(s => s.section_id === section.id).sort((a, b) => a.position - b.position)}
            dragOverId={dragOverId}
            sectionDragOverId={sectionDragOverId}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDropOnSource={handleDropOnSource}
            onAddSource={(sectionId) => setAddingSourceSectionId(sectionId)}
            onEdit={setEditingSection}
            onMoveSource={(sourceId, fromSectionId) => setMovingSource({ sourceId, fromSectionId })}
            onEditSource={setEditingSource}
            onDeleteSource={(_secId, srcId) => deleteSource.mutate(srcId)}
            onSectionDragStart={handleSectionDragStart}
            onSectionDrop={handleSectionDrop}
          />
        ))}
      </div>

      {/* Modals */}
      {isEditingPage && <PageEditModal page={page} onClose={() => setIsEditingPage(false)} />}
      {isAddingSection && <SectionAddModal pageId={pageId} onClose={() => setIsAddingSection(false)} />}
      {editingSection && <SectionEditModal section={editingSection} pageId={pageId} onClose={() => setEditingSection(null)} />}
      {addingSourceSectionId !== undefined && (
        <SourceAddModal pageId={pageId} sectionId={addingSourceSectionId} onClose={() => setAddingSourceSectionId(undefined)} />
      )}
      {editingSource && <SourceEditModal source={editingSource} pageId={pageId} onClose={() => setEditingSource(null)} />}
      {movingSource && (
        <SourceMoveModal
          sections={apiSections}
          onMove={(targetSectionId) => { handleMoveSource(movingSource.sourceId, targetSectionId); setMovingSource(null); }}
          onClose={() => setMovingSource(null)}
        />
      )}
      {isManagingTags && <TagManageModal pageId={pageId} onClose={() => setIsManagingTags(false)} />}
    </div>
  );
}
