import { CollageLayout, ScanFilter } from '../types';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Applies filters corresponding to OpenScan's Flutter image processing:
 * - auto: contrast: 1.25, brightness: 1.05, saturation: 1.1
 * - gray: grayscale with contrast 1.2
 * - bw: high-contrast document black & white (grayscale, contrast 2.2, brightness 1.1)
 * - orig: pure original
 */
export async function applyImageFilter(
  originalSrc: string,
  filter: ScanFilter,
  rotation: number = 0
): Promise<string> {
  const img = await loadImage(originalSrc);

  // Determine canvas dimensions based on rotation
  const isRotated90 = rotation % 180 !== 0;
  const width = isRotated90 ? img.naturalHeight : img.naturalWidth;
  const height = isRotated90 ? img.naturalWidth : img.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Rotate canvas
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  if (filter === 'orig') {
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  if (filter === 'auto') {
    // contrast 1.25, brightness 1.05, saturation 1.1
    const contrast = 1.25;
    const factor = (259 * (contrast * 100 - 100 + 255)) / (255 * (259 - (contrast * 100 - 100)));
    const brightness = 1.05;
    const sat = 1.1;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness & contrast
      r = factor * (r * brightness - 128) + 128;
      g = factor * (g * brightness - 128) + 128;
      b = factor * (b * brightness - 128) + 128;

      // Saturation
      const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
      r = gray + sat * (r - gray);
      g = gray + sat * (g - gray);
      b = gray + sat * (b - gray);

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }
  } else if (filter === 'gray') {
    // Grayscale + contrast 1.2
    const contrast = 1.2;
    const factor = (259 * (contrast * 100 - 100 + 255)) / (255 * (259 - (contrast * 100 - 100)));

    for (let i = 0; i < len; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  } else if (filter === 'bw') {
    // B&W: high-contrast document threshold (grayscale, contrast 2.2, brightness 1.1)
    const contrast = 2.2;
    const factor = (259 * (contrast * 100 - 100 + 255)) / (255 * (259 - (contrast * 100 - 100)));
    const brightness = 1.1;

    for (let i = 0; i < len; i += 4) {
      let gray = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) * brightness;
      let val = factor * (gray - 128) + 128;
      // Adaptive soft-thresholding for crisp text
      val = val > 140 ? 255 : val < 90 ? 0 : val;
      val = Math.min(255, Math.max(0, val));

      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Rotate an image clockwise by 90 degrees
 */
export async function rotateImage90(src: string): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalHeight;
  canvas.height = img.naturalWidth;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Crop an image given rectangular coordinates
 */
export async function cropImageRect(
  src: string,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(10, Math.round(rect.width));
  canvas.height = Math.max(10, Math.round(rect.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generates collage sheets on standard A4 (200 DPI: 1654 x 2339)
 * exactly as implemented in OpenScan's `_collageJob`.
 */
export async function generateCollagePages(
  pageUrls: string[],
  layout: CollageLayout
): Promise<string[]> {
  const w = 1654;
  const h = 2339;
  const margin = 60;
  const gap = 30;

  const cellW = Math.floor((w - 2 * margin - gap * (layout.cols - 1)) / layout.cols);
  const cellH = Math.floor((h - 2 * margin - gap * (layout.rows - 1)) / layout.rows);

  const sheets: string[] = [];

  for (let start = 0; start < pageUrls.length; start += layout.perSheet) {
    const groupUrls = pageUrls.slice(start, start + layout.perSheet);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // A4 white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < groupUrls.length; i++) {
      try {
        const img = await loadImage(groupUrls[i]);
        const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const tw = Math.round(img.naturalWidth * scale);
        const th = Math.round(img.naturalHeight * scale);

        const colIndex = i % layout.cols;
        const rowIndex = Math.floor(i / layout.cols);

        const x = margin + colIndex * (cellW + gap) + Math.floor((cellW - tw) / 2);
        const y = margin + rowIndex * (cellH + gap) + Math.floor((cellH - th) / 2);

        // Subtle document border and shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, tw, th);
        ctx.restore();

        ctx.drawImage(img, x, y, tw, th);

        // Thin stroke around item
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tw, th);
      } catch (err) {
        console.warn('Failed to load image for collage slot', i, err);
      }
    }

    sheets.push(canvas.toDataURL('image/jpeg', 0.92));
  }

  return sheets;
}
