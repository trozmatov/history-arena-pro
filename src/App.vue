<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
    <!-- Top Global Navbar -->
    <Navbar
      :active-role="activeRole"
      :unread-count="teacherUnreadCount"
      @change-role="activeRole = $event"
      @toggle-notifs="showNotifModal = true"
    />

    <!-- Main Container: Dynamically scales to max-w-7xl on desktop for CRM tables and analytics -->
    <main
      class="flex-1 w-full mx-auto px-2.5 py-3 sm:p-6 flex flex-col transition-all duration-300 overflow-x-hidden"
      :class="isWideView ? 'max-w-7xl' : 'max-w-xl justify-center'"
    >
      <!-- 👨‍🏫 TEACHER PORTAL -->
      <template v-if="activeRole === 'teacher'">
        <Transition name="fade" mode="out-in">
          <!-- 1. Teacher Login -->
          <TeacherLogin v-if="!teacherStore.isTeacherLoggedIn.value" key="teacher-login" />

          <!-- 2. Teacher Subviews -->
          <div v-else :key="teacherSubview" class="w-full">
            <TeacherSetup
              v-if="teacherSubview === 'setup'"
              @start-game="teacherSubview = 'game'"
              @nav="teacherSubview = $event"
            />
            <GameArena
              v-else-if="teacherSubview === 'game'"
              @go-home="teacherSubview = 'setup'"
              @game-finished="teacherSubview = 'results'"
            />
            <ResultsView
              v-else-if="teacherSubview === 'results'"
              @back-to-game="teacherSubview = 'game'"
              @new-lesson="teacherSubview = 'setup'"
            />
            <AttendanceMatrix
              v-else-if="teacherSubview === 'attendance'"
              @back="teacherSubview = 'setup'"
            />
            <LeaderboardView
              v-else-if="teacherSubview === 'leaderboard'"
              @back="teacherSubview = 'setup'"
            />
            <StatsAnalytics
              v-else-if="teacherSubview === 'stats'"
              @back="teacherSubview = 'setup'"
            />
            <MarketManager
              v-else-if="teacherSubview === 'market'"
              @back="teacherSubview = 'setup'"
            />
            <LiveChat
              v-else-if="teacherSubview === 'chat'"
              @back="teacherSubview = 'setup'"
            />
            <StudentManager
              v-else-if="teacherSubview === 'students'"
              @back="teacherSubview = 'setup'"
              @nav="teacherSubview = $event"
            />
          </div>
        </Transition>
      </template>

      <!-- 🎓 STUDENT PORTAL -->
      <template v-else>
        <Transition name="fade" mode="out-in">
          <StudentLogin v-if="!studentStore.isStudentLoggedIn.value" key="student-login" />
          <StudentProfile v-else key="student-profile" />
        </Transition>
      </template>
    </main>

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

              <div class="flex items-center gap-1.5">
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
import { ref, computed, onMounted } from "vue";
import Navbar from "./components/common/Navbar.vue";
import BaseModal from "./components/common/BaseModal.vue";

// Teacher components
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

// Student components
import StudentLogin from "./components/student/StudentLogin.vue";
import StudentProfile from "./components/student/StudentProfile.vue";

// Stores
import { useTeacherStore, UnifiedReminder } from "./composables/useTeacherStore";
import { useStudentStore } from "./composables/useStudentStore";
import { db, ref as fbRef, onChildAdded, onChildChanged, onChildRemoved } from "./services/firebase";

import { prefetchCommonData } from "./services/api";

const teacherStore = useTeacherStore();
const studentStore = useStudentStore();

const activeRole = ref<"teacher" | "student">("teacher");
const teacherSubview = ref<
  "setup" | "game" | "results" | "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students"
>("setup");

const isWideView = computed(() => {
  if (activeRole.value === "student") return false;
  return ["attendance", "leaderboard", "stats", "market", "chat", "students"].includes(teacherSubview.value);
});

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

  // Realtime Cloud synchronization for frozen students
  const frozenRef = fbRef(db, "frozen_students");
  onChildAdded(frozenRef, (snap: any) => {
    const val = snap.val();
    if (val && val.name) {
      const target = teacherStore.allStudentsRegistry.value.find(
        (s) => s.name.toLowerCase().trim() === val.name.toLowerCase().trim()
      );
      if (target) {
        target.status = "frozen";
      } else {
        teacherStore.saveStudent({
          name: val.name,
          group: val.group || "Umumiy",
          status: "frozen",
        });
      }
      // Eject from active game session if present
      teacherStore.students.value = teacherStore.students.value.filter(
        (s) => s.name.toLowerCase().trim() !== val.name.toLowerCase().trim()
      );
    }
  });

  onChildRemoved(frozenRef, (snap: any) => {
    const val = snap.val();
    const studentName = val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."));
    if (studentName) {
      const target = teacherStore.allStudentsRegistry.value.find(
        (s) => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
      );
      if (target) {
        target.status = "active";
      }
    }
  });
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
