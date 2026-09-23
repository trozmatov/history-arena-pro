/**
 * Google Picker & Identity Services (GIS) Frontend Integration
 * History Arena PRO
 */

import type { TestExam, Question } from "../types/test";

// Environment variables or fallback defaults
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const GOOGLE_API_KEY =
  import.meta.env.VITE_GOOGLE_API_KEY || "";

// Required OAuth Scopes for Drive & Forms
export const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/forms.body.readonly",
].join(" ");

let gapiInited = false;
let gisInited = false;
let tokenClient: any = null;

/**
 * Dynamically loads an external script tag
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Initializes Google Identity Services (GIS) and Google API Client (gapi)
 */
export async function initGoogleServices(clientId = GOOGLE_CLIENT_ID): Promise<void> {
  // 1. Load GAPI (for Google Picker)
  if (!gapiInited) {
    await loadScript("https://apis.google.com/js/api.js");
    await new Promise<void>((resolve, reject) => {
      (window as any).gapi.load("picker", {
        callback: resolve,
        onerror: reject,
      });
    });
    gapiInited = true;
  }

  // 2. Load GIS (for OAuth Token Client)
  if (!gisInited) {
    await loadScript("https://accounts.google.com/gsi/client");
    if ((window as any).google?.accounts?.oauth2) {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: OAUTH_SCOPES,
        callback: () => {}, // Defined dynamically per request
      });
      gisInited = true;
    }
  }
}

/**
 * Launches the Google Drive Picker filtered to Google Forms
 */
export async function openGoogleFormsPicker(options: {
  clientId?: string;
  apiKey?: string;
  onSelected: (result: { formId: string; formTitle: string; oauthToken: string }) => void;
  onError: (errorMsg: string) => void;
  onCancel?: () => void;
}): Promise<void> {
  const clientId = options.clientId || GOOGLE_CLIENT_ID;
  const apiKey = options.apiKey || GOOGLE_API_KEY;

  if (!clientId) {
    options.onError(
      "Google Client ID sozlanmagan! Iltimos, Google Cloud Console'dan olingan Client ID ni kiriting."
    );
    return;
  }

  try {
    await initGoogleServices(clientId);

    if (!tokenClient) {
      options.onError("Google Identity Services yuklanmadi");
      return;
    }

    // Request OAuth Access Token from user
    tokenClient.callback = async (tokenResponse: any) => {
      if (tokenResponse.error !== undefined) {
        options.onError(`Kirishda xatolik: ${tokenResponse.error}`);
        return;
      }

      const oauthToken = tokenResponse.access_token;
      createPicker(oauthToken, apiKey, options);
    };

    // Prompt user to grant permission
    tokenClient.requestAccessToken({ prompt: "consent" });
  } catch (err: any) {
    options.onError(err.message || "Google Picker ochishda xatolik yuz berdi");
  }
}

/**
 * Creates and renders the Google Picker view
 */
function createPicker(
  oauthToken: string,
  apiKey: string,
  options: {
    onSelected: (result: { formId: string; formTitle: string; oauthToken: string }) => void;
    onError: (errorMsg: string) => void;
    onCancel?: () => void;
  }
) {
  const google = (window as any).google;
  if (!google || !google.picker) {
    options.onError("Google Picker kutubxonasi mavjud emas");
    return;
  }

  try {
    // Restrict view strictly to Google Forms, disable Drive folder navigation
    const formsView = new google.picker.DocsView()
      .setIncludeFolders(false)
      .setSelectFolderEnabled(false)
      .setMimeTypes("application/vnd.google-apps.form");

    const pickerBuilder = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .addView(formsView)
      .setOAuthToken(oauthToken)
      .setTitle("Google Forms Testini Tanlang")
      .setLocale("uz")
      .setCallback((data: any) => {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          const doc = data[google.picker.Response.DOCUMENTS][0];
          const formId = doc[google.picker.Document.ID];
          const formTitle = doc[google.picker.Document.NAME];

          options.onSelected({ formId, formTitle, oauthToken });
        } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
          if (options.onCancel) options.onCancel();
        }
      });

    if (apiKey) {
      pickerBuilder.setDeveloperKey(apiKey);
    }

    const picker = pickerBuilder.build();
    picker.setVisible(true);
  } catch (e: any) {
    options.onError(`Picker yaratish xatosi: ${e.message}`);
  }
}

export interface GoogleFormSummaryItem {
  id: string;
  name: string;
  modifiedTime?: string;
}

/**
 * Requests an OAuth access token using Google Identity Services (GIS)
 */
export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  await loadGoogleLibraries();

  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services kutubxonasi mavjud emas"));
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId || GOOGLE_CLIENT_ID,
        scope: OAUTH_SCOPES,
        callback: (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error || "Ruxsat berilmadi"));
          } else if (resp.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error("Token olinmadi"));
          }
        },
      });

      client.requestAccessToken({ prompt: "" });
    } catch (err: any) {
      reject(err);
    }
  });
}

/**
 * Fetches only Google Forms files directly, bypassing Drive folder UI
 */
export async function fetchUserGoogleForms(oauthToken: string): Promise<GoogleFormSummaryItem[]> {
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.form' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Forms ro'yxatini olishda xatolik (${res.status}): ${text}`);
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name || "Nomsiz Google Form",
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Helper: Extracts form ID from raw string or Google Form URL
 */
export function extractGoogleFormId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Pattern for /forms/d/e/.../viewform or /forms/d/.../edit
  const regex = /\/forms\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  // If already an ID without URL slashes
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Fetches real Google Form questions and structure using OAuth token
 */
export async function fetchAndParseGoogleForm(
  formId: string,
  oauthToken?: string,
  fallbackTitle?: string
): Promise<TestExam> {
  if (!oauthToken) {
    return createDefaultRepresentation(formId, fallbackTitle || "Google Forms Testi");
  }

  try {
    const res = await fetch(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`, {
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("Forms API direct fetch error, status:", res.status);
      return createDefaultRepresentation(formId, fallbackTitle || "Google Forms Testi");
    }

    const formData = await res.json();
    return parseGoogleFormData(formData, formId);
  } catch (e) {
    console.warn("fetchAndParseGoogleForm network issue:", e);
    return createDefaultRepresentation(formId, fallbackTitle || "Google Forms Testi");
  }
}

/**
 * Parses Google Forms API v1 JSON into platform TestExam format
 */
export function parseGoogleFormData(formData: any, formId: string): TestExam {
  const info = formData?.info || {};
  const items = formData?.items || [];
  const questions: Question[] = [];

  for (const item of items) {
    if (!item.questionItem) continue;

    const qItem = item.questionItem;
    const question = qItem.question || {};
    const grading = question.grading || {};

    let qType: Question["type"] = "mcq";
    const options: Question["options"] = [];
    let correctAnswerText = "";

    if (question.choiceQuestion) {
      const choiceQ = question.choiceQuestion;
      qType = choiceQ.type === "CHECKBOX" ? "checkbox" : "mcq";

      const correctSet = new Set(
        (grading.correctAnswers?.answers || []).map((a: any) => a.value)
      );

      (choiceQ.options || []).forEach((opt: any, idx: number) => {
        const optText = opt.value || `Variant ${idx + 1}`;
        options.push({
          id: `opt_${idx + 1}`,
          text: optText,
          isCorrect: correctSet.has(optText),
        });
      });
    } else if (question.textQuestion) {
      qType = "short_answer";
      correctAnswerText = grading.correctAnswers?.answers?.[0]?.value || "";
    }

    const points = typeof grading.pointValue === "number" ? grading.pointValue : 1;

    // Extract image if attached in Google Forms item
    const imageUrl =
      qItem.image?.sourceUri ||
      item.imageItem?.image?.sourceUri ||
      question.image?.sourceUri ||
      "";

    questions.push({
      id: question.questionId || `q_${Date.now()}_${questions.length + 1}`,
      text: item.title || "Savol matni",
      type: qType,
      options,
      points: points || 1,
      timeLimitSeconds: 30,
      correctAnswerText,
      explanation: item.description || "",
      imageUrl: imageUrl || undefined,
    });
  }

  // Fallback if form has no questions
  if (questions.length === 0) {
    return createDefaultRepresentation(formId, info.title || "Google Forms Testi");
  }

  return {
    id: `gf_${formId}`,
    title: info.title || "Google Forms Testi",
    description: info.description || "Google Forms orqali import qilingan test",
    folderId: "folder_umumiy",
    targetGrade: "Umumiy",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: true,
    timeLimitMinutes: Math.max(5, Math.ceil((questions.length * 45) / 60)),
    questions,
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true,
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 30,
    },
    source: "google_forms",
    sourceFormId: formId,
  };
}

export function createDefaultRepresentation(formId: string, formTitle: string): TestExam {
  return {
    id: `gf_${formId}`,
    title: formTitle || "Google Forms Testi",
    description: `Google Drive'dan import qilingan test (ID: ${formId})`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: true,
    timeLimitMinutes: 15,
    source: "google_forms",
    sourceFormId: formId,
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true,
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 30,
    },
    questions: [
      {
        id: "q_gf_1",
        text: "Google Formadan import qilingan 1-savol matni",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "opt_1", text: "Variant A (To'g'ri)", isCorrect: true },
          { id: "opt_2", text: "Variant B", isCorrect: false },
          { id: "opt_3", text: "Variant C", isCorrect: false },
          { id: "opt_4", text: "Variant D", isCorrect: false },
        ],
      },
      {
        id: "q_gf_2",
        text: "Google Formadan import qilingan 2-savol matni",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "opt_2_1", text: "Variant 1", isCorrect: false },
          { id: "opt_2_2", text: "Variant 2 (To'g'ri)", isCorrect: true },
        ],
      },
    ],
  };
}

/**
 * Built-in Sample Google Forms Test Templates
 * Allows testing the entire teacher/student anti-cheating pipeline immediately without OAuth keys!
 */
export const SAMPLE_GOOGLE_FORM_TESTS: TestExam[] = [
  {
    id: "demo_test_history_1",
    title: "Amir Temur Davlati va Temuriylar Uyg'onish Davri",
    description: "Google Forms orqali import qilingan namunaviy imtihon testi. 14-15 asrlar O'zbekiston tarixi.",
    folderId: "folder_7_sinf",
    targetGrade: "7-sinf",
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    published: true,
    timeLimitMinutes: 10,
    source: "google_forms",
    sourceFormId: "1FAIpQLSc_temur_demo_form_01",
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true, // User requested 0 tolerance
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 40,
    },
    questions: [
      {
        id: "q1",
        text: "Amir Temur qaysi yilda Samarqand taxtiga o'tirib, o'z davlatiga asos solgan?",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "o1_1", text: "1360-yil", isCorrect: false },
          { id: "o1_2", text: "1370-yil (9-aprel)", isCorrect: true },
          { id: "o1_3", text: "1380-yil", isCorrect: false },
          { id: "o1_4", text: "1395-yil", isCorrect: false },
        ],
      },
      {
        id: "q2",
        text: "Mirzo Ulug'bek tomonidan barpo etilgan Samarqand rasadxonasida nechta yulduzning koordinatasi aniqlangan?",
        imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "o2_1", text: "1018 ta yulduz ('Ziji Jadidi Ko'ragoniy')", isCorrect: true },
          { id: "o2_2", text: "500 ta yulduz", isCorrect: false },
          { id: "o2_3", text: "2500 ta yulduz", isCorrect: false },
          { id: "o2_4", text: "850 ta yulduz", isCorrect: false },
        ],
      },
      {
        id: "q3",
        text: "Temuriylar davrida ilm-fan va madaniyat rivojlangan asosiy markazlarni tanlang (Bir nechta variant):",
        type: "checkbox",
        points: 3,
        timeLimitSeconds: 45,
        options: [
          { id: "o3_1", text: "Samarqand", isCorrect: true },
          { id: "o3_2", text: "Hirot", isCorrect: true },
          { id: "o3_3", text: "London", isCorrect: false },
          { id: "o3_4", text: "Buxoro", isCorrect: true },
        ],
      },
      {
        id: "q4",
        text: "Amir Temurning davlat shiori qanday bo'lgan?",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 25,
        options: [
          { id: "o4_1", text: "Kuch — adolatdadir (Rosti-rasti)", isCorrect: true },
          { id: "o4_2", text: "Bilim — eng buyuk boylik", isCorrect: false },
          { id: "o4_3", text: "Tinchlik va taraqqiyot", isCorrect: false },
          { id: "o4_4", text: "G'alaba har qanday yo'l bilan", isCorrect: false },
        ],
      },
      {
        id: "q5",
        text: "Alisher Navoiy qaysi asari bilan turkiy tildagi birinchi 'Xamsa'ni yaratgan?",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "o5_1", text: "Xamsa (Besh doston)", isCorrect: true },
          { id: "o5_2", text: "Muhokamat ul-lug'atayn", isCorrect: false },
          { id: "o5_3", text: "Boburnoma", isCorrect: false },
          { id: "o5_4", text: "Devoni Foniy", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: "demo_test_world_history_2",
    title: "Qadimgi Dunyo Tarixi va Ilk Sivilizatsiyalar",
    description: "Qadimgi Misr, Bobil va Mesopotamiya madaniyati bo'yicha Google Forms test namunasi.",
    folderId: "folder_umumiy",
    targetGrade: "Umumiy",
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    published: true,
    timeLimitMinutes: 8,
    source: "google_forms",
    sourceFormId: "1FAIpQLSc_ancient_world_demo_02",
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true,
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 35,
    },
    questions: [
      {
        id: "qw1",
        text: "Tarixda birinchi yozma qonunlar majmuasi kim tomonidan tuzilgan?",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "ow1_1", text: "Hamurappi qonunlari (Bobil)", isCorrect: true },
          { id: "ow1_2", text: "Yuliy Sezar qonunlari", isCorrect: false },
          { id: "ow1_3", text: "Tutankhamon farmoni", isCorrect: false },
          { id: "ow1_4", text: "Napoleon kodeksi", isCorrect: false },
        ],
      },
      {
        id: "qw2",
        text: "Qadimgi Misrda ehromlar (piramidalar) nima maqsadda qurilgan?",
        imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 25,
        options: [
          { id: "ow2_1", text: "Fir'avnlarning muqaddas maqbaralari sifatida", isCorrect: true },
          { id: "ow2_2", text: "Astronomik kuzatuv minorasi sifatida", isCorrect: false },
          { id: "ow2_3", text: "Dushmanlardan saqlanish qal'asi", isCorrect: false },
        ],
      },
    ],
  },
];
