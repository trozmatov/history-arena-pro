<template>
  <div class="space-y-4 w-full max-w-xl mx-auto pb-8 overflow-x-hidden px-1 sm:px-0 box-border">
    <!-- 0. Realtime Incoming Duel Alert (Red Pulsing Glow Banner) -->
    <Transition name="fade">
      <div
        v-if="studentStore.incomingDuel.value"
        class="w-full rounded-3xl border-2 border-rose-500 bg-gradient-to-r from-rose-950/95 via-red-900/90 to-rose-950/95 p-4 sm:p-5 shadow-2xl shadow-rose-600/40 backdrop-blur-2xl relative overflow-hidden animate-pulse-border ring-4 ring-rose-500/20 box-border"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-xl shadow-lg shadow-rose-600/50 animate-bounce">
              ⚔️
            </div>
            <div class="min-w-0 truncate">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  DIQQAT: Duel!
                </span>
                <span class="text-[11px] font-bold text-amber-300">
                  +15 🪙 Tikilgan!
                </span>
              </div>
              <h3 class="text-sm sm:text-base font-black text-white mt-0.5 truncate">
                <span class="text-rose-300 font-extrabold">{{ studentStore.incomingDuel.value.challenger }}</span> sizni duelga chorladi!
              </h3>
              <p class="text-[11px] text-rose-200/80 truncate">
                Turi: <b class="text-white">{{ studentStore.incomingDuel.value.type === 'live' ? '🔥 Jonli Doskada' : '📊 Dars Natijasi' }}</b> • {{ studentStore.incomingDuel.value.time }}
              </p>
            </div>
          </div>

          <!-- Actions: Accept or Decline -->
          <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              @click="handleDeclineDuel"
              class="rounded-xl border border-rose-400/30 bg-black/40 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-black/60 active:scale-95 transition"
            >
              Rad etish ✖️
            </button>
            <button
              type="button"
              @click="handleAcceptDuel"
              class="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 active:scale-95 transition flex items-center gap-1"
            >
              <span>Qabul Qilish ⚔️</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Gamer Hero Card -->
    <div class="w-full rounded-3xl border border-white/15 bg-gradient-to-b from-indigo-950/60 via-slate-900/80 to-slate-950 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl text-center space-y-4 relative overflow-hidden box-border">
      <!-- Ambient Glow -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Avatar & Crown -->
      <div class="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-purple-600/30 text-4xl">
        {{ studentStore.studentAvatar.value }}
        <span class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white ring-2 ring-slate-950 font-black">
          ✓
        </span>
      </div>

      <!-- Name & Current Level -->
      <div class="px-2">
        <h2 class="text-xl sm:text-3xl font-black text-white tracking-tight break-words">{{ studentStore.studentName.value }}</h2>
        <div class="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 px-3.5 py-1 text-xs font-black text-indigo-300 mt-1.5 shadow-sm">
          <span>Daraja:</span> <span>{{ studentStore.studentLevel.value }}</span>
        </div>
      </div>

      <!-- Level Progression Bar -->
      <div class="rounded-2xl border border-white/10 bg-black/40 p-3 text-left space-y-1.5">
        <div class="flex flex-col sm:flex-row sm:justify-between text-[11px] font-extrabold text-slate-400 gap-0.5">
          <span>Keyingi unvongacha:</span>
          <span class="text-indigo-300 font-bold">{{ levelProgress.nextLevel }}</span>
        </div>
        <div class="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden shadow-inner">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            :style="{ width: `${levelProgress.percent}%` }"
          ></div>
        </div>
      </div>

      <!-- Quick Duel Button (Wrap-friendly on mobile) -->
      <button
        type="button"
        @click="showDuelModal = true"
        class="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-3 px-3 text-xs font-black uppercase text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 active:scale-95 transition text-center leading-snug break-words"
      >
        <span class="text-base">⚔️</span> <span>Boshqa o'quvchini Duelga chorlash (+15 🪙)</span>
      </button>
    </div>

    <!-- 1. Barcha Kitoblar O'zlashtirilishi (PieChart Cardbox) -->
    <div class="w-full glass-card rounded-3xl p-4 sm:p-5 border-white/10 space-y-4 box-border overflow-hidden">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">📚</span>
          <span class="text-xs font-black uppercase tracking-wider text-slate-200">
            Barcha Kitoblar O'zlashtirilishi
          </span>
        </div>
        <span class="rounded-lg px-2.5 py-0.5 text-[10px] font-bold border bg-indigo-500/20 border-indigo-500/30 text-indigo-300">
          O'rtacha: {{ allBooksData.overallAverage }}%
        </span>
      </div>

      <!-- Visual Donut Center + All 11 Books Compact Grid -->
      <div class="flex flex-col sm:flex-row items-center gap-4 pt-1">
        <!-- Sleek SVG Donut Radial Summary -->
        <div class="relative flex items-center justify-center shrink-0">
          <svg class="w-28 h-28 transform -rotate-90">
            <!-- Background track -->
            <circle
              cx="56"
              cy="56"
              r="44"
              stroke="rgba(255,255,255,0.08)"
              stroke-width="10"
              fill="transparent"
            />
            <!-- Progress arc -->
            <circle
              cx="56"
              cy="56"
              r="44"
              stroke="url(#donut-grad)"
              stroke-width="10"
              stroke-linecap="round"
              fill="transparent"
              :stroke-dasharray="276.46"
              :stroke-dashoffset="276.46 - (276.46 * allBooksData.overallAverage) / 100"
              class="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="50%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <!-- Center Text in Donut -->
          <div class="absolute flex flex-col items-center justify-center text-center">
            <span class="text-xl font-black text-white tabular-nums">{{ allBooksData.overallAverage }}%</span>
            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400">Umumiy</span>
          </div>
        </div>

        <!-- 11 Books Compact Cards Grid (2 cols mobile, 3 cols desktop) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 w-full flex-1">
          <div
            v-for="b in allBooksData.books"
            :key="b.id"
            class="rounded-xl border p-2 transition flex items-center justify-between gap-1.5 select-none"
            :class="
              b.isCurrent
                ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-600/15 ring-1 ring-indigo-500/40'
                : 'bg-black/30 border-white/5 hover:border-white/15'
            "
          >
            <div class="min-w-0 truncate">
              <div class="flex items-center gap-1">
                <span class="text-xs font-black text-white truncate">{{ b.short }}</span>
                <span v-if="b.isCurrent" class="text-[9px]" title="Hozirgi o'rganilayotgan kitob">⭐</span>
              </div>
              <div class="text-[9px] text-slate-400 truncate">
                {{ (b.lessonsCount || b.testsCount) > 0 ? (b.lessonsCount || b.testsCount) + ' ta dars' : 'boshlanmagan' }}
              </div>
            </div>

            <!-- Percent Badge -->
            <div
              class="px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums shrink-0 border"
              :class="b.badgeClass"
            >
              {{ b.percent }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 & 3. Oylik Davomat va Keyingi Dars Vaqti (2 Ustun) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full box-border">
      <!-- 2. Oylik Davomat Kartochkasi (Strict Calendar Month) -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-white/10 space-y-3 box-border overflow-hidden">
        <div class="flex items-center justify-between flex-wrap gap-1">
          <span class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>📅</span> <span>{{ attendance.monthName }} Davomati</span>
          </span>
          <span class="text-base font-black text-emerald-400 tabular-nums">{{ attendance.percent }}%</span>
        </div>

        <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2">
            <div class="text-[10px] text-slate-400">Keldi</div>
            <div class="font-black text-emerald-400 mt-0.5 text-sm">{{ attendance.present }} ta</div>
          </div>
          <div class="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2">
            <div class="text-[10px] text-slate-400">Sababli</div>
            <div class="font-black text-amber-300 mt-0.5 text-sm">{{ attendance.excused }} ta</div>
          </div>
          <div class="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2">
            <div class="text-[10px] text-slate-400">Sababsiz</div>
            <div class="font-black text-rose-400 mt-0.5 text-sm">{{ attendance.unexcused }} ta</div>
          </div>
        </div>

        <div class="text-[11px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-white/5">
          <span>Jami: <b class="text-white">{{ attendance.total }} dars</b></span>
          <span class="font-bold text-indigo-300 text-[10px]">{{ attendance.badge }}</span>
        </div>
      </div>

      <!-- 3. Keyingi Dars Vaqti -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-white/10 space-y-3 box-border overflow-hidden">
        <div class="flex items-center justify-between flex-wrap gap-1">
          <span class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>⏰</span> <span>Keyingi Dars</span>
          </span>
          <span class="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300 truncate max-w-[140px]">
            {{ schedule.groupName }}
          </span>
        </div>

        <div class="bg-black/40 rounded-2xl border border-white/5 p-3 space-y-1">
          <div class="text-sm font-black text-white flex items-center gap-1.5">
            <span>🔔</span> <span class="break-words">{{ schedule.relativeText }}</span>
          </div>
          <div class="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span>🏛️ Xona: <b class="text-slate-200">{{ schedule.room }}</b></span>
            <span>•</span>
            <span>Vaqt: <b class="text-slate-200">{{ schedule.time }}</b></span>
          </div>
        </div>

        <div class="text-[10px] text-slate-500 truncate pt-0.5">
          Jadval: {{ schedule.days.join(', ') }}
        </div>
      </div>
    </div>

    <!-- Monthly Stats & Chart Section -->
    <div class="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4 box-border overflow-hidden">
      <!-- Month Buttons Selector -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400">
          Oylik Natijalar
        </div>
        <div v-if="monthKeys.length > 0" class="flex gap-1.5 overflow-x-auto pb-1 max-w-[240px] custom-scrollbar">
          <button
            v-for="key in monthKeys"
            :key="key"
            type="button"
            @click="studentStore.activeMonthKey.value = key; drawChart();"
            class="rounded-xl px-3 py-1 text-[11px] font-bold whitespace-nowrap transition"
            :class="
              studentStore.activeMonthKey.value === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            "
          >
            {{ studentStore.groupedMonths.value[key]?.label }}
          </button>
        </div>
      </div>

      <!-- 4 High-Contrast Stat Cards (Wrapped for small screens) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="glass-card rounded-2xl p-3 text-center">
          <div class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 truncate">Jami Darslar</div>
          <div class="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">{{ monthData.tests }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center">
          <div class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 truncate">O'rtacha Baho</div>
          <div class="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 tabular-nums">{{ monthData.avgScore }}%</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center">
          <div class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 truncate">Strikes</div>
          <div class="text-xl sm:text-2xl font-black text-red-400 mt-0.5 tabular-nums">{{ monthData.strikes }} 🔥</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center">
          <div class="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 truncate">Tangalar</div>
          <div class="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 tabular-nums">{{ monthData.coins }} 🪙</div>
        </div>
      </div>

      <!-- Dynamic Line Chart -->
      <div class="relative h-52 w-full rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-3 overflow-hidden">
        <canvas ref="studentChartRef"></canvas>
      </div>
    </div>

    <!-- 4. Testlar Tarixi va Dars Natijalari (Alohida Tablar) -->
    <div class="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-3 box-border overflow-hidden">
      <!-- Section Tab Switcher -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs">
          <button
            type="button"
            @click="historyViewTab = 'tests'"
            class="rounded-xl px-3 py-1.5 font-bold transition text-center"
            :class="
              historyViewTab === 'tests'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            "
          >
            📝 Testlar Tarixi ({{ testHistory.length }})
          </button>
          <button
            type="button"
            @click="historyViewTab = 'lessons'"
            class="rounded-xl px-3 py-1.5 font-bold transition text-center"
            :class="
              historyViewTab === 'lessons'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            "
          >
            🎮 Dars Natijalari ({{ lessonScores.length }})
          </button>
        </div>

        <span class="text-[11px] text-slate-400">
          {{ historyViewTab === 'tests' ? 'Mavzulashtirilgan / Blok' : 'Kundalik Arena' }}
        </span>
      </div>

      <!-- Tab A: Standalone Test Results -->
      <div v-if="historyViewTab === 'tests'">
        <div
          v-if="testHistory.length === 0"
          class="py-8 text-center text-xs text-slate-400 rounded-2xl border border-white/5 bg-black/20 p-4 space-y-1"
        >
          <div class="text-2xl">📝</div>
          <div class="font-bold text-white">Hozircha rasmiy testlar kiritilmagan</div>
          <p class="text-[11px] text-slate-500">
            O'qituvchi tomonidan o'tkazilgan mavzulashtirilgan testlar va imtihonlar natijalari bu yerda chiqadi
          </p>
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="t in testHistory"
            :key="t.id"
            class="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center justify-between gap-3 hover:bg-black/50 transition"
          >
            <div class="space-y-0.5 min-w-0 truncate">
              <div class="text-xs font-bold text-white truncate">
                {{ t.topic }}
              </div>
              <div class="text-[10px] text-slate-400 flex items-center gap-2">
                <span>📅 {{ t.date }}</span>
                <span>•</span>
                <span class="text-indigo-300 font-mono">{{ t.book }}</span>
                <span>•</span>
                <span>Ball: <b class="text-amber-300">{{ t.correct }}/{{ t.total }}</b></span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <div class="text-right">
                <div class="text-sm font-black text-white tabular-nums">{{ t.percent }}%</div>
                <div v-if="t.coins" class="text-[10px] text-amber-400 font-bold">+{{ t.coins }} 🪙</div>
              </div>
              <span class="rounded-lg px-2 py-1 text-[10px] font-bold border shrink-0" :class="t.badgeClass">
                {{ t.statusBadge }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab B: Daily Classroom Arena Scores -->
      <div v-else>
        <div
          v-if="lessonScores.length === 0"
          class="py-8 text-center text-xs text-slate-400 rounded-2xl border border-white/5 bg-black/20 p-4 space-y-1"
        >
          <div class="text-2xl">🎮</div>
          <div class="font-bold text-white">Kundalik dars natijalari yo'q</div>
          <p class="text-[11px] text-slate-500">
            Darsdagi savol-javoblar va o'yin sessiyalari natijalari bu yerda saqlanadi
          </p>
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="l in lessonScores"
            :key="l.id"
            class="rounded-2xl border border-white/10 bg-black/30 p-3 flex items-center justify-between gap-3 hover:bg-black/50 transition"
          >
            <div class="space-y-0.5 min-w-0 truncate">
              <div class="text-xs font-bold text-white truncate">
                Sinfdagi savol-javob sessiyasi
              </div>
              <div class="text-[10px] text-slate-400 flex items-center gap-2">
                <span>📅 {{ l.date }}</span>
                <span>•</span>
                <span class="text-amber-400 font-bold">+{{ l.coin }} 🪙</span>
                <span v-if="l.strike" class="text-red-400 font-bold">+{{ l.strike }} 🔥</span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <div class="text-sm font-black text-white tabular-nums">{{ l.percent }}%</div>
              <span class="rounded-lg px-2 py-1 text-[10px] font-bold border shrink-0" :class="l.badgeClass">
                {{ l.statusBadge }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Badges Showcase -->
    <BadgesList />

    <!-- Leaderboard -->
    <StudentLeaderboard />

    <!-- Security / Pattern Settings Card -->
    <div class="w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 box-border overflow-hidden">
      <div class="space-y-0.5">
        <div class="text-xs font-bold text-white flex items-center gap-1.5">
          <span>🔒</span> <span>Xavfsizlik: Grafik Kalit (Pattern)</span>
        </div>
        <p class="text-[11px] text-slate-400">
          Profilga tezkor kirish uchun chiziladigan grafik kalitni xohlagan payt yangilab olishingiz mumkin
        </p>
      </div>
      <button
        type="button"
        @click="openPatternModal"
        class="shrink-0 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 active:scale-95 transition shadow-sm self-start sm:self-center"
      >
        🎨 Yangilash
      </button>
    </div>

    <!-- Logout -->
    <button
      type="button"
      @click="studentStore.logoutStudent"
      class="w-full rounded-2xl border border-red-500/20 bg-red-500/10 py-3.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition"
    >
      Kabinetdan chiqish 🚪
    </button>

    <!-- Update Pattern Modal -->
    <BaseModal
      v-model="showPatternModal"
      title="🎨 Grafik Kalitni Yangilash"
      custom-class="max-w-md w-full"
    >
      <div class="space-y-4 py-2 text-center">
        <div>
          <h4 class="text-sm font-bold text-white">
            {{ updateStep === 1 ? "Yangi grafik kalitni chizing" : "Tasdiqlash uchun qayta chizing" }}
          </h4>
          <p class="text-[11px] text-slate-400 mt-0.5">Kamida 4 ta nuqtani birlashtiring</p>
        </div>

        <div class="flex justify-center">
          <PatternLock
            ref="profilePatternRef"
            :width="260"
            :height="260"
            @complete="handleProfilePatternComplete"
          />
        </div>

        <div v-if="patternModalMsg" class="text-xs font-bold" :class="patternModalMsgClass">
          {{ patternModalMsg }}
        </div>
      </div>
    </BaseModal>

    <!-- Duel Modal -->
    <StudentDuelModal v-model="showDuelModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { useStudentStore } from "../../composables/useStudentStore";
import BadgesList from "./BadgesList.vue";
import StudentLeaderboard from "./StudentLeaderboard.vue";
import StudentDuelModal from "./StudentDuelModal.vue";
import PatternLock from "./PatternLock.vue";
import BaseModal from "../common/BaseModal.vue";
import { soundManager, fireConfetti } from "../../composables/useAudio";

Chart.register(...registerables);

const studentStore = useStudentStore();
const showDuelModal = ref(false);
const studentChartRef = ref<HTMLCanvasElement | null>(null);
let chartInst: Chart | null = null;

// History View Tab
const historyViewTab = ref<"tests" | "lessons">("tests");

// Academic Computed Metrics
const allBooksData = computed(() => studentStore.studentAllBooksMastery.value);
const attendance = computed(() => studentStore.studentAttendance.value);
const schedule = computed(() => studentStore.nextLessonSchedule.value);
const testHistory = computed(() => studentStore.studentTestHistory.value);
const lessonScores = computed(() => studentStore.studentLessonScores.value);

// Duel Acceptance Actions
async function handleAcceptDuel() {
  if (!studentStore.incomingDuel.value) return;
  const duel = studentStore.incomingDuel.value;
  soundManager.playSuccess();
  fireConfetti();
  const ok = await studentStore.acceptDuel(duel.key, duel);
  if (ok) {
    alert(`⚔️ "${duel.challenger}" bilan duel taklifini qabul qildingiz! ${duel.type === 'live' ? "Doskadagi jangga tayyorlaning!" : "Darsdagi testda omad!"}`);
  }
}

async function handleDeclineDuel() {
  if (!studentStore.incomingDuel.value) return;
  const duel = studentStore.incomingDuel.value;
  await studentStore.declineDuel(duel.key, duel);
}

// Pattern Update State
const showPatternModal = ref(false);
const updateStep = ref<1 | 2>(1);
const profilePatternDraft = ref("");
const profilePatternRef = ref<InstanceType<typeof PatternLock> | null>(null);
const patternModalMsg = ref("");
const patternModalMsgClass = ref("text-indigo-300");

function openPatternModal() {
  updateStep.value = 1;
  profilePatternDraft.value = "";
  patternModalMsg.value = "";
  showPatternModal.value = true;
  nextTick(() => {
    profilePatternRef.value?.reset();
  });
}

function handleProfilePatternComplete(pattern: string) {
  if (updateStep.value === 1) {
    profilePatternDraft.value = pattern;
    updateStep.value = 2;
    soundManager.playSuccess();
    patternModalMsg.value = "Shaklni tasdiqlash uchun yana bir marta chizing";
    patternModalMsgClass.value = "text-indigo-300";
    profilePatternRef.value?.reset();
  } else {
    if (pattern === profilePatternDraft.value) {
      studentStore.setStudentPattern(pattern);
      profilePatternRef.value?.showSuccess("Grafik kalit muvaffaqiyatli yangilandi! ✓");
      soundManager.playSuccess();
      fireConfetti();
      patternModalMsg.value = "Grafik kalit saqlandi!";
      patternModalMsgClass.value = "text-emerald-400";
      setTimeout(() => {
        showPatternModal.value = false;
      }, 1000);
    } else {
      profilePatternRef.value?.showError("Shakllar mos kelmadi!");
      patternModalMsg.value = "Shakllar mos tushmadi. Boshidan chizing.";
      patternModalMsgClass.value = "text-rose-400";
      setTimeout(() => {
        updateStep.value = 1;
        profilePatternDraft.value = "";
        profilePatternRef.value?.reset();
      }, 1000);
    }
  }
}

const monthKeys = computed(() => {
  return Object.keys(studentStore.groupedMonths.value);
});

const monthData = computed(() => studentStore.activeMonthData.value);

const levelProgress = computed(() => {
  const tests = studentStore.historyData.value.length;
  if (tests >= 30) {
    return { percent: 100, nextLevel: "Akademik 👑 (Maksimal)" };
  } else if (tests >= 15) {
    const p = Math.min(100, Math.round(((tests - 15) / 15) * 100));
    return { percent: p, nextLevel: "Akademik 👑" };
  } else if (tests >= 5) {
    const p = Math.min(100, Math.round(((tests - 5) / 10) * 100));
    return { percent: p, nextLevel: "Tarixchi 🏛️" };
  } else {
    const p = Math.min(100, Math.round((tests / 5) * 100));
    return { percent: p, nextLevel: "Izlanuvchi 🔍" };
  }
});

onMounted(async () => {
  await studentStore.fetchStudentHistory();
  await studentStore.fetchLeaderboard();
  await nextTick();
  drawChart();
});

function drawChart() {
  if (!studentChartRef.value) return;
  const items = monthData.value.items || [];

  const labels = items.map((i) => i.date);
  const dataPoints = items.map((i) => parseFloat(String(i.percent)) || 0);

  if (chartInst) {
    chartInst.destroy();
  }

  chartInst = new Chart(studentChartRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data: dataPoints,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.15)",
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b82f6",
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
          ticks: { color: "#94a3b8", stepSize: 25 },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#94a3b8" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `${c.parsed.y}% o'zlashtirish`,
          },
        },
      },
    },
  });
}
</script>

<style scoped>
@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 0 15px rgba(244, 63, 94, 0.4), 0 0 30px rgba(244, 63, 94, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(244, 63, 94, 0.8), 0 0 50px rgba(244, 63, 94, 0.4);
  }
}

.animate-pulse-border {
  animation: pulse-border 1.5s infinite;
}
</style>
