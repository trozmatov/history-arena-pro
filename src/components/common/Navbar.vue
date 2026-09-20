<template>
  <header class="sticky top-0 z-40 w-full border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-[#070d18]/70 backdrop-blur-2xl shadow-sm transition-colors duration-300">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5">
      <!-- Logo & App Name -->
      <div class="flex items-center gap-3 cursor-pointer select-none group" @click="$emit('goHome')">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-md shadow-blue-500/25 border border-white/40 dark:border-white/20 text-white font-black text-lg group-hover:scale-105 transition-transform">
          HA
        </div>
        <div>
          <h1 class="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            History Arena <span class="rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.2 text-[9px] font-black text-cyan-600 dark:text-cyan-300 uppercase tracking-wide">PRO</span>
          </h1>
          <p class="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">Dars so'rovnomasi va reyting portali</p>
        </div>
      </div>

      <!-- Role Switcher & Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Role Toggle Tabs (Liquid Glass Segmented Control) -->
        <div class="flex items-center rounded-2xl p-1 border border-white/70 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-xs">
          <button
            type="button"
            @click="$emit('changeRole', 'teacher')"
            class="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all"
            :class="
              activeRole === 'teacher'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            "
          >
            <span>👨‍🏫</span>
            <span class="hidden md:inline">O'qituvchi</span>
          </button>
          <button
            type="button"
            @click="$emit('changeRole', 'student')"
            class="flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all"
            :class="
              activeRole === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            "
          >
            <span>🎓</span>
            <span class="hidden md:inline">O'quvchi</span>
          </button>
        </div>

        <!-- Sound Toggle -->
        <button
          type="button"
          @click="toggleSound"
          class="h-9 w-9 flex items-center justify-center rounded-2xl border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95 transition shadow-sm backdrop-blur-xl"
          :title="soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o\'chirilgan'"
        >
          <span v-if="soundEnabled" class="text-sm">🔊</span>
          <span v-else class="text-sm">🔇</span>
        </button>

        <!-- Natijalar / Results Button -->
        <button
          type="button"
          @click="$emit('viewResults')"
          class="flex items-center gap-1.5 rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs font-black transition-all border shadow-sm active:scale-95 backdrop-blur-xl"
          :class="
            isResultsActive
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
          "
          title="O'quvchilar natijalari va sertifikatlari"
        >
          <span>🏆</span>
          <span class="hidden sm:inline">Natijalar</span>
        </button>

        <!-- Notification Bell (Teacher) -->
        <div v-if="activeRole === 'teacher'" class="relative">
          <button
            type="button"
            @click="$emit('toggleNotifs')"
            class="relative h-9 w-9 flex items-center justify-center rounded-2xl border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95 transition shadow-sm backdrop-blur-xl"
            :class="{ 'animate-bounce': (unreadCount || 0) > 0 }"
            title="Bildirishnomalar va Eslatmalar"
          >
            <span class="text-sm">🔔</span>
            <span
              v-if="(unreadCount || 0) > 0"
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#070d18] shadow-md animate-pulse"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>

        <!-- Apple Liquid Glass Theme Toggle (Sun/Moon Switch with Spring Animation) -->
        <button
          type="button"
          @click="toggleTheme"
          class="relative h-9 w-16 rounded-full p-1 border border-white/80 dark:border-white/15 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-inner active:scale-95 transition-all flex items-center cursor-pointer"
          :title="isDark ? 'Yorug\' rejimga o\'tish' : 'Qorong\'i rejimga o\'tish'"
        >
          <!-- Background track indicators -->
          <div class="absolute inset-0 flex justify-between items-center px-2 text-xs pointer-events-none opacity-60">
            <span class="text-[11px]">☀️</span>
            <span class="text-[11px]">🌙</span>
          </div>

          <!-- Floating Liquid Thumb with Spring Transition -->
          <div
            class="h-7 w-7 rounded-full flex items-center justify-center text-xs shadow-md border liquid-theme-switch z-10"
            :class="
              isDark
                ? 'translate-x-7 bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-400/40 text-white shadow-cyan-500/40'
                : 'translate-x-0 bg-white border-amber-300 text-amber-500 shadow-amber-500/20'
            "
          >
            <span v-if="isDark" class="text-[10px]">🌙</span>
            <span v-else class="text-[10px]">☀️</span>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { soundManager } from "../../composables/useAudio";
import { useTheme } from "../../composables/useTheme";

defineProps<{
  activeRole: "teacher" | "student";
  unreadCount?: number;
  isResultsActive?: boolean;
}>();

defineEmits<{
  (e: "changeRole", role: "teacher" | "student"): void;
  (e: "toggleNotifs"): void;
  (e: "viewResults"): void;
  (e: "goHome"): void;
}>();

const { isDark, toggleTheme } = useTheme();
const soundEnabled = ref(soundManager.enabled);

function toggleSound() {
  soundManager.enabled = !soundManager.enabled;
  soundEnabled.value = soundManager.enabled;
  if (soundEnabled.value) {
    soundManager.playClick();
  }
}
</script>
