<template>
  <div class="fixed inset-0 z-50 bg-[#070d18]/95 backdrop-blur-xl flex items-center justify-center p-3 select-none font-sans overflow-hidden animate-fade">
    <!-- Ambient Specular Glow Background -->
    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-indigo-600/30 via-cyan-500/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>

    <!-- 1. LOADING STATE -->
    <div
      v-if="isLoading"
      class="w-full max-w-sm apple-glass-card rounded-3xl p-6 text-center space-y-3 border border-white/20 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="text-3xl animate-spin">⏳</div>
      <div class="text-sm font-black text-white">Test yuklanmoqda...</div>
      <p class="text-xs text-slate-400">Imtihon ma'lumotlari tekshirilmoqda</p>
    </div>

    <!-- 2. NOT FOUND STATE -->
    <div
      v-else-if="!test"
      class="w-full max-w-sm apple-glass-card rounded-3xl p-6 text-center space-y-3 border border-white/20 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="text-3xl text-rose-400">❌</div>
      <div class="text-sm font-black text-white">Test Topilmadi</div>
      <p class="text-xs text-slate-400 leading-relaxed">
        Ushbu havola bo'yicha hech qanday test aniqlanmadi. Havola eskirgan yoki o'chirilgan bo'lishi mumkin.
      </p>
      <button
        type="button"
        @click="handleCancel"
        class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
      >
        Bosh Sahifaga O'tish
      </button>
    </div>

    <!-- 3. UNPUBLISHED (DRAFT) STATE -->
    <div
      v-else-if="!test.published"
      class="w-full max-w-sm apple-glass-card rounded-3xl p-6 text-center space-y-3 border border-amber-500/30 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="text-3xl text-amber-400">🔒</div>
      <div class="text-sm font-black text-white">Test Hozircha Yopiq</div>
      <p class="text-xs text-amber-200/80 leading-relaxed">
        "{{ test.title }}" testi hozirda qoralama holatida. Ustozingiz testni faollashtirishini kuting.
      </p>
      <button
        type="button"
        @click="handleCancel"
        class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
      >
        Bosh Sahifaga O'tish
      </button>
    </div>

    <!-- 4. ACTIVE TEST - ULTRA-COMPACT SINGLE-SCREEN MODAL -->
    <div
      v-else
      class="w-full max-w-sm apple-glass-card rounded-[2rem] p-4 sm:p-5 border border-white/20 bg-[#0e1629]/95 text-white shadow-2xl relative z-10 flex flex-col justify-between"
      style="max-height: calc(100vh - 24px);"
    >
      <!-- Compact Header: Icon + Title + Subject + Close -->
      <div class="space-y-1.5 border-b border-white/10 pb-2.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-base shadow-md">
              📝
            </span>
            <div class="min-w-0">
              <h2 class="text-sm sm:text-base font-black text-white truncate tracking-tight leading-tight">
                {{ test.title }}
              </h2>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span class="text-indigo-400 font-bold truncate">📁 {{ getFolderName(test.folderId) }}</span>
                <span>•</span>
                <span class="text-emerald-400 font-bold shrink-0">● Faol</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            @click="handleCancel"
            class="h-7 w-7 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-xs transition cursor-pointer shrink-0"
            title="Chiqish"
          >
            ✕
          </button>
        </div>

        <!-- Inline Specs Row (Single line, zero wasted height) -->
        <div class="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-300 bg-black/40 rounded-xl px-2.5 py-1 border border-white/5">
          <span>❓ {{ test.questions.length }} savol</span>
          <span class="text-slate-600">|</span>
          <span class="text-cyan-300">⏱️ {{ test.timeLimitMinutes > 0 ? `${test.timeLimitMinutes} daq` : "Cheklovsiz" }}</span>
          <span class="text-slate-600">|</span>
          <span class="text-emerald-400">🎯 {{ totalPoints }} ball</span>
          <span v-if="hasAntiCheatRules" class="text-rose-400 text-[10px]" title="Anti-Cheat nazorati faol">🛡️</span>
        </div>
      </div>

      <!-- Identity Context & PIN Prompt -->
      <div class="py-2 text-center space-y-1">
        <div v-if="isStudentLoggedIn && !switchingAccount" class="flex items-center justify-center gap-1.5 text-xs flex-wrap">
          <span class="text-slate-400">Hisob:</span>
          <span class="font-black text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-lg border border-blue-500/30 truncate max-w-[180px]">
            👤 {{ studentDisplayName }}
          </span>
          <button
            type="button"
            @click="switchingAccount = true"
            class="text-[10px] text-slate-400 hover:text-white underline cursor-pointer ml-1"
          >
            Almashtirish
          </button>
        </div>
        <div v-else class="text-xs text-slate-400">
          Imtihonni boshlash uchun <b class="text-white">6 xonali PIN-kodni</b> kiriting:
        </div>

        <!-- 6-Dot PIN Indicator -->
        <div
          class="flex items-center justify-center gap-2 py-1.5 transition-transform"
          :class="{ 'animate-shake': pinErrorShake }"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="h-3.5 w-3.5 rounded-full border transition-all duration-200"
            :class="[
              enteredPin.length >= i
                ? isPinChecking
                  ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-400/50 scale-110'
                  : pinErrorShake
                  ? 'bg-rose-500 border-rose-500 shadow-md shadow-rose-500/50'
                  : 'bg-gradient-to-tr from-blue-500 to-cyan-400 border-cyan-400 shadow-md shadow-cyan-400/50 scale-110'
                : 'border-white/20 bg-black/40'
            ]"
          ></div>
        </div>

        <!-- Error / Status text -->
        <div v-if="isPinChecking" class="text-[11px] font-bold text-amber-300 animate-pulse">
          Tekshirilmoqda... ⏳
        </div>
        <div v-else-if="errorMsg" class="text-[11px] font-bold text-rose-400 truncate animate-shake">
          {{ errorMsg }}
        </div>
      </div>

      <!-- Compact VisionOS Keypad (Fits 100% on all devices) -->
      <div class="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto w-full pt-1 pb-0.5">
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          type="button"
          @click="handleNumberClick(String(num))"
          :disabled="isPinChecking"
          class="h-10 sm:h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-black text-white border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-50 select-none flex items-center justify-center"
        >
          {{ num }}
        </button>
        <button
          type="button"
          @click="handleCancel"
          class="h-10 sm:h-11 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-[11px] font-bold text-slate-400 border border-white/5 transition cursor-pointer select-none flex items-center justify-center"
        >
          ✕ Chiqish
        </button>
        <button
          type="button"
          @click="handleNumberClick('0')"
          :disabled="isPinChecking"
          class="h-10 sm:h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-black text-white border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-50 select-none flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          @click="handleBackspace"
          :disabled="isPinChecking || enteredPin.length === 0"
          class="h-10 sm:h-11 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-sm font-bold text-slate-300 border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-40 select-none flex items-center justify-center"
        >
          ⌫
        </button>
      </div>

      <!-- Subtle Footer Brand -->
      <div class="text-center pt-1">
        <span class="text-[9.5px] text-slate-500 font-medium">History Arena Pro • Himoyalangan Imtihon</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { TestExam } from "../../types/test";
import { useTestsStore } from "../../composables/useTestsStore";
import { useStudentStore } from "../../composables/useStudentStore";
import { soundManager } from "../../composables/useAudio";

const props = defineProps<{
  testId: string;
}>();

const emit = defineEmits<{
  (e: "startExam", test: TestExam): void;
  (e: "cancel"): void;
}>();

const testsStore = useTestsStore();
const studentStore = useStudentStore();
const { folders } = testsStore;

const isLoading = ref(true);
const test = ref<TestExam | null>(null);

const enteredPin = ref("");
const isPinChecking = ref(false);
const pinErrorShake = ref(false);
const errorMsg = ref("");
const switchingAccount = ref(false);

const isStudentLoggedIn = computed(() => studentStore.isStudentLoggedIn.value);
const studentDisplayName = computed(() => {
  const name =
    studentStore.studentName?.value ||
    (typeof studentStore.studentName === "string" ? studentStore.studentName : "");
  return name || "O'quvchi";
});

const totalPoints = computed(() => {
  if (!test.value) return 0;
  return test.value.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

const hasAntiCheatRules = computed(() => {
  if (!test.value) return false;
  const ac = test.value.antiCheat;
  return !!(ac.zeroTolerance || ac.fullscreenRequired || ac.blockScreenshot);
});

function getFolderName(folderId?: string): string {
  const f = folders.value.find((item) => item.id === folderId);
  return f ? f.name : "Umumiy (Aralash)";
}

onMounted(async () => {
  isLoading.value = true;
  try {
    let t = testsStore.getTestById(props.testId);
    if (!t) {
      t = await testsStore.fetchTestById(props.testId);
    }
    test.value = t || null;
  } catch (e) {
    console.warn("ExamLinkLaunchpad load error:", e);
  } finally {
    isLoading.value = false;
  }
});

function handleNumberClick(digit: string) {
  if (isPinChecking.value) return;
  if (enteredPin.value.length < 6) {
    enteredPin.value += digit;
    soundManager.playClick();
    if (enteredPin.value.length === 6) {
      verifyAndStart();
    }
  }
}

function handleBackspace() {
  if (isPinChecking.value) return;
  if (enteredPin.value.length > 0) {
    enteredPin.value = enteredPin.value.slice(0, -1);
    errorMsg.value = "";
    soundManager.playClick();
  }
}

async function verifyAndStart() {
  if (enteredPin.value.length !== 6 || !test.value) return;

  isPinChecking.value = true;
  errorMsg.value = "";

  try {
    const res = await studentStore.loginWithPin(enteredPin.value);
    if (res.success && res.student) {
      soundManager.playSuccess();
      emit("startExam", test.value);
    } else {
      triggerError(res.message || "Noto'g'ri PIN kod! Qaytadan tekshiring.");
    }
  } catch (e: any) {
    triggerError(e?.message || "Tizimga kirishda xatolik yuz berdi.");
  } finally {
    isPinChecking.value = false;
  }
}

function triggerError(msg: string) {
  errorMsg.value = msg;
  pinErrorShake.value = true;
  soundManager.playError();
  setTimeout(() => {
    pinErrorShake.value = false;
    enteredPin.value = "";
  }, 900);
}

function handleCancel() {
  emit("cancel");
}
</script>
