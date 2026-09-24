<template>
  <div
    class="min-h-screen selection:bg-blue-600 selection:text-white flex flex-col font-sans transition-colors duration-300"
    :class="isDark ? 'liquid-canvas-dark text-slate-100' : 'liquid-canvas-light text-slate-900'"
  >
    <!-- Top Global Navbar (Hidden on public /results showcase page and Teacher portal which has its own status bar) -->
    <Navbar
      v-if="!isResultsActive && activeRole !== 'teacher'"
      :active-role="activeRole"
      :unread-count="teacherUnreadCount"
      :is-results-active="isResultsActive"
      @change-role="handleRoleChange"
      @toggle-notifs="showNotifModal = true"
      @view-results="navigateTo('/results')"
      @go-home="handleGoHome"
    />

    <!-- 🏆 PUBLIC RESULTS SHOWCASE (/results) -->
    <template v-if="isResultsActive">
      <main class="flex-1 w-full mx-auto flex flex-col transition-all duration-300 overflow-x-hidden w-full p-0 max-w-none">
        <PublicResultsView @go-home="navigateTo('/')" />
      </main>
    </template>

    <!-- 👨‍🏫 TEACHER PORTAL (3-Tier Liquid Glass Layout) -->
    <template v-else-if="activeRole === 'teacher'">
      <TeacherView
        :unread-count="teacherUnreadCount"
        :initial-subview="teacherSubview"
        @change-role="handleRoleChange"
        @toggle-notifs="showNotifModal = true"
        @view-results="navigateTo('/results')"
      />
    </template>

    <!-- 🎓 STUDENT PORTAL -->
    <template v-else>
      <div v-if="!studentStore.isStudentLoggedIn.value" class="flex-1 w-full mx-auto flex flex-col justify-center max-w-xl px-2.5 py-3 sm:p-6">
        <StudentLogin />
      </div>
      <StudentView v-else @nav-to-results="navigateTo('/results')" />
    </template>

    <!-- 🚀 SHARED EXAM LINK ENTRY LAUNCHPAD (When accessed via ?exam=... or ?test=...) -->
    <ExamLinkLaunchpad
      v-if="activeExamLinkId && !runningExamFromLink"
      :test-id="activeExamLinkId"
      @start-exam="handleStartExamFromLink"
      @cancel="handleCancelExamLink"
    />

    <!-- 🛡️ EXAM RUNNER WHEN STARTED FROM SHARED LINK -->
    <AntiCheatExamRunner
      v-if="runningExamFromLink"
      :test="runningExamFromLink"
      :student-name="studentDisplayName"
      :student-id="studentDisplayId"
      @cancel="runningExamFromLink = null"
      @finished="handleFinishedExamFromLink"
    />

    <!-- Teacher Notifications Modal -->
    <BaseModal
      v-model="showNotifModal"
      title="🔔 Bildirishnomalar va Eslatmalar"
      custom-class="max-w-xl w-full"
    >
      <div class="space-y-3 py-1">
        <!-- Filter Tabs: Barchasi, Eslatmalar, Xabarlar -->
        <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs">
          <button
            type="button"
            @click="notifTab = 'all'"
            class="flex-1 rounded-xl py-1.5 font-bold transition text-center"
            :class="notifTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Hammasi ({{ allCombinedNotifs.length }})
          </button>
          <button
            type="button"
            @click="notifTab = 'reminders'"
            class="flex-1 rounded-xl py-1.5 font-bold transition text-center"
            :class="notifTab === 'reminders' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            ⏰ Eslatmalar ({{ teacherStore.allUnifiedReminders.value.length }})
          </button>
          <button
            type="button"
            @click="notifTab = 'system'"
            class="flex-1 rounded-xl py-1.5 font-bold transition text-center"
            :class="notifTab === 'system' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            📢 Tizim ({{ firebaseNotifs.length }})
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="filteredCombinedNotifs.length === 0" class="py-12 text-center rounded-2xl border border-white/5 bg-black/20 space-y-2">
          <div class="text-3xl">🔔</div>
          <div class="text-xs font-bold text-slate-300">Yangi bildirishnoma yoki eslatmalar yo'q</div>
          <p class="text-[11px] text-slate-500">O'quvchilar yoki guruhlarga kiritilgan barcha eslatmalar bu yerda jamlanadi</p>
        </div>

        <!-- Notifications & Reminders List -->
        <div v-else class="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="(n, idx) in filteredCombinedNotifs"
            :key="idx"
            class="rounded-2xl border p-3.5 text-xs space-y-2 transition"
            :class="
              n.isDue
                ? 'border-red-500/40 bg-red-950/20'
                : n.completed
                ? 'border-white/5 bg-black/20 opacity-60'
                : n.source === 'group'
                ? 'border-purple-500/30 bg-purple-950/20'
                : n.source === 'student'
                ? 'border-blue-500/30 bg-blue-950/20'
                : 'border-white/10 bg-black/40'
            "
          >
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Source badge -->
                  <span
                    v-if="n.source === 'group'"
                    class="rounded-lg bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-black text-purple-300"
                  >
                    👥 Guruh Eslatmasi
                  </span>
                  <span
                    v-else-if="n.source === 'student'"
                    class="rounded-lg bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-black text-blue-300"
                  >
                    👤 O'quvchi Eslatmasi
                  </span>
                  <span
                    v-else
                    class="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300"
                  >
                    📢 Tizim Xabari
                  </span>

                  <!-- Due badge -->
                  <span v-if="n.isDue" class="rounded-lg bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-black text-red-300 animate-pulse">
                    ⚠️ Muddati keldi!
                  </span>

                  <!-- Title -->
                  <span class="font-extrabold text-sm text-white" :class="{ 'line-through text-slate-400': n.completed }">
                    {{ n.title }}
                  </span>
                </div>

                <p v-if="n.message" class="text-xs text-slate-300 pt-0.5">
                  {{ n.message }}
                </p>
              </div>

              <!-- Time & Date -->
              <div class="text-right shrink-0">
                <div class="text-[11px] font-bold text-slate-400">📅 {{ n.date }}</div>
                <div v-if="n.time" class="text-[10px] font-mono text-slate-500">⏰ {{ n.time }}</div>
              </div>
            </div>

            <!-- Action buttons for reminders -->
            <div v-if="n.isReminder" class="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
              <span class="text-[10px] text-slate-400">
                {{ n.completed ? '✅ Bajarilgan deb belgilangan' : '⏳ Kutilmoqda' }}
              </span>

              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-if="n.rawReminder?.type === 'attendance'"
                  type="button"
                  @click="goToAttendanceView"
                  class="rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 px-2.5 py-1 text-[11px] font-bold hover:bg-cyan-600/50 transition shadow flex items-center gap-1"
                  title="Davomat jurnaliga o'tish"
                >
                  <span>📊</span>
                  <span>Davomatga o'tish</span>
                </button>
                <button
                  type="button"
                  @click="teacherStore.toggleCompleteUnifiedReminder(n.rawReminder)"
                  class="rounded-xl px-2.5 py-1 text-[11px] font-bold transition shadow"
                  :class="n.completed ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-emerald-600 text-white hover:bg-emerald-500'"
                >
                  {{ n.completed ? '↩️ Qaytarish' : '✅ Bajarildi' }}
                </button>
                <button
                  type="button"
                  @click="teacherStore.deleteUnifiedReminder(n.rawReminder)"
                  class="rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-1 text-[11px] hover:bg-red-500/30"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Navbar from "./components/common/Navbar.vue";
import BaseModal from "./components/common/BaseModal.vue";

// Teacher components
import TeacherView from "./components/teacher/TeacherView.vue";
import TeacherLogin from "./components/teacher/TeacherLogin.vue";
import TeacherSetup from "./components/teacher/TeacherSetup.vue";
import GameArena from "./components/teacher/GameArena.vue";
import ResultsView from "./components/teacher/ResultsView.vue";
import AttendanceMatrix from "./components/teacher/AttendanceMatrix.vue";
import LeaderboardView from "./components/teacher/LeaderboardView.vue";
import StatsAnalytics from "./components/teacher/StatsAnalytics.vue";
import MarketManager from "./components/teacher/MarketManager.vue";
import LiveChat from "./components/teacher/LiveChat.vue";
import StudentManager from "./components/teacher/StudentManager.vue";
import AIChallengeManager from "./components/teacher/AIChallengeManager.vue";
import CertificatesManager from "./components/teacher/CertificatesManager.vue";

// Public & Student components
import PublicResultsView from "./components/public/PublicResultsView.vue";
import StudentLogin from "./components/student/StudentLogin.vue";
import StudentProfile from "./components/student/StudentProfile.vue";
import StudentView from "./components/student/StudentView.vue";
import ExamLinkLaunchpad from "./components/student/ExamLinkLaunchpad.vue";
import AntiCheatExamRunner from "./components/student/AntiCheatExamRunner.vue";
import type { TestExam, ExamResult } from "./types/test";

import { useTeacherStore, UnifiedReminder } from "./composables/useTeacherStore";
import { useStudentStore } from "./composables/useStudentStore";
import { useTheme } from "./composables/useTheme";
import { db, ref as fbRef, onChildAdded, onChildChanged, onChildRemoved } from "./services/firebase";

import { prefetchCommonData } from "./services/api";

const teacherStore = useTeacherStore();
const studentStore = useStudentStore();
const { isDark } = useTheme();

// ==========================================
// SHARED EXAM LINK SYSTEM (?exam=... or ?test=...)
// ==========================================
function getExamIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const searchParams = new URLSearchParams(window.location.search);
  const exam = searchParams.get("exam") || searchParams.get("test") || searchParams.get("testId");
  if (exam) return exam;

  const hash = window.location.hash;
  if (hash.includes("exam=")) {
    const qIdx = hash.indexOf("?");
    if (qIdx !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIdx + 1));
      return hashParams.get("exam");
    }
  }
  const match = hash.match(/#\/exam\/([^/?]+)/);
  if (match) return match[1];

  return null;
}

const activeExamLinkId = ref<string | null>(getExamIdFromUrl());
const runningExamFromLink = ref<TestExam | null>(null);

const studentDisplayName = computed(() => {
  const name =
    studentStore.studentName?.value ||
    (typeof studentStore.studentName === "string" ? studentStore.studentName : "");
  return name || "O'quvchi";
});

const studentDisplayId = computed(() => {
  return studentDisplayName.value.toLowerCase().replace(/\s+/g, "_") || "std_guest";
});

function handleStartExamFromLink(test: TestExam) {
  runningExamFromLink.value = test;
  activeExamLinkId.value = null;
  if (typeof window !== "undefined") {
    const cleanUrl = window.location.pathname.replace(/\/exam.*$/, "");
    window.history.replaceState({}, "", cleanUrl);
  }
}

function handleCancelExamLink() {
  activeExamLinkId.value = null;
  if (typeof window !== "undefined") {
    const cleanUrl = window.location.pathname.replace(/\/exam.*$/, "");
    window.history.replaceState({}, "", cleanUrl);
  }
}

function handleFinishedExamFromLink(_res: ExamResult | null) {
  runningExamFromLink.value = null;
  navigateTo("/student");
}

// ==========================================
// URL ROUTING SYSTEM
// 1. "/" (https://history-pro.uz) -> Student portal
// 2. "/student" -> Student portal
// 3. "/teacher" -> Teacher portal
// 4. "/results" -> Public Results Showcase
// ==========================================

function isTeacherUrl(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === "/teacher" ||
    path.startsWith("/teacher/") ||
    hash === "#/teacher" ||
    hash.startsWith("#/teacher/") ||
    hash === "#teacher" ||
    search.includes("teacher")
  );
}

function isResultsUrl(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === "/results" ||
    path.startsWith("/results/") ||
    hash === "#/results" ||
    hash.startsWith("#/results/") ||
    hash === "#results"
  );
}

function getNormalizedPath(): string {
  if (typeof window === "undefined") return "/";
  if (isResultsUrl()) {
    return "/results";
  }
  if (isTeacherUrl()) {
    return "/teacher";
  }
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (
    path === "/student" ||
    path.startsWith("/student/") ||
    hash === "#/student" ||
    hash.startsWith("#/student/") ||
    path.includes("history-pro/student") ||
    hash.includes("history-pro/student")
  ) {
    return "/student";
  }
  return "/";
}

const currentRoute = ref<string>(getNormalizedPath());
const isResultsActive = computed(() => currentRoute.value === "/results");

function navigateTo(path: string) {
  currentRoute.value = path;
  if (typeof window !== "undefined") {
    if (path === "/teacher") {
      activeRole.value = "teacher";
      try {
        localStorage.setItem("ha_active_role", "teacher");
        if (window.location.pathname !== "/teacher") {
          window.history.pushState({}, "", "/teacher");
        }
      } catch (_) {
        window.location.hash = "#/teacher";
      }
    } else if (path === "/student" || path === "/") {
      activeRole.value = "student";
      try {
        localStorage.setItem("ha_active_role", "student");
        if (window.location.pathname !== path) {
          window.history.pushState({}, "", path);
        }
      } catch (_) {
        window.location.hash = path === "/student" ? "#/student" : "";
      }
    } else if (path === "/results") {
      try {
        if (window.location.pathname !== "/results") {
          window.history.pushState({}, "", "/results");
        }
      } catch (_) {
        window.location.hash = "#/results";
      }
    } else if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }
}

function detectInitialRole(): "teacher" | "student" {
  if (typeof window === "undefined") return "student";
  if (isTeacherUrl()) {
    return "teacher";
  }
  // Standart holatda (https://history-pro.uz va /student): Har doim Student!
  return "student";
}

const activeRole = ref<"teacher" | "student">(detectInitialRole());

function handleRoleChange(role: "teacher" | "student") {
  activeRole.value = role;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("ha_active_role", role);
      if (role === "teacher") {
        if (!window.location.pathname.includes("/teacher") && !window.location.hash.includes("teacher")) {
          try {
            window.history.pushState({}, "", "/teacher");
          } catch (_) {
            window.location.hash = "#/teacher";
          }
        }
        currentRoute.value = "/teacher";
      } else {
        // Switch to student
        if (window.location.pathname.includes("/teacher") || window.location.hash.includes("teacher")) {
          try {
            window.history.pushState({}, "", "/student");
          } catch (_) {
            window.location.hash = "#/student";
          }
        }
        currentRoute.value = window.location.pathname === "/" ? "/" : "/student";
      }
    } catch (_) {}
  }
  if (isResultsActive.value) {
    if (role === "teacher") {
      navigateTo("/teacher");
    } else {
      navigateTo("/");
    }
  }
}

function handleGoHome() {
  if (activeRole.value === "teacher") {
    navigateTo("/teacher");
  } else {
    navigateTo("/");
  }
}

const teacherSubview = ref<
  "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates"
>("setup");

const isWideView = computed(() => {
  if (isResultsActive.value) return true;
  if (activeRole.value === "student") return false;
  return [
    "attendance",
    "leaderboard",
    "stats",
    "market",
    "chat",
    "students",
    "challenge",
    "ai-exam",
    "certificates",
  ].includes(teacherSubview.value);
});

// React to global student doska navigation request
watch(
  () => teacherStore.requestedTeacherSubview.value,
  (newSub) => {
    if (newSub) {
      activeRole.value = "teacher";
      navigateTo("/teacher");
      teacherSubview.value = newSub as any;
      teacherStore.requestedTeacherSubview.value = null;
    }
  }
);

function goToAttendanceView() {
  activeRole.value = "teacher";
  navigateTo("/teacher");
  teacherSubview.value = "attendance";
  teacherStore.requestedTeacherSubview.value = "attendance";
  showNotifModal.value = false;
}

const showNotifModal = ref(false);
const notifTab = ref<"all" | "reminders" | "system">("all");
const rawUnreadCount = ref(0);
const firebaseNotifs = ref<any[]>([]);

// Combined notifications computed from Unified Reminders (Student + Group) + Firebase System Notifs
const allCombinedNotifs = computed(() => {
  const list: any[] = [];

  // 1. Unified reminders (Both student and group)
  teacherStore.allUnifiedReminders.value.forEach((r) => {
    list.push({
      id: r.id,
      isReminder: true,
      rawReminder: r,
      source: r.source,
      title: r.title,
      message: r.message,
      date: r.date,
      time: r.time,
      completed: r.completed,
      isDue: r.isDue,
      createdAt: r.createdAt || 0,
    });
  });

  // 2. Firebase system notifications
  firebaseNotifs.value.forEach((fn) => {
    list.push({
      id: fn.id || "fb-" + Math.random(),
      isReminder: false,
      source: "system",
      title: fn.title || "Tizim Xabari",
      message: fn.message || fn.text || "",
      date: fn.date || new Date().toISOString().split("T")[0],
      time: fn.time || "12:00",
      completed: false,
      isDue: false,
      createdAt: fn.createdAt || 0,
    });
  });

  return list.sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""));
  });
});

const filteredCombinedNotifs = computed(() => {
  if (notifTab.value === "reminders") {
    return allCombinedNotifs.value.filter((n) => n.isReminder);
  }
  if (notifTab.value === "system") {
    return allCombinedNotifs.value.filter((n) => !n.isReminder);
  }
  return allCombinedNotifs.value;
});

const teacherUnreadCount = computed(() => {
  const dueCount = teacherStore.dueReminders.value.length;
  const activeCount = teacherStore.allUnifiedReminders.value.filter((r) => !r.completed).length;
  return rawUnreadCount.value + (dueCount > 0 ? dueCount : activeCount);
});

onMounted(() => {
  const syncRoleFromLocation = () => {
    if (isResultsUrl()) {
      currentRoute.value = "/results";
    } else if (isTeacherUrl()) {
      activeRole.value = "teacher";
      currentRoute.value = "/teacher";
      try {
        localStorage.setItem("ha_active_role", "teacher");
      } catch (_) {}
    } else {
      // Standart holatda (https://history-pro.uz va /student): Har doim Student!
      activeRole.value = "student";
      currentRoute.value = window.location.pathname.includes("student") ? "/student" : "/";
      try {
        localStorage.setItem("ha_active_role", "student");
      } catch (_) {}
    }

    const examParam = getExamIdFromUrl();
    if (examParam) {
      activeExamLinkId.value = examParam;
    }
  };

  // Listen for browser URL history navigation (back/forward and hash)
  window.addEventListener("popstate", syncRoleFromLocation);
  window.addEventListener("hashchange", syncRoleFromLocation);
  syncRoleFromLocation();

  // Pre-fetch common data in background
  prefetchCommonData();

  // Listen for teacher notifications from Firebase
  const notifRef = fbRef(db, "notifications/teacher");
  onChildAdded(notifRef, (snap: any) => {
    const val = snap.val();
    if (val) {
      firebaseNotifs.value.unshift(val);
      rawUnreadCount.value++;
    }
  });

  // Listen for live duels
  const duelsRef = fbRef(db, "duels");
  const handleLiveDuel = (d: any) => {
    if (d && d.type === "live" && d.status === "accepted") {
      if (teacherStore.isStudentFrozen(d.challenger) || teacherStore.isStudentFrozen(d.target)) {
        return;
      }
      teacherStore.suggestedLiveDuel.value = d;
    }
  };

  onChildAdded(duelsRef, (snap: any) => {
    handleLiveDuel(snap.val());
  });
  onChildChanged(duelsRef, (snap: any) => {
    handleLiveDuel(snap.val());
  });
  onChildRemoved(duelsRef, () => {
    teacherStore.suggestedLiveDuel.value = null;
  });

  // Centralized Firebase realtime synchronization managed by useTeacherStore
  teacherStore.initTeacherStoreSync();
  teacherStore.checkAndApplyAutoAttendance();

  // Periodically check auto-attendance every 60s so it triggers when the configured time arrives
  setInterval(() => {
    teacherStore.checkAndApplyAutoAttendance();
  }, 60000);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
