import React, { useState, useRef, useEffect } from 'react';
import { Check, X, RotateCcw, Crop } from 'lucide-react';
import { cropImageRect } from '../services/imageProcessing';

interface CropEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onApplyCrop: (croppedDataUrl: string) => void;
}

export const CropEditorModal: React.FC<CropEditorModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onApplyCrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop rectangle as percentages [0, 100]
  const [crop, setCrop] = useState({ top: 5, left: 5, right: 5, bottom: 5 });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCrop({ top: 5, left: 5, right: 5, bottom: 5 });
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  const handlePointerDown = (handle: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveHandle(handle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    setCrop((prev) => {
      const next = { ...prev };
      if (activeHandle.includes('t')) {
        next.top = Math.min(yPct, 100 - prev.bottom - 5);
      }
      if (activeHandle.includes('b')) {
        next.bottom = Math.min(100 - yPct, 100 - prev.top - 5);
      }
      if (activeHandle.includes('l')) {
        next.left = Math.min(xPct, 100 - prev.right - 5);
      }
      if (activeHandle.includes('r')) {
        next.right = Math.min(100 - xPct, 100 - prev.left - 5);
      }
      return next;
    });
  };

  const handlePointerUp = () => {
    setActiveHandle(null);
  };

  const handleConfirm = async () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const x = (crop.left / 100) * naturalW;
    const y = (crop.top / 100) * naturalH;
    const width = ((100 - crop.left - crop.right) / 100) * naturalW;
    const height = ((100 - crop.top - crop.bottom) / 100) * naturalH;

    try {
      const cropped = await cropImageRect(imageUrl, { x, y, width, height });
      onApplyCrop(cropped);
      onClose();
    } catch (e) {
      console.error('Failed to crop:', e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Crop className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold">Ritaglio bordi</h2>
        </div>
        <button
          onClick={() => setCrop({ top: 5, left: 5, right: 5, bottom: 5 })}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Ripristina bordi"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Crop Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 p-6 flex items-center justify-center overflow-hidden select-none"
      >
        <div className="relative inline-block max-w-full max-h-[70vh]">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Per ritaglio"
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl pointer-events-none"
            draggable={false}
          />

          {/* Dark Overlay around Crop Box */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, 0.65)`,
              clipPath: `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                0% ${crop.top}%,
                ${crop.left}% ${crop.top}%,
                ${crop.left}% ${100 - crop.bottom}%,
                ${100 - crop.right}% ${100 - crop.bottom}%,
                ${100 - crop.right}% ${crop.top}%,
                0% ${crop.top}%
              )`,
            }}
          />

          {/* Active Crop Box with Handles */}
          <div
            className="absolute border-2 border-emerald-400"
            style={{
              top: `${crop.top}%`,
              left: `${crop.left}%`,
              right: `${crop.right}%`,
              bottom: `${crop.bottom}%`,
            }}
          >
            {/* Grid 3x3 rule of thirds */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
              <div className="border-r border-b border-emerald-300" />
              <div className="border-r border-b border-emerald-300" />
              <div className="border-b border-emerald-300" />
              <div className="border-r border-b border-emerald-300" />
              <div className="border-r border-b border-emerald-300" />
              <div className="border-b border-emerald-300" />
              <div className="border-r border-emerald-300" />
              <div className="border-r border-emerald-300" />
              <div />
            </div>

            {/* Corner Handles */}
            <div
              onPointerDown={handlePointerDown('tl')}
              className="absolute -top-3 -left-3 w-7 h-7 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-md cursor-nwse-resize active:scale-125 transition-transform"
            />
            <div
              onPointerDown={handlePointerDown('tr')}
              className="absolute -top-3 -right-3 w-7 h-7 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-md cursor-nesw-resize active:scale-125 transition-transform"
            />
            <div
              onPointerDown={handlePointerDown('bl')}
              className="absolute -bottom-3 -left-3 w-7 h-7 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-md cursor-nesw-resize active:scale-125 transition-transform"
            />
            <div
              onPointerDown={handlePointerDown('br')}
              className="absolute -bottom-3 -right-3 w-7 h-7 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-md cursor-nwse-resize active:scale-125 transition-transform"
            />

            {/* Edge Midpoint Handles */}
            <div
              onPointerDown={handlePointerDown('t')}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-emerald-400/90 rounded-full border border-slate-900 cursor-ns-resize"
            />
            <div
              onPointerDown={handlePointerDown('b')}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-emerald-400/90 rounded-full border border-slate-900 cursor-ns-resize"
            />
            <div
              onPointerDown={handlePointerDown('l')}
              className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-4 bg-emerald-400/90 rounded-full border border-slate-900 cursor-ew-resize"
            />
            <div
              onPointerDown={handlePointerDown('r')}
              className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-4 bg-emerald-400/90 rounded-full border border-slate-900 cursor-ew-resize"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between z-20">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Annulla
        </button>

        <button
          onClick={handleConfirm}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Applica ritaglio</span>
        </button>
      </div>
    </div>
  );
};
