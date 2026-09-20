<template>
  <div
    class="h-screen max-h-[100dvh] w-full overflow-hidden flex flex-col relative select-none transition-colors duration-300"
    :class="isDark ? 'liquid-canvas-dark text-slate-100' : 'liquid-canvas-light text-slate-900'"
  >
    <!-- ==========================================
         TIER 1: STATUS BAR / HEADER (Top, Fixed)
         ========================================== -->
    <header class="z-40 flex-shrink-0 w-full border-b border-white/50 dark:border-white/10 bg-white/70 dark:bg-[#070d18]/70 backdrop-blur-2xl shadow-sm px-3 sm:px-6 py-2">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        <!-- Left: Teacher Avatar & Identity (Cleaned: No Coins/Lvl) -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Avatar with Liquid Glow Ring -->
          <div class="relative group cursor-pointer" @click="handleTabClick('setup')">
            <div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white font-black text-base sm:text-lg shadow-md shadow-blue-500/25 border border-white/40 dark:border-white/20 group-hover:scale-105 transition-transform">
              <span>👨‍🏫</span>
            </div>
            <!-- Online status dot -->
            <span class="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#070d18] shadow-sm"></span>
          </div>

          <!-- Teacher identity -->
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <h1 class="text-xs sm:text-sm font-black tracking-tight truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] text-slate-900 dark:text-white">
                {{ teacherStore.teacherName.value || "Ustoz" }}
              </h1>
              <!-- PRO Badge -->
              <span class="rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.2 text-[9px] font-black text-cyan-600 dark:text-cyan-300 uppercase tracking-wide shrink-0">
                PRO
              </span>
            </div>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate hidden xs:block">
              O'qituvchi portali
            </p>
          </div>
        </div>

        <!-- Right: Actions, Notifications & Liquid Glass Theme Toggle -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <!-- Role Switcher (Teacher -> Student) -->
          <button
            type="button"
            @click="$emit('changeRole', 'student')"
            class="h-8 sm:h-9 px-2 sm:px-3 rounded-xl sm:rounded-2xl text-[11px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 active:scale-95 transition flex items-center gap-1 cursor-pointer shadow-sm backdrop-blur-xl shrink-0"
            title="O'quvchi kabinetiga o'tish"
          >
            <span>🎓</span>
            <span class="hidden xs:inline">O'quvchi</span>
          </button>

          <!-- Natijalar / Results Button -->
          <button
            type="button"
            @click="$emit('viewResults')"
            class="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl sm:rounded-2xl text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 active:scale-95 transition flex items-center gap-1 cursor-pointer shadow-sm backdrop-blur-xl shrink-0"
            title="Ommaviy natijalar"
          >
            <span>🏆</span>
            <span class="hidden sm:inline">Natijalar</span>
          </button>

          <!-- Sound Toggle -->
          <button
            type="button"
            @click="toggleSound"
            class="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl sm:rounded-2xl border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95 transition shadow-sm backdrop-blur-xl shrink-0 cursor-pointer"
            :title="soundEnabled ? 'Ovoz yoqilgan' : 'Ovoz o\'chirilgan'"
          >
            <span v-if="soundEnabled" class="text-xs sm:text-sm">🔊</span>
            <span v-else class="text-xs sm:text-sm">🔇</span>
          </button>

          <!-- Notifications Bell with Unread Badge -->
          <div class="relative shrink-0">
            <button
              type="button"
              @click="$emit('toggleNotifs')"
              class="relative h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl sm:rounded-2xl border border-white/70 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/10 active:scale-95 transition shadow-sm backdrop-blur-xl cursor-pointer"
              :class="{ 'animate-bounce': (unreadCount || 0) > 0 }"
              title="Bildirishnomalar va Eslatmalar"
            >
              <span class="text-xs sm:text-sm">🔔</span>
              <span
                v-if="(unreadCount || 0) > 0"
                class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#070d18] shadow-md animate-pulse"
              >
                {{ unreadCount }}
              </span>
            </button>
          </div>

          <!-- Liquid Glass Theme Toggle (Sun/Moon Switch with Spring Animation) -->
          <button
            type="button"
            @click="toggleTheme"
            class="relative h-8 w-14 sm:h-9 sm:w-16 rounded-full p-0.5 sm:p-1 border border-white/80 dark:border-white/15 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-inner active:scale-95 transition-all flex items-center cursor-pointer shrink-0"
            :title="isDark ? 'Yorug\' rejimga o\'tish' : 'Qorong\'i rejimga o\'tish'"
          >
            <!-- Background track indicators -->
            <div class="absolute inset-0 flex justify-between items-center px-1.5 sm:px-2 text-xs pointer-events-none opacity-60">
              <span class="text-[10px] sm:text-[11px]">☀️</span>
              <span class="text-[10px] sm:text-[11px]">🌙</span>
            </div>

            <!-- Floating Liquid Thumb with Spring Transition -->
            <div
              class="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs shadow-md border liquid-theme-switch z-10"
              :class="
                isDark
                  ? 'translate-x-6 sm:translate-x-7 bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-400/40 text-white shadow-cyan-500/40'
                  : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-orange-500 border-amber-300 text-white shadow-amber-500/40'
              "
            >
              <span v-if="isDark">🌙</span>
              <span v-else>☀️</span>
            </div>
          </button>
        </div>
      </div>
    </header>

    <!-- ====================================================
         TIER 2: MAIN SCROLLABLE VIEWPORT (Middle, Scrollable)
         ==================================================== -->
    <main class="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 pt-3 pb-28 md:pb-6 md:pl-24 md:pr-4 custom-scrollbar transition-all duration-300">
      <!-- 1. Teacher Not Logged In State -->
      <div v-if="!teacherStore.isTeacherLoggedIn.value" class="h-full flex items-center justify-center py-6">
        <TeacherLogin />
      </div>

      <!-- 2. Active Teacher Subview -->
      <div v-else class="w-full max-w-5xl mx-auto">

        <Transition name="fade" mode="out-in">
          <!-- Main Classroom Manager Setup -->
          <TeacherSetup
            v-if="currentSubview === 'setup'"
            key="setup"
            @start-game="handleStartGame"
            @nav="handleNav"
          />

          <!-- Live Game Arena -->
          <GameArena
            v-else-if="currentSubview === 'game'"
            key="game"
            @go-home="currentSubview = 'setup'"
            @game-finished="currentSubview = 'results'"
          />

          <!-- Results View -->
          <ResultsView
            v-else-if="currentSubview === 'results'"
            key="results"
            @back-to-game="currentSubview = 'game'"
            @new-lesson="currentSubview = 'setup'"
          />

          <!-- Tab 1: Attendance Matrix -->
          <AttendanceMatrix
            v-else-if="currentSubview === 'attendance'"
            key="attendance"
            @back="currentSubview = 'setup'"
          />


          <!-- Tab 3: Stats Analytics (now incorporates Reyting / Leaderboard) -->
          <StatsAnalytics
            v-else-if="currentSubview === 'stats' || currentSubview === 'leaderboard'"
            key="stats"
            :initial-tab="currentSubview === 'leaderboard' ? 'leaderboard' : 'lessons'"
            @back="currentSubview = 'setup'"
          />

          <!-- Tab 4: AI Challenge & Duels -->
          <AIChallengeManager
            v-else-if="currentSubview === 'challenge' || currentSubview === 'ai-exam'"
            key="challenge"
            @back="currentSubview = 'setup'"
          />

          <!-- CRM Student Manager -->
          <StudentManager
            v-else-if="currentSubview === 'students'"
            key="students"
            @back="currentSubview = 'setup'"
            @nav="handleNav"
          />

          <!-- Certificates Manager -->
          <CertificatesManager
            v-else-if="currentSubview === 'certificates'"
            key="certificates"
            @back="currentSubview = 'setup'"
            @open-public-results="$emit('viewResults')"
          />

          <!-- Market Manager -->
          <MarketManager
            v-else-if="currentSubview === 'market'"
            key="market"
            @back="currentSubview = 'setup'"
          />

          <!-- Live Chat -->
          <LiveChat
            v-else-if="currentSubview === 'chat'"
            key="chat"
            @back="currentSubview = 'setup'"
          />
        </Transition>
      </div>
    </main>

    <!-- ========================================================
         TIER 3: RESPONSIVE NAVIGATION DOCK (Bottom on Mobile, Left on Desktop/Tablet)
         ======================================================== -->
    <aside
      v-if="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'"
      class="fixed z-50 transition-all duration-300
             bottom-0 left-0 right-0 p-2 pb-3 pointer-events-none flex justify-center
             md:bottom-auto md:right-auto md:left-3.5 md:top-20 md:w-[72px] md:p-0 md:pointer-events-auto md:block"
    >
      <nav
        class="pointer-events-auto liquid-glass-dock shadow-2xl transition-all duration-300
               w-full max-w-lg rounded-3xl p-1.5 flex justify-around items-center
               md:w-[72px] md:flex-col md:justify-center md:gap-2 md:p-2 md:rounded-[2.25rem] md:border md:border-white/70 md:dark:border-white/10"
      >
        <!-- Tab 0: Dars / Boshqaruv (Setup) -->
        <button
          type="button"
          @click="handleTabClick('setup')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'setup'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-transparent text-blue-600 dark:text-blue-300 font-black shadow-inner border border-blue-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Dars boshqaruvi"
        >
          <span
            v-if="currentSubview === 'setup'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-blue-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-[10.5px] md:text-[10px] tracking-tight">Dars</span>
        </button>

        <!-- Tab 1: Davomat (Attendance) -->
        <button
          type="button"
          @click="handleTabClick('attendance')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'attendance'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent text-cyan-600 dark:text-cyan-300 font-black shadow-inner border border-cyan-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Davomat matritsasi"
        >
          <!-- Active specular glow highlight -->
          <span
            v-if="currentSubview === 'attendance'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="m9 16 2 2 4-4"></path>
          </svg>
          <span class="text-[10.5px] md:text-[10px] tracking-tight">Davomat</span>
        </button>

        <!-- Tab 2: Statistika & Reyting (Analytics) -->
        <button
          type="button"
          @click="handleTabClick('stats')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'stats' || currentSubview === 'leaderboard'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-transparent text-purple-600 dark:text-purple-300 font-black shadow-inner border border-purple-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Tahlil va Statistika"
        >
          <span
            v-if="currentSubview === 'stats' || currentSubview === 'leaderboard'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-purple-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span class="text-[10.5px] md:text-[10px] tracking-tight">Statistika</span>
        </button>

        <!-- Tab 4: Chellenjlar (Challenges / Duels) -->
        <button
          type="button"
          @click="handleTabClick('challenge')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'challenge'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent text-emerald-600 dark:text-emerald-300 font-black shadow-inner border border-emerald-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Chellenjlar va Duellar"
        >
          <span
            v-if="currentSubview === 'challenge'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-emerald-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path>
            <path d="m13 19 6 2 2-6-4.5-4.5"></path>
            <path d="m16 8 2-2"></path>
            <path d="m19 11 2-2"></path>
          </svg>
          <span class="text-[10.5px] md:text-[10px] tracking-tight">Chellenj</span>
        </button>

        <!-- Tab 5: CRM & O'quvchilar (Students) -->
        <button
          type="button"
          @click="handleTabClick('students')"
          class="pointer-events-auto cursor-pointer flex-1 md:flex-none md:w-full flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'students'
              ? 'bg-gradient-to-t md:bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-transparent text-indigo-600 dark:text-indigo-300 font-black shadow-inner border border-indigo-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="CRM & O'quvchilar bazasi"
        >
          <span
            v-if="currentSubview === 'students'"
            class="absolute inset-x-0 top-0 md:inset-y-0 md:left-0 md:w-[3px] md:h-full h-[2px] bg-gradient-to-r md:bg-gradient-to-b from-transparent via-indigo-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="text-[10.5px] md:text-[10px] tracking-tight">CRM</span>
        </button>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useTeacherStore } from "../../composables/useTeacherStore";
import { useTheme } from "../../composables/useTheme";
import { soundManager } from "../../composables/useAudio";

// Teacher Sub-components
import TeacherLogin from "./TeacherLogin.vue";
import TeacherSetup from "./TeacherSetup.vue";
import GameArena from "./GameArena.vue";
import ResultsView from "./ResultsView.vue";
import AttendanceMatrix from "./AttendanceMatrix.vue";
import StatsAnalytics from "./StatsAnalytics.vue";
import AIChallengeManager from "./AIChallengeManager.vue";
import StudentManager from "./StudentManager.vue";
import CertificatesManager from "./CertificatesManager.vue";
import MarketManager from "./MarketManager.vue";
import LiveChat from "./LiveChat.vue";

const props = defineProps<{
  unreadCount?: number;
  initialSubview?: "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates";
}>();

const emit = defineEmits<{
  (e: "changeRole", role: "teacher" | "student"): void;
  (e: "toggleNotifs"): void;
  (e: "viewResults"): void;
}>();

const teacherStore = useTeacherStore();
const { isDark, toggleTheme } = useTheme();

const soundEnabled = ref(soundManager.enabled);
function toggleSound() {
  soundManager.enabled = !soundManager.enabled;
  soundEnabled.value = soundManager.enabled;
  if (soundEnabled.value) {
    soundManager.playClick();
  }
}

type TeacherSubview = "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates";

const currentSubview = ref<TeacherSubview>(props.initialSubview || "setup");

watch(
  () => props.initialSubview,
  (newVal) => {
    if (newVal) {
      currentSubview.value = newVal;
    }
  }
);

// React to global student doska navigation request
watch(
  () => teacherStore.requestedTeacherSubview.value,
  (newSub) => {
    if (newSub) {
      currentSubview.value = newSub as TeacherSubview;
      teacherStore.requestedTeacherSubview.value = null;
    }
  }
);

function handleTabClick(tab: "attendance" | "stats" | "challenge" | "setup" | "students") {
  try {
    soundManager.playClick();
  } catch (e) {}
  currentSubview.value = tab;
}

function handleNav(view: any) {
  soundManager.playClick();
  currentSubview.value = view;
}

function handleStartGame() {
  soundManager.playClick();
  currentSubview.value = "game";
}

function getSubviewTitle(view: TeacherSubview): string {
  switch (view) {
    case "attendance": return "Davomat Matritsasi";
    case "leaderboard":
    case "stats": return "Statistika & Reyting";
    case "challenge":
    case "ai-exam": return "AI Chellenj & Imtihonlar";
    case "students": return "CRM & O'quvchilar Boshqaruvi";
    case "certificates": return "Sertifikatlar & Diplomlar";
    case "market": return "Bozor & Do'kon";
    case "chat": return "Jonli Chat";
    case "results": return "Dars Natijalari";
    default: return "Boshqaruv";
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
