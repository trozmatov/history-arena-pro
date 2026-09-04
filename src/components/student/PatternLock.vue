<template>
  <div class="relative flex flex-col items-center select-none touch-none py-2">
    <!-- SVG Canvas for Smooth 3x3 Pattern -->
    <div
      ref="containerRef"
      class="relative cursor-pointer transition-transform duration-200"
      :class="{ 'animate-shake': isError }"
      :style="{ width: `${width}px`, height: `${height}px` }"
      @mousedown="handleStart"
      @mousemove="handleMove"
      @mouseup="handleEnd"
      @mouseleave="handleEnd"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
    >
      <svg
        :width="width"
        :height="height"
        class="absolute inset-0 pointer-events-none overflow-visible"
      >
        <defs>
          <!-- Neon Line Glow Filter -->
          <filter id="pattern-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <!-- Gradient for line -->
          <linearGradient id="line-gradient-normal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
          <linearGradient id="line-gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#34d399" />
          </linearGradient>
          <linearGradient id="line-gradient-error" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#f43f5e" />
          </linearGradient>
        </defs>

        <!-- Connected Lines between Selected Dots -->
        <line
          v-for="(seg, idx) in lineSegments"
          :key="'seg-' + idx"
          :x1="seg.x1"
          :y1="seg.y1"
          :x2="seg.x2"
          :y2="seg.y2"
          :stroke="strokeColor"
          stroke-width="5"
          stroke-linecap="round"
          filter="url(#pattern-glow)"
          class="transition-colors duration-150"
        />

        <!-- Active Tracking Line from Last Dot to Pointer -->
        <line
          v-if="isDrawing && activePointer && selectedDots.length > 0"
          :x1="lastDotCoord.x"
          :y1="lastDotCoord.y"
          :x2="activePointer.x"
          :y2="activePointer.y"
          :stroke="strokeColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="6,4"
          class="opacity-75"
        />

        <!-- 9 Dots (3x3 Grid) -->
        <g v-for="dot in dots" :key="'dot-' + dot.index">
          <!-- Outer Halo Ring for Selected Dots -->
          <circle
            :cx="dot.x"
            :cy="dot.y"
            :r="dotRadius * 2.2"
            :class="[
              isSelected(dot.index)
                ? isError
                  ? 'fill-red-500/20 stroke-red-500/50'
                  : isSuccess
                  ? 'fill-emerald-500/25 stroke-emerald-500/60'
                  : 'fill-indigo-500/25 stroke-indigo-500/60'
                : 'fill-transparent stroke-white/5 hover:stroke-white/20'
            ]"
            stroke-width="1.5"
            class="transition-all duration-200"
          />

          <!-- Middle Target Indicator -->
          <circle
            :cx="dot.x"
            :cy="dot.y"
            :r="isSelected(dot.index) ? dotRadius * 1.3 : dotRadius"
            :class="[
              isSelected(dot.index)
                ? isError
                  ? 'fill-red-500 shadow-lg shadow-red-500'
                  : isSuccess
                  ? 'fill-emerald-400 shadow-lg shadow-emerald-400'
                  : 'fill-indigo-400 shadow-lg shadow-indigo-400'
                : 'fill-slate-600/80'
            ]"
            class="transition-all duration-200"
          />

          <!-- Inner Center Core Pip -->
          <circle
            :cx="dot.x"
            :cy="dot.y"
            :r="isSelected(dot.index) ? 4 : 3"
            class="fill-white"
          />
        </g>
      </svg>
    </div>

    <!-- Status Text / Helper Prompt -->
    <div class="mt-3 text-center min-h-[22px]">
      <span
        v-if="statusMessage"
        class="text-xs font-bold transition-all"
        :class="statusColorClass"
      >
        {{ statusMessage }}
      </span>
      <span v-else class="text-xs text-slate-500">
        Nuqtalarni barmog'ingiz yoki kursor bilan birlashtiring
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { soundManager } from "../../composables/useAudio";

const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    disabled?: boolean;
    minDots?: number;
  }>(),
  {
    width: 290,
    height: 290,
    disabled: false,
    minDots: 4,
  }
);

const emit = defineEmits<{
  (e: "complete", pattern: string, indices: number[]): void;
  (e: "change", indices: number[]): void;
  (e: "error", message: string): void;
  (e: "reset"): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const isDrawing = ref(false);
const selectedDots = ref<number[]>([]);
const activePointer = ref<{ x: number; y: number } | null>(null);

const isError = ref(false);
const isSuccess = ref(false);
const statusMessage = ref("");
const statusType = ref<"normal" | "success" | "error">("normal");

const dotRadius = 9;
const hitRadius = 34; // Generous touch target for pleasant mobile experience

// 3x3 Grid generation
interface DotPos {
  index: number;
  x: number;
  y: number;
}

const dots = computed<DotPos[]>(() => {
  const list: DotPos[] = [];
  const paddingX = props.width * 0.18;
  const paddingY = props.height * 0.18;
  const stepX = (props.width - paddingX * 2) / 2;
  const stepY = (props.height - paddingY * 2) / 2;

  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      list.push({
        index: idx,
        x: paddingX + c * stepX,
        y: paddingY + r * stepY,
      });
      idx++;
    }
  }
  return list;
});

const isSelected = (idx: number) => selectedDots.value.includes(idx);

const lastDotCoord = computed(() => {
  if (selectedDots.value.length === 0) return { x: 0, y: 0 };
  const lastIdx = selectedDots.value[selectedDots.value.length - 1];
  const d = dots.value[lastIdx];
  return d ? { x: d.x, y: d.y } : { x: 0, y: 0 };
});

const lineSegments = computed(() => {
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < selectedDots.value.length - 1; i++) {
    const d1 = dots.value[selectedDots.value[i]];
    const d2 = dots.value[selectedDots.value[i + 1]];
    if (d1 && d2) {
      segs.push({ x1: d1.x, y1: d1.y, x2: d2.x, y2: d2.y });
    }
  }
  return segs;
});

const strokeColor = computed(() => {
  if (isError.value) return "url(#line-gradient-error)";
  if (isSuccess.value) return "url(#line-gradient-success)";
  return "url(#line-gradient-normal)";
});

const statusColorClass = computed(() => {
  if (statusType.value === "error") return "text-rose-400 font-bold";
  if (statusType.value === "success") return "text-emerald-400 font-bold";
  return "text-indigo-300 font-semibold";
});

function getRelativeCoords(e: MouseEvent | Touch): { x: number; y: number } | null {
  if (!containerRef.value) return null;
  const rect = containerRef.value.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function checkHit(coords: { x: number; y: number }) {
  for (const d of dots.value) {
    const dist = Math.hypot(d.x - coords.x, d.y - coords.y);
    if (dist <= hitRadius && !selectedDots.value.includes(d.index)) {
      // Optional: if moving between non-adjacent dots like 0 and 2, auto-select intermediate 1 if appropriate
      addIntermediateDot(selectedDots.value[selectedDots.value.length - 1], d.index);

      selectedDots.value.push(d.index);
      soundManager.playClick();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch {}
      }
      emit("change", [...selectedDots.value]);
      break;
    }
  }
}

// Check if a line passes directly through an unvisited center dot
function addIntermediateDot(fromIdx: number | undefined, toIdx: number) {
  if (fromIdx === undefined) return;
  const intermediates: Record<string, number> = {
    "0-2": 1, "2-0": 1,
    "3-5": 4, "5-3": 4,
    "6-8": 7, "8-6": 7,
    "0-6": 3, "6-0": 3,
    "1-7": 4, "7-1": 4,
    "2-8": 5, "8-2": 5,
    "0-8": 4, "8-0": 4,
    "2-6": 4, "6-2": 4,
  };
  const key = `${fromIdx}-${toIdx}`;
  const mid = intermediates[key];
  if (mid !== undefined && !selectedDots.value.includes(mid)) {
    selectedDots.value.push(mid);
  }
}

function startAt(coords: { x: number; y: number }) {
  if (props.disabled || isError.value) return;
  isDrawing.value = true;
  isSuccess.value = false;
  isError.value = false;
  statusMessage.value = "";
  selectedDots.value = [];
  activePointer.value = coords;
  checkHit(coords);
}

function moveAt(coords: { x: number; y: number }) {
  if (!isDrawing.value || props.disabled) return;
  activePointer.value = coords;
  checkHit(coords);
}

function finishDrawing() {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  activePointer.value = null;

  if (selectedDots.value.length === 0) return;

  if (selectedDots.value.length < props.minDots) {
    showError(`Kamida ${props.minDots} ta nuqtani birlashtiring!`);
    return;
  }

  const patternStr = selectedDots.value.join("-");
  emit("complete", patternStr, [...selectedDots.value]);
}

// Mouse Handlers
function handleStart(e: MouseEvent) {
  const coords = getRelativeCoords(e);
  if (coords) startAt(coords);
}

function handleMove(e: MouseEvent) {
  const coords = getRelativeCoords(e);
  if (coords) moveAt(coords);
}

function handleEnd() {
  finishDrawing();
}

// Touch Handlers
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    const coords = getRelativeCoords(e.touches[0]);
    if (coords) startAt(coords);
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    const coords = getRelativeCoords(e.touches[0]);
    if (coords) moveAt(coords);
  }
}

function handleTouchEnd() {
  finishDrawing();
}

// Public API for parent components
function showError(msg?: string) {
  isError.value = true;
  isSuccess.value = false;
  statusType.value = "error";
  statusMessage.value = msg || "Grafik kalit noto'g'ri!";
  soundManager.playError();
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([40, 60, 40]);
    } catch {}
  }

  setTimeout(() => {
    reset();
  }, 1000);
}

function showSuccess(msg?: string) {
  isSuccess.value = true;
  isError.value = false;
  statusType.value = "success";
  statusMessage.value = msg || "Grafik kalit qabul qilindi! ✓";
  soundManager.playSuccess();
}

function setMessage(msg: string, type: "normal" | "success" | "error" = "normal") {
  statusMessage.value = msg;
  statusType.value = type;
}

function reset() {
  isDrawing.value = false;
  selectedDots.value = [];
  activePointer.value = null;
  isError.value = false;
  isSuccess.value = false;
  statusMessage.value = "";
  emit("reset");
}

defineExpose({
  reset,
  showError,
  showSuccess,
  setMessage,
  selectedDots,
});
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
