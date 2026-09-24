<template>
  <div class="fixed inset-0 z-50 bg-[#070d18]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade font-sans">
    <!-- Ambient Specular Glow Background -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-56 bg-gradient-to-b from-indigo-600/30 via-cyan-500/20 to-transparent blur-3xl rounded-full pointer-events-none"></div>

    <!-- 1. LOADING STATE -->
    <div
      v-if="isLoading"
      class="w-full max-w-md apple-glass-card rounded-[2.5rem] p-8 text-center space-y-4 border border-white/20 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/20 border border-indigo-500/40 text-3xl animate-spin">
        ⏳
      </div>
      <div>
        <h3 class="text-lg font-black text-white">Test yuklanmoqda...</h3>
        <p class="text-xs text-slate-400 mt-1">Imtihon ma'lumotlari bulutdan olinmoqda</p>
      </div>
    </div>

    <!-- 2. NOT FOUND STATE -->
    <div
      v-else-if="!test"
      class="w-full max-w-md apple-glass-card rounded-[2.5rem] p-8 text-center space-y-5 border border-white/20 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 border border-rose-500/40 text-3xl text-rose-400">
        ❌
      </div>
      <div>
        <h3 class="text-lg font-black text-white">Test Topilmadi</h3>
        <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Ushbu havola bo'yicha hech qanday test aniqlanmadi. Havola eskirgan yoki o'chirilgan bo'lishi mumkin.
        </p>
      </div>
      <button
        type="button"
        @click="handleCancel"
        class="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
      >
        Bosh Sahifaga O'tish
      </button>
    </div>

    <!-- 3. UNPUBLISHED (DRAFT) STATE -->
    <div
      v-else-if="!test.published"
      class="w-full max-w-md apple-glass-card rounded-[2.5rem] p-8 text-center space-y-5 border border-amber-500/30 bg-[#0e1629]/90 shadow-2xl relative z-10"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 border border-amber-500/40 text-3xl text-amber-400">
        🔒
      </div>
      <div>
        <h3 class="text-lg font-black text-white">Test Hozircha Yopiq</h3>
        <p class="text-xs text-amber-300/80 mt-1.5 leading-relaxed">
          "{{ test.title }}" testi hozirda qoralama holatida yoki ustoz tomonidan yopilgan. Iltimos, ustozingiz testni faollashtirishini kuting.
        </p>
      </div>
      <button
        type="button"
        @click="handleCancel"
        class="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
      >
        Bosh Sahifaga O'tish
      </button>
    </div>

    <!-- 4. ACTIVE TEST - PIN VERIFICATION & LAUNCHPAD -->
    <div
      v-else
      class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border border-white/20 bg-[#0e1629]/95 text-white shadow-2xl relative z-10"
    >
      <!-- Top Test Info Banner -->
      <div class="text-center space-y-2">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white text-3xl shadow-xl shadow-indigo-500/30 border border-white/30">
          📝
        </div>
        <div class="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <span class="rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
            📁 {{ getFolderName(test.folderId) }}
          </span>
          <span class="rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
            ● Faol Imtihon
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
          {{ test.title }}
        </h2>
        <p v-if="test.description" class="text-xs text-slate-400 line-clamp-2 max-w-sm mx-auto">
          {{ test.description }}
        </p>
      </div>

      <!-- Test Quick Specs -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="liquid-glass-inset rounded-2xl p-2.5 border border-white/10">
          <div class="text-[10px] font-bold text-slate-400 uppercase">Savollar</div>
          <div class="text-sm font-black text-white mt-0.5">{{ test.questions.length }} ta</div>
        </div>
        <div class="liquid-glass-inset rounded-2xl p-2.5 border border-white/10">
          <div class="text-[10px] font-bold text-slate-400 uppercase">Vaqt</div>
          <div class="text-sm font-black text-cyan-300 mt-0.5">
            {{ test.timeLimitMinutes > 0 ? `${test.timeLimitMinutes} daqiqa` : "Cheklovsiz" }}
          </div>
        </div>
        <div class="liquid-glass-inset rounded-2xl p-2.5 border border-white/10">
          <div class="text-[10px] font-bold text-slate-400 uppercase">Jami Ball</div>
          <div class="text-sm font-black text-emerald-400 mt-0.5">{{ totalPoints }} ball</div>
        </div>
      </div>

      <!-- Anti-Cheat Badges Warning -->
      <div
        v-if="hasAntiCheatRules"
        class="rounded-2xl p-3 border border-rose-500/30 bg-rose-500/10 space-y-1.5 text-xs"
      >
        <div class="font-bold text-rose-300 flex items-center gap-1.5">
          <span>🛡️</span>
          <span>Anti-Cheat Nazorati O'rnatilgan:</span>
        </div>
        <div class="flex flex-wrap gap-1 text-[10px] font-bold text-rose-200">
          <span v-if="test.antiCheat.zeroTolerance" class="bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/40">
            🚫 Tab almashtirish taqiqlanadi
          </span>
          <span v-if="test.antiCheat.fullscreenRequired" class="bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/40">
            ⛶ To'liq ekran rejimi majburiy
          </span>
          <span v-if="test.antiCheat.blockScreenshot" class="bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/40">
            📸 Skrinshot taqiqlangan
          </span>
        </div>
      </div>

      <!-- PIN AUTHENTICATION SECTION -->
      <div class="space-y-4 border-t border-white/10 pt-4">
        <!-- Student Identity Context -->
        <div v-if="isStudentLoggedIn && !switchingAccount" class="text-center space-y-1">
          <p class="text-xs text-slate-400">
            Aniqlangan o'quvchi hisobi:
          </p>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-extrabold text-sm">
            <span>👤</span>
            <span>{{ studentDisplayName }}</span>
          </div>
          <p class="text-[11px] text-slate-400 pt-1">
            Testni boshlash uchun shaxsingizni tasdiqlang (6 xonali PIN kod):
          </p>
        </div>

        <div v-else class="text-center space-y-1">
          <h3 class="text-sm font-black text-white">
            Shaxsingizni Tasdiqlang
          </h3>
          <p class="text-xs text-slate-400">
            Testni boshlash uchun ustozingiz bergan 6 xonali PIN kodni kiriting
          </p>
        </div>

        <!-- 6-Dot Apple-Style PIN Indicator -->
        <div
          class="flex items-center justify-center gap-2.5 py-2 transition-transform"
          :class="{ 'animate-shake': pinErrorShake }"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="h-4 w-4 rounded-full border-2 transition-all duration-200"
            :class="[
              enteredPin.length >= i
                ? isPinChecking
                  ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/50 scale-110'
                  : pinErrorShake
                  ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/50'
                  : 'bg-gradient-to-tr from-blue-500 to-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50 scale-110'
                : 'border-white/20 bg-black/40'
            ]"
          ></div>
        </div>

        <!-- Verification status / error -->
        <div v-if="isPinChecking" class="text-xs font-bold text-amber-300 animate-pulse text-center">
          Shaxs tekshirilmoqda... ⏳
        </div>
        <div v-else-if="errorMsg" class="rounded-xl bg-rose-500/20 border border-rose-500/40 p-2 text-xs font-bold text-rose-300 text-center animate-shake">
          {{ errorMsg }}
        </div>

        <!-- Numeric Keypad (VisionOS style) -->
        <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            type="button"
            @click="handleNumberClick(String(num))"
            :disabled="isPinChecking"
            class="h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-lg font-black text-white border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ num }}
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 border border-white/5 transition cursor-pointer"
          >
            ✕ Chiqish
          </button>
          <button
            type="button"
            @click="handleNumberClick('0')"
            :disabled="isPinChecking"
            class="h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-lg font-black text-white border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            @click="handleBackspace"
            :disabled="isPinChecking || enteredPin.length === 0"
            class="h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-base font-bold text-slate-300 border border-white/10 transition shadow-sm cursor-pointer disabled:opacity-40"
          >
            ⌫
          </button>
        </div>

        <!-- Switch Account if logged in -->
        <div v-if="isStudentLoggedIn && !switchingAccount" class="text-center pt-2">
          <button
            type="button"
            @click="switchingAccount = true"
            class="text-[11px] text-slate-400 hover:text-white underline transition cursor-pointer"
          >
            Boshqa o'quvchi sifatida kirish (Boshqa PIN)
          </button>
        </div>
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
  return ac.zeroTolerance || ac.fullscreenRequired || ac.blockScreenshot;
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
      soundManager.playLevelUp();
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
