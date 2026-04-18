import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Layers,
  Clock,
  FolderPlus,
  ChevronDown,
  GripVertical,
  X,
  Settings2,
} from 'lucide-react';
import SourceRow from './components/SourceRow';
import { usePages } from './hooks/usePages';
import { usePageList } from './hooks/usePageList';
import { useCreatePage } from './hooks/useCreatePage';
import { useUpdatePage } from './hooks/useUpdatePage';
import { useDeletePage } from './hooks/useDeletePage';
import { useSourceList } from './hooks/useSourceList';
import { useCreateSource } from './hooks/useCreateSource';
import { useUpdateSource } from './hooks/useUpdateSource';
import { useDeleteSource } from './hooks/useDeleteSource';
import { useSectionList } from './hooks/useSectionList';
import { useCreateSection } from './hooks/useCreateSection';
import { useUpdateSection } from './hooks/useUpdateSection';
import { useDeleteSection } from './hooks/useDeleteSection';
import { useReorderSources } from './hooks/useReorderSources';
import type { LocalPage, Page, Section, Source } from './types/pages';
import { useForm } from 'react-hook-form';

// --- Initial Data ---
const INITIAL_PAGES: LocalPage[] = [
  {
    id: '1',
    title: 'デザインシステム刷新プロジェクト',
    description: 'FigmaのコンポーネントライブラリとStorybookの同期について。',
    tags: ['UI/UX', 'フロントエンド'],
    updatedAt: '2023-10-25 14:30',
    unclassifiedSources: [
      { id: 's1', type: 'link', label: 'DesignDog (Figma)', url: 'https://designdog.example.com/p/123' },
    ],
    sections: [
      {
        id: 'sec2',
        title: 'コミュニケーション',
        sources: [
          { id: 's3', type: 'link', label: 'Slack スレッド', url: 'https://slack.com/archives/C123/p456' }
        ]
      }
    ]
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: apiPages = [], isLoading } = usePageList();
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const createForm = useForm<{ title: string; description: string }>();
  const editForm = useForm<{ title: string; description: string }>();
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const {
    selectedPageId,
    setSelectedPageId,
    addSection,
    editSection,
    deleteSection,
    moveSource,
  } = usePages(INITIAL_PAGES);
  const selectedPage = apiPages.find(p => p.id === selectedPageId) ?? null;
  const { data: apiSections = [] } = useSectionList(selectedPageId ?? '');
  const createSection = useCreateSection(selectedPageId ?? '');
  const updateSection = useUpdateSection(selectedPageId ?? '');
  const deleteSectionMutation = useDeleteSection(selectedPageId ?? '');
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const { data: apiSources = [] } = useSourceList(selectedPageId ?? '');
  const createSource = useCreateSource(selectedPageId ?? '');
  const updateSource = useUpdateSource(selectedPageId ?? '');
  const deleteSourceMutation = useDeleteSource(selectedPageId ?? '');
  const reorderSources = useReorderSources(selectedPageId ?? '');
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const editSourceForm = useForm<{ title: string; url: string; memo: string; content: string }>();
  useEffect(() => {
    if (editingSource) {
      editSourceForm.reset({ title: editingSource.title, url: editingSource.url ?? '', memo: editingSource.memo, content: editingSource.content });
    }
  }, [editingSource]);

  // Modal States
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isMovingSource, setIsMovingSource] = useState(false);

  // Target States
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<Section | null>(null); // 削除予定・editingSection に移行中
  const [movingSourceData, setMovingSourceData] = useState<{ sourceId: string; fromSectionId: string | null } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // --- CRUD: Pages ---
  const handleAddPage = createForm.handleSubmit((data) => {
    createPage.mutate(
      { title: data.title, description: data.description },
      { onSuccess: () => { setIsAddingPage(false); createForm.reset(); } }
    );
  });

  // --- CRUD: Sections ---
  const handleAddSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPageId) return;
    const fd = new FormData(e.currentTarget);
    const name = fd.get('sectionTitle') as string;
    createSection.mutate(
      { pageId: selectedPageId, name },
      { onSuccess: () => setIsAddingSection(false) }
    );
  };

  const handleEditSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPageId || !editingSection) return;
    const fd = new FormData(e.currentTarget);
    const name = fd.get('editSectionTitle') as string;
    updateSection.mutate(
      { id: editingSection.id, pageId: selectedPageId, name },
      { onSuccess: () => { setEditingSection(null); setIsEditingSection(false); } }
    );
  };

  const handleDeleteSection = (secId: string) => {
    deleteSectionMutation.mutate(secId, {
      onSuccess: () => setIsEditingSection(false),
    });
  };

  // --- CRUD: Sources ---
  const handleAddSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPageId) return;
    const fd = new FormData(e.currentTarget);
    const type = fd.get('sourceType') as 'link' | 'note';
    const title = fd.get('sourceLabel') as string;
    const content = fd.get('sourceContent') as string;
    createSource.mutate(
      {
        pageId: selectedPageId,
        type,
        title,
        url: type === 'link' ? content : undefined,
        content: type === 'note' ? content : undefined,
        section_id: activeSectionId ?? undefined,
      },
      { onSuccess: () => setIsAddingSource(false) }
    );
  };

  const handleDeleteSource = (_secId: string | null, srcId: string) => {
    deleteSourceMutation.mutate(srcId);
  };

  const handleEditSource = editSourceForm.handleSubmit((data) => {
    if (!editingSource || !selectedPageId) return;
    updateSource.mutate(
      { id: editingSource.id, pageId: selectedPageId, title: data.title, url: data.url, memo: data.memo, content: data.content },
      { onSuccess: () => { setEditingSource(null); editSourceForm.reset(); } }
    );
  });

  const handleMoveSource = (sourceId: string, _fromSectionId: string | null, targetSecId: string) => {
    if (!selectedPageId) return;
    const src = apiSources.find(s => s.id === sourceId);
    if (!src) return;
    const sectionId = targetSecId === 'unclassified' ? null : targetSecId;
    updateSource.mutate({
      id: sourceId,
      pageId: selectedPageId,
      title: src.title,
      url: src.url ?? undefined,
      memo: src.memo,
      content: src.content,
      section_id: sectionId,
    });
  };

  // --- Drag & Drop Handlers ---
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
      // セクション間移動: ターゲットのセクションに移動
      handleMoveSource(draggedId, null, sectionId ?? 'unclassified');
      return;
    }

    // 同じエリア内: 並び替え
    const areaSources = apiSources
      .filter(s => sectionId ? s.section_id === sectionId : s.section_id === null)
      .sort((a, b) => a.position - b.position);

    const without = areaSources.filter(s => s.id !== draggedId);
    const insertIndex = without.findIndex(s => s.id === targetId);
    if (insertIndex === -1) return;

    // after=true なら直後、false なら直前に挿入
    without.splice(after ? insertIndex + 1 : insertIndex, 0, areaSources.find(s => s.id === draggedId)!);
    reorderSources.mutate({ pageId: selectedPageId, sourceIds: without.map(s => s.id) });
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("sourceId");
    const fromSectionId = e.dataTransfer.getData("fromSectionId") || null;
    const isSameArea = fromSectionId === targetId || (!fromSectionId && targetId === 'unclassified');

    if (isSameArea) {
      // 同じエリアへのドロップ = 末尾に移動
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
      handleMoveSource(sourceId, fromSectionId, targetId);
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
        <button onClick={() => setIsAddingPage(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"><Plus className="w-4 h-4" />新規ページ</button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white overflow-y-auto hidden md:block">
          <div className="p-4 space-y-1">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2 text-center">PROJECT PAGES</h2>
            {isLoading && <p className="text-xs text-slate-400 text-center">読み込み中...</p>}
            {apiPages
              .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(page => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`group p-3 rounded-xl cursor-pointer transition-all ${selectedPageId === page.id ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate flex-1">{page.title}</h3>
                    <div className="hidden group-hover:flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditingPage(page); editForm.reset({ title: page.title, description: page.description }); setIsEditingPage(true); }}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                      >
                        <Settings2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { if (confirm('削除しますか？')) { deletePage.mutate(page.id); if (selectedPageId === page.id) setSelectedPageId(null); } }}
                        className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px] font-mono"><Clock className="w-3 h-3" />{page.updated_at.slice(0, 10)}</div>
                </div>
              ))
            }
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10">
          {selectedPage ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Page Header */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{selectedPage.title}</h2>
                <p className="mt-3 text-slate-500 leading-relaxed text-lg">{selectedPage.description}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => { setActiveSectionId(null); setIsAddingSource(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
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
                      onMove={(sourceId, fromSectionId) => { setMovingSourceData({ sourceId, fromSectionId }); setIsMovingSource(true); }}
                      onEdit={(src) => setEditingSource(src)}
                      onDelete={handleDeleteSource}
                      onDropOnSource={(draggedId, targetId, secId, after, isSameArea) => handleDropOnSource(draggedId, targetId, secId, after, isSameArea)}
                    />
                  ))}
                  {apiSources.filter(s => s.section_id === null).length === 0 && (
                    <div className="py-8 text-center text-slate-300 text-xs italic">ここにソースをドラッグ</div>
                  )}
                </div>
              </div>

              {/* Sections Area */}
              <div className="space-y-6 pb-20">
                {apiSections.map(section => (
                  <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                    <div
                      onClick={() => { setEditingSection(section); setIsEditingSection(true); }}
                      className="px-6 py-4 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-300" />
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 tracking-tight uppercase text-xs tracking-widest">
                          <ChevronDown className="w-4 h-4 text-indigo-500" />
                          {section.name}
                          <span className="text-[10px] font-normal text-slate-400 ml-2">({apiSources.filter(s => s.section_id === section.id).length})</span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setActiveSectionId(section.id); setIsAddingSource(true); }} className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingSection(section); setIsEditingSection(true); }} className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-colors">
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDrop={(e) => handleDrop(e, section.id)}
                      className={`p-2 space-y-1 transition-colors min-h-[50px] ${dragOverId === section.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' : ''}`}
                    >
                      {apiSources.filter(s => s.section_id === section.id).map(src => (
                        <SourceRow
                          key={src.id} src={src} sectionId={section.id}
                          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                          onMove={(sourceId, fromSectionId) => { setMovingSourceData({ sourceId, fromSectionId }); setIsMovingSource(true); }}
                          onEdit={(src) => setEditingSource(src)}
                          onDelete={handleDeleteSource}
                          onDropOnSource={(draggedId, targetId, secId, after, isSameArea) => handleDropOnSource(draggedId, targetId, secId, after, isSameArea)}
                        />
                      ))}
                      {apiSources.filter(s => s.section_id === section.id).length === 0 && (
                        <div className="py-4 text-center text-slate-200 text-[10px] uppercase tracking-tighter">Empty Section</div>
                      )}
                    </div>
                  </div>
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

      {/* --- Page Edit Modal --- */}
      {isEditingPage && editingPage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <form onSubmit={editForm.handleSubmit((data) => {
              updatePage.mutate(
                { id: editingPage.id, title: data.title, description: data.description },
                { onSuccess: () => { setIsEditingPage(false); setEditingPage(null); } }
              );
            })}>
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-xl text-slate-800 tracking-tight">ページを編集</h2>
                <button type="button" onClick={() => setIsEditingPage(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-5">
                <input
                  {...editForm.register('title', { required: true })}
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="プロジェクトタイトル"
                />
                <textarea
                  {...editForm.register('description')}
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
      )}

      {/* --- Source Edit Modal --- */}
      {editingSource && (
        <div key={editingSource.id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <form onSubmit={handleEditSource}>
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="font-bold text-xl text-slate-800 tracking-tight">ソースを編集</h2>
                <button type="button" onClick={() => setEditingSource(null)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-8 space-y-5">
                <input
                  {...editSourceForm.register('title', { required: true })}
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="タイトル"
                />
                {editingSource.type === 'link' ? (
                  <input
                    {...editSourceForm.register('url')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="URL"
                  />
                ) : (
                  <textarea
                    {...editSourceForm.register('content')}
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
      )}

      {/* --- Modals --- */}
      {(isAddingPage || isAddingSection || isAddingSource || isEditingSection || isMovingSource) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* New Page Modal */}
            {isAddingPage && (
              <form onSubmit={handleAddPage}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-xl text-slate-800 tracking-tight">新規ページ</h2>
                  <button type="button" onClick={() => setIsAddingPage(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 space-y-5">
                  <input
                    {...createForm.register('title', { required: true })}
                    autoFocus
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="プロジェクトタイトル"
                  />
                  <textarea
                    {...createForm.register('description')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                    placeholder="簡単な説明..."
                  />
                  <button
                    type="submit"
                    disabled={createPage.isPending}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {createPage.isPending ? '作成中...' : 'ページを作成'}
                  </button>
                </div>
              </form>
            )}

            {/* Source Add Modal */}
            {isAddingSource && (
              <form onSubmit={handleAddSource}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-xl text-slate-800">ソースを追加</h2>
                  <button type="button" onClick={() => setIsAddingSource(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
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
            )}

            {/* Section Edit Modal */}
            {isEditingSection && editingSection && (
              <form onSubmit={handleEditSection}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-xl text-slate-800">セクション編集</h2>
                  <button type="button" onClick={() => setIsEditingSection(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 space-y-5">
                  <input name="editSectionTitle" defaultValue={editingSection.name} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => handleDeleteSection(editingSection.id)} className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash2 className="w-4 h-4"/>削除</button>
                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">更新</button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">※削除するとセクション内のソースは未分類エリアに残ります</p>
                </div>
              </form>
            )}

            {/* Source Move Modal */}
            {isMovingSource && movingSourceData && selectedPage && (
              <div className="p-8">
                <h2 className="font-bold text-xl text-slate-800 mb-6 tracking-tight">移動先を選択</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  <button
                    onClick={() => { handleMoveSource(movingSourceData.sourceId, movingSourceData.fromSectionId, 'unclassified'); setIsMovingSource(false); }}
                    className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-600 group-hover:text-indigo-700">ページ直下 (未分類)</span>
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  </button>
                  {apiSections.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => { handleMoveSource(movingSourceData.sourceId, movingSourceData.fromSectionId, sec.id); setIsMovingSource(false); }}
                      className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-600 group-hover:text-indigo-700">{sec.name}</span>
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsMovingSource(false)} className="w-full mt-6 py-4 text-slate-400 font-bold hover:text-slate-600">キャンセル</button>
              </div>
            )}

            {/* Section Add Modal */}
            {isAddingSection && (
              <form onSubmit={handleAddSection}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-xl text-slate-800">新規セクション</h2>
                  <button type="button" onClick={() => setIsAddingSection(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 space-y-5">
                  <input name="sectionTitle" required autoFocus className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="例: 参考URL, 議事録など" />
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">セクションを作成</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
