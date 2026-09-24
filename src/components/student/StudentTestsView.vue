<template>
  <div class="space-y-4 w-full max-w-4xl mx-auto pb-12">
    <!-- Active Exam Runner Modal / Fullscreen Overlay (Self-Teleporting) -->
    <AntiCheatExamRunner
      v-if="activeTestRunning"
      :test="activeTestRunning"
      :student-name="studentDisplayName"
      :student-id="studentDisplayId"
      @cancel="activeTestRunning = null"
      @finished="handleExamFinished"
    />

    <!-- Top Hero Card (Liquid Glass) -->
    <div class="apple-glass-card rounded-[2.5rem] p-5 sm:p-7 relative overflow-hidden border border-white/60 dark:border-white/10 shadow-2xl">
      <!-- Ambient Glow -->
      <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-b from-indigo-500/25 via-blue-500/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div class="flex items-center gap-3">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white text-3xl shadow-xl shadow-blue-500/30">
            📝
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Imtihonlar va Testlar
              </h2>
              <span class="rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-black uppercase">
                Sinflar Kesimida
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ustozingiz tayyorlagan Google Forms va xavfsiz nazorat testlari
            </p>
          </div>
        </div>

        <!-- Quick Stats Pills -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="liquid-glass-inset rounded-2xl px-3.5 py-2 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Mavjud</div>
            <div class="text-base font-black text-indigo-600 dark:text-indigo-400">
              {{ publishedTests.length }} ta
            </div>
          </div>
          <div class="liquid-glass-inset rounded-2xl px-3.5 py-2 text-center border border-white/10">
            <div class="text-[10px] font-bold text-slate-400 uppercase">Topshirilgan</div>
            <div class="text-base font-black text-emerald-600 dark:text-emerald-400">
              {{ myResults.length }} ta
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Segmented Tabs: Mavjud Testlar vs Mening Natijalarim -->
    <div class="flex rounded-2xl p-1 border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl gap-1 text-xs max-w-sm">
      <button
        type="button"
        @click="activeTab = 'available'"
        class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        :class="
          activeTab === 'available'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <span>📚</span>
        <span>Testlar ({{ publishedTests.length }})</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'history'"
        class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        :class="
          activeTab === 'history'
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        "
      >
        <span>🏆</span>
        <span>Natijalarim ({{ myResults.length }})</span>
      </button>
    </div>

    <!-- ==========================================
         STUDENT CLASS / FOLDER FILTER TABS
         (Sinflar kesimida saqlangan va aralash testlar)
         ========================================== -->
    <div v-if="activeTab === 'available'" class="space-y-1.5">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar select-none -mx-1 px-1 touch-pan-x">
        <!-- All classes filter -->
        <button
          type="button"
          @click="selectedFolderId = 'all'"
          class="px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border active:scale-95"
          :class="
            selectedFolderId === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20'
              : 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
          "
        >
          <span>📂 Barcha Sinflar</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px] bg-black/10 dark:bg-white/20 font-bold">
            {{ publishedTests.length }}
          </span>
        </button>

        <!-- Grade & Category Folders -->
        <button
          v-for="folder in folders"
          :key="folder.id"
          @click="selectedFolderId = folder.id"
          class="px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 flex items-center gap-1.5 cursor-pointer border active:scale-95"
          :class="
            selectedFolderId === folder.id
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
              : 'bg-white/60 dark:bg-white/5 border-white/40 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10'
          "
        >
          <span>{{ folder.icon || '📁' }}</span>
          <span>{{ folder.name }}</span>
          <span class="rounded-full px-1.5 py-0.2 text-[10px] bg-black/10 dark:bg-white/20 font-bold">
            {{ getFolderPublishedCount(folder.id) }}
          </span>
        </button>
      </div>
    </div>

    <!-- TAB 1: AVAILABLE TESTS LIST -->
    <div v-if="activeTab === 'available'" class="space-y-3.5">
      <div v-if="filteredTests.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 space-y-3 bg-white/30 dark:bg-black/20">
        <div class="text-4xl">📭</div>
        <div class="text-sm font-bold text-slate-400">
          {{ selectedFolderId === 'all' ? 'Hozircha faol testlar yo\'q' : 'Ushbu sinfda hozircha test mavjud emas' }}
        </div>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          Namunaviy Google Forms testlarini yuklash uchun quyidagi tugmani bosing:
        </p>
        <button
          type="button"
          @click="testsStore.resetSampleTests()"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black hover:brightness-110 active:scale-95 transition shadow-lg cursor-pointer"
        >
          ⚡ Namunaviy Testlarni Yuklash
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="test in filteredTests"
          :key="test.id"
          class="liquid-glass-card rounded-3xl p-5 border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between gap-4 transition hover:border-indigo-500/40"
        >
          <div class="space-y-2.5">
            <!-- Source, Folder & Status badge -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                <!-- Folder Badge -->
                <span class="rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-black uppercase">
                  📁 {{ getFolderName(test.folderId) }}
                </span>

                <span
                  class="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border"
                  :class="
                    test.source === 'google_forms'
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-300'
                      : 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                  "
                >
                  {{ test.source === 'google_forms' ? '📥 Google Forms' : '📝 Nazorat Testi' }}
                </span>

                <span
                  v-if="hasQuestionImage(test)"
                  class="rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-black"
                >
                  🖼️ Rasmli
                </span>
              </div>

              <!-- Previous score badge if already taken -->
              <span
                v-if="getLatestResultForTest(test.id)"
                class="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border"
                :class="
                  getLatestResultForTest(test.id)?.disqualified
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                    : getLatestResultForTest(test.id)?.passed
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                "
              >
                Natija: {{ getLatestResultForTest(test.id)?.score }}/{{ getLatestResultForTest(test.id)?.totalPoints }}
              </span>
            </div>

            <!-- Test Cover Image Banner (If questions have image) -->
            <div
              v-if="getTestPreviewImage(test)"
              class="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-inner group-hover:scale-[1.01] transition-transform duration-300"
            >
              <img
                :src="getTestPreviewImage(test)"
                :alt="test.title"
                class="w-full h-full object-cover object-center brightness-90 group-hover:brightness-100 transition duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <span class="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30 flex items-center gap-1">
                🖼️ Rasmli Savollar Mavjud
              </span>
            </div>

            <h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
              {{ test.title }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {{ test.description || "Ushbu test uchun qo'shimcha tavsif kiritilmagan." }}
            </p>
          </div>

          <!-- Specs & Anti-Cheat Pills -->
          <div class="space-y-2.5">
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

            <!-- Anti-Cheat Warning Badges -->
            <div class="flex flex-wrap gap-1 text-[9.5px] font-black uppercase">
              <span
                v-if="test.antiCheat.zeroTolerance"
                class="rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-1.5 py-0.5"
              >
                🚫 0-Toleransiya (Tab block)
              </span>
              <span
                v-if="test.antiCheat.blockScreenshot"
                class="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5"
              >
                📸 Skrinshot taqiq
              </span>
              <span
                v-if="test.antiCheat.fullscreenRequired"
                class="rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5"
              >
                ⛶ To'liq Ekran
              </span>
            </div>
          </div>

          <!-- Start Button -->
          <div class="border-t border-white/10 pt-3 flex items-center justify-between">
            <span class="text-[10px] text-slate-400">
              Taymer: {{ test.antiCheat.questionTimerSeconds || 30 }}s / savol
            </span>

            <button
              type="button"
              @click="startExam(test)"
              class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{{ getLatestResultForTest(test.id) ? 'Qayta Topshirish' : 'Testni Boshlash' }}</span>
              <span>🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: MY RESULTS HISTORY -->
    <div v-else-if="activeTab === 'history'" class="space-y-3">
      <div v-if="myResults.length === 0" class="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 space-y-2 bg-white/30 dark:bg-black/20">
        <div class="text-4xl">🏆</div>
        <div class="text-sm font-bold text-slate-400">Hozircha natijalar yo'q</div>
        <p class="text-xs text-slate-500">Mavjud testlardan birini topshiring, natijangiz bu yerda saqlanadi.</p>
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="res in myResults"
          :key="res.id"
          class="liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-black text-slate-900 dark:text-white truncate">
                {{ res.testTitle }}
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
                {{ res.disqualified ? '🚫 Bekor qilingan' : res.passed ? '✓ O\'tdingiz' : '✖ Yiqildingiz' }}
              </span>
            </div>

            <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
              <span>To'plangan ball: <b class="text-indigo-600 dark:text-indigo-300">{{ res.score }} / {{ res.totalPoints }}</b> ({{ res.percentage }}%)</span>
              <span>Sarflangan vaqt: {{ res.durationSeconds }} soniya</span>
              <span>{{ formatDate(res.completedAt) }}</span>
            </div>

            <div v-if="res.disqualificationReason" class="text-[11px] text-rose-500 font-bold">
              Sabab: {{ res.disqualificationReason }}
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
              ⚠️ {{ res.violations.length }} ta qoidabuzarlik
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TestExam, ExamResult } from "../../types/test";
import { useTestsStore } from "../../composables/useTestsStore";
import { useStudentStore } from "../../composables/useStudentStore";
import AntiCheatExamRunner from "./AntiCheatExamRunner.vue";

const testsStore = useTestsStore();
const { publishedTests, folders } = testsStore;
const studentStore = useStudentStore();

const activeTab = ref<"available" | "history">("available");
const selectedFolderId = ref<string>("all");
const activeTestRunning = ref<TestExam | null>(null);

const myResults = computed(() => {
  const byName = testsStore.getStudentResults(studentDisplayName.value);
  const byId = testsStore.getStudentResults(studentDisplayId.value);
  const map = new Map<string, ExamResult>();
  [...byName, ...byId].forEach((r) => map.set(r.id, r));
  return Array.from(map.values()).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
});

const studentDisplayName = computed(() => {
  const name =
    studentStore.studentName?.value ||
    (typeof studentStore.studentName === "string" ? studentStore.studentName : "");
  return name || "O'quvchi";
});

const studentDisplayId = computed(() => {
  return studentDisplayName.value.toLowerCase().replace(/\s+/g, "_") || "std_guest";
});

const filteredTests = computed(() => {
  if (selectedFolderId.value === "all") return publishedTests.value;
  return publishedTests.value.filter((t) => (t.folderId || "folder_umumiy") === selectedFolderId.value);
});

function getFolderPublishedCount(folderId: string): number {
  return publishedTests.value.filter((t) => (t.folderId || "folder_umumiy") === folderId).length;
}

function getFolderName(folderId?: string): string {
  const f = folders.value.find((item) => item.id === folderId);
  return f ? f.name : "Umumiy (Aralash)";
}

function hasQuestionImage(test: TestExam): boolean {
  return test.questions.some((q) => !!q.imageUrl);
}

function getTestPreviewImage(test: TestExam): string | undefined {
  return test.questions.find((q) => !!q.imageUrl)?.imageUrl;
}

function calculateTotalPoints(test: TestExam): number {
  return test.questions.reduce((sum, q) => sum + (q.points || 1), 0);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString("uz-UZ")} ${d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}`;
}

function getLatestResultForTest(testId: string): ExamResult | undefined {
  return myResults.value.find((r) => r.testId === testId);
}

function startExam(test: TestExam) {
  activeTestRunning.value = test;
}

function handleExamFinished(result: ExamResult | null) {
  activeTestRunning.value = null;
  activeTab.value = "history";
}
</script>
