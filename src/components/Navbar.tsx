import React, { useRef } from 'react';
import { Search, Image as ImageIcon, Scan, ShieldCheck, X } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenScanner: () => void;
  onImportFiles: (files: FileList) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenScanner,
  onImportFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">OpenScan</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> 100% Offline
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400">Scanner di documenti open source &amp; OCR</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              multiple
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importa dalla galleria"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Importa</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
            >
              <Scan className="w-4 h-4" />
              <span>Scansiona</span>
            </button>
          </div>
        </div>

        {/* Search Bar matching Flutter AppBar bottom SearchBar */}
        <div className="mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca nel nome o nel testo (OCR)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/90 text-slate-100 placeholder-slate-400 border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
