import { useState } from 'react';
import { LayoutGrid, Layers, List, Plus, Search } from 'lucide-react';
import { Routes, Route, useNavigate, useMatch } from 'react-router-dom';

import { usePageList } from './features/pages/hooks/usePageList';
import { useDeletePage } from './features/pages/hooks/useDeletePage';

import PageSidebar from './features/pages/components/PageSidebar';
import PageGrid from './features/pages/components/PageGrid';
import PageCreateModal from './features/pages/components/PageCreateModal';
import PageEditModal from './features/pages/components/PageEditModal';
import PageDetail from './features/pages/components/PageDetail';

import type { Page } from './types/pages';

type ViewMode = 'list' | 'grid';

function PageDetailWrapper() {
  const match = useMatch('/pages/:id');
  const id = match?.params.id;
  if (!id) return null;
  return <PageDetail pageId={id} />;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { data: apiPages = [], isLoading } = usePageList();
  const deletePage = useDeletePage();
  const navigate = useNavigate();
  const match = useMatch('/pages/:id');
  const selectedPageId = match?.params.id ?? null;

  const [isAddingPage, setIsAddingPage] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const handleDelete = (page: Page) => {
    if (confirm('削除しますか？')) {
      deletePage.mutate(page.id);
      if (selectedPageId === page.id) navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
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
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="リスト表示"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="グリッド表示"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setIsAddingPage(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95">
            <Plus className="w-4 h-4" />新規ページ
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {viewMode === 'list' ? (
          <>
            <PageSidebar
              pages={apiPages}
              isLoading={isLoading}
              searchQuery={searchQuery}
              selectedPageId={selectedPageId}
              onSelect={(id) => navigate(`/pages/${id}`)}
              onEdit={(page) => setEditingPage(page)}
              onDelete={handleDelete}
            />
            <section className="flex-1 overflow-y-auto p-6 md:p-10">
              <Routes>
                <Route path="/" element={
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
                    <div className="p-12 bg-white rounded-[48px] shadow-xl shadow-slate-200/50">
                      <Layers className="w-24 h-24 text-indigo-100" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-700">プロジェクトを選んで開始</h3>
                      <p className="mt-2 text-slate-400 max-w-xs leading-relaxed">ソースはドラッグ＆ドロップで<br/>自由に整理できます。</p>
                    </div>
                  </div>
                } />
                <Route path="/pages/:id" element={<PageDetailWrapper />} />
              </Routes>
            </section>
          </>
        ) : (
          <section className="flex-1 overflow-y-auto p-6 md:p-10">
            <Routes>
              <Route path="/" element={
                <PageGrid
                  pages={apiPages}
                  isLoading={isLoading}
                  searchQuery={searchQuery}
                  onSelect={(id) => { navigate(`/pages/${id}`); setViewMode('list'); }}
                  onEdit={(page) => setEditingPage(page)}
                  onDelete={handleDelete}
                />
              } />
              <Route path="/pages/:id" element={<PageDetailWrapper />} />
            </Routes>
          </section>
        )}
      </main>

      {isAddingPage && <PageCreateModal onClose={() => setIsAddingPage(false)} />}
      {editingPage && <PageEditModal page={editingPage} onClose={() => setEditingPage(null)} />}
    </div>
  );
}
