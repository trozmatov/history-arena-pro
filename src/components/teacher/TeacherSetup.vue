<template>
  <div class="space-y-4 max-w-xl mx-auto pb-4">
    <!-- Live Duel Challenge Banner (Firebase) -->
    <div
      v-if="suggestedLiveDuel"
      class="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 p-4 shadow-xl backdrop-blur-2xl animate-pulse relative overflow-hidden"
    >
      <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
      <div class="flex items-center justify-between gap-3 relative z-10">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-2xl shadow-inner">
            ⚔️
          </div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <span>Jonli Duel Taklifi!</span>
              <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            </div>
            <div class="text-sm font-black text-slate-900 dark:text-white">
              {{ suggestedLiveDuel.challenger }} <span class="text-amber-500 dark:text-amber-400">vs</span> {{ suggestedLiveDuel.target }}
            </div>
          </div>
        </div>
        <button
          @click="startSuggestedDuel"
          class="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
        >
          Doskaga chiqarish 🚀
        </button>
      </div>
    </div>

    <!-- Mode Selector Segmented Control (Liquid Glass Pill) -->
    <div class="flex rounded-3xl p-1.5 border border-white/60 dark:border-white/10 shadow-lg backdrop-blur-xl bg-white/50 dark:bg-[#0c162b]/80 gap-1">
      <button
        type="button"
        @click="teacherStore.setMode('standard')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'standard'
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <span>🎯</span>
        <span>Standard</span>
      </button>
      <button
        type="button"
        @click="teacherStore.setMode('Duel')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'Duel'
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <span>⚔️</span>
        <span>Duel</span>
      </button>
      <button
        type="button"
        @click="teacherStore.setMode('Jamoalar')"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-extrabold transition-all"
        :class="
          teacherStore.currentMode.value === 'Jamoalar'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <span>👥</span>
        <span>Jamoalar</span>
      </button>
    </div>

    <!-- 1. STANDARD SETUP -->
    <div v-if="teacherStore.currentMode.value === 'standard'" class="space-y-3.5">
      <!-- Quick Actions Bar: Textbook Selector -->
      <button
        type="button"
        @click="openTaskModal('')"
        class="w-full flex items-center justify-between rounded-3xl border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/20 px-4 py-3.5 text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition shadow-sm backdrop-blur-xl group"
      >
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-base group-hover:scale-110 transition-transform">
            📚
          </div>
          <div class="text-left">
            <div class="text-[10px] uppercase font-black text-cyan-500 dark:text-cyan-400">Darslik & Reja</div>
            <div class="text-xs font-bold text-slate-800 dark:text-cyan-200">Umumiy darslik & vazifa</div>
          </div>
        </div>
        <span class="rounded-xl bg-white/70 dark:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 font-black text-slate-900 dark:text-white shadow-sm max-w-[190px] truncate">
          {{ teacherStore.globalBook.value || teacherStore.globalTopic.value ? `${teacherStore.globalBook.value} | ${teacherStore.globalTopic.value}` : 'Tanlanmagan' }}
        </span>
      </button>

      <!-- Quick Student Adder + Group Import -->
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <input
              v-model="newStudentName"
              type="text"
              placeholder="Yangi o'quvchi ismi..."
              @keypress.enter="addSingleStudent"
              class="w-full liquid-glass-inset rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 transition-all"
            />
          </div>
          <!-- Neon circular "+" button -->
          <button
            type="button"
            @click="addSingleStudent"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 text-white font-black text-2xl shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:brightness-110 active:scale-90 transition-all cursor-pointer"
            title="O'quvchi qo'shish"
          >
            +
          </button>
        </div>

        <button
          type="button"
          @click="openDbModal('standard')"
          class="w-full rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 py-2.5 text-xs font-extrabold text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 shadow-sm backdrop-blur-xl active:scale-[0.99]"
        >
          <span>👥</span> <span>Bazadan Guruhlarni chaqirish</span>
        </button>
      </div>

      <!-- Student List Container Header -->
      <div class="flex items-center justify-between px-1 pt-2 text-xs">
        <span class="font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>O'QUVCHILAR RO'YXATI</span>
          <span class="px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-white/10 border border-blue-500/20 dark:border-white/15 text-[11px] font-black text-blue-600 dark:text-cyan-400">
            {{ filteredStudents.length }}
          </span>
        </span>

        <!-- Frosted Embedded Search Pill -->
        <div class="relative w-44">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Qidirish..."
            class="w-full rounded-xl liquid-glass-inset px-3 py-1.5 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      <!-- Student Items Cards (Liquid Pill Cards) -->
      <div class="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-if="teacherStore.standardStudents.value.length === 0"
          class="rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/30 dark:bg-black/20 p-8 text-center text-xs text-slate-500 backdrop-blur-xl"
        >
          <div class="text-3xl mb-1">👨‍🎓</div>
          <div class="font-bold">Hozircha o'quvchilar qo'shilmagan</div>
          <p class="text-[11px] text-slate-400 mt-1">Yuqoridagi maydondan ism kiriting yoki bazadan guruhni chaqiring.</p>
        </div>

        <div
          v-for="(s, idx) in filteredStudents"
          :key="s.name"
          class="flex items-center justify-between rounded-2xl liquid-glass-card p-3 group transition-all"
        >
          <!-- Left: Seat index badge + name + group tag -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Seat Index Badge -->
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-white/10 border border-slate-300/60 dark:border-white/10 font-black text-xs text-slate-700 dark:text-cyan-300 shadow-inner">
              #{{ idx + 1 }}
            </span>

            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  @click="teacherStore.openStudentDoskaGlobal(s.name)"
                  class="text-sm font-black text-slate-900 dark:text-white cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition truncate"
                  title="O'quvchining shaxsiy doskasini ochish"
                >
                  {{ s.name }}
                </span>

                <!-- Assigned Group / Subject Tag ("7-Jahon") -->
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 dark:bg-cyan-500/15 text-blue-600 dark:text-cyan-300 border border-blue-500/25 dark:border-cyan-500/30">
                  {{ getStudentGroupTag(s) }}
                </span>
              </div>

              <div v-if="s.book || s.topic" class="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold truncate pt-0.5">
                📖 {{ s.book }} {{ s.topic ? `(${s.topic})` : '' }}
              </div>
            </div>
          </div>

          <!-- Right: Glass Bubble Action Buttons (Box/Inventory, Edit, Remove) -->
          <div class="flex items-center gap-1.5 shrink-0 ml-2">
            <!-- 1. Box / Inventory -->
            <button
              type="button"
              @click="archive(s.name)"
              class="h-8 w-8 flex items-center justify-center rounded-full liquid-glass-bubble bg-slate-200/80 dark:bg-white/10 border border-slate-300/70 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 text-xs shadow-sm"
              title="Arxivga o'tkazish"
            >
              📦
            </button>
            <!-- 2. Edit / Task -->
            <button
              type="button"
              @click="openTaskModal(s.name)"
              class="h-8 w-8 flex items-center justify-center rounded-full liquid-glass-bubble bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/30 text-xs shadow-sm"
              title="Vazifa belgilash"
            >
              ✏️
            </button>
            <!-- 3. Remove -->
            <button
              type="button"
              @click="teacherStore.removeStudent(s.name)"
              class="h-8 w-8 flex items-center justify-center rounded-full liquid-glass-bubble bg-red-500/15 dark:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/30 text-xs shadow-sm"
              title="O'chirish"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. DUEL SETUP -->
    <div v-else-if="teacherStore.currentMode.value === 'Duel'" class="space-y-3.5">
      <button
        type="button"
        @click="openDbModal('Duel')"
        class="w-full rounded-2xl border border-purple-500/30 bg-purple-500/15 dark:bg-purple-950/20 py-3 text-xs font-extrabold text-purple-700 dark:text-purple-300 hover:bg-purple-500/25 transition flex items-center justify-center gap-2 shadow-sm backdrop-blur-xl"
      >
        <span>👥</span> <span>Bazadan 2 kishini tanlash</span>
      </button>

      <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
        <div
          v-if="teacherStore.duelStudents.value.length === 0"
          class="rounded-3xl border border-dashed border-purple-400/30 bg-purple-500/5 p-8 text-center text-xs text-purple-600 dark:text-purple-300 backdrop-blur-xl"
        >
          ⚔️ Duel bellashuvi uchun aniq 2 nafar o'quvchini tanlang.
        </div>

        <div
          v-for="(s, idx) in teacherStore.duelStudents.value"
          :key="s.name"
          class="flex items-center justify-between rounded-2xl liquid-glass-card border-purple-500/30 p-3.5 shadow-md"
        >
          <div class="flex items-center gap-3">
            <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 font-black text-xs text-purple-600 dark:text-purple-300">
              #{{ idx + 1 }}
            </span>
            <div>
              <span
                @click="teacherStore.openStudentDoskaGlobal(s.name)"
                class="text-sm font-black text-slate-900 dark:text-white cursor-pointer hover:text-purple-400 hover:underline transition"
              >
                {{ s.name }}
              </span>
              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                {{ getStudentGroupTag(s) }}
              </span>
            </div>
          </div>
          <button
            type="button"
            @click="teacherStore.removeStudent(s.name)"
            class="h-8 w-8 flex items-center justify-center rounded-full liquid-glass-bubble bg-red-500/15 border border-red-500/30 text-red-500 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- 3. JAMOALAR SETUP -->
    <div v-else-if="teacherStore.currentMode.value === 'Jamoalar'" class="space-y-3.5">
      <!-- Team A -->
      <div class="rounded-3xl border border-red-500/30 bg-red-500/10 dark:bg-red-950/25 p-4 space-y-2.5 backdrop-blur-xl">
        <input
          v-model="teacherStore.team1Name.value"
          type="text"
          class="w-full rounded-2xl liquid-glass-inset px-3 py-2 text-center text-sm font-black text-red-600 dark:text-red-400 outline-none"
        />
        <button
          type="button"
          @click="openDbModal('A')"
          class="w-full rounded-xl bg-red-500/20 border border-red-500/30 py-2 text-xs font-bold text-red-600 dark:text-red-300 hover:bg-red-500/30 transition"
        >
          + {{ teacherStore.team1Name.value }}ga Qo'shish
        </button>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="s in teacherStore.teamAStudents.value"
            :key="s.name"
            class="inline-flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-200"
          >
            <span
              @click="teacherStore.openStudentDoskaGlobal(s.name)"
              class="cursor-pointer hover:underline"
            >
              {{ s.name }}
            </span>
            <button @click="teacherStore.removeStudent(s.name)" class="text-red-500 hover:text-red-700 dark:hover:text-white ml-1">✕</button>
          </span>
        </div>
      </div>

      <!-- Team B -->
      <div class="rounded-3xl border border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/25 p-4 space-y-2.5 backdrop-blur-xl">
        <input
          v-model="teacherStore.team2Name.value"
          type="text"
          class="w-full rounded-2xl liquid-glass-inset px-3 py-2 text-center text-sm font-black text-blue-600 dark:text-blue-400 outline-none"
        />
        <button
          type="button"
          @click="openDbModal('B')"
          class="w-full rounded-xl bg-blue-500/20 border border-blue-500/30 py-2 text-xs font-bold text-blue-600 dark:text-blue-300 hover:bg-blue-500/30 transition"
        >
          + {{ teacherStore.team2Name.value }}ga Qo'shish
        </button>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="s in teacherStore.teamBStudents.value"
            :key="s.name"
            class="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-200"
          >
            <span
              @click="teacherStore.openStudentDoskaGlobal(s.name)"
              class="cursor-pointer hover:underline"
            >
              {{ s.name }}
            </span>
            <button @click="teacherStore.removeStudent(s.name)" class="text-blue-500 hover:text-blue-700 dark:hover:text-white ml-1">✕</button>
          </span>
        </div>
      </div>
    </div>

    <!-- Floating CTA: "DARSNI BOSHLASH" button -->
    <button
      type="button"
      @click="startGame"
      class="w-full rounded-3xl liquid-pulse-cta py-4 text-base font-black uppercase tracking-wider text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
    >
      <span>DARSNI BOSHLASH</span>
      <span class="text-xl">🚀</span>
    </button>

    <!-- Shortcut Actions Grid (Liquid Glass) -->
    <div class="grid grid-cols-2 gap-2.5 pt-1">
      <button
        type="button"
        @click="$emit('nav', 'certificates')"
        class="liquid-glass-card flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-amber-600 dark:text-amber-300 border-amber-500/30 hover:border-amber-400 shadow-sm cursor-pointer"
      >
        <span class="text-lg">📜</span> <span>Sertifikatlar</span>
      </button>
      <button
        type="button"
        @click="$emit('nav', 'students')"
        class="liquid-glass-card flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-indigo-600 dark:text-indigo-300 border-indigo-500/30 hover:border-indigo-400 shadow-sm cursor-pointer"
      >
        <span class="text-lg">👨‍🎓</span> <span>CRM & O'quvchilar</span>
      </button>

      <!-- Direct Student Portal Switcher -->
      <button
        type="button"
        @click="switchToStudent"
        class="liquid-glass-card col-span-2 flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:border-indigo-400 shadow-sm cursor-pointer active:scale-95 transition"
      >
        <span class="text-base">🎓</span> <span>O'quvchi Kabinetiga O'tish (Login & Profil)</span>
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
import { useTeacherStore, Student } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import TaskModal from "./TaskModal.vue";
import DbImportModal from "./DbImportModal.vue";

const emit = defineEmits<{
  (e: "startGame"): void;
  (e: "nav", view: "attendance" | "leaderboard" | "stats" | "market" | "chat" | "students" | "challenge" | "ai-exam" | "certificates"): void;
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

function getStudentGroupTag(student: Student): string {
  if (student.group && student.group.trim()) {
    return student.group;
  }
  const inRegistry = teacherStore.findStudentInRegistry(student.id || student.name);
  if (inRegistry && inRegistry.group && inRegistry.group.trim()) {
    return inRegistry.group;
  }
  return "7-Jahon";
}

function openTaskModal(studentName: string = "") {
  taskTargetStudent.value = studentName;
  showTaskModal.value = true;
}

function switchToStudent() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("ha_active_role", "student");
    } catch (_) {}
    window.location.hash = "#/student";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
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
