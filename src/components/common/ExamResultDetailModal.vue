<template>
  <Transition name="fade">
    <div
      v-if="modelValue && result"
      class="fixed inset-0 z-[110] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-hidden animate-fade"
      @click.self="close"
    >
      <!-- Specular Ambient Background Glow -->
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-56 bg-gradient-to-b from-indigo-600/25 via-blue-500/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

      <!-- Main Modal Card -->
      <div
        class="w-full max-w-2xl apple-glass-card rounded-[2.5rem] p-5 sm:p-7 border border-white/20 bg-[#0e1629]/95 text-white shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden"
      >
        <!-- Modal Top Header: Title, Student, Overall Score & Close -->
        <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-4 shrink-0">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                📝 Natija Tahlili
              </span>
              <span
                class="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border"
                :class="
                  result.disqualified
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : result.passed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                "
              >
                {{ result.disqualified ? '🚫 Diskvalifikatsiya' : result.passed ? '✓ Muvaffaqiyatli' : '✖ Yiqildi' }}
              </span>
            </div>

            <h3 class="text-base sm:text-lg font-black text-white truncate">
              {{ result.testTitle }}
            </h3>

            <div class="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <span class="font-bold text-slate-300">👤 {{ result.studentName }}</span>
              <span>•</span>
              <span>📅 {{ formatDate(result.completedAt) }}</span>
              <span>•</span>
              <span>⏱️ {{ formatDuration(result.durationSeconds) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Score Pill -->
            <div class="text-right px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10">
              <div class="text-[10px] text-slate-400 font-bold uppercase">To'plangan Ball</div>
              <div class="text-base sm:text-lg font-black" :class="result.passed ? 'text-emerald-400' : 'text-amber-400'">
                {{ result.score }} <span class="text-xs text-slate-400 font-normal">/ {{ result.totalPoints }}</span>
                <span class="text-xs font-bold ml-1">({{ result.percentage }}%)</span>
              </div>
            </div>

            <button
              type="button"
              @click="close"
              class="h-9 w-9 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Filter Tabs: Barchasi, To'g'ri, Xato -->
        <div class="flex items-center justify-between gap-2 py-3 shrink-0">
          <div class="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
            <button
              type="button"
              @click="filterType = 'all'"
              class="px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
              :class="filterType === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              Hammasi ({{ reviewItems.length }})
            </button>
            <button
              type="button"
              @click="filterType = 'correct'"
              class="px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
              :class="filterType === 'correct' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              ✅ To'g'ri ({{ correctCount }})
            </button>
            <button
              type="button"
              @click="filterType = 'wrong'"
              class="px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
              :class="filterType === 'wrong' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              ❌ Xato ({{ wrongCount }})
            </button>
          </div>

          <div v-if="result.violations && result.violations.length > 0" class="text-[11px] font-bold text-rose-400 flex items-center gap-1">
            <span>🛡️</span>
            <span>{{ result.violations.length }} ta qoidabuzarlik</span>
          </div>
        </div>

        <!-- Questions & Answers Scrollable List -->
        <div class="flex-1 overflow-y-auto pr-1.5 space-y-4 custom-scrollbar">
          <div v-if="filteredReviewItems.length === 0" class="py-12 text-center text-xs text-slate-400">
            Tanlangan filtr bo'yicha savollar topilmadi
          </div>

          <div
            v-for="(item, idx) in filteredReviewItems"
            :key="item.questionId || idx"
            class="rounded-3xl border p-4 sm:p-5 space-y-3 transition-all"
            :class="
              item.isCorrect
                ? 'border-emerald-500/30 bg-emerald-950/15'
                : 'border-rose-500/30 bg-rose-950/15'
            "
          >
            <!-- Question Head: Number, Status badge & points -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black text-white shadow"
                  :class="item.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'"
                >
                  #{{ getOriginalQuestionIndex(item.questionId) + 1 }}
                </span>
                <span
                  class="text-xs font-black"
                  :class="item.isCorrect ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ item.isCorrect ? '✅ To\'g\'ri javob berilgan' : '❌ Noto\'g\'ri javob' }}
                </span>
              </div>

              <div class="text-xs font-bold" :class="item.isCorrect ? 'text-emerald-400' : 'text-slate-400'">
                +{{ item.earnedPoints }} / {{ item.points }} ball
              </div>
            </div>

            <!-- Question Image (if any) -->
            <div
              v-if="item.imageUrl"
              class="relative rounded-2xl overflow-hidden max-h-56 bg-black/40 border border-white/10"
            >
              <img
                :src="item.imageUrl"
                alt="Savol rasmi"
                class="w-full h-full object-contain max-h-56 cursor-zoom-in"
                @click="zoomImage(item.imageUrl)"
              />
            </div>

            <!-- Question Text -->
            <div class="text-sm font-extrabold text-white leading-relaxed">
              {{ item.questionText }}
            </div>

            <!-- Options Breakdown for MCQ / Checkbox -->
            <div v-if="item.type === 'mcq' || item.type === 'checkbox'" class="space-y-2 pt-1">
              <div
                v-for="(opt, oIdx) in (item.options || [])"
                :key="opt.id || oIdx"
                class="rounded-2xl p-3 border text-xs flex items-center justify-between gap-3 transition"
                :class="getOptionClass(item, opt)"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="h-6 w-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border"
                    :class="getOptionBadgeClass(item, opt)"
                  >
                    {{ ['A', 'B', 'C', 'D', 'E', 'F'][oIdx] || (oIdx + 1) }}
                  </span>
                  <span class="font-medium text-slate-100">
                    {{ opt.text }}
                  </span>
                </div>

                <div class="shrink-0 text-[11px] font-black">
                  <span v-if="isStudentSelected(item, opt.id) && opt.isCorrect" class="text-emerald-400 flex items-center gap-1">
                    <span>✅</span> <span>Sizning to'g'ri javobingiz</span>
                  </span>
                  <span v-else-if="isStudentSelected(item, opt.id) && !opt.isCorrect" class="text-rose-400 flex items-center gap-1">
                    <span>❌</span> <span>Sizning javobingiz</span>
                  </span>
                  <span v-else-if="!isStudentSelected(item, opt.id) && opt.isCorrect" class="text-emerald-400 flex items-center gap-1">
                    <span>🟢</span> <span>To'g'ri javob shu edi</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Short Answer Breakdown -->
            <div v-else-if="item.type === 'short_answer'" class="space-y-2 pt-1 text-xs">
              <div class="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <div class="text-[10px] text-slate-400 uppercase font-bold">O'quvchi kiritgan yozma javob:</div>
                <div
                  class="font-black text-sm"
                  :class="item.isCorrect ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ item.studentAnswer ? String(item.studentAnswer) : "(Javob kiritilmagan)" }}
                </div>
              </div>

              <div v-if="!item.isCorrect && item.correctAnswerText" class="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <div class="text-[10px] text-emerald-400 uppercase font-bold">Kutilgan to'g'ri javob:</div>
                <div class="font-black text-emerald-300 text-sm">
                  {{ item.correctAnswerText }}
                </div>
              </div>
            </div>

            <!-- Explanation (Izoh) if provided -->
            <div
              v-if="item.explanation"
              class="rounded-2xl p-3 bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-1"
            >
              <div class="font-black text-blue-400 flex items-center gap-1 text-[11px]">
                <span>💡</span> <span>Izoh / Tushuntirish:</span>
              </div>
              <p class="leading-relaxed text-slate-300">
                {{ item.explanation }}
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            @click="close"
            class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      <!-- Zoom Image Lightbox Overlay -->
      <div
        v-if="zoomedImageUrl"
        class="fixed inset-0 z-[120] bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
        @click="zoomedImageUrl = null"
      >
        <button
          type="button"
          @click.stop="zoomedImageUrl = null"
          class="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 text-white text-lg font-bold flex items-center justify-center hover:bg-white/20"
        >
          ✕
        </button>
        <img :src="zoomedImageUrl" alt="Kattalashtirilgan rasm" class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { ExamResult, QuestionReviewItem, QuestionOption } from "../../types/test";
import { useTestsStore } from "../../composables/useTestsStore";

const props = defineProps<{
  modelValue: boolean;
  result: ExamResult | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const testsStore = useTestsStore();
const filterType = ref<"all" | "correct" | "wrong">("all");
const zoomedImageUrl = ref<string | null>(null);

const reviewItems = computed<QuestionReviewItem[]>(() => {
  if (!props.result) return [];
  return testsStore.getOrBuildReview(props.result);
});

const correctCount = computed(() => reviewItems.value.filter((i) => i.isCorrect).length);
const wrongCount = computed(() => reviewItems.value.filter((i) => !i.isCorrect).length);

const filteredReviewItems = computed(() => {
  if (filterType.value === "correct") {
    return reviewItems.value.filter((i) => i.isCorrect);
  }
  if (filterType.value === "wrong") {
    return reviewItems.value.filter((i) => !i.isCorrect);
  }
  return reviewItems.value;
});

function getOriginalQuestionIndex(qId: string): number {
  const idx = reviewItems.value.findIndex((i) => i.questionId === qId);
  return idx >= 0 ? idx : 0;
}

function isStudentSelected(item: QuestionReviewItem, optionId: string): boolean {
  if (!item.studentAnswer) return false;
  if (Array.isArray(item.studentAnswer)) {
    return item.studentAnswer.includes(optionId);
  }
  return item.studentAnswer === optionId;
}

function getOptionClass(item: QuestionReviewItem, opt: QuestionOption): string {
  const selected = isStudentSelected(item, opt.id);
  const correct = !!opt.isCorrect;

  if (selected && correct) {
    return "border-emerald-500/60 bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/40";
  }
  if (selected && !correct) {
    return "border-rose-500/60 bg-rose-500/20 text-rose-200 ring-1 ring-rose-500/40";
  }
  if (!selected && correct) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  return "border-white/10 bg-black/20 text-slate-300";
}

function getOptionBadgeClass(item: QuestionReviewItem, opt: QuestionOption): string {
  const selected = isStudentSelected(item, opt.id);
  const correct = !!opt.isCorrect;

  if (selected && correct) {
    return "bg-emerald-600 text-white border-emerald-400";
  }
  if (selected && !correct) {
    return "bg-rose-600 text-white border-rose-400";
  }
  if (!selected && correct) {
    return "bg-emerald-950 border-emerald-500 text-emerald-400";
  }
  return "bg-black/30 border-white/20 text-slate-400";
}

function zoomImage(url?: string) {
  if (url) zoomedImageUrl.value = url;
}

function close() {
  emit("update:modelValue", false);
}

function formatDate(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.toLocaleDateString("uz-UZ")} ${d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDuration(sec?: number): string {
  if (!sec) return "0s";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} daq ${s}s` : `${s} soniya`;
}
</script>
