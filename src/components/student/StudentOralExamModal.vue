<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="modalTitle"
    custom-class="max-w-2xl w-full"
  >
    <!-- ======================================================== -->
    <!-- STAGE 1: SELECT BOOK & TOPIC -->
    <!-- ======================================================== -->
    <div v-if="stage === 'select_book'" class="space-y-4 py-2">
      <div class="text-center space-y-1.5 px-2">
        <div class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-300">
          <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>⚡ Gemini 3.7 Flash Live Dialog</span>
        </div>
        <h3 class="text-lg font-black text-white">Darslik bo'yicha jonli aqlli suhbat-imtihon</h3>
        <p class="text-xs text-slate-400">
          Xuddi haqiqiy o'qituvchi bilan gaplashgandek muloqot qiling. AI savol beradi, sizni erkin tinglaydi, javobingizni tahlil qilib keyingi savolga o'tadi. Tugmalarni bosish shart emas!
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loadingBooks" class="py-12 text-center text-xs text-slate-400">
        <span class="animate-spin inline-block text-2xl mb-2">🔄</span>
        <div>Darsliklar yuklanmoqda...</div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="availableBooks.length === 0"
        class="rounded-3xl border border-white/5 bg-black/40 p-8 text-center space-y-2"
      >
        <div class="text-3xl">📚</div>
        <div class="text-xs font-bold text-white">Hozircha ustoz tomonidan darslik yuklanmagan</div>
        <p class="text-[11px] text-slate-500">Ustoz kabinetidan "AI Savol-Javob" bo'limida darslik qo'shilgach bu yerda paydo bo'ladi.</p>
      </div>

      <!-- Books Grid -->
      <div v-else class="space-y-3">
        <div class="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
          Qaysi darslikdan topshirasiz?
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="b in availableBooks"
            :key="b.id"
            @click="selectedBook = b; selectedChapter = b.chapters?.[0] || null"
            class="cursor-pointer rounded-2xl border p-3.5 transition flex flex-col justify-between space-y-2 select-none"
            :class="
              selectedBook?.id === b.id
                ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                : 'border-white/10 bg-slate-900/60 hover:border-white/20'
            "
          >
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-0.5">
                <div class="text-xs font-black text-white flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{{ b.title }}</span>
                </div>
                <div class="text-[10px] text-slate-400">{{ b.subject || "Fan" }}</div>
              </div>
              <span class="rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 border border-amber-500/30">
                +{{ b.rewardCoins || 15 }} 🪙
              </span>
            </div>

            <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
              <span>{{ b.chapters?.length || 0 }} ta mavzu</span>
              <span>{{ b.questionsPerExam || 5 }} ta savol</span>
            </div>
          </div>
        </div>

        <!-- Topic/Chapter selector -->
        <div v-if="selectedBook && selectedBook.chapters?.length > 1" class="space-y-1 pt-1">
          <label class="text-xs font-bold text-slate-300">Mavzu / Bob:</label>
          <select
            v-model="selectedChapter"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
          >
            <option
              v-for="ch in selectedBook.chapters"
              :key="ch.id"
              :value="ch"
            >
              {{ ch.title }}
            </option>
          </select>
        </div>

        <!-- Hardware Mic Selection -->
        <div v-if="availableMics.length > 0" class="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs">
          <span class="text-slate-400 flex items-center gap-1.5 font-bold">
            <span>🎙️ Kirish Mikrofoni:</span>
          </span>
          <select
            v-model="selectedMicId"
            class="rounded-lg bg-slate-900 border border-white/15 px-2.5 py-1 text-[11px] text-white outline-none focus:border-emerald-500 max-w-[260px] truncate"
          >
            <option v-for="m in availableMics" :key="m.id" :value="m.id">
              {{ m.label }}
            </option>
          </select>
        </div>

        <!-- Start Autonomous Dialogue Button -->
        <button
          type="button"
          @click="startConversationalExamFlow"
          :disabled="!selectedBook"
          class="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
        >
          <span>🎙️</span>
          <span>Jonli Muloqotni Boshlash (Avtomatik Rejim) 🚀</span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- STAGES 2..5: 100% AUTONOMOUS HANDS-FREE LIVE CONVERSATION -->
    <!-- ======================================================== -->
    <div v-else-if="stage !== 'exam_finished'" class="space-y-4 py-1 select-none">
      <!-- Top HUD Header -->
      <div class="flex items-center justify-between text-xs font-bold px-1 border-b border-white/10 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-black text-rose-300">
            <span class="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping"></span>
            <span>JONLI MULOQOT</span>
          </span>
          <span class="text-slate-300 truncate max-w-[180px] sm:max-w-xs">{{ selectedBook?.title }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 hidden sm:inline-flex items-center gap-1">
            <span>🎙️</span>
            <span class="truncate max-w-[130px]">{{ activeMicName }}</span>
          </span>
          <span class="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono font-black">
            {{ currentQuestionIndex + 1 }} / {{ totalQuestionsCount }}
          </span>
          <span class="text-amber-400 font-bold text-xs">
            +{{ coinsEarnedPending }} 🪙
          </span>
        </div>
      </div>

      <!-- LIVING VOICE ORB & AMBIENCE -->
      <div class="relative py-6 flex flex-col items-center justify-center min-h-[170px] overflow-hidden">
        <!-- Ambient Glowing Aura -->
        <div
          class="absolute w-48 h-48 rounded-full blur-3xl opacity-50 transition-all duration-700 pointer-events-none"
          :class="orbAuraClass"
        ></div>

        <!-- Center Interactive Orb (Breathes and scales with real voice volume!) -->
        <div
          class="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-100"
          :class="orbBodyClass"
          :style="orbDynamicTransform"
        >
          <!-- Orb Expression -->
          <div class="text-4xl sm:text-5xl transition-all">
            <span v-if="dialoguePhase === 'teacher_speaking'" class="animate-pulse">👨‍🏫</span>
            <span v-else-if="dialoguePhase === 'student_listening' && isMicActive">🎙️</span>
            <span v-else-if="dialoguePhase === 'student_listening' && !isMicActive">⏸️</span>
            <span v-else-if="dialoguePhase === 'teacher_thinking'" class="animate-spin inline-block">🧠</span>
          </div>

          <!-- Pulsing Ring when student speaks -->
          <div
            v-if="dialoguePhase === 'student_listening' && audioVolume > 15"
            class="absolute inset-0 rounded-full border-2 border-emerald-400/80 animate-ping pointer-events-none"
          ></div>
        </div>

        <!-- Real-time Equalizer Waves (9 Dancing Frequency Bars) -->
        <div class="relative z-10 flex items-end gap-1.5 h-8 mt-4 px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
          <div
            v-for="(bar, i) in equalizerBars"
            :key="i"
            class="w-1.5 rounded-full transition-all duration-75"
            :class="barColorClass"
            :style="{ height: `${bar}px` }"
          ></div>
          <span class="text-[10px] font-mono text-slate-400 ml-2 self-center">
            {{ dialoguePhase === 'student_listening' ? `${audioVolume}%` : 'LIVE' }}
          </span>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- KINEMATIC STREAMING SUBTITLES SECTION -->
      <!-- ======================================================== -->
      <div class="rounded-3xl border border-white/10 bg-slate-950/85 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-3 min-h-[140px] flex flex-col justify-between relative overflow-hidden">
        <!-- Subtitle Header Label -->
        <div class="flex items-center justify-between text-xs">
          <span
            class="font-black uppercase tracking-wider text-[11px] flex items-center gap-1.5"
            :class="subtitleHeaderColor"
          >
            <span>{{ subtitleHeaderIcon }}</span>
            <span>{{ subtitleHeaderText }}</span>
          </span>

          <span v-if="dialoguePhase === 'student_listening'" class="text-[10px] font-mono text-emerald-400 animate-pulse">
            ● Sizni tinglayapman...
          </span>
          <span v-else-if="dialoguePhase === 'teacher_thinking'" class="text-[10px] font-mono text-amber-400 animate-pulse">
            ● Javobingiz tahlil qilinmoqda...
          </span>
        </div>

        <!-- Live Subtitle Display -->
        <div class="py-1">
          <!-- When Teacher speaks or question is displayed -->
          <div v-if="dialoguePhase === 'teacher_speaking' || (dialoguePhase === 'student_listening' && !studentLiveSpeechText)" class="text-center space-y-1">
            <p class="text-base sm:text-lg font-black text-white leading-relaxed tracking-wide">
              « {{ streamingSubtitleText }} »
            </p>
            <p v-if="dialoguePhase === 'student_listening'" class="text-xs text-emerald-400/90 pt-1">
              🎙️ Mikrofonga javob bering, so'zlaringiz tugashi bilan ustoz avtomatik javob qaytaradi...
            </p>
          </div>

          <!-- When Student is actively speaking -->
          <div v-else-if="dialoguePhase === 'student_listening' && studentLiveSpeechText" class="text-center space-y-1">
            <p class="text-base sm:text-lg font-bold text-emerald-300 leading-relaxed">
              "{{ studentLiveSpeechText }}"<span class="animate-pulse inline-block text-emerald-400 font-bold ml-0.5">|</span>
            </p>
          </div>

          <!-- When Teacher is evaluating -->
          <div v-else-if="dialoguePhase === 'teacher_thinking'" class="text-center py-2 text-amber-300 text-sm font-bold flex items-center justify-center gap-2">
            <span>Ustoz javobingizni darslik faktlari bilan solishtirmoqda...</span>
          </div>
        </div>

        <!-- Context Pill below subtitle -->
        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
          <span>{{ selectedChapter?.title || 'Mavzu' }}</span>
          <span class="text-slate-500 italic">Avtomatik ovozli muloqot</span>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- BOTTOM DOCK: INSTANT SUBMIT & FINISH -->
      <!-- ======================================================== -->
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          v-if="dialoguePhase === 'student_listening'"
          type="button"
          @click="handleStudentAnswerTurnAutomatically"
          class="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition flex items-center gap-2 animate-pulse"
        >
          <span>✅</span>
          <span>Javobim Tayyor, Yuborish ➔</span>
        </button>

        <button
          type="button"
          @click="finishExamManually"
          class="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10 active:scale-95 transition flex items-center gap-2"
        >
          <span>⏹️</span>
          <span>Muloqotni Yakunlash</span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- STAGE 6: EXAM FINISHED REPORT -->
    <!-- ======================================================== -->
    <div v-else-if="stage === 'exam_finished'" class="space-y-4 py-2 text-center">
      <div class="text-5xl animate-bounce">
        {{ finalScore >= 60 ? '🏆' : '📚' }}
      </div>

      <div>
        <h3 class="text-xl font-black text-white">
          {{ finalScore >= 60 ? "Tabriklaymiz! Muloqot Muvaffaqiyatli Yakunlandi!" : "Muloqot Yakunlandi" }}
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ selectedBook?.title }} • {{ selectedChapter?.title || 'Mavzu' }}
        </p>
      </div>

      <!-- Score Ring Card -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl max-w-sm mx-auto space-y-3">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Umumiy Natija</div>
        <div class="text-4xl font-black tabular-nums" :class="finalScore >= 60 ? 'text-emerald-400' : 'text-amber-400'">
          {{ finalScore }}%
        </div>

        <div v-if="coinsEarnedPending > 0 && finalScore >= 60" class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1.5 text-xs font-black text-amber-300">
          <span>+{{ coinsEarnedPending }} 🪙 Tangalar hisobingizga qo'shildi!</span>
        </div>

        <div class="text-[11px] text-slate-400 pt-1 border-t border-white/5">
          Barcha {{ recordedScores.length }} ta savolga og'zaki jonli javob berildi.
        </div>
      </div>

      <!-- Action -->
      <div class="pt-2">
        <button
          type="button"
          @click="closeModal"
          class="rounded-2xl bg-blue-600 px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition"
        >
          Tushunarli & Yopish ✕
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import confetti from "canvas-confetti";
import {
  speakTeacherUtterance,
  stopAllSpeech,
  UzbekVisualSpeechRecognizer,
  generateConversationalTeacherTurn,
  getAudioInputDevicesList,
} from "../../services/geminiLiveService";
import { db, ref as fbRef, push, set, onChildAdded } from "../../services/firebase";
import { useStudentStore } from "../../composables/useStudentStore";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const studentStore = useStudentStore();

type ExamStage = "select_book" | "active_dialogue" | "exam_finished";
const stage = ref<ExamStage>("select_book");

// Hands-free Dialogue Phases
type DialoguePhase =
  | "teacher_speaking"  // Ustoz savol/javob gapirmoqda (subtitr streaming)
  | "student_listening" // O'quvchi javob bermoqda (mikrofon ochiq, VAD faol)
  | "teacher_thinking"; // Ustoz tahlil qilmoqda (Gemini)

const dialoguePhase = ref<DialoguePhase>("teacher_speaking");

// Microphones list
const availableMics = ref<{ id: string; label: string; isRecommended: boolean }[]>([]);
const selectedMicId = ref("");
const activeMicName = ref("MacBook Pro Microphone");

// Books & Questions
const availableBooks = ref<any[]>([]);
const loadingBooks = ref(false);
const selectedBook = ref<any>(null);
const selectedChapter = ref<any>(null);

interface ExamQuestion {
  question: string;
  idealAnswer: string;
  keyPoints?: string[];
}
const questionsList = ref<ExamQuestion[]>([]);
const currentQuestionIndex = ref(0);
const totalQuestionsCount = ref(5);

// Audio & Voice States
const isMicActive = ref(false);
const audioVolume = ref(0); // 0 to 100
let speechRecognizer: UzbekVisualSpeechRecognizer | null = null;

// Streaming Subtitles
const streamingSubtitleText = ref("");
const studentLiveSpeechText = ref("");
let subtitleInterval: any = null;

// History & Scoring
const recordedScores = ref<number[]>([]);
const conversationHistory = ref<{ role: "teacher" | "student"; text: string }[]>([]);

const currentQuestionItem = computed(() => questionsList.value[currentQuestionIndex.value]);

const finalScore = computed(() => {
  if (recordedScores.value.length === 0) return 0;
  const sum = recordedScores.value.reduce((a, b) => a + b, 0);
  return Math.round(sum / recordedScores.value.length);
});

const coinsEarnedPending = computed(() => selectedBook.value?.rewardCoins || 15);

const modalTitle = computed(() => {
  if (stage.value === 'select_book') return "🎙️ AI Og'zaki Savol-Javob";
  if (stage.value === 'exam_finished') return "🏁 Muloqot Natijalari";
  return `🎙️ Jonli Muloqot: ${selectedBook.value?.title || 'Darslik'}`;
});

// Dynamic Orb Aesthetics
const orbAuraClass = computed(() => {
  switch (dialoguePhase.value) {
    case "teacher_speaking": return "bg-blue-600/40";
    case "student_listening": return isMicActive.value ? "bg-emerald-500/50" : "bg-slate-700/30";
    case "teacher_thinking": return "bg-purple-600/50";
    default: return "bg-blue-600/20";
  }
});

const orbBodyClass = computed(() => {
  switch (dialoguePhase.value) {
    case "teacher_speaking":
      return "bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 shadow-blue-500/40 ring-4 ring-blue-500/20";
    case "student_listening":
      return isMicActive.value
        ? "bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-emerald-500/50 ring-4 ring-emerald-500/30"
        : "bg-gradient-to-tr from-slate-700 to-slate-800 shadow-slate-700/30 ring-2 ring-white/10";
    case "teacher_thinking":
      return "bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-amber-500 shadow-purple-500/40 ring-4 ring-purple-500/20";
    default:
      return "bg-slate-800 shadow-slate-800/30";
  }
});

const orbDynamicTransform = computed(() => {
  if (dialoguePhase.value === "student_listening" && isMicActive.value) {
    const scale = 1 + (audioVolume.value / 100) * 0.25;
    return { transform: `scale(${scale.toFixed(3)})` };
  }
  return {};
});

// Dynamic Equalizer 9-Bars that react to real volume
const equalizerBars = computed(() => {
  const vol = audioVolume.value;
  if (dialoguePhase.value === "student_listening" && isMicActive.value) {
    return [
      Math.max(4, Math.min(26, Math.round(vol * 0.35))),
      Math.max(4, Math.min(26, Math.round(vol * 0.65))),
      Math.max(4, Math.min(26, Math.round(vol * 0.95))),
      Math.max(4, Math.min(26, Math.round(vol * 1.25))),
      Math.max(4, Math.min(28, Math.round(vol * 1.50))),
      Math.max(4, Math.min(26, Math.round(vol * 1.25))),
      Math.max(4, Math.min(26, Math.round(vol * 0.95))),
      Math.max(4, Math.min(26, Math.round(vol * 0.65))),
      Math.max(4, Math.min(26, Math.round(vol * 0.35))),
    ];
  } else if (dialoguePhase.value === "teacher_speaking") {
    return [8, 14, 20, 24, 26, 24, 20, 14, 8];
  }
  return [4, 4, 4, 4, 4, 4, 4, 4, 4];
});

const barColorClass = computed(() => {
  if (dialoguePhase.value === "student_listening" && isMicActive.value) return "bg-emerald-400";
  if (dialoguePhase.value === "teacher_speaking") return "bg-cyan-400 animate-pulse";
  return "bg-slate-700";
});

// Subtitles Header Metadata
const subtitleHeaderColor = computed(() => {
  switch (dialoguePhase.value) {
    case "teacher_speaking": return "text-cyan-400";
    case "student_listening": return "text-emerald-400";
    case "teacher_thinking": return "text-amber-400";
    default: return "text-slate-400";
  }
});

const subtitleHeaderIcon = computed(() => {
  switch (dialoguePhase.value) {
    case "teacher_speaking": return "👨‍🏫";
    case "student_listening": return "🎙️";
    case "teacher_thinking": return "🧠";
    default: return "💬";
  }
});

const subtitleHeaderText = computed(() => {
  switch (dialoguePhase.value) {
    case "teacher_speaking": return "Ustoz Nutqi (Jonli Subtitr):";
    case "student_listening": return "Sizning Nutqingiz (Jonli):";
    case "teacher_thinking": return "Ustoz o'ylamoqda...";
    default: return "";
  }
});

onMounted(() => {
  // Load books from Firebase
  const booksRef = fbRef(db, "ai_exam_books");
  onChildAdded(booksRef, (snap: any) => {
    const b = { id: snap.key, ...snap.val() };
    if (!availableBooks.value.some((x) => x.id === b.id)) {
      availableBooks.value.push(b);
    }
  });

  // Discover and prioritize real physical MacBook microphone
  getAudioInputDevicesList().then((mics) => {
    availableMics.value = mics;
    const rec = mics.find((m) => m.isRecommended) || mics[0];
    if (rec) {
      selectedMicId.value = rec.id;
      activeMicName.value = rec.label.replace("✅ ", "").replace(" (Tavsiya etiladi)", "");
    }
  });

  // Setup Visual Speech Recognizer with Automated VAD
  speechRecognizer = new UzbekVisualSpeechRecognizer(
    (transcript) => {
      studentLiveSpeechText.value = transcript;
    },
    () => {
      // 1.8s SILENCE DETECTED AFTER SPEECH! Automatically advance turn hands-free!
      if (dialoguePhase.value === "student_listening") {
        handleStudentAnswerTurnAutomatically();
      }
    },
    (vol) => {
      audioVolume.value = vol;
    },
    (err: any) => {
      console.warn("Speech recognition notice:", err);
    }
  );
});

watch(selectedMicId, (newId) => {
  const chosen = availableMics.value.find((m) => m.id === newId);
  if (chosen) {
    activeMicName.value = chosen.label.replace("✅ ", "").replace(" (Tavsiya etiladi)", "").replace("⚠️ ", "").replace(" (Virtual drayver)", "");
  }
});

onUnmounted(() => {
  cleanUp();
});

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      cleanUp();
    }
  }
);

function cleanUp() {
  if (subtitleInterval) {
    clearInterval(subtitleInterval);
    subtitleInterval = null;
  }
  stopAllSpeech();
  speechRecognizer?.stop();
  isMicActive.value = false;
  audioVolume.value = 0;
}

// --- STREAMING SUBTITLES EFFECT ---
// Streams subtitle text letter-by-letter matching spoken audio smoothly!
function streamSubtitles(fullText: string) {
  if (subtitleInterval) {
    clearInterval(subtitleInterval);
    subtitleInterval = null;
  }
  streamingSubtitleText.value = "";
  let index = 0;
  const charsPerTick = 2;
  const tickSpeed = 35; // 35ms per 2 chars = ~55 chars/sec, natural human speech speed!

  subtitleInterval = setInterval(() => {
    if (index < fullText.length) {
      streamingSubtitleText.value += fullText.slice(index, index + charsPerTick);
      index += charsPerTick;
    } else {
      streamingSubtitleText.value = fullText;
      clearInterval(subtitleInterval);
      subtitleInterval = null;
    }
  }, tickSpeed);
}

// --- 100% AUTONOMOUS HANDS-FREE CONVERSATION FLOW ---

async function startConversationalExamFlow() {
  if (!selectedBook.value) return;

  // Initialize and unlock AudioContext & mic explicitly on user click gesture
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      await ctx.resume().catch(() => {});
    }
    await speechRecognizer?.requestMicPermission(selectedMicId.value);
  } catch (e) {
    console.warn("Audio permission error:", e);
  }

  const chapter = selectedChapter.value || selectedBook.value.chapters?.[0];
  if (chapter && chapter.questions && chapter.questions.length > 0) {
    questionsList.value = [...chapter.questions];
  } else {
    questionsList.value = [
      {
        question: `Darslikdagi "${selectedBook.value.title}" bo'yicha eng asosiy voqealar va sabablarni aytib bering.`,
        idealAnswer: "Darslik faktlari va tushunchalari.",
        keyPoints: ["Asosiy voqea", "Sabablar"],
      },
      {
        question: `Ushbu mavzuda eslab qolgan asosiy atama va qoidalarni sanab bering.`,
        idealAnswer: "Tegishli qoidalar.",
        keyPoints: ["Qoidalar", "Atamalar"],
      },
    ];
  }

  const configuredLimit = Number(selectedBook.value?.questionsPerExam) || 5;
  totalQuestionsCount.value = Math.min(configuredLimit, questionsList.value.length);
  currentQuestionIndex.value = 0;
  recordedScores.value = [];
  conversationHistory.value = [];
  stage.value = "active_dialogue";

  // Teacher asks question 1
  askQuestionTurn(0);
}

// Step A: Teacher speaks question aloud with synchronized streaming subtitles
async function askQuestionTurn(qIdx: number) {
  if (subtitleInterval) {
    clearInterval(subtitleInterval);
    subtitleInterval = null;
  }
  stopAllSpeech();
  speechRecognizer?.stop();
  dialoguePhase.value = "teacher_speaking";
  studentLiveSpeechText.value = "";

  const qItem = questionsList.value[qIdx];
  if (!qItem) return;

  const textToSpeak = qIdx === 0
    ? `Assalomu alaykum! Keling, darslik bo'yicha suhbatlashamiz. 1-savolim: ${qItem.question}`
    : qItem.question;

  conversationHistory.value.push({ role: "teacher", text: textToSpeak });

  // Speak with Google Native Audio TTS
  await speakTeacherUtterance(
    textToSpeak,
    // onEnded callback -> Teacher finished speaking, open mic automatically after audio clears!
    () => {
      openMicForStudent();
    },
    // onStarted callback -> Audio started playing from speaker, start subtitle streaming!
    () => {
      streamSubtitles(textToSpeak);
    }
  );
}

// Step B: Mic automatically opens, VAD listens (with 250ms speaker echo settling delay)
async function openMicForStudent() {
  stopAllSpeech();
  if (subtitleInterval) {
    clearInterval(subtitleInterval);
    subtitleInterval = null;
  }

  setTimeout(async () => {
    dialoguePhase.value = "student_listening";
    studentLiveSpeechText.value = "";
    isMicActive.value = true;
    speechRecognizer?.resetTurn();
    await speechRecognizer?.start();
  }, 250);
}

// Step C: Automatic submit after silence detected
async function handleStudentAnswerTurnAutomatically() {
  // 1. Immediately switch UI and stop microphone cleanly, collecting all final audio chunks
  isMicActive.value = false;
  dialoguePhase.value = "teacher_thinking";
  const audioData = await speechRecognizer?.stopAndGetAudio();

  const qItem = currentQuestionItem.value;
  const currentQNum = currentQuestionIndex.value + 1;
  const nextQItem = questionsList.value[currentQuestionIndex.value + 1];

  try {
    const result = await generateConversationalTeacherTurn({
      bookTitle: selectedBook.value.title,
      topicTitle: selectedChapter.value?.title || "Mavzu",
      questionNumber: currentQNum,
      totalQuestions: totalQuestionsCount.value,
      currentQuestion: qItem.question,
      idealAnswer: qItem.idealAnswer,
      nextQuestion: nextQItem ? nextQItem.question : undefined,
      studentText: studentLiveSpeechText.value,
      studentAudio: audioData || undefined,
      conversationHistory: conversationHistory.value,
    });

    if (result.transcribedStudentText) {
      studentLiveSpeechText.value = result.transcribedStudentText;
      conversationHistory.value.push({ role: "student", text: result.transcribedStudentText });
    }

    recordedScores.value.push(result.turnScore);

    // Speak Teacher's conversational response (feedback + next question or celebration)
    dialoguePhase.value = "teacher_speaking";
    conversationHistory.value.push({ role: "teacher", text: result.teacherSpokenMessage });

    await speakTeacherUtterance(
      result.teacherSpokenMessage,
      () => {
        if (result.isExamFinished || currentQuestionIndex.value >= totalQuestionsCount.value - 1) {
          finishExamFlow();
        } else {
          currentQuestionIndex.value++;
          openMicForStudent();
        }
      },
      () => {
        streamSubtitles(result.teacherSpokenMessage);
      }
    );
  } catch (e) {
    console.error("Autonomous dialogue turn error:", e);
    // Graceful continuation
    if (currentQuestionIndex.value >= totalQuestionsCount.value - 1) {
      finishExamFlow();
    } else {
      currentQuestionIndex.value++;
      askQuestionTurn(currentQuestionIndex.value);
    }
  }
}

// Step D: Finish dialogue
async function finishExamFlow() {
  cleanUp();
  stage.value = "exam_finished";

  if (finalScore.value >= 60) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    studentStore.addCoins(coinsEarnedPending.value);
  }

  // Save result to Firebase
  try {
    const record = {
      studentName: studentStore.studentName.value || "O'quvchi",
      bookTitle: selectedBook.value?.title || "Darslik",
      topicTitle: selectedChapter.value?.title || "Mavzu",
      score: finalScore.value,
      isPassed: finalScore.value >= 60,
      coinsAwarded: finalScore.value >= 60 ? coinsEarnedPending.value : 0,
      date: new Date().toLocaleDateString("uz-UZ"),
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      mode: "conversational_live",
    };
    const resultsRef = push(fbRef(db, "ai_exam_results"));
    await set(resultsRef, record);
  } catch (e) {
    console.warn("Could not save to Firebase:", e);
  }
}

function finishExamManually() {
  cleanUp();
  if (recordedScores.value.length > 0) {
    finishExamFlow();
  } else {
    stage.value = "select_book";
    emit("update:modelValue", false);
  }
}

function closeModal() {
  cleanUp();
  stage.value = "select_book";
  emit("update:modelValue", false);
}
</script>
