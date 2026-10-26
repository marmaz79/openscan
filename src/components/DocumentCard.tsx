import React from 'react';
import { FileText, MoreVertical, Trash2, Edit3, Download, Layers } from 'lucide-react';
import { ScanDoc } from '../types';

interface DocumentCardProps {
  doc: ScanDoc;
  onOpen: (doc: ScanDoc) => void;
  onDelete: (doc: ScanDoc) => void;
  onRename: (doc: ScanDoc) => void;
  onDownloadPdf: (doc: ScanDoc) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onOpen,
  onDelete,
  onRename,
  onDownloadPdf,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const thumbUrl = doc.pages.length > 0 ? doc.pages[0].imageUrl : null;
  const formattedDate = new Date(doc.created).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="group relative bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 flex flex-col">
      {/* Clickable Image Thumbnail Area */}
      <div
        onClick={() => onOpen(doc)}
        className="relative w-full aspect-[4/5] bg-slate-900/90 cursor-pointer overflow-hidden flex items-center justify-center"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={doc.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs mt-2">Nessuna pagina</span>
          </div>
        )}

        {/* Page Count Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1 shadow-sm">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>{doc.pages.length} pag.</span>
        </div>

        {/* OCR indicator if recognized text exists */}
        {doc.ocrText && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 shadow-sm">
            OCR ✓
          </div>
        )}
      </div>

      {/* Info & Menu */}
      <div className="p-3.5 flex items-center justify-between gap-2">
        <div onClick={() => onOpen(doc)} className="cursor-pointer min-w-0 flex-1">
          <h3
            className="text-sm font-semibold text-slate-100 truncate hover:text-emerald-400 transition-colors"
            title={doc.name}
          >
            {doc.name}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
        </div>

        {/* More actions dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            title="Opzioni documento"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1 z-40 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename(doc);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rinomina</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDownloadPdf(doc);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Esporta PDF</span>
              </button>
              <div className="h-px bg-slate-800 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(doc);
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
