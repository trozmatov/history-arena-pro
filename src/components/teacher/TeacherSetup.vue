<template>
  <div class="space-y-4 max-w-xl mx-auto pb-6">
    <!-- Live Duel Challenge Banner (Firebase) -->
    <div
      v-if="suggestedLiveDuel"
      class="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 p-4 shadow-xl backdrop-blur-xl animate-pulse"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">⚔️</span>
          <div>
            <div class="text-[10px] font-black uppercase tracking-wider text-amber-400">Jonli Duel Taklifi!</div>
            <div class="text-sm font-extrabold text-white">
              {{ suggestedLiveDuel.challenger }} <span class="text-amber-400">vs</span> {{ suggestedLiveDuel.target }}
            </div>
          </div>
        </div>
        <button
          @click="startSuggestedDuel"
          class="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 active:scale-95 transition"
        >
          Doskaga chiqarish 🚀
        </button>
      </div>
    </div>

    <!-- Mode Selector Segmented Control -->
    <div class="flex rounded-3xl bg-slate-900/90 p-1.5 border border-white/10 shadow-xl gap-1">
      <button
        type="button"
        @click="teacherStore.setMode('standard')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'standard'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
            : 'text-slate-400 hover:text-white'
        "
      >
        <span>🎯</span>
        <span>Standard</span>
      </button>
      <button
        type="button"
        @click="teacherStore.setMode('Duel')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'Duel'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
            : 'text-slate-400 hover:text-white'
        "
      >
        <span>⚔️</span>
        <span>Duel</span>
      </button>
      <button
        type="button"
        @click="teacherStore.setMode('Jamoalar')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'Jamoalar'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
            : 'text-slate-400 hover:text-white'
        "
      >
        <span>👥</span>
        <span>Jamoalar</span>
      </button>
    </div>

    <!-- 1. STANDARD SETUP -->
    <div v-if="teacherStore.currentMode.value === 'standard'" class="space-y-3">
      <!-- Global Task Banner -->
      <button
        type="button"
        @click="openTaskModal('')"
        class="w-full flex items-center justify-between rounded-3xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shadow-md"
      >
        <div class="flex items-center gap-2">
          <span class="text-base">📚</span>
          <span>Umumiy darslik & vazifa:</span>
        </div>
        <span class="rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 font-black text-white">
          {{ teacherStore.globalBook.value || teacherStore.globalTopic.value ? `${teacherStore.globalBook.value} | ${teacherStore.globalTopic.value}` : 'Tanlanmagan' }}
        </span>
      </button>

      <!-- Add Student Input + Import from DB Button -->
      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            v-model="newStudentName"
            type="text"
            placeholder="Yangi o'quvchi ismi..."
            @keypress.enter="addSingleStudent"
            class="flex-1 rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
          />
          <button
            type="button"
            @click="addSingleStudent"
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition"
          >
            +
          </button>
        </div>

        <button
          type="button"
          @click="openDbModal('standard')"
          class="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3 text-xs font-extrabold text-amber-300 hover:bg-amber-500/20 transition flex items-center justify-center gap-2"
        >
          <span>👥</span> <span>Bazadan Guruhlarni chaqirish</span>
        </button>
      </div>

      <!-- Real-time Student Search & Count -->
      <div class="flex items-center justify-between px-1 pt-1 text-xs">
        <span class="font-extrabold text-slate-400 uppercase tracking-wider">
          O'quvchilar ro'yxati ({{ filteredStudents.length }})
        </span>
        <div v-if="teacherStore.standardStudents.value.length > 5" class="w-40">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Qidirish..."
            class="w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Students List -->
      <div class="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-if="teacherStore.standardStudents.value.length === 0"
          class="rounded-3xl border border-white/5 bg-black/20 p-8 text-center text-xs text-slate-500"
        >
          Hozircha o'quvchilar qo'shilmagan. Yuqoridagi maydondan ism kiriting yoki bazadan guruhni chaqiring.
        </div>

        <div
          v-for="(s, idx) in filteredStudents"
          :key="s.name"
          class="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-md hover:border-white/20 transition"
        >
          <div class="flex items-center gap-2.5">
            <span class="flex h-7 w-7 items-center justify-center rounded-xl bg-white/5 font-black text-xs text-slate-400">
              {{ idx + 1 }}
            </span>
            <div>
              <div class="text-sm font-bold text-white">{{ s.name }}</div>
              <div v-if="s.book || s.topic" class="text-[11px] text-cyan-400 font-semibold">
                📖 {{ s.book }} {{ s.topic ? `(${s.topic})` : '' }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="archive(s.name)"
              class="rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
              title="Arxivga o'tkazish"
            >
              📦
            </button>
            <button
              type="button"
              @click="openTaskModal(s.name)"
              class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-400 hover:bg-amber-500/20"
              title="Vazifa belgilash"
            >
              ✏️
            </button>
            <button
              type="button"
              @click="teacherStore.removeStudent(s.name)"
              class="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-400 hover:bg-red-500/20"
              title="O'chirish"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. DUEL SETUP -->
    <div v-else-if="teacherStore.currentMode.value === 'Duel'" class="space-y-3">
      <button
        type="button"
        @click="openDbModal('Duel')"
        class="w-full rounded-2xl border border-purple-500/30 bg-purple-500/10 py-3.5 text-xs font-extrabold text-purple-300 hover:bg-purple-500/20 transition flex items-center justify-center gap-2"
      >
        <span>👥</span> <span>Bazadan 2 kishini tanlash</span>
      </button>

      <div class="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
        <div
          v-if="teacherStore.duelStudents.value.length === 0"
          class="rounded-3xl border border-white/5 bg-black/20 p-8 text-center text-xs text-slate-500"
        >
          Duel bellashuvi uchun aniq 2 nafar o'quvchini tanlang.
        </div>

        <div
          v-for="(s, idx) in teacherStore.duelStudents.value"
          :key="s.name"
          class="flex items-center justify-between rounded-2xl border border-purple-500/30 bg-purple-950/40 p-3.5"
        >
          <div class="flex items-center gap-3">
            <span class="text-base font-black text-purple-400">#{{ idx + 1 }}</span>
            <span class="text-sm font-bold text-white">{{ s.name }}</span>
          </div>
          <button
            type="button"
            @click="teacherStore.removeStudent(s.name)"
            class="rounded-xl bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/20"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 3. JAMOALAR SETUP -->
    <div v-else-if="teacherStore.currentMode.value === 'Jamoalar'" class="space-y-3">
      <!-- Team A -->
      <div class="rounded-3xl border border-red-500/30 bg-red-950/30 p-4 space-y-2.5">
        <input
          v-model="teacherStore.team1Name.value"
          type="text"
          class="w-full rounded-2xl border border-red-500/30 bg-black/50 px-3 py-2 text-center text-sm font-black text-red-400 outline-none"
        />
        <button
          type="button"
          @click="openDbModal('A')"
          class="w-full rounded-xl bg-red-500/20 border border-red-500/30 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/30 transition"
        >
          + {{ teacherStore.team1Name.value }}ga Qo'shish
        </button>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="s in teacherStore.teamAStudents.value"
            :key="s.name"
            class="inline-flex items-center gap-1 rounded-xl bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-xs font-bold text-red-200"
          >
            {{ s.name }}
            <button @click="teacherStore.removeStudent(s.name)" class="text-red-400 hover:text-white ml-1">✕</button>
          </span>
        </div>
      </div>

      <!-- Team B -->
      <div class="rounded-3xl border border-blue-500/30 bg-blue-950/30 p-4 space-y-2.5">
        <input
          v-model="teacherStore.team2Name.value"
          type="text"
          class="w-full rounded-2xl border border-blue-500/30 bg-black/50 px-3 py-2 text-center text-sm font-black text-blue-400 outline-none"
        />
        <button
          type="button"
          @click="openDbModal('B')"
          class="w-full rounded-xl bg-blue-500/20 border border-blue-500/30 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/30 transition"
        >
          + {{ teacherStore.team2Name.value }}ga Qo'shish
        </button>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="s in teacherStore.teamBStudents.value"
            :key="s.name"
            class="inline-flex items-center gap-1 rounded-xl bg-blue-500/20 border border-blue-500/40 px-2.5 py-1 text-xs font-bold text-blue-200"
          >
            {{ s.name }}
            <button @click="teacherStore.removeStudent(s.name)" class="text-blue-400 hover:text-white ml-1">✕</button>
          </span>
        </div>
      </div>
    </div>

    <!-- START GAME BIG BUTTON -->
    <button
      type="button"
      @click="startGame"
      class="w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-4 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 transition-all"
    >
      Darsni Boshlash 🚀
    </button>

    <!-- 4+1 SHORTCUT ACTIONS GRID -->
    <div class="grid grid-cols-2 gap-2.5 pt-1">
      <button
        type="button"
        @click="$emit('nav', 'attendance')"
        class="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-cyan-300 border-cyan-500/20"
      >
        <span class="text-lg">📅</span> <span>Davomat</span>
      </button>
      <button
        type="button"
        @click="$emit('nav', 'leaderboard')"
        class="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-amber-300 border-amber-500/20"
      >
        <span class="text-lg">🏆</span> <span>Reyting</span>
      </button>
      <button
        type="button"
        @click="$emit('nav', 'stats')"
        class="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-purple-300 border-purple-500/20"
      >
        <span class="text-lg">📊</span> <span>Statistika</span>
      </button>
      <button
        type="button"
        @click="$emit('nav', 'market')"
        class="glass-card glass-card-hover flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-emerald-300 border-emerald-500/20"
      >
        <span class="text-lg">🛒</span> <span>Do'kon</span>
      </button>
      <button
        type="button"
        @click="$emit('nav', 'students')"
        class="col-span-2 glass-card glass-card-hover flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold text-indigo-300 border-indigo-500/30"
      >
        <span class="text-lg">👨‍🎓</span> <span>O'quvchilar Boshqaruvi & CRM</span>
      </button>
    </div>

    <!-- Modals -->
    <TaskModal
      v-model="showTaskModal"
      :target-student="taskTargetStudent"
    />

    <DbImportModal
      v-model="showDbModal"
      :target-team="dbTargetTeam"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTeacherStore } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import TaskModal from "./TaskModal.vue";
import DbImportModal from "./DbImportModal.vue";

const emit = defineEmits<{
  (e: "startGame"): void;
  (e: "nav", view: "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students"): void;
}>();

const teacherStore = useTeacherStore();

const newStudentName = ref("");
const searchQuery = ref("");
const showTaskModal = ref(false);
const taskTargetStudent = ref("");
const showDbModal = ref(false);
const dbTargetTeam = ref("standard");
const suggestedLiveDuel = teacherStore.suggestedLiveDuel;

const filteredStudents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const list = teacherStore.standardStudents.value;
  if (!query) return list;
  return list.filter((s) => s.name.toLowerCase().includes(query));
});

function openTaskModal(studentName: string = "") {
  taskTargetStudent.value = studentName;
  showTaskModal.value = true;
}

function openDbModal(team: string) {
  dbTargetTeam.value = team;
  showDbModal.value = true;
}

function addSingleStudent() {
  const name = newStudentName.value.trim();
  if (!name) return;
  if (teacherStore.isStudentFrozen(name)) {
    alert(`⚠️ "${name}" o'quvchisi tizimda muzlatilgan! Darsda qatnashishi uchun avval O'quvchilar Boshqaruvidan (CRM) uni faollashtiring.`);
    return;
  }
  teacherStore.addStudent(name);
  newStudentName.value = "";
}

async function archive(studentName: string) {
  if (!studentName || !confirm(`${studentName} arxivga o'tkazilsinmi?`)) return;
  teacherStore.removeStudent(studentName);
  try {
    await callApi("archive_student", { name: studentName });
  } catch (e) {}
}

function startSuggestedDuel() {
  const d = suggestedLiveDuel.value;
  if (!d) return;
  if (teacherStore.isStudentFrozen(d.challenger) || teacherStore.isStudentFrozen(d.target)) {
    alert("⚠️ Duel ishtirokchilaridan biri tizimda muzlatilgan!");
    suggestedLiveDuel.value = null;
    return;
  }
  teacherStore.setMode("Duel");
  teacherStore.students.value.forEach((s) => {
    if (s.team === "Duel") s.team = "standard";
  });
  teacherStore.addFromDb([d.challenger, d.target], "Duel");
  suggestedLiveDuel.value = null;
  emit("startGame");
}

function startGame() {
  const mode = teacherStore.currentMode.value;
  if (mode === "standard" && teacherStore.standardStudents.value.length === 0) {
    alert("Iltimos, o'quvchi qo'shing!");
    return;
  }
  if (mode === "Duel" && teacherStore.duelStudents.value.length !== 2) {
    alert("Duel rejimida aniq 2 ta o'quvchi bo'lishi shart!");
    return;
  }
  if (
    mode === "Jamoalar" &&
    (teacherStore.teamAStudents.value.length === 0 || teacherStore.teamBStudents.value.length === 0)
  ) {
    alert("Ikkala jamoaga ham o'quvchi qo'shing!");
    return;
  }
  emit("startGame");
}
</script>
