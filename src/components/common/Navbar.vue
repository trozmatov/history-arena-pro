<template>
  <header class="sticky top-0 z-40 w-full border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-[#070d18]/70 backdrop-blur-2xl shadow-sm transition-colors duration-300">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5">
      <!-- Logo & App Name -->
      <div class="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0" @click="$emit('goHome')">
        <div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 shadow-md shadow-blue-500/25 border border-white/40 dark:border-white/20 text-white font-black text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">
          HA
        </div>
        <div class="min-w-0">
          <h1 class="text-xs sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
            History Arena
          </h1>
          <p class="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
            {{ activeRole === 'student' ? "O'quvchi Kabineti" : "Dars so'rovnomasi va reyting portali" }}
          </p>
        </div>
      </div>

      <!-- Actions Area: Minimalist Student Profile Pill & Liquid Theme Switch -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Student Profile Pill (Liquid Glass with Avatar & Name) -->
        <div
          v-if="studentStore.isStudentLoggedIn.value"
          class="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 dark:border-indigo-500/30 text-slate-900 dark:text-white text-xs font-bold backdrop-blur-xl shadow-sm shrink min-w-0"
        >
          <span class="text-sm sm:text-base shrink-0">{{ studentStore.studentAvatar.value || '🌱' }}</span>
          <span class="max-w-[100px] xs:max-w-[140px] sm:max-w-[200px] truncate text-indigo-700 dark:text-indigo-300 font-black tracking-tight">
            {{ studentStore.studentName.value }}
          </span>
        </div>

        <!-- Apple Liquid Glass Theme Toggle (Sun/Moon Switch with Spring Animation) -->
        <button
          type="button"
          @click="toggleTheme"
          class="relative h-9 w-16 rounded-full p-1 border border-white/80 dark:border-white/15 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-inner active:scale-95 transition-all flex items-center cursor-pointer shrink-0"
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
import { useTheme } from "../../composables/useTheme";
import { useStudentStore } from "../../composables/useStudentStore";

defineProps<{
  activeRole?: "teacher" | "student";
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
const studentStore = useStudentStore();
</script>
