<template>
  <header class="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
      <!-- Logo & App Name -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 text-white font-extrabold text-lg">
          HA
        </div>
        <div>
          <h1 class="text-base font-extrabold tracking-tight text-white sm:text-lg flex items-center gap-1.5">
            History Arena <span class="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30">PRO</span>
          </h1>
          <p class="text-[11px] text-slate-400 hidden sm:block">Dars so'rovnomasi va reyting portali</p>
        </div>
      </div>

      <!-- Role Switcher & Actions -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Role Toggle Tabs -->
        <div class="flex rounded-2xl bg-slate-900/80 p-1 border border-white/10 shadow-inner">
          <button
            @click="$emit('changeRole', 'teacher')"
            class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
            :class="
              activeRole === 'teacher'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            "
          >
            <span>👨‍🏫</span>
            <span class="hidden md:inline">O'qituvchi</span>
          </button>
          <button
            @click="$emit('changeRole', 'student')"
            class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
            :class="
              activeRole === 'student'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            "
          >
            <span>🎓</span>
            <span class="hidden md:inline">O'quvchi</span>
          </button>
        </div>

        <!-- Sound Toggle -->
        <button
          @click="toggleSound"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:border-white/20 hover:text-white active:scale-95"
          :title="soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o\'chirilgan'"
        >
          <span v-if="soundEnabled" class="text-sm">🔊</span>
          <span v-else class="text-sm">🔇</span>
        </button>

        <!-- Notification Bell (Teacher) -->
        <div v-if="activeRole === 'teacher'" class="relative">
          <button
            @click="$emit('toggleNotifs')"
            class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:border-white/20 hover:text-white active:scale-95"
            :class="{ 'animate-bounce': unreadCount > 0 }"
          >
            <span class="text-sm">🔔</span>
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-slate-950"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { soundManager } from "../../composables/useAudio";

defineProps<{
  activeRole: "teacher" | "student";
  unreadCount?: number;
}>();

defineEmits<{
  (e: "changeRole", role: "teacher" | "student"): void;
  (e: "toggleNotifs"): void;
}>();

const soundEnabled = ref(soundManager.enabled);

function toggleSound() {
  soundManager.enabled = !soundManager.enabled;
  soundEnabled.value = soundManager.enabled;
  if (soundEnabled.value) {
    soundManager.playClick();
  }
}
</script>
