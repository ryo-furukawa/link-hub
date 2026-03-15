import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Trash2,
  Layers,
  Clock,
  FolderPlus,
  ChevronDown,
  GripVertical,
  X,
  Settings2,
  MoveHorizontal,
} from 'lucide-react';

// --- Types ---
type Source = {
  id: string;
  type: 'link' | 'text';
  label: string;
  url?: string;
  content?: string;
};

type Section = {
  id: string;
  title: string;
  sources: Source[];
};

type Page = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  updatedAt: string;
  unclassifiedSources: Source[];
  sections: Section[];
};

// --- Initial Data ---
const INITIAL_PAGES: Page[] = [
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

// --- Source Row Component ---
function SourceRow({
  src,
  sectionId = null,
  onDragStart,
  onDragEnd,
  onMove,
  onDelete,
}: {
  src: Source;
  sectionId?: string | null;
  onDragStart: (e: React.DragEvent, sourceId: string, sectionId: string | null) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onMove: (sourceId: string, fromSectionId: string | null) => void;
  onDelete: (sectionId: string | null, sourceId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, src.id, sectionId)}
      onDragEnd={onDragEnd}
      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl group/item transition-all border border-transparent hover:border-slate-100 bg-white cursor-grab active:cursor-grabbing shadow-sm mb-1"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${src.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
          {src.type === 'link' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
        <div className="truncate">
          <p className="font-bold text-sm text-slate-700 truncate">{src.label}</p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono italic">
            {src.type === 'link' ? src.url : src.content}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <button
          onClick={() => onMove(src.id, sectionId)}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white" title="セクション移動"
        >
          <MoveHorizontal className="w-4 h-4" />
        </button>
        {src.type === 'link' && (
          <a href={src.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button onClick={() => onDelete(sectionId, src.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-white">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Modal States
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [isMovingSource, setIsMovingSource] = useState(false);

  // Target States
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingSectionData, setEditingSectionData] = useState<Section | null>(null);
  const [movingSourceData, setMovingSourceData] = useState<{ sourceId: string; fromSectionId: string | null } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // --- Helper: update page in list and sync selectedPage ---
  const updatePages = (updater: (pages: Page[]) => Page[]) => {
    setPages(prev => {
      const updated = updater(prev);
      if (selectedPage) {
        setSelectedPage(updated.find(p => p.id === selectedPage.id) ?? null);
      }
      return updated;
    });
  };

  // --- CRUD: Pages ---
  const handleAddPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newPage: Page = {
      id: Date.now().toString(),
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      tags: (fd.get('tags') as string).split(',').map(t => t.trim()).filter(t => t),
      updatedAt: new Date().toLocaleString(),
      unclassifiedSources: [],
      sections: []
    };
    setPages(prev => [newPage, ...prev]);
    setIsAddingPage(false);
  };

  // --- CRUD: Sections ---
  const handleAddSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPage) return;
    const fd = new FormData(e.currentTarget);
    const title = fd.get('sectionTitle') as string;
    const newSection: Section = { id: Date.now().toString(), title, sources: [] };
    updatePages(prev => prev.map(p => p.id === selectedPage.id ? { ...p, sections: [...p.sections, newSection] } : p));
    setIsAddingSection(false);
  };

  const handleEditSection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPage || !editingSectionData) return;
    const fd = new FormData(e.currentTarget);
    const newTitle = fd.get('editSectionTitle') as string;
    updatePages(prev => prev.map(p => p.id === selectedPage.id ? { ...p, sections: p.sections.map(s => s.id === editingSectionData.id ? { ...s, title: newTitle } : s) } : p));
    setIsEditingSection(false);
  };

  const deleteSection = (secId: string) => {
    if (!selectedPage) return;
    const section = selectedPage.sections.find(s => s.id === secId);
    if (!section) return;
    updatePages(prev => prev.map(p => {
      if (p.id === selectedPage.id) {
        return {
          ...p,
          unclassifiedSources: [...p.unclassifiedSources, ...section.sources],
          sections: p.sections.filter(s => s.id !== secId)
        };
      }
      return p;
    }));
    setIsEditingSection(false);
  };

  // --- CRUD: Sources ---
  const handleAddSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPage) return;
    const fd = new FormData(e.currentTarget);
    const type = fd.get('sourceType') as 'link' | 'text';
    const label = fd.get('sourceLabel') as string;
    const content = fd.get('sourceContent') as string;

    const source: Source = {
      id: Date.now().toString(),
      type,
      label,
      ...(type === 'link' ? { url: content } : { content }),
    };

    updatePages(prev => prev.map(p => {
      if (p.id === selectedPage.id) {
        if (activeSectionId) {
          return { ...p, sections: p.sections.map(s => s.id === activeSectionId ? { ...s, sources: [...s.sources, source] } : s), updatedAt: new Date().toLocaleString() };
        }
        return { ...p, unclassifiedSources: [...p.unclassifiedSources, source], updatedAt: new Date().toLocaleString() };
      }
      return p;
    }));
    setIsAddingSource(false);
  };

  const deleteSource = (secId: string | null, srcId: string) => {
    if (!selectedPage) return;
    updatePages(prev => prev.map(p => {
      if (p.id === selectedPage.id) {
        if (secId) {
          return { ...p, sections: p.sections.map(s => s.id === secId ? { ...s, sources: s.sources.filter(src => src.id !== srcId) } : s) };
        }
        return { ...p, unclassifiedSources: p.unclassifiedSources.filter(src => src.id !== srcId) };
      }
      return p;
    }));
  };

  const moveSource = (sourceId: string, fromSectionId: string | null, targetSecId: string) => {
    if (!selectedPage) return;
    updatePages(prev => prev.map(p => {
      if (p.id === selectedPage.id) {
        let sourceToMove: Source | undefined;
        if (fromSectionId) {
          sourceToMove = p.sections.find(s => s.id === fromSectionId)?.sources.find(src => src.id === sourceId);
        } else {
          sourceToMove = p.unclassifiedSources.find(src => src.id === sourceId);
        }
        if (!sourceToMove) return p;

        let newUnclassified = fromSectionId ? p.unclassifiedSources : p.unclassifiedSources.filter(s => s.id !== sourceId);
        let newSections = p.sections.map(s => s.id === fromSectionId ? { ...s, sources: s.sources.filter(src => src.id !== sourceId) } : s);

        if (targetSecId === 'unclassified') {
          newUnclassified = [...newUnclassified, sourceToMove];
        } else {
          newSections = newSections.map(s => s.id === targetSecId ? { ...s, sources: [...s.sources, sourceToMove!] } : s);
        }

        return { ...p, unclassifiedSources: newUnclassified, sections: newSections, updatedAt: new Date().toLocaleString() };
      }
      return p;
    }));
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

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("sourceId");
    const fromSectionId = e.dataTransfer.getData("fromSectionId") || null;

    if (fromSectionId === targetId || (!fromSectionId && targetId === 'unclassified')) {
      setDragOverId(null);
      return;
    }

    moveSource(sourceId, fromSectionId, targetId);
    setDragOverId(null);
  };

  const filteredPages = useMemo(() => {
    return pages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pages, searchQuery]);

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
            {filteredPages.map(page => (
              <div
                key={page.id} onClick={() => setSelectedPage(page)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${selectedPage?.id === page.id ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <h3 className="font-bold text-sm truncate">{page.title}</h3>
                <div className="flex items-center gap-2 mt-1 opacity-60 text-[10px] font-mono"><Clock className="w-3 h-3" />{page.updatedAt}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-6 md:p-10">
          {selectedPage ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Page Header */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex gap-2 mb-4">
                  {selectedPage.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">#{tag}</span>
                  ))}
                </div>
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
                  {selectedPage.unclassifiedSources.map(src => (
                    <SourceRow
                      key={src.id} src={src} sectionId={null}
                      onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                      onMove={(sourceId, fromSectionId) => { setMovingSourceData({ sourceId, fromSectionId }); setIsMovingSource(true); }}
                      onDelete={deleteSource}
                    />
                  ))}
                  {selectedPage.unclassifiedSources.length === 0 && (
                    <div className="py-8 text-center text-slate-300 text-xs italic">ここにソースをドラッグ</div>
                  )}
                </div>
              </div>

              {/* Sections Area */}
              <div className="space-y-6 pb-20">
                {selectedPage.sections.map(section => (
                  <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                    <div
                      onClick={() => { setEditingSectionData(section); setIsEditingSection(true); }}
                      className="px-6 py-4 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-300" />
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 tracking-tight uppercase text-xs tracking-widest">
                          <ChevronDown className="w-4 h-4 text-indigo-500" />
                          {section.title}
                          <span className="text-[10px] font-normal text-slate-400 ml-2">({section.sources.length})</span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setActiveSectionId(section.id); setIsAddingSource(true); }} className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingSectionData(section); setIsEditingSection(true); }} className="p-2 hover:bg-slate-200 text-slate-400 rounded-lg transition-colors">
                          <Settings2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDrop={(e) => handleDrop(e, section.id)}
                      className={`p-2 space-y-1 transition-colors min-h-[50px] ${dragOverId === section.id ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-200' : ''}`}
                    >
                      {section.sources.map(src => (
                        <SourceRow
                          key={src.id} src={src} sectionId={section.id}
                          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                          onMove={(sourceId, fromSectionId) => { setMovingSourceData({ sourceId, fromSectionId }); setIsMovingSource(true); }}
                          onDelete={deleteSource}
                        />
                      ))}
                      {section.sources.length === 0 && (
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
                  <input name="title" required autoFocus className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="プロジェクトタイトル" />
                  <textarea name="description" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="簡単な説明..." />
                  <input name="tags" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="タグ (カンマ区切り)" />
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">ページを作成</button>
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
                      <input type="radio" name="sourceType" value="text" className="hidden peer" />
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
            {isEditingSection && editingSectionData && (
              <form onSubmit={handleEditSection}>
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-bold text-xl text-slate-800">セクション編集</h2>
                  <button type="button" onClick={() => setIsEditingSection(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 space-y-5">
                  <input name="editSectionTitle" defaultValue={editingSectionData.title} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => deleteSection(editingSectionData.id)} className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash2 className="w-4 h-4"/>削除</button>
                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">更新</button>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">※削除すると中のソースは未分類エリアに戻ります</p>
                </div>
              </form>
            )}

            {/* Source Move Modal */}
            {isMovingSource && movingSourceData && selectedPage && (
              <div className="p-8">
                <h2 className="font-bold text-xl text-slate-800 mb-6 tracking-tight">移動先を選択</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  <button
                    onClick={() => { moveSource(movingSourceData.sourceId, movingSourceData.fromSectionId, 'unclassified'); setIsMovingSource(false); }}
                    className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-600 group-hover:text-indigo-700">ページ直下 (未分類)</span>
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  </button>
                  {selectedPage.sections.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => { moveSource(movingSourceData.sourceId, movingSourceData.fromSectionId, sec.id); setIsMovingSource(false); }}
                      className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-600 group-hover:text-indigo-700">{sec.title}</span>
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
