// Service for managing student certificates, exam results, and achievements
import {
  db,
  ref as fbRef,
  set,
  get,
  remove,
  onValue,
} from "./firebase";

export interface StudentResult {
  id: string;
  studentName: string;
  certificateImage: string; // Base64 data URL or external URL (required)
  pdfUrl?: string; // Base64 data URL or external link (optional)
  pdfName?: string; // Optional original PDF filename
  score?: string; // e.g. "189.5 ball", "A+ (94%)", "56.4 ball"
  targetUniversity?: string; // e.g. "O'zbekiston Milliy Universiteti - Tarix fakulteti (Davlat Granti)"
  certificateType?: string; // "Milliy Sertifikat", "DTM Davlat Granti", "Respublika Olimpiadasi", "Xalqaro Sertifikat"
  studyFormat?: "offline" | "online"; // "offline" (Oflayn) or "online" (Onlayn)
  year: string | number; // e.g. "2025", "2026", "2024"
  examDate?: string; // e.g. "2025-06-15"
  teacherNote?: string; // Motivational review / quote
  badgeText?: string; // e.g. "100% Davlat Granti 🎓", "A+ Daraja ⭐", "Respublika 1-o'rin 🥇"
  tags?: string[];
  isFeatured?: boolean;
  createdAt: number;
  updatedAt?: number;
}

const STORAGE_KEY = "ha_student_results_v1";

// Default empty - samples removed per user request
export const SAMPLE_RESULTS: StudentResult[] = [];

// Helper: purge any old sample items from local storage and return real items
export function getLocalCachedResults(): StudentResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out old sample ids
        const cleaned = parsed.filter(
          (r: any) => !r.id?.startsWith("sample-res-")
        );
        if (cleaned.length !== parsed.length) {
          saveLocalCachedResults(cleaned);
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.warn("Could not read local cached results:", e);
  }
  return [];
}

// Helper: save to localStorage
export function saveLocalCachedResults(list: StudentResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// Clean up sample items from Firebase RTDB if they exist (non-blocking in background)
export function purgeSampleResultsFromFirebase(): void {
  try {
    const sampleIds = ["sample-res-1", "sample-res-2", "sample-res-3"];
    for (const sid of sampleIds) {
      const itemRef = fbRef(db, `student_results/${sid}`);
      remove(itemRef).catch(() => {});
    }
  } catch (e) {}
}

// Fetch all results from Firebase RTDB
export async function fetchAllResults(): Promise<StudentResult[]> {
  // Purge any legacy sample results non-blocking in background
  purgeSampleResultsFromFirebase();

  try {
    const resultsRef = fbRef(db, "student_results");
    const snapshot = await get(resultsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: StudentResult[] = Object.keys(data)
        .filter((k) => !k.startsWith("sample-res-"))
        .map((k) => ({
          ...data[k],
          id: data[k].id || k,
        }));
      // Sort: Featured first, then newest
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      saveLocalCachedResults(list);
      return list;
    } else {
      saveLocalCachedResults([]);
      return [];
    }
  } catch (e) {
    console.warn("Failed to fetch results from Firebase, using cache:", e);
    return getLocalCachedResults();
  }
}

// Listen to real-time changes
export function subscribeToResults(callback: (results: StudentResult[]) => void): () => void {
  const resultsRef = fbRef(db, "student_results");
  const unsubscribe = onValue(resultsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const list: StudentResult[] = Object.keys(data)
        .filter((k) => !k.startsWith("sample-res-"))
        .map((k) => ({
          ...data[k],
          id: data[k].id || k,
        }));
      list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      saveLocalCachedResults(list);
      callback(list);
    } else {
      saveLocalCachedResults([]);
      callback([]);
    }
  });

  return unsubscribe;
}

// Save or Update a single result (Instant Optimistic update + background sync)
export async function saveStudentResult(result: StudentResult): Promise<void> {
  if (!result.id) {
    result.id = "res-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  }
  result.updatedAt = Date.now();
  if (!result.createdAt) {
    result.createdAt = Date.now();
  }

  // 1. INSTANT LOCAL UPDATE: guarantees 0ms response time for teacher!
  const cached = getLocalCachedResults();
  const idx = cached.findIndex((r) => r.id === result.id);
  if (idx >= 0) {
    cached[idx] = result;
  } else {
    cached.unshift(result);
  }
  saveLocalCachedResults(cached);

  // 2. BACKGROUND CLOUD SYNC: fire and forget with a short timeout
  try {
    const itemRef = fbRef(db, `student_results/${result.id}`);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Cloud sync timeout")), 4000)
    );
    await Promise.race([set(itemRef, result), timeoutPromise]);
  } catch (err) {
    console.warn("Firebase background sync note:", err);
  }
}

// Delete result from Firebase (Instant local removal + background cloud delete)
export async function deleteStudentResult(id: string): Promise<void> {
  // 1. Instant local removal
  const cached = getLocalCachedResults().filter((r) => r.id !== id);
  saveLocalCachedResults(cached);

  // 2. Background cloud delete
  try {
    const itemRef = fbRef(db, `student_results/${id}`);
    remove(itemRef).catch(() => {});
  } catch (e) {}
}

// Image compression helper: converts File into optimized WebP/JPEG base64 data URL
// Kept at max 850x650 and quality 0.72 so images are ultra-light (~40KB-70KB) and load instantly
export function compressImageFile(
  file: File,
  maxWidth = 850,
  maxHeight = 650,
  quality = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl || dataUrl.indexOf("image/webp") === -1) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Rasmni yuklashda xatolik"));
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Read PDF file as base64 Data URL (limit 4MB)
export function readPdfFileAsDataUrl(file: File): Promise<{ dataUrl: string; name: string }> {
  return new Promise((resolve, reject) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      reject(new Error("Faqat PDF formatdagi fayllarni yuklash mumkin"));
      return;
    }
    // Limit PDF size to 4MB for fast syncing
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("PDF fayl hajmi 4 MB dan oshmasligi kerak"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        name: file.name,
      });
    };
    reader.onerror = (e) => reject(e);
  });
}

