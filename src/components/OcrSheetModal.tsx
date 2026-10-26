import React, { useState } from 'react';
import { X, Copy, RefreshCw, FileDown, Check, Globe, Sparkles } from 'lucide-react';
import { OcrLang, OCR_LANGUAGES, ScanDoc } from '../types';
import { recognizeImagesText } from '../services/ocr';
import { downloadDocText } from '../services/pdf';

interface OcrSheetModalProps {
  isOpen: boolean;
  doc: ScanDoc;
  onClose: () => void;
  onSave: (newOcrText: string, newLang: OcrLang) => void;
  onToast: (msg: string) => void;
}

export const OcrSheetModal: React.FC<OcrSheetModalProps> = ({
  isOpen,
  doc,
  onClose,
  onSave,
  onToast,
}) => {
  const [text, setText] = useState(doc.ocrText);
  const [lang, setLang] = useState<OcrLang>(doc.ocrLang);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [percent, setPercent] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
      setText(doc.ocrText);
      setLang(doc.ocrLang);
      setIsProcessing(false);
    }
  }, [isOpen, doc]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    onToast('Testo copiato negli appunti');
  };

  const handleDownloadTxt = () => {
    const updatedDoc: ScanDoc = { ...doc, ocrText: text };
    downloadDocText(updatedDoc);
    onToast('File .txt scaricato');
  };

  const handleRerunOcr = async () => {
    if (doc.pages.length === 0) {
      onToast('Nessuna pagina disponibile per l’OCR');
      return;
    }
    setIsProcessing(true);
    setProgressStatus('Inizializzazione motore OCR on-device...');
    setPercent(5);

    try {
      const pageUrls = doc.pages.map((p) => p.imageUrl);
      const recognized = await recognizeImagesText(pageUrls, lang, ({ status, progress }) => {
        setProgressStatus(status);
        setPercent(progress);
      });

      setText(recognized);
      onToast('Riconoscimento OCR completato');
    } catch (e: any) {
      console.error('OCR run failed:', e);
      onToast(`Errore OCR: ${e.message || e}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onSave(text, lang);
    onClose();
    onToast('Testo OCR salvato');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Testo Riconosciuto (OCR)</h3>
              <p className="text-[11px] text-slate-400">Riconoscimento caratteri on-device senza cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Language selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Lingua / Alfabeto OCR
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as OcrLang)}
              disabled={isProcessing}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            >
              {OCR_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Progress bar during OCR */}
          {isProcessing && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-medium">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {progressStatus}
                </span>
                <span>{percent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Testo estratto</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nessun testo riconosciuto. Tocca 'Rifai OCR' per scansionare le pagine del documento."
              rows={11}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500/50 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions matching OpenScan buttons */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Copia negli appunti"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copia</span>
            </button>

            <button
              onClick={handleRerunOcr}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Rilancia OCR"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Rifai OCR</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Esporta file di testo"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>.txt</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salva</span>
          </button>
        </div>
      </div>
    </div>
  );
};
