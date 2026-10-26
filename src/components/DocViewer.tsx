import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  MoreVertical,
  Wand2,
  RotateCw,
  Crop,
  Plus,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Edit2,
  Share2,
  Grid,
} from 'lucide-react';
import { ScanDoc, ScanFilter, OcrLang } from '../types';
import { applyImageFilter, rotateImage90 } from '../services/imageProcessing';
import { downloadDocPdf, downloadPageImage } from '../services/pdf';
import { CropEditorModal } from './CropEditorModal';
import { OcrSheetModal } from './OcrSheetModal';
import { CollageModal } from './CollageModal';

interface DocViewerProps {
  doc: ScanDoc;
  onBack: () => void;
  onUpdateDoc: (updated: ScanDoc) => void;
  onDeleteDoc: (doc: ScanDoc) => void;
  onAddPages: (targetDoc: ScanDoc) => void;
  onCreateCollageDoc: (collageDoc: ScanDoc) => void;
  onToast: (msg: string) => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({
  doc,
  onBack,
  onUpdateDoc,
  onDeleteDoc,
  onAddPages,
  onCreateCollageDoc,
  onToast,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isBusy, setIsBusy] = useState(false);

  // Modals & Menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [collageModalOpen, setCollageModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(doc.name);

  const menuRef = React.useRef<HTMLDivElement>(null);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);

  const currentPage = doc.pages[currentPageIndex] || doc.pages[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== doc.name) {
      const updated = { ...doc, name: trimmed };
      onUpdateDoc(updated);
      onToast('Documento rinominato');
    }
    setIsEditingTitle(false);
  };

  const handleFilter = async (filter: ScanFilter) => {
    if (!currentPage || isBusy) return;
    setIsBusy(true);
    setFilterMenuOpen(false);

    try {
      let newUrl = '';
      if (filter === 'orig') {
        newUrl = await applyImageFilter(currentPage.originalUrl, 'orig', currentPage.rotation);
      } else {
        newUrl = await applyImageFilter(currentPage.originalUrl, filter, currentPage.rotation);
      }

      const updatedPages = [...doc.pages];
      updatedPages[currentPageIndex] = {
        ...currentPage,
        imageUrl: newUrl,
        activeFilter: filter,
      };

      onUpdateDoc({ ...doc, pages: updatedPages });
      onToast(
        filter === 'auto'
          ? 'Filtro Migliora applicato'
          : filter === 'gray'
          ? 'Scala di grigi applicata'
          : filter === 'bw'
          ? 'Bianco e nero applicato'
          : 'Originale ripristinato'
      );
    } catch (err: any) {
      console.error('Filter error:', err);
      onToast('Errore durante l’applicazione del filtro');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRotate = async () => {
    if (!currentPage || isBusy) return;
    setIsBusy(true);

    try {
      const newRotation = (currentPage.rotation + 90) % 360;
      const rotatedCurrent = await rotateImage90(currentPage.imageUrl);
      const rotatedOrig = await rotateImage90(currentPage.originalUrl);

      const updatedPages = [...doc.pages];
      updatedPages[currentPageIndex] = {
        ...currentPage,
        imageUrl: rotatedCurrent,
        originalUrl: rotatedOrig,
        rotation: newRotation,
      };

      onUpdateDoc({ ...doc, pages: updatedPages });
      onToast('Pagina ruotata di 90°');
    } catch (err: any) {
      console.error('Rotate error:', err);
      onToast('Errore durante la rotazione');
    } finally {
      setIsBusy(false);
    }
  };

  const handleApplyCrop = (croppedDataUrl: string) => {
    if (!currentPage) return;
    const updatedPages = [...doc.pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      imageUrl: croppedDataUrl,
      originalUrl: croppedDataUrl, // New crop becomes the reference
    };
    onUpdateDoc({ ...doc, pages: updatedPages });
    onToast('Ritaglio applicato con successo');
  };

  const handleDeleteCurrentPage = () => {
    if (doc.pages.length <= 1) {
      if (window.confirm('Eliminare l’ultima pagina? Verrà eliminato l’intero documento.')) {
        onDeleteDoc(doc);
        onBack();
      }
      return;
    }

    if (window.confirm(`Eliminare la pagina ${currentPageIndex + 1}?`)) {
      const updatedPages = doc.pages.filter((_, i) => i !== currentPageIndex);
      const nextIndex = Math.min(currentPageIndex, updatedPages.length - 1);
      setCurrentPageIndex(nextIndex);
      onUpdateDoc({ ...doc, pages: updatedPages });
      onToast('Pagina eliminata');
    }
  };

  const handleExportPdf = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await downloadDocPdf(doc);
      onToast('Download PDF avviato (senza filigrana)');
    } catch (err: any) {
      console.error('PDF export error:', err);
      onToast('Errore durante l’esportazione PDF');
    } finally {
      setIsBusy(false);
    }
  };

  const handleExportImages = () => {
    doc.pages.forEach((p, idx) => {
      downloadPageImage(p.imageUrl, `${doc.name}_pag_${idx + 1}.jpg`);
    });
    onToast(`Salvate ${doc.pages.length} immagini`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-3 text-white z-30">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Torna all'elenco"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
                className="px-2.5 py-1 text-sm bg-slate-800 border border-emerald-500 rounded-lg text-white focus:outline-none w-full"
              />
            </div>
          ) : (
            <div
              onClick={() => {
                setTitleInput(doc.name);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-2 cursor-pointer group min-w-0"
              title="Tocca per rinominare"
            >
              <h2 className="text-base font-semibold truncate group-hover:text-emerald-400 transition-colors">
                {doc.name}
              </h2>
              <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 opacity-60 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleExportPdf}
            disabled={isBusy}
            title="Condividi / Scarica PDF A4 senza filigrana"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta PDF</span>
          </button>

          {/* Overflow Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleExportImages();
                  }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>Condividi come immagini</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setCollageModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Grid className="w-4 h-4 text-emerald-400" />
                  <span>Crea collage…</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setTitleInput(doc.name);
                    setIsEditingTitle(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                  <span>Rinomina</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Viewer Canvas */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
        {currentPage ? (
          <div
            className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={currentPage.imageUrl}
              alt={`Pagina ${currentPageIndex + 1}`}
              className="max-w-[90vw] max-h-[72vh] object-contain rounded-lg shadow-2xl border border-slate-800/80 bg-white"
            />
          </div>
        ) : (
          <div className="text-slate-500 text-sm">Nessuna pagina trovata</div>
        )}

        {/* Page counter pill badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-lg">
          {currentPageIndex + 1} / {doc.pages.length}
        </div>

        {/* Left / Right Carousel Controls */}
        {doc.pages.length > 1 && (
          <>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-20 disabled:pointer-events-none border border-slate-700/60 shadow-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(doc.pages.length - 1, prev + 1))}
              disabled={currentPageIndex === doc.pages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 disabled:opacity-20 disabled:pointer-events-none border border-slate-700/60 shadow-xl transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Rimpicciolisci"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Ingrandisci"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Tool Bar matching Flutter DocScreen BottomAppBar */}
      <footer className="px-4 py-2.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-around gap-2 text-slate-300">
          {/* Filters Menu Button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              disabled={isBusy}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
              title="Filtri"
            >
              <Wand2 className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px]">Filtri</span>
            </button>

            {filterMenuOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => handleFilter('auto')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  Migliora (auto)
                </button>
                <button
                  onClick={() => handleFilter('gray')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  Scala di grigi
                </button>
                <button
                  onClick={() => handleFilter('bw')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  Bianco e nero
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => handleFilter('orig')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Ripristina originale
                </button>
              </div>
            )}
          </div>

          {/* Rotate 90 deg */}
          <button
            onClick={handleRotate}
            disabled={isBusy}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Ruota di 90°"
          >
            <RotateCw className="w-5 h-5" />
            <span className="text-[11px]">Ruota</span>
          </button>

          {/* Crop */}
          <button
            onClick={() => setCropModalOpen(true)}
            disabled={isBusy}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Ritaglio manuale bordi"
          >
            <Crop className="w-5 h-5 text-teal-400" />
            <span className="text-[11px]">Ritaglia</span>
          </button>

          {/* Add Pages */}
          <button
            onClick={() => onAddPages(doc)}
            disabled={isBusy}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Aggiungi pagine"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[11px]">Aggiungi</span>
          </button>

          {/* OCR text sheet */}
          <button
            onClick={() => setOcrModalOpen(true)}
            disabled={isBusy}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
            title="Riconoscimento testo (OCR)"
          >
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="text-[11px]">Testo (OCR)</span>
          </button>

          {/* Delete Page */}
          <button
            onClick={handleDeleteCurrentPage}
            disabled={isBusy}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
            title="Elimina questa pagina"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[11px]">Elimina</span>
          </button>
        </div>
      </footer>

      {/* Sub-modals */}
      {currentPage && (
        <CropEditorModal
          isOpen={cropModalOpen}
          imageUrl={currentPage.imageUrl}
          onClose={() => setCropModalOpen(false)}
          onApplyCrop={handleApplyCrop}
        />
      )}

      <OcrSheetModal
        isOpen={ocrModalOpen}
        doc={doc}
        onClose={() => setOcrModalOpen(false)}
        onSave={(newOcrText, newLang) => {
          onUpdateDoc({ ...doc, ocrText: newOcrText, ocrLang: newLang });
        }}
        onToast={onToast}
      />

      <CollageModal
        isOpen={collageModalOpen}
        doc={doc}
        onClose={() => setCollageModalOpen(false)}
        onCreateCollageDoc={onCreateCollageDoc}
        onToast={onToast}
      />
    </div>
  );
};
