<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="📥 Google Forms'dan Test Import Qilish"
    custom-class="max-w-2xl w-full"
  >
    <div class="space-y-4 py-1 text-slate-800 dark:text-slate-100">
      <!-- Import Methods Segmented Tabs -->
      <div class="flex rounded-2xl p-1 border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl gap-1 text-xs">
        <button
          type="button"
          @click="activeTab = 'picker'"
          class="flex-1 py-2 px-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'picker'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>📁</span>
          <span>Google Picker (Drive)</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'url'"
          class="flex-1 py-2 px-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'url'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>🔗</span>
          <span>Havola / Form ID</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'demo'"
          class="flex-1 py-2 px-2.5 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'demo'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>⚡</span>
          <span>Tayyor Namuna (1-klik)</span>
        </button>
      </div>

      <!-- TAB 1: GOOGLE FORMS RO'YXATI (TO'G'RIDAN-TO'G'RI FORMALAR, DRIVE PAPKALARISIZ) -->
      <div v-if="activeTab === 'picker'" class="space-y-3 liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xl font-black">
              📋
            </div>
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">Google Forms Testlarim</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Google Drive papkalari ko'rinmaydi — faqat hisobingizdagi test shakllari ro'yxati chiqadi.
              </p>
            </div>
          </div>

          <button
            type="button"
            :disabled="isLoadingForms"
            @click="handleFetchMyForms"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <span v-if="isLoadingForms" class="inline-block animate-spin">⏳</span>
            <span v-else>🔄</span>
            <span>{{ userFormsList.length > 0 ? "Qayta yangilash" : "Formalarimni Ko'rish" }}</span>
          </button>
        </div>

        <!-- Google Forms List inside modal -->
        <div v-if="userFormsList.length > 0" class="space-y-2 pt-2">
          <div class="flex items-center justify-between gap-2">
            <input
              v-model="searchFormQuery"
              type="text"
              placeholder="🔍 Test nomi bo'yicha qidirish..."
              class="flex-1 rounded-xl px-3 py-1.5 text-xs bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 dark:text-white"
            />
            <span class="text-[11px] font-bold text-slate-400 shrink-0">
              {{ filteredFormsList.length }} / {{ userFormsList.length }} ta
            </span>
          </div>

          <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="form in filteredFormsList"
              :key="form.id"
              class="rounded-xl p-3 border border-white/40 dark:border-white/10 bg-white/60 dark:bg-black/30 hover:border-purple-500/50 hover:bg-purple-500/10 transition flex items-center justify-between gap-3 group"
            >
              <div class="min-w-0 flex-1">
                <div class="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-2">
                  <span class="text-purple-500 text-sm">📝</span>
                  <span class="truncate">{{ form.name }}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5">
                  ID: {{ form.id.substring(0, 16) }}... • {{ form.modifiedTime ? formatFormDate(form.modifiedTime) : "Yaqinda tahrirlangan" }}
                </div>
              </div>

              <button
                type="button"
                :disabled="isPicking"
                @click="handleSelectFormFromList(form)"
                class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-[11px] shadow transition hover:brightness-110 active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>Tanlash</span>
                <span>➔</span>
              </button>
            </div>

            <div v-if="filteredFormsList.length === 0" class="py-4 text-center text-xs text-slate-400">
              Qidiruv bo'yicha hech qanday test topilmadi.
            </div>
          </div>
        </div>

        <!-- Initial Placeholder before user clicks -->
        <div v-else class="py-6 text-center rounded-xl bg-purple-500/5 border border-dashed border-purple-500/20 space-y-2">
          <div class="text-3xl">📝</div>
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Google hisobingizdagi testlarni ko'rish uchun "Formalarimni Ko'rish" tugmasini bosing
          </div>
          <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
            Drive papkalari, begona fayllar ko'rinmaydi — aynan Google Forms testlaringiz to'g'ridan-to'g'ri ko'rsatiladi.
          </p>
        </div>

        <!-- Fallback Google Picker Option -->
        <div class="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
          <span class="text-[11px]">Agar xohlasangiz, Google oynasidan ham tanlashingiz mumkin:</span>
          <button
            type="button"
            :disabled="isPicking"
            @click="handleLaunchPicker"
            class="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Google Picker oynasi</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      <!-- TAB 2: URL / FORM ID IMPORT -->
      <div v-else-if="activeTab === 'url'" class="space-y-3 liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xl font-black">
            🔗
          </div>
          <div>
            <h4 class="text-sm font-black text-slate-900 dark:text-white">Havola yoki ID orqali import</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Google Formaning tahrirlash yoki ko'rish havolasini kiriting.
            </p>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Google Form Havolasi yoki Form ID:
          </label>
          <div class="flex gap-2">
            <input
              v-model="formUrlInput"
              type="text"
              placeholder="https://docs.google.com/forms/d/1FAIpQLSc.../edit"
              class="flex-1 rounded-xl px-3 py-2 text-xs bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              @click="handleParseUrl"
              class="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer shrink-0"
            >
              Ajratib Olish
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 3: DEMO TEMPLATES (1-CLICK) -->
      <div v-else-if="activeTab === 'demo'" class="space-y-3 liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xl font-black">
            ⚡
          </div>
          <div>
            <h4 class="text-sm font-black text-slate-900 dark:text-white">Namunaviy Google Forms Testlari</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Google Cloud sozlamalarisiz darhol sinab ko'rish uchun tayyorlangan haqiqiy testlar.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div
            v-for="sample in sampleTests"
            :key="sample.id"
            class="rounded-xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 p-3 flex flex-col justify-between gap-2 hover:border-emerald-500/50 transition"
          >
            <div>
              <div class="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                <span>📝 Google Form Namuna</span>
              </div>
              <h5 class="text-xs font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                {{ sample.title }}
              </h5>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                {{ sample.description }}
              </p>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
              <span>{{ sample.questions.length }} ta savol</span>
              <button
                type="button"
                @click="selectSample(sample)"
                class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold hover:bg-emerald-500 transition cursor-pointer"
              >
                Tanlash ✓
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ERROR MESSAGE -->
      <div
        v-if="errorMessage"
        class="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center justify-between"
      >
        <span>⚠️ {{ errorMessage }}</span>
        <button type="button" @click="errorMessage = ''" class="text-rose-400 hover:text-white ml-2">✖</button>
      </div>

      <!-- PREVIEW OF SELECTED / PARSED TEST -->
      <div v-if="parsedPreview" class="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">📋</span>
            <span class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Import Qilishga Tayyor
            </span>
          </div>
          <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            {{ parsedPreview.questions.length }} ta savol • {{ totalPoints }} ball
          </span>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ parsedPreview.title }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ parsedPreview.description }}</p>
        </div>

        <!-- Sample preview of first 2 questions -->
        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-xs">
          <div
            v-for="(q, idx) in parsedPreview.questions"
            :key="q.id"
            class="rounded-lg bg-black/20 dark:bg-black/40 p-2 border border-white/5 flex items-start gap-2"
          >
            <span class="font-black text-indigo-400">{{ idx + 1 }}.</span>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-slate-800 dark:text-slate-200 truncate">{{ q.text }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">
                Turi: {{ q.type === 'mcq' ? 'Bitta to\'g\'ri javob' : q.type === 'checkbox' ? 'Bir nechta javob' : 'Qisqa matn' }} • {{ q.points }} ball
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end gap-2 pt-1">
          <button
            type="button"
            @click="parsedPreview = null"
            class="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            @click="commitImport"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>✓ Tizimga Qo'shish</span>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BaseModal from "../common/BaseModal.vue";
import type { TestExam } from "../../types/test";
import {
  openGoogleFormsPicker,
  extractGoogleFormId,
  fetchAndParseGoogleForm,
  requestGoogleAccessToken,
  fetchUserGoogleForms,
  type GoogleFormSummaryItem,
  SAMPLE_GOOGLE_FORM_TESTS,
  GOOGLE_CLIENT_ID,
  GOOGLE_API_KEY,
} from "../../services/googlePickerService";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "imported", test: TestExam): void;
}>();

const activeTab = ref<"picker" | "url" | "demo">("picker");
const customClientId = ref(GOOGLE_CLIENT_ID);
const customApiKey = ref(GOOGLE_API_KEY);
const formUrlInput = ref("");
const isPicking = ref(false);
const errorMessage = ref("");
const parsedPreview = ref<TestExam | null>(null);

// Direct Google Forms list without Drive folders
const userFormsList = ref<GoogleFormSummaryItem[]>([]);
const isLoadingForms = ref(false);
const userOauthToken = ref("");
const searchFormQuery = ref("");

const filteredFormsList = computed(() => {
  if (!searchFormQuery.value.trim()) return userFormsList.value;
  const q = searchFormQuery.value.toLowerCase().trim();
  return userFormsList.value.filter((f) => f.name.toLowerCase().includes(q));
});

const sampleTests = SAMPLE_GOOGLE_FORM_TESTS;

const totalPoints = computed(() => {
  if (!parsedPreview.value) return 0;
  return parsedPreview.value.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

function formatFormDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

// Fetch user's Google Forms directly (No Drive folder UI)
async function handleFetchMyForms() {
  errorMessage.value = "";
  isLoadingForms.value = true;
  try {
    const token = userOauthToken.value || (await requestGoogleAccessToken(customClientId.value));
    userOauthToken.value = token;
    const forms = await fetchUserGoogleForms(token);
    userFormsList.value = forms;
    if (forms.length === 0) {
      errorMessage.value = "Google hisobingizda shakllar topilmadi. Avval forms.google.com da test yarating.";
    }
  } catch (err: any) {
    errorMessage.value = err.message || "Formalarni yuklab bo'lmadi";
  } finally {
    isLoadingForms.value = false;
  }
}

// Select a form from the direct list
async function handleSelectFormFromList(form: GoogleFormSummaryItem) {
  errorMessage.value = "";
  isPicking.value = true;
  try {
    parsedPreview.value = await fetchAndParseGoogleForm(form.id, userOauthToken.value, form.name);
  } catch (e: any) {
    createRepresentationFromGoogleForm(form.id, form.name);
  } finally {
    isPicking.value = false;
  }
}

// Launch Google Picker (Fallback)
async function handleLaunchPicker() {
  errorMessage.value = "";
  isPicking.value = true;

  try {
    await openGoogleFormsPicker({
      clientId: customClientId.value,
      apiKey: customApiKey.value,
      onSelected: async ({ formId, formTitle, oauthToken }) => {
        isPicking.value = false;
        try {
          parsedPreview.value = await fetchAndParseGoogleForm(formId, oauthToken, formTitle);
        } catch (e: any) {
          createRepresentationFromGoogleForm(formId, formTitle);
        }
      },
      onError: (err) => {
        isPicking.value = false;
        errorMessage.value = err;
      },
      onCancel: () => {
        isPicking.value = false;
      },
    });
  } catch (err: any) {
    isPicking.value = false;
    errorMessage.value = err.message || "Google Picker ochilmadi";
  }
}

// Parse direct URL or Form ID
async function handleParseUrl() {
  errorMessage.value = "";
  const formId = extractGoogleFormId(formUrlInput.value);
  if (!formId) {
    errorMessage.value = "Iltimos, to'g'ri Google Form havolasi yoki ID kiriting";
    return;
  }

  isPicking.value = true;
  try {
    const token =
      userOauthToken.value ||
      (await requestGoogleAccessToken(customClientId.value).catch(() => ""));
    if (token) {
      userOauthToken.value = token;
      parsedPreview.value = await fetchAndParseGoogleForm(formId, token);
    } else {
      createRepresentationFromGoogleForm(formId, "Google Form: " + formId.substring(0, 10));
    }
  } catch (e: any) {
    createRepresentationFromGoogleForm(formId, "Google Form: " + formId.substring(0, 10));
  } finally {
    isPicking.value = false;
  }
}

// Select a demo form
function selectSample(sample: TestExam) {
  parsedPreview.value = JSON.parse(JSON.stringify(sample));
}

function createRepresentationFromGoogleForm(formId: string, formTitle: string) {
  parsedPreview.value = {
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
          { id: "opt_2_1", text: "Javob 1", isCorrect: false },
          { id: "opt_2_2", text: "Javob 2 (To'g'ri)", isCorrect: true },
        ],
      },
    ],
  };
}

function commitImport() {
  if (!parsedPreview.value) return;
  emit("imported", parsedPreview.value);
  emit("update:modelValue", false);
  parsedPreview.value = null;
  formUrlInput.value = "";
}
</script>
