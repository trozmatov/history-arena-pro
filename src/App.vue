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
      class="flex-1 w-full mx-auto p-4 sm:p-6 flex flex-col transition-all duration-300"
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
      title="🔔 Bildirishnomalar"
    >
      <div class="space-y-2 py-2">
        <div v-if="notificationsList.length === 0" class="py-8 text-center text-xs text-slate-500">
          Yangi bildirishnomalar yo'q
        </div>
        <div
          v-for="(n, idx) in notificationsList"
          :key="idx"
          class="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs space-y-1"
        >
          <div class="font-bold text-white flex items-center justify-between">
            <span>{{ n.title }}</span>
            <span class="text-[10px] text-slate-400">{{ n.time }}</span>
          </div>
          <p class="text-slate-300">{{ n.message }}</p>
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
import { useTeacherStore } from "./composables/useTeacherStore";
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
const teacherUnreadCount = computed(() => {
  return rawUnreadCount.value + teacherStore.dueReminders.value.length;
});
const rawUnreadCount = ref(0);
const notificationsList = ref<{ title: string; message: string; time: string }[]>([]);

onMounted(() => {
  // Pre-fetch common data in background
  prefetchCommonData();

  // Populate any due teacher reminders into notification list
  teacherStore.dueReminders.value.forEach((r) => {
    notificationsList.value.push({
      title: `⏰ Eslatma: ${r.title}`,
      message: `${r.date} ${r.time} — ${r.studentName ? r.studentName + ' (' + r.group + ')' : ''} ${r.note || ''}`,
      time: r.time,
    });
  });

  // Listen for teacher notifications from Firebase
  const notifRef = fbRef(db, "notifications/teacher");
  onChildAdded(notifRef, (snap: any) => {
    const val = snap.val();
    if (val) {
      notificationsList.value.unshift(val);
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
