<template>
  <div class="space-y-4">
    <div
      class="rounded-3xl border transition-all duration-300 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-5"
      :class="
        embedded
          ? 'border-white/10 bg-slate-900/60 dark:bg-slate-900/80 shadow-none'
          : 'border-white/50 dark:border-white/10 bg-white/70 dark:bg-slate-900/80'
      "
    >
      <!-- Standalone Header (hidden if embedded inside StatsAnalytics) -->
      <div v-if="!embedded" class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 text-lg">
            🏆
          </div>
          <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Umumiy Reyting
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              O'quvchilar tangalari, strikelari va jarimalari
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Category Filter Pills (Apple Liquid Glass Segmented Bar) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex rounded-2xl bg-black/30 dark:bg-black/50 p-1 border border-white/15 dark:border-white/10 gap-1 w-full sm:w-auto">
          <button
            type="button"
            @click="activeTab = 'coin'"
            class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'coin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            "
          >
            <span>🪙</span>
            <span>Tangalar Reytingi</span>
          </button>
          <button
            type="button"
            @click="activeTab = 'strike'"
            class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'strike'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            "
          >
            <span>⭐</span>
            <span>Ketma-ket Strikes</span>
          </button>
          <button
            type="button"
            @click="activeTab = 'penalty'"
            class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            :class="
              activeTab === 'penalty'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-red-500/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            "
          >
            <span>⚠️</span>
            <span>Jarimalar</span>
          </button>
        </div>

        <!-- Right: Group Filter & Search -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Group filter -->
          <div class="relative flex-1 sm:flex-none">
            <select
              v-model="selectedGroup"
              class="w-full sm:w-44 appearance-none rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 px-3 py-2 pr-7 text-xs font-bold text-slate-800 dark:text-cyan-300 outline-none focus:border-amber-500 cursor-pointer backdrop-blur-xl"
            >
              <option value="all">Barcha guruhlar</option>
              <option v-for="g in availableGroups" :key="g" :value="g">
                {{ g }}
              </option>
            </select>
            <span class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▼</span>
          </div>

          <!-- Search input -->
          <div class="relative flex-1 sm:w-44">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Qidiruv..."
              class="w-full rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/40 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 backdrop-blur-xl"
            />
            <span v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer">✕</span>
          </div>

          <!-- Refresh button -->
          <button
            type="button"
            @click="loadLb"
            :disabled="loading"
            class="h-8 w-8 flex items-center justify-center rounded-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0"
            title="Yangilash"
          >
            <span :class="{ 'animate-spin': loading }">🔄</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-16 text-center text-xs text-slate-400 space-y-2">
        <div class="text-3xl animate-bounce">🏆</div>
        <p class="font-bold">Reyting ma'lumotlari yangilanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="sortedList.length === 0" class="py-16 text-center text-xs text-slate-400 space-y-2">
        <div class="text-3xl opacity-50">🍃</div>
        <p class="font-bold">Ushbu parametrlar bo'yicha hech kim topilmadi</p>
        <button
          v-if="selectedGroup !== 'all' || searchQuery"
          @click="selectedGroup = 'all'; searchQuery = ''"
          class="text-amber-500 hover:underline text-xs font-extrabold cursor-pointer"
        >
          Filtrlarni tozalash
        </button>
      </div>

      <!-- Content: Top 3 Podium + Detailed List -->
      <div v-else class="space-y-6">
        <!-- ==============================================
             TOP 3 PODIUM (Visual visionOS Pedestals)
             ============================================== -->
        <div v-if="podiumList.length >= 2 && !searchQuery" class="pt-4 pb-2 px-2">
          <div class="flex items-end justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
            <!-- 2nd Place (Silver) -->
            <div
              v-if="podiumList[1]"
              @click="teacherStore.openStudentDoskaGlobal(podiumList[1].name)"
              class="flex-1 flex flex-col items-center cursor-pointer group"
            >
              <div class="relative mb-2 flex flex-col items-center">
                <div class="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-500/20 group-hover:scale-105 transition-transform">
                  <div class="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center text-base sm:text-lg font-black text-slate-200">
                    {{ getInitials(podiumList[1].name) }}
                  </div>
                </div>
                <span class="absolute -top-2 -right-1 text-lg">🥈</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px] text-center group-hover:text-cyan-400 transition">
                {{ podiumList[1].name }}
              </p>
              <span class="text-[10px] text-slate-400 truncate max-w-[90px]">
                {{ getStudentGroupDisplay(podiumList[1].name) }}
              </span>
              <div class="mt-2 w-full rounded-t-2xl border-t border-x border-slate-400/40 bg-gradient-to-b from-slate-400/20 via-slate-500/10 to-transparent p-2 text-center h-20 flex flex-col items-center justify-center shadow-inner">
                <span class="text-xs sm:text-sm font-black text-slate-300">
                  {{ getMetricValue(podiumList[1]) }}
                </span>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400">2-o'rin</span>
              </div>
            </div>

            <!-- 1st Place (Gold / Champion) -->
            <div
              v-if="podiumList[0]"
              @click="teacherStore.openStudentDoskaGlobal(podiumList[0].name)"
              class="flex-1 flex flex-col items-center cursor-pointer group"
            >
              <div class="relative mb-2 flex flex-col items-center">
                <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-xl shadow-amber-500/30 group-hover:scale-105 transition-transform">
                  <div class="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center text-lg sm:text-xl font-black text-amber-300">
                    {{ getInitials(podiumList[0].name) }}
                  </div>
                </div>
                <span class="absolute -top-3.5 text-xl animate-bounce">👑</span>
                <span class="absolute -bottom-1 -right-1 text-base">🥇</span>
              </div>
              <p class="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-[110px] text-center group-hover:text-amber-400 transition">
                {{ podiumList[0].name }}
              </p>
              <span class="text-[10px] text-amber-500/90 font-bold truncate max-w-[100px]">
                {{ getStudentGroupDisplay(podiumList[0].name) }}
              </span>
              <div class="mt-2 w-full rounded-t-2xl border-t border-x border-amber-400/60 bg-gradient-to-b from-amber-400/30 via-amber-500/15 to-transparent p-2 text-center h-28 flex flex-col items-center justify-center shadow-inner shadow-amber-500/10">
                <span class="text-sm sm:text-base font-black text-amber-300">
                  {{ getMetricValue(podiumList[0]) }}
                </span>
                <span class="text-[9.5px] font-black uppercase tracking-wider text-amber-400/90">G'olib 🏆</span>
              </div>
            </div>

            <!-- 3rd Place (Bronze) -->
            <div
              v-if="podiumList[2]"
              @click="teacherStore.openStudentDoskaGlobal(podiumList[2].name)"
              class="flex-1 flex flex-col items-center cursor-pointer group"
            >
              <div class="relative mb-2 flex flex-col items-center">
                <div class="h-11 w-11 sm:h-13 sm:w-13 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg shadow-amber-700/20 group-hover:scale-105 transition-transform">
                  <div class="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center text-sm sm:text-base font-black text-amber-200">
                    {{ getInitials(podiumList[2].name) }}
                  </div>
                </div>
                <span class="absolute -top-2 -right-1 text-base">🥉</span>
              </div>
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[95px] text-center group-hover:text-cyan-400 transition">
                {{ podiumList[2].name }}
              </p>
              <span class="text-[10px] text-slate-400 truncate max-w-[85px]">
                {{ getStudentGroupDisplay(podiumList[2].name) }}
              </span>
              <div class="mt-2 w-full rounded-t-2xl border-t border-x border-amber-700/40 bg-gradient-to-b from-amber-700/20 via-amber-800/10 to-transparent p-2 text-center h-16 flex flex-col items-center justify-center shadow-inner">
                <span class="text-xs sm:text-sm font-black text-amber-200">
                  {{ getMetricValue(podiumList[2]) }}
                </span>
                <span class="text-[9px] font-black uppercase tracking-wider text-amber-400/80">3-o'rin</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ==============================================
             LEADERBOARD LIST
             ============================================== -->
        <div class="space-y-2">
          <div class="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>O'quvchi & Guruh</span>
            <span>Natija</span>
          </div>

          <div
            v-for="(item, idx) in sortedList"
            :key="item.name"
            class="flex items-center justify-between rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-950/60 p-3 sm:px-4 text-xs transition-all hover:border-amber-500/40 hover:bg-white/90 dark:hover:bg-slate-900/90 shadow-sm backdrop-blur-xl group"
          >
            <!-- Left: Rank & Student Identity -->
            <div class="flex items-center gap-3 min-w-0">
              <!-- Rank Badge -->
              <span
                class="flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs shrink-0 shadow-sm"
                :class="
                  idx === 0
                    ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/30'
                    : idx === 1
                    ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 shadow-slate-400/30'
                    : idx === 2
                    ? 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white shadow-amber-700/30'
                    : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400'
                "
              >
                {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1 }}
              </span>

              <!-- Name & Group -->
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span
                    @click="teacherStore.openStudentDoskaGlobal(item.name)"
                    class="font-black text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer group-hover:text-amber-500 dark:group-hover:text-amber-400 hover:underline transition truncate"
                    title="O'quvchining shaxsiy doskasini ochish"
                  >
                    {{ item.name }}
                  </span>
                  <!-- Group Tag -->
                  <span
                    v-if="getStudentGroupDisplay(item.name)"
                    class="rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-1.5 py-0.2 text-[9.5px] font-bold text-slate-600 dark:text-slate-300 truncate shrink-0"
                  >
                    {{ getStudentGroupDisplay(item.name) }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-400">
                  {{ idx + 1 }}-o'rin reytingda
                </p>
              </div>
            </div>

            <!-- Right: Metric Score & Doska Trigger -->
            <div class="flex items-center gap-3 shrink-0">
              <div class="text-right">
                <span
                  v-if="activeTab === 'coin'"
                  class="font-black text-amber-500 dark:text-amber-400 text-sm sm:text-base tabular-nums flex items-center justify-end gap-1"
                >
                  <span>{{ (item.coin || 0).toLocaleString() }}</span>
                  <span class="text-xs">🪙</span>
                </span>
                <span
                  v-else-if="activeTab === 'strike'"
                  class="font-black text-yellow-500 dark:text-yellow-400 text-sm sm:text-base tabular-nums flex items-center justify-end gap-1"
                >
                  <span>{{ item.strike || 0 }}</span>
                  <span class="text-xs">⭐</span>
                </span>
                <span
                  v-else
                  class="font-black text-rose-500 dark:text-rose-400 text-sm sm:text-base tabular-nums flex items-center justify-end gap-1"
                >
                  <span>{{ item.penalty || 0 }}</span>
                  <span class="text-xs">⚠️</span>
                </span>
              </div>

              <button
                type="button"
                @click="teacherStore.openStudentDoskaGlobal(item.name)"
                class="hidden xs:flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-white hover:border-amber-500/40 active:scale-95 transition cursor-pointer"
                title="Doskani ko'rish"
              >
                ↗️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { callApi } from "../../services/api";
import { useTeacherStore, getStudentGroups } from "../../composables/useTeacherStore";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  }
);

defineEmits<{
  (e: "back"): void;
}>();

const teacherStore = useTeacherStore();

interface LbItem {
  name: string;
  coin: number;
  strike: number;
  penalty?: number;
}

const loading = ref(false);
const rawList = ref<LbItem[]>([]);
const activeTab = ref<"coin" | "strike" | "penalty">("coin");
const selectedGroup = ref<string>("all");
const searchQuery = ref<string>("");

onMounted(() => {
  loadLb();
});

async function loadLb() {
  loading.value = true;
  try {
    const res = await callApi("get_leaderboard");
    if (res.status === "success" && res.leaderboard) {
      rawList.value = res.leaderboard;
    }
  } catch (e) {
    console.error("loadLb error:", e);
  } finally {
    loading.value = false;
  }
}

// Available groups from teacher store
const availableGroups = computed(() => {
  if (teacherStore.groups && teacherStore.groups.value) {
    return teacherStore.groups.value;
  }
  if (teacherStore.groupsMeta && teacherStore.groupsMeta.value) {
    return Object.keys(teacherStore.groupsMeta.value);
  }
  return [];
});

// Helper: Get student groups display string
function getStudentGroupDisplay(name: string): string {
  if (!name) return "";
  const allList = (teacherStore.allStudentsRegistry && teacherStore.allStudentsRegistry.value)
    ? teacherStore.allStudentsRegistry.value
    : (teacherStore.students && teacherStore.students.value ? teacherStore.students.value : []);
  const match = allList.find(
    (s: any) => s && s.name && s.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (!match) return "";
  const grps = getStudentGroups(match);
  return grps && grps.length > 0 ? grps.join(", ") : match.group || "";
}

// Helper: Get student initials
function getInitials(name: string): string {
  if (!name) return "👤";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Helper: Formatted metric value for podium
function getMetricValue(item: LbItem): string {
  if (!item) return "";
  if (activeTab.value === "coin") return `${(item.coin || 0).toLocaleString()} 🪙`;
  if (activeTab.value === "strike") return `${item.strike || 0} ⭐`;
  return `${item.penalty || 0} ⚠️`;
}

// Filtered and sorted list
const sortedList = computed(() => {
  if (!Array.isArray(rawList.value)) return [];

  // Exclude frozen students
  let list = rawList.value.filter((x) => {
    if (!x || !x.name) return false;
    if (typeof teacherStore.isStudentFrozen === "function") {
      return !teacherStore.isStudentFrozen(x.name);
    }
    return true;
  });

  // Group filter
  if (selectedGroup.value !== "all") {
    const targetGroup = selectedGroup.value.trim().toLowerCase();
    const allList = (teacherStore.allStudentsRegistry && teacherStore.allStudentsRegistry.value)
      ? teacherStore.allStudentsRegistry.value
      : (teacherStore.students && teacherStore.students.value ? teacherStore.students.value : []);

    list = list.filter((item) => {
      const match = allList.find(
        (s: any) => s && s.name && s.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      );
      if (!match) return false;
      const grps = getStudentGroups(match);
      return (
        (grps && grps.some((g: string) => g.trim().toLowerCase() === targetGroup)) ||
        (match.group && match.group.trim().toLowerCase() === targetGroup)
      );
    });
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((item) => item && item.name && item.name.toLowerCase().includes(q));
  }

  // Sorting based on active tab
  if (activeTab.value === "coin") {
    return list.sort((a, b) => (b.coin || 0) - (a.coin || 0)).filter((x) => (x.coin || 0) > 0);
  } else if (activeTab.value === "strike") {
    return list.sort((a, b) => (b.strike || 0) - (a.strike || 0)).filter((x) => (x.strike || 0) > 0);
  } else {
    return list.sort((a, b) => (b.penalty || 0) - (a.penalty || 0)).filter((x) => (x.penalty || 0) > 0);
  }
});

// Top 3 for the podium
const podiumList = computed(() => {
  return sortedList.value.slice(0, 3);
});
</script>
