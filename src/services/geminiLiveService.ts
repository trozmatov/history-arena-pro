// Gemini Live Service with Native Audio Dialog & Gemini 3.7 Flash
// Direct integration with Google AI Studio:
// Audio Models: gemini-2.0-flash, gemini-2.5-flash, gemini-1.5-flash
// Text Models: gemini-3.7-flash, gemini-2.0-flash, gemini-1.5-flash

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Primary Models from Google AI Studio
export const PRIMARY_TEXT_MODEL = "gemini-3.7-flash";
export const FALLBACK_TEXT_MODELS = [
  "gemini-3.7-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

export const PRIMARY_AUDIO_MODEL = "gemini-2.5-flash-native-audio-latest";
export const FALLBACK_AUDIO_MODELS = [
  "gemini-2.5-flash-native-audio-latest",
  "gemini-2.5-flash-native-audio-preview-09-2025",
  "gemini-3.1-flash-tts-preview",
  "gemini-2.5-flash-preview-tts",
];

const API_KEY_STORAGE = "ha_gemini_api_key";
const TEXT_MODEL_STORAGE = "ha_gemini_text_model";
const AUDIO_MODEL_STORAGE = "ha_gemini_audio_model";

// --- API Key & Model Management ---
export function getGeminiApiKey(): string {
  // 1. Priority: System-wide .env variable (works automatically for teacher & student)
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim().length > 5) {
    return envKey.trim();
  }
  // 2. Fallback: Browser localStorage (if manually configured in UI)
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_KEY_STORAGE) || "";
}

export function setGeminiApiKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE, key.trim());
}

export function getSelectedTextModel(): string {
  const envModel = (import.meta as any).env?.VITE_GEMINI_TEXT_MODEL;
  if (envModel && typeof envModel === "string" && envModel.trim()) {
    return envModel.trim();
  }
  if (typeof window === "undefined") return PRIMARY_TEXT_MODEL;
  const stored = localStorage.getItem(TEXT_MODEL_STORAGE);
  if (stored && FALLBACK_TEXT_MODELS.includes(stored)) {
    return stored;
  }
  return PRIMARY_TEXT_MODEL;
}

export function setSelectedTextModel(model: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEXT_MODEL_STORAGE, model);
}

export function getSelectedAudioModel(): string {
  const envAudio = (import.meta as any).env?.VITE_GEMINI_AUDIO_MODEL;
  if (envAudio && typeof envAudio === "string" && envAudio.trim()) {
    return envAudio.trim();
  }
  if (typeof window === "undefined") return PRIMARY_AUDIO_MODEL;
  const stored = localStorage.getItem(AUDIO_MODEL_STORAGE);
  if (stored && FALLBACK_AUDIO_MODELS.includes(stored)) {
    return stored;
  }
  return PRIMARY_AUDIO_MODEL;
}

export function setSelectedAudioModel(model: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIO_MODEL_STORAGE, model);
}

// Global AudioContext & State
let globalAudioCtx: AudioContext | null = null;
let currentAudioSource: AudioBufferSourceNode | null = null;

export function getOrCreateAudioContext(): AudioContext {
  if (!globalAudioCtx || globalAudioCtx.state === "closed") {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

// --- Robust JSON Extraction & Parsing Helper ---
export function extractAndParseJson<T>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== "string") return fallback;

  // 1. Check for markdown code fence
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const textToParse = fenceMatch ? fenceMatch[1].trim() : rawText.trim();

  try {
    return JSON.parse(textToParse);
  } catch (e1) {
    // 2. Extract substring from first '[' or '{' to last matching ']' or '}'
    const firstSquare = textToParse.indexOf("[");
    const lastSquare = textToParse.lastIndexOf("]");
    const firstCurly = textToParse.indexOf("{");
    const lastCurly = textToParse.lastIndexOf("}");

    let startIdx = -1;
    let endIdx = -1;

    if (firstSquare !== -1 && lastSquare > firstSquare) {
      if (firstCurly === -1 || firstSquare < firstCurly) {
        startIdx = firstSquare;
        endIdx = lastSquare;
      }
    }
    if (startIdx === -1 && firstCurly !== -1 && lastCurly > firstCurly) {
      startIdx = firstCurly;
      endIdx = lastCurly;
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const extracted = textToParse.slice(startIdx, endIdx + 1);
      try {
        return JSON.parse(extracted);
      } catch (e2) {
        // Try removing trailing commas before closing braces/brackets
        try {
          const sanitized = extracted.replace(/,\s*([\]}])/g, "$1");
          return JSON.parse(sanitized);
        } catch (e3) {
          console.warn("JSON regex recovery parsing failed:", e3);
        }
      }
    }
    console.warn("extractAndParseJson: Could not parse response as JSON:", rawText);
    return fallback;
  }
}

// --- Direct Gemini Text Generation (Gemini 3.7 Flash) ---
export async function callGeminiTextApi(
  prompt: string,
  systemInstruction?: string,
  customApiKey?: string,
  jsonMode = false
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = customApiKey || getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API kaliti kiritilmagan! Sozlamalardan API kalitni kiriting.");
  }

  const selectedModel = getSelectedTextModel();
  const modelsToTry = [selectedModel, ...FALLBACK_TEXT_MODELS.filter((m) => m !== selectedModel)];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: jsonMode ? 0.1 : 0.3,
          maxOutputTokens: 4096,
        },
      };

      if (jsonMode) {
        payload.generationConfig.responseMimeType = "application/json";
      }

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { text, modelUsed: model };
    } catch (e: any) {
      console.warn(`Text Model ${model} xato berdi, navbatdagisi tekshirilmoqda:`, e);
      lastError = e;
    }
  }

  throw lastError || new Error("Gemini Text API bilan bog'lanishda xatolik.");
}

// --- Multimodal Gemini Generation (Audio + Text input support) ---
export async function callGeminiMultimodalApi(
  parts: any[],
  systemInstruction?: string,
  customApiKey?: string,
  jsonMode = false
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = customApiKey || getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API kaliti kiritilmagan!");
  }

  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        generationConfig: {
          temperature: jsonMode ? 0.1 : 0.2,
          maxOutputTokens: 4096,
        },
      };

      if (jsonMode) {
        payload.generationConfig.responseMimeType = "application/json";
      }

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { text, modelUsed: model };
    } catch (e: any) {
      console.warn(`Multimodal Model ${model} xato berdi, navbatdagisi:`, e);
      lastError = e;
    }
  }

  throw lastError || new Error("Gemini Multimodal API bilan bog'lanishda xatolik.");
}

// --- Pure Uzbek Text Normalization for Neural TTS ---
export function normalizeUzbekTextForNeuralTts(text: string): string {
  if (!text) return "";

  // 1. Strip markdown syntax, symbols, emojis, and hashtags
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/#+\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/•/g, ", ")
    .replace(/%/g, " foiz ")
    .replace(/🪙/g, " tanga ")
    .replace(/[🎯🎉⚡🔥]/g, " ");

  // 2. Standardize Uzbek apostrophes to standard straight apostrophe (FIX: no accidental 'O'zbek' mutation!)
  clean = clean
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/o['’]/gi, (m) => (m[0] === "O" ? "O'" : "o'"))
    .replace(/g['’]/gi, (m) => (m[0] === "G" ? "G'" : "g'"));

  // 3. Historical & Common Abbreviations in Uzbek textbooks
  clean = clean
    .replace(/\bm\.a\./gi, "miloddan avvalgi")
    .replace(/\bb\.e\./gi, "bizning eramizdan avvalgi")
    .replace(/\bmil\./gi, "milodiy")
    .replace(/\by\.\b/gi, "yil");

  // 4. Ordinal numbers conversion: "1-savol" -> "birinchi savol"
  const ordinals: Record<string, string> = {
    "1": "birinchi",
    "2": "ikkinchi",
    "3": "uchinchi",
    "4": "to'rtinchi",
    "5": "beshinchi",
    "6": "oltinchi",
    "7": "yettinchi",
    "8": "sakkizinchi",
    "9": "to'qqizinchi",
    "10": "o'ninchi",
  };
  clean = clean.replace(/\b(\d+)-(savol|mavzu|bob|dars|sinf|bosqich|qism)\b/gi, (match, num, word) => {
    const ord = ordinals[num] || `${num}-chi`;
    return `${ord} ${word}`;
  });

  // 5. Numbers to Uzbek words
  const units: Record<string, string> = {
    "0": "nol", "1": "bir", "2": "ikki", "3": "uch", "4": "to'rt", "5": "besh",
    "6": "olti", "7": "yetti", "8": "sakkiz", "9": "to'qqiz",
  };
  const tens: Record<string, string> = {
    "10": "o'n", "20": "yigirma", "30": "o'ttiz", "40": "qirq", "50": "ellik",
    "60": "oltmish", "70": "yetmish", "80": "sakson", "90": "to'qson",
  };

  function numberToUzbek(n: number): string {
    if (n < 10) return units[String(n)] || String(n);
    if (n < 100) {
      const ten = Math.floor(n / 10) * 10;
      const unit = n % 10;
      return `${tens[String(ten)] || ""}${unit > 0 ? " " + units[String(unit)] : ""}`.trim();
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      const prefix = hundred === 1 ? "yuz" : `${units[String(hundred)]} yuz`;
      return `${prefix}${rest > 0 ? " " + numberToUzbek(rest) : ""}`.trim();
    }
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const rest = n % 1000;
      const prefix = thousand === 1 ? "bir ming" : `${numberToUzbek(thousand)} ming`;
      return `${prefix}${rest > 0 ? " " + numberToUzbek(rest) : ""}`.trim();
    }
    return String(n);
  }

  clean = clean.replace(/\b(\d+)\b/g, (match) => {
    const num = parseInt(match, 10);
    if (!isNaN(num) && num >= 0 && num <= 99999) {
      return numberToUzbek(num);
    }
    return match;
  });

  return clean.replace(/\s+/g, " ").trim();
}

// In-Memory & Session Neural Audio Cache to prevent quota limits and latency
const neuralAudioCache = new Map<string, { mimeType: string; base64: string; pcmBytes?: Uint8Array }>();

// --- 1. Primary Engine: Gemini Live WebSocket Native Audio Engine (Pure Uzbek, No 10-req Quota Limit) ---
export async function generateGeminiLiveNativeSpeech(
  textToSpeak: string,
  onAudioReady?: () => void,
  customApiKey?: string
): Promise<{ success: boolean; mimeType: string; pcmBytes?: Uint8Array; base64?: string } | null> {
  const apiKey = customApiKey || getGeminiApiKey();
  if (!apiKey) return null;

  const normalized = normalizeUzbekTextForNeuralTts(textToSpeak);
  if (!normalized) return null;

  // 1. Check in-memory cache first for instant 0ms playback
  if (neuralAudioCache.has(normalized)) {
    const cached = neuralAudioCache.get(normalized)!;
    onAudioReady?.();
    return {
      success: true,
      mimeType: cached.mimeType,
      pcmBytes: cached.pcmBytes,
      base64: cached.base64,
    };
  }

  const model = "gemini-2.5-flash-native-audio-latest";
  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  return new Promise((resolve) => {
    let ws: WebSocket | null = null;
    let isResolved = false;
    const pcmChunks: Uint8Array[] = [];

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (ws) {
        try {
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        } catch (e) {}
        ws = null;
      }
    };

    const finish = (result: { success: boolean; mimeType: string; pcmBytes?: Uint8Array; base64?: string } | null) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(result);
      }
    };

    // 15 seconds failsafe timeout
    const timeoutTimer = setTimeout(() => {
      console.warn("Gemini Live WebSocket timeout, falling back");
      finish(null);
    }, 15000);

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        const setupMessage = {
          setup: {
            model: `models/${model}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede", // Female, warm, articulate neural voice with pure Uzbek pronunciation
                  },
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text: "Siz oliy toifali oʻzbek tili va tarixi oʻqituvchisisiz. Berilgan matnni sof, ravon va tabiiy oʻzbek adabiy tilida, samimiy ustozona ohang bilan, soʻzma-soʻz ovoz chiqarib oʻqib bering. Matnga hech qanday ortiqcha soʻz qoʻshmang va oʻzgartirmang.",
                },
              ],
            },
          },
        };
        ws?.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event: MessageEvent) => {
        try {
          let strData = "";
          if (typeof event.data === "string") {
            strData = event.data;
          } else if (event.data instanceof Blob) {
            strData = await event.data.text();
          } else if (event.data instanceof ArrayBuffer) {
            const dec = new TextDecoder("utf-8");
            strData = dec.decode(event.data);
          }

          if (!strData) return;
          const msg = JSON.parse(strData);

          // Handle Setup Complete -> Send user text to speak
          if (msg.setupComplete) {
            const clientTurn = {
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `Quyidagi matnni sof oʻzbek tilida soʻzma-soʻz, ravon ovoz chiqarib oʻqib bering:\n"${normalized}"`,
                      },
                    ],
                  },
                ],
                turnComplete: true,
              },
            };
            ws?.send(JSON.stringify(clientTurn));
            return;
          }

          // Handle incoming audio chunks
          if (msg.serverContent) {
            const modelTurn = msg.serverContent.modelTurn;
            if (modelTurn && modelTurn.parts) {
              for (const part of modelTurn.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const binaryStr = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryStr.length);
                  for (let i = 0; i < binaryStr.length; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                  }
                  pcmChunks.push(bytes);
                }
              }
            }

            // Check if turn complete
            if (msg.serverContent.turnComplete) {
              if (pcmChunks.length > 0) {
                let totalLen = 0;
                for (const ch of pcmChunks) totalLen += ch.length;
                const merged = new Uint8Array(totalLen);
                let offset = 0;
                for (const ch of pcmChunks) {
                  merged.set(ch, offset);
                  offset += ch.length;
                }

                // Cache Base64 for fast replay
                let binary = "";
                const chunkSize = 8192;
                for (let i = 0; i < merged.length; i += chunkSize) {
                  binary += String.fromCharCode.apply(null, Array.from(merged.subarray(i, i + chunkSize)));
                }
                const base64Merged = btoa(binary);

                const result = {
                  success: true,
                  mimeType: "audio/pcm;rate=24000",
                  pcmBytes: merged,
                  base64: base64Merged,
                };

                neuralAudioCache.set(normalized, {
                  mimeType: "audio/pcm;rate=24000",
                  pcmBytes: merged,
                  base64: base64Merged,
                });

                onAudioReady?.();
                finish(result);
              } else {
                finish(null);
              }
            }
          }
        } catch (err) {
          console.warn("Gemini Live WebSocket parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.warn("Gemini Live WebSocket connection error:", err);
        finish(null);
      };

      ws.onclose = () => {
        if (!isResolved) {
          if (pcmChunks.length > 0) {
            let totalLen = 0;
            for (const ch of pcmChunks) totalLen += ch.length;
            const merged = new Uint8Array(totalLen);
            let offset = 0;
            for (const ch of pcmChunks) {
              merged.set(ch, offset);
              offset += ch.length;
            }
            finish({
              success: true,
              mimeType: "audio/pcm;rate=24000",
              pcmBytes: merged,
            });
          } else {
            finish(null);
          }
        }
      };
    } catch (e) {
      console.warn("Gemini Live WebSocket constructor error:", e);
      finish(null);
    }
  });
}

// --- 2. Secondary REST Fallback (Google Native Audio Dialog Synthesizer) ---
export async function generateNativeAudioSpeech(
  textToSpeak: string,
  onAudioReady?: () => void,
  customApiKey?: string
): Promise<{ success: boolean; mimeType: string; base64: string } | null> {
  const apiKey = customApiKey || getGeminiApiKey();
  if (!apiKey) return null;

  const normalized = normalizeUzbekTextForNeuralTts(textToSpeak);
  if (!normalized) return null;

  if (neuralAudioCache.has(normalized)) {
    const cached = neuralAudioCache.get(normalized)!;
    onAudioReady?.();
    return {
      success: true,
      mimeType: cached.mimeType,
      base64: cached.base64,
    };
  }

  const restAudioModels = [
    "gemini-3.1-flash-tts-preview",
    "gemini-2.5-flash-preview-tts",
  ];

  for (const model of restAudioModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: normalized }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Aoede",
              },
            },
          },
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData && p.inlineData.data) {
            const result = {
              success: true,
              mimeType: p.inlineData.mimeType || "audio/l16; rate=24000; channels=1",
              base64: p.inlineData.data,
            };
            neuralAudioCache.set(normalized, {
              mimeType: result.mimeType,
              base64: result.base64,
            });
            onAudioReady?.();
            return result;
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn(`REST audio model ${model} status ${res.status}:`, errData?.error?.message || res.statusText);
      }
    } catch (e) {
      console.warn(`REST audio model ${model} error:`, e);
    }
  }

  return null;
}

// Play Native Audio Buffer (PCM 24kHz or WAV/MP3) accepting base64 string or raw Uint8Array
export async function playNativeAudioBuffer(
  audioInput: string | Uint8Array,
  mimeType = "audio/wav",
  onEnded?: () => void,
  onStarted?: () => void
): Promise<void> {
  stopAllSpeech();
  const audioCtx = getOrCreateAudioContext();

  try {
    let bytes: Uint8Array;
    if (typeof audioInput === "string") {
      const binary = atob(audioInput);
      const len = binary.length;
      bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else if (audioInput instanceof Uint8Array) {
      bytes = audioInput;
    } else {
      onEnded?.();
      return;
    }

    const lowerMime = mimeType.toLowerCase();
    if (lowerMime.includes("pcm") || lowerMime.includes("raw") || lowerMime.includes("l16")) {
      const rateMatch = lowerMime.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const sampleCount = Math.floor(bytes.length / 2);
      const buffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
      const channelData = buffer.getChannelData(0);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, sampleCount * 2);

      // Read Little-Endian signed 16-bit PCM samples
      for (let i = 0; i < sampleCount; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      currentAudioSource = source;
      source.onended = () => {
        if (currentAudioSource === source) currentAudioSource = null;
        onEnded?.();
      };
      onStarted?.();
      source.start();
    } else {
      const decodedBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
      const source = audioCtx.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(audioCtx.destination);
      currentAudioSource = source;
      source.onended = () => {
        if (currentAudioSource === source) currentAudioSource = null;
        onEnded?.();
      };
      onStarted?.();
      source.start();
    }
  } catch (e) {
    console.warn("Audio buffer play error:", e);
    onEnded?.();
  }
}

// Keep global reference to utterances to prevent Chrome GC bug
const activeSpeechUtterances: Set<SpeechSynthesisUtterance> = new Set();

export function stopAllSpeech(): void {
  if (currentAudioSource) {
    try {
      currentAudioSource.stop();
      currentAudioSource.disconnect();
    } catch (e) {}
    currentAudioSource = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  activeSpeechUtterances.clear();
}

// Play speech: Gemini Live WebSocket Native Audio first, REST second, pure Uzbek speech fallback
export async function speakTeacherUtterance(
  text: string,
  onEnded?: () => void,
  onStarted?: () => void
): Promise<void> {
  stopAllSpeech();

  let hasEnded = false;
  let hasStarted = false;

  const triggerStart = () => {
    if (!hasStarted) {
      hasStarted = true;
      onStarted?.();
    }
  };

  const safeEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      clearTimeout(safetyTimeout);
      onEnded?.();
    }
  };

  const safetyTimeout = setTimeout(() => {
    console.warn("speakTeacherUtterance: Failsafe 60s timeout reached");
    triggerStart();
    safeEnd();
  }, 60000);

  // 1. Try Gemini Live WebSocket Native Audio Engine (Pure Uzbek, No 10-req Quota Limit)
  try {
    const liveAudio = await generateGeminiLiveNativeSpeech(text);
    if (liveAudio && (liveAudio.pcmBytes || liveAudio.base64)) {
      await playNativeAudioBuffer(
        liveAudio.pcmBytes || liveAudio.base64!,
        liveAudio.mimeType,
        safeEnd,
        triggerStart
      );
      return;
    }
  } catch (e) {
    console.warn("Gemini Live WebSocket speech failed, trying REST fallback:", e);
  }

  // 1b. Try REST Google Native Audio if available
  try {
    const restAudio = await generateNativeAudioSpeech(text);
    if (restAudio && restAudio.base64) {
      await playNativeAudioBuffer(restAudio.base64, restAudio.mimeType, safeEnd, triggerStart);
      return;
    }
  } catch (e) {
    console.warn("REST Native audio failed:", e);
  }

  // 2. High-quality phonetic normalized speech fallback (SOF O'ZBEKCHA, hech qachon ruscha yoki turkcha emas!)
  triggerStart();
  speakNormalizedUzbekFallback(text, safeEnd);
}

// Fallback Speech Synthesis with clean Uzbek phonetics (NEVER Turkish or Russian!)
export function speakNormalizedUzbekFallback(text: string, onEnd?: () => void): void {
  let hasCalledEnd = false;
  const safeEnd = () => {
    if (!hasCalledEnd) {
      hasCalledEnd = true;
      clearTimeout(safetyTimer);
      activeSpeechUtterances.clear();
      onEnd?.();
    }
  };

  const safetyTimer = setTimeout(() => {
    safeEnd();
  }, 60000);

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    safeEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {}

  const cleaned = normalizeUzbekTextForNeuralTts(text);
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
  let idx = 0;

  function speakNext() {
    if (idx >= sentences.length) {
      safeEnd();
      return;
    }

    const chunk = sentences[idx].trim();
    idx++;

    if (!chunk) {
      speakNext();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunk);
      activeSpeechUtterances.add(utterance);

      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.lang = "uz-UZ"; // Strictly Uzbek!

      const voices = window.speechSynthesis.getVoices();
      const uzVoice = voices.find(
        (v) => v.lang.startsWith("uz") || v.name.toLowerCase().includes("uzbek")
      );

      // CRITICAL: NEVER set trVoice (Turkish) or ruVoice (Russian)!
      if (uzVoice) {
        utterance.voice = uzVoice;
        utterance.lang = uzVoice.lang;
      }

      utterance.onend = () => {
        activeSpeechUtterances.delete(utterance);
        setTimeout(speakNext, 120);
      };
      utterance.onerror = () => {
        activeSpeechUtterances.delete(utterance);
        speakNext();
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Utterance error:", err);
      speakNext();
    }
  }

  speakNext();
}

// Test API Key with Gemini 3.7 Flash & Native Audio Dialog
export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string; model: string }> {
  try {
    const res = await callGeminiTextApi("Salom, faqat 'OK' deb javob ber.", undefined, apiKey);
    return {
      success: true,
      message: `Ulanish muvaffaqiyatli! ${res.modelUsed} faol.`,
      model: res.modelUsed,
    };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || "Ulanishda xatolik.",
      model: "",
    };
  }
}

// --- PDF Extraction & Text Processing ---
export interface ExtractedPdfData {
  fileName: string;
  fileSize: number;
  totalPages: number;
  fullText: string;
  pages: { pageNum: number; text: string }[];
  chapters: { id: string; title: string; startPage: number; content: string }[];
}

export async function extractPdfContent(
  file: File,
  onProgress?: (percent: number, statusText: string) => void
): Promise<ExtractedPdfData> {
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(10, "PDF fayl yuklanmoqda...");
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const totalPages = pdfDoc.numPages;
  const pages: { pageNum: number; text: string }[] = [];
  let fullText = "";

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({ pageNum: i, text: pageText });
    fullText += `\n--- [Sahifa ${i}] ---\n` + pageText;

    const percent = Math.round(10 + (i / totalPages) * 60);
    onProgress?.(percent, `Sahifalar o'qilmoqda: ${i} / ${totalPages}`);
  }

  onProgress?.(75, "Boblar va mavzular ajratilmoqda...");
  const chapters = detectChaptersFromPages(pages);
  onProgress?.(100, "PDF to'liq tahlil qilindi!");

  return {
    fileName: file.name,
    fileSize: file.size,
    totalPages,
    fullText,
    pages,
    chapters,
  };
}

function detectChaptersFromPages(pages: { pageNum: number; text: string }[]) {
  const chapters: { id: string; title: string; startPage: number; content: string }[] = [];
  let currentChapter = {
    id: "chap-1",
    title: "1-Mavzu: Kirish",
    startPage: 1,
    content: "",
  };

  const chapterPattern = /(?:(\d+[-.]?\s*(?:bob|mavzu|dars|paragraf|fasl|§))|(?:(?:bob|mavzu|dars|fasl|§)\s*(\d+|[ivxldcm]+))|(?:kirish|xulosa))/i;

  for (const p of pages) {
    const lines = p.text.split(/[.\n]/).map((l) => l.trim()).filter(Boolean);
    let foundNewTitle: string | null = null;

    for (const line of lines.slice(0, 5)) {
      if (chapterPattern.test(line) && line.length < 80) {
        foundNewTitle = line;
        break;
      }
    }

    if (foundNewTitle && currentChapter.content.length > 300) {
      chapters.push({ ...currentChapter });
      currentChapter = {
        id: `chap-${chapters.length + 1}`,
        title: foundNewTitle,
        startPage: p.pageNum,
        content: p.text,
      };
    } else {
      currentChapter.content += "\n" + p.text;
    }
  }

  if (currentChapter.content) {
    chapters.push(currentChapter);
  }

  if (chapters.length <= 1 && pages.length > 5) {
    const chunkSize = Math.ceil(pages.length / 5);
    const chunked: typeof chapters = [];
    for (let i = 0; i < pages.length; i += chunkSize) {
      const slice = pages.slice(i, i + chunkSize);
      chunked.push({
        id: `part-${chunked.length + 1}`,
        title: `${i + 1}-${Math.min(i + chunkSize, pages.length)}-sahifalar`,
        startPage: i + 1,
        content: slice.map((s) => s.text).join("\n"),
      });
    }
    return chunked;
  }

  return chapters;
}

// --- Deep, High-Precision Question Generation (Gemini 3.7 Flash) ---
export async function generateHighQualityQuestionsFromPdf(
  bookTitle: string,
  topicTitle: string,
  contextText: string,
  count = 5
): Promise<{ question: string; idealAnswer: string; keyPoints: string[] }[]> {
  const prompt = `Sen tajribali, oliy toifali pedagog-ekspertsan.
Quyidagi darslik matnini sinchkovlik bilan o'rganib chiq. Faqat va faqat ushbu matnda tilga olingan ANIQ FAKTLAR, SANALAR, SHAXSLAR, VOQEALAR va QOIDALAR asosida o'quvchini og'zaki so'rash uchun ${count} ta yuqori sifatli savollar bankini tuz.

Darslik: "${bookTitle}"
Mavzu: "${topicTitle}"
Darslik matni konteksti:
"""
${contextText.slice(0, 30000)}
"""

QAT'IY TALABLAR:
1. Umumiy yoki mavhum savollar ("...haqida gapirib bering", "...fikringiz nima?") QAT'IYAN TAQIQLANADI!
2. Har bir savol darslikdagi aniq bir faktni, sabab-oqibatni yoki atamani tekshirsin (Masalan: "1370-yilda bo'lib o'tgan qurultoyda qanday muhim qaror qabul qilingan edi?", "Sohibqiron davlatida vazirlar mahkamasi qanday nomlangan?").
3. "idealAnswer" maydoniga darslikdagi to'liq va aniq etalon javobni yoz.
4. "keyPoints" massiviga javobda bo'lishi shart bo'lgan 2-3 ta asosiy tayanch tushunchalarni kirit.
5. Faqat quyidagi JSON formatida javob ber:
[
  {
    "question": "Aniq faktik savol matni (o'zbek tilida)",
    "idealAnswer": "Darslikdagi aniq to'g'ri javob",
    "keyPoints": ["aniq sana yoki ism", "asosiy atama"]
  }
]`;

  const systemInstruction = "Sen professional pedagog va imtihon tuzuvchisisan. Faqat JSON formatida javob berasan.";

  try {
    const { text } = await callGeminiTextApi(prompt, systemInstruction, undefined, true);
    const parsed = extractAndParseJson<any[]>(text, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error("Savollar tuzishda xatolik:", e);
  }

  // If extraction failed, provide subject-specific structured questions
  return [
    {
      question: `"${topicTitle}" mavzusidagi asosiy tarixiy voqea va uning keltirib chiqargan sabablarini aniq tushuntiring.`,
      idealAnswer: "Darslikdagi asosiy sabab-oqibat faktlari.",
      keyPoints: ["Asosiy sabab", "Voqea"],
    },
    {
      question: `Ushbu bobda keltirilgan muhim sanalar va tarixiy shaxslarni sanab bering.`,
      idealAnswer: "Darslikdagi sanalar va shaxslar.",
      keyPoints: ["Sana", "Shaxs"],
    },
  ];
}

// --- Pedagogical Answer Evaluator (Gemini 3.7 Flash & Multimodal) ---
export interface TurnEvaluation {
  score: number; // 0..100
  isPassed: boolean;
  oralFeedback: string; // Spoken feedback by the teacher
  praisePhrase: string;
  transcribedText?: string;
}

export async function evaluateStudentAnswerTurn(params: {
  bookTitle: string;
  topicTitle: string;
  question: string;
  idealAnswer: string;
  studentAnswer?: string;
  studentAudio?: { base64: string; mimeType: string };
  keyPoints?: string[];
}): Promise<TurnEvaluation> {
  const systemInstruction =
    "Sen oliy toifali Ustozsan. Darslik faktlariga tayangan holda samimiy, adolatli va xolis baholaysan. Faqat JSON formatida javob berasan.";

  // 1. If student provided audio and text is short or empty, use Gemini Multimodal Audio understanding!
  if (params.studentAudio && (!params.studentAnswer || params.studentAnswer.trim().length < 4)) {
    const prompt = `Sen o'quvchini og'zaki so'rayotgan samimiy va talabchan USTOZsan.
Darslik: "${params.bookTitle}"
Mavzu: "${params.topicTitle}"
Berilgan savol: "${params.question}"
Darslikdagi to'g'ri etalon javob: "${params.idealAnswer}"
Kutilgan tayanch faktlar: ${(params.keyPoints || []).join(", ")}

VAZIFA:
1. Ushbu biriktirilgan audio yozuvni tingla va o'quvchi o'zbek tilida nima deganini "transcribedText" maydoniga yoz.
2. O'quvchining og'zaki aytgan fikrini darslikdagi to'g'ri faktlar bilan xolis solishtir.
3. 0 dan 100 gacha ball qo'y (60+ o'tgan).
4. "oralFeedback" maydonida o'quvchiga darhol ovoz chiqarib aytiladigan samimiy ustozona fikr yoz (1-2 ta ixcham, samimiy gap).
5. Faqat quyidagi JSON formatida javob ber:
{
  "transcribedText": "O'quvchi audioda aytgan aniq matn",
  "score": 85,
  "isPassed": true,
  "oralFeedback": "O'quvchiga ovoz chiqarib o'qiladigan ustoz fikri (o'zbek tilida)",
  "praisePhrase": "Barakalla! / Yaxshi! / E'tiborli bo'ling!"
}`;

    try {
      const parts = [
        {
          inlineData: {
            mimeType: params.studentAudio.mimeType || "audio/webm",
            data: params.studentAudio.base64,
          },
        },
        { text: prompt },
      ];
      const { text } = await callGeminiMultimodalApi(parts, systemInstruction, undefined, true);
      const parsed = extractAndParseJson<any>(text, {});
      return {
        score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
        isPassed: Boolean(parsed.isPassed ?? (parsed.score >= 60)),
        oralFeedback: parsed.oralFeedback || "Javobingiz tahlil qilindi.",
        praisePhrase: parsed.praisePhrase || (parsed.score >= 60 ? "Barakalla!" : "Diqqatli bo'ling!"),
        transcribedText: parsed.transcribedText || "",
      };
    } catch (e) {
      console.warn("Audio evaluation error, falling back to text prompt:", e);
    }
  }

  // 2. Text-based evaluation (Gemini 3.7 Flash)
  const prompt = `Sen o'quvchini og'zaki so'rayotgan samimiy, talabchan va mehribon USTOZsan.
Darslik: "${params.bookTitle}"
Mavzu: "${params.topicTitle}"
Berilgan savol: "${params.question}"
Darslikdagi to'g'ri etalon javob: "${params.idealAnswer}"
Kutilgan tayanch faktlar: ${(params.keyPoints || []).join(", ")}

O'quvchining og'zaki aytgan javobi:
"${params.studentAnswer || "Javob berilmadi"}"

VAZIFA:
1. O'quvchining aytgan fikrini darslikdagi to'g'ri faktlar bilan xolis solishtir.
2. 0 dan 100 gacha ball qo'y (60+ o'tgan).
3. "oralFeedback" maydonida o'quvchiga darhol ovoz chiqarib aytiladigan samimiy ustozona fikr yoz (1-2 ta ixcham, samimiy gap).
   Masalan: "Barakalla, falon sanani to'g'ri aytdingiz! Lekin darslikdagi falon sababni ham eslab qoling."
4. Faqat quyidagi JSON formatida javob ber:
{
  "score": 85,
  "isPassed": true,
  "oralFeedback": "O'quvchiga ovoz chiqarib o'qiladigan ustoz fikri (o'zbek tilida)",
  "praisePhrase": "Barakalla! / Yaxshi! / E'tiborli bo'ling!"
}`;

  try {
    const { text } = await callGeminiTextApi(prompt, systemInstruction, undefined, true);
    const parsed = extractAndParseJson<any>(text, {});
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      isPassed: Boolean(parsed.isPassed ?? (parsed.score >= 60)),
      oralFeedback: parsed.oralFeedback || "Javobingiz tahlil qilindi.",
      praisePhrase: parsed.praisePhrase || (parsed.score >= 60 ? "Barakalla!" : "Diqqatli bo'ling!"),
      transcribedText: params.studentAnswer || "",
    };
  } catch (e: any) {
    console.error("Baholashda xatolik:", e);
    const isOk = (params.studentAnswer || "").length > 5;
    return {
      score: isOk ? 75 : 40,
      isPassed: isOk,
      oralFeedback: isOk
        ? "Javobingiz qabul qilindi. Darslikdagi asosiy mazmun to'g'ri keltirildi."
        : "Javobingiz to'liq emas, darslikdagi mavzuni qayta ko'rib chiqing.",
      praisePhrase: isOk ? "Yaxshi!" : "E'tiborli bo'ling!",
      transcribedText: params.studentAnswer || "",
    };
  }
}

// --- Hardware Microphone Discovery & Virtual Device Bypass ---
export async function getAudioInputDevicesList(): Promise<{ id: string; label: string; isRecommended: boolean }[]> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === "audioinput")
      .map((d, idx) => {
        const rawLabel = d.label || `Mikrofon ${idx + 1}`;
        const lower = rawLabel.toLowerCase();
        const isVirtual =
          lower.includes("airbeam") ||
          lower.includes("zoom") ||
          lower.includes("blackhole") ||
          lower.includes("virtual") ||
          lower.includes("vb-audio") ||
          lower.includes("cable");
        const isRecommended =
          !isVirtual &&
          (lower.includes("built-in") ||
            lower.includes("internal") ||
            lower.includes("default") ||
            lower.includes("microphone") ||
            lower.includes("headset") ||
            lower.includes("macbook"));
        return {
          id: d.deviceId,
          label: isRecommended ? `✅ ${rawLabel} (Tavsiya etiladi)` : isVirtual ? `⚠️ ${rawLabel} (Virtual drayver)` : rawLabel,
          isRecommended,
        };
      });
  } catch (e) {
    return [];
  }
}

export async function getBestHardwareMicrophoneStream(preferredDeviceId?: string): Promise<{ stream: MediaStream; deviceName: string }> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Brauzerda mikrofondan foydalanish imkoni yo'q.");
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter((d) => d.kind === "audioinput");

    let chosenDevice = audioInputs.find((d) => d.deviceId === preferredDeviceId && preferredDeviceId !== "");

    if (!chosenDevice) {
      // Intentionally filter out virtual silent drivers (AirBeamTV, Zoom, BlackHole, VB-Audio)
      chosenDevice = audioInputs.find((d) => {
        const name = (d.label || "").toLowerCase();
        const isVirtual =
          name.includes("airbeam") ||
          name.includes("zoom") ||
          name.includes("blackhole") ||
          name.includes("virtual") ||
          name.includes("vb-audio");
        return (
          !isVirtual &&
          (name.includes("built-in") ||
            name.includes("internal") ||
            name.includes("default") ||
            name.includes("macbook") ||
            name.includes("microphone"))
        );
      }) || audioInputs.find((d) => {
        const name = (d.label || "").toLowerCase();
        return !name.includes("airbeam") && !name.includes("zoom") && !name.includes("virtual");
      }) || audioInputs[0];
    }

    if (chosenDevice && chosenDevice.deviceId) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: chosenDevice.deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return { stream, deviceName: chosenDevice.label || "Asosiy Mikrofon" };
    }
  } catch (e) {
    console.warn("Aniq apparat mikrofonga ulanishda ogohlantirish, umumiyga o'tilmoqda:", e);
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  return { stream, deviceName: "Standart Mikrofon" };
}

// --- Live Speech Recognizer with Real-Time AnalyserNode & Silence Detection ---
export class UzbekVisualSpeechRecognizer {
  private recognition: any = null;
  public isListening = false;
  private onResultCb?: (text: string, isFinal: boolean) => void;
  private onSilenceDetectedCb?: (finalText: string) => void;
  private onVolumeChangeCb?: (volume: number) => void;
  private onErrorCb?: (error: any) => void;

  private currentFullTranscript = "";
  public silenceThresholdMs = 2500; // 2.5s comfortable silence after speaking

  // Audio Pipeline
  private audioStream: MediaStream | null = null;
  public activeDeviceName = "Standart Mikrofon";
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private volumeCheckInterval: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedAudioChunks: Blob[] = [];

  // VAD state
  private userHasSpoken = false;
  private silenceStartTimestamp = 0;
  private speechEnergyAccumulator = 0;
  private turnSubmitted = false;

  constructor(
    onResult?: (text: string, isFinal: boolean) => void,
    onSilenceDetected?: (finalText: string) => void,
    onVolumeChange?: (volume: number) => void,
    onError?: (error: any) => void
  ) {
    this.onResultCb = onResult;
    this.onSilenceDetectedCb = onSilenceDetected;
    this.onVolumeChangeCb = onVolumeChange;
    this.onErrorCb = onError;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "uz-UZ";
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          const text = (finalTranscript + interimTranscript).trim();
          if (text) {
            this.currentFullTranscript = text;
            this.userHasSpoken = true;
            this.silenceStartTimestamp = 0;
            this.onResultCb?.(text, Boolean(finalTranscript));
          }
        };

        this.recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.warn("Speech recognition error:", event.error);
          }
        };

        this.recognition.onend = () => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {}
          }
        };
      } catch (e) {}
    }
  }

  public isSupported(): boolean {
    return true;
  }

  public async requestMicPermission(preferredDeviceId?: string): Promise<boolean> {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        if (!this.audioStream || !this.audioStream.active) {
          const { stream, deviceName } = await getBestHardwareMicrophoneStream(preferredDeviceId);
          this.audioStream = stream;
          this.activeDeviceName = deviceName;
        }
        const audioCtx = getOrCreateAudioContext();
        if (audioCtx.state === "suspended") {
          await audioCtx.resume().catch(() => {});
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn("Microphone permission check failed:", err);
      this.onErrorCb?.({ type: "mic_denied", message: err.message || "Mikrofon ruxsati berilmadi" });
      return false;
    }
  }

  public async start(): Promise<void> {
    this.isListening = true;
    this.userHasSpoken = false;
    this.silenceStartTimestamp = 0;
    this.speechEnergyAccumulator = 0;
    this.turnSubmitted = false;
    this.currentFullTranscript = "";
    this.recordedAudioChunks = [];

    // Ensure real hardware microphone stream is live
    try {
      if (!this.audioStream || !this.audioStream.active) {
        const { stream, deviceName } = await getBestHardwareMicrophoneStream();
        this.audioStream = stream;
        this.activeDeviceName = deviceName;
      }
    } catch (e: any) {
      console.warn("Microphone acquire error:", e);
      this.onErrorCb?.({ type: "mic_denied", message: e.message });
      return;
    }

    const audioCtx = getOrCreateAudioContext();
    if (audioCtx.state === "suspended") {
      await audioCtx.resume().catch(() => {});
    }

    // Connect AnalyserNode for volume analysis without routing mic to speakers (Acoustic loop prevention!)
    try {
      if (!this.sourceNode) {
        this.sourceNode = audioCtx.createMediaStreamSource(this.audioStream);
      }
      if (!this.analyserNode) {
        this.analyserNode = audioCtx.createAnalyser();
        this.analyserNode.fftSize = 512;
        this.analyserNode.smoothingTimeConstant = 0.3;
        this.sourceNode.connect(this.analyserNode);
        // NOTE: NEVER connect analyserNode to audioCtx.destination!
      }

      if (this.volumeCheckInterval) {
        clearInterval(this.volumeCheckInterval);
      }

      const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.volumeCheckInterval = setInterval(() => {
        if (!this.isListening || !this.analyserNode) return;
        this.analyserNode.getByteTimeDomainData(dataArray);

        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);

        // Scaled vocal volume: rms 0.008 -> 0%, rms 0.12 -> 100%
        const vol = Math.min(100, Math.max(0, Math.round(((rms - 0.008) / 0.11) * 100)));
        this.onVolumeChangeCb?.(vol);

        const now = Date.now();
        if (vol > 18) {
          this.speechEnergyAccumulator += 50;
          if (this.speechEnergyAccumulator > 200) {
            this.userHasSpoken = true;
            this.silenceStartTimestamp = 0;
          }
        } else {
          this.speechEnergyAccumulator = Math.max(0, this.speechEnergyAccumulator - 25);
        }

        // VAD silence trigger: ONLY if student actually spoke something non-empty
        const hasSpokenContent = this.currentFullTranscript.trim().length >= 2;
        if (hasSpokenContent || this.userHasSpoken) {
          if (vol <= 12) {
            if (!this.silenceStartTimestamp) {
              this.silenceStartTimestamp = now;
            } else if (now - this.silenceStartTimestamp > this.silenceThresholdMs) {
              // 2.5s silence detected after speaking
              if (this.currentFullTranscript.trim().length > 0 && !this.turnSubmitted) {
                this.turnSubmitted = true;
                this.silenceStartTimestamp = 0;
                this.userHasSpoken = false;
                const textToSubmit = this.currentFullTranscript;
                this.onSilenceDetectedCb?.(textToSubmit);
              }
            }
          } else {
            this.silenceStartTimestamp = 0;
          }
        }
      }, 50);
    } catch (e) {
      console.warn("AnalyserNode setup error:", e);
    }

    // Start browser speech recognition
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }

    // Start MediaRecorder for raw audio capture
    try {
      if (typeof MediaRecorder !== "undefined" && this.audioStream) {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";
        this.mediaRecorder = new MediaRecorder(this.audioStream, mimeType ? { mimeType } : undefined);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.recordedAudioChunks.push(event.data);
          }
        };
        this.mediaRecorder.start(200);
      }
    } catch (mrErr) {
      console.warn("MediaRecorder start error:", mrErr);
    }
  }

  // Gracefully stop recorder and retrieve base64 via fast FileReader
  public async stopAndGetAudio(): Promise<{ base64: string; mimeType: string } | null> {
    this.stop();

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        if (!this.mediaRecorder) return resolve();
        this.mediaRecorder.onstop = () => resolve();
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          resolve();
        }
      });
    }

    if (this.recordedAudioChunks.length === 0) return null;

    try {
      const mime = this.mediaRecorder?.mimeType || "audio/webm";
      const blob = new Blob(this.recordedAudioChunks, { type: mime });

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = (reader.result as string) || "";
          const base64 = result.includes(",") ? result.split(",")[1] : result;
          resolve({
            base64,
            mimeType: blob.type.split(";")[0] || "audio/webm",
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not encode recorded audio:", e);
      return null;
    }
  }

  public async getRecordedAudioBase64(): Promise<{ base64: string; mimeType: string } | null> {
    return this.stopAndGetAudio();
  }

  public stop(): void {
    this.isListening = false;
    this.silenceStartTimestamp = 0;
    this.onVolumeChangeCb?.(0);

    if (this.volumeCheckInterval) {
      clearInterval(this.volumeCheckInterval);
      this.volumeCheckInterval = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  public resetTurn(): void {
    this.userHasSpoken = false;
    this.turnSubmitted = false;
    this.silenceStartTimestamp = 0;
    this.speechEnergyAccumulator = 0;
    this.currentFullTranscript = "";
    this.recordedAudioChunks = [];
  }
}

// --- Conversational Autonomous Dialogue Engine (Gemini Live) ---
export interface ConversationalTurnResult {
  transcribedStudentText: string;
  turnScore: number;
  isPassed: boolean;
  teacherSpokenMessage: string;
  isExamFinished: boolean;
}

export async function generateConversationalTeacherTurn(params: {
  bookTitle: string;
  topicTitle: string;
  questionNumber: number;
  totalQuestions: number;
  currentQuestion: string;
  idealAnswer: string;
  nextQuestion?: string; // Pre-generated next question from book syllabus
  studentText?: string;
  studentAudio?: { base64: string; mimeType: string };
  conversationHistory: { role: "teacher" | "student"; text: string }[];
}): Promise<ConversationalTurnResult> {
  const isFinal = params.questionNumber >= params.totalQuestions;

  const prompt = `Sen darslik bo'yicha o'quvchi bilan jonli, samimiy va tirik insondek og'zaki suhbat-imtihon o'tkazayotgan oliy toifali USTOZsan.
Darslik: "${params.bookTitle}"
Mavzu: "${params.topicTitle}"
Hozirgi savol raqami: ${params.questionNumber} / ${params.totalQuestions}
Siz bergan savol: "${params.currentQuestion}"
Darslikdagi to'g'ri etalon javob: "${params.idealAnswer}"

O'quvchining hozirgi og'zaki javobi:
"${params.studentText || "Javob berilmadi"}"

VAZIFA:
1. O'quvchining aytgan fikrini xolis bahola (0 dan 100 gacha ball).
2. "teacherSpokenMessage" maydonida o'quvchiga XUDDI TIRIK INSONDEK OVOZ CHIQARIB aytiladigan bitta yaxlit samimiy gap tuz:
   - Avval o'quvchining javobiga ixcham ustozona munosabat (feedback) bildir (masalan: "Barakalla, to'g'ri aytdingiz!" yoki "Yaxshi urinish, lekin falon faktni ham unutmang.").
   ${
     isFinal
       ? `- Bu oxirgi savol edi, shuning uchun samimiy tabriklab, imtihon yakunlanganini ayt (masalan: "Imtihonimiz muvaffaqiyatli yakunlandi, umumiy bilimingiz a'lo darajada!"). Yangi savol bermang.`
       : `- So'ngra darhol o'quvchiga AYNAN QUYIDAGI keyingi savolni ber: "${params.nextQuestion || "Keyingi savolga o'tamiz."}". Savol mazmunini aslo o'zgartirmasdan, chiroyli ustozona tarzda nutqqa kirit (masalan: "Endi ${params.questionNumber + 1}-savolim: ${params.nextQuestion}").`
   }
3. Faqat quyidagi JSON formatida javob ber:
{
  "transcribedStudentText": "${params.studentText || ""}",
  "turnScore": 85,
  "isPassed": true,
  "teacherSpokenMessage": "O'quvchiga ovoz chiqarib aytiladigan yaxlit ustoz nutqi (feedback + keyingi savol)",
  "isExamFinished": ${isFinal}
}`;

  const systemInstruction =
    "Sen oliy toifali, samimiy, talabchan va mehribon Ustozsan. O'quvchi bilan FAQAT VA FAQAT SOF O'ZBEK ADABIY TILIDA muloqot qilasan. Barcha gaplaring, savollaring va fikrlaring faqat toza o'zbek tilida bo'lishi shart. Ruscha, turkcha yoki boshqa chet so'zlarni aslo aralashtirma. Faqat JSON formatida javob berasan.";

  if (params.studentAudio && (!params.studentText || params.studentText.trim().length < 4)) {
    try {
      const parts = [
        {
          inlineData: {
            mimeType: params.studentAudio.mimeType || "audio/webm",
            data: params.studentAudio.base64,
          },
        },
        {
          text:
            `Ushbu audio yozuvda o'quvchi o'zbek tilida gapirdi. Audioni tingla, uning aytgan gaplarini "transcribedStudentText" maydoniga aniq yoz va yuqoridagi vazifani bajar.\n\n` +
            prompt,
        },
      ];
      const { text } = await callGeminiMultimodalApi(parts, systemInstruction, undefined, true);
      const parsed = extractAndParseJson<any>(text, {});
      return {
        transcribedStudentText: parsed.transcribedStudentText || "",
        turnScore: Math.min(100, Math.max(0, Number(parsed.turnScore) || 80)),
        isPassed: Boolean(parsed.isPassed ?? (parsed.turnScore >= 60)),
        teacherSpokenMessage: parsed.teacherSpokenMessage || "Javobingiz qabul qilindi. Keling, davom etamiz.",
        isExamFinished: Boolean(parsed.isExamFinished ?? isFinal),
      };
    } catch (e) {
      console.warn("Multimodal conversation error:", e);
    }
  }

  try {
    const { text } = await callGeminiTextApi(prompt, systemInstruction, undefined, true);
    const parsed = extractAndParseJson<any>(text, {});
    return {
      transcribedStudentText: params.studentText || "",
      turnScore: Math.min(100, Math.max(0, Number(parsed.turnScore) || 75)),
      isPassed: Boolean(parsed.isPassed ?? (parsed.turnScore >= 60)),
      teacherSpokenMessage: parsed.teacherSpokenMessage || "Yaxshi! Keling, keyingi savolga o'tamiz.",
      isExamFinished: Boolean(parsed.isExamFinished ?? isFinal),
    };
  } catch (e) {
    console.error("Conversation turn error:", e);
    return {
      transcribedStudentText: params.studentText || "",
      turnScore: 75,
      isPassed: true,
      teacherSpokenMessage: isFinal
        ? "Imtihonimiz yakunlandi, javoblaringiz uchun rahmat!"
        : "Javobingiz qabul qilindi! Keyingi savolga o'tamiz.",
      isExamFinished: isFinal,
    };
  }
}

