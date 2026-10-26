import { ScanDoc } from '../types';

const DB_NAME = 'openscan_db';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDocs(): Promise<ScanDoc[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const docs: ScanDoc[] = req.result || [];
        // Sort newest first
        docs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        resolve(docs);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to localStorage for reading:', err);
    try {
      const data = localStorage.getItem('openscan_docs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export async function saveDoc(doc: ScanDoc): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to localStorage for saving:', err);
    try {
      const current = await getAllDocs();
      const idx = current.findIndex(d => d.id === doc.id);
      if (idx >= 0) {
        current[idx] = doc;
      } else {
        current.unshift(doc);
      }
      localStorage.setItem('openscan_docs', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
}

export async function deleteDoc(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback delete from localStorage:', err);
    const current = await getAllDocs();
    const filtered = current.filter(d => d.id !== id);
    localStorage.setItem('openscan_docs', JSON.stringify(filtered));
  }
}
