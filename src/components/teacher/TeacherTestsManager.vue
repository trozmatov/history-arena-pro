<template>
  <div class="w-full">
    <!-- 1. FULL-PAGE TEST STUDIO VIEW (Active when creating or editing a test) -->
    <TestStudioView
      v-if="currentMode === 'studio' && selectedTestForStudio"
      :initial-test="selectedTestForStudio"
      :folders="folders"
      @save="handleSaveStudioTest"
      @cancel="currentMode = 'list'"
    />

    <!-- 2. MAIN TESTS MANAGER DASHBOARD -->
    <div v-else class="space-y-4 max-w-5xl mx-auto pb-12">
      <!-- Top Hero Header -->
      <div class="liquid-glass-card rounded-[2.5rem] p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white text-2xl shadow-lg shadow-indigo-500/25">
            📝
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Testlar va Imtihonlar Boshqaruvi
              </h2>
              <span class="rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-black uppercase">
                Sinflar & Anti-Cheat
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Google Forms orqali yuklang, to'laqonli studiyada tahrirlang va sinflar kesimida tashkil qiling
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="showImportModal = true"
            class="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span>
            <span>Google Forms Import</span>
          </button>
          <button
            type="button"
            @click="openNewTestEditor"
            class="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span>Yangi Test (Studio)</span>
          </button>
        </div>
      </div>

      <!-- Segmented Tabs: Testlar ro'yxati vs O'quvchilar natijalari -->
      <div class="flex rounded-2xl p-1 border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl gap-1 text-xs max-w-md">
        <button
          type="button"
          @click="viewTab = 'tests'"
          class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            viewTab === 'tests'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>📚</span>
          <span>Testlar ({{ tests.length }})</span>
        </button>
        <button
          type="button"
          @click="viewTab = 'results'"
          class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            viewTab === 'results'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>🏆</span>
          <span>Natijalar ({{ examResults.length }})</span>
        </button>
      </div>

      <!-- ==========================================
           FOLDER / CLASS FILTER BAR (Sinflar Kesimida)
           ========================================== -->
      <div v-if="viewTab === 'tests'" class="space-y-2">
        <div class="flex items-center justify-between text-xs px-1">
          <span class="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>📁</span>
            <span>Sinflar va Bo'limlar kesimida:</span>
          </span>
          <button
            type="button"
            @click="promptNewFolder"
            class="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>+ Yangi Bo'lim Ochish</span>
          </button>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <!-- All Tests Filter -->
          <button
            type="button"
            @click="selectedFolderId = 'all'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border"
            :class="
              selectedFolderId === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                : 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80'
            "
          >
            <span>📂 Barchasi</span>
            <span class="rounded-full px-1.5 py-0.2 text-[10px] bg-black/10 dark:bg-white/20">
              {{ tests.length }}
            </span>
          </button>

          <!-- System & Custom Folders (Umumiy, 5-sinf, 6-sinf, ...) -->
          <button
            v-for="folder in folders"
            :key="folder.id"
            @click="selectedFolderId = folder.id"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border"
            :class="
              selectedFolderId === folder.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md'
                : 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80'
            "
          >
            <span>{{ folder.icon || '📁' }}</span>
            <span>{{ folder.name }}</span>
            <span class="rounded-full px-1.5 py-0.2 text-[10px] bg-black/10 dark:bg-white/20">
              {{ getFolderTestsCount(folder.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- TAB 1: TESTS LIST -->
      <div v-if="viewTab === 'tests'" class="space-y-3">
        <!-- Empty State -->
        <div v-if="filteredTests.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 space-y-3 bg-white/30 dark:bg-black/20">
          <div class="text-4xl">📝</div>
          <div class="text-sm font-bold text-slate-400">
            {{ selectedFolderId === 'all' ? 'Hozircha testlar mavjud emas' : 'Ushbu bo\'limda hozircha test yo\'q' }}
          </div>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Google Forms orqali test yuklang yoki to'g'ridan-to'g'ri yangi test tuzing.
          </p>
          <div class="pt-2 flex justify-center gap-2">
            <button
              type="button"
              @click="openNewTestEditor"
              class="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer shadow-md"
            >
              ➕ Ushbu bo'limga test qo'shish
            </button>
            <button
              type="button"
              @click="testsStore.resetSampleTests()"
              class="px-4 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 transition cursor-pointer"
            >
              ⚡ Namunaviy Testlarni Yuklash
            </button>
          </div>
        </div>

        <!-- Tests Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="test in filteredTests"
            :key="test.id"
            class="liquid-glass-card rounded-3xl p-5 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between gap-4 transition hover:border-indigo-500/40"
          >
            <!-- Card Header -->
            <div class="space-y-2.5">
              <div class="flex items-start justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <!-- Folder Badge -->
                  <span class="rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-black uppercase">
                    📁 {{ getFolderName(test.folderId) }}
                  </span>

                  <!-- Source Badge -->
                  <span
                    class="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border"
                    :class="
                      test.source === 'google_forms'
                        ? 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300'
                        : 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                    "
                  >
                    {{ test.source === 'google_forms' ? '📥 Google Forms' : '✍️ Qo\'lda' }}
                  </span>

                  <!-- Image Badge if has question with image -->
                  <span
                    v-if="hasQuestionImage(test)"
                    class="rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-black"
                  >
                    🖼️ Rasmli
                  </span>
                </div>

                <!-- Publish toggle pill -->
                <button
                  type="button"
                  @click="testsStore.togglePublish(test.id)"
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase transition cursor-pointer"
                  :class="
                    test.published
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/20 text-slate-500 dark:text-slate-400 border border-slate-500/30'
                  "
                >
                  {{ test.published ? '● Faol (Published)' : '○ Qoralama' }}
                </button>
              </div>

              <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
                {{ test.title }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {{ test.description || "Tavsif kiritilmagan" }}
              </p>
            </div>

            <!-- Specs & Anti-Cheat Pills -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span class="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 font-bold">
                  ❓ {{ test.questions.length }} ta savol
                </span>
                <span class="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 font-bold">
                  ⏱️ {{ test.timeLimitMinutes > 0 ? `${test.timeLimitMinutes} daqiqa` : 'Vaqt cheklovisiz' }}
                </span>
                <span class="rounded-lg bg-black/5 dark:bg-white/5 px-2 py-0.5 font-bold">
                  🎯 {{ calculateTotalPoints(test) }} ball
                </span>
              </div>

              <!-- Anti-Cheat Badges -->
              <div class="flex flex-wrap gap-1 text-[9.5px] font-black uppercase">
                <span
                  v-if="test.antiCheat.zeroTolerance"
                  class="rounded bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 px-1.5 py-0.5"
                >
                  🚫 0-Toleransiya (Tab block)
                </span>
                <span
                  v-if="test.antiCheat.blockScreenshot"
                  class="rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5"
                >
                  📸 Skrinshot taqiq
                </span>
                <span
                  v-if="test.antiCheat.fullscreenRequired"
                  class="rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5"
                >
                  ⛶ To'liq Ekran
                </span>
              </div>
            </div>

            <!-- Card Footer Actions: Folder Selector & Edit Studio button -->
            <div class="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
              <!-- Quick Folder Change Select -->
              <div class="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Ko'chirish:</span>
                <select
                  :value="test.folderId || 'folder_umumiy'"
                  @change="handleQuickMoveFolder(test, ($event.target as HTMLSelectElement).value)"
                  class="rounded-lg bg-black/5 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-xs px-2 py-0.5 font-bold outline-none cursor-pointer text-slate-800 dark:text-white"
                >
                  <option
                    v-for="folder in folders"
                    :key="folder.id"
                    :value="folder.id"
                    class="bg-slate-900 text-white"
                  >
                    {{ folder.name }}
                  </option>
                </select>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="openShareModal(test)"
                  class="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                  title="Havolani olish va o'quvchilarga ulashish"
                >
                  <span>🔗</span>
                  <span>Ulashish</span>
                </button>
                <button
                  type="button"
                  @click="openEditTest(test)"
                  class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black hover:brightness-110 transition cursor-pointer shadow-md flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>Tahrirlash</span>
                </button>
                <button
                  type="button"
                  @click="confirmDelete(test.id)"
                  class="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="O'chirish"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: EXAM RESULTS LIST -->
      <div v-else-if="viewTab === 'results'" class="space-y-3">
        <div v-if="examResults.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 space-y-2 bg-white/30 dark:bg-black/20">
          <div class="text-4xl">🏆</div>
          <div class="text-sm font-bold text-slate-400">Hozircha topshirilgan testlar yo'q</div>
          <p class="text-xs text-slate-500">O'quvchilar testlarni topshirgach, ularning ballari va xavfsizlik jurnali bu yerda paydo bo'ladi.</p>
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="res in examResults"
            :key="res.id"
            class="liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-black text-slate-900 dark:text-white truncate">
                  {{ res.studentName }}
                </span>
                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-black uppercase"
                  :class="
                    res.disqualified
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                      : res.passed
                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  "
                >
                  {{ res.disqualified ? '🚫 Diskvalifikatsiya' : res.passed ? '✓ O\'tdi' : '✖ Yiqildi' }}
                </span>
                <span class="text-[11px] text-slate-400">
                  • {{ res.testTitle }}
                </span>
              </div>

              <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                <span>Ball: <b class="text-indigo-600 dark:text-indigo-300">{{ res.score }} / {{ res.totalPoints }}</b> ({{ res.percentage }}%)</span>
                <span>Sarflangan vaqt: {{ res.durationSeconds }}s</span>
              </div>

              <div v-if="res.disqualifiedReason" class="text-[11px] text-rose-500 font-bold">
                Sabab: {{ res.disqualifiedReason }}
              </div>
            </div>

            <!-- Violations badge -->
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="rounded-xl px-2.5 py-1 text-xs font-bold"
                :class="
                  res.violations.length > 0
                    ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                "
              >
                🛡️ {{ res.violations.length }} ta qoidabuzarlik
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Google Forms Import Modal -->
      <GoogleFormsImportModal
        v-model="showImportModal"
        @imported="handleTestImported"
      />

      <!-- Share Test Modal -->
      <ShareTestModal
        v-model="showShareModal"
        :test="selectedTestForShare"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTestsStore } from "../../composables/useTestsStore";
import type { TestExam } from "../../types/test";
import GoogleFormsImportModal from "./GoogleFormsImportModal.vue";
import TestStudioView from "./TestStudioView.vue";
import ShareTestModal from "../common/ShareTestModal.vue";

const testsStore = useTestsStore();
const { tests, folders, examResults } = testsStore;

type ViewMode = "list" | "studio";
const currentMode = ref<ViewMode>("list");
const viewTab = ref<"tests" | "results">("tests");
const selectedFolderId = ref<string>("all");

const showImportModal = ref(false);
const showShareModal = ref(false);
const selectedTestForShare = ref<TestExam | null>(null);
const selectedTestForStudio = ref<TestExam | null>(null);

function openShareModal(test: TestExam) {
  selectedTestForShare.value = test;
  showShareModal.value = true;
}

const filteredTests = computed(() => {
  if (selectedFolderId.value === "all") return tests.value;
  return tests.value.filter((t) => (t.folderId || "folder_umumiy") === selectedFolderId.value);
});

function getFolderTestsCount(folderId: string): number {
  return tests.value.filter((t) => (t.folderId || "folder_umumiy") === folderId).length;
}

function getFolderName(folderId?: string): string {
  const f = folders.value.find((item) => item.id === folderId);
  return f ? f.name : "Umumiy (Aralash)";
}

function hasQuestionImage(test: TestExam): boolean {
  return test.questions.some((q) => !!q.imageUrl);
}

function calculateTotalPoints(test: TestExam): number {
  return test.questions.reduce((sum, q) => sum + (q.points || 1), 0);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString("uz-UZ")} ${d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}`;
}

// 1. OPEN STUDIO TO CREATE NEW TEST
function openNewTestEditor() {
  const defaultFolder = selectedFolderId.value !== "all" ? selectedFolderId.value : "folder_umumiy";
  const matched = folders.value.find((f) => f.id === defaultFolder);

  const newTest: TestExam = {
    id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: "Yangi Nazorat Testi",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: true,
    timeLimitMinutes: 15,
    folderId: defaultFolder,
    targetGrade: matched?.name.includes("sinf") ? matched.name : "Umumiy",
    source: "manual",
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true,
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 30,
    },
    questions: [
      {
        id: `q_1`,
        text: "1-savol matnini bu yerga yozing...",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "opt_1", text: "Variant A (To'g'ri)", isCorrect: true },
          { id: "opt_2", text: "Variant B", isCorrect: false },
          { id: "opt_3", text: "Variant C", isCorrect: false },
          { id: "opt_4", text: "Variant D", isCorrect: false },
        ],
      },
    ],
  };

  selectedTestForStudio.value = newTest;
  currentMode.value = "studio";
}

// 2. OPEN STUDIO TO EDIT EXISTING TEST
function openEditTest(test: TestExam) {
  selectedTestForStudio.value = test;
  currentMode.value = "studio";
}

// 3. IMMEDIATE TRANSITION TO STUDIO UPON GOOGLE FORMS IMPORT
function handleTestImported(test: TestExam) {
  showImportModal.value = false;
  // If no folder assigned, assign to currently selected folder or Umumiy
  if (!test.folderId || test.folderId === "folder_umumiy") {
    test.folderId = selectedFolderId.value !== "all" ? selectedFolderId.value : "folder_umumiy";
  }
  // Transition directly to full-screen Test Studio for editing and fine-tuning!
  selectedTestForStudio.value = test;
  currentMode.value = "studio";
}

// 4. SAVE TEST FROM STUDIO
function handleSaveStudioTest(saved: TestExam) {
  testsStore.saveTest(saved);
  currentMode.value = "list";
}

function handleQuickMoveFolder(test: TestExam, newFolderId: string) {
  test.folderId = newFolderId;
  const matched = folders.value.find((f) => f.id === newFolderId);
  if (matched) {
    test.targetGrade = matched.name.includes("sinf") ? matched.name : "Umumiy";
  }
  testsStore.saveTest(test);
}

function promptNewFolder() {
  const name = prompt("Yangi bo'lim yoki sinf nomini kiriting (masalan: 10-A sinf, DTM Tarix):");
  if (name && name.trim()) {
    const f = testsStore.addFolder(name.trim());
    selectedFolderId.value = f.id;
  }
}

function confirmDelete(id: string) {
  if (confirm("Haqiqatan ham ushbu testni o'chirmoqchimisiz?")) {
    testsStore.deleteTest(id);
  }
}
</script>
