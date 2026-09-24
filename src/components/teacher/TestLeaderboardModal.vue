<template>
  <Transition name="fade">
    <div
      v-if="modelValue && test"
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-hidden animate-fade"
      @click.self="close"
    >
      <!-- Specular Ambient Background Glow -->
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-56 bg-gradient-to-b from-amber-500/25 via-indigo-600/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

      <!-- Main Modal Card -->
      <div
        class="w-full max-w-3xl apple-glass-card rounded-[2.5rem] p-5 sm:p-7 border border-white/20 bg-[#0e1629]/95 text-white shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden"
      >
        <!-- Modal Header: Icon, Test Title & Close -->
        <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-4 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-400 text-2xl shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-black text-white truncate">
                  {{ test.title }}
                </h3>
                <span class="rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 text-[10px] font-black uppercase">
                  Reyting
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5 truncate">
                Ushbu test bo'yicha barcha o'quvchilar reytingi va javoblar tahlili
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="close"
            class="h-9 w-9 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <!-- Quick Summary Stats Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 shrink-0">
          <div class="liquid-glass-inset rounded-2xl p-2.5 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Topshirganlar</div>
            <div class="text-base font-black text-white mt-0.5">{{ testResults.length }} ta</div>
          </div>
          <div class="liquid-glass-inset rounded-2xl p-2.5 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">O'rtacha Ball</div>
            <div class="text-base font-black text-cyan-300 mt-0.5">{{ averageScore }}%</div>
          </div>
          <div class="liquid-glass-inset rounded-2xl p-2.5 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">O'tish Ko'rsatkichi</div>
            <div class="text-base font-black text-emerald-400 mt-0.5">{{ passRate }}%</div>
          </div>
          <div class="liquid-glass-inset rounded-2xl p-2.5 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Eng Yuqori Ball</div>
            <div class="text-base font-black text-amber-400 mt-0.5">{{ highestScore }}</div>
          </div>
        </div>

        <!-- Leaderboard Scrollable Table -->
        <div class="flex-1 overflow-y-auto pr-1.5 space-y-2.5 custom-scrollbar">
          <div v-if="testResults.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-white/10 space-y-2 bg-black/20">
            <div class="text-4xl">⏳</div>
            <div class="text-sm font-bold text-slate-400">Hozircha natijalar mavjud emas</div>
            <p class="text-xs text-slate-500">O'quvchilar ushbu testni topshirgach, ularning reytingi bu yerda shakllanadi.</p>
          </div>

          <div
            v-for="(res, idx) in sortedResults"
            :key="res.id"
            class="rounded-2xl p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="getRankCardClass(idx)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <!-- Rank Medal / Number Badge -->
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-md"
                :class="getRankBadgeClass(idx)"
              >
                {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}` }}
              </div>

              <div class="space-y-0.5 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-sm font-black text-white truncate">
                    {{ res.studentName }}
                  </h4>
                  <span
                    class="rounded-md px-1.5 py-0.2 text-[9.5px] font-black uppercase border"
                    :class="
                      res.disqualified
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : res.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    "
                  >
                    {{ res.disqualified ? '🚫 Diskvalifikatsiya' : res.passed ? '✓ O\'tdi' : '✖ Yiqildi' }}
                  </span>
                </div>

                <div class="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <span>Ball: <b class="text-indigo-300">{{ res.score }} / {{ res.totalPoints }}</b> ({{ res.percentage }}%)</span>
                  <span>•</span>
                  <span>⏱️ {{ formatDuration(res.durationSeconds) }}</span>
                  <span>•</span>
                  <span>📅 {{ formatDate(res.completedAt) }}</span>
                </div>

                <div v-if="res.violations && res.violations.length > 0" class="text-[10px] font-bold text-rose-400">
                  ⚠️ {{ res.violations.length }} ta qoidabuzarlik
                </div>
              </div>
            </div>

            <!-- Inspect Details Button -->
            <div class="flex items-center justify-end shrink-0">
              <button
                type="button"
                @click="openDetail(res)"
                class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>🔍</span>
                <span>Javoblar Tahlili</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Jami topshirishlar: <b>{{ testResults.length }}</b></span>
          <button
            type="button"
            @click="close"
            class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>

      <!-- Child Result Detail Modal -->
      <ExamResultDetailModal
        v-model="showDetailModal"
        :result="selectedResultForDetail"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TestExam, ExamResult } from "../../types/test";
import { useTestsStore } from "../../composables/useTestsStore";
import ExamResultDetailModal from "../common/ExamResultDetailModal.vue";

const props = defineProps<{
  modelValue: boolean;
  test: TestExam | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const testsStore = useTestsStore();
const showDetailModal = ref(false);
const selectedResultForDetail = ref<ExamResult | null>(null);

const testResults = computed<ExamResult[]>(() => {
  if (!props.test) return [];
  return testsStore.getTestResults(props.test.id);
});

// Rank sorted by score (descending), then duration (ascending)
const sortedResults = computed<ExamResult[]>(() => {
  return [...testResults.value].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.durationSeconds || 0) - (b.durationSeconds || 0);
  });
});

const averageScore = computed(() => {
  if (testResults.value.length === 0) return 0;
  const sum = testResults.value.reduce((acc, r) => acc + (r.percentage || 0), 0);
  return Math.round(sum / testResults.value.length);
});

const passRate = computed(() => {
  if (testResults.value.length === 0) return 0;
  const passed = testResults.value.filter((r) => r.passed).length;
  return Math.round((passed / testResults.value.length) * 100);
});

const highestScore = computed(() => {
  if (testResults.value.length === 0) return "0";
  const max = Math.max(...testResults.value.map((r) => r.score));
  const total = testResults.value[0]?.totalPoints || 0;
  return `${max} / ${total}`;
});

function getRankCardClass(idx: number): string {
  if (idx === 0) return "border-amber-500/40 bg-amber-500/10 hover:border-amber-400";
  if (idx === 1) return "border-slate-300/40 bg-slate-300/10 hover:border-slate-300";
  if (idx === 2) return "border-amber-700/40 bg-amber-800/10 hover:border-amber-600";
  return "border-white/10 bg-white/5 hover:border-white/20";
}

function getRankBadgeClass(idx: number): string {
  if (idx === 0) return "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black";
  if (idx === 1) return "bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black";
  if (idx === 2) return "bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black";
  return "bg-black/40 text-slate-400 border border-white/10";
}

function openDetail(res: ExamResult) {
  selectedResultForDetail.value = res;
  showDetailModal.value = true;
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
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
</script>
