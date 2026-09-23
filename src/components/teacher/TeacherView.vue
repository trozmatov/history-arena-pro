<template>
  <div
    class="h-screen max-h-[100dvh] w-full overflow-hidden flex flex-col relative select-none transition-colors duration-300"
    :class="isDark ? 'liquid-canvas-dark text-slate-100' : 'liquid-canvas-light text-slate-900'"
  >
    <!-- ==========================================
         TIER 1: STATUS BAR / HEADER (Top, Fixed)
         ========================================== -->
    <header
      class="z-30 flex-shrink-0 w-full border-b border-white/50 dark:border-white/10 bg-white/70 dark:bg-[#070d18]/70 backdrop-blur-2xl shadow-sm px-3 sm:px-6 py-2 transition-all duration-300"
      :class="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'
        ? (isSidebarExpanded ? 'md:pl-[272px]' : 'md:pl-[88px]')
        : ''"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        <!-- Left: Teacher Avatar & Identity with Sidebar Toggle -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Desktop Sidebar Toggle Button -->
          <button
            v-if="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'"
            type="button"
            @click="toggleSidebar"
            class="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition active:scale-95 cursor-pointer shadow-sm"
            :title="isSidebarExpanded ? 'Menyuni yig\'ish' : 'Menyuni kengaytirish'"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>

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
    <main
      class="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 pt-3 pb-28 md:pb-6 md:pr-4 custom-scrollbar transition-all duration-300"
      :class="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'
        ? (isSidebarExpanded ? 'md:pl-[272px]' : 'md:pl-[88px]')
        : 'md:pl-4'"
    >
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

          <!-- Tests Manager (Google Forms & Anti-Cheat) -->
          <TeacherTestsManager
            v-else-if="currentSubview === 'tests'"
            key="tests"
          />
        </Transition>
      </div>
    </main>

    <!-- ========================================================
         MOBILE NAVIGATION DOCK: 100% UNCHANGED for mobile screens (< md)
         ======================================================== -->
    <aside
      v-if="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'"
      class="block md:hidden fixed z-50 transition-all duration-300
             bottom-0 left-0 right-0 p-2 pb-3 pointer-events-none flex justify-center"
    >
      <nav
        class="pointer-events-auto liquid-glass-dock shadow-2xl transition-all duration-300
               w-full max-w-lg rounded-3xl p-1.5 flex justify-around items-center"
      >
        <!-- Tab 0: Dars / Boshqaruv (Setup) -->
        <button
          type="button"
          @click="handleTabClick('setup')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'setup'
              ? 'bg-gradient-to-t from-blue-500/20 via-indigo-500/15 to-transparent text-blue-600 dark:text-blue-300 font-black shadow-inner border border-blue-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Dars boshqaruvi"
        >
          <span
            v-if="currentSubview === 'setup'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-[10.5px] tracking-tight">Dars</span>
        </button>

        <!-- Tab 1: Davomat (Attendance) -->
        <button
          type="button"
          @click="handleTabClick('attendance')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'attendance'
              ? 'bg-gradient-to-t from-cyan-500/20 via-blue-500/15 to-transparent text-cyan-600 dark:text-cyan-300 font-black shadow-inner border border-cyan-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Davomat matritsasi"
        >
          <span
            v-if="currentSubview === 'attendance'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="m9 16 2 2 4-4"></path>
          </svg>
          <span class="text-[10.5px] tracking-tight">Davomat</span>
        </button>

        <!-- Tab 2: Statistika & Reyting (Analytics) -->
        <button
          type="button"
          @click="handleTabClick('stats')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'stats' || currentSubview === 'leaderboard'
              ? 'bg-gradient-to-t from-purple-500/20 via-indigo-500/15 to-transparent text-purple-600 dark:text-purple-300 font-black shadow-inner border border-purple-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Tahlil va Statistika"
        >
          <span
            v-if="currentSubview === 'stats' || currentSubview === 'leaderboard'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span class="text-[10.5px] tracking-tight">Statistika</span>
        </button>

        <!-- Tab 3: Testlar (Google Forms & Anti-Cheat Tests) -->
        <button
          type="button"
          @click="handleTabClick('tests')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'tests'
              ? 'bg-gradient-to-t from-blue-500/20 via-indigo-500/15 to-transparent text-indigo-600 dark:text-indigo-300 font-black shadow-inner border border-indigo-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Google Forms & Testlar"
        >
          <span
            v-if="currentSubview === 'tests'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span class="text-[10.5px] tracking-tight">Testlar</span>
        </button>

        <!-- Tab 4: Chellenjlar (Challenges / Duels) -->
        <button
          type="button"
          @click="handleTabClick('challenge')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'challenge'
              ? 'bg-gradient-to-t from-emerald-500/20 via-teal-500/15 to-transparent text-emerald-600 dark:text-emerald-300 font-black shadow-inner border border-emerald-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="Chellenjlar va Duellar"
        >
          <span
            v-if="currentSubview === 'challenge'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path>
            <path d="m13 19 6 2 2-6-4.5-4.5"></path>
            <path d="m16 8 2-2"></path>
            <path d="m19 11 2-2"></path>
          </svg>
          <span class="text-[10.5px] tracking-tight">Chellenj</span>
        </button>

        <!-- Tab 5: CRM & O'quvchilar (Students) -->
        <button
          type="button"
          @click="handleTabClick('students')"
          class="pointer-events-auto cursor-pointer flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 active:scale-95 group relative overflow-hidden select-none"
          :class="
            currentSubview === 'students'
              ? 'bg-gradient-to-t from-indigo-500/20 via-purple-500/15 to-transparent text-indigo-600 dark:text-indigo-300 font-black shadow-inner border border-indigo-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
          "
          title="CRM & O'quvchilar bazasi"
        >
          <span
            v-if="currentSubview === 'students'"
            class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          ></span>
          <svg class="h-5 w-5 mb-0.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span class="text-[10.5px] tracking-tight">CRM</span>
        </button>
      </nav>
    </aside>

    <!-- ========================================================
         DESKTOP COLLAPSIBLE SIDEBAR: Ochilib-yopiluvchi yon menyu (>= md)
         ======================================================== -->
    <aside
      v-if="teacherStore.isTeacherLoggedIn.value && currentSubview !== 'game'"
      class="hidden md:flex flex-col fixed top-0 bottom-0 left-0 z-40
             bg-white/95 dark:bg-[#070d18]/95 backdrop-blur-2xl
             border-r border-slate-200/80 dark:border-white/10
             transition-all duration-300 ease-in-out shadow-2xl select-none"
      :class="isSidebarExpanded ? 'w-64' : 'w-[72px]'"
    >
      <!-- 1. Header: Logo & Toggle Button -->
      <div
        class="h-14 flex items-center border-b border-slate-200/80 dark:border-white/10 px-3 transition-all duration-300 shrink-0"
        :class="isSidebarExpanded ? 'justify-between' : 'justify-center'"
      >
        <!-- Expanded Brand Info -->
        <div
          v-if="isSidebarExpanded"
          class="flex items-center gap-2.5 min-w-0 cursor-pointer overflow-hidden"
          @click="handleTabClick('setup')"
        >
          <div class="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/25 shrink-0">
            🏛️
          </div>
          <div class="min-w-0 truncate">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">History Arena</span>
              <span class="text-[9px] px-1 py-0.2 rounded font-black bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">PRO</span>
            </div>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">O'qituvchi boshqaruvi</p>
          </div>
        </div>

        <!-- Collapsed Icon Clickable -->
        <button
          v-else
          type="button"
          @click="toggleSidebar"
          class="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/25 cursor-pointer hover:scale-105 transition-transform"
          title="Menyuni kengaytirish"
        >
          🏛️
        </button>

        <!-- Toggle Collapse/Expand Button -->
        <button
          v-if="isSidebarExpanded"
          type="button"
          @click="toggleSidebar"
          class="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition active:scale-95 cursor-pointer shrink-0"
          title="Menyuni yig'ish"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
          </svg>
        </button>
      </div>

      <!-- 2. Navigation Items (Scrollable) -->
      <nav class="flex-1 overflow-y-auto custom-scrollbar py-3 px-2 flex flex-col gap-1.5">
        <!-- Tab 0: Dars (Setup) -->
        <button
          type="button"
          @click="handleTabClick('setup')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'setup'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Dars boshqaruvi'"
        >
          <span
            v-if="currentSubview === 'setup'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Dars boshqaruvi</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Sinf va o'yin sozlamalari</div>
          </div>
        </button>

        <!-- Tab 1: Davomat (Attendance) -->
        <button
          type="button"
          @click="handleTabClick('attendance')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'attendance'
              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Davomat matritsasi'"
        >
          <span
            v-if="currentSubview === 'attendance'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="m9 16 2 2 4-4"></path>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Davomat matritsasi</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Yo'qlama & ishtirok</div>
          </div>
        </button>

        <!-- Tab 2: Statistika (Stats & Leaderboard) -->
        <button
          type="button"
          @click="handleTabClick('stats')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'stats' || currentSubview === 'leaderboard'
              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Statistika & Reyting'"
        >
          <span
            v-if="currentSubview === 'stats' || currentSubview === 'leaderboard'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-purple-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Statistika & Reyting</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Tahlil va peshqadamlar</div>
          </div>
        </button>

        <!-- Tab 3: Testlar (Tests Manager) -->
        <button
          type="button"
          @click="handleTabClick('tests')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'tests'
              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Testlar & Imtihonlar'"
        >
          <span
            v-if="currentSubview === 'tests'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Testlar & Imtihonlar</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Google Forms & Studio</div>
          </div>
        </button>

        <!-- Tab 4: Chellenj (Challenge & Duels) -->
        <button
          type="button"
          @click="handleTabClick('challenge')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'challenge' || currentSubview === 'ai-exam'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Chellenj & Duellar'"
        >
          <span
            v-if="currentSubview === 'challenge' || currentSubview === 'ai-exam'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 17.5 3 6V3h3l11.5 11.5"></path>
              <path d="m13 19 6 2 2-6-4.5-4.5"></path>
              <path d="m16 8 2-2"></path>
              <path d="m19 11 2-2"></path>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Chellenj & Duellar</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">AI Arena & bellashuv</div>
          </div>
        </button>

        <!-- Tab 5: CRM (Students) -->
        <button
          type="button"
          @click="handleTabClick('students')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'students'
              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'CRM & O\'quvchilar'"
        >
          <span
            v-if="currentSubview === 'students'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <svg class="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">CRM & O'quvchilar</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Bazalar & profillar</div>
          </div>
        </button>

        <!-- Divider -->
        <div v-if="isSidebarExpanded" class="my-1.5 border-t border-slate-200/60 dark:border-white/10 px-2 pt-2">
          <span class="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Qo'shimcha bo'limlar</span>
        </div>
        <div v-else class="my-1 border-t border-slate-200/60 dark:border-white/10"></div>

        <!-- Tab 6: Bozor & Do'kon (Market) -->
        <button
          type="button"
          @click="handleNav('market')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'market'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Bozor & Do\'kon'"
        >
          <span
            v-if="currentSubview === 'market'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <span class="text-base leading-none">🛍️</span>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Bozor & Do'kon</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Sovg'alar & ballar</div>
          </div>
        </button>

        <!-- Tab 7: Jonli Chat -->
        <button
          type="button"
          @click="handleNav('chat')"
          class="w-full rounded-xl transition-all duration-200 group relative flex items-center cursor-pointer select-none text-left"
          :class="[
            isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'p-2.5 justify-center',
            currentSubview === 'chat'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 font-bold border border-blue-500/30 shadow-inner'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
          :title="isSidebarExpanded ? '' : 'Jonli Chat'"
        >
          <span
            v-if="currentSubview === 'chat'"
            class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500 shadow-sm"
          ></span>
          <div class="h-6 w-6 flex items-center justify-center shrink-0">
            <span class="text-base leading-none">💬</span>
          </div>
          <div v-if="isSidebarExpanded" class="min-w-0 flex-1">
            <div class="text-xs font-bold leading-tight truncate">Jonli Muloqot</div>
            <div class="text-[10px] text-slate-400 font-normal leading-tight truncate">Sinfdoshlar chati</div>
          </div>
        </button>
      </nav>

      <!-- 3. Footer: User Status & Quick Collapse -->
      <div class="p-2 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2 shrink-0">
        <div
          v-if="isSidebarExpanded"
          class="flex items-center justify-between w-full p-1.5 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div class="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              👨‍🏫
            </div>
            <div class="min-w-0">
              <div class="text-xs font-black truncate text-slate-800 dark:text-white">
                {{ teacherStore.teacherName.value || "Ustoz" }}
              </div>
              <div class="flex items-center gap-1">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span class="text-[9.5px] text-emerald-500 font-bold">Faol</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="teacherStore.logoutTeacher()"
            class="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition active:scale-95 cursor-pointer shrink-0"
            title="Chiqish"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        <button
          v-else
          type="button"
          @click="toggleSidebar"
          class="w-full py-2 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-xl transition cursor-pointer"
          title="Menyuni kengaytirish"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </button>
      </div>
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
import TeacherTestsManager from "./TeacherTestsManager.vue";

const props = defineProps<{
  unreadCount?: number;
  initialSubview?: "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates" | "tests";
}>();

const emit = defineEmits<{
  (e: "changeRole", role: "teacher" | "student"): void;
  (e: "toggleNotifs"): void;
  (e: "viewResults"): void;
}>();

const teacherStore = useTeacherStore();
const { isDark, toggleTheme } = useTheme();

// Desktop Collapsible Sidebar State (persisted in localStorage)
const isSidebarExpanded = ref<boolean>(
  typeof window !== "undefined" && localStorage.getItem("ha_teacher_sidebar_expanded") !== null
    ? localStorage.getItem("ha_teacher_sidebar_expanded") === "true"
    : (typeof window !== "undefined" ? window.innerWidth >= 1200 : true)
);

function toggleSidebar() {
  isSidebarExpanded.value = !isSidebarExpanded.value;
  try {
    localStorage.setItem("ha_teacher_sidebar_expanded", String(isSidebarExpanded.value));
    soundManager.playClick();
  } catch (e) {}
}

const soundEnabled = ref(soundManager.enabled);
function toggleSound() {
  soundManager.enabled = !soundManager.enabled;
  soundEnabled.value = soundManager.enabled;
  if (soundEnabled.value) {
    soundManager.playClick();
  }
}

type TeacherSubview = "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates" | "tests";

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

function handleTabClick(tab: "attendance" | "stats" | "challenge" | "setup" | "students" | "tests") {
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
