<template>
  <div class="space-y-4">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>🏆</span> Sinf Reytingi
        </h2>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="flex rounded-2xl bg-black/40 p-1 border border-white/10 gap-1">
        <button
          type="button"
          @click="activeTab = 'coin'"
          class="flex-1 rounded-xl py-2 text-xs font-black transition"
          :class="
            activeTab === 'coin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          "
        >
          🪙 Tangalar
        </button>
        <button
          type="button"
          @click="activeTab = 'strike'"
          class="flex-1 rounded-xl py-2 text-xs font-black transition"
          :class="
            activeTab === 'strike'
              ? 'bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20'
              : 'text-slate-400 hover:text-white'
          "
        >
          ⭐ Strikes
        </button>
        <button
          type="button"
          @click="activeTab = 'penalty'"
          class="flex-1 rounded-xl py-2 text-xs font-black transition"
          :class="
            activeTab === 'penalty'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'text-slate-400 hover:text-white'
          "
        >
          ⚠️ Jarimalar
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        Reyting yuklanmoqda... ⏳
      </div>

      <!-- Empty -->
      <div v-else-if="sortedList.length === 0" class="py-12 text-center text-xs text-slate-500">
        Ro'yxat bo'sh
      </div>

      <!-- List -->
      <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-1">
        <div
          v-for="(item, idx) in sortedList"
          :key="item.name"
          class="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs"
        >
          <div class="flex items-center gap-3">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full font-black text-[11px]"
              :class="
                idx === 0
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : idx === 1
                  ? 'bg-slate-300 text-slate-950 font-black'
                  : idx === 2
                  ? 'bg-amber-700 text-white font-black'
                  : 'bg-white/10 text-slate-400'
              "
            >
              {{ idx + 1 }}
            </span>
            <span class="font-bold text-white text-sm">{{ item.name }}</span>
          </div>

          <div>
            <span v-if="activeTab === 'coin'" class="font-black text-amber-400 text-sm">
              {{ item.coin || 0 }} 🪙
            </span>
            <span v-else-if="activeTab === 'strike'" class="font-black text-yellow-400 text-sm">
              {{ item.strike || 0 }} ⭐
            </span>
            <span v-else class="font-black text-red-400 text-sm">
              {{ item.penalty || 0 }} ⚠️
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { callApi } from "../../services/api";

defineEmits<{
  (e: "back"): void;
}>();

interface LbItem {
  name: string;
  coin: number;
  strike: number;
  penalty?: number;
}

const loading = ref(false);
const rawList = ref<LbItem[]>([]);
const activeTab = ref<"coin" | "strike" | "penalty">("coin");

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

const sortedList = computed(() => {
  const list = [...rawList.value];
  if (activeTab.value === "coin") {
    return list.sort((a, b) => (b.coin || 0) - (a.coin || 0)).filter((x) => (x.coin || 0) > 0);
  } else if (activeTab.value === "strike") {
    return list.sort((a, b) => (b.strike || 0) - (a.strike || 0)).filter((x) => (x.strike || 0) > 0);
  } else {
    return list.sort((a, b) => (b.penalty || 0) - (a.penalty || 0)).filter((x) => (x.penalty || 0) > 0);
  }
});
</script>
