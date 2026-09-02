<template>
  <div class="space-y-4 max-w-xl mx-auto pb-6">
    <!-- Gamer Hero Card -->
    <div class="rounded-3xl border border-white/15 bg-gradient-to-b from-indigo-950/60 via-slate-900/80 to-slate-950 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-center space-y-4 relative overflow-hidden">
      <!-- Ambient Glow -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Avatar & Crown -->
      <div class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-purple-600/30 text-4xl">
        {{ studentStore.studentAvatar.value }}
        <span class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white ring-2 ring-slate-950 font-black">
          ✓
        </span>
      </div>

      <!-- Name & Current Level -->
      <div>
        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">{{ studentStore.studentName.value }}</h2>
        <div class="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 px-3.5 py-1 text-xs font-black text-indigo-300 mt-1.5 shadow-sm">
          <span>Daraja:</span> <span>{{ studentStore.studentLevel.value }}</span>
        </div>
      </div>

      <!-- Level Progression Bar -->
      <div class="rounded-2xl border border-white/10 bg-black/40 p-3 text-left space-y-1.5">
        <div class="flex justify-between text-[11px] font-extrabold text-slate-400">
          <span>Keyingi unvongacha:</span>
          <span class="text-indigo-300 font-bold">{{ levelProgress.nextLevel }}</span>
        </div>
        <div class="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden shadow-inner">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            :style="{ width: `${levelProgress.percent}%` }"
          ></div>
        </div>
      </div>

      <!-- Quick Duel Button -->
      <button
        type="button"
        @click="showDuelModal = true"
        class="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition"
      >
        <span class="text-base">⚔️</span> <span>Boshqa o'quvchini Duelga chorlash (+15 🪙)</span>
      </button>
    </div>

    <!-- Monthly Stats & Chart Section -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Month Buttons Selector -->
      <div class="flex items-center justify-between">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400">
          Oylik Natijalar
        </div>
        <div v-if="monthKeys.length > 0" class="flex gap-1.5 overflow-x-auto pb-1 max-w-[240px] custom-scrollbar">
          <button
            v-for="key in monthKeys"
            :key="key"
            type="button"
            @click="studentStore.activeMonthKey.value = key; drawChart();"
            class="rounded-xl px-3 py-1 text-[11px] font-bold whitespace-nowrap transition"
            :class="
              studentStore.activeMonthKey.value === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            "
          >
            {{ studentStore.groupedMonths.value[key]?.label }}
          </button>
        </div>
      </div>

      <!-- 4 High-Contrast Stat Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="glass-card rounded-2xl p-3.5 text-center">
          <div class="text-[10px] uppercase font-bold text-slate-400">Jami Testlar</div>
          <div class="text-2xl font-black text-white mt-1 tabular-nums">{{ monthData.tests }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3.5 text-center">
          <div class="text-[10px] uppercase font-bold text-slate-400">O'rtacha Baho</div>
          <div class="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{{ monthData.avgScore }}%</div>
        </div>
        <div class="glass-card rounded-2xl p-3.5 text-center">
          <div class="text-[10px] uppercase font-bold text-slate-400">Strikes</div>
          <div class="text-2xl font-black text-red-400 mt-1 tabular-nums">{{ monthData.strikes }} 🔥</div>
        </div>
        <div class="glass-card rounded-2xl p-3.5 text-center">
          <div class="text-[10px] uppercase font-bold text-slate-400">Tangalar</div>
          <div class="text-2xl font-black text-amber-400 mt-1 tabular-nums">{{ monthData.coins }} 🪙</div>
        </div>
      </div>

      <!-- Dynamic Line Chart -->
      <div class="relative h-56 w-full rounded-2xl border border-white/10 bg-black/40 p-3 overflow-hidden">
        <canvas ref="studentChartRef"></canvas>
      </div>
    </div>

    <!-- Badges Showcase -->
    <BadgesList />

    <!-- Leaderboard -->
    <StudentLeaderboard />

    <!-- Logout -->
    <button
      type="button"
      @click="studentStore.logoutStudent"
      class="w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-3.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition"
    >
      Kabinetdan chiqish 🚪
    </button>

    <!-- Duel Modal -->
    <StudentDuelModal v-model="showDuelModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { useStudentStore } from "../../composables/useStudentStore";
import BadgesList from "./BadgesList.vue";
import StudentLeaderboard from "./StudentLeaderboard.vue";
import StudentDuelModal from "./StudentDuelModal.vue";

Chart.register(...registerables);

const studentStore = useStudentStore();
const showDuelModal = ref(false);
const studentChartRef = ref<HTMLCanvasElement | null>(null);
let chartInst: Chart | null = null;

const monthKeys = computed(() => {
  return Object.keys(studentStore.groupedMonths.value);
});

const monthData = computed(() => studentStore.activeMonthData.value);

const levelProgress = computed(() => {
  const tests = studentStore.historyData.value.length;
  if (tests >= 30) {
    return { percent: 100, nextLevel: "Akademik 👑 (Maksimal)" };
  } else if (tests >= 15) {
    const p = Math.min(100, Math.round(((tests - 15) / 15) * 100));
    return { percent: p, nextLevel: "Akademik 👑" };
  } else if (tests >= 5) {
    const p = Math.min(100, Math.round(((tests - 5) / 10) * 100));
    return { percent: p, nextLevel: "Tarixchi 🏛️" };
  } else {
    const p = Math.min(100, Math.round((tests / 5) * 100));
    return { percent: p, nextLevel: "Izlanuvchi 🔍" };
  }
});

onMounted(async () => {
  await studentStore.fetchStudentHistory();
  await studentStore.fetchLeaderboard();
  await nextTick();
  drawChart();
});

function drawChart() {
  if (!studentChartRef.value) return;
  const items = monthData.value.items || [];

  const labels = items.map((i) => i.date);
  const dataPoints = items.map((i) => parseFloat(String(i.percent)) || 0);

  if (chartInst) {
    chartInst.destroy();
  }

  chartInst = new Chart(studentChartRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b82f6",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(255, 255, 255, 0.08)" },
          ticks: { color: "#94a3b8", stepSize: 25 },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.parsed.y}% o'zlashtirish`,
          },
        },
      },
    },
  });
}
</script>
