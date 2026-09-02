<template>
  <div class="space-y-6 w-full mx-auto pb-12">
    <!-- Top Bar: Header, Back, Refresh, and PDF Export -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('back')"
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          title="Ortga qaytish"
        >
          ⬅️
        </button>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>📊</span> O'zlashtirish Tahlili & AI
          </h2>
          <p class="text-xs text-slate-400">Diagrammalar, mavzular tahlili va Gemini AI xulosasi</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- AI Analyze Action Button -->
        <button
          type="button"
          @click="runAiAnalysis"
          :disabled="analyzingAi || filteredRecords.length === 0"
          class="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 active:scale-95 disabled:opacity-40 transition-all"
        >
          <span class="text-base" :class="{ 'animate-spin': analyzingAi }">✨</span>
          <span>{{ analyzingAi ? "AI tahlil qilmoqda..." : "Gemini AI Tahlili" }}</span>
        </button>

        <button
          type="button"
          @click="fetchHistory(true)"
          :disabled="loading"
          class="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition"
          title="Ma'lumotlarni qayta yuklash"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
        </button>

        <!-- PDF Export Button -->
        <button
          type="button"
          @click="exportToPdf"
          :disabled="filteredRecords.length === 0 || loading"
          class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-40 transition-all"
        >
          <span>📄</span>
          <span>PDF Hisobot</span>
        </button>
      </div>
    </div>

    <!-- Filters: Group, Book & Student Search -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- 1. Group Selector -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
        <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Guruhni tanlang:</label>
        <select
          v-model="selectedGroup"
          @change="updateCharts"
          class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Barcha guruhlar</option>
          <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <!-- 2. Book Filter -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
        <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Darslik bo'yicha filter:</label>
        <select
          v-model="selectedBook"
          @change="updateCharts"
          class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="all">Barcha darsliklar</option>
          <option v-for="b in availableBooks" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>

      <!-- 3. Student Search -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
        <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">O'quvchini qidirish:</label>
        <input
          v-model="searchQuery"
          @input="updateCharts"
          type="text"
          placeholder="🔍 Ism bo'yicha filter..."
          class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
        />
      </div>
    </div>

    <!-- Executive KPI Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="glass-card rounded-3xl p-4 text-center border-purple-500/30 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">O'rtacha O'zlashtirish</div>
        <div class="text-3xl font-black mt-1 tabular-nums" :class="avgScoreColor">
          {{ overallAvgScore }}%
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">Sinf bo'yicha umumiy</div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-blue-500/30 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jami Sinovlar</div>
        <div class="text-3xl font-black text-white mt-1 tabular-nums">
          {{ filteredRecords.length }} <span class="text-xs font-normal text-slate-400">ta</span>
        </div>
        <div class="text-[10px] text-slate-400 mt-0.5">{{ uniqueStudentsCount }} nafar o'quvchi</div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-emerald-500/30 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eng Kuchli Mavzu</div>
        <div class="text-sm font-black text-emerald-300 mt-2 line-clamp-1">
          {{ topMasteryTopic.name }}
        </div>
        <div class="text-[10px] text-emerald-400/90 font-bold mt-0.5">{{ topMasteryTopic.score }}% natija 🏆</div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-rose-500/30 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E'tibor Talab Mavzu</div>
        <div class="text-sm font-black text-rose-300 mt-2 line-clamp-1">
          {{ lowestMasteryTopic.name }}
        </div>
        <div class="text-[10px] text-rose-400/90 font-bold mt-0.5">{{ lowestMasteryTopic.score }}% natija ⚠️</div>
      </div>
    </div>

    <!-- 🤖 GEMINI AI PEDAGOGICAL ANALYSIS BANNER (IF ACTIVE) -->
    <div
      v-if="aiAnalysisResult"
      class="rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-2xl space-y-4"
    >
      <div class="flex items-center justify-between border-b border-purple-500/20 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🤖</span>
          <div>
            <h3 class="text-base font-black text-white flex items-center gap-2">
              Gemini AI Pedagogik Tahlil Xulosasi
              <span class="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                PRO AI
              </span>
            </h3>
            <p class="text-[11px] text-slate-400">O'quvchilar ko'rsatkichlari asosida sun'iy intellekt xulosalari</p>
          </div>
        </div>
        <button
          @click="aiAnalysisResult = ''"
          class="rounded-xl bg-white/5 p-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-black/40 p-4 rounded-2xl border border-white/10">
        {{ aiAnalysisResult }}
      </div>
    </div>

    <!-- 3 INTERACTIVE CHARTS GRID -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 1. Mastery Trend Line Chart -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>📈</span> O'zlashtirish Dinamikasi (Trend)
          </h4>
          <span class="text-[11px] text-slate-500">Vaqt kesimida</span>
        </div>
        <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
          <canvas ref="trendChartRef"></canvas>
        </div>
      </div>

      <!-- 2. Grade Distribution Doughnut Chart -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>🎯</span> O'zlashtirish Darajalari Taqsimoti
          </h4>
          <span class="text-[11px] text-slate-500">Sinf balansi</span>
        </div>
        <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3 flex items-center justify-center">
          <canvas ref="distChartRef"></canvas>
        </div>
      </div>

      <!-- 3. Topic Mastery Bar Chart (Full Width) -->
      <div class="col-span-1 lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>📚</span> Darsliklar va Mavzular Bo'yicha O'zlashtirish Foizlari
          </h4>
          <span class="text-[11px] text-slate-500">Bo'shliqlarni aniqlash</span>
        </div>
        <div class="relative h-72 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
          <canvas ref="topicChartRef"></canvas>
        </div>
      </div>
    </div>

    <!-- STUDENT MASTERY LEADERBOARD TABLE -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
      <div class="flex items-center justify-between px-1">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>🏆</span> O'quvchilarning O'zlashtirish Reyting Jadvali
        </h4>
        <span class="text-[11px] text-slate-400">
          Jami: <b>{{ studentRankingRows.length }}</b> nafar o'quvchi
        </span>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner custom-scrollbar">
        <table class="w-full text-center text-xs text-slate-200 border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
              <th class="px-3 py-3 text-left w-12">O'rin</th>
              <th class="px-3 py-3 text-left">O'quvchi F.I.O</th>
              <th class="px-3 py-3">Guruh</th>
              <th class="px-3 py-3">Testlar</th>
              <th class="px-3 py-3">Maksimal</th>
              <th class="px-3 py-3">Strikes ⭐</th>
              <th class="px-3 py-3 font-black text-white">O'rtacha Ball</th>
              <th class="px-3 py-3">Holat</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in studentRankingRows"
              :key="row.name"
              class="border-b border-white/5 hover:bg-white/5 transition"
            >
              <!-- Rank -->
              <td class="px-3 py-3 text-left font-black text-sm">
                <span v-if="idx === 0">🥇 1</span>
                <span v-else-if="idx === 1">🥈 2</span>
                <span v-else-if="idx === 2">🥉 3</span>
                <span v-else class="text-slate-400">{{ idx + 1 }}</span>
              </td>

              <!-- Name -->
              <td class="px-3 py-3 text-left font-bold text-white whitespace-nowrap">
                {{ row.name }}
              </td>

              <!-- Group -->
              <td class="px-3 py-3 whitespace-nowrap">
                <span class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                  {{ row.group }}
                </span>
              </td>

              <!-- Tests Count -->
              <td class="px-3 py-3 tabular-nums font-semibold text-slate-300">
                {{ row.testCount }}
              </td>

              <!-- Max Score -->
              <td class="px-3 py-3 tabular-nums font-bold text-emerald-400">
                {{ row.maxScore }}%
              </td>

              <!-- Strikes -->
              <td class="px-3 py-3 tabular-nums font-bold text-amber-400">
                {{ row.strikes > 0 ? `⭐ ${row.strikes}` : '-' }}
              </td>

              <!-- Avg Score -->
              <td class="px-3 py-3 font-black text-sm tabular-nums" :class="getScoreColor(row.avgScore)">
                {{ row.avgScore }}%
              </td>

              <!-- Status Badge -->
              <td class="px-3 py-3 whitespace-nowrap">
                <span
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-black"
                  :class="
                    row.avgScore >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : row.avgScore >= 70
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : row.avgScore >= 50
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  "
                >
                  {{ row.avgScore >= 90 ? 'A\'lo 🏆' : row.avgScore >= 70 ? 'Yaxshi 👍' : row.avgScore >= 50 ? 'O\'rtacha ⚠️' : 'Qoniqarsiz ❌' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { callApi } from "../../services/api";
import { useTeacherStore } from "../../composables/useTeacherStore";

Chart.register(...registerables);

defineEmits<{
  (e: "back"): void;
}>();

const teacherStore = useTeacherStore();

interface HistoryRecord {
  date: string;
  name: string;
  percent: number | string;
  group?: string;
  book?: string;
  topic?: string;
  strike?: number;
}

const loading = ref(false);
const rawHistory = ref<HistoryRecord[]>([]);
const groupsDict = ref<Record<string, string[]>>({});
const selectedGroup = ref("all");
const selectedBook = ref("all");
const searchQuery = ref("");

// AI State
const analyzingAi = ref(false);
const aiAnalysisResult = ref("");

// Chart references & instances
const trendChartRef = ref<HTMLCanvasElement | null>(null);
const distChartRef = ref<HTMLCanvasElement | null>(null);
const topicChartRef = ref<HTMLCanvasElement | null>(null);

let trendChart: Chart | null = null;
let distChart: Chart | null = null;
let topicChart: Chart | null = null;

onMounted(async () => {
  await fetchHistory();
});

async function fetchHistory(forceRefresh = false) {
  loading.value = true;
  try {
    const [resHist, resGroups] = await Promise.all([
      callApi("get_history", {}, { forceRefresh }),
      callApi("get_student_list", {}, { forceRefresh }),
    ]);

    if (resHist.status === "success" && resHist.history) {
      rawHistory.value = resHist.history;
    }
    if (resGroups.status === "success" && resGroups.groups) {
      groupsDict.value = resGroups.groups;
    }

    await nextTick();
    updateCharts();
  } catch (e) {
    console.error("fetchHistory error:", e);
  } finally {
    loading.value = false;
  }
}

// Find student's group from groupsDict
function getStudentGroup(name: string): string {
  for (const gName in groupsDict.value) {
    if (gName !== "Arxiv" && groupsDict.value[gName].includes(name)) {
      return gName;
    }
  }
  return "Boshqa";
}

const availableGroups = computed(() => {
  const set = new Set<string>();
  for (const g in groupsDict.value) {
    if (g !== "Arxiv") set.add(g);
  }
  return [...set].sort();
});

const availableBooks = computed(() => {
  const set = new Set<string>();
  rawHistory.value.forEach((r) => {
    if (r.book) set.add(r.book);
  });
  return [...set].sort();
});

// Filtered Records
const filteredRecords = computed(() => {
  return rawHistory.value.filter((r) => {
    const sGroup = r.group || getStudentGroup(r.name);
    if (selectedGroup.value !== "all" && sGroup !== selectedGroup.value) return false;
    if (selectedBook.value !== "all" && r.book !== selectedBook.value) return false;
    if (searchQuery.value.trim() && !r.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())) return false;
    return true;
  });
});

const uniqueStudentsCount = computed(() => {
  return new Set(filteredRecords.value.map((r) => r.name)).size;
});

// Overall Average Score
const overallAvgScore = computed(() => {
  const list = filteredRecords.value;
  if (list.length === 0) return 0;
  const sum = list.reduce((acc, r) => acc + (parseFloat(String(r.percent)) || 0), 0);
  return Math.round(sum / list.length);
});

const avgScoreColor = computed(() => {
  const s = overallAvgScore.value;
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-amber-400";
  return "text-rose-400";
});

// Top and Lowest Mastery Topics
const topicScores = computed(() => {
  const map: Record<string, { sum: number; count: number }> = {};
  filteredRecords.value.forEach((r) => {
    const key = r.book ? (r.topic ? `${r.book} (${r.topic})` : r.book) : "Umumiy mavzular";
    if (!map[key]) map[key] = { sum: 0, count: 0 };
    map[key].sum += parseFloat(String(r.percent)) || 0;
    map[key].count++;
  });

  const list: { name: string; score: number; count: number }[] = [];
  for (const k in map) {
    list.push({
      name: k,
      score: Math.round(map[k].sum / map[k].count),
      count: map[k].count,
    });
  }
  return list.sort((a, b) => b.score - a.score);
});

const topMasteryTopic = computed(() => {
  return topicScores.value[0] || { name: "Mavjud emas", score: 0 };
});

const lowestMasteryTopic = computed(() => {
  const list = topicScores.value;
  return list.length > 0 ? list[list.length - 1] : { name: "Mavjud emas", score: 0 };
});

// Student Ranking Rows
interface StudentRankRow {
  name: string;
  group: string;
  testCount: number;
  avgScore: number;
  maxScore: number;
  strikes: number;
}

const studentRankingRows = computed<StudentRankRow[]>(() => {
  const map: Record<string, { scores: number[]; strikes: number }> = {};
  filteredRecords.value.forEach((r) => {
    if (!map[r.name]) map[r.name] = { scores: [], strikes: 0 };
    map[r.name].scores.push(parseFloat(String(r.percent)) || 0);
    if (r.strike) map[r.name].strikes += r.strike;
  });

  const rows: StudentRankRow[] = [];
  for (const name in map) {
    const scores = map[name].scores;
    const testCount = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const avgScore = Math.round(sum / testCount);
    const maxScore = Math.round(Math.max(...scores));
    const group = getStudentGroup(name);

    rows.push({
      name,
      group,
      testCount,
      avgScore,
      maxScore,
      strikes: map[name].strikes,
    });
  }

  return rows.sort((a, b) => b.avgScore - a.avgScore || b.testCount - a.testCount);
});

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

// Update all Chart.js visualizations
function updateCharts() {
  renderTrendChart();
  renderDistChart();
  renderTopicChart();
}

function renderTrendChart() {
  if (!trendChartRef.value) return;

  // Group by date
  const dateMap: Record<string, { sum: number; count: number }> = {};
  filteredRecords.value.forEach((r) => {
    if (!dateMap[r.date]) dateMap[r.date] = { sum: 0, count: 0 };
    dateMap[r.date].sum += parseFloat(String(r.percent)) || 0;
    dateMap[r.date].count++;
  });

  const labels = Object.keys(dateMap).sort();
  const dataPoints = labels.map((d) => Math.round(dateMap[d].sum / dateMap[d].count));

  if (trendChart) trendChart.destroy();

  trendChart = new Chart(trendChartRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "O'rtacha o'zlashtirish %",
          data: dataPoints,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.15)",
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#8b5cf6",
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
          ticks: { color: "#94a3b8", stepSize: 20 },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8", maxRotation: 45 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.parsed.y}% o'rtacha ball`,
          },
        },
      },
    },
  });
}

function renderDistChart() {
  if (!distChartRef.value) return;

  let excellent = 0; // 90-100
  let good = 0; // 70-89
  let average = 0; // 50-69
  let poor = 0; // <50

  studentRankingRows.value.forEach((r) => {
    if (r.avgScore >= 90) excellent++;
    else if (r.avgScore >= 70) good++;
    else if (r.avgScore >= 50) average++;
    else poor++;
  });

  if (distChart) distChart.destroy();

  distChart = new Chart(distChartRef.value, {
    type: "doughnut",
    data: {
      labels: ["A'lo (90-100%)", "Yaxshi (70-89%)", "O'rtacha (50-69%)", "Qoniqarsiz (<50%)"],
      datasets: [
        {
          data: [excellent, good, average, poor],
          backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
          borderColor: "#0f172a",
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#cbd5e1", boxWidth: 12, padding: 12, font: { size: 10 } },
        },
      },
      cutout: "65%",
    },
  });
}

function renderTopicChart() {
  if (!topicChartRef.value) return;

  const topics = topicScores.value.slice(0, 10);
  const labels = topics.map((t) => t.name);
  const dataPoints = topics.map((t) => t.score);
  const bgColors = dataPoints.map((s) => (s >= 80 ? "#10b981" : s >= 60 ? "#3b82f6" : s >= 50 ? "#f59e0b" : "#ef4444"));

  if (topicChart) topicChart.destroy();

  topicChart = new Chart(topicChartRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data: dataPoints,
          backgroundColor: bgColors,
          borderRadius: 8,
          barThickness: 22,
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
          ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 25 },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.parsed.y}% o'zlashtirish darajasi`,
          },
        },
      },
    },
  });
}

// 🤖 GEMINI AI ANALYSIS GENERATOR
async function runAiAnalysis() {
  if (filteredRecords.value.length === 0) return;
  analyzingAi.value = true;
  aiAnalysisResult.value = "";

  const summary = {
    group: selectedGroup.value === "all" ? "Barcha guruhlar" : selectedGroup.value,
    totalTests: filteredRecords.value.length,
    studentsCount: studentRankingRows.value.length,
    overallAvg: overallAvgScore.value,
    topStudents: studentRankingRows.value.slice(0, 3).map((s) => `${s.name} (${s.avgScore}%)`),
    atRiskStudents: studentRankingRows.value.filter((s) => s.avgScore < 60).map((s) => `${s.name} (${s.avgScore}%)`),
    strongTopics: topicScores.value.slice(0, 3).map((t) => `${t.name} (${t.score}%)`),
    weakTopics: topicScores.value.slice(-3).map((t) => `${t.name} (${t.score}%)`),
  };

  const prompt = `Sen tajribali Pedagog va Ta'lim Tahlilchisisan. Tarix fani o'qituvchisiga quyidagi sinf o'zlashtirish ma'lumotlari bo'yicha professional xulosa va tavsiyalar ber:
Guruh: ${summary.group}
O'rtacha o'zlashtirish foizi: ${summary.overallAvg}%
Jami test topshirishlar: ${summary.totalTests} ta (${summary.studentsCount} nafar o'quvchi)
Yetakchi a'lochi o'quvchilar: ${summary.topStudents.join(", ") || "Yo'q"}
Yordamga muhtoj past baholi o'quvchilar: ${summary.atRiskStudents.join(", ") || "Yo'q"}
Eng yaxshi o'zlashtirilgan mavzular: ${summary.strongTopics.join(", ") || "Mavjud emas"}
Eng past o'zlashtirilgan zaif mavzular: ${summary.weakTopics.join(", ") || "Mavjud emas"}

Iltimos, javobni quyidagi 4 ta aniq bo'limda chiroyli va amaliy shaklda yozib ber:
1. 🎯 SINF BO'YICHA UMUMIY PEDAGOGIK XULOSA
2. ⚠️ MAXSUS E'TIBOR TALAB QILUVCHI O'QUVCHILAR BILAN ISHLASH REJASI
3. 📖 QAYTA TAKRORLANISHI KERAK BO'LGAN BO'SHLIQ MAVZULAR
4. 💡 O'QITUVCHI UCHUN KEYINGI DARSLARGA AMALIY METODIK MASLAHATLAR`;

  try {
    const res = await callApi("ask_ai", { prompt });
    if (res.status === "success" && res.reply) {
      aiAnalysisResult.value = res.reply;
    } else {
      // Fallback local smart synthesis
      aiAnalysisResult.value = generateLocalAiReport(summary);
    }
  } catch (e) {
    aiAnalysisResult.value = generateLocalAiReport(summary);
  } finally {
    analyzingAi.value = false;
  }
}

// Local smart synthesis fallback
function generateLocalAiReport(summary: any): string {
  return `🎯 SINF BO'YICHA UMUMIY PEDAGOGIK XULOSA:
Guruhning umumiy o'zlashtirish ko'rsatkichi ${summary.overallAvg}% ni tashkil etadi. Darslarda o'quvchilarning umumiy faolligi yaxshi, ammo natijalar o'rtasida tabaqalanish mavjud.

⚠️ MAXSUS E'TIBOR TALAB QILUVCHI O'QUVCHILAR:
Quyidagi o'quvchilar bilan yakka tartibda ishlash tavsiya etiladi: ${summary.atRiskStudents.join(", ") || "Hozircha xavf ostidagi o'quvchilar aniqlanmadi"}. Ularga qo'shimcha rag'batlantiruvchi testlar berish maqsadga muvofiq.

📖 QAYTA TAKRORLANISHI KERAK BO'LGAN MAVZULAR:
Eng ko'p xatolar quyidagi mavzularda kuzatildi: ${summary.weakTopics.join(", ") || "Umumiy mavzular"}. Ushbu mavzular bo'yicha blits-savol yoki duel musobaqasi o'tkazish tavsiya etiladi.

💡 O'QITUVCHI UCHUN AMALIY METODIK MASLAHATLAR:
1. Kuchli o'quvchilar (${summary.topStudents.join(", ")}) bilan past ball olgan o'quvchilarni "Jamoalar jangi" rejimida juftlikka ajrating.
2. Dars boshida 5 daqiqalik o'tilgan zaif mavzular bo'yicha tezkor savol-javob o'tkazing.`;
}

// 📄 PDF ANALYTICAL REPORT EXPORT
function exportToPdf() {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const teacher = teacherStore.teacherName.value || "Ustoz";
  const groupLabel = selectedGroup.value === "all" ? "Barcha guruhlar" : selectedGroup.value;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("HISTORY ARENA PRO — O'ZLASHTIRISH VA REYTING HISOBOTI", 14, 15);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Guruh: ${groupLabel}  |  O'qituvchi: ${teacher}  |  O'rtacha ball: ${overallAvgScore.value}%  |  Sana: ${new Date().toLocaleDateString()}`, 14, 22);

  // Table
  const headers = [["№", "O'quvchi F.I.O", "Guruh", "Testlar", "Max %", "Strikes", "O'rtacha %"]];
  const rows = studentRankingRows.value.map((r, i) => [
    String(i + 1),
    r.name,
    r.group,
    String(r.testCount),
    `${r.maxScore}%`,
    String(r.strikes),
    `${r.avgScore}%`,
  ]);

  autoTable(doc, {
    startY: 27,
    head: headers,
    body: rows,
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55, halign: "left", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const safeGroup = groupLabel.replace(/\s+/g, "_");
  doc.save(`Statistika_Hisoboti_${safeGroup}.pdf`);
}
</script>
