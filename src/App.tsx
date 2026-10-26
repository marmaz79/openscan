import React, { useState, useEffect } from 'react';
import { Scan, Plus, Info, Layers, RefreshCw } from 'lucide-react';
import { ScanDoc } from './types';
import { getAllDocs, saveDoc, deleteDoc } from './services/storage';
import { getSampleDocuments } from './data/sampleDocs';
import { Navbar } from './components/Navbar';
import { DocumentCard } from './components/DocumentCard';
import { DocViewer } from './components/DocViewer';
import { ScannerModal } from './components/ScannerModal';
import { downloadDocPdf } from './services/pdf';
import { recognizeImagesText } from './services/ocr';

export const App: React.FC = () => {
  const [docs, setDocs] = useState<ScanDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<ScanDoc | null>(null);

  // Modals & UI states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [targetDocForPages, setTargetDocForPages] = useState<ScanDoc | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial documents
  useEffect(() => {
    loadDocuments();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let storedDocs = await getAllDocs();
      if (storedDocs.length === 0) {
        // Seed with sample documents
        const sampleDocs = getSampleDocuments();
        for (const sample of sampleDocs) {
          await saveDoc(sample);
        }
        storedDocs = sampleDocs;
      }
      setDocs(storedDocs);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new document from captured/imported images
  const handleCreateDocument = async (images: string[]) => {
    if (images.length === 0) return;

    if (targetDocForPages) {
      // Appending pages to existing doc
      const newPages = images.map((imgUrl, i) => ({
        id: `p-${Date.now()}-${i}`,
        imageUrl: imgUrl,
        originalUrl: imgUrl,
        rotation: 0,
        activeFilter: 'orig' as const,
      }));

      const updated: ScanDoc = {
        ...targetDocForPages,
        pages: [...targetDocForPages.pages, ...newPages],
      };

      await saveDoc(updated);
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (selectedDoc?.id === updated.id) {
        setSelectedDoc(updated);
      }
      setTargetDocForPages(null);
      showToast(`Aggiunte ${images.length} pagine a "${updated.name}"`);
      return;
    }

    const now = new Date();
    const twoDigits = (n: number) => n.toString().padStart(2, '0');
    const docName = `Scansione ${twoDigits(now.getDate())}-${twoDigits(
      now.getMonth() + 1
    )}-${now.getFullYear()} ${twoDigits(now.getHours())}.${twoDigits(now.getMinutes())}`;

    const newDoc: ScanDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: docName,
      created: now.toISOString(),
      ocrLang: 'latin',
      ocrText: '',
      pages: images.map((imgUrl, i) => ({
        id: `p-${Date.now()}-${i}`,
        imageUrl: imgUrl,
        originalUrl: imgUrl,
        rotation: 0,
        activeFilter: 'orig' as const,
      })),
    };

    await saveDoc(newDoc);
    setDocs((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    showToast(`Nuova scansione creata: ${docName}`);

    // Asynchronously trigger OCR in background matching OpenScan unawaited(indexDoc)
    recognizeImagesText(images, 'latin')
      .then(async (extracted) => {
        if (extracted) {
          const withOcr = { ...newDoc, ocrText: extracted };
          await saveDoc(withOcr);
          setDocs((prev) => prev.map((d) => (d.id === withOcr.id ? withOcr : d)));
          if (selectedDoc?.id === withOcr.id) {
            setSelectedDoc(withOcr);
          }
        }
      })
      .catch((e) => console.warn('Background OCR silent note:', e));
  };

  const handleImportFiles = (files: FileList) => {
    const images: string[] = [];
    let processed = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          images.push(e.target.result as string);
        }
        processed++;
        if (processed === files.length) {
          handleCreateDocument(images);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateDoc = async (updated: ScanDoc) => {
    await saveDoc(updated);
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    if (selectedDoc?.id === updated.id) {
      setSelectedDoc(updated);
    }
  };

  const handleDeleteDoc = async (docToDelete: ScanDoc) => {
    if (window.confirm(`Eliminare definitivamente "${docToDelete.name}"?`)) {
      await deleteDoc(docToDelete.id);
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
      if (selectedDoc?.id === docToDelete.id) {
        setSelectedDoc(null);
      }
      showToast('Documento eliminato');
    }
  };

  const handleRenameDoc = async (docToRename: ScanDoc) => {
    const newName = prompt('Rinomina documento:', docToRename.name);
    if (newName && newName.trim() && newName.trim() !== docToRename.name) {
      const updated = { ...docToRename, name: newName.trim() };
      await handleUpdateDoc(updated);
      showToast('Documento rinominato');
    }
  };

  // Filter documents based on query
  const q = searchQuery.toLowerCase().trim();
  const filteredDocs = q
    ? docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) || (d.ocrText && d.ocrText.toLowerCase().includes(q))
      )
    : docs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenScanner={() => {
          setTargetDocForPages(null);
          setScannerOpen(true);
        }}
        onImportFiles={handleImportFiles}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm">Caricamento archivio documenti...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty state matching Flutter HomeScreen */
          <div className="py-20 text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1.5">
              {docs.length === 0 ? 'Nessun documento' : 'Nessun risultato trovato'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {docs.length === 0
                ? 'Tocca “Scansiona” o importa immagini per iniziare la tua prima scansione.'
                : `Nessuna corrispondenza per "${searchQuery}". Prova con un altro termine.`}
            </p>
            {docs.length === 0 && (
              <button
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <Scan className="w-4 h-4" />
                Scansiona documento
              </button>
            )}
          </div>
        ) : (
          /* Grid View matching Flutter SliverGridDelegateWithFixedCrossAxisCount */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpen={(d) => setSelectedDoc(d)}
                onDelete={handleDeleteDoc}
                onRename={handleRenameDoc}
                onDownloadPdf={downloadDocPdf}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button matching Flutter HomeScreen floatingActionButton */}
      {!selectedDoc && (
        <div className="fixed right-6 bottom-6 z-20">
          <button
            onClick={() => {
              setTargetDocForPages(null);
              setScannerOpen(true);
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
            title="Scansiona nuovo documento"
          >
            <Scan className="w-5 h-5" />
            <span>Scansiona</span>
          </button>
        </div>
      )}

      {/* Detail Document Viewer modal/screen */}
      {selectedDoc && (
        <DocViewer
          doc={selectedDoc}
          onBack={() => setSelectedDoc(null)}
          onUpdateDoc={handleUpdateDoc}
          onDeleteDoc={handleDeleteDoc}
          onAddPages={(target) => {
            setTargetDocForPages(target);
            setScannerOpen(true);
          }}
          onCreateCollageDoc={(collage) => {
            saveDoc(collage);
            setDocs((prev) => [collage, ...prev]);
            setSelectedDoc(collage);
          }}
          onToast={showToast}
        />
      )}

      {/* Camera / Multi-Page Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          setTargetDocForPages(null);
        }}
        onComplete={handleCreateDocument}
      />

      {/* SnackBar / Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs font-medium shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
