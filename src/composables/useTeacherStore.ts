import { ref, computed, watch } from "vue";
import { callApi } from "../services/api";
import { soundManager, fireConfetti, fireVictoryConfetti } from "./useAudio";
import { db, ref as fbRef, set as fbSet, remove as fbRemove } from "../services/firebase";

export function sanitizeFbKey(name: string): string {
  return encodeURIComponent(name.toLowerCase().trim()).replace(/\./g, "%2E");
}

export function syncFreezeToCloud(studentName: string, isFrozen: boolean, group: string = "") {
  try {
    const key = sanitizeFbKey(studentName);
    if (isFrozen) {
      fbSet(fbRef(db, `frozen_students/${key}`), {
        name: studentName,
        group: group || "",
        frozenAt: Date.now(),
      }).catch((e: any) => console.warn("Firebase sync error:", e));
    } else {
      fbRemove(fbRef(db, `frozen_students/${key}`)).catch((e: any) => console.warn("Firebase sync error:", e));
    }
  } catch (e) {
    console.warn("syncFreezeToCloud error:", e);
  }
}

export interface Student {
  id?: string;
  name: string;
  correct: number;
  total: number;
  sess: number;
  strikes: number;
  penalties: number;
  bonus: number;
  book?: string;
  topic?: string;
  attStatus?: string; // "Keldi" | "Sababsiz" | "Sababli" | ""
  team?: string; // "standard" | "Duel" | "A" | "B"
  strikeAdded?: boolean;
  penaltyAdded?: boolean;
  status?: "active" | "frozen";
  group?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentTg?: string;
  login?: string;
  password?: string;
  notes?: string;
  joinedDate?: string;
  coins?: number;
  totalTests?: number;
  avgAccuracy?: number;
  attendanceStats?: { present: number; excused: number; unexcused: number };
}

export interface GroupReminder {
  id: string;
  text: string;
  date: string;
  time: string;
  completed: boolean;
  createdAt: number;
}

export interface GroupMeta {
  name: string;
  days: string[]; // ["Du", "Chor", "Juma"]
  time: string; // "14:00 - 15:30"
  room?: string; // "3-xona"
  subject?: string; // "O'zbekiston Tarixi"
  note?: string; // General group notes / goals
  paymentFee?: number; // e.g. 300000 (so'm)
  reminders?: GroupReminder[];
  studentPayments?: Record<string, { status: "paid" | "pending" | "debt"; month: string; paidDate?: string; amount?: number }>;
}

export interface LessonSessionStudentResult {
  name: string;
  correct: number;
  total: number;
  percent: number;
  strikes?: number;
  penalties?: number;
  coins?: number;
  attStatus?: string; // "Keldi" | "Sababsiz" | "Sababli"
}

export interface LessonSessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  teacher: string;
  group: string;
  mode: string; // "standard" | "Duel" | "Jamoalar" | "manual_test"
  book?: string;
  topic?: string;
  maxQuestions?: number;
  avgPercent: number;
  studentResults: LessonSessionStudentResult[];
  createdAt: number;
}

export interface TeacherReminder {
  id: string;
  studentName?: string;
  group?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: "call" | "payment" | "lesson" | "warning" | "other";
  completed: boolean;
  createdAt: number;
  note?: string;
}

export const BOOK_LIST = [
  "6-Tarix",
  "7-O'zT",
  "7-Jahon",
  "8-O'zT",
  "8-Jahon",
  "9-O'zT",
  "9-Jahon",
  "10-O'zT",
  "10-Jahon",
  "11-O'zT",
  "11-Jahon",
];

function loadInitialStudents(): Student[] {
  const saved = localStorage.getItem("st");
  if (!saved) return [];
  try {
    const list: Student[] = JSON.parse(saved);
    const sampleNames = new Set(["Ali Valiyev", "Madina Karimova", "Jasur Rahimov", "Zuhra Yusupova", "Bekzod Rustamov"]);
    return list.filter((s) => !sampleNames.has(s.name));
  } catch {
    return [];
  }
}

const teacherName = ref<string>(localStorage.getItem("teacherName") || "");
const students = ref<Student[]>(loadInitialStudents());

function loadInitialMasterStudents(): Student[] {
  const saved = localStorage.getItem("ha_all_students");
  if (!saved) return [];
  try {
    const list: Student[] = JSON.parse(saved);
    const sampleNames = new Set(["Ali Valiyev", "Madina Karimova", "Jasur Rahimov", "Zuhra Yusupova", "Bekzod Rustamov"]);
    return list.filter(
      (s) =>
        !sampleNames.has(s.name) &&
        s.id !== "std-1" &&
        s.id !== "std-2" &&
        s.id !== "std-3" &&
        s.id !== "std-4" &&
        s.id !== "std-5"
    );
  } catch {
    return [];
  }
}

// All Registered Students Database Registry (Master CRM list)
const allStudentsRegistry = ref<Student[]>(loadInitialMasterStudents());

// Persist master registry
watch(
  allStudentsRegistry,
  (newVal) => {
    localStorage.setItem("ha_all_students", JSON.stringify(newVal));
  },
  { deep: true }
);

function loadInitialReminders(): TeacherReminder[] {
  const saved = localStorage.getItem("ha_reminders");
  if (!saved) return [];
  try {
    const list: TeacherReminder[] = JSON.parse(saved);
    return list.filter((r) => r.id !== "rem-1" && r.id !== "rem-2");
  } catch {
    return [];
  }
}

// Teacher Reminders
const reminders = ref<TeacherReminder[]>(loadInitialReminders());

watch(
  reminders,
  (newVal) => {
    localStorage.setItem("ha_reminders", JSON.stringify(newVal));
  },
  { deep: true }
);

function loadInitialGroupsMeta(): Record<string, GroupMeta> {
  const saved = localStorage.getItem("ha_groups_meta");
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

// Group Meta Database (Schedules, rooms, notes, reminders, fees)
const groupsMeta = ref<Record<string, GroupMeta>>(loadInitialGroupsMeta());

watch(
  groupsMeta,
  (newVal) => {
    localStorage.setItem("ha_groups_meta", JSON.stringify(newVal));
  },
  { deep: true }
);

export function syncGroupMetaToCloud(meta: GroupMeta) {
  try {
    const key = sanitizeFbKey(meta.name);
    fbSet(fbRef(db, `groups_meta/${key}`), meta).catch((e: any) =>
      console.warn("Firebase group sync error:", e)
    );
  } catch (e) {
    console.warn("syncGroupMetaToCloud error:", e);
  }
}

function loadInitialLessonSessions(): LessonSessionRecord[] {
  const saved = localStorage.getItem("ha_lesson_sessions");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// Lesson & Test History Database
const lessonSessions = ref<LessonSessionRecord[]>(loadInitialLessonSessions());

watch(
  lessonSessions,
  (newVal) => {
    localStorage.setItem("ha_lesson_sessions", JSON.stringify(newVal));
  },
  { deep: true }
);

export function syncLessonSessionToCloud(session: LessonSessionRecord) {
  try {
    fbSet(fbRef(db, `lesson_sessions/${session.id}`), session).catch((e: any) =>
      console.warn("Firebase session sync error:", e)
    );
  } catch (e) {
    console.warn("syncLessonSessionToCloud error:", e);
  }
}

const currentMode = ref<"standard" | "Duel" | "Jamoalar">("standard");
const team1Name = ref<string>("🔴 Qizillar Jamoasi");
const team2Name = ref<string>("🔵 Ko'klar Jamoasi");
const globalBook = ref<string>("");
const globalTopic = ref<string>("");

const totalQ = ref<number>(0);
const curIdx = ref<number>(0);
const timer = ref<number>(0);
const isPaused = ref<boolean>(false);
let timerInterval: any = null;

const actionHistory = ref<string[]>([]);
const zeroScorers = ref<Student[]>([]);
const activeDuels = ref<Record<string, any>>({});
const suggestedLiveDuel = ref<any>(null);

export interface AttendanceLog {
  date: string; // "DD.MM" e.g. "02.09" or "YYYY-MM-DD"
  name: string;
  status: "Keldi" | "Sababsiz" | "Sababli";
  group?: string;
  reason?: string;
}

const savedAttendanceLogs = localStorage.getItem("ha_attendance_logs");
const localAttendanceLogs = ref<AttendanceLog[]>(
  savedAttendanceLogs ? JSON.parse(savedAttendanceLogs) : []
);

// Watch & persist session students
watch(
  students,
  (newVal) => {
    localStorage.setItem("st", JSON.stringify(newVal));
  },
  { deep: true }
);

watch(
  localAttendanceLogs,
  (newVal) => {
    localStorage.setItem("ha_attendance_logs", JSON.stringify(newVal));
  },
  { deep: true }
);

export function useTeacherStore() {
  const isTeacherLoggedIn = computed(() => !!teacherName.value);

  const isStudentFrozen = (name: string): boolean => {
    if (!name) return false;
    const target = allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    return target?.status === "frozen";
  };

  const standardStudents = computed(() =>
    students.value.filter(
      (s) => (!s.team || s.team === "standard") && s.status !== "frozen" && !isStudentFrozen(s.name)
    )
  );
  const teamAStudents = computed(() =>
    students.value.filter((s) => s.team === "A" && s.status !== "frozen" && !isStudentFrozen(s.name))
  );
  const teamBStudents = computed(() =>
    students.value.filter((s) => s.team === "B" && s.status !== "frozen" && !isStudentFrozen(s.name))
  );
  const duelStudents = computed(() =>
    students.value.filter((s) => s.team === "Duel" && s.status !== "frozen" && !isStudentFrozen(s.name))
  );

  const currentStandardStudent = computed(() => {
    const list = standardStudents.value;
    if (list.length === 0) return null;
    const idx = curIdx.value % list.length;
    return list[idx] || list[0];
  });

  const teamAScore = computed(() =>
    teamAStudents.value.reduce((sum, s) => sum + (s.correct || 0), 0)
  );
  const teamBScore = computed(() =>
    teamBStudents.value.reduce((sum, s) => sum + (s.correct || 0), 0)
  );

  const formattedTimer = computed(() => {
    const m = Math.floor(timer.value / 60);
    const s = timer.value % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  });

  // Reminders computations
  const activeRemindersCount = computed(
    () => reminders.value.filter((r) => !r.completed).length
  );

  const dueReminders = computed(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const curTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    return reminders.value.filter((r) => {
      if (r.completed) return false;
      if (r.date < todayStr) return true;
      if (r.date === todayStr && r.time <= curTimeStr) return true;
      return false;
    });
  });

  function setTeacher(name: string) {
    teacherName.value = name;
    localStorage.setItem("teacherName", name);
  }

  function logoutTeacher() {
    teacherName.value = "";
    localStorage.removeItem("teacherName");
  }

  function setMode(mode: "standard" | "Duel" | "Jamoalar") {
    currentMode.value = mode;
  }

  function addStudent(name: string, team: string = "standard") {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check if in master registry to inherit group/status
    const reg = allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === trimmed.toLowerCase());
    if (reg?.status === "frozen" || isStudentFrozen(trimmed)) {
      return;
    }
    const status = reg?.status || "active";
    const group = reg?.group || "";

    students.value.push({
      name: trimmed,
      correct: 0,
      total: 0,
      sess: 0,
      strikes: 0,
      penalties: 0,
      bonus: 0,
      book: globalBook.value,
      topic: globalTopic.value,
      attStatus: "",
      team,
      status,
      group,
    });

    // Also ensure it exists in master registry
    if (!reg) {
      allStudentsRegistry.value.push({
        id: "std-" + Date.now(),
        name: trimmed,
        group: "Umumiy",
        status: "active",
        login: trimmed.toLowerCase().replace(/\s+/g, "_"),
        password: "PIN" + Math.floor(1000 + Math.random() * 9000),
        correct: 0,
        total: 0,
        sess: 0,
        strikes: 0,
        penalties: 0,
        bonus: 0,
        coins: 0,
        totalTests: 0,
        avgAccuracy: 0,
        joinedDate: new Date().toISOString().split("T")[0],
      });
    }
  }

  function removeStudent(target: number | string) {
    if (typeof target === "string") {
      students.value = students.value.filter(
        (s) => s.name.toLowerCase().trim() !== target.toLowerCase().trim()
      );
    } else {
      students.value.splice(target, 1);
    }
  }

  function addFromDb(names: string[], targetTeam: string = "standard") {
    names.forEach((name) => {
      const trimmed = name.trim();
      if (!trimmed || isStudentFrozen(trimmed)) return;

      const reg = allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === trimmed.toLowerCase());
      const status = reg?.status || "active";
      if (status === "frozen") return;

      const group = reg?.group || "";
      const existing = students.value.find((s) => s.name === name);

      if (existing) {
        existing.team = targetTeam;
        existing.correct = 0;
        existing.total = 0;
        existing.sess = 0;
        existing.status = status;
      } else {
        students.value.push({
          name,
          correct: 0,
          total: 0,
          sess: 0,
          strikes: 0,
          penalties: 0,
          bonus: 0,
          book: globalBook.value,
          topic: globalTopic.value,
          attStatus: "",
          team: targetTeam,
          status,
          group,
        });
      }
    });
  }

  // --- CRM & Student Management Functions ---
  function saveStudent(studentData: Partial<Student> & { name: string }) {
    const trimmedName = studentData.name.trim();
    if (!trimmedName) return;

    const existingIdx = allStudentsRegistry.value.findIndex(
      (s) =>
        s.id === studentData.id ||
        s.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const fullData: Student = {
      id: studentData.id || "std-" + Date.now(),
      name: trimmedName,
      group: studentData.group || "Umumiy",
      status: studentData.status || "active",
      phone: studentData.phone || "",
      parentName: studentData.parentName || "",
      parentPhone: studentData.parentPhone || "",
      parentTg: studentData.parentTg || "",
      login:
        studentData.login || trimmedName.toLowerCase().replace(/\s+/g, "_"),
      password:
        studentData.password ||
        "PIN" + Math.floor(1000 + Math.random() * 9000),
      notes: studentData.notes || "",
      joinedDate:
        studentData.joinedDate || new Date().toISOString().split("T")[0],
      correct: studentData.correct || 0,
      total: studentData.total || 0,
      sess: 0,
      strikes: studentData.strikes || 0,
      penalties: studentData.penalties || 0,
      bonus: studentData.bonus || 0,
      coins: studentData.coins || 0,
      totalTests: studentData.totalTests || 0,
      avgAccuracy: studentData.avgAccuracy || 0,
      attendanceStats:
        studentData.attendanceStats || { present: 0, excused: 0, unexcused: 0 },
    };

    if (existingIdx !== -1) {
      allStudentsRegistry.value[existingIdx] = {
        ...allStudentsRegistry.value[existingIdx],
        ...fullData,
      };
    } else {
      allStudentsRegistry.value.unshift(fullData);
    }

    // Sync status with session students
    const activeSessionStudent = students.value.find(
      (s) => s.name === fullData.name
    );
    if (activeSessionStudent) {
      activeSessionStudent.status = fullData.status;
      activeSessionStudent.group = fullData.group;
    }
  }

  function toggleFreezeStudent(studentName: string) {
    const target = allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
    );
    if (target) {
      target.status = target.status === "frozen" ? "active" : "frozen";
      const isFrozen = target.status === "frozen";
      syncFreezeToCloud(target.name, isFrozen, target.group || "");

      // If frozen, immediately eject from active game session
      if (isFrozen) {
        students.value = students.value.filter(
          (s) => s.name.toLowerCase().trim() !== studentName.toLowerCase().trim()
        );
      } else {
        const inSession = students.value.find(
          (s) => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
        );
        if (inSession) inSession.status = "active";
      }
    }
  }

  function toggleFreezeGroup(groupName: string, freeze: boolean) {
    const newStatus: "active" | "frozen" = freeze ? "frozen" : "active";
    allStudentsRegistry.value.forEach((s) => {
      if (s.group === groupName) {
        s.status = newStatus;
        syncFreezeToCloud(s.name, freeze, s.group || "");
      }
    });
    // If frozen, immediately eject all group members from active game session
    if (freeze) {
      students.value = students.value.filter((s) => s.group !== groupName);
    } else {
      students.value.forEach((s) => {
        if (s.group === groupName) {
          s.status = "active";
        }
      });
    }
  }

  function transferStudentGroup(studentName: string, newGroup: string) {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup) return;

    const target = allStudentsRegistry.value.find((s) => s.name === studentName);
    if (target) {
      target.group = trimmedGroup;
    }

    const inSession = students.value.find((s) => s.name === studentName);
    if (inSession) {
      inSession.group = trimmedGroup;
    }
  }

  function transferMultipleStudentsGroup(studentNames: string[], newGroup: string) {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup || studentNames.length === 0) return;

    studentNames.forEach((name) => {
      const target = allStudentsRegistry.value.find((s) => s.name === name);
      if (target) {
        target.group = trimmedGroup;
      }
      const inSession = students.value.find((s) => s.name === name);
      if (inSession) {
        inSession.group = trimmedGroup;
      }
    });
  }

  function deleteStudentPermanently(studentName: string) {
    allStudentsRegistry.value = allStudentsRegistry.value.filter(
      (s) => s.name !== studentName
    );
    students.value = students.value.filter((s) => s.name !== studentName);
    reminders.value = reminders.value.filter(
      (r) => r.studentName !== studentName
    );
  }

  // --- Teacher Reminders Management ---
  function addReminder(
    item: Omit<TeacherReminder, "id" | "completed" | "createdAt">
  ) {
    const newReminder: TeacherReminder = {
      ...item,
      id: "rem-" + Date.now(),
      completed: false,
      createdAt: Date.now(),
    };
    reminders.value.unshift(newReminder);
  }

  function toggleCompleteReminder(id: string) {
    const rem = reminders.value.find((r) => r.id === id);
    if (rem) {
      rem.completed = !rem.completed;
    }
  }

  function deleteReminder(id: string) {
    reminders.value = reminders.value.filter((r) => r.id !== id);
  }

  function setGlobalTask(book: string, topic: string) {
    globalBook.value = book;
    globalTopic.value = topic;
    students.value.forEach((s) => {
      s.book = book;
      s.topic = topic;
    });
  }

  function setIndividualTask(target: number | string, book: string, topic: string) {
    let s: Student | undefined;
    if (typeof target === "string") {
      s = students.value.find(
        (item) => item.name.toLowerCase().trim() === target.toLowerCase().trim()
      );
    } else {
      s = students.value[target];
    }
    if (s) {
      s.book = book;
      s.topic = topic;
    }
  }

  // --- O'yin Taymeri ---
  function startTimer(resume = false) {
    stopTimer();
    if (!resume) {
      timer.value = 0;
    }
    isPaused.value = false;
    timerInterval = setInterval(() => {
      if (!isPaused.value) {
        timer.value++;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function togglePause() {
    if (!timerInterval) {
      startTimer(true);
    } else {
      isPaused.value = !isPaused.value;
    }
  }

  function pushHistory() {
    actionHistory.value.push(
      JSON.stringify({
        s: students.value,
        t: totalQ.value,
        i: curIdx.value,
      })
    );
  }

  function undo() {
    if (actionHistory.value.length === 0) return;
    const last = JSON.parse(actionHistory.value.pop()!);
    students.value = last.s;
    totalQ.value = last.t;
    curIdx.value = last.i;
  }

  // --- O'yin Harakatlari ---
  function ansStandard(type: true | false | "bonus") {
    pushHistory();
    const s = currentStandardStudent.value;
    if (!s) return;
    s.attStatus = "Keldi";
    totalQ.value++;
    s.sess = (s.sess || 0) + 1;
    s.total = (s.total || 0) + 1;

    if (type === "bonus") {
      s.correct = (s.correct || 0) + 1;
      s.bonus = (s.bonus || 0) + 1;
      soundManager.playSuccess();
      fireConfetti();
    } else if (type === true) {
      s.correct = (s.correct || 0) + 1;
      soundManager.playSuccess();
      fireConfetti();
    } else {
      soundManager.playError();
    }
  }

  function navStandard(dir: 1 | -1) {
    const len = standardStudents.value.length;
    if (len === 0) return;
    curIdx.value = (curIdx.value + dir + len) % len;
  }

  function ansSplit(side: 0 | 1) {
    pushHistory();
    totalQ.value++;
    if (currentMode.value === "Duel") {
      const duels = duelStudents.value;
      duels.forEach((s) => {
        s.attStatus = "Keldi";
        s.total = (s.total || 0) + 1;
        s.sess = (s.sess || 0) + 1;
      });
      const target = duels[side];
      if (target) {
        target.correct = (target.correct || 0) + 1;
        soundManager.playSuccess();
        fireConfetti();
      }
    } else if (currentMode.value === "Jamoalar") {
      const teamId = side === 0 ? "A" : "B";
      students.value
        .filter((s) => s.team === "A" || s.team === "B")
        .forEach((s) => {
          s.attStatus = "Keldi";
          s.total = (s.total || 0) + 1;
          s.sess = (s.sess || 0) + 1;
          if (s.team === teamId) {
            s.correct = (s.correct || 0) + 1;
          }
        });
      soundManager.playSuccess();
      fireConfetti();
    }
  }

  function skipSplit() {
    pushHistory();
    totalQ.value++;
    soundManager.playError();
    if (currentMode.value === "Duel") {
      duelStudents.value.forEach((s) => {
        s.attStatus = "Keldi";
        s.total = (s.total || 0) + 1;
        s.sess = (s.sess || 0) + 1;
      });
    } else if (currentMode.value === "Jamoalar") {
      students.value
        .filter((s) => s.team === "A" || s.team === "B")
        .forEach((s) => {
          s.attStatus = "Keldi";
          s.total = (s.total || 0) + 1;
          s.sess = (s.sess || 0) + 1;
        });
    }
  }

  function calcPercent(s: Student): number {
    if (!s.total || s.total === 0) return 0;
    const p = (s.correct / s.total) * 100 + (s.bonus || 0) * 5;
    return p > 100 ? 100 : Math.round(p);
  }

  function getActivePlayers(): Student[] {
    let list: Student[] = [];
    if (currentMode.value === "standard") {
      list = standardStudents.value;
    } else if (currentMode.value === "Duel") {
      list = duelStudents.value;
    } else {
      list = [...teamAStudents.value, ...teamBStudents.value];
    }
    return list.filter((s) => !isStudentFrozen(s.name));
  }

  function checkZeroScorers(): Student[] {
    const players = getActivePlayers();
    zeroScorers.value = players.filter((s) => (!s.total || s.total === 0) && !isStudentFrozen(s.name));
    return zeroScorers.value;
  }

  function finalizeResults() {
    stopTimer();
    fireVictoryConfetti();
    const players = getActivePlayers();
    const now = new Date();
    const todayDate = `${String(now.getDate()).padStart(2, "0")}.${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    players.forEach((s) => {
      // 1. Ensure attendance status is resolved
      if (!s.attStatus) {
        s.attStatus = "Keldi";
      }

      const status: "Keldi" | "Sababsiz" | "Sababli" =
        s.attStatus === "Sababsiz"
          ? "Sababsiz"
          : s.attStatus === "Sababli"
          ? "Sababli"
          : "Keldi";
      const isAbsent = status === "Sababsiz";
      const isExcused = status === "Sababli";
      const p = calcPercent(s);

      // 2. Add strike/penalties for attendees
      if (!isAbsent && !isExcused) {
        if (p >= 90 && s.total > 0 && !s.strikeAdded) {
          s.strikes = (s.strikes || 0) + 1;
          s.strikeAdded = true;
        }
        if (p < 50 && s.total > 0 && !s.penaltyAdded) {
          s.penalties = (s.penalties || 0) + 1;
          s.penaltyAdded = true;
        }
      }

      // 3. Update Master CRM Student Statistics in allStudentsRegistry
      const reg = allStudentsRegistry.value.find(
        (item) => item.name === s.name
      );
      if (reg) {
        if (!reg.attendanceStats) {
          reg.attendanceStats = { present: 0, excused: 0, unexcused: 0 };
        }

        if (isAbsent) {
          reg.attendanceStats.unexcused++;
        } else if (isExcused) {
          reg.attendanceStats.excused++;
        } else {
          reg.attendanceStats.present++;
          reg.totalTests = (reg.totalTests || 0) + 1;
          reg.strikes = (reg.strikes || 0) + (s.strikes || 0);
          reg.penalties = (reg.penalties || 0) + (s.penalties || 0);
          if (p >= 80) {
            reg.coins = (reg.coins || 0) + 20;
          } else {
            reg.coins = (reg.coins || 0) + 5;
          }
        }
      }

      // 4. Record entry into local attendance logs
      const existingLog = localAttendanceLogs.value.find(
        (l) => l.name === s.name && l.date === todayDate
      );
      const groupName = s.group || reg?.group || "Umumiy";
      const reasonText = isAbsent
        ? "Darsda qatnashmadi"
        : isExcused
        ? "Sababli kelmadi"
        : "Savol-javob darsida qatnashdi";

      if (existingLog) {
        existingLog.status = status;
        existingLog.group = groupName;
        existingLog.reason = reasonText;
      } else {
        localAttendanceLogs.value.push({
          date: todayDate,
          name: s.name,
          status,
          group: groupName,
          reason: reasonText,
        });
      }
    });

    // 5. Save detailed Lesson Session Record into history
    const sessionStudentResults: LessonSessionStudentResult[] = [];
    let sumPercent = 0;
    let presentCount = 0;

    players.forEach((s) => {
      const p = calcPercent(s);
      if (s.attStatus !== "Sababsiz" && s.attStatus !== "Sababli") {
        sumPercent += p;
        presentCount++;
      }
      sessionStudentResults.push({
        name: s.name,
        correct: s.correct,
        total: s.total,
        percent: p,
        strikes: s.strikes || 0,
        penalties: s.penalties || 0,
        coins: p >= 80 ? 20 : 5,
        attStatus: s.attStatus || "Keldi",
      });
    });

    const firstPlayer = players[0];
    const detectedGroup = firstPlayer?.group || allStudentsRegistry.value.find((item) => item.name === firstPlayer?.name)?.group || "Umumiy";

    const newSession: LessonSessionRecord = {
      id: "sess-" + Date.now(),
      date: todayDate,
      time: now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      teacher: teacherName.value || "Ustoz",
      group: detectedGroup,
      mode: currentMode.value === "standard" ? "Savol-Javob" : currentMode.value,
      book: globalBook.value || "",
      topic: globalTopic.value || "",
      maxQuestions: totalQ.value || 0,
      avgPercent: presentCount > 0 ? Math.round(sumPercent / presentCount) : 0,
      studentResults: sessionStudentResults,
      createdAt: Date.now(),
    };

    saveLessonSession(newSession);
  }

  function saveLessonSession(session: LessonSessionRecord) {
    const idx = lessonSessions.value.findIndex((s) => s.id === session.id);
    if (idx > -1) {
      lessonSessions.value[idx] = session;
    } else {
      lessonSessions.value.unshift(session);
    }
    syncLessonSessionToCloud(session);
  }

  function getGroupLessonSessions(groupName: string): LessonSessionRecord[] {
    return lessonSessions.value.filter((s) => s.group === groupName);
  }

  // --- Group CRM Meta & Schedule Functions ---
  function getGroupMeta(groupName: string): GroupMeta {
    if (!groupsMeta.value[groupName]) {
      groupsMeta.value[groupName] = {
        name: groupName,
        days: ["Du", "Chor", "Juma"],
        time: "14:00 - 15:30",
        room: "1-xona",
        subject: "Tarix",
        note: "",
        paymentFee: 300000,
        reminders: [],
        studentPayments: {},
      };
    }
    return groupsMeta.value[groupName];
  }

  function saveGroupMeta(meta: GroupMeta) {
    groupsMeta.value[meta.name] = { ...meta };
    syncGroupMetaToCloud(meta);
  }

  function addGroupReminder(groupName: string, text: string, date: string, time: string = "14:00") {
    const meta = getGroupMeta(groupName);
    if (!meta.reminders) meta.reminders = [];
    meta.reminders.unshift({
      id: "grem-" + Date.now(),
      text,
      date,
      time,
      completed: false,
      createdAt: Date.now(),
    });
    saveGroupMeta(meta);
  }

  function toggleCompleteGroupReminder(groupName: string, reminderId: string) {
    const meta = getGroupMeta(groupName);
    if (meta.reminders) {
      const r = meta.reminders.find((item) => item.id === reminderId);
      if (r) {
        r.completed = !r.completed;
        saveGroupMeta(meta);
      }
    }
  }

  function deleteGroupReminder(groupName: string, reminderId: string) {
    const meta = getGroupMeta(groupName);
    if (meta.reminders) {
      meta.reminders = meta.reminders.filter((item) => item.id !== reminderId);
      saveGroupMeta(meta);
    }
  }

  function setStudentPaymentStatus(
    groupName: string,
    studentName: string,
    status: "paid" | "pending" | "debt",
    amount?: number
  ) {
    const meta = getGroupMeta(groupName);
    if (!meta.studentPayments) meta.studentPayments = {};
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    meta.studentPayments[studentName] = {
      status,
      month: curMonth,
      paidDate: status === "paid" ? now.toISOString().split("T")[0] : undefined,
      amount: amount || meta.paymentFee || 300000,
    };
    saveGroupMeta(meta);
  }

  function resetSession() {
    const players = getActivePlayers();
    players.forEach((s) => {
      s.correct = 0;
      s.total = 0;
      s.sess = 0;
      s.bonus = 0;
      s.strikes = 0;
      s.penalties = 0;
      s.strikeAdded = false;
      s.penaltyAdded = false;
      s.attStatus = "";
    });
    totalQ.value = 0;
    curIdx.value = 0;
    timer.value = 0;
    actionHistory.value = [];
  }

  return {
    teacherName,
    students,
    allStudentsRegistry,
    localAttendanceLogs,
    reminders,
    groupsMeta,
    lessonSessions,
    activeRemindersCount,
    dueReminders,
    currentMode,
    team1Name,
    team2Name,
    globalBook,
    globalTopic,
    totalQ,
    curIdx,
    timer,
    isPaused,
    formattedTimer,
    isTeacherLoggedIn,
    standardStudents,
    teamAStudents,
    teamBStudents,
    duelStudents,
    currentStandardStudent,
    isStudentFrozen,
    teamAScore,
    teamBScore,
    zeroScorers,
    activeDuels,
    suggestedLiveDuel,
    getGroupMeta,
    saveGroupMeta,
    addGroupReminder,
    toggleCompleteGroupReminder,
    deleteGroupReminder,
    setStudentPaymentStatus,
    saveLessonSession,
    getGroupLessonSessions,
    setTeacher,
    logoutTeacher,
    setMode,
    addStudent,
    removeStudent,
    addFromDb,
    saveStudent,
    toggleFreezeStudent,
    toggleFreezeGroup,
    transferStudentGroup,
    transferMultipleStudentsGroup,
    deleteStudentPermanently,
    addReminder,
    toggleCompleteReminder,
    deleteReminder,
    setGlobalTask,
    setIndividualTask,
    startTimer,
    stopTimer,
    togglePause,
    ansStandard,
    navStandard,
    ansSplit,
    skipSplit,
    undo,
    calcPercent,
    getActivePlayers,
    checkZeroScorers,
    finalizeResults,
    resetSession,
  };
}
