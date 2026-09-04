const DB_NAME = "meme-image-store";
const DB_VERSION = 2;
const STORE_NAME = "images";
const TEMPLATES_STORE = "custom_templates";
const KEY = "pending-meme-image";
const TEMPLATE_KEY = "pending-template-url";
const LOCAL_STORAGE_TEMPLATES_KEY = "mememaker_custom_templates";

export type CustomTemplate = {
  id: string;
  name: string;
  dataUrl: string;
  userId?: string;
  createdAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
        const store = db.createObjectStore(TEMPLATES_STORE, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImage(dataUrl: string): Promise<void> {
  // Always save to sessionStorage as instant reliable backup
  try {
    sessionStorage.setItem(KEY, dataUrl);
  } catch (e) {
    console.warn("Could not save pending image to sessionStorage:", e);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(dataUrl, KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB saveImage failed, falling back to sessionStorage only:", err);
  }
}

export async function loadImage(): Promise<string | null> {
  // 1. Try IndexedDB first
  try {
    const db = await openDB();
    const fromDB = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => {
        db.close();
        resolve((request.result as string) ?? null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });

    if (fromDB) return fromDB;
  } catch (err) {
    console.warn("IndexedDB loadImage failed, trying sessionStorage:", err);
  }

  // 2. Fall back to sessionStorage
  try {
    const fromSession = sessionStorage.getItem(KEY);
    if (fromSession) return fromSession;
  } catch (e) {
    console.warn("Could not read from sessionStorage:", e);
  }

  return null;
}

export async function clearImage(): Promise<void> {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}

export async function saveTemplateUrl(url: string): Promise<void> {
  try {
    sessionStorage.setItem(TEMPLATE_KEY, url);
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(url, TEMPLATE_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}

export async function loadTemplateUrl(): Promise<string | null> {
  try {
    const db = await openDB();
    const fromDB = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(TEMPLATE_KEY);
      request.onsuccess = () => {
        db.close();
        resolve((request.result as string) ?? null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });

    if (fromDB) return fromDB;
  } catch {}

  try {
    return sessionStorage.getItem(TEMPLATE_KEY);
  } catch {
    return null;
  }
}

export async function clearTemplateUrl(): Promise<void> {
  try {
    sessionStorage.removeItem(TEMPLATE_KEY);
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(TEMPLATE_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {}
}

// ── Custom Templates Management ─────────────────────────────────────

function getLocalStorageTemplates(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalStorageTemplates(templates: CustomTemplate[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.warn("Could not sync custom templates to localStorage:", e);
  }
}

export async function saveCustomTemplate(template: CustomTemplate): Promise<void> {
  // Sync to localStorage
  const existing = getLocalStorageTemplates().filter((t) => t.id !== template.id);
  existing.unshift(template);
  setLocalStorageTemplates(existing);

  // Sync to IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TEMPLATES_STORE, "readwrite");
      tx.objectStore(TEMPLATES_STORE).put(template);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB saveCustomTemplate failed, kept in localStorage:", err);
  }
}

export async function getCustomTemplates(userId?: string): Promise<CustomTemplate[]> {
  try {
    const db = await openDB();
    const templates = await new Promise<CustomTemplate[]>((resolve, reject) => {
      const tx = db.transaction(TEMPLATES_STORE, "readonly");
      const request = tx.objectStore(TEMPLATES_STORE).getAll();
      request.onsuccess = () => {
        db.close();
        resolve((request.result as CustomTemplate[]) || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });

    if (templates.length > 0) {
      // Keep localStorage in sync
      setLocalStorageTemplates(templates);
      const filtered = userId
        ? templates.filter((t) => !t.userId || t.userId === userId)
        : templates;
      return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (err) {
    console.warn("IndexedDB getCustomTemplates failed, reading localStorage:", err);
  }

  const local = getLocalStorageTemplates();
  const filtered = userId
    ? local.filter((t) => !t.userId || t.userId === userId)
    : local;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  // Remove from localStorage
  const existing = getLocalStorageTemplates().filter((t) => t.id !== id);
  setLocalStorageTemplates(existing);

  // Remove from IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TEMPLATES_STORE, "readwrite");
      tx.objectStore(TEMPLATES_STORE).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch (err) {
    console.warn("IndexedDB deleteCustomTemplate failed:", err);
  }
}

export async function getCustomTemplateById(id: string): Promise<CustomTemplate | null> {
  try {
    const db = await openDB();
    return new Promise<CustomTemplate | null>((resolve, reject) => {
      const tx = db.transaction(TEMPLATES_STORE, "readonly");
      const request = tx.objectStore(TEMPLATES_STORE).get(id);
      request.onsuccess = () => {
        db.close();
        resolve((request.result as CustomTemplate) ?? null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch {
    const local = getLocalStorageTemplates();
    return local.find((t) => t.id === id) ?? null;
  }
}
