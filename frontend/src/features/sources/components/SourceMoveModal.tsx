import { ChevronDown } from 'lucide-react';
import type { Section } from '../../../types/pages';

export default function SourceMoveModal({
  sections,
  onMove,
  onClose,
}: {
  sections: Section[];
  onMove: (targetSectionId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <h2 className="font-bold text-xl text-slate-800 mb-6 tracking-tight">移動先を選択</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            <button
              onClick={() => onMove('unclassified')}
              className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
            >
              <span className="font-bold text-slate-600 group-hover:text-indigo-700">ページ直下 (未分類)</span>
              <ChevronDown className="w-4 h-4 text-slate-300" />
            </button>
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => onMove(sec.id)}
                className="w-full p-4 text-left rounded-2xl hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 transition-all group flex items-center justify-between"
              >
                <span className="font-bold text-slate-600 group-hover:text-indigo-700">{sec.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-full mt-6 py-4 text-slate-400 font-bold hover:text-slate-600">キャンセル</button>
        </div>
      </div>
    </div>
  );
}
