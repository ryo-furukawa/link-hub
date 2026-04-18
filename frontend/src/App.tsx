import { useState } from 'react';
import { FolderPlus, Layers, Plus, Search } from 'lucide-react';

import { usePages } from './features/pages/hooks/usePages';
import { usePageList } from './features/pages/hooks/usePageList';
import { useDeletePage } from './features/pages/hooks/useDeletePage';
import { useUpdateSource } from './features/sources/hooks/useUpdateSource';
import { useSourceList } from './features/sources/hooks/useSourceList';
import { useDeleteSource } from './features/sources/hooks/useDeleteSource';
import { useReorderSources } from './features/sources/hooks/useReorderSources';
import { useSectionList } from './features/sections/hooks/useSectionList';
import { usePageTagList } from './features/tags/hooks/usePageTagList';

import PageSidebar from './features/pages/components/PageSidebar';
import PageCreateModal from './features/pages/components/PageCreateModal';
import PageEditModal from './features/pages/components/PageEditModal';
import SourceRow from './features/sources/components/SourceRow';
import SourceAddModal from './features/sources/components/SourceAddModal';
import SourceEditModal from './features/sources/components/SourceEditModal';
import SourceMoveModal from './features/sources/components/SourceMoveModal';
import SectionBlock from './features/sections/components/SectionBlock';
import SectionAddModal from './features/sections/components/SectionAddModal';
import SectionEditModal from './features/sections/components/SectionEditModal';
import TagChips from './features/tags/components/TagChips';
import TagManageModal from './features/tags/components/TagManageModal';

import type { Page, Section, Source } from './types/pages';
import { useDetachTag } from './features/tags/hooks/useDetachTag';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiPages = [], isLoading } = usePageList();
  const deletePage = useDeletePage();
  const { selectedPageId, setSelectedPageId } = usePages();
  const selectedPage = apiPages.find(p => p.id === selectedPageId) ?? null;

  const { data: apiSections = [] } = useSectionList(selectedPageId ?? '');
  const { data: apiSources = [] } = useSourceList(selectedPageId ?? '');
  const updateSource = useUpdateSource(selectedPageId ?? '');
  const deleteSource = useDeleteSource(selectedPageId ?? '');
  const reorderSources = useReorderSources(selectedPageId ?? '');
  const { data: pageTags = [] } = usePageTagList(selectedPageId ?? '');
  const detachTag = useDetachTag(selectedPageId ?? '');

  // Modal states
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [addingSourceSectionId, setAddingSourceSectionId] = useState<string | null | undefined>(undefined);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [movingSource, setMovingSource] = useState<{ sourceId: string; fromSectionId: string | null } | null>(null);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleMoveSource = (sourceId: string, targetSectionId: string) => {
    if (!selectedPageId) return;
    const src = apiSources.find(s => s.id === sourceId);
    if (!src) return;
    updateSource.mutate({
      id: sourceId,
      pageId: selectedPageId,
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
    if (!selectedPageId) return;
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
    reorderSources.mutate({ pageId: selectedPageId, sourceIds: without.map(s => s.id) });
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("sourceId");
    const fromSectionId = e.dataTransfer.getData("fromSectionId") || null;
    const isSameArea = fromSectionId === targetId || (!fromSectionId && targetId === 'unclassified');
    if (isSameArea) {
      if (!selectedPageId) { setDragOverId(null); return; }
      const sectionId = targetId === 'unclassified' ? null : targetId;
      const areaSources = apiSources
        .filter(s => sectionId ? s.section_id === sectionId : s.section_id === null)
        .sort((a, b) => a.position - b.position);
      const without = areaSources.filter(s => s.id !== sourceId);
      const dragged = areaSources.find(s => s.id === sourceId);
      if (dragged) {
        without.push(dragged);
        reorderSources.mutate({ pageId: selectedPageId, sourceIds: without.map(s => s.id) });
      }
    } else {
      handleMoveSource(sourceId, targetId);
    }
    setDragOverId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-100"><Layers className="text-white w-5 h-5" /></div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">LinkHub</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text" placeholder="タイトルで検索..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-all"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => setIsAddingPage(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95">
          <Plus className="w-4 h-4" />新規ページ
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <PageSidebar
          pages={apiPages}
          isLoading={isLoading}
          searchQuery={searchQuery}
          selectedPageId={selectedPageId}
          onSelect={setSelectedPageId}
          onEdit={(page) => setEditingPage(page)}
          onDelete={(page) => { if (confirm('削除しますか？')) { deletePage.mutate(page.id); if (selectedPageId === page.id) setSelectedPageId(null); } }}
        />

        <section className="flex-1 overflow-y-auto p-6 md:p-10">
          {selectedPage ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Page Header */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{selectedPage.title}</h2>
                <p className="mt-3 text-slate-500 leading-relaxed text-lg">{selectedPage.description}</p>
                <div className="mt-6">
                  <TagChips
                    tags={pageTags}
                    onDetach={(tagId) => detachTag.mutate({ pageId: selectedPageId!, tagId })}
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
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
              <div className="p-12 bg-white rounded-[48px] shadow-xl shadow-slate-200/50">
                <Layers className="w-24 h-24 text-indigo-100" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-700">プロジェクトを選んで開始</h3>
                <p className="mt-2 text-slate-400 max-w-xs leading-relaxed">ソースはドラッグ＆ドロップで<br/>自由に整理できます。</p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {isAddingPage && <PageCreateModal onClose={() => setIsAddingPage(false)} />}
      {editingPage && <PageEditModal page={editingPage} onClose={() => setEditingPage(null)} />}
      {isAddingSection && selectedPageId && <SectionAddModal pageId={selectedPageId} onClose={() => setIsAddingSection(false)} />}
      {editingSection && selectedPageId && <SectionEditModal section={editingSection} pageId={selectedPageId} onClose={() => setEditingSection(null)} />}
      {addingSourceSectionId !== undefined && selectedPageId && (
        <SourceAddModal pageId={selectedPageId} sectionId={addingSourceSectionId} onClose={() => setAddingSourceSectionId(undefined)} />
      )}
      {editingSource && selectedPageId && <SourceEditModal source={editingSource} pageId={selectedPageId} onClose={() => setEditingSource(null)} />}
      {movingSource && (
        <SourceMoveModal
          sections={apiSections}
          onMove={(targetSectionId) => { handleMoveSource(movingSource.sourceId, targetSectionId); setMovingSource(null); }}
          onClose={() => setMovingSource(null)}
        />
      )}
      {isManagingTags && selectedPageId && <TagManageModal pageId={selectedPageId} onClose={() => setIsManagingTags(false)} />}
    </div>
  );
}
