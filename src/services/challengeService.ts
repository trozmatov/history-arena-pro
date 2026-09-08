// AI Challenge Arena Service - Gemini 3.8 Flash & Embedding Test Generator
// Supports PDF parsing, AI test generation, Firebase sync, and Telegram announcements

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { db, ref as fbRef, push, set, get, update, remove, onValue } from "./firebase";
import { getGeminiApiKey, extractAndParseJson } from "./geminiLiveService";
import { notifyChallengeLaunched, notifyChallengeCompleted } from "./telegram";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const PRIMARY_CHALLENGE_MODEL = "gemini-3.8-flash";
export const FALLBACK_CHALLENGE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

export interface ChallengeQuestion {
  id: string;
  question: string;
  options: string[]; // Exactly 4 options
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
}

export interface ChallengeRewards {
  cashPrize?: string; // e.g. "50 000 so'm"
  coins?: number; // e.g. 50
  specialPerk?: string; // e.g. "1 kun darsga kelmaslik (qonuniy dam olish huquqi)"
}

export interface ChallengeParticipant {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  score: number; // 0 to 100
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: number;
}

export interface Challenge {
  id: string;
  title: string;
  topic: string;
  group: string;
  createdAt: number;
  deadline: number; // timestamp ms
  status: "active" | "completed";
  rewards: ChallengeRewards;
  questions: ChallengeQuestion[];
  participants?: Record<string, ChallengeParticipant>;
  teacherName?: string;
}

export interface DraftTestBank {
  id: string;
  title: string;
  topic: string;
  createdAt: number;
  questions: ChallengeQuestion[];
}

// --- 1. Extract Text from PDF File ---
export async function extractTextFromPdf(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = "";
  for (let i = 1; i <= numPages; i++) {
    onProgress?.(Math.round((i / numPages) * 70), `${i} / ${numPages} sahifa o'qilmoqda...`);
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageStr = textContent.items
      .map((item: any) => item.str)
      .filter((s: string) => s && s.trim().length > 0)
      .join(" ");

    if (pageStr.trim().length > 0) {
      fullText += `\n--- SAHIFA ${i} ---\n` + pageStr;
    }
  }

  onProgress?.(80, "Matn tayyorlandi");
  return { text: fullText.trim(), pageCount: numPages };
}

// --- 2. Generate Test Questions using Gemini 3.8 Flash (Supports 50-60+ questions) ---
export async function generateTestQuestionsWithAi(params: {
  topic: string;
  pdfText?: string;
  questionCount: number;
  onProgress?: (percent: number, status: string) => void;
  customApiKey?: string;
}): Promise<ChallengeQuestion[]> {
  const apiKey = params.customApiKey || getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API kaliti topilmadi. Tizim sozlamalarini tekshiring.");
  }

  // Select relevant context of PDF (up to 40,000 characters)
  let textContext = "";
  if (params.pdfText && params.pdfText.trim().length > 0) {
    const raw = params.pdfText.trim();
    textContext = raw.length > 40000 ? raw.slice(0, 40000) + "\n...[qisqartirildi]" : raw;
  }

  const systemInstruction =
    "Sen professional testologsan. Barcha savollar va variantlar toza o'zbek tilida, imlo qoidalariga mos bo'lishi shart. Faqat JSON formatida javob berasan.";

  async function requestChunk(targetCount: number, focusArea: string, offset: number): Promise<ChallengeQuestion[]> {
    const prompt = `Sen oliy toifali tajribali testolog va tarixchi o'qituvchisan.
Vazifang: Berilgan darslik/mavzu bo'yicha aynan ${targetCount} ta chuqur, mantiqiy, qiziqarli va ko'p variantli (MCQ) test savolini tuzish.
${focusArea ? `Yo'nalish / Diqqat markazi: ${focusArea}` : ""}

Mavzu: "${params.topic}"
${textContext ? `Darslikdagi asosiy matn:\n${textContext}` : "Mavzu bo'yicha eng muhim faktlar asosida tuzilsin."}

TALABLAR:
1. Aynan ${targetCount} ta savol tuzilsin.
2. Har bir savolda 4 ta variant (options) bo'lsin. Variantlar bir-biriga mos, jiddiy va chalg'ituvchi bo'lsin.
3. "correctAnswer" - to'g'ri javobning 0-indeksi (0, 1, 2 yoki 3).
4. "explanation" - darslikdagi to'g'ri fakt va sababning 1-2 gaplik aniq izohi.
5. Faqat va faqat quyidagi JSON formatida massiv qaytar:

[
  {
    "id": "q_1",
    "question": "Savol matni?",
    "options": ["A varianti", "B varianti", "C varianti", "D varianti"],
    "correctAnswer": 0,
    "explanation": "To'g'ri javobning darslikdagi izohi"
  }
]`;

    let lastError: any = null;
    const modelsToTry = [PRIMARY_CHALLENGE_MODEL, ...FALLBACK_CHALLENGE_MODELS.filter((m) => m !== PRIMARY_CHALLENGE_MODEL)];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const parsed = extractAndParseJson<ChallengeQuestion[]>(rawContent, []);

          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((q, idx) => {
              const rawOpts = Array.isArray(q.options) ? q.options.map(String) : [];
              while (rawOpts.length < 4) rawOpts.push(`Variant ${rawOpts.length + 1}`);
              const validOptions = rawOpts.slice(0, 4);
              const correctIdx = Math.max(0, Math.min(3, Number(q.correctAnswer) || 0));

              return {
                id: `q_${offset + idx + 1}`,
                question: q.question || `${offset + idx + 1}-savol`,
                options: validOptions,
                correctAnswer: correctIdx,
                explanation: q.explanation || "Darslik faktlariga asoslangan to'g'ri javob.",
              };
            });
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn(`Challenge model ${model} status ${res.status}:`, errData?.error?.message || res.statusText);
        }
      } catch (e: any) {
        console.warn(`Challenge model ${model} connection error:`, e);
        lastError = e;
      }
    }

    throw lastError || new Error("Gemini orqali test tuzishda xatolik yuz berdi.");
  }

  // Handle large test counts (e.g. 50-60) via parallel chunking to avoid token truncation
  const requestedCount = Math.max(1, Math.min(100, params.questionCount || 10));

  if (requestedCount > 30) {
    params.onProgress?.(85, `Gemini 3.8 Flash ${requestedCount} ta testni parallel oqimlarda tuzmoqda...`);
    const count1 = Math.ceil(requestedCount / 2);
    const count2 = Math.floor(requestedCount / 2);

    const [part1, part2] = await Promise.all([
      requestChunk(count1, "1-qism: Asosiy sana, faktlar va tarixiy shaxslar bo'yicha savollar", 0),
      requestChunk(count2, "2-qism: Chuqur mantiqiy tahlil, sabab-oqibat va atamalar bo'yicha savollar", count1),
    ]);

    const combined = [...part1, ...part2].map((q, idx) => ({
      ...q,
      id: `q_${idx + 1}`,
    }));

    params.onProgress?.(100, `${combined.length} ta test savoli tayyor!`);
    return combined;
  } else {
    params.onProgress?.(85, `Gemini 3.8 Flash ${requestedCount} ta test savolini tuzmoqda...`);
    const singleBatch = await requestChunk(requestedCount, "Barcha asosiy faktlar", 0);
    params.onProgress?.(100, `${singleBatch.length} ta test savoli tayyor!`);
    return singleBatch;
  }
}

// --- 3. Firebase: Save & Fetch Draft Test Banks ---
export async function saveDraftTestBank(
  title: string,
  topic: string,
  questions: ChallengeQuestion[]
): Promise<string> {
  const bankRef = push(fbRef(db, "ai_test_banks"));
  const newId = bankRef.key!;
  const draft: DraftTestBank = {
    id: newId,
    title,
    topic,
    createdAt: Date.now(),
    questions,
  };
  await set(bankRef, draft);
  return newId;
}

export async function fetchDraftTestBanks(): Promise<DraftTestBank[]> {
  try {
    const snapshot = await get(fbRef(db, "ai_test_banks"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map((k) => ({ id: k, ...data[k] }));
    }
    return [];
  } catch (e) {
    console.error("fetchDraftTestBanks error:", e);
    return [];
  }
}

export async function deleteDraftTestBank(bankId: string): Promise<void> {
  await remove(fbRef(db, `ai_test_banks/${bankId}`));
}

// --- 4. Firebase: Create & Manage Challenges ---
export async function createChallengeInFirebase(
  challengeData: Omit<Challenge, "id" | "status" | "createdAt">
): Promise<string> {
  const chalRef = push(fbRef(db, "ai_challenges"));
  const newId = chalRef.key!;

  const fullChallenge: Challenge = {
    ...challengeData,
    id: newId,
    status: "active",
    createdAt: Date.now(),
    participants: {},
  };

  await set(chalRef, fullChallenge);

  // Send automatic Telegram announcement
  try {
    const deadlineDate = new Date(fullChallenge.deadline);
    const formattedDeadline = `${deadlineDate.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
    })}, ${deadlineDate.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    await notifyChallengeLaunched({
      title: fullChallenge.title,
      topic: fullChallenge.topic,
      group: fullChallenge.group,
      questionCount: fullChallenge.questions.length,
      deadlineFormatted: formattedDeadline,
      rewards: fullChallenge.rewards,
    });
  } catch (tgErr) {
    console.warn("Telegram announcement failed (non-blocking):", tgErr);
  }

  return newId;
}

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const snapshot = await get(fbRef(db, "ai_challenges"));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map((k) => ({
        id: k,
        ...data[k],
        questions: data[k].questions || [],
        participants: data[k].participants || {},
      }));
    }
    return [];
  } catch (e) {
    console.error("fetchChallenges error:", e);
    return [];
  }
}

export async function deleteChallengeFromFirebase(challengeId: string): Promise<void> {
  await remove(fbRef(db, `ai_challenges/${challengeId}`));
}

// --- 5. Firebase: Submit Participant Attempt ---
export async function submitChallengeAttempt(
  challengeId: string,
  participant: ChallengeParticipant
): Promise<void> {
  const safeId = encodeURIComponent((participant.studentId || "student").toLowerCase().trim()).replace(/\./g, "%2E");
  const pRef = fbRef(db, `ai_challenges/${challengeId}/participants/${safeId}`);
  await set(pRef, {
    ...participant,
    studentId: safeId,
  });
}

// --- 6. Finalize Challenge & Announce Winners ---
export async function finalizeChallengeInFirebase(challengeId: string): Promise<{
  success: boolean;
  topParticipants: { rank: number; studentName: string; score: number; timeFormatted: string }[];
}> {
  const chalRef = fbRef(db, `ai_challenges/${challengeId}`);
  const snap = await get(chalRef);

  if (!snap.exists()) {
    throw new Error("Chellenj topilmadi.");
  }

  const chal: Challenge = snap.val();
  await update(chalRef, { status: "completed" });

  // Compute leaderboard
  const participants = chal.participants ? Object.values(chal.participants) : [];
  participants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });

  const top = participants.slice(0, 5).map((p, idx) => {
    const mins = Math.floor(p.timeSpentSeconds / 60);
    const secs = p.timeSpentSeconds % 60;
    const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return {
      rank: idx + 1,
      studentName: p.studentName,
      score: p.score,
      timeFormatted,
    };
  });

  // Announce via Telegram bot
  try {
    await notifyChallengeCompleted({
      title: chal.title,
      topic: chal.topic,
      group: chal.group,
      rewards: chal.rewards,
      topParticipants: top,
    });
  } catch (tgErr) {
    console.warn("Telegram completion announcement failed:", tgErr);
  }

  return { success: true, topParticipants: top };
}
