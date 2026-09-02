<template>
  <div class="space-y-4">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>📊</span> O'zlashtirish Statistikasi
        </h2>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Student Selector -->
      <div>
        <select
          v-model="selectedName"
          @change="renderChart"
          class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">📊 Butun Sinf Dinamikasi</option>
          <option v-for="n in uniqueNames" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <!-- Chart Container -->
      <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3 overflow-hidden">
        <div v-if="loading" class="flex h-full items-center justify-center text-xs text-slate-400">
          Statistika yuklanmoqda... ⏳
        </div>
        <canvas v-show="!loading" ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { callApi } from "../../services/api";

Chart.register(...registerables);

defineEmits<{
  (e: "back"): void;
}>();

interface HistoryRecord {
  date: string;
  name: string;
  percent: number | string;
}

const loading = ref(false);
const historyList = ref<HistoryRecord[]>([]);
const selectedName = ref("all");
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

onMounted(() => {
  fetchHistory();
});

async function fetchHistory() {
  loading.value = true;
  try {
    const res = await callApi("get_history");
    if (res.status === "success" && res.history) {
      historyList.value = res.history;
      await nextTick();
      renderChart();
    }
  } catch (e) {
    console.error("fetchHistory error:", e);
  } finally {
    loading.value = false;
  }
}

const uniqueNames = computed(() => {
  return [...new Set(historyList.value.map((h) => h.name))].sort();
});

function renderChart() {
  if (!chartCanvas.value) return;

  let labels: string[] = [];
  let dataPoints: number[] = [];

  if (selectedName.value === "all") {
    const dateMap: Record<string, { sum: number; count: number }> = {};
    historyList.value.forEach((h) => {
      if (!dateMap[h.date]) dateMap[h.date] = { sum: 0, count: 0 };
      dateMap[h.date].sum += parseFloat(String(h.percent)) || 0;
      dateMap[h.date].count++;
    });

    labels = Object.keys(dateMap).sort();
    dataPoints = labels.map((d) => Math.round(dateMap[d].sum / dateMap[d].count));
  } else {
    const records = historyList.value.filter((h) => h.name === selectedName.value);
    labels = records.map((r) => r.date);
    dataPoints = records.map((r) => parseFloat(String(r.percent)) || 0);
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: "#a855f7",
          backgroundColor: "rgba(168, 85, 247, 0.15)",
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#a855f7",
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
