const DB_NAME = 'DijitalKutuphanemFilesDB';
const FILES_STORE = 'bookFiles';
const COVERS_STORE = 'bookCovers';
const DB_VERSION = 3;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE);
      }
      if (!db.objectStoreNames.contains(COVERS_STORE)) {
        db.createObjectStore(COVERS_STORE);
      }
      if (!db.objectStoreNames.contains('dataBackup')) {
        db.createObjectStore('dataBackup');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBookFileToIDB(bookId: string, fileBlob: Blob | File, fileName: string, fileType: 'pdf' | 'epub'): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(FILES_STORE, 'readwrite');
      const store = transaction.objectStore(FILES_STORE);
      const record = {
        bookId,
        blob: fileBlob,
        fileName,
        fileType,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(record, bookId);
      req.onsuccess = () => {
        const objectUrl = URL.createObjectURL(fileBlob);
        resolve(objectUrl);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB Save File Error:", err);
    return URL.createObjectURL(fileBlob);
  }
}

export async function getBookFileFromIDB(bookId: string): Promise<{ objectUrl: string; fileName: string; fileType: 'pdf' | 'epub' } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(FILES_STORE, 'readonly');
      const store = transaction.objectStore(FILES_STORE);
      const req = store.get(bookId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          const objectUrl = URL.createObjectURL(req.result.blob);
          resolve({
            objectUrl,
            fileName: req.result.fileName,
            fileType: req.result.fileType
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("IndexedDB Get File Error:", err);
    return null;
  }
}

export async function saveCoverToIDB(bookId: string, coverData: string | Blob): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(COVERS_STORE, 'readwrite');
      const store = transaction.objectStore(COVERS_STORE);
      const record = {
        bookId,
        data: coverData,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(record, bookId);
      req.onsuccess = () => {
        if (typeof coverData === 'string') {
          resolve(coverData);
        } else {
          resolve(URL.createObjectURL(coverData));
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB Save Cover Error:", err);
    return typeof coverData === 'string' ? coverData : URL.createObjectURL(coverData);
  }
}

export async function getCoverFromIDB(bookId: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(COVERS_STORE, 'readonly');
      const store = transaction.objectStore(COVERS_STORE);
      const req = store.get(bookId);
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          if (typeof req.result.data === 'string') {
            resolve(req.result.data);
          } else {
            resolve(URL.createObjectURL(req.result.data));
          }
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("IndexedDB Get Cover Error:", err);
    return null;
  }
}

export async function saveAppDataToIDB(key: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('dataBackup', 'readwrite');
      const store = transaction.objectStore('dataBackup');
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("IndexedDB Save App Data Error:", err);
  }
}

export async function getAppDataFromIDB(key: string): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('dataBackup', 'readonly');
      const store = transaction.objectStore('dataBackup');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("IndexedDB Get App Data Error:", err);
    return null;
  }
}

export async function deleteBookDataFromIDB(bookId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([FILES_STORE, COVERS_STORE], 'readwrite');
      tx.objectStore(FILES_STORE).delete(bookId);
      tx.objectStore(COVERS_STORE).delete(bookId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB Delete Book Data Error:", err);
  }
}
