import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, RefreshCw, Zap, Upload, Trash, Layers } from 'lucide-react';
import { applyImageFilter } from '../services/imageProcessing';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (scannedImages: string[]) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or restart camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPages([]);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities?.() as any) || {};
      setHasTorch(Boolean(capabilities.torch));
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Impossibile avviare la fotocamera o permesso negato. Puoi comunque importare foto o file da scansionare.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn('Torch failed:', e);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (autoEnhance) {
        dataUrl = await applyImageFilter(dataUrl, 'auto', 0);
      }

      setCapturedPages((prev) => [...prev, dataUrl]);
    } catch (err) {
      console.error('Error capturing image:', err);
    } finally {
      setTimeout(() => setIsCapturing(false), 300);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        let result = evt.target?.result as string;
        if (result) {
          if (autoEnhance) {
            result = await applyImageFilter(result, 'auto', 0);
          }
          setCapturedPages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePage = (index: number) => {
    setCapturedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    if (capturedPages.length === 0) return;
    onComplete(capturedPages);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white z-20">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-semibold tracking-wide">Scanner Documenti</h2>
          <p className="text-[11px] text-slate-400">
            {capturedPages.length} {capturedPages.length === 1 ? 'pagina acquisita' : 'pagine acquisite'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl transition-colors ${
                torchOn ? 'bg-amber-400/20 text-amber-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Torcia"
            >
              <Zap className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cambia fotocamera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="max-w-md p-6 text-center text-slate-300 bg-slate-900/90 rounded-2xl border border-slate-800 m-4 shadow-xl">
            <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-2">Fotocamera non disponibile</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">{cameraError}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Sfoglia file o galleria
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-contain"
            />

            {/* Document Edge Detection & Alignment Guide */}
            <div className="absolute inset-8 sm:inset-16 pointer-events-none flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-[1/1.414] border-2 border-emerald-400/60 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* 4 corner brackets */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] text-emerald-300 font-medium tracking-wide">
                    Inquadra il documento
                  </div>
                </div>
              </div>
            </div>

            {/* Shutter Flash Animation */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white opacity-80 pointer-events-none transition-opacity duration-150 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Captured Pages Queue Strip */}
      {capturedPages.length > 0 && (
        <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 z-20">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-2xl mx-auto">
            {capturedPages.map((src, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-emerald-500/50 bg-slate-950 group"
              >
                <img src={src} alt={`Pagina ${i + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[10px] text-center text-slate-200 font-mono">
                  p.{i + 1}
                </span>
                <button
                  onClick={() => removePage(i)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-500 transition-colors shadow-sm"
                  title="Elimina pagina"
                >
                  <Trash className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between gap-4 z-20">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Gallery / File Picker button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs"
        >
          <div className="p-2.5 rounded-full bg-slate-900 border border-slate-800">
            <Upload className="w-5 h-5 text-emerald-400" />
          </div>
          <span>Galleria</span>
        </button>

        {/* Main Shutter Button */}
        <button
          onClick={handleCapture}
          disabled={Boolean(cameraError)}
          className="relative group p-1.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-13 h-13 rounded-full border-2 border-slate-900 bg-white" />
          </div>
        </button>

        {/* Complete / Done button */}
        <button
          onClick={handleDone}
          disabled={capturedPages.length === 0}
          className={`flex flex-col items-center gap-1 text-xs transition-colors ${
            capturedPages.length > 0 ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 pointer-events-none'
          }`}
        >
          <div
            className={`p-2.5 rounded-full border transition-all ${
              capturedPages.length > 0
                ? 'bg-emerald-600/20 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <Check className="w-5 h-5" />
          </div>
          <span>Salva ({capturedPages.length})</span>
        </button>
      </div>
    </div>
  );
};
