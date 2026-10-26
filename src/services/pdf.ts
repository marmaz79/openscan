import { jsPDF } from 'jspdf';
import { ScanDoc } from '../types';
import { loadImage } from './imageProcessing';

function safeFilename(name: string): string {
  return name.replace(/[^\w\- ]+/g, '_').trim() || 'documento';
}

/**
 * Generates a clean, watermark-free multi-page A4 PDF from a ScanDoc,
 * matching OpenScan's `buildPdf` function.
 */
export async function generateDocPdf(doc: ScanDoc): Promise<Blob> {
  // A4 dimensions in pt: 595.28 x 841.89 (or mm: 210 x 297)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const a4WidthMm = 210;
  const a4HeightMm = 297;

  for (let i = 0; i < doc.pages.length; i++) {
    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const page = doc.pages[i];
    try {
      const img = await loadImage(page.imageUrl);
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const pageAspect = a4WidthMm / a4HeightMm;

      let drawWidth = a4WidthMm;
      let drawHeight = a4HeightMm;
      let posX = 0;
      let posY = 0;

      // Fit contained on A4 page
      if (imgAspect > pageAspect) {
        // Image is wider than A4
        drawWidth = a4WidthMm;
        drawHeight = a4WidthMm / imgAspect;
        posY = (a4HeightMm - drawHeight) / 2;
      } else {
        // Image is taller than A4
        drawHeight = a4HeightMm;
        drawWidth = a4HeightMm * imgAspect;
        posX = (a4WidthMm - drawWidth) / 2;
      }

      pdf.addImage(page.imageUrl, 'JPEG', posX, posY, drawWidth, drawHeight);
    } catch (err) {
      console.error('Error adding page image to PDF:', err);
    }
  }

  return pdf.output('blob');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadDocPdf(doc: ScanDoc): Promise<void> {
  const blob = await generateDocPdf(doc);
  downloadBlob(blob, `${safeFilename(doc.name)}.pdf`);
}

export function downloadDocText(doc: ScanDoc): void {
  const blob = new Blob([doc.ocrText || 'Nessun testo estratto'], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${safeFilename(doc.name)}.txt`);
}

export function downloadPageImage(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
