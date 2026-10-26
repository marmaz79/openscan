import React, { useState } from 'react';
import { X, Grid, LayoutGrid, Check, Sparkles } from 'lucide-react';
import { COLLAGE_LAYOUTS, CollageLayout, ScanDoc } from '../types';
import { generateCollagePages } from '../services/imageProcessing';

interface CollageModalProps {
  isOpen: boolean;
  doc: ScanDoc;
  onClose: () => void;
  onCreateCollageDoc: (collageDoc: ScanDoc) => void;
  onToast: (msg: string) => void;
}

export const CollageModal: React.FC<CollageModalProps> = ({
  isOpen,
  doc,
  onClose,
  onCreateCollageDoc,
  onToast,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout>(COLLAGE_LAYOUTS[1]); // 2x2 default
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const sheets = Math.ceil(doc.pages.length / selectedLayout.perSheet);

  const handleCreate = async () => {
    setIsGenerating(true);
    try {
      const pageUrls = doc.pages.map((p) => p.imageUrl);
      const collageSheets = await generateCollagePages(pageUrls, selectedLayout);

      const newDoc: ScanDoc = {
        id: `collage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `Collage - ${doc.name}`,
        created: new Date().toISOString(),
        ocrLang: doc.ocrLang,
        ocrText: `Collage (${selectedLayout.label}) creato da ${doc.name}.\n${doc.ocrText}`,
        pages: collageSheets.map((sheetUrl, idx) => ({
          id: `p-col-${idx + 1}`,
          imageUrl: sheetUrl,
          originalUrl: sheetUrl,
          rotation: 0,
          activeFilter: 'orig',
        })),
      };

      onCreateCollageDoc(newDoc);
      onToast(`Collage creato con ${newDoc.pages.length} foglio/i A4`);
      onClose();
    } catch (err: any) {
      console.error('Collage creation error:', err);
      onToast('Impossibile creare il collage');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Grid className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white">Crea collage</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Scegli quante pagine disporre su ogni singolo foglio A4:
          </p>

          {/* Grid Layout Chips */}
          <div className="grid grid-cols-2 gap-2.5">
            {COLLAGE_LAYOUTS.map((layout) => {
              const isSelected = layout.id === selectedLayout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 opacity-75" />
                    <div>
                      <div className="text-xs font-semibold">{layout.label}</div>
                      <div className="text-[10px] text-slate-400">
                        Griglia {layout.cols} × {layout.rows}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Summary Banner matching Flutter doc */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs text-slate-300 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Riepilogo composizione</span>
            </div>
            <p>
              <strong className="text-emerald-400">{doc.pages.length}</strong> pagine →{' '}
              <strong className="text-emerald-400">{sheets}</strong> foglio/i A4.
            </p>
            <p className="text-[11px] text-slate-400">
              Viene creato un nuovo documento: l’originale rimarrà invariato.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleCreate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generazione in corso...' : 'Crea'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
