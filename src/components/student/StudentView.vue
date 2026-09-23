<template>
  <div class="w-full flex-1 flex flex-col relative">
    <!-- Main Content Viewport -->
    <main
      class="flex-1 w-full mx-auto flex flex-col transition-all duration-300 overflow-x-hidden px-2.5 py-3 sm:p-6 pb-28 md:pb-6 md:pl-24"
      :class="currentSubview === 'tests' ? 'max-w-4xl' : 'max-w-xl'"
    >
      <Transition name="fade" mode="out-in">
        <!-- 1. HOME: Student Profile, Duels & Gamification -->
        <StudentProfile
          v-if="currentSubview === 'home'"
          key="student-profile"
          @nav-to-results="$emit('navToResults')"
          @nav-to-tests="currentSubview = 'tests'"
        />

        <!-- 2. TESTS: Anti-Cheat & Google Forms Exams Portal -->
        <StudentTestsView
          v-else-if="currentSubview === 'tests'"
          key="student-tests"
        />
      </Transition>
    </main>

    <!-- ========================================================
         RESPONSIVE NAVIGATION DOCK (Bottom on Mobile, Left on Desktop)
         Xuddi Teacher bo'limi kabi Liquid Glass Dock
         ======================================================== -->
    <aside
      class="fixed z-50 transition-all duration-300
             bottom-0 left-0 right-0 p-2 pb-3 pointer-events-none flex justify-center
             md:bottom-auto md:right-auto md:left-3.5 md:top-20 md:w-[72px] md:p-0 md:pointer-events-auto md:block"
    >
      <nav
        class="pointer-events-auto liquid-glass-dock shadow-2xl transition-all duration-300
               w-full max-w-xs rounded-3xl p-1.5 flex justify-around items-center
               md:w-[72px] md:flex-col md:justify-center md:gap-3 md:p-2 md:rounded-[2.25rem] md:border md:border-white/70 md:dark:border-white/10"
      >
        <!-- 1. Home Button -->
        <button
          type="button"
          @click="handleDockClick('home')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'home'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-transparent text-blue-600 dark:text-blue-300 font-black shadow-inner border border-blue-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Bosh sahifa / Shaxsiy profil"
        >
          <span
            v-if="currentSubview === 'home'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-blue-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-[11px] md:text-[10px] tracking-tight">Home</span>
        </button>

        <!-- 2. Tests Button -->
        <button
          type="button"
          @click="handleDockClick('tests')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'tests'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-transparent text-indigo-600 dark:text-indigo-300 font-black shadow-inner border border-indigo-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Imtihonlar va Testlar"
        >
          <span
            v-if="currentSubview === 'tests'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-indigo-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="text-[11px] md:text-[10px] tracking-tight">Tests</span>
        </button>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StudentProfile from "./StudentProfile.vue";
import StudentTestsView from "./StudentTestsView.vue";
import { soundManager } from "../../composables/useAudio";

const emit = defineEmits<{
  (e: "navToResults"): void;
}>();

const currentSubview = ref<"home" | "tests">("home");

function handleDockClick(subview: "home" | "tests") {
  try {
    soundManager.playClick();
  } catch (e) {}
  currentSubview.value = subview;
}
</script>
