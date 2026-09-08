<template>
  <div class="space-y-6 w-full mx-auto pb-12">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('back')"
          class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          title="Bosh menyuga qaytish"
        >
          ⬅️
        </button>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🎙️</span> AI Savol-Javob Tizimi
            <span class="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
              Gemini 3.7 Flash Live
            </span>
          </h2>
          <p class="text-xs text-slate-400">PDF darsliklarni o'qitish, boblarga ajratish va o'quvchilarni og'zaki imtihon qilish boshqaruvi</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="showApiKeyModal = true"
          class="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 active:scale-95 transition shadow-md"
        >
          <span>⚙️</span>
          <span>API Kalit & Sozlamalar</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'new-book'"
          class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
        >
          <span>➕</span>
          <span>Darslik Yuklash (PDF)</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex rounded-2xl bg-black/50 p-1.5 border border-white/10 text-xs gap-1">
      <button
        type="button"
        @click="activeTab = 'books'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'books' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>📚</span>
        <span>Yuklangan Darsliklar ({{ books.length }})</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'new-book'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'new-book' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>➕</span>
        <span>Yangi Darslik & PDF O'qitish</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'results'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'results' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>📊</span>
        <span>Og'zaki Imtihon Natijalari ({{ examResults.length }})</span>
      </button>
    </div>

    <!-- TAB 1: YUKLANGAN DARSLIKLAR -->
    <div v-if="activeTab === 'books'" class="space-y-4">
      <div v-if="loadingBooks" class="py-12 text-center text-xs text-slate-400">
        <span class="animate-spin inline-block text-2xl mb-2">🔄</span>
        <div>Darsliklar ro'yxati yuklanmoqda...</div>
      </div>

      <div
        v-else-if="books.length === 0"
        class="py-16 text-center rounded-3xl border border-white/5 bg-black/20 p-6 space-y-3"
      >
        <div class="text-4xl">📚</div>
        <div class="text-sm font-bold text-white">Hozircha o'qitilgan darsliklar mavjud emas</div>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          O'quvchilar bilan og'zaki savol-javob o'tkazish uchun yangi darslik yoki qo'llanma PDF faylini yuklab, Gemini 3.7 Flash orqali o'qiting.
        </p>
        <button
          type="button"
          @click="activeTab = 'new-book'"
          class="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 active:scale-95 transition"
        >
          ➕ Birinchi Darslikni Yuklash
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="b in books"
          :key="b.id"
          class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition group"
        >
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-2xl">📖</span>
                <div>
                  <h3 class="text-base font-black text-white group-hover:text-emerald-300 transition">
                    {{ b.title }}
                  </h3>
                  <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{{ b.subject || "Umumiy Fan" }}</span>
                    <span>•</span>
                    <span class="text-emerald-400 font-bold">{{ b.group || "Barcha guruhlar" }}</span>
                  </div>
                </div>
              </div>

              <span class="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                FAOL
              </span>
            </div>

            <p v-if="b.description" class="text-xs text-slate-300 line-clamp-2">
              {{ b.description }}
            </p>

            <!-- Metrics -->
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
              <div class="rounded-xl bg-black/40 p-2 border border-white/5">
                <div class="text-[10px] text-slate-400">Sahifalar</div>
                <div class="font-black text-white">{{ b.totalPages || 0 }} ta</div>
              </div>
              <div class="rounded-xl bg-black/40 p-2 border border-white/5">
                <div class="text-[10px] text-slate-400">Boblar</div>
                <div class="font-black text-emerald-400">{{ b.chapters?.length || 0 }} ta</div>
              </div>
              <div class="rounded-xl bg-black/40 p-2 border border-white/5">
                <div class="text-[10px] text-slate-400">Mukofot</div>
                <div class="font-black text-amber-400">+{{ b.rewardCoins || 15 }} 🪙</div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
            <button
              type="button"
              @click="previewBookDetails(b)"
              class="flex-1 rounded-xl bg-white/5 border border-white/10 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              🔍 Boblarni Ko'rish
            </button>
            <button
              type="button"
              @click="deleteBook(b.id)"
              class="rounded-xl bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/20"
              title="Darslikni o'chirish"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: YANGI DARSLIK & PDF YUKLASH -->
    <div v-else-if="activeTab === 'new-book'" class="max-w-2xl mx-auto space-y-5">
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
        <div>
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>📤</span> Darslik yoki Qo'llanma Yuklash (PDF)
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Darslikni yuklang, Gemini 3.7 Flash uning mazmunini o'rganib chiqadi va o'quvchilar uchun og'zaki savol-javob bazasini yaratadi.
          </p>
        </div>

        <!-- Form fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1 sm:col-span-2">
            <label class="text-xs font-bold text-slate-300">Darslik / Kitob Nomi *</label>
            <input
              v-model="newBook.title"
              type="text"
              placeholder="Masalan: 7-sinf O'zbekiston tarixi yoki Ingliz tili B2"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-300">Fan yo'nalishi</label>
            <input
              v-model="newBook.subject"
              type="text"
              placeholder="Masalan: Tarix, Biologiya, Matematika"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-300">Qaysi guruh/sinf uchun?</label>
            <input
              v-model="newBook.group"
              type="text"
              placeholder="Masalan: 7-A yoki Barcha guruhlar"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-300">Bir imtihondagi savollar soni</label>
            <select
              v-model.number="newBook.questionsPerExam"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
            >
              <option :value="3">3 ta savol (Tezkor)</option>
              <option :value="5">5 ta savol (Standart)</option>
              <option :value="7">7 ta savol (Kengaytirilgan)</option>
              <option :value="10">10 ta savol (To'liq imtihon)</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-bold text-slate-300">Muvaffaqiyatli topshirish mukofoti</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="newBook.rewardCoins"
                type="number"
                class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
              <span class="text-amber-400 font-bold text-sm shrink-0">🪙 Tanga</span>
            </div>
          </div>
        </div>

        <!-- Drag & Drop PDF Zone -->
        <div class="space-y-2 pt-2">
          <label class="text-xs font-bold text-slate-300">PDF Faylni Tanlang *</label>
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
            class="cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center space-y-2"
            :class="
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-white/20 bg-black/30 hover:border-white/40'
            "
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="text-4xl">📄</div>
            <div v-if="selectedFile">
              <div class="text-sm font-black text-white">{{ selectedFile.name }}</div>
              <div class="text-xs text-emerald-400 mt-0.5">
                Hajmi: {{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB • PDF tayyor
              </div>
            </div>
            <div v-else>
              <div class="text-sm font-bold text-white">PDF darslikni shu yerga tashlang yoki bosing</div>
              <div class="text-xs text-slate-400 mt-1">Darslik, konspekt yoki mavzuli qo'llanma (PDF formatida)</div>
            </div>
          </div>
        </div>

        <!-- Processing Progress -->
        <div v-if="processingPdf" class="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-emerald-300 flex items-center gap-1.5">
              <span class="animate-spin">🔄</span>
              <span>{{ progressStatusText }}</span>
            </span>
            <span class="text-white">{{ progressPercent }}%</span>
          </div>
          <div class="h-2 w-full rounded-full bg-black/60 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          @click="startProcessingBook"
          :disabled="processingPdf || !selectedFile || !newBook.title"
          class="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>{{ processingPdf ? "Gemini 3.7 Flash O'qitmoqda..." : "Darslikni O'qitish va Saqlash" }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 3: IMTIHON NATIJALARI -->
    <div v-else-if="activeTab === 'results'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>📊</span> O'quvchilarning Jonli Og'zaki Imtihon Natijalari
        </h3>
        <span class="text-xs text-slate-400">Jami: {{ examResults.length }} ta sinov</span>
      </div>

      <div v-if="examResults.length === 0" class="py-12 text-center rounded-3xl border border-white/5 bg-black/20 text-xs text-slate-400">
        Hozircha og'zaki imtihon topshirgan o'quvchilar yo'q.
      </div>

      <div v-else class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-for="r in examResults"
          :key="r.id"
          class="rounded-2xl border p-4 shadow-md transition space-y-2"
          :class="
            r.isPassed
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-red-500/30 bg-red-950/20'
          "
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ r.isPassed ? '🎓' : '📚' }}</span>
              <div>
                <div class="text-sm font-black text-white flex items-center gap-2">
                  <span>{{ r.studentName }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                    :class="
                      r.isPassed
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/20 border-red-500/40 text-red-300'
                    "
                  >
                    {{ r.isPassed ? 'O\'TDI' : 'O\'TMADI' }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">
                  Darslik: <b class="text-white">{{ r.bookTitle }}</b> • Bob: {{ r.topicTitle || 'Umumiy' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 self-end sm:self-center">
              <div class="text-right">
                <div class="text-lg font-black tabular-nums" :class="r.isPassed ? 'text-emerald-400' : 'text-red-400'">
                  {{ r.score }}%
                </div>
                <div v-if="r.coinsAwarded" class="text-[11px] text-amber-400 font-bold">
                  +{{ r.coinsAwarded }} 🪙
                </div>
              </div>
              <div class="text-[11px] text-slate-500 text-right">
                <div>{{ r.date }}</div>
                <div>{{ r.time }}</div>
              </div>
            </div>
          </div>

          <!-- Oral feedback snippet -->
          <div v-if="r.feedback" class="text-xs bg-black/40 rounded-xl p-2.5 border border-white/5 text-slate-300 leading-relaxed">
            <span class="text-emerald-400 font-bold">Ustoz (Gemini 3.7) xulosasi:</span> {{ r.feedback }}
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: API KEY & MODEL SETTINGS -->
    <BaseModal
      v-model="showApiKeyModal"
      title="⚙️ Gemini API Kalit & Model Sozlamalari"
      custom-class="max-w-md w-full"
    >
      <div class="space-y-4 py-2">
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-300">Google Gemini API Kaliti</label>
          <input
            v-model="inputApiKey"
            type="password"
            placeholder="AIzaSy..."
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
          />
          <p class="text-[10px] text-slate-400">
            Google AI Studio'dan olingan bepul API kalit. Brauzeringiz xotirasida xavfsiz saqlanadi.
          </p>
        </div>

        <!-- Text Model Selector -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-300">Darslik Tahlili & Savol Tuzuvchi Model (Text-out)</label>
          <select
            v-model="selectedTextModel"
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
          >
            <option value="gemini-3.7-flash">Gemini 3.7 Flash (Asosiy / Tavsiya etiladi)</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          </select>
        </div>

        <!-- Audio Dialog Model Selector -->
        <div class="space-y-1">
          <label class="text-xs font-bold text-slate-300">Jonli Ovozli Muloqot Modeli (Google Native Audio)</label>
          <select
            v-model="selectedAudioModel"
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
          >
            <option value="gemini-2.5-flash-native-audio-latest">Gemini 2.5 Flash Native Audio Dialog (Live API - Tavsiya etiladi)</option>
            <option value="gemini-3.1-flash-tts-preview">Gemini 3.1 Flash TTS (Preview)</option>
            <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS</option>
          </select>
        </div>

        <div v-if="testResultMsg" class="p-3 rounded-xl text-xs font-bold border" :class="testResultSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'">
          {{ testResultMsg }}
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            @click="testApiKey"
            :disabled="testingKey || !inputApiKey"
            class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 disabled:opacity-50"
          >
            {{ testingKey ? "Tekshirilmoqda..." : "Ulanishni Sinash ⚡" }}
          </button>
          <button
            type="button"
            @click="saveApiKeySettings"
            class="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/20"
          >
            Saqlash
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- MODAL 2: BOOK DETAILS / CHAPTERS PREVIEW -->
    <BaseModal
      v-model="showBookModal"
      :title="`📖 ${selectedPreviewBook?.title || 'Darslik Tafsilotlari'}`"
      custom-class="max-w-xl w-full"
    >
      <div v-if="selectedPreviewBook" class="space-y-4 py-1">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Fan: <b class="text-white">{{ selectedPreviewBook.subject }}</b></span>
          <span>Jami sahifalar: <b class="text-emerald-400">{{ selectedPreviewBook.totalPages }} ta</b></span>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-black uppercase text-slate-300">Mavzular & Boblar Ro'yxati:</h4>
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="(c, idx) in selectedPreviewBook.chapters"
              :key="c.id"
              class="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1"
            >
              <div class="flex items-center justify-between">
                <div class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span class="text-emerald-400 font-mono">#{{ idx + 1 }}</span>
                  <span>{{ c.title }}</span>
                </div>
                <span class="text-[10px] text-slate-500">Sahifa: {{ c.startPage }}</span>
              </div>
              <p class="text-[11px] text-slate-400 line-clamp-2">{{ c.snippet || c.content || c.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import BaseModal from "../common/BaseModal.vue";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  getSelectedTextModel,
  setSelectedTextModel,
  getSelectedAudioModel,
  setSelectedAudioModel,
  testGeminiApiKey,
  extractPdfContent,
  generateHighQualityQuestionsFromPdf,
} from "../../services/geminiLiveService";
import { db, ref as fbRef, push, set, onChildAdded, onChildChanged, remove } from "../../services/firebase";

defineEmits<{
  (e: "back"): void;
}>();

const activeTab = ref<"books" | "new-book" | "results">("books");

// Books state
const books = ref<any[]>([]);
const loadingBooks = ref(false);
const selectedPreviewBook = ref<any>(null);
const showBookModal = ref(false);

// New book form
const newBook = ref({
  title: "",
  subject: "",
  group: "",
  questionsPerExam: 5,
  rewardCoins: 15,
});

const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Progress state
const processingPdf = ref(false);
const progressPercent = ref(0);
const progressStatusText = ref("");

// Exam Results state
const examResults = ref<any[]>([]);

// API Key Modal
const showApiKeyModal = ref(false);
const inputApiKey = ref("");
const selectedTextModel = ref("gemini-3.7-flash");
const selectedAudioModel = ref("gemini-2.5-flash-native-audio-latest");
const testingKey = ref(false);
const testResultMsg = ref("");
const testResultSuccess = ref(false);

onMounted(() => {
  inputApiKey.value = getGeminiApiKey();
  selectedTextModel.value = getSelectedTextModel();
  selectedAudioModel.value = getSelectedAudioModel();

  // Load books from Firebase Realtime DB
  const booksRef = fbRef(db, "ai_exam_books");
  onChildAdded(booksRef, (snap: any) => {
    const b = { id: snap.key, ...snap.val() };
    if (!books.value.some((x) => x.id === b.id)) {
      books.value.push(b);
    }
  });

  // Load exam results from Firebase
  const resultsRef = fbRef(db, "ai_exam_results");
  onChildAdded(resultsRef, (snap: any) => {
    const r = { id: snap.key, ...snap.val() };
    examResults.value.unshift(r);
  });
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    if (!newBook.value.title) {
      newBook.value.title = target.files[0].name.replace(/\.pdf$/i, "");
    }
  }
}

function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const f = event.dataTransfer.files[0];
    if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
      selectedFile.value = f;
      if (!newBook.value.title) {
        newBook.value.title = f.name.replace(/\.pdf$/i, "");
      }
    } else {
      alert("Iltimos, faqat PDF formatidagi fayl yuklang.");
    }
  }
}

async function startProcessingBook() {
  if (!selectedFile.value || !newBook.value.title) return;

  if (!getGeminiApiKey()) {
    showApiKeyModal.value = true;
    alert("Iltimos, avval Gemini API kalitingizni kiriting!");
    return;
  }

  processingPdf.value = true;
  progressPercent.value = 5;
  progressStatusText.value = "Fayl o'qilmoqda...";

  try {
    // 1. Extract PDF
    const pdfData = await extractPdfContent(selectedFile.value, (percent, text) => {
      progressPercent.value = percent;
      progressStatusText.value = text;
    });

    progressStatusText.value = "Gemini 3.7 Flash bilan faktik savollar tuzilmoqda...";

    // 2. Generate high-quality questions for top chapters (strip raw full text to optimize DB!)
    const chaptersWithQuestions = [];
    for (let i = 0; i < Math.min(pdfData.chapters.length, 6); i++) {
      const ch = pdfData.chapters[i];
      const questions = await generateHighQualityQuestionsFromPdf(
        newBook.value.title,
        ch.title,
        ch.content,
        newBook.value.questionsPerExam
      );
      chaptersWithQuestions.push({
        id: ch.id,
        title: ch.title,
        startPage: ch.startPage,
        questions,
        snippet: ch.content ? ch.content.slice(0, 180).trim() + "..." : "",
      });
    }

    // 3. Save to Firebase
    const bookRecord = {
      title: newBook.value.title,
      subject: newBook.value.subject || "Umumiy",
      group: newBook.value.group || "Barcha guruhlar",
      questionsPerExam: newBook.value.questionsPerExam,
      rewardCoins: newBook.value.rewardCoins,
      totalPages: pdfData.totalPages,
      chapters: chaptersWithQuestions,
      createdAt: Date.now(),
    };

    const newBookRef = push(fbRef(db, "ai_exam_books"));
    await set(newBookRef, bookRecord);

    alert(`"${newBook.value.title}" darsligi muvaffaqiyatli o'qitildi va saqlandi!`);

    // Reset
    selectedFile.value = null;
    newBook.value = {
      title: "",
      subject: "",
      group: "",
      questionsPerExam: 5,
      rewardCoins: 15,
    };
    activeTab.value = "books";
  } catch (e: any) {
    console.error("Xatolik:", e);
    alert(`Xatolik yuz berdi: ${e.message || e}`);
  } finally {
    processingPdf.value = false;
  }
}

function previewBookDetails(book: any) {
  selectedPreviewBook.value = book;
  showBookModal.value = true;
}

async function deleteBook(id: string) {
  if (confirm("Ushbu darslikni o'chirishga ishonchingiz komilmi?")) {
    await remove(fbRef(db, `ai_exam_books/${id}`));
    books.value = books.value.filter((b) => b.id !== id);
  }
}

async function testApiKey() {
  testingKey.value = true;
  testResultMsg.value = "";
  try {
    const res = await testGeminiApiKey(inputApiKey.value);
    testResultSuccess.value = res.success;
    testResultMsg.value = res.message + (res.model ? ` (Ishlatilgan model: ${res.model})` : "");
  } catch (e: any) {
    testResultSuccess.value = false;
    testResultMsg.value = e.message || "Ulanish muvaffaqiyatsiz.";
  } finally {
    testingKey.value = false;
  }
}

function saveApiKeySettings() {
  setGeminiApiKey(inputApiKey.value);
  setSelectedTextModel(selectedTextModel.value);
  setSelectedAudioModel(selectedAudioModel.value);
  showApiKeyModal.value = false;
  alert("Sozlamalar saqlandi!");
}
</script>
