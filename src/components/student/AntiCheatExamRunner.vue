<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] bg-[#070d18] text-white flex flex-col select-none overflow-hidden font-sans">
      <!-- 0. Dynamic Moving Watermark Overlay (Anti-Photo / Anti-Screen Recording) -->
      <div
        v-if="test.antiCheat.showWatermark"
        class="pointer-events-none fixed inset-0 z-40 overflow-hidden flex flex-wrap gap-24 items-center justify-around opacity-15 select-none text-slate-400 font-mono text-xs"
      >
        <div v-for="i in 16" :key="i" class="transform -rotate-12 whitespace-nowrap">
          {{ watermarkText }}
        </div>
      </div>

      <!-- 0.1 BLANKING BLACKOUT OVERLAY (Obscures content the millisecond window loses focus or screenshot triggered) -->
      <div
        v-if="isObscured && !isDisqualified"
        @click="dismissObscured"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade cursor-pointer"
      >
        <div class="text-5xl animate-bounce">⚠️</div>
        <h2 class="text-xl font-black text-rose-400">Ekran Xavfsizlik Sababli Qoraytirildi!</h2>
        <p class="text-xs text-slate-300 max-w-md">
          Dastur fokusdan chiqqani yoki skrinshot vositasi aniqlandi. Testga qaytish uchun oynani bosing.
        </p>
        <button
          type="button"
          @click.stop="dismissObscured"
          class="mt-2 px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
        >
          Davom etish ↵
        </button>
      </div>

    <!-- ==========================================
         PHASE 1: PRE-EXAM SECURITY CHECKLIST MODAL
         ========================================== -->
    <div
      v-if="examPhase === 'checklist'"
      class="flex-1 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-5 border border-white/20 bg-[#0f1a30]/90 shadow-2xl relative">
        <!-- Ambient Specular Glow -->
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

        <div class="text-center space-y-2">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 text-3xl shadow-xl shadow-rose-600/30">
            🛡️
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            {{ test.title }}
          </h2>
          <p class="text-xs text-slate-400">
            Imtihon qat'iy <b>Anti-Cheating</b> va <b>Nol-Toleransiya</b> himoyasi ostida o'tkaziladi.
          </p>
        </div>

        <!-- Strict Rules Checklist -->
        <div class="space-y-2.5 text-xs bg-black/40 rounded-2xl p-4 border border-white/10">
          <div class="flex items-start gap-2.5">
            <span class="text-rose-400 font-black text-sm">⛶</span>
            <div>
              <b class="text-white">Majburiy To'liq Ekran:</b> Test faqat to'liq ekran (Fullscreen) rejimida ishlaydi.
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-rose-400 font-black text-sm">🚫</span>
            <div>
              <b class="text-rose-400">0-Toleransiya (Tab/Ilova almashtirish taqiq):</b> Boshqa tabga yoki dasturga (Telegram, ChatGPT, browser) <b>hatto 1 marta ham</b> o'tish mumkin emas! Qoidani buzish zudlik bilan testni bekor qiladi.
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-rose-400 font-black text-sm">📸</span>
            <div>
              <b class="text-amber-400">Skrinshot taqiqlangan:</b> PrintScreen yoki boshqa skrinshot vositalari bloklanadi, urinish ro'yxatga olinadi.
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <span class="text-rose-400 font-black text-sm">⏱️</span>
            <div>
              <b class="text-white">Taymer:</b> Jami {{ test.questions.length }} ta savol. Har bir savolga belgilangan vaqt ichida javob bering.
            </div>
          </div>
        </div>

        <!-- Start / Cancel Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="flex-1 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition cursor-pointer"
          >
            Chiqish
          </button>
          <button
            type="button"
            @click="handleStartExam"
            class="flex-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 py-3 text-xs font-black text-white shadow-xl shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Qoidalarni qabul qilaman va boshlayman 🚀</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ==========================================
         PHASE 2: RUNNING EXAM (ONE QUESTION FOCUS)
         ========================================== -->
    <div v-else-if="examPhase === 'running'" class="flex-1 flex flex-col relative z-30">
      <!-- Exam Header -->
      <header class="flex-shrink-0 w-full border-b border-white/10 bg-[#070d18]/90 backdrop-blur-2xl px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
        <!-- Left: Question Progress -->
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-xs border border-indigo-500/30">
            {{ currentQuestionIdx + 1 }}/{{ preparedQuestions.length }}
          </div>
          <div>
            <h1 class="text-xs sm:text-sm font-black text-white truncate max-w-[200px] sm:max-w-md">
              {{ test.title }}
            </h1>
            <p class="text-[10px] text-slate-400">
              Savol: {{ currentQuestionIdx + 1 }} / {{ preparedQuestions.length }} • Ball: {{ currentQuestion.points }}
            </p>
          </div>
        </div>

        <!-- Center: Active Question Countdown Timer -->
        <div class="flex items-center gap-2">
          <div
            class="flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-black border transition-all"
            :class="
              questionSecondsRemaining <= 10
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
            "
          >
            <span>⏳</span>
            <span>{{ questionSecondsRemaining }}s</span>
          </div>
        </div>

        <!-- Right: Violations Shield Badge & Finish Button -->
        <div class="flex items-center gap-2">
          <span
            class="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border"
            :class="
              violations.length === 0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse'
            "
          >
            <span>🛡️</span>
            <span>{{ violations.length === 0 ? 'Xavfsiz' : `${violations.length} ta ogohlantirish` }}</span>
          </span>

          <button
            type="button"
            @click="confirmFinish"
            class="px-3 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/40 hover:bg-rose-600/50 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            Testni Tugatish
          </button>
        </div>
      </header>

      <!-- Question Progress Bar -->
      <div class="w-full bg-slate-800 h-1">
        <div
          class="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300"
          :style="{ width: `${((currentQuestionIdx + 1) / preparedQuestions.length) * 100}%` }"
        ></div>
      </div>

      <!-- Main Focus Viewport: Single Question Card -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div class="w-full max-w-2xl apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border border-white/15 bg-[#0f1a30]/80 shadow-2xl">
          <!-- Question Question Type Badge & Question Text -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-[11px] font-black uppercase text-indigo-400">
              <span>
                {{
                  currentQuestion.type === 'mcq'
                    ? '🔘 Bitta to\'g\'ri javobni tanlang'
                    : currentQuestion.type === 'checkbox'
                    ? '☑️ Bir nechta to\'g\'ri javobni belgilang'
                    : '✍️ Javobingizni yozing'
                }}
              </span>
              <span class="text-slate-400 font-mono">{{ currentQuestion.points }} ball</span>
            </div>

            <h2 class="text-base sm:text-xl font-black text-white leading-relaxed">
              {{ currentQuestion.text }}
            </h2>
          </div>

          <!-- Question Image (If attached) -->
          <div
            v-if="currentQuestion.imageUrl"
            class="rounded-2xl overflow-hidden border border-white/15 bg-black/50 max-h-60 sm:max-h-80 flex items-center justify-center p-1 shadow-lg"
          >
            <img
              :src="currentQuestion.imageUrl"
              :alt="currentQuestion.text"
              class="max-h-56 sm:max-h-72 w-auto object-contain rounded-xl"
            />
          </div>

          <!-- Question Options: Radio / Checkbox / Text input -->
          <div class="space-y-2.5">
            <!-- 1. Multiple Choice Options (Radio) -->
            <template v-if="currentQuestion.type === 'mcq'">
              <div
                v-for="opt in currentQuestion.options"
                :key="opt.id"
                @click="selectMcqOption(currentQuestion.id, opt.id)"
                class="rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.99]"
                :class="
                  studentAnswers[currentQuestion.id] === opt.id
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-600/30 to-blue-600/20 ring-2 ring-indigo-500/40 font-black text-white shadow-lg shadow-indigo-500/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
                "
              >
                <div
                  class="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
                  :class="
                    studentAnswers[currentQuestion.id] === opt.id
                      ? 'border-indigo-400 bg-indigo-500'
                      : 'border-slate-500'
                  "
                >
                  <div
                    v-if="studentAnswers[currentQuestion.id] === opt.id"
                    class="h-2 w-2 rounded-full bg-white"
                  ></div>
                </div>
                <span class="text-xs sm:text-sm font-semibold flex-1">{{ opt.text }}</span>
              </div>
            </template>

            <!-- 2. Checkbox Options -->
            <template v-else-if="currentQuestion.type === 'checkbox'">
              <div
                v-for="opt in currentQuestion.options"
                :key="opt.id"
                @click="toggleCheckboxOption(currentQuestion.id, opt.id)"
                class="rounded-2xl p-4 border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.99]"
                :class="
                  isOptionChecked(currentQuestion.id, opt.id)
                    ? 'border-emerald-500 bg-emerald-600/20 ring-2 ring-emerald-500/40 font-black text-white shadow-lg'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200'
                "
              >
                <div
                  class="h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0"
                  :class="
                    isOptionChecked(currentQuestion.id, opt.id)
                      ? 'border-emerald-400 bg-emerald-500 text-white text-xs font-black'
                      : 'border-slate-500'
                  "
                >
                  <span v-if="isOptionChecked(currentQuestion.id, opt.id)">✓</span>
                </div>
                <span class="text-xs sm:text-sm font-semibold flex-1">{{ opt.text }}</span>
              </div>
            </template>

            <!-- 3. Short Answer Text -->
            <template v-else-if="currentQuestion.type === 'short_answer'">
              <div class="space-y-1.5">
                <input
                  type="text"
                  v-model="shortAnswerInput"
                  @input="handleShortAnswerChange"
                  placeholder="Javobingizni bu yerga yozing..."
                  class="w-full rounded-2xl px-4 py-3.5 text-sm bg-black/50 border border-white/15 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-bold"
                />
              </div>
            </template>
          </div>

          <!-- Question Footer Navigation -->
          <div class="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              :disabled="currentQuestionIdx === 0"
              @click="goToPrevQuestion"
              class="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 cursor-pointer"
            >
              ← Oldingi
            </button>

            <button
              v-if="currentQuestionIdx < preparedQuestions.length - 1"
              type="button"
              @click="goToNextQuestion"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Keyingi →
            </button>

            <button
              v-else
              type="button"
              @click="confirmFinish"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Imtihonni Yakunlash ✓
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- ==========================================
         PHASE 3: DISQUALIFIED MODAL (ZERO TOLERANCE)
         ========================================== -->
    <div
      v-else-if="examPhase === 'disqualified'"
      class="flex-1 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
    >
      <div class="w-full max-w-md apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-4 border-2 border-rose-500/60 bg-[#1a0c14]/90 text-center shadow-2xl animate-shake">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-600 text-3xl shadow-xl shadow-rose-600/50">
          🚫
        </div>
        <h2 class="text-xl font-black text-rose-400">
          Imtihondan Chetlatildingiz! (Diskvalifikatsiya)
        </h2>
        <p class="text-xs text-rose-200">
          {{ disqualificationReason || "Anti-cheating nol-toleransiya qoidasi buzildi." }}
        </p>

        <!-- Audit list of violations -->
        <div class="space-y-1.5 text-left bg-black/50 rounded-2xl p-3 border border-rose-500/20 max-h-36 overflow-y-auto custom-scrollbar text-xs">
          <div class="text-[10px] font-black uppercase text-rose-400">Qayd etilgan qoidabuzarliklar:</div>
          <div v-for="v in violations" :key="v.id" class="text-slate-300 text-[11px]">
            • <b class="text-rose-400">[{{ v.timeFormatted }}]</b> {{ v.message }}
          </div>
        </div>

        <button
          type="button"
          @click="finalizeAndExit"
          class="w-full py-3 rounded-2xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500 active:scale-95 transition cursor-pointer shadow-lg shadow-rose-600/30"
        >
          Natijani Ko'rish va Chiqish
        </button>
      </div>
    </div>

    <!-- ==========================================
         PHASE 4: RESULTS SUMMARY
         ========================================== -->
    <div
      v-else-if="examPhase === 'results'"
      class="flex-1 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-5 border border-white/20 bg-[#0f1a30]/90 text-center shadow-2xl">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-xl"
             :class="finalResult?.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'">
          {{ finalResult?.disqualified ? '🚫' : finalResult?.passed ? '🏆' : '📉' }}
        </div>

        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white">
            {{ finalResult?.disqualified ? "Imtihon Bekor Qilindi" : finalResult?.passed ? "Tabriklaymiz, Imtihondan O'tdingiz!" : "Imtihon Yakunlandi" }}
          </h2>
          <p class="text-xs text-slate-400 mt-1">{{ test.title }}</p>
        </div>

        <!-- Score Breakdown Cards -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="liquid-glass-inset rounded-2xl p-3 border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">To'plangan Ball</div>
            <div class="text-lg font-black text-indigo-400 mt-0.5">
              {{ finalResult?.score }} / {{ finalResult?.totalPoints }}
            </div>
          </div>
          <div class="liquid-glass-inset rounded-2xl p-3 border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Ko'rsatkich</div>
            <div class="text-lg font-black mt-0.5" :class="finalResult?.passed ? 'text-emerald-400' : 'text-rose-400'">
              {{ finalResult?.percentage }}%
            </div>
          </div>
          <div class="liquid-glass-inset rounded-2xl p-3 border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Qoidabuzarlik</div>
            <div class="text-lg font-black mt-0.5" :class="finalResult?.violations.length ? 'text-rose-400' : 'text-emerald-400'">
              {{ finalResult?.violations.length || 0 }} ta
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('finished', finalResult)"
          class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xs hover:brightness-110 active:scale-95 transition cursor-pointer shadow-xl shadow-blue-500/25"
        >
          Testlar Bo'limiga Qaytish ↵
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { TestExam, Question, ExamResult } from "../../types/test";
import { useAntiCheat } from "../../composables/useAntiCheat";
import { useTestsStore } from "../../composables/useTestsStore";
import { soundManager } from "../../composables/useAudio";

const props = defineProps<{
  test: TestExam;
  studentName: string;
  studentId: string;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "finished", result: ExamResult | null): void;
}>();

const testsStore = useTestsStore();

type ExamPhase = "checklist" | "running" | "disqualified" | "results";
const examPhase = ref<ExamPhase>("checklist");

const preparedQuestions = ref<Question[]>([]);
const currentQuestionIdx = ref(0);
const studentAnswers = ref<Record<string, string | string[]>>({});
const shortAnswerInput = ref("");

const startedAt = ref(0);
const finalResult = ref<ExamResult | null>(null);

// Per-question timer
const questionSecondsRemaining = ref(30);
let questionTimerInterval: any = null;

// Anti-Cheat Composable
const {
  isActive: isAntiCheatActive,
  isFullscreen,
  isObscured,
  isDisqualified,
  disqualificationReason,
  violations,
  watermarkText,
  dismissObscured,
  startMonitoring,
  stopMonitoring,
} = useAntiCheat({
  config: props.test.antiCheat,
  studentName: props.studentName,
  studentId: props.studentId,
  onDisqualified: (reason) => {
    handleExamDisqualified(reason);
  },
  onViolation: (v) => {
    try {
      soundManager.playError();
    } catch (e) {}
  },
});

const currentQuestion = computed<Question>(() => {
  return preparedQuestions.value[currentQuestionIdx.value] || props.test.questions[0];
});

// Prepare questions (Shuffle if configured)
function prepareExamQuestions() {
  let list = JSON.parse(JSON.stringify(props.test.questions)) as Question[];

  if (props.test.antiCheat.shuffleQuestions) {
    list = shuffleArray(list);
  }

  if (props.test.antiCheat.shuffleOptions) {
    list.forEach((q) => {
      if (q.options && q.options.length > 1) {
        q.options = shuffleArray(q.options);
      }
    });
  }

  preparedQuestions.value = list;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Start exam
async function handleStartExam() {
  prepareExamQuestions();
  startedAt.value = Date.now();
  currentQuestionIdx.value = 0;
  studentAnswers.value = {};

  examPhase.value = "running";

  // Start anti-cheating monitoring & fullscreen
  await startMonitoring();

  // Start question timer
  resetQuestionTimer();
}

function resetQuestionTimer() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
  }

  const qTimer = currentQuestion.value?.timeLimitSeconds || props.test.antiCheat.questionTimerSeconds || 30;
  questionSecondsRemaining.value = qTimer;

  questionTimerInterval = setInterval(() => {
    if (examPhase.value !== "running") {
      clearInterval(questionTimerInterval);
      return;
    }

    if (questionSecondsRemaining.value > 1) {
      questionSecondsRemaining.value--;
    } else {
      // Time is up for this question! Auto advance to next question
      goToNextQuestion();
    }
  }, 1000);
}

function selectMcqOption(questionId: string, optionId: string) {
  studentAnswers.value[questionId] = optionId;
  try {
    soundManager.playClick();
  } catch (e) {}
}

function toggleCheckboxOption(questionId: string, optionId: string) {
  const current = (studentAnswers.value[questionId] as string[]) || [];
  const idx = current.indexOf(optionId);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(optionId);
  }
  studentAnswers.value[questionId] = [...current];
  try {
    soundManager.playClick();
  } catch (e) {}
}

function isOptionChecked(questionId: string, optionId: string): boolean {
  const current = studentAnswers.value[questionId];
  return Array.isArray(current) && current.includes(optionId);
}

function handleShortAnswerChange() {
  if (currentQuestion.value) {
    studentAnswers.value[currentQuestion.value.id] = shortAnswerInput.value;
  }
}

function syncShortAnswerInput() {
  if (currentQuestion.value && currentQuestion.value.type === "short_answer") {
    shortAnswerInput.value = (studentAnswers.value[currentQuestion.value.id] as string) || "";
  } else {
    shortAnswerInput.value = "";
  }
}

function goToPrevQuestion() {
  if (currentQuestionIdx.value > 0) {
    currentQuestionIdx.value--;
    syncShortAnswerInput();
    resetQuestionTimer();
  }
}

function goToNextQuestion() {
  if (currentQuestionIdx.value < preparedQuestions.value.length - 1) {
    currentQuestionIdx.value++;
    syncShortAnswerInput();
    resetQuestionTimer();
  } else {
    // Last question reached
    finishExam();
  }
}

function confirmFinish() {
  if (confirm("Haqiqatan ham testni yakunlamoqchimisiz?")) {
    finishExam();
  }
}

function finishExam() {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
  }
  stopMonitoring();

  finalResult.value = testsStore.submitExamResult({
    testId: props.test.id,
    studentId: props.studentId,
    studentName: props.studentName,
    answers: studentAnswers.value,
    violations: violations.value,
    startedAt: startedAt.value,
    disqualified: false,
  });

  examPhase.value = "results";
  try {
    soundManager.playSuccess();
  } catch (e) {}
}

function handleExamDisqualified(reason: string) {
  if (questionTimerInterval) {
    clearInterval(questionTimerInterval);
  }
  examPhase.value = "disqualified";
  try {
    soundManager.playError();
  } catch (e) {}
}

function finalizeAndExit() {
  stopMonitoring();

  finalResult.value = testsStore.submitExamResult({
    testId: props.test.id,
    studentId: props.studentId,
    studentName: props.studentName,
    answers: studentAnswers.value,
    violations: violations.value,
    startedAt: startedAt.value,
    disqualified: true,
    disqualificationReason: disqualificationReason.value,
  });

  examPhase.value = "results";
}

onUnmounted(() => {
  if (questionTimerInterval) clearInterval(questionTimerInterval);
  stopMonitoring();
});
</script>
