<template>
  <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="text-xs font-black uppercase tracking-wider text-slate-400">
        🏆 Sinf Leaderboard
      </div>
      <div class="flex rounded-xl bg-black/40 p-1 border border-white/10 gap-1">
        <button
          type="button"
          @click="tab = 'coin'"
          class="rounded-lg px-2.5 py-1 text-[11px] font-black transition"
          :class="
            tab === 'coin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          "
        >
          🪙 Tangalar
        </button>
        <button
          type="button"
          @click="tab = 'strike'"
          class="rounded-lg px-2.5 py-1 text-[11px] font-black transition"
          :class="
            tab === 'strike'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'text-slate-400 hover:text-white'
          "
        >
          🔥 Strikes
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
      <div
        v-if="sortedData.length === 0"
        class="py-8 text-center text-xs text-slate-500"
      >
        Hozircha reyting ma'lumotlari yo'q
      </div>

      <div
        v-for="(u, idx) in sortedData"
        :key="u.name"
        class="flex items-center justify-between rounded-2xl border p-3 text-xs transition"
        :class="
          isMe(u.name)
            ? 'border-indigo-500/60 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
            : 'border-white/5 bg-slate-950/40'
        "
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black"
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
          <div>
            <span class="font-bold text-white text-sm">
              {{ u.name }}
            </span>
            <span v-if="isMe(u.name)" class="ml-1.5 rounded-full bg-indigo-500/30 px-1.5 py-0.5 text-[9px] font-black text-indigo-300 border border-indigo-500/40">
              Siz
            </span>
          </div>
        </div>

        <div>
          <span v-if="tab === 'coin'" class="font-black text-amber-400 text-sm">
            {{ u.coin }} 🪙
          </span>
          <span v-else class="font-black text-red-400 text-sm">
            {{ u.strike }} 🔥
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStudentStore } from "../../composables/useStudentStore";

const studentStore = useStudentStore();
const tab = ref<"coin" | "strike">("coin");

onMounted(() => {
  studentStore.fetchLeaderboard();
});

const sortedData = computed(() => {
  const list = studentStore.leaderboardData.value.filter(
    (u) => !studentStore.isStudentFrozen(u.name)
  );

  if (tab.value === "coin") {
    return list.sort((a, b) => (b.coin || 0) - (a.coin || 0)).filter((u) => u.coin > 0 || u.strike > 0);
  } else {
    return list.sort((a, b) => (b.strike || 0) - (a.strike || 0)).filter((u) => u.coin > 0 || u.strike > 0);
  }
});

function isMe(name: string) {
  return name.toLowerCase() === studentStore.studentName.value.toLowerCase();
}
</script>
