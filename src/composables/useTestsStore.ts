/**
 * Reactive Tests Store for Teacher & Student
 * History Arena PRO
 */

import { ref, computed } from "vue";
import type { TestExam, ExamResult, Question, TestFolder } from "../types/test";
import { SAMPLE_GOOGLE_FORM_TESTS } from "../services/googlePickerService";

const STORAGE_KEY_TESTS = "ha_tests_v2";
const STORAGE_KEY_RESULTS = "ha_exam_results_v2";
const STORAGE_KEY_FOLDERS = "ha_test_folders_v2";

export const DEFAULT_TEST_FOLDERS: TestFolder[] = [
  { id: "folder_umumiy", name: "Umumiy (Aralash)", icon: "🌐", color: "blue", isSystem: true },
  { id: "folder_5_sinf", name: "5-sinf", icon: "📘", color: "indigo", isSystem: true },
  { id: "folder_6_sinf", name: "6-sinf", icon: "📘", color: "indigo", isSystem: true },
  { id: "folder_7_sinf", name: "7-sinf", icon: "📗", color: "emerald", isSystem: true },
  { id: "folder_8_sinf", name: "8-sinf", icon: "📗", color: "emerald", isSystem: true },
  { id: "folder_9_sinf", name: "9-sinf", icon: "📙", color: "amber", isSystem: true },
  { id: "folder_10_sinf", name: "10-sinf", icon: "📕", color: "rose", isSystem: true },
  { id: "folder_11_sinf", name: "11-sinf", icon: "📕", color: "purple", isSystem: true },
];

// Global reactive singletons
const tests = ref<TestExam[]>(loadTestsFromStorage());
const examResults = ref<ExamResult[]>(loadResultsFromStorage());
const folders = ref<TestFolder[]>(loadFoldersFromStorage());

function loadFoldersFromStorage(): TestFolder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Folders load error:", e);
  }
  return [...DEFAULT_TEST_FOLDERS];
}

function persistFolders() {
  try {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders.value));
  } catch (e) {
    console.warn("Folders persist error:", e);
  }
}

function loadTestsFromStorage(): TestExam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: TestExam) => ({
          ...t,
          folderId: t.folderId || "folder_umumiy",
          targetGrade: t.targetGrade || (t.folderId?.includes("sinf") ? t.folderId.replace("folder_", "").replace("_", "-") : "Umumiy"),
        }));
      }
    }
  } catch (e) {
    console.warn("Tests store load error:", e);
  }
  // Initialize with built-in sample Google Forms tests
  const initial = JSON.parse(JSON.stringify(SAMPLE_GOOGLE_FORM_TESTS)).map((t: TestExam) => ({
    ...t,
    folderId: t.folderId || "folder_umumiy",
    targetGrade: t.targetGrade || "Umumiy",
  }));
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(initial));
  } catch (e) {}
  return initial;
}

function loadResultsFromStorage(): ExamResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESULTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Results store load error:", e);
  }
  return [];
}

function persistTests() {
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests.value));
  } catch (e) {
    console.warn("Tests store persist error:", e);
  }
}

function persistResults() {
  try {
    localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(examResults.value));
  } catch (e) {
    console.warn("Results store persist error:", e);
  }
}

export function useTestsStore() {
  const publishedTests = computed(() =>
    tests.value.filter((t) => t.published)
  );

  function getTestById(id: string): TestExam | undefined {
    return tests.value.find((t) => t.id === id);
  }

  function saveTest(test: TestExam): void {
    const idx = tests.value.findIndex((t) => t.id === test.id);
    test.updatedAt = Date.now();
    if (idx >= 0) {
      tests.value[idx] = { ...test };
    } else {
      tests.value.unshift({ ...test });
    }
    persistTests();
  }

  function deleteTest(id: string): void {
    tests.value = tests.value.filter((t) => t.id !== id);
    persistTests();
  }

  function togglePublish(id: string): void {
    const test = tests.value.find((t) => t.id === id);
    if (test) {
      test.published = !test.published;
      test.updatedAt = Date.now();
      persistTests();
    }
  }

  function importTest(test: TestExam): void {
    // Generate new unique ID if collision
    const existing = tests.value.find((t) => t.id === test.id);
    if (existing) {
      test.id = `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }
    test.createdAt = Date.now();
    test.updatedAt = Date.now();
    tests.value.unshift(test);
    persistTests();
  }

  /**
   * Evaluates student's answers and saves final result
   */
  function submitExamResult(payload: {
    testId: string;
    studentId: string;
    studentName: string;
    answers: Record<string, string | string[]>;
    violations: any[];
    startedAt: number;
    disqualified?: boolean;
    disqualificationReason?: string;
  }): ExamResult {
    const test = getTestById(payload.testId);
    let earnedScore = 0;
    let totalPoints = 0;

    if (test) {
      for (const q of test.questions) {
        totalPoints += q.points || 1;
        const studentAns = payload.answers[q.id];
        let isCorrect = false;

        if (q.type === "mcq") {
          const correctOpt = q.options?.find((o) => o.isCorrect);
          if (correctOpt && correctOpt.id === studentAns) {
            isCorrect = true;
          }
        } else if (q.type === "checkbox") {
          const correctOptIds = (q.options || [])
            .filter((o) => o.isCorrect)
            .map((o) => o.id);
          const studentAnsList = Array.isArray(studentAns) ? studentAns : [];
          if (
            correctOptIds.length === studentAnsList.length &&
            correctOptIds.every((id) => studentAnsList.includes(id))
          ) {
            isCorrect = true;
          }
        } else if (q.type === "short_answer") {
          const expected = (q.correctAnswerText || "").trim().toLowerCase();
          const given = typeof studentAns === "string" ? studentAns.trim().toLowerCase() : "";
          if (expected.length > 0 && expected === given) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          earnedScore += q.points || 1;
        }
      }
    }

    const percentage = totalPoints > 0 ? Math.round((earnedScore / totalPoints) * 100) : 0;
    const completedAt = Date.now();
    const durationSeconds = Math.max(1, Math.round((completedAt - payload.startedAt) / 1000));

    const result: ExamResult = {
      id: "res_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      testId: payload.testId,
      testTitle: test ? test.title : "Imtihon Testi",
      studentId: payload.studentId,
      studentName: payload.studentName,
      score: earnedScore,
      totalPoints,
      percentage,
      passed: percentage >= 60 && !payload.disqualified,
      startedAt: payload.startedAt,
      completedAt,
      durationSeconds,
      disqualified: !!payload.disqualified,
      disqualificationReason: payload.disqualificationReason,
      violations: payload.violations || [],
      answers: payload.answers,
    };

    examResults.value.unshift(result);
    persistResults();

    return result;
  }

  function getTestsByFolder(folderId: string): TestExam[] {
    if (!folderId || folderId === "all") return tests.value;
    return tests.value.filter((t) => (t.folderId || "folder_umumiy") === folderId);
  }

  function addFolder(name: string, icon = "📁", color = "indigo"): TestFolder {
    const newFolder: TestFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      icon,
      color,
      isSystem: false,
    };
    folders.value.push(newFolder);
    persistFolders();
    return newFolder;
  }

  function deleteFolder(id: string): void {
    const target = folders.value.find((f) => f.id === id);
    if (!target || target.isSystem) return;

    folders.value = folders.value.filter((f) => f.id !== id);
    persistFolders();

    tests.value.forEach((t) => {
      if (t.folderId === id) {
        t.folderId = "folder_umumiy";
      }
    });
    persistTests();
  }

  function resetSampleTests() {
    tests.value = JSON.parse(JSON.stringify(SAMPLE_GOOGLE_FORM_TESTS)).map((t: TestExam) => ({
      ...t,
      folderId: t.folderId || "folder_umumiy",
      targetGrade: t.targetGrade || "Umumiy",
    }));
    persistTests();
  }

  function getStudentResults(studentId: string): ExamResult[] {
    return examResults.value.filter((r) => r.studentId === studentId);
  }

  function getTestResults(testId: string): ExamResult[] {
    return examResults.value.filter((r) => r.testId === testId);
  }

  return {
    tests,
    folders,
    publishedTests,
    examResults,
    getTestById,
    saveTest,
    deleteTest,
    togglePublish,
    importTest,
    getTestsByFolder,
    addFolder,
    deleteFolder,
    submitExamResult,
    resetSampleTests,
    getStudentResults,
    getTestResults,
  };
}
