<template>
  <div class="mx-auto w-full max-w-md apple-glass-card rounded-[2.5rem] p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-300 shadow-2xl">
    <!-- Ambient Specular Glow Background -->
    <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-36 bg-gradient-to-b from-indigo-500/25 via-cyan-500/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

    <!-- 1. PATTERN LOGIN MODE (When student already has pattern on this device) -->
    <div v-if="loginMode === 'PATTERN_LOGIN'" class="space-y-4 relative z-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/25 border border-white/40 dark:border-white/20 text-3xl">
        🎨
      </div>

      <div>
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          Salom, {{ currentStudentDisplayName }}! 👋
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Shaxsiy kabinetga kirish uchun grafik kalitni chizing
        </p>
      </div>

      <!-- Android/iOS 3x3 Pattern Lock in Glass Inset -->
      <div class="flex justify-center p-2 rounded-3xl liquid-glass-inset">
        <PatternLock
          ref="patternLockRef"
          :width="280"
          :height="280"
          :disabled="isVerifying"
          @complete="handlePatternComplete"
        />
      </div>

      <div v-if="errorMsg" class="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 animate-shake">
        {{ errorMsg }}
      </div>

      <!-- Actions: Forgot Pattern & Switch Student -->
      <div class="pt-2 flex flex-col gap-2">
        <button
          type="button"
          @click="switchToRecovery"
          class="w-full rounded-2xl border border-indigo-500/30 bg-indigo-500/10 dark:bg-white/5 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 active:scale-95 transition shadow-sm backdrop-blur-xl"
        >
          <span>Patternni unutdingizmi?</span> <span class="font-extrabold ml-1">🔢 6 xonali PIN bilan tiklash</span>
        </button>

        <button
          type="button"
          @click="switchStudentAccount"
          class="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 transition font-medium"
        >
          Boshqa o'quvchi hisobi (Boshqa PIN)
        </button>
      </div>
    </div>

    <!-- 2. PIN INPUT MODE (First-time Login OR PIN Recovery) -->
    <div v-else-if="loginMode === 'PIN_LOGIN' || loginMode === 'PIN_RECOVERY'" class="space-y-4 relative z-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/25 border border-white/40 dark:border-white/20 text-3xl">
        {{ loginMode === 'PIN_RECOVERY' ? '🔒' : '🎓' }}
      </div>

      <div>
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ loginMode === 'PIN_RECOVERY' ? 'Patternni Tiklash' : "O'quvchi Portali" }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {{ loginMode === 'PIN_RECOVERY'
            ? 'Hisobingizni tasdiqlash uchun 6 xonali PIN kodni kiriting'
            : 'Ustozingiz bergan 6 xonali PIN kodni kiriting' }}
        </p>
      </div>

      <!-- Apple VisionOS 6-Dot Indicator -->
      <div
        class="flex items-center justify-center gap-3 py-3 transition-transform"
        :class="{ 'animate-shake': pinErrorShake }"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-4 w-4 rounded-full border-2 apple-pin-dot"
          :class="[
            enteredPin.length >= i
              ? isPinChecking
                ? 'bg-amber-400 border-amber-400 shadow-lg shadow-amber-400/50 scale-110'
                : pinErrorShake
                ? 'bg-rose-500 border-rose-500 shadow-lg shadow-rose-500/50'
                : 'bg-gradient-to-tr from-blue-500 to-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50 scale-110'
              : 'border-slate-300 dark:border-white/20 bg-slate-200/50 dark:bg-black/30'
          ]"
        ></div>
      </div>

      <div v-if="isPinChecking" class="text-xs font-bold text-amber-600 dark:text-amber-300 animate-pulse flex items-center justify-center gap-1.5 py-0.5">
        <span>Baza tekshirilmoqda...</span>
        <span>⏳</span>
      </div>

      <div v-if="errorMsg" class="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 animate-shake">
        {{ errorMsg }}
      </div>

      <!-- Apple Liquid Glass NumPad -->
      <div class="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-1">
        <button
          v-for="item in [
            { num: '1', letters: '' },
            { num: '2', letters: 'ABC' },
            { num: '3', letters: 'DEF' },
            { num: '4', letters: 'GHI' },
            { num: '5', letters: 'JKL' },
            { num: '6', letters: 'MNO' },
            { num: '7', letters: 'PQRS' },
            { num: '8', letters: 'TUV' },
            { num: '9', letters: 'WXYZ' },
          ]"
          :key="item.num"
          type="button"
          :disabled="isPinChecking"
          @click="appendDigit(item.num)"
          class="h-14 apple-numpad-key flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          <span class="text-xl font-bold leading-tight text-slate-900 dark:text-white">{{ item.num }}</span>
          <span v-if="item.letters" class="text-[8px] font-semibold tracking-widest text-slate-400 dark:text-slate-400 -mt-0.5">{{ item.letters }}</span>
        </button>

        <!-- Clear -->
        <button
          type="button"
          :disabled="isPinChecking || enteredPin.length === 0"
          @click="clearPin"
          class="h-14 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-90 transition flex items-center justify-center disabled:opacity-20 cursor-pointer"
        >
          Tozalash
        </button>

        <!-- Zero -->
        <button
          type="button"
          :disabled="isPinChecking"
          @click="appendDigit('0')"
          class="h-14 apple-numpad-key flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          <span class="text-xl font-bold leading-tight text-slate-900 dark:text-white">0</span>
        </button>

        <!-- Backspace -->
        <button
          type="button"
          :disabled="isPinChecking || enteredPin.length === 0"
          @click="deleteDigit"
          class="h-14 apple-numpad-key flex items-center justify-center text-lg font-bold text-slate-700 dark:text-slate-300 disabled:opacity-20 cursor-pointer"
          title="O'chirish"
        >
          ⌫
        </button>
      </div>

      <!-- Return back if was in recovery mode -->
      <div v-if="loginMode === 'PIN_RECOVERY'" class="pt-2">
        <button
          type="button"
          @click="cancelRecovery"
          class="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
        >
          ← Bekor qilish va orqaga qaytish
        </button>
      </div>
    </div>

    <!-- 3. PATTERN SETUP MODE (First-time or Resetting after PIN confirmation) -->
    <div v-else-if="loginMode === 'PATTERN_SETUP'" class="space-y-4 relative z-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/25 border border-white/40 dark:border-white/20 text-3xl">
        ✨
      </div>

      <div>
        <h2 class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          {{ setupStep === 1 ? "Grafik Kalit O'rnating" : "Shaklni Tasdiqlang" }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span v-if="setupStep === 1">
            <b class="text-indigo-600 dark:text-indigo-400">{{ setupTargetStudent?.name || 'O\'quvchi' }}</b>, keyingi safar tezkor kirish uchun 3x3 nuqtalardan shakl chizing (kamida 4 nuqta)
          </span>
          <span v-else class="text-emerald-600 dark:text-emerald-400 font-bold">
            Adashmaslik uchun o'sha shaklni yana bir bor qayta chizing
          </span>
        </p>
      </div>

      <!-- Pattern Lock in Setup Mode -->
      <div class="flex justify-center p-2 rounded-3xl liquid-glass-inset">
        <PatternLock
          ref="patternSetupRef"
          :width="280"
          :height="280"
          @complete="handleSetupPatternComplete"
        />
      </div>

      <div v-if="errorMsg" class="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 animate-shake">
        {{ errorMsg }}
      </div>

      <div class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-2 px-3">
        <span>Qadam {{ setupStep }} / 2</span>
        <button
          v-if="setupStep === 2"
          type="button"
          @click="restartSetup"
          class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
        >
          Boshidan chizish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStudentStore } from "../../composables/useStudentStore";
import { soundManager, fireConfetti } from "../../composables/useAudio";
import PatternLock from "./PatternLock.vue";

type LoginMode = "PATTERN_LOGIN" | "PIN_LOGIN" | "PIN_RECOVERY" | "PATTERN_SETUP";

const studentStore = useStudentStore();

const patternLockRef = ref<InstanceType<typeof PatternLock> | null>(null);
const patternSetupRef = ref<InstanceType<typeof PatternLock> | null>(null);

const loginMode = ref<LoginMode>("PIN_LOGIN");
const enteredPin = ref("");
const isPinChecking = ref(false);
const pinErrorShake = ref(false);
const errorMsg = ref("");
const isVerifying = ref(false);

// Pattern Setup State
const setupStep = ref<1 | 2>(1);
const setupFirstPattern = ref("");
const setupTargetStudent = ref<any>(null);

const currentStudentDisplayName = computed(() => {
  return studentStore.deviceStudent.value?.name || "O'quvchi";
});

onMounted(() => {
  window.addEventListener("keydown", handlePhysicalKeyboard);
  decideInitialMode();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handlePhysicalKeyboard);
});

function decideInitialMode() {
  const dev = studentStore.deviceStudent.value;
  if (dev && studentStore.isStudentFrozen(dev.name)) {
    errorMsg.value = "❄️ Hisobingiz vaqtincha muzlatilgan. Iltimos, o'qituvchingiz bilan bog'laning.";
    loginMode.value = "PIN_LOGIN";
    return;
  }
  // If we have a saved student on this device who already has a pattern set
  if (dev && dev.pattern && dev.pattern.trim()) {
    loginMode.value = "PATTERN_LOGIN";
  } else {
    loginMode.value = "PIN_LOGIN";
  }
}

// Physical keyboard listener for NumPad
function handlePhysicalKeyboard(e: KeyboardEvent) {
  if (loginMode.value !== "PIN_LOGIN" && loginMode.value !== "PIN_RECOVERY") return;
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    appendDigit(e.key);
  } else if (e.key === "Backspace") {
    e.preventDefault();
    deleteDigit();
  } else if (e.key === "Escape") {
    clearPin();
  }
}

function appendDigit(d: string) {
  if (enteredPin.value.length >= 6 || isPinChecking.value) return;
  enteredPin.value += d;
  soundManager.playClick();
  errorMsg.value = "";

  if (enteredPin.value.length === 6) {
    verifyEnteredPin();
  }
}

function deleteDigit() {
  if (enteredPin.value.length === 0 || isPinChecking.value) return;
  enteredPin.value = enteredPin.value.slice(0, -1);
  soundManager.playClick();
  errorMsg.value = "";
}

function clearPin() {
  enteredPin.value = "";
  errorMsg.value = "";
}

// 1. PIN verification
async function verifyEnteredPin() {
  isPinChecking.value = true;
  errorMsg.value = "";

  try {
    const res = await studentStore.loginWithPin(enteredPin.value);

    if (res.success && res.student) {
      soundManager.playSuccess();

      // If user came to recover OR student doesn't have a pattern yet:
      if (loginMode.value === "PIN_RECOVERY" || res.needsPattern) {
        setupTargetStudent.value = res.student;
        setupStep.value = 1;
        setupFirstPattern.value = "";
        loginMode.value = "PATTERN_SETUP";
        enteredPin.value = "";
      } else {
        // Already has pattern on student record
        fireConfetti();
        // Handled: student logged in, App.vue will transition to StudentProfile
      }
    } else {
      triggerPinError(res.message || "Bunday 6 xonali PIN kodli o'quvchi topilmadi!");
    }
  } catch (e) {
    triggerPinError("Ulanishda xatolik yuz berdi.");
  } finally {
    isPinChecking.value = false;
  }
}

function triggerPinError(msg: string) {
  soundManager.playError();
  pinErrorShake.value = true;
  errorMsg.value = msg;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([60, 60, 60]);
    } catch {}
  }
  setTimeout(() => {
    pinErrorShake.value = false;
    enteredPin.value = "";
  }, 900);
}

// 2. Pattern Login Handler
async function handlePatternComplete(pattern: string) {
  isVerifying.value = true;
  errorMsg.value = "";

  try {
    const res = await studentStore.loginWithPattern(pattern);
    if (res.success) {
      patternLockRef.value?.showSuccess("Muvaffaqiyatli kirildi! ✓");
      fireConfetti();
      // App.vue will display StudentProfile
    } else {
      patternLockRef.value?.showError(res.message || "Grafik kalit noto'g'ri!");
      errorMsg.value = res.message || "Grafik kalit noto'g'ri!";
    }
  } catch (e) {
    patternLockRef.value?.showError("Xatolik yuz berdi!");
  } finally {
    isVerifying.value = false;
  }
}

// 3. Pattern Setup Handler (Step 1 & Step 2)
async function handleSetupPatternComplete(pattern: string) {
  errorMsg.value = "";

  if (setupStep.value === 1) {
    // Step 1: Save draft pattern
    setupFirstPattern.value = pattern;
    setupStep.value = 2;
    soundManager.playSuccess();
    patternSetupRef.value?.reset();
    patternSetupRef.value?.setMessage("Endi o'sha shaklni tasdiqlash uchun qayta chizing", "normal");
  } else {
    // Step 2: Confirmation
    if (pattern === setupFirstPattern.value) {
      patternSetupRef.value?.showSuccess("Ajoyib! Grafik kalit saqlandi 🎉");
      fireConfetti();

      // Save pattern in store
      studentStore.setStudentPattern(pattern, setupTargetStudent.value?.name);

      setTimeout(() => {
        // Ensure student session is active
        if (setupTargetStudent.value?.name) {
          studentStore.setStudent(setupTargetStudent.value.name);
          studentStore.fetchStudentHistory();
        }
      }, 500);
    } else {
      patternSetupRef.value?.showError("Shakllar mos kelmadi! Qaytadan chizing.");
      errorMsg.value = "Kiritilgan shakl birinchisi bilan bir xil bo'lmadi. Boshidan chizing.";
      setTimeout(() => {
        restartSetup();
      }, 1000);
    }
  }
}

function restartSetup() {
  setupStep.value = 1;
  setupFirstPattern.value = "";
  errorMsg.value = "";
  patternSetupRef.value?.reset();
}

function switchToRecovery() {
  enteredPin.value = "";
  errorMsg.value = "";
  loginMode.value = "PIN_RECOVERY";
}

function cancelRecovery() {
  enteredPin.value = "";
  errorMsg.value = "";
  decideInitialMode();
}

function switchStudentAccount() {
  studentStore.clearDeviceStudent();
  enteredPin.value = "";
  errorMsg.value = "";
  loginMode.value = "PIN_LOGIN";
}
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.animate-shake {
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
