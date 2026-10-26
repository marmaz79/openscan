export type OcrLang = 
  | 'auto'
  | 'latin'
  | 'chinese'
  | 'japanese'
  | 'korean'
  | 'devanagari'
  | 'arabic';

export interface OcrLangOption {
  id: OcrLang;
  label: string;
  tesseractLang: string;
}

export const OCR_LANGUAGES: OcrLangOption[] = [
  { id: 'auto', label: 'Automatico (Tutte le lingue)', tesseractLang: 'eng+ita' },
  { id: 'latin', label: 'Latino (Italiano, English, Español, Français, Deutsch…)', tesseractLang: 'eng+ita' },
  { id: 'chinese', label: '中文 Cinese (Semplificato)', tesseractLang: 'chi_sim' },
  { id: 'japanese', label: '日本語 Giapponese', tesseractLang: 'jpn' },
  { id: 'korean', label: '한국어 Coreano', tesseractLang: 'kor' },
  { id: 'devanagari', label: 'देवनागरी Hindi / Devanagari', tesseractLang: 'hin' },
  { id: 'arabic', label: 'العربية Arabo', tesseractLang: 'ara' },
];

export interface DocPage {
  id: string;
  imageUrl: string;      // Current processed image (data URL)
  originalUrl: string;    // Raw unedited image (data URL)
  rotation: number;       // 0, 90, 180, 270
  activeFilter?: 'auto' | 'gray' | 'bw' | 'orig';
}

export interface ScanDoc {
  id: string;
  name: string;
  created: string; // ISO string
  pages: DocPage[];
  ocrText: string;
  ocrLang: OcrLang;
}

export type ScanFilter = 'auto' | 'gray' | 'bw' | 'orig';

export interface CollageLayout {
  id: string;
  cols: number;
  rows: number;
  label: string;
  perSheet: number;
}

export const COLLAGE_LAYOUTS: CollageLayout[] = [
  { id: '1x2', cols: 1, rows: 2, label: '2 per foglio (1×2)', perSheet: 2 },
  { id: '2x2', cols: 2, rows: 2, label: '4 per foglio (2×2)', perSheet: 4 },
  { id: '2x3', cols: 2, rows: 3, label: '6 per foglio (2×3)', perSheet: 6 },
  { id: '3x3', cols: 3, rows: 3, label: '9 per foglio (3×3)', perSheet: 9 },
];
