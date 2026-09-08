<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
  >
    <!-- Modal Container -->
    <div
      class="w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-900 p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
    >
      <!-- Background Ambient Glow -->
      <div class="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      <!-- ==================================================== -->
      <!-- VIEW 1: CHALLENGE LIST VIEW -->
      <!-- ==================================================== -->
      <template v-if="currentMode === 'list'">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-xl shadow-lg shadow-amber-500/10">
              🏆
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Chellenj Arena</span>
                <span class="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-300">
                  {{ activeChallenges.length }} ta faol
                </span>
              </h3>
              <p class="text-[11px] text-slate-400">Ustoz e'lon qilgan chellenjlarda qatnashing, sovrin yutib 1-o'ringa chiqing!</p>
            </div>
          </div>

          <button
            type="button"
            @click="closeModal"
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <!-- Challenges Scrollable List -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-1">
          <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
            <span class="animate-spin inline-block text-2xl mb-2">🔄</span>
            <div>Chellenjlar yuklanmoqda...</div>
          </div>

          <div
            v-else-if="challenges.length === 0"
            class="py-16 text-center rounded-3xl border border-white/5 bg-black/30 p-6 space-y-3"
          >
            <div class="text-4xl">⚔️</div>
            <div class="text-sm font-bold text-white">Hozircha faol chellenjlar yo'q</div>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              Ustoz yaqin orada yangi mavzu bo'yicha mukofotli chellenj e'lon qiladi. Guruhdagi xabarlarni kuzatib boring!
            </p>
          </div>

          <!-- Challenge Cards -->
          <div
            v-for="chal in challenges"
            :key="chal.id"
            class="rounded-3xl border p-5 shadow-xl backdrop-blur-xl space-y-4 transition relative overflow-hidden"
            :class="chal.status === 'active' ? 'border-amber-500/30 bg-slate-800/60 hover:border-amber-500/50' : 'border-white/5 bg-black/40 opacity-70'"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-lg">⚔️</span>
                  <h4 class="text-base font-black text-white">{{ chal.title }}</h4>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">
                  <span>📖 {{ chal.topic }}</span> • <span>{{ chal.questions.length }} ta test</span>
                </div>
              </div>

              <span
                v-if="chal.status === 'active'"
                class="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[10px] font-black text-amber-300 animate-pulse shrink-0"
              >
                FAOL
              </span>
              <span
                v-else
                class="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] font-bold text-slate-400 shrink-0"
              >
                YAKUNLANGAN
              </span>
            </div>

            <!-- Deadline Box -->
            <div class="rounded-2xl bg-black/50 border border-white/10 p-3 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <span class="text-base">⏳</span>
                <div>
                  <div class="text-[10px] text-slate-400 uppercase font-bold">Muddati (Deadline)</div>
                  <div class="font-black text-amber-300">
                    {{ formatRemainingTime(chal.deadline) }}
                  </div>
                </div>
              </div>
              <div class="text-right text-[11px] text-slate-400">
                {{ formatDateTime(chal.deadline) }}
              </div>
            </div>

            <!-- Rewards Box -->
            <div class="rounded-2xl bg-gradient-to-r from-amber-950/20 via-black/30 to-purple-950/20 border border-white/10 p-3 space-y-1.5">
              <div class="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>🎁</span> G'olib Uchun Sovrinlar:
              </div>
              <div class="flex flex-wrap gap-2 text-xs">
                <span v-if="chal.rewards?.cashPrize" class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 font-bold flex items-center gap-1">
                  <span>💰</span> {{ chal.rewards.cashPrize }}
                </span>
                <span v-if="chal.rewards?.coins" class="rounded-xl bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-amber-300 font-bold flex items-center gap-1">
                  <span>🪙</span> +{{ chal.rewards.coins }} coin
                </span>
                <span v-if="chal.rewards?.specialPerk" class="rounded-xl bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 text-purple-300 font-bold flex items-center gap-1">
                  <span>🛡️</span> {{ chal.rewards.specialPerk }}
                </span>
              </div>
            </div>

            <!-- Leaderboard Accordion / Summary -->
            <div class="space-y-2 pt-1 border-t border-white/5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-300 flex items-center gap-1">
                  <span>📊</span> Peshqadamlar Jadvali ({{ getParticipantCount(chal) }} nafar)
                </span>
                <span v-if="hasParticipated(chal)" class="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span>✅</span> Siz qatnashgansiz
                </span>
              </div>

              <!-- Top 3 Leaderboard -->
              <div v-if="getTopParticipants(chal, 3).length === 0" class="text-[11px] text-slate-500 italic py-1">
                Hozircha hech kim topshirmadi. Birinchi bo'lib topshiring va 1-o'rinni oling!
              </div>
              <div v-else class="space-y-1.5">
                <div
                  v-for="(p, idx) in getTopParticipants(chal, 3)"
                  :key="p.studentId"
                  class="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs"
                  :class="p.studentId === currentStudentId ? 'border border-emerald-500/40 bg-emerald-950/30' : 'border border-white/5 bg-black/30'"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-black">{{ ["🥇", "🥈", "🥉"][idx] }}</span>
                    <span class="font-bold text-slate-200" :class="{ 'text-emerald-300': p.studentId === currentStudentId }">
                      {{ p.studentName }} {{ p.studentId === currentStudentId ? "(Siz)" : "" }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2.5 font-bold">
                    <span class="text-emerald-400">{{ p.score }} ball</span>
                    <span class="text-slate-400 text-[10px]">{{ formatSeconds(p.timeSpentSeconds) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2 border-t border-white/10">
              <!-- If already participated -->
              <div
                v-if="hasParticipated(chal)"
                class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="text-lg">🎯</span>
                  <div>
                    <div class="font-black text-emerald-300">Natijangiz: {{ getMyScore(chal) }} ball</div>
                    <div class="text-[10px] text-slate-400">Vaqtingiz: {{ formatSeconds(getMyTime(chal)) }} • Reytingda {{ getMyRank(chal) }}-o'rindasiz</div>
                  </div>
                </div>
                <span class="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-black text-emerald-300">
                  TOPHIRILGAN
                </span>
              </div>

              <!-- If can participate -->
              <button
                v-else-if="chal.status === 'active' && !isDeadlinePassed(chal.deadline)"
                type="button"
                @click="startChallengeSession(chal)"
                class="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-amber-500/30 active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>🚀</span>
                <span>Chellenjga Qo'shilish va Boshlash</span>
              </button>

              <div
                v-else
                class="text-center py-2 text-xs text-slate-500 italic"
              >
                Muddati tugagan yoki yakunlangan
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================================================== -->
      <!-- VIEW 2: ACTIVE TEST SESSION (EXAM ARENA) -->
      <!-- ==================================================== -->
      <template v-else-if="currentMode === 'arena' && activeExamChallenge">
        <!-- Arena Header Bar -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
          <div>
            <div class="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <span>⚔️</span> {{ activeExamChallenge.title }}
            </div>
            <h4 class="text-sm font-black text-white">
              {{ currentQIndex + 1 }} / {{ activeExamChallenge.questions.length }}-savol
            </h4>
          </div>

          <!-- Live Stopwatch -->
          <div class="flex items-center gap-2 rounded-2xl bg-black/60 border border-white/10 px-3 py-1.5 text-xs font-black text-amber-300 shadow">
            <span class="animate-pulse">⏱️</span>
            <span>{{ formatSeconds(timerSeconds) }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shrink-0">
          <div
            class="bg-gradient-to-r from-amber-500 to-orange-400 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${((currentQIndex + 1) / activeExamChallenge.questions.length) * 100}%` }"
          ></div>
        </div>

        <!-- Question Card -->
        <div class="flex-1 overflow-y-auto space-y-5 pr-1 my-auto">
          <!-- Question Text -->
          <div class="rounded-3xl border border-white/10 bg-black/40 p-5 text-sm sm:text-base font-bold text-white leading-relaxed shadow-lg">
            {{ currentQuestionItem.question }}
          </div>

          <!-- Options Grid -->
          <div class="grid grid-cols-1 gap-2.5">
            <button
              v-for="(opt, optIdx) in currentQuestionItem.options"
              :key="optIdx"
              type="button"
              @click="selectedOptionIndex = optIdx"
              class="rounded-2xl border p-3.5 text-left text-xs sm:text-sm font-bold transition flex items-center gap-3 active:scale-[0.98]"
              :class="selectedOptionIndex === optIdx
                ? 'border-amber-500 bg-amber-500/20 text-amber-200 shadow-lg shadow-amber-500/20 scale-[1.01]'
                : 'border-white/10 bg-slate-800/70 text-slate-200 hover:bg-slate-800 hover:border-white/25'"
            >
              <span
                class="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black shrink-0 transition"
                :class="selectedOptionIndex === optIdx ? 'bg-amber-500 text-black' : 'bg-black/40 text-slate-400 border border-white/10'"
              >
                {{ ["A", "B", "C", "D"][optIdx] }}
              </span>
              <span class="flex-1">{{ opt }}</span>
            </button>
          </div>
        </div>

        <!-- Arena Footer Navigation -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-white/10 shrink-0">
          <div class="text-[11px] text-slate-400">
            Javobni tanlang va davom eting
          </div>

          <button
            type="button"
            @click="handleNextQuestion"
            :disabled="selectedOptionIndex === null"
            class="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-amber-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <span>{{ isLastQuestion ? "Chellenjni Yakunlash 🏁" : "Keyingi Savol ➔" }}</span>
          </button>
        </div>
      </template>

      <!-- ==================================================== -->
      <!-- VIEW 3: CELEBRATION RESULTS VIEW -->
      <!-- ==================================================== -->
      <template v-else-if="currentMode === 'results' && examResults">
        <div class="text-center py-6 space-y-6 my-auto">
          <!-- Celebration Icon -->
          <div class="relative inline-block">
            <div class="text-6xl animate-bounce">🏆</div>
            <div class="absolute -top-3 -right-3 text-2xl animate-spin">✨</div>
          </div>

          <div class="space-y-1">
            <h3 class="text-xl sm:text-2xl font-black text-white">Chellenj Muvaffaqiyatli Yakunlandi!</h3>
            <p class="text-xs text-slate-400">Sizning natijangiz qayd etildi va umumiy jadvalga kiritildi</p>
          </div>

          <!-- Score Card -->
          <div class="rounded-3xl border border-amber-500/30 bg-black/50 p-6 max-w-md mx-auto grid grid-cols-3 gap-4 shadow-xl">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Ball</div>
              <div class="text-2xl font-black text-emerald-400">{{ examResults.score }}</div>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">To'g'ri</div>
              <div class="text-2xl font-black text-amber-300">{{ examResults.correctCount }} / {{ examResults.totalQuestions }}</div>
            </div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Vaqt</div>
              <div class="text-2xl font-black text-indigo-300">{{ formatSeconds(examResults.timeSpentSeconds) }}</div>
            </div>
          </div>

          <!-- Coin Reward Notice -->
          <div v-if="earnedCoins > 0" class="rounded-2xl bg-amber-500/20 border border-amber-500/40 p-3 max-w-md mx-auto text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
            <span class="text-base">🪙</span>
            <span>Tabriklaymiz! Sizga +{{ earnedCoins }} ta coin taqdim etildi!</span>
          </div>

          <button
            type="button"
            @click="returnToChallengeList"
            class="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition"
          >
            📊 Peshqadamlar Jadvaliga Qaytish
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  fetchChallenges,
  submitChallengeAttempt,
  type Challenge,
  type ChallengeQuestion,
  type ChallengeParticipant,
} from "../../services/challengeService";
import { useStudentStore } from "../../composables/useStudentStore";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const studentStore = useStudentStore();

function sanitizeFbKey(name: string): string {
  return encodeURIComponent((name || "guest").toLowerCase().trim()).replace(/\./g, "%2E");
}

const currentStudentName = computed(() => {
  return (
    studentStore.studentName?.value ||
    studentStore.deviceStudent?.value?.name ||
    "O'quvchi"
  );
});

const currentStudentId = computed(() => {
  return sanitizeFbKey(currentStudentName.value);
});

const currentStudentAvatar = computed(() => {
  return studentStore.studentAvatar?.value || "🥷";
});

// Mode: 'list' | 'arena' | 'results'
const currentMode = ref<"list" | "arena" | "results">("list");
const loading = ref(false);
const challenges = ref<Challenge[]>([]);

const activeChallenges = computed(() => {
  return challenges.value.filter((c) => c.status === "active");
});

// Arena State
const activeExamChallenge = ref<Challenge | null>(null);
const currentQIndex = ref(0);
const selectedOptionIndex = ref<number | null>(null);
const userAnswers = ref<number[]>([]);
const timerSeconds = ref(0);
let timerInterval: any = null;

// Results State
const examResults = ref<{
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
} | null>(null);
const earnedCoins = ref(0);

// Load challenges
onMounted(async () => {
  await loadChallenges();
});

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      currentMode.value = "list";
      await loadChallenges();
    } else {
      stopTimer();
    }
  }
);

onUnmounted(() => {
  stopTimer();
});

async function loadChallenges() {
  loading.value = true;
  try {
    challenges.value = await fetchChallenges();
  } catch (e) {
    console.error("loadChallenges error:", e);
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  stopTimer();
  emit("update:modelValue", false);
}

// Check participation
function getMyParticipant(chal: Challenge): ChallengeParticipant | null {
  if (!chal.participants) return null;
  const myId = currentStudentId.value;
  if (chal.participants[myId]) return chal.participants[myId];
  const myName = currentStudentName.value.toLowerCase().trim();
  return (
    Object.values(chal.participants).find(
      (p) => (p.studentName || "").toLowerCase().trim() === myName
    ) || null
  );
}

function hasParticipated(chal: Challenge): boolean {
  return Boolean(getMyParticipant(chal));
}

function getMyScore(chal: Challenge): number {
  return getMyParticipant(chal)?.score || 0;
}

function getMyTime(chal: Challenge): number {
  return getMyParticipant(chal)?.timeSpentSeconds || 0;
}

function getMyRank(chal: Challenge): number {
  if (!chal.participants) return 1;
  const list = Object.values(chal.participants);
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });
  const myId = currentStudentId.value;
  const myName = currentStudentName.value.toLowerCase().trim();
  const idx = list.findIndex(
    (p) => p.studentId === myId || (p.studentName || "").toLowerCase().trim() === myName
  );
  return idx !== -1 ? idx + 1 : 1;
}

function getParticipantCount(chal: Challenge): number {
  return chal.participants ? Object.keys(chal.participants).length : 0;
}

function getTopParticipants(chal: Challenge, limit = 3): ChallengeParticipant[] {
  if (!chal.participants) return [];
  const list = Object.values(chal.participants);
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });
  return list.slice(0, limit);
}

function isDeadlinePassed(deadline: number): boolean {
  return Date.now() >= deadline;
}

const isFinishing = ref(false);

// Start Session
function startChallengeSession(chal: Challenge) {
  activeExamChallenge.value = chal;
  currentQIndex.value = 0;
  selectedOptionIndex.value = null;
  userAnswers.value = [];
  timerSeconds.value = 0;
  examResults.value = null;
  earnedCoins.value = 0;
  isFinishing.value = false;

  currentMode.value = "arena";
  startTimer();
}

const currentQuestionItem = computed<ChallengeQuestion>(() => {
  if (!activeExamChallenge.value || !activeExamChallenge.value.questions) {
    return { id: "q0", question: "", options: [], correctAnswer: 0, explanation: "" };
  }
  const q = activeExamChallenge.value.questions[currentQIndex.value];
  if (!q) {
    return { id: "q0", question: "", options: [], correctAnswer: 0, explanation: "" };
  }
  return q;
});

const isLastQuestion = computed(() => {
  if (!activeExamChallenge.value || !activeExamChallenge.value.questions) return true;
  return currentQIndex.value >= activeExamChallenge.value.questions.length - 1;
});

function handleNextQuestion() {
  if (selectedOptionIndex.value === null || isFinishing.value) return;
  userAnswers.value.push(selectedOptionIndex.value);
  selectedOptionIndex.value = null;

  if (isLastQuestion.value) {
    isFinishing.value = true;
    finishChallengeSession();
  } else {
    currentQIndex.value++;
  }
}

async function finishChallengeSession() {
  stopTimer();
  if (!activeExamChallenge.value || !activeExamChallenge.value.questions) {
    isFinishing.value = false;
    currentMode.value = "list";
    return;
  }

  const total = activeExamChallenge.value.questions.length;
  let correct = 0;
  activeExamChallenge.value.questions.forEach((q, idx) => {
    if (Number(userAnswers.value[idx]) === Number(q.correctAnswer)) {
      correct++;
    }
  });

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeSpent = timerSeconds.value;

  const sName = currentStudentName.value;
  const sId = currentStudentId.value;
  const sAvatar = currentStudentAvatar.value;

  const participantData: ChallengeParticipant = {
    studentId: sId,
    studentName: sName,
    studentAvatar: sAvatar,
    score,
    correctCount: correct,
    totalQuestions: total,
    timeSpentSeconds: timeSpent,
    submittedAt: Date.now(),
  };

  examResults.value = {
    score,
    correctCount: correct,
    totalQuestions: total,
    timeSpentSeconds: timeSpent,
  };

  // Award coins if passed
  if (score >= 60 && activeExamChallenge.value.rewards?.coins) {
    earnedCoins.value = activeExamChallenge.value.rewards.coins;
  }

  // Switch to celebration results screen immediately!
  currentMode.value = "results";
  isFinishing.value = false;

  // Save to Firebase asynchronously in background
  try {
    await submitChallengeAttempt(activeExamChallenge.value.id, participantData);
  } catch (e) {
    console.error("submitChallengeAttempt error:", e);
  }
}

async function returnToChallengeList() {
  currentMode.value = "list";
  await loadChallenges();
}

// Timer helpers
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    timerSeconds.value++;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatRemainingTime(deadline: number): string {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Muddati tugadi";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} kun ${hours % 24} soat qoldi`;
  }
  return `${hours} soat ${mins} daqiqa qoldi`;
}

function formatDateTime(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleString("uz-UZ", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSeconds(secs: number): string {
  const m = Math.floor((secs || 0) / 60);
  const s = (secs || 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
</script>
