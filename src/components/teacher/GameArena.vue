<template>
  <div class="space-y-4 max-w-xl mx-auto pb-6">
    <!-- Top Action Bar: Undo, Timer, Question Counter, Home -->
    <div class="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl">
      <!-- Undo Button -->
      <button
        type="button"
        @click="triggerUndo"
        class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
        title="Oxirgi amalni bekor qilish (Undo)"
      >
        ↩️
      </button>

      <!-- Timer & Live Status -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 shadow-inner">
          <span class="relative flex h-2.5 w-2.5">
            <span v-if="!teacherStore.isPaused.value" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="teacherStore.isPaused.value ? 'bg-amber-400' : 'bg-emerald-500'"></span>
          </span>
          <span class="font-mono text-xl font-black tracking-widest text-emerald-300">
            {{ teacherStore.formattedTimer.value }}
          </span>
        </div>

        <button
          type="button"
          @click="teacherStore.togglePause"
          class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base text-slate-300 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
          :title="teacherStore.isPaused.value ? 'Davom ettirish' : 'Pauza'"
        >
          {{ teacherStore.isPaused.value ? "▶️" : "⏸" }}
        </button>
      </div>

      <!-- Home / Exit Button -->
      <button
        type="button"
        @click="$emit('goHome')"
        class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-slate-300 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
        title="Darsni to'xtatish va menyuga qaytish"
      >
        🏠
      </button>
    </div>

    <!-- 1. STANDARD GAME ARENA -->
    <div v-if="teacherStore.currentMode.value === 'standard' && currentStudent" class="space-y-4">
      <!-- High-Readability Hero Student Card with Swipe Gesture -->
      <div
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
        class="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center transition-all duration-300 touch-pan-y cursor-grab active:cursor-grabbing"
        :class="feedbackClass"
      >
        <!-- Background Ambient Glow -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/15 blur-3xl rounded-full pointer-events-none"></div>

        <!-- Floating Pop-up Score Animation -->
        <div
          v-if="floatingText"
          class="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-float-up text-2xl font-black"
          :class="floatingColor"
        >
          {{ floatingText }}
        </div>

        <!-- Student Counter / Index Badge -->
        <div class="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
          <span class="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-blue-300">
            O'quvchi #{{ (teacherStore.curIdx.value % teacherStore.standardStudents.value.length) + 1 }} / {{ teacherStore.standardStudents.value.length }}
          </span>
          <span class="flex items-center gap-1 text-slate-300">
            <span>Urinish:</span> <b class="text-white text-sm tabular-nums">{{ currentStudent.sess || 0 }} ta</b>
          </span>
        </div>

        <!-- Student Big Name with Smooth Transition -->
        <Transition name="slide-name" mode="out-in">
          <div :key="currentStudent.name" class="py-2">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm line-clamp-2">
              {{ currentStudent.name }}
            </h2>

            <!-- Book & Topic Pill -->
            <div class="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 px-4 py-1.5 text-xs font-extrabold text-cyan-300 shadow-sm">
              <span>📖</span>
              <span>
                {{ currentStudent.book || teacherStore.globalBook.value || "Umumiy dars" }}
                <span v-if="currentStudent.topic || teacherStore.globalTopic.value" class="text-white font-bold ml-1">
                  ({{ currentStudent.topic || teacherStore.globalTopic.value }})
                </span>
              </span>
            </div>
          </div>
        </Transition>

        <!-- Current Session Mini Stats -->
        <div class="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
          <div class="rounded-2xl bg-black/40 p-2.5">
            <span class="block text-[10px] uppercase font-bold text-slate-400">To'g'ri</span>
            <span class="text-base font-black text-emerald-400 tabular-nums">{{ currentStudent.correct || 0 }}</span>
          </div>
          <div class="rounded-2xl bg-black/40 p-2.5">
            <span class="block text-[10px] uppercase font-bold text-slate-400">Jami</span>
            <span class="text-base font-black text-white tabular-nums">{{ currentStudent.total || 0 }}</span>
          </div>
          <div class="rounded-2xl bg-black/40 p-2.5">
            <span class="block text-[10px] uppercase font-bold text-slate-400">Foiz</span>
            <span class="text-base font-black text-amber-400 tabular-nums">
              {{ teacherStore.calcPercent(currentStudent) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Mobile-First Ergonomic Bottom Action Pad (Thumb-Zone) -->
      <div class="space-y-3 pt-1">
        <!-- Bonus Action (Wide Top) -->
        <button
          type="button"
          @click="handleAnswer('bonus')"
          class="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-500/25 py-4 text-amber-300 shadow-lg shadow-amber-500/20 hover:border-amber-300 active:scale-95 transition-all select-none"
        >
          <span class="text-2xl">🌟</span>
          <span class="text-sm font-black uppercase tracking-wider">Bonus Ball (+1 va +5%)</span>
        </button>

        <!-- Main Answer Pads: Large, Tactile, High-Contrast -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Correct Button (Green Glow) -->
          <button
            type="button"
            @click="handleAnswer(true)"
            class="flex flex-col items-center justify-center rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/30 to-emerald-950/60 py-7 shadow-xl shadow-emerald-950/60 active:scale-95 hover:border-emerald-400 hover:from-emerald-500/40 transition-all select-none"
          >
            <span class="text-5xl sm:text-6xl drop-shadow-md">✅</span>
            <span class="mt-2 text-xs font-black uppercase tracking-wider text-emerald-300">To'g'ri (+1)</span>
          </button>

          <!-- False Button (Red Glow) -->
          <button
            type="button"
            @click="handleAnswer(false)"
            class="flex flex-col items-center justify-center rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-500/30 to-red-950/60 py-7 shadow-xl shadow-red-950/60 active:scale-95 hover:border-red-400 hover:from-red-500/40 transition-all select-none"
          >
            <span class="text-5xl sm:text-6xl drop-shadow-md">❌</span>
            <span class="mt-2 text-xs font-black uppercase tracking-wider text-red-300">Noto'g'ri (0)</span>
          </button>
        </div>

        <!-- Mobile Swipe Gesture Hint (Visible only on mobile) -->
        <div class="flex md:hidden items-center justify-center gap-1.5 py-1 text-[11px] font-bold text-slate-400 select-none">
          <span>👈</span> <span>Barmoq bilan chapga / o'ngga suring</span> <span>👉</span>
        </div>

        <!-- Navigation Row: Visible ONLY on Desktop/Tablet (hidden md:grid) -->
        <div class="hidden md:grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="navigateStudent(-1)"
            class="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 text-xs font-extrabold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          >
            <span>←</span> <span>Oldingi</span>
          </button>
          <button
            type="button"
            @click="navigateStudent(1)"
            class="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 py-3.5 text-xs font-extrabold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          >
            <span>Keyingi</span> <span>→</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. VERSUS (VS) SPLIT-SCREEN ARENA (DUEL & JAMOLAR) -->
    <div v-else class="space-y-4">
      <!-- Tug-of-War Dynamic Ratio Indicator Bar -->
      <div class="rounded-2xl border border-white/10 bg-black/50 p-2 shadow-inner space-y-1.5">
        <div class="flex justify-between px-2 text-[11px] font-black uppercase tracking-wider">
          <span class="text-red-400">{{ splitName1 }}: {{ splitScore1 }}</span>
          <span class="text-slate-400">VS</span>
          <span class="text-blue-400">{{ splitName2 }}: {{ splitScore2 }}</span>
        </div>
        <!-- Progress Tug Bar -->
        <div class="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
          <div
            class="bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
            :style="{ width: `${tugRatio.teamA}%` }"
          ></div>
          <div
            class="bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            :style="{ width: `${tugRatio.teamB}%` }"
          ></div>
        </div>
      </div>

      <!-- Large Split Touch Action Pads -->
      <div class="grid grid-cols-2 gap-3 h-80">
        <!-- Team A / Player 1 Touch Arena -->
        <button
          type="button"
          @click="handleSplitAnswer(0)"
          class="relative flex flex-col items-center justify-center rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-600/30 via-red-950/60 to-slate-950 p-4 text-center shadow-2xl shadow-red-950/60 active:scale-95 hover:border-red-400 transition-all cursor-pointer select-none overflow-hidden"
        >
          <!-- Floating Score for Team A -->
          <div v-if="floatingSide === 0" class="absolute top-6 animate-float-up text-3xl font-black text-red-300 pointer-events-none">
            +1 🎯
          </div>

          <span class="rounded-full bg-red-500/20 border border-red-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-300">
            {{ teacherStore.currentMode.value === 'Duel' ? '1-O\'quvchi' : 'Qizillar' }}
          </span>
          <span class="my-3 text-lg sm:text-xl font-black text-white line-clamp-2 px-1">
            {{ splitName1 }}
          </span>
          <span class="text-6xl sm:text-7xl font-black text-red-300 drop-shadow-lg tabular-nums">
            {{ splitScore1 }}
          </span>
          <span class="mt-3 text-[11px] font-bold text-red-400/90 bg-red-500/10 rounded-full px-3 py-1">
            Bosish = +1 Ball
          </span>
        </button>

        <!-- Team B / Player 2 Touch Arena -->
        <button
          type="button"
          @click="handleSplitAnswer(1)"
          class="relative flex flex-col items-center justify-center rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-600/30 via-blue-950/60 to-slate-950 p-4 text-center shadow-2xl shadow-blue-950/60 active:scale-95 hover:border-blue-400 transition-all cursor-pointer select-none overflow-hidden"
        >
          <!-- Floating Score for Team B -->
          <div v-if="floatingSide === 1" class="absolute top-6 animate-float-up text-3xl font-black text-blue-300 pointer-events-none">
            +1 🎯
          </div>

          <span class="rounded-full bg-blue-500/20 border border-blue-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300">
            {{ teacherStore.currentMode.value === 'Duel' ? '2-O\'quvchi' : 'Ko\'klar' }}
          </span>
          <span class="my-3 text-lg sm:text-xl font-black text-white line-clamp-2 px-1">
            {{ splitName2 }}
          </span>
          <span class="text-6xl sm:text-7xl font-black text-blue-300 drop-shadow-lg tabular-nums">
            {{ splitScore2 }}
          </span>
          <span class="mt-3 text-[11px] font-bold text-blue-400/90 bg-blue-500/10 rounded-full px-3 py-1">
            Bosish = +1 Ball
          </span>
        </button>
      </div>

      <!-- Skip Button -->
      <div class="text-center pt-1">
        <button
          type="button"
          @click="handleSplitSkip"
          class="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-xs font-black text-amber-300 hover:bg-amber-500/20 active:scale-95 transition"
        >
          Hech kim topolmadi (Skip) ⏱️
        </button>
      </div>
    </div>

    <!-- Prominent Finish & Attendance Button -->
    <div class="pt-2">
      <button
        type="button"
        @click="handleFinish"
        class="w-full rounded-3xl border border-rose-500/40 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all"
      >
        Yakunlash va Davomat 🏁
      </button>
    </div>

    <!-- Attendance Modal -->
    <AttendanceModal
      v-model="showAttModal"
      :zero-scorers="zeroScorersList"
      @confirmed="onAttendanceConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTeacherStore, Student } from "../../composables/useTeacherStore";
import AttendanceModal from "./AttendanceModal.vue";

const emit = defineEmits<{
  (e: "goHome"): void;
  (e: "gameFinished"): void;
}>();

const teacherStore = useTeacherStore();
const currentStudent = teacherStore.currentStandardStudent;

onMounted(() => {
  // Start or resume timer when arena opens
  teacherStore.startTimer(true);
});

const showAttModal = ref(false);
const zeroScorersList = ref<Student[]>([]);

// Visual feedback states
const feedbackClass = ref("");
const floatingText = ref("");
const floatingColor = ref("");
const floatingSide = ref<number | null>(null);

const splitName1 = computed(() => {
  if (teacherStore.currentMode.value === "Duel") {
    return teacherStore.duelStudents.value[0]?.name || "1-O'quvchi";
  }
  return teacherStore.team1Name.value || "Qizillar";
});

const splitName2 = computed(() => {
  if (teacherStore.currentMode.value === "Duel") {
    return teacherStore.duelStudents.value[1]?.name || "2-O'quvchi";
  }
  return teacherStore.team2Name.value || "Ko'klar";
});

const splitScore1 = computed(() => {
  if (teacherStore.currentMode.value === "Duel") {
    return teacherStore.duelStudents.value[0]?.correct || 0;
  }
  return teacherStore.teamAScore.value;
});

const splitScore2 = computed(() => {
  if (teacherStore.currentMode.value === "Duel") {
    return teacherStore.duelStudents.value[1]?.correct || 0;
  }
  return teacherStore.teamBScore.value;
});

const tugRatio = computed(() => {
  const s1 = splitScore1.value;
  const s2 = splitScore2.value;
  const total = s1 + s2;
  if (total === 0) return { teamA: 50, teamB: 50 };
  const a = Math.round((s1 / total) * 100);
  return { teamA: a, teamB: 100 - a };
});

function handleAnswer(type: true | false | "bonus") {
  if (type === "bonus") {
    triggerFeedback("ring-4 ring-amber-400/60 bg-amber-500/10", "+5% 🌟", "text-amber-300");
  } else if (type === true) {
    triggerFeedback("ring-4 ring-emerald-400/60 bg-emerald-500/10", "+1 🎯", "text-emerald-300");
  } else {
    triggerFeedback("ring-4 ring-red-400/60 bg-red-500/10", "Xato ❌", "text-red-400");
  }
  teacherStore.ansStandard(type);
}

function handleSplitAnswer(side: 0 | 1) {
  floatingSide.value = side;
  setTimeout(() => {
    floatingSide.value = null;
  }, 700);
  teacherStore.ansSplit(side);
}

function handleSplitSkip() {
  teacherStore.skipSplit();
}

function triggerFeedback(borderCls: string, text: string, colorCls: string) {
  feedbackClass.value = borderCls;
  floatingText.value = text;
  floatingColor.value = colorCls;
  setTimeout(() => {
    feedbackClass.value = "";
    floatingText.value = "";
  }, 700);
}

function triggerUndo() {
  teacherStore.undo();
}

// Touch Swipe Detection Logic for Mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}

function handleTouchMove(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Horizontal swipe must be significantly larger than vertical movement
  if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
    if (diffX < 0) {
      // Swiped Left -> Go Next Student
      navigateStudent(1);
    } else {
      // Swiped Right -> Go Previous Student
      navigateStudent(-1);
    }
  }
}

function navigateStudent(dir: 1 | -1) {
  teacherStore.navStandard(dir);
}

function handleFinish() {
  teacherStore.stopTimer();
  const zeros = teacherStore.checkZeroScorers();
  if (zeros.length > 0) {
    zeroScorersList.value = zeros;
    showAttModal.value = true;
  } else {
    teacherStore.finalizeResults();
    emit("gameFinished");
  }
}

function onAttendanceConfirmed(statuses: Record<string, string>) {
  teacherStore.students.value.forEach((s) => {
    if (statuses[s.name]) {
      s.attStatus = statuses[s.name];
    }
  });
  teacherStore.finalizeResults();
  emit("gameFinished");
}
</script>

<style scoped>
.slide-name-enter-active,
.slide-name-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-name-enter-from {
  opacity: 0;
  transform: translateX(15px);
}

.slide-name-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
