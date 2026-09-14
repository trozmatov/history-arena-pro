import { ref, computed, watch } from "vue";
import { callApi } from "../services/api";
import { soundManager, fireConfetti, fireVictoryConfetti } from "./useAudio";
import {
  db,
  ref as fbRef,
  set as fbSet,
  remove as fbRemove,
  get as fbGet,
  update as fbUpdate,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "../services/firebase";
import { getStudentDefaultPin } from "./useStudentStore";

export const PROTECTED_GROUPS = ["umumiy", "arxiv"];
export function isProtectedGroup(groupName: string): boolean {
  if (!groupName) return false;
  return PROTECTED_GROUPS.includes(groupName.toLowerCase().trim());
}

export function sanitizeFbKey(name: string): string {
  return encodeURIComponent(name.toLowerCase().trim()).replace(/\./g, "%2E");
}

export function getStudentFbKey(student: Partial<Student>): string {
  if (student.id && student.id.trim()) {
    return sanitizeFbKey(student.id.trim());
  }
  if (student.name && student.name.trim()) {
    return sanitizeFbKey(student.name.trim());
  }
  return "unknown_" + Date.now();
}

export function syncFreezeToCloud(studentOrName: Student | string, isFrozen: boolean, group: string = "") {
  try {
    const name = typeof studentOrName === "object" ? studentOrName.name : studentOrName;
    const key = typeof studentOrName === "object" ? getStudentFbKey(studentOrName) : sanitizeFbKey(name);
    const id = typeof studentOrName === "object" ? studentOrName.id || "" : "";
    if (isFrozen) {
      fbSet(fbRef(db, `frozen_students/${key}`), {
        id,
        name,
        group: group || "",
        frozenAt: Date.now(),
      }).catch((e: any) => console.warn("Firebase sync error:", e));
    } else {
      fbRemove(fbRef(db, `frozen_students/${key}`)).catch((e: any) => console.warn("Firebase sync error:", e));
      const legacyKey = sanitizeFbKey(name);
      if (legacyKey !== key) {
        fbRemove(fbRef(db, `frozen_students/${legacyKey}`)).catch(() => {});
      }
    }
  } catch (e) {
    console.warn("syncFreezeToCloud error:", e);
  }
}

export function syncGroupFreezeToCloud(groupName: string, isFrozen: boolean) {
  try {
    const cleanGrp = groupName.toLowerCase().trim();
    if (isProtectedGroup(cleanGrp)) {
      console.warn(`Cannot freeze protected group: ${groupName}`);
      return;
    }
    const key = sanitizeFbKey(cleanGrp);
    if (isFrozen) {
      fbSet(fbRef(db, `frozen_groups/${key}`), {
        group: groupName.trim(),
        frozenAt: Date.now(),
      }).catch((e: any) => console.warn("Firebase group sync error:", e));
    } else {
      fbRemove(fbRef(db, `frozen_groups/${key}`)).catch((e: any) => console.warn("Firebase group sync error:", e));
    }
  } catch (e) {
    console.warn("syncGroupFreezeToCloud error:", e);
  }
}

export function getStudentGroups(student: Partial<Student>): string[] {
  if (!student) return ["Umumiy"];
  const list: string[] = [];
  if (Array.isArray(student.groups) && student.groups.length > 0) {
    list.push(...student.groups.map((g) => g.trim()).filter(Boolean));
  }
  if (student.group && student.group.trim()) {
    const cleanP = student.group.trim();
    if (!list.some((g) => g.toLowerCase() === cleanP.toLowerCase())) {
      list.unshift(cleanP);
    }
  }
  const unique = Array.from(new Set(list));
  return unique.length > 0 ? unique : ["Umumiy"];
}

export function isStudentInGroup(student: Partial<Student>, groupName: string): boolean {
  if (!groupName || !student) return false;
  const cleanTarget = groupName.toLowerCase().trim();
  const groups = getStudentGroups(student);
  return groups.some((g) => g.toLowerCase().trim() === cleanTarget);
}

export function syncStudentToCloud(student: Student) {
  try {
    const key = getStudentFbKey(student);
    const groupsList = getStudentGroups(student);
    const primaryGroup = student.group?.trim() || groupsList[0] || "Umumiy";
    const now = student.updatedAt || Date.now();
    student.updatedAt = now;

    fbSet(fbRef(db, `master_students/${key}`), {
      id: student.id,
      name: student.name,
      group: primaryGroup,
      groups: groupsList,
      status: student.status || "active",
      phone: student.phone || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentTg: student.parentTg || "",
      login: student.login || student.name.toLowerCase().replace(/\s+/g, "_"),
      pin: student.pin,
      password: student.password || student.pin,
      pattern: student.pattern || "",
      notes: student.notes || "",
      coins: student.coins || 0,
      totalTests: student.totalTests || 0,
      avgAccuracy: student.avgAccuracy || 0,
      updatedAt: now,
    }).catch((e: any) => console.warn("Firebase master_students sync error:", e));

    // Also sync to legacy student_groups path
    fbSet(fbRef(db, `student_groups/${sanitizeFbKey(student.name)}`), {
      name: student.name,
      group: primaryGroup,
      groups: groupsList,
      updatedAt: now,
    }).catch(() => {});
  } catch (e) {
    console.warn("syncStudentToCloud error:", e);
  }
}

export function deleteStudentFromCloud(studentOrName: Student | string) {
  try {
    const name = typeof studentOrName === "object" ? studentOrName.name : studentOrName;
    const key = typeof studentOrName === "object" ? getStudentFbKey(studentOrName) : sanitizeFbKey(name);
    const legacyKey = sanitizeFbKey(name);

    fbRemove(fbRef(db, `master_students/${key}`)).catch(() => {});
    if (legacyKey !== key) {
      fbRemove(fbRef(db, `master_students/${legacyKey}`)).catch(() => {});
    }
    fbRemove(fbRef(db, `student_groups/${legacyKey}`)).catch(() => {});
    fbRemove(fbRef(db, `frozen_students/${key}`)).catch(() => {});
    if (legacyKey !== key) {
      fbRemove(fbRef(db, `frozen_students/${legacyKey}`)).catch(() => {});
    }
  } catch (e) {
    console.warn("deleteStudentFromCloud error:", e);
  }
}

// Global navigation to student doska from any view
export const selectedDoskaStudent = ref<Student | null>(null);
export const requestedTeacherSubview = ref<string | null>(null);

export function openStudentDoskaGlobal(studentOrName: Student | string) {
  let target: Student | undefined;
  if (typeof studentOrName === "string") {
    const clean = studentOrName.trim().toLowerCase();
    target = allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === clean);
    if (!target) {
      target = students.value.find((s) => s.name.toLowerCase().trim() === clean);
    }
    if (!target) {
      const pin = getStudentDefaultPin(studentOrName.trim());
      target = {
        id: "temp-" + Date.now(),
        name: studentOrName.trim(),
        group: "Umumiy",
        groups: ["Umumiy"],
        status: "active",
        phone: "",
        parentName: "",
        parentPhone: "",
        parentTg: "",
        login: studentOrName.trim().toLowerCase().replace(/\s+/g, "_"),
        pin,
        password: pin,
        pattern: "",
        notes: "",
        joinedDate: new Date().toISOString().split("T")[0],
        correct: 0,
        total: 0,
        sess: 0,
        strikes: 0,
        penalties: 0,
        bonus: 0,
        coins: 0,
        totalTests: 0,
        avgAccuracy: 0,
        attendanceStats: { present: 0, excused: 0, unexcused: 0 },
      };
    }
  } else {
    target = studentOrName;
  }

  selectedDoskaStudent.value = target;
  requestedTeacherSubview.value = "students";
}

// Realtime Cloud synchronization for frozen groups and frozen students
export const cloudFrozenGroups = ref<string[]>(["arxiv"]); // 'arxiv' is always frozen
export const cloudFrozenStudents = ref<string[]>([]);

export function isGroupFrozen(groupName: string): boolean {
  if (!groupName) return false;
  const clean = groupName.toLowerCase().trim();
  return clean === "arxiv" || cloudFrozenGroups.value.includes(clean);
}

export function syncGroupTransferToCloud(studentName: string, newGroup: string) {
  try {
    const key = sanitizeFbKey(studentName);
    const trimmedGroup = (newGroup || "Umumiy").trim() || "Umumiy";
    fbSet(fbRef(db, `student_groups/${key}`), {
      name: studentName,
      group: trimmedGroup,
      updatedAt: Date.now(),
    }).catch((e: any) => console.warn("Firebase group transfer sync error:", e));
  } catch (e) {
    console.warn("syncGroupTransferToCloud error:", e);
  }
}

export function normalizeDateToDDMM(dStr: string): string {
  if (!dStr) return "";
  const s = dStr.trim();
  if (s.includes("-")) {
    const parts = s.split("-");
    if (parts.length === 3) {
      const day = parts[2].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      return `${day}.${month}`;
    }
  }
  if (s.includes(".")) {
    const parts = s.split(".");
    if (parts.length >= 2) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      return `${day}.${month}`;
    }
  }
  return s;
}

export function syncAttendanceLogToCloud(date: string, studentName: string, status: string, group: string = "", reason: string = "") {
  try {
    const normDate = normalizeDateToDDMM(date);
    const safeDate = normDate.replace(/\./g, "_").replace(/\//g, "_").replace(/-/g, "_");
    const safeName = sanitizeFbKey(studentName);
    const key = `${safeDate}___${safeName}`;
    fbSet(fbRef(db, `attendance_logs/${key}`), {
      date: normDate,
      name: studentName,
      status,
      group: group || "",
      reason: reason || "",
      timestamp: Date.now(),
    }).catch((e: any) => console.warn("Firebase attendance sync error:", e));
  } catch (e) {
    console.warn("syncAttendanceLogToCloud error:", e);
  }
}

export function recordAttendanceLog(
  date: string,
  studentName: string,
  status: "Keldi" | "Sababsiz" | "Sababli",
  group: string = "",
  reason: string = ""
) {
  const normDate = normalizeDateToDDMM(date);
  const existing = localAttendanceLogs.value.find(
    (l) => l.name.toLowerCase().trim() === studentName.toLowerCase().trim() && normalizeDateToDDMM(l.date) === normDate
  );
  if (existing) {
    existing.date = normDate;
    existing.status = status;
    if (group) existing.group = group;
    if (reason) existing.reason = reason;
  } else {
    localAttendanceLogs.value.push({
      date: normDate,
      name: studentName,
      status,
      group: group || "",
      reason: reason || "",
    });
  }
  syncAttendanceLogToCloud(normDate, studentName, status, group, reason);
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
  group?: string; // Birlamchi / asosiy guruh
  groups?: string[]; // Barcha a'zo bo'lgan guruhlar (Multi-group)
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentTg?: string;
  login?: string;
  password?: string;
  pin?: string; // 6-digit numeric PIN (e.g. "482910")
  pattern?: string; // Android 3x3 pattern sequence (e.g. "0-1-2-5-8")
  notes?: string;
  joinedDate?: string;
  coins?: number;
  totalTests?: number;
  avgAccuracy?: number;
  attendanceStats?: { present: number; excused: number; unexcused: number };
  updatedAt?: number;
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
  deleted?: boolean;
  deletedAt?: number;
  updatedAt?: number;
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

export interface UnifiedReminder {
  id: string;
  source: "student" | "group";
  title: string;
  message: string;
  date: string;
  time: string;
  group?: string;
  studentName?: string;
  completed: boolean;
  isDue: boolean;
  createdAt?: number;
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

export const TEST_TYPES = [
  "Mavzulashgan",
  "DTM",
  "MOCK",
  "Oylik imtihon",
  "Konkurs test",
] as const;

export type TestType = (typeof TEST_TYPES)[number];

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

export function generateUnique6DigitPin(nameOrList?: string | Student[]): string {
  if (typeof nameOrList === "string" && nameOrList.trim()) {
    return getStudentDefaultPin(nameOrList);
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function loadInitialMasterStudents(): Student[] {
  const sampleNames = new Set(["Ali Valiyev", "Madina Karimova", "Jasur Rahimov", "Zuhra Yusupova", "Bekzod Rustamov"]);
  const sampleIds = new Set(["std-1", "std-2", "std-3", "std-4", "std-5"]);
  let list: Student[] = [];
  let needsSave = false;

  const saved = localStorage.getItem("ha_all_students");
  if (saved) {
    try {
      const parsed: Student[] = JSON.parse(saved);
      list = parsed.filter(
        (s) =>
          s &&
          s.name &&
          !sampleNames.has(s.name.trim()) &&
          !sampleIds.has(s.id || "")
      );
    } catch {
      list = [];
    }
  }

  // Self-heal immediately: merge any real students found in localStorage["st"]
  const savedSt = localStorage.getItem("st");
  if (savedSt) {
    try {
      const stList: Student[] = JSON.parse(savedSt);
      if (Array.isArray(stList)) {
        stList.forEach((s) => {
          if (s && s.name && !sampleNames.has(s.name.trim()) && !sampleIds.has(s.id || "")) {
            const cleanName = s.name.trim();
            const existing = list.find((x) => x.name.toLowerCase().trim() === cleanName.toLowerCase());
            if (!existing) {
              const pin = s.pin || getStudentDefaultPin(cleanName);
              const grp = s.group || "Umumiy";
              list.push({
                id: s.id || "st-" + Math.random().toString(36).substring(2, 9),
                name: cleanName,
                group: grp,
                groups: Array.isArray(s.groups) && s.groups.length > 0 ? s.groups : [grp],
                status: s.status || "active",
                phone: s.phone || "",
                parentName: s.parentName || "",
                parentPhone: s.parentPhone || "",
                parentTg: s.parentTg || "",
                login: s.login || cleanName.toLowerCase().replace(/\s+/g, "_"),
                pin,
                password: s.password || pin,
                pattern: s.pattern || "",
                notes: s.notes || "",
                joinedDate: s.joinedDate || new Date().toISOString().split("T")[0],
                correct: s.correct || 0,
                total: s.total || 0,
                sess: s.sess || 0,
                strikes: s.strikes || 0,
                penalties: s.penalties || 0,
                bonus: s.bonus || 0,
                coins: s.coins || 0,
                totalTests: s.totalTests || 0,
                avgAccuracy: s.avgAccuracy || 0,
                attendanceStats: s.attendanceStats || { present: 0, excused: 0, unexcused: 0 },
              });
              needsSave = true;
            } else {
              // Merge contacts from st into existing master student
              if (s.phone && s.phone.trim() && !existing.phone) { existing.phone = s.phone.trim(); needsSave = true; }
              if (s.parentPhone && s.parentPhone.trim() && !existing.parentPhone) { existing.parentPhone = s.parentPhone.trim(); needsSave = true; }
              if (s.parentName && s.parentName.trim() && !existing.parentName) { existing.parentName = s.parentName.trim(); needsSave = true; }
              if (s.parentTg && s.parentTg.trim() && !existing.parentTg) { existing.parentTg = s.parentTg.trim(); needsSave = true; }
              if (s.notes && s.notes.trim() && !existing.notes) { existing.notes = s.notes.trim(); needsSave = true; }
            }
          }
        });
      }
    } catch {}
  }

  // Self-heal immediately: merge any students from localStorage["ha_lesson_sessions"]
  const savedSessions = localStorage.getItem("ha_lesson_sessions");
  if (savedSessions) {
    try {
      const sessions = JSON.parse(savedSessions);
      if (Array.isArray(sessions)) {
        sessions.forEach((sess: any) => {
          const sessGroup = sess.group || "Umumiy";
          const res = sess.studentResults || sess.results || [];
          if (Array.isArray(res)) {
            res.forEach((r: any) => {
              if (r && r.name && !sampleNames.has(r.name.trim())) {
                const clean = r.name.trim();
                const existing = list.find((x) => x.name.toLowerCase().trim() === clean.toLowerCase());
                if (!existing) {
                  const pin = getStudentDefaultPin(clean);
                  list.push({
                    id: "sess-" + Math.random().toString(36).substring(2, 9),
                    name: clean,
                    group: sessGroup,
                    groups: [sessGroup],
                    status: "active",
                    phone: r.phone || "",
                    parentName: r.parentName || "",
                    parentPhone: r.parentPhone || "",
                    parentTg: r.parentTg || "",
                    login: clean.toLowerCase().replace(/\s+/g, "_"),
                    pin,
                    password: pin,
                    pattern: "",
                    notes: "",
                    joinedDate: sess.date || new Date().toISOString().split("T")[0],
                    correct: 0,
                    total: 0,
                    sess: 0,
                    strikes: 0,
                    penalties: 0,
                    bonus: 0,
                    coins: 0,
                    totalTests: 0,
                    avgAccuracy: 0,
                    attendanceStats: { present: 0, excused: 0, unexcused: 0 },
                  });
                  needsSave = true;
                } else {
                  if (r.phone && r.phone.trim() && !existing.phone) { existing.phone = r.phone.trim(); needsSave = true; }
                  if (r.parentPhone && r.parentPhone.trim() && !existing.parentPhone) { existing.parentPhone = r.parentPhone.trim(); needsSave = true; }
                  if (r.parentName && r.parentName.trim() && !existing.parentName) { existing.parentName = r.parentName.trim(); needsSave = true; }
                  if (r.parentTg && r.parentTg.trim() && !existing.parentTg) { existing.parentTg = r.parentTg.trim(); needsSave = true; }
                }
              }
            });
          }
        });
      }
    } catch {}
  }

  // Self-heal: merge any protected contacts backup
  try {
    const rawBackup = localStorage.getItem("ha_protected_contacts_backup");
    if (rawBackup) {
      const backupMap = JSON.parse(rawBackup);
      if (backupMap && typeof backupMap === "object") {
        list.forEach((s) => {
          const b = backupMap[s.name.trim().toLowerCase()];
          if (b) {
            if (b.phone && b.phone.trim() && !s.phone) { s.phone = b.phone.trim(); needsSave = true; }
            if (b.parentPhone && b.parentPhone.trim() && !s.parentPhone) { s.parentPhone = b.parentPhone.trim(); needsSave = true; }
            if (b.parentName && b.parentName.trim() && !s.parentName) { s.parentName = b.parentName.trim(); needsSave = true; }
            if (b.parentTg && b.parentTg.trim() && !s.parentTg) { s.parentTg = b.parentTg.trim(); needsSave = true; }
            if (b.notes && b.notes.trim() && !s.notes) { s.notes = b.notes.trim(); needsSave = true; }
          }
        });
      }
    }
  } catch {}

  // Auto-migrate: ensure every student has a valid 6-digit PIN and groups
  list.forEach((s) => {
    if (!s.pin || !/^\d{6}$/.test(s.pin)) {
      const defPin = getStudentDefaultPin(s.name);
      s.pin = defPin;
      s.password = s.pin;
      needsSave = true;
    }
    if (!s.groups || s.groups.length === 0) {
      s.groups = [s.group || "Umumiy"];
      needsSave = true;
    }
  });

  if (needsSave && list.length > 0) {
    localStorage.setItem("ha_all_students", JSON.stringify(list));
  }
  return list;
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

export function findStudentInRegistry(studentOrIdOrName: Partial<Student> | string): Student | undefined {
  if (!studentOrIdOrName) return undefined;
  if (typeof studentOrIdOrName === "object") {
    if (studentOrIdOrName.id) {
      const found = allStudentsRegistry.value.find((s) => s.id === studentOrIdOrName.id);
      if (found) return found;
    }
    if (studentOrIdOrName.name) {
      const cleanName = studentOrIdOrName.name.toLowerCase().trim();
      return allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === cleanName);
    }
    return undefined;
  }
  const query = studentOrIdOrName.trim();
  const byId = allStudentsRegistry.value.find((s) => s.id === query);
  if (byId) return byId;
  const cleanName = query.toLowerCase();
  return allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === cleanName);
}

let teacherStoreSyncActive = false;
let batchIdTimeout: any = null;
const pendingBatchIdUpdates: Record<string, any> = {};

function scheduleBatchIdSync(student: Student) {
  const key = getStudentFbKey(student);
  pendingBatchIdUpdates[`master_students/${key}/id`] = student.id;
  if (batchIdTimeout) clearTimeout(batchIdTimeout);
  batchIdTimeout = setTimeout(() => {
    if (Object.keys(pendingBatchIdUpdates).length > 0) {
      fbUpdate(fbRef(db), { ...pendingBatchIdUpdates }).catch((e) => console.warn("Batch ID update error:", e));
      Object.keys(pendingBatchIdUpdates).forEach((k) => delete pendingBatchIdUpdates[k]);
    }
  }, 1000);
}

export function initTeacherStoreSync() {
  if (teacherStoreSyncActive || typeof window === "undefined") return;
  teacherStoreSyncActive = true;

  try {
    let firstSnapshotReceived = false;

    // 1. Synchronize master_students
    const msRef = fbRef(db, "master_students");
    onChildAdded(msRef, (snap: any) => {
      const data = snap.val();
      if (!data || !data.name) return;

      if (!firstSnapshotReceived) {
        firstSnapshotReceived = true;
        localStorage.setItem("ha_v6_clean_sync", "true");
      }

      const cleanName = data.name.toLowerCase().trim();
      const existing = findStudentInRegistry(data.id ? data.id : cleanName);

      // Prevent local echo reverting more recent local writes
      if (existing && existing.updatedAt && data.updatedAt && data.updatedAt < existing.updatedAt) {
        return;
      }

      const rawGroups = Array.isArray(data.groups) && data.groups.length > 0
        ? data.groups.map((g: string) => g.trim()).filter(Boolean)
        : (data.group ? [data.group.trim()] : ["Umumiy"]);

      let assignedId = data.id;
      if (!assignedId) {
        assignedId = "std-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
      }

      if (!existing) {
        const newStudent: Student = {
          id: assignedId,
          name: data.name.trim(),
          group: data.group || rawGroups[0] || "Umumiy",
          groups: rawGroups,
          status: data.status || "active",
          phone: data.phone || "",
          parentName: data.parentName || "",
          parentPhone: data.parentPhone || "",
          parentTg: data.parentTg || "",
          login: data.login || data.name.toLowerCase().replace(/\s+/g, "_"),
          pin: data.pin || getStudentDefaultPin(data.name),
          password: data.password || data.pin || getStudentDefaultPin(data.name),
          pattern: data.pattern || "",
          notes: data.notes || "",
          joinedDate: new Date().toISOString().split("T")[0],
          correct: 0,
          total: 0,
          sess: 0,
          strikes: 0,
          penalties: 0,
          bonus: 0,
          coins: data.coins || 0,
          totalTests: data.totalTests || 0,
          avgAccuracy: data.avgAccuracy || 0,
          attendanceStats: { present: 0, excused: 0, unexcused: 0 },
          updatedAt: data.updatedAt || Date.now(),
        };
        allStudentsRegistry.value.push(newStudent);
        allStudentsRegistry.value = [...allStudentsRegistry.value];
        localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

        if (!data.id) {
          scheduleBatchIdSync(newStudent);
        }
      } else {
        // Hydrate cloud fields into existing student
        let changed = false;
        if (!existing.id && assignedId) {
          existing.id = assignedId;
          changed = true;
          if (!data.id) scheduleBatchIdSync(existing);
        }
        if (data.phone && data.phone.trim() && !existing.phone) { existing.phone = data.phone.trim(); changed = true; }
        if (data.parentName && data.parentName.trim() && !existing.parentName) { existing.parentName = data.parentName.trim(); changed = true; }
        if (data.parentPhone && data.parentPhone.trim() && !existing.parentPhone) { existing.parentPhone = data.parentPhone.trim(); changed = true; }
        if (data.parentTg && data.parentTg.trim() && !existing.parentTg) { existing.parentTg = data.parentTg.trim(); changed = true; }
        if (data.notes && data.notes.trim() && !existing.notes) { existing.notes = data.notes.trim(); changed = true; }
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          existing.groups = data.groups;
          changed = true;
        }
        if (data.group && data.group !== existing.group) {
          existing.group = data.group;
          changed = true;
        }
        if (data.status && data.status !== existing.status) {
          existing.status = data.status;
          changed = true;
        }
        if (changed) {
          allStudentsRegistry.value = [...allStudentsRegistry.value];
          localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
          updateProtectedContactsBackup();
        }
      }
    });

    onChildChanged(msRef, (snap: any) => {
      const data = snap.val();
      if (!data || !data.name) return;
      const cleanName = data.name.toLowerCase().trim();
      const existingIdx = allStudentsRegistry.value.findIndex(
        (s) => (data.id && s.id === data.id) || s.name.toLowerCase().trim() === cleanName
      );
      if (existingIdx !== -1) {
        const existing = allStudentsRegistry.value[existingIdx];
        if (existing.updatedAt && data.updatedAt && data.updatedAt < existing.updatedAt) {
          return; // Skip stale snapshot
        }

        const rawGroups = Array.isArray(data.groups) && data.groups.length > 0
          ? data.groups.map((g: string) => g.trim()).filter(Boolean)
          : (data.group ? [data.group.trim()] : ["Umumiy"]);

        allStudentsRegistry.value[existingIdx] = {
          ...existing,
          id: data.id || existing.id,
          name: data.name.trim(),
          phone: (data.phone && data.phone.trim()) ? data.phone.trim() : (existing.phone || ""),
          parentName: (data.parentName && data.parentName.trim()) ? data.parentName.trim() : (existing.parentName || ""),
          parentPhone: (data.parentPhone && data.parentPhone.trim()) ? data.parentPhone.trim() : (existing.parentPhone || ""),
          parentTg: (data.parentTg && data.parentTg.trim()) ? data.parentTg.trim() : (existing.parentTg || ""),
          group: data.group || rawGroups[0] || existing.group,
          groups: rawGroups,
          status: data.status || existing.status,
          pin: data.pin || existing.pin,
          password: data.password || existing.password,
          pattern: data.pattern !== undefined ? data.pattern : existing.pattern,
          notes: (data.notes && data.notes.trim()) ? data.notes.trim() : (existing.notes || ""),
          coins: data.coins !== undefined ? data.coins : existing.coins,
          avgAccuracy: data.avgAccuracy !== undefined ? data.avgAccuracy : existing.avgAccuracy,
          totalTests: data.totalTests !== undefined ? data.totalTests : existing.totalTests,
          updatedAt: data.updatedAt || Date.now(),
        };
        allStudentsRegistry.value = [...allStudentsRegistry.value];
        localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
        updateProtectedContactsBackup();
      }
    });

    onChildRemoved(msRef, (snap: any) => {
      const data = snap.val();
      if (!data || !data.name) return;
      const cleanName = data.name.toLowerCase().trim();
      const targetId = data.id;
      allStudentsRegistry.value = allStudentsRegistry.value.filter(
        (s) => (targetId ? s.id !== targetId : true) && s.name.toLowerCase().trim() !== cleanName
      );
      localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    });

    // 2. Synchronize frozen_groups
    const fgRef = fbRef(db, "frozen_groups");
    onChildAdded(fgRef, (snap: any) => {
      const val = snap.val();
      const grp = (val?.group || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      if (grp && !cloudFrozenGroups.value.includes(grp)) {
        cloudFrozenGroups.value = [...cloudFrozenGroups.value, grp];
      }
    });
    onChildRemoved(fgRef, (snap: any) => {
      const val = snap.val();
      const grp = (val?.group || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      if (grp && grp !== "arxiv") {
        cloudFrozenGroups.value = cloudFrozenGroups.value.filter((g) => g !== grp);
      }
    });

    // 3. Synchronize frozen_students
    const fsRef = fbRef(db, "frozen_students");
    onChildAdded(fsRef, (snap: any) => {
      const val = snap.val();
      const sName = (val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      const sId = val?.id ? val.id.toLowerCase().trim() : "";
      const sKey = snap.key ? snap.key.toLowerCase().trim() : "";

      if (sName && !cloudFrozenStudents.value.includes(sName)) cloudFrozenStudents.value.push(sName);
      if (sId && !cloudFrozenStudents.value.includes(sId)) cloudFrozenStudents.value.push(sId);
      if (sKey && !cloudFrozenStudents.value.includes(sKey)) cloudFrozenStudents.value.push(sKey);

      // Update target student status in memory
      const target = findStudentInRegistry(val?.id || sName);
      if (target && target.status !== "frozen") {
        target.status = "frozen";
        allStudentsRegistry.value = [...allStudentsRegistry.value];
      }
    });
    onChildRemoved(fsRef, (snap: any) => {
      const val = snap.val();
      const sName = (val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      const sId = val?.id ? val.id.toLowerCase().trim() : "";
      const sKey = snap.key ? snap.key.toLowerCase().trim() : "";

      cloudFrozenStudents.value = cloudFrozenStudents.value.filter(
        (x) => x !== sName && x !== sId && x !== sKey
      );

      const target = findStudentInRegistry(val?.id || sName);
      if (target && target.status === "frozen") {
        target.status = "active";
        allStudentsRegistry.value = [...allStudentsRegistry.value];
      }
    });

    // 4. Synchronize groups_meta
    const gmRef = fbRef(db, "groups_meta");
    const handleGroupMetaSnap = (snap: any) => {
      const val = snap.val();
      if (val && val.name) {
        if (val.deleted) {
          delete groupsMeta.value[val.name];
        } else {
          groupsMeta.value[val.name] = {
            ...groupsMeta.value[val.name],
            ...val,
          };
        }
        localStorage.setItem("ha_groups_meta", JSON.stringify(groupsMeta.value));
      }
    };
    onChildAdded(gmRef, handleGroupMetaSnap);
    onChildChanged(gmRef, handleGroupMetaSnap);
    onChildRemoved(gmRef, (snap: any) => {
      const val = snap.val();
      const gName = val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."));
      if (gName && groupsMeta.value[gName]) {
        delete groupsMeta.value[gName];
        localStorage.setItem("ha_groups_meta", JSON.stringify(groupsMeta.value));
      }
    });

    // 5. Synchronize student_patterns
    const spRef = fbRef(db, "student_patterns");
    onChildAdded(spRef, (snap: any) => {
      const val = snap.val();
      const sName = (val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      if (sName && val?.pattern) {
        const target = findStudentInRegistry(sName);
        if (target && target.pattern !== val.pattern) {
          target.pattern = val.pattern;
          allStudentsRegistry.value = [...allStudentsRegistry.value];
        }
      }
    });
    onChildRemoved(spRef, (snap: any) => {
      const sName = decodeURIComponent(snap.key.replace(/%2E/g, ".")).toLowerCase().trim();
      if (sName) {
        const target = findStudentInRegistry(sName);
        if (target && target.pattern) {
          target.pattern = "";
          allStudentsRegistry.value = [...allStudentsRegistry.value];
        }
      }
    });

    // 6. Synchronize attendance_logs
    const attLogsRef = fbRef(db, "attendance_logs");
    const handleAttLogSnap = (snap: any) => {
      const val = snap.val();
      if (val && val.name && val.date && val.status) {
        const existing = localAttendanceLogs.value.find(
          (l) => l.name.toLowerCase().trim() === val.name.toLowerCase().trim() && l.date === val.date
        );
        if (existing) {
          existing.status = val.status;
          existing.group = val.group || existing.group;
          existing.reason = val.reason || existing.reason;
        } else {
          localAttendanceLogs.value.push({
            name: val.name,
            date: val.date,
            status: val.status,
            group: val.group || "Umumiy",
            reason: val.reason || "",
          });
        }
      }
    };
    onChildAdded(attLogsRef, handleAttLogSnap);
    onChildChanged(attLogsRef, handleAttLogSnap);

  } catch (e) {
    console.warn("initTeacherStoreSync error:", e);
  }
}
initTeacherStoreSync();

export function updateProtectedContactsBackup() {
  if (typeof window === "undefined") return;
  try {
    const contactsMap: Record<string, { phone?: string; parentPhone?: string; parentName?: string; parentTg?: string; notes?: string }> = {};
    allStudentsRegistry.value.forEach((s) => {
      if (s.phone || s.parentPhone || s.parentName || s.parentTg || s.notes) {
        contactsMap[s.name.trim().toLowerCase()] = {
          phone: s.phone || "",
          parentPhone: s.parentPhone || "",
          parentName: s.parentName || "",
          parentTg: s.parentTg || "",
          notes: s.notes || "",
        };
      }
    });
    if (Object.keys(contactsMap).length > 0) {
      localStorage.setItem("ha_protected_contacts_backup", JSON.stringify(contactsMap));
    }
  } catch (e) {
    console.warn("updateProtectedContactsBackup error:", e);
  }
}

export function deepRecoverAllDataFromLocalStorage(): {
  scannedKeysCount: number;
  recoveredContactsCount: number;
  totalStudentsWithPhone: number;
  details: string[];
} {
  if (typeof window === "undefined") {
    return { scannedKeysCount: 0, recoveredContactsCount: 0, totalStudentsWithPhone: 0, details: [] };
  }

  const contactsMap: Record<string, {
    phone?: string;
    parentPhone?: string;
    parentName?: string;
    parentTg?: string;
    notes?: string;
  }> = {};

  const details: string[] = [];
  let scannedKeysCount = 0;
  const sampleNames = new Set(["ali valiyev", "madina karimova", "jasur rahimov", "zuhra yusupova", "bekzod rustamov"]);

  const visited = new WeakSet();
  function processStudentObject(obj: any, sourceKey: string, depth = 0) {
    if (!obj || typeof obj !== "object" || depth > 6) return;
    if (visited.has(obj)) return;
    visited.add(obj);

    if (obj.name && typeof obj.name === "string" && obj.name.trim().length >= 2) {
      const cleanName = obj.name.trim().toLowerCase();
      if (!sampleNames.has(cleanName)) {
        if (!contactsMap[cleanName]) {
          contactsMap[cleanName] = {};
        }

        const rec = contactsMap[cleanName];
        if (obj.phone && typeof obj.phone === "string" && obj.phone.trim() && !rec.phone) {
          rec.phone = obj.phone.trim();
          details.push(`${obj.name}: tel (${obj.phone.trim()}) [${sourceKey}]`);
        }
        if (obj.parentPhone && typeof obj.parentPhone === "string" && obj.parentPhone.trim() && !rec.parentPhone) {
          rec.parentPhone = obj.parentPhone.trim();
        }
        if (obj.parentName && typeof obj.parentName === "string" && obj.parentName.trim() && !rec.parentName) {
          rec.parentName = obj.parentName.trim();
        }
        if (obj.parentTg && typeof obj.parentTg === "string" && obj.parentTg.trim() && !rec.parentTg) {
          rec.parentTg = obj.parentTg.trim();
        }
        if (obj.notes && typeof obj.notes === "string" && obj.notes.trim() && !rec.notes) {
          rec.notes = obj.notes.trim();
        }
      }
    }

    if (Array.isArray(obj)) {
      obj.forEach((item) => processStudentObject(item, sourceKey, depth + 1));
    } else {
      for (const k of Object.keys(obj)) {
        if (obj[k] && typeof obj[k] === "object") {
          processStudentObject(obj[k], sourceKey, depth + 1);
        }
      }
    }
  }

  // 1. Scan all localStorage keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      scannedKeysCount++;
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        processStudentObject(parsed, key);
      } catch {
        // Fallback: If raw text contains phone numbers and student names
        const regex = /"name"\s*:\s*"([^"]+)"[\s\S]{1,300}?"(?:phone|parentPhone)"\s*:\s*"([^"]+)"/g;
        let match;
        while ((match = regex.exec(raw)) !== null) {
          const n = match[1]?.trim().toLowerCase();
          const p = match[2]?.trim();
          if (n && p && p.length >= 7) {
            if (!contactsMap[n]) contactsMap[n] = {};
            if (!contactsMap[n].phone) contactsMap[n].phone = p;
          }
        }
      }
    }
  } catch (e) {
    console.warn("deepRecoverAllDataFromLocalStorage scan error:", e);
  }

  // 2. Merge recovered contacts into allStudentsRegistry
  let recoveredContactsCount = 0;
  allStudentsRegistry.value.forEach((st) => {
    const cleanName = st.name.trim().toLowerCase();
    const found = contactsMap[cleanName];
    if (found) {
      let changed = false;
      if (found.phone && !st.phone) {
        st.phone = found.phone;
        changed = true;
      }
      if (found.parentPhone && !st.parentPhone) {
        st.parentPhone = found.parentPhone;
        changed = true;
      }
      if (found.parentName && !st.parentName) {
        st.parentName = found.parentName;
        changed = true;
      }
      if (found.parentTg && !st.parentTg) {
        st.parentTg = found.parentTg;
        changed = true;
      }
      if (found.notes && !st.notes) {
        st.notes = found.notes;
        changed = true;
      }

      if (changed) {
        recoveredContactsCount++;
        syncStudentToCloud(st);
      }
    }
  });

  // Also sync to active session students
  students.value.forEach((st) => {
    const cleanName = st.name.trim().toLowerCase();
    const found = contactsMap[cleanName];
    if (found) {
      if (found.phone && !st.phone) st.phone = found.phone;
      if (found.parentPhone && !st.parentPhone) st.parentPhone = found.parentPhone;
    }
  });

  if (recoveredContactsCount > 0) {
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    localStorage.setItem("st", JSON.stringify(students.value));
  }

  updateProtectedContactsBackup();

  const totalStudentsWithPhone = allStudentsRegistry.value.filter((s) => !!s.phone).length;

  return {
    scannedKeysCount,
    recoveredContactsCount,
    totalStudentsWithPhone,
    details,
  };
}

export function bulkImportContacts(entries: Array<{ name: string; phone?: string; parentPhone?: string; parentName?: string; parentTg?: string; notes?: string }>): number {
  let updatedCount = 0;
  entries.forEach((entry) => {
    if (!entry.name || !entry.name.trim()) return;
    const clean = entry.name.trim().toLowerCase();
    const target = allStudentsRegistry.value.find((s) => s.name.trim().toLowerCase() === clean);
    if (target) {
      let changed = false;
      if (entry.phone && entry.phone.trim()) { target.phone = entry.phone.trim(); changed = true; }
      if (entry.parentPhone && entry.parentPhone.trim()) { target.parentPhone = entry.parentPhone.trim(); changed = true; }
      if (entry.parentName && entry.parentName.trim()) { target.parentName = entry.parentName.trim(); changed = true; }
      if (entry.parentTg && entry.parentTg.trim()) { target.parentTg = entry.parentTg.trim(); changed = true; }
      if (entry.notes && entry.notes.trim()) { target.notes = entry.notes.trim(); changed = true; }
      if (changed) {
        updatedCount++;
        syncStudentToCloud(target);
      }
    }
  });

  if (updatedCount > 0) {
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    updateProtectedContactsBackup();
  }
  return updatedCount;
}

// Auto-run deep recovery on store load to restore any orphaned localStorage contacts
setTimeout(() => {
  deepRecoverAllDataFromLocalStorage();
}, 100);

export async function restoreAndFindAllStudents(): Promise<{
  total: number;
  newlyRestored: number;
  sources: { local: number; sessions: number; attendance: number; firebase: number; sheets: number };
}> {
  const sources = { local: 0, sessions: 0, attendance: 0, firebase: 0, sheets: 0 };
  let newlyRestored = 0;
  const sampleNames = new Set(["Ali Valiyev", "Madina Karimova", "Jasur Rahimov", "Zuhra Yusupova", "Bekzod Rustamov"]);
  const sampleIds = new Set(["std-1", "std-2", "std-3", "std-4", "std-5"]);

  const isValidName = (name?: string): boolean => {
    if (!name) return false;
    const clean = name.trim();
    if (clean.length < 2) return false;
    if (sampleNames.has(clean)) return false;
    return true;
  };

  const getOrAddStudent = (name: string, defaultGroup: string = "Umumiy"): Student => {
    const clean = name.trim();
    const key = clean.toLowerCase();
    let st = allStudentsRegistry.value.find((s) => s.name.toLowerCase().trim() === key);
    const cleanGrp = defaultGroup && defaultGroup.trim() ? defaultGroup.trim() : "Umumiy";

    if (!st) {
      const pin = getStudentDefaultPin(clean);
      st = {
        id: "restored-" + Math.random().toString(36).substring(2, 9),
        name: clean,
        group: cleanGrp,
        groups: [cleanGrp],
        status: "active",
        phone: "",
        parentName: "",
        parentPhone: "",
        parentTg: "",
        login: clean.toLowerCase().replace(/\s+/g, "_"),
        pin,
        password: pin,
        pattern: "",
        notes: "",
        joinedDate: new Date().toISOString().split("T")[0],
        correct: 0,
        total: 0,
        sess: 0,
        strikes: 0,
        penalties: 0,
        bonus: 0,
        coins: 0,
        totalTests: 0,
        avgAccuracy: 0,
        attendanceStats: { present: 0, excused: 0, unexcused: 0 },
      };
      allStudentsRegistry.value.push(st);
      newlyRestored++;
    } else {
      if (cleanGrp && cleanGrp !== "Umumiy" && (!st.group || st.group === "Umumiy")) {
        st.group = cleanGrp;
        if (!Array.isArray(st.groups) || st.groups.length === 0 || (st.groups.length === 1 && st.groups[0] === "Umumiy")) {
          st.groups = [cleanGrp];
        }
      }
    }
    return st;
  };

  // 1. Scan localStorage["st"]
  try {
    const rawSt = localStorage.getItem("st");
    if (rawSt) {
      const list = JSON.parse(rawSt);
      if (Array.isArray(list)) {
        list.forEach((s: any) => {
          if (isValidName(s?.name) && !sampleIds.has(s?.id)) {
            const st = getOrAddStudent(s.name, s.group || "Umumiy");
            if (s.phone && !st.phone) st.phone = s.phone;
            if (s.parentName && !st.parentName) st.parentName = s.parentName;
            if (s.parentPhone && !st.parentPhone) st.parentPhone = s.parentPhone;
            if (s.parentTg && !st.parentTg) st.parentTg = s.parentTg;
            if (s.coins && !st.coins) st.coins = s.coins;
            if (s.strikes && !st.strikes) st.strikes = s.strikes;
            if (s.penalties && !st.penalties) st.penalties = s.penalties;
            if (s.totalTests && !st.totalTests) st.totalTests = s.totalTests;
            if (s.avgAccuracy && !st.avgAccuracy) st.avgAccuracy = s.avgAccuracy;
            if (Array.isArray(s.groups)) {
              st.groups = Array.from(new Set([...(st.groups || []), ...s.groups]));
            }
            sources.local++;
          }
        });
      }
    }
  } catch (e) {
    console.warn("Restore scan st error:", e);
  }

  // 2. Scan localStorage["ha_lesson_sessions"]
  try {
    const rawSessions = localStorage.getItem("ha_lesson_sessions");
    if (rawSessions) {
      const sessions = JSON.parse(rawSessions);
      if (Array.isArray(sessions)) {
        sessions.forEach((sess: any) => {
          const sessGroup = sess.group || "Umumiy";
          const results = sess.studentResults || sess.results || [];
          if (Array.isArray(results)) {
            results.forEach((r: any) => {
              if (isValidName(r?.name)) {
                getOrAddStudent(r.name, sessGroup);
                sources.sessions++;
              }
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn("Restore scan sessions error:", e);
  }

  // 3. Scan localStorage["ha_attendance_logs"] and "ha_local_attendance_logs"
  try {
    ["ha_attendance_logs", "ha_local_attendance_logs"].forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) {
        const logs = JSON.parse(raw);
        if (Array.isArray(logs)) {
          logs.forEach((item: any) => {
            if (isValidName(item?.name)) {
              getOrAddStudent(item.name, item.group || "Umumiy");
              sources.attendance++;
            }
          });
        }
      }
    });
  } catch (e) {
    console.warn("Restore scan attendance error:", e);
  }

  // 4. Scan Firebase "master_students"
  try {
    const snap = await fbGet(fbRef(db, "master_students"));
    if (snap && snap.exists()) {
      const cloudData = snap.val();
      Object.keys(cloudData).forEach((k) => {
        const data = cloudData[k];
        if (isValidName(data?.name)) {
          const st = getOrAddStudent(data.name, data.group || "Umumiy");
          if (data.phone && !st.phone) st.phone = data.phone;
          if (data.parentName && !st.parentName) st.parentName = data.parentName;
          if (data.parentPhone && !st.parentPhone) st.parentPhone = data.parentPhone;
          if (data.parentTg && !st.parentTg) st.parentTg = data.parentTg;
          if (data.pin) { st.pin = data.pin; st.password = data.pin; }
          if (data.pattern) st.pattern = data.pattern;
          if (data.notes && !st.notes) st.notes = data.notes;
          if (data.status) st.status = data.status;
          if (data.coins) st.coins = data.coins;
          if (data.totalTests) st.totalTests = data.totalTests;
          if (data.avgAccuracy) st.avgAccuracy = data.avgAccuracy;
          if (Array.isArray(data.groups)) {
            st.groups = Array.from(new Set([...(st.groups || []), ...data.groups]));
          }
          sources.firebase++;
        }
      });
    }
  } catch (e) {
    console.warn("Restore scan firebase master_students error:", e);
  }

  // 5. Scan Firebase "student_groups"
  try {
    const snapGroups = await fbGet(fbRef(db, "student_groups"));
    if (snapGroups && snapGroups.exists()) {
      const gData = snapGroups.val();
      Object.keys(gData).forEach((k) => {
        const item = gData[k];
        const sName = item?.name || item?.studentName;
        const gName = item?.group || item?.groupName;
        if (isValidName(sName) && gName) {
          const st = getOrAddStudent(sName, gName);
          if (!st.groups || st.groups.length === 0 || (st.groups.length === 1 && st.groups[0] === "Umumiy")) {
            st.groups = [gName];
            st.group = gName;
          }
          sources.firebase++;
        }
      });
    }
  } catch (e) {
    console.warn("Restore scan firebase student_groups error:", e);
  }

  // 6. Scan Firebase "lesson_sessions"
  try {
    const snapSessions = await fbGet(fbRef(db, "lesson_sessions"));
    if (snapSessions && snapSessions.exists()) {
      const sData = snapSessions.val();
      Object.keys(sData).forEach((k) => {
        const sess = sData[k];
        const sessGroup = sess.group || "Umumiy";
        const results = sess.studentResults || sess.results || [];
        if (Array.isArray(results)) {
          results.forEach((r: any) => {
            if (isValidName(r?.name)) {
              getOrAddStudent(r.name, sessGroup);
              sources.firebase++;
            }
          });
        }
      });
    }
  } catch (e) {
    console.warn("Restore scan firebase lesson_sessions error:", e);
  }

  // 7. Scan Google Sheets API
  try {
    const res = await callApi("get_student_list", {}, { forceRefresh: true });
    if (res && res.status === "success" && res.groups) {
      for (const groupName in res.groups) {
        if (groupName.toLowerCase() === "arxiv") continue;
        const members: string[] = res.groups[groupName] || [];
        members.forEach((name) => {
          if (isValidName(name)) {
            const st = getOrAddStudent(name, groupName);
            if (!st.groups || st.groups.length === 0 || (st.groups.length === 1 && st.groups[0] === "Umumiy")) {
              st.groups = [groupName];
              st.group = groupName;
            }
            sources.sheets++;
          }
        });
      }
    }
  } catch (e) {
    console.warn("Restore scan sheets error:", e);
  }

  // Auto-heal fields for all students
  allStudentsRegistry.value.forEach((s) => {
    if (!s.pin || !/^\d{6}$/.test(s.pin)) {
      s.pin = getStudentDefaultPin(s.name);
      s.password = s.pin;
    }
    if (!s.groups || s.groups.length === 0) {
      s.groups = [s.group || "Umumiy"];
    }
    if (!s.group) {
      s.group = s.groups[0] || "Umumiy";
    }
  });

  // Save to localStorage
  allStudentsRegistry.value = [...allStudentsRegistry.value];
  localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

  // Sync restored students to Firebase cloud
  allStudentsRegistry.value.forEach((s) => {
    syncStudentToCloud(s);
  });

  return {
    total: allStudentsRegistry.value.length,
    newlyRestored,
    sources,
  };
}

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
export const groupsMeta = ref<Record<string, GroupMeta>>(loadInitialGroupsMeta());

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

export function deleteGroupMetaFromCloud(groupName: string) {
  try {
    const key = sanitizeFbKey(groupName);
    fbRemove(fbRef(db, `groups_meta/${key}`)).catch(() => {});
  } catch (e) {
    console.warn("deleteGroupMetaFromCloud error:", e);
  }
}

export function syncAllExistingGroupsToCloud() {
  try {
    allStudentsRegistry.value.forEach((s) => {
      const g = (s.group || "").trim();
      if (s.name && g && g !== "Umumiy") {
        syncGroupTransferToCloud(s.name, g);
      }
    });
  } catch (e) {
    console.warn("syncAllExistingGroupsToCloud error:", e);
  }
}

export function syncAllExistingGroupsMetaToCloud() {
  try {
    for (const [, meta] of Object.entries(groupsMeta.value)) {
      if (meta && meta.name) {
        syncGroupMetaToCloud(meta);
      }
    }
  } catch (e) {
    console.warn("syncAllExistingGroupsMetaToCloud error:", e);
  }
}

if (typeof window !== "undefined") {
  if (Object.keys(groupsMeta.value).length > 0) {
    syncAllExistingGroupsMetaToCloud();
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
    if (!session || !session.id) return;
    fbSet(fbRef(db, `lesson_sessions/${session.id}`), session).catch((e: any) =>
      console.warn("Firebase session sync error:", e)
    );
  } catch (e) {
    console.warn("syncLessonSessionToCloud error:", e);
  }
}

export function syncAllExistingLessonSessionsToCloud() {
  try {
    if (!lessonSessions.value || !Array.isArray(lessonSessions.value)) return;
    lessonSessions.value.forEach((s) => {
      if (s && s.id) {
        syncLessonSessionToCloud(s);
      }
    });
  } catch (e) {
    console.warn("syncAllExistingLessonSessionsToCloud error:", e);
  }
}

// Auto-sync all existing local sessions to cloud on load
if (typeof window !== "undefined") {
  if (lessonSessions.value.length > 0) {
    syncAllExistingLessonSessionsToCloud();
  }

  // Listen for real-time lesson / test sessions in Firebase
  const sessionsFbRef = fbRef(db, "lesson_sessions");
  onChildAdded(sessionsFbRef, (snap: any) => {
    const s = snap.val();
    if (s && s.id) {
      const idx = lessonSessions.value.findIndex((x) => x.id === s.id);
      if (idx === -1) {
        lessonSessions.value.unshift(s);
      } else {
        lessonSessions.value[idx] = s;
      }
    }
  });
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
const sessionFinalized = ref<boolean>(false);

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

  const isStudentFrozen = (studentOrIdOrName: Student | string, contextGroup?: string): boolean => {
    if (!studentOrIdOrName) return false;
    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    const targetName = (typeof studentOrIdOrName === "string" ? studentOrIdOrName : target?.name || "").toLowerCase().trim();
    const targetId = target?.id ? target.id.trim() : "";
    const targetKey = target ? getStudentFbKey(target) : (targetId ? sanitizeFbKey(targetId) : sanitizeFbKey(targetName));

    // 1. Personal Freeze check (Highest priority: personally frozen students are blocked everywhere)
    if (target?.status === "frozen") return true;
    if (targetId && cloudFrozenStudents.value.includes(targetId.toLowerCase())) return true;
    if (targetName && cloudFrozenStudents.value.includes(targetName)) return true;
    if (targetKey && cloudFrozenStudents.value.includes(targetKey)) return true;

    // 2. Contextual Group Freeze check (When evaluated within a specific group)
    if (contextGroup && contextGroup.trim()) {
      const cleanCtx = contextGroup.toLowerCase().trim();
      return isGroupFrozen(cleanCtx);
    }

    // 3. Global Context check (e.g. Arena, Duel, Leaderboard where no single group is specified)
    // If student has enrolled groups, frozen globally ONLY IF ALL enrolled groups are frozen.
    const studentGroups = target ? getStudentGroups(target) : [];
    if (studentGroups.length > 0) {
      return studentGroups.every((g) => isGroupFrozen(g));
    }

    return false;
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

  // Unified Reminders computations (Combining Individual Student + Group Reminders)
  const allUnifiedReminders = computed<UnifiedReminder[]>(() => {
    const list: UnifiedReminder[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const curTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // 1. Individual student reminders
    reminders.value.forEach((r) => {
      const isDue =
        !r.completed &&
        (r.date < todayStr || (r.date === todayStr && r.time <= curTimeStr));
      list.push({
        id: r.id,
        source: "student",
        title: r.title,
        message: `${
          r.studentName ? r.studentName + (r.group ? " (" + r.group + ")" : "") : ""
        } ${r.note ? "• " + r.note : ""}`,
        date: r.date,
        time: r.time,
        group: r.group,
        studentName: r.studentName,
        completed: !!r.completed,
        isDue,
        createdAt: r.createdAt || 0,
      });
    });

    // 2. Group reminders from groupsMeta
    Object.values(groupsMeta.value).forEach((gMeta) => {
      if (gMeta.reminders && Array.isArray(gMeta.reminders)) {
        gMeta.reminders.forEach((gr) => {
          const isDue =
            !gr.completed &&
            (gr.date < todayStr ||
              (gr.date === todayStr && (gr.time || "14:00") <= curTimeStr));
          list.push({
            id: gr.id,
            source: "group",
            title: `«${gMeta.name}» Guruhi: ${gr.text}`,
            message: `Guruh eslatmasi / Reja • ${gMeta.subject || "Tarix"}`,
            date: gr.date,
            time: gr.time || "14:00",
            group: gMeta.name,
            completed: !!gr.completed,
            isDue,
            createdAt: gr.createdAt || 0,
          });
        });
      }
    });

    // Sort: Due first, then pending by date/time, then completed
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
      return (b.date + b.time).localeCompare(a.date + a.time);
    });
  });

  const activeRemindersCount = computed(
    () => allUnifiedReminders.value.filter((r) => !r.completed).length
  );

  const dueReminders = computed(() => {
    return allUnifiedReminders.value.filter((r) => r.isDue);
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
      const pin = generateUnique6DigitPin(trimmed);
      allStudentsRegistry.value.push({
        id: "std-" + Date.now(),
        name: trimmed,
        group: "Umumiy",
        status: "active",
        login: trimmed.toLowerCase().replace(/\s+/g, "_"),
        pin,
        password: pin,
        pattern: "",
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

    const primaryGroup = (studentData.group && studentData.group.trim())
      ? studentData.group.trim()
      : (Array.isArray(studentData.groups) && studentData.groups[0] ? studentData.groups[0].trim() : "Umumiy");

    let rawGroups = Array.isArray(studentData.groups) && studentData.groups.length > 0
      ? studentData.groups.map((g) => g.trim()).filter(Boolean)
      : [primaryGroup];

    if (!rawGroups.some((g) => g.toLowerCase() === primaryGroup.toLowerCase())) {
      rawGroups.unshift(primaryGroup);
    }
    const groups = Array.from(new Set(rawGroups));

    const existingStudent = existingIdx !== -1 ? allStudentsRegistry.value[existingIdx] : null;
    const phone = (studentData.phone && studentData.phone.trim())
      ? studentData.phone.trim()
      : (studentData.phone === "" && (studentData as any)._explicitClear ? "" : (existingStudent?.phone || ""));
    const parentName = (studentData.parentName && studentData.parentName.trim())
      ? studentData.parentName.trim()
      : (existingStudent?.parentName || "");
    const parentPhone = (studentData.parentPhone && studentData.parentPhone.trim())
      ? studentData.parentPhone.trim()
      : (existingStudent?.parentPhone || "");
    const parentTg = (studentData.parentTg && studentData.parentTg.trim())
      ? studentData.parentTg.trim()
      : (existingStudent?.parentTg || "");
    const notes = (studentData.notes && studentData.notes.trim())
      ? studentData.notes.trim()
      : (existingStudent?.notes || "");

    const fullData: Student = {
      id: studentData.id || existingStudent?.id || "std-" + Date.now(),
      name: trimmedName,
      group: primaryGroup,
      groups: groups,
      status: studentData.status || existingStudent?.status || "active",
      phone,
      parentName,
      parentPhone,
      parentTg,
      login:
        studentData.login || existingStudent?.login || trimmedName.toLowerCase().replace(/\s+/g, "_"),
      pin:
        studentData.pin && /^\d{6}$/.test(studentData.pin)
          ? studentData.pin
          : (existingStudent?.pin && /^\d{6}$/.test(existingStudent.pin)
              ? existingStudent.pin
              : generateUnique6DigitPin(trimmedName)),
      password:
        studentData.password ||
        studentData.pin ||
        existingStudent?.password ||
        generateUnique6DigitPin(trimmedName),
      pattern: studentData.pattern || existingStudent?.pattern || "",
      notes,
      joinedDate:
        studentData.joinedDate || existingStudent?.joinedDate || new Date().toISOString().split("T")[0],
      correct: studentData.correct ?? existingStudent?.correct ?? 0,
      total: studentData.total ?? existingStudent?.total ?? 0,
      sess: studentData.sess ?? existingStudent?.sess ?? 0,
      strikes: studentData.strikes ?? existingStudent?.strikes ?? 0,
      penalties: studentData.penalties ?? existingStudent?.penalties ?? 0,
      bonus: studentData.bonus ?? existingStudent?.bonus ?? 0,
      coins: studentData.coins ?? existingStudent?.coins ?? 0,
      totalTests: studentData.totalTests ?? existingStudent?.totalTests ?? 0,
      avgAccuracy: studentData.avgAccuracy ?? existingStudent?.avgAccuracy ?? 0,
      attendanceStats:
        studentData.attendanceStats || existingStudent?.attendanceStats || { present: 0, excused: 0, unexcused: 0 },
    };

    if (existingIdx !== -1) {
      allStudentsRegistry.value[existingIdx] = {
        ...allStudentsRegistry.value[existingIdx],
        ...fullData,
      };
    } else {
      allStudentsRegistry.value.unshift(fullData);
    }

    // Force Vue reactivity update & persist to localStorage
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    updateProtectedContactsBackup();

    // Realtime Cloud synchronization for student master record
    syncStudentToCloud(fullData);

    // Realtime Cloud synchronization for student freeze status
    syncFreezeToCloud(fullData.name, fullData.status === "frozen", fullData.group || "");

    // Realtime Cloud synchronization for student group
    syncGroupTransferToCloud(fullData.name, fullData.group || "Umumiy");

    // Sync status with session students
    const activeSessionStudent = students.value.find(
      (s) => s.name === fullData.name
    );
    if (activeSessionStudent) {
      activeSessionStudent.status = fullData.status;
      activeSessionStudent.group = fullData.group;
    }
  }

  async function toggleFreezeStudent(studentOrIdOrName: Student | string) {
    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const newStatus: "active" | "frozen" = target.status === "frozen" ? "active" : "frozen";
    const isFrozen = newStatus === "frozen";
    const now = Date.now();

    target.status = newStatus;
    target.updatedAt = now;

    const sKey = getStudentFbKey(target);
    const cleanName = target.name.toLowerCase().trim();
    const cleanId = target.id ? target.id.toLowerCase().trim() : "";

    if (isFrozen) {
      if (!cloudFrozenStudents.value.includes(sKey)) cloudFrozenStudents.value.push(sKey);
      if (cleanName && !cloudFrozenStudents.value.includes(cleanName)) cloudFrozenStudents.value.push(cleanName);
      if (cleanId && !cloudFrozenStudents.value.includes(cleanId)) cloudFrozenStudents.value.push(cleanId);
    } else {
      cloudFrozenStudents.value = cloudFrozenStudents.value.filter(
        (x) => x !== sKey && x !== cleanName && x !== cleanId
      );
    }

    // Immediately eject/restore in active session
    if (isFrozen) {
      students.value = students.value.filter(
        (s) => (target.id ? s.id !== target.id : true) && s.name.toLowerCase().trim() !== cleanName
      );
    } else {
      const inSession = students.value.find(
        (s) => (target.id && s.id === target.id) || s.name.toLowerCase().trim() === cleanName
      );
      if (inSession) inSession.status = "active";
    }

    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

    // Multi-path atomic update in Firebase
    try {
      const updates: Record<string, any> = {};
      updates[`master_students/${sKey}/status`] = newStatus;
      updates[`master_students/${sKey}/updatedAt`] = now;
      if (isFrozen) {
        updates[`frozen_students/${sKey}`] = {
          id: target.id || "",
          name: target.name,
          group: target.group || "Umumiy",
          frozenAt: now,
        };
      } else {
        updates[`frozen_students/${sKey}`] = null;
        const legacyKey = sanitizeFbKey(target.name);
        if (legacyKey !== sKey) {
          updates[`frozen_students/${legacyKey}`] = null;
        }
      }
      await fbUpdate(fbRef(db), updates);
    } catch (e) {
      console.warn("toggleFreezeStudent cloud update error:", e);
    }
  }

  async function toggleFreezeGroup(groupName: string, freeze: boolean) {
    const cleanGrp = groupName.toLowerCase().trim();
    if (isProtectedGroup(cleanGrp)) {
      console.warn(`Cannot freeze protected group: ${groupName}`);
      return;
    }

    const gKey = sanitizeFbKey(cleanGrp);
    if (freeze) {
      if (!cloudFrozenGroups.value.includes(cleanGrp)) {
        cloudFrozenGroups.value = [...cloudFrozenGroups.value, cleanGrp];
      }
    } else {
      cloudFrozenGroups.value = cloudFrozenGroups.value.filter((g) => g !== cleanGrp);
    }

    // NOTE: Group freeze/unfreeze NEVER touches any student's personal status or frozen_students record!
    // If group is frozen, eject active session students enrolled ONLY in this group
    if (freeze) {
      students.value = students.value.filter((s) => {
        const groups = getStudentGroups(s);
        return groups.some((g) => g.toLowerCase().trim() !== cleanGrp && !isGroupFrozen(g));
      });
    }

    try {
      const updates: Record<string, any> = {};
      if (freeze) {
        updates[`frozen_groups/${gKey}`] = {
          group: groupName.trim(),
          frozenAt: Date.now(),
        };
      } else {
        updates[`frozen_groups/${gKey}`] = null;
      }
      await fbUpdate(fbRef(db), updates);
    } catch (e) {
      console.warn("toggleFreezeGroup cloud update error:", e);
    }
  }

  async function addStudentToGroup(studentOrIdOrName: Student | string, newGroup: string) {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup) return;

    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const now = Date.now();
    const currentGroups = getStudentGroups(target);
    if (!currentGroups.some((g) => g.toLowerCase() === trimmedGroup.toLowerCase())) {
      const filtered = currentGroups.filter((g) => g !== "Umumiy");
      filtered.push(trimmedGroup);
      target.groups = filtered;
      if (!target.group || target.group === "Umumiy") {
        target.group = trimmedGroup;
      }
      target.updatedAt = now;

      allStudentsRegistry.value = [...allStudentsRegistry.value];
      localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

      try {
        const sKey = getStudentFbKey(target);
        const updates: Record<string, any> = {};
        updates[`master_students/${sKey}/group`] = target.group;
        updates[`master_students/${sKey}/groups`] = target.groups;
        updates[`master_students/${sKey}/updatedAt`] = now;
        updates[`student_groups/${sanitizeFbKey(target.name)}`] = {
          name: target.name,
          group: target.group,
          groups: target.groups,
          updatedAt: now,
        };
        await fbUpdate(fbRef(db), updates);
      } catch (e) {
        console.warn("addStudentToGroup cloud update error:", e);
      }
    }
  }

  async function removeStudentFromGroup(studentOrIdOrName: Student | string, groupToRemove: string) {
    const trimmedGroup = groupToRemove.trim();
    if (!trimmedGroup) return;

    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const now = Date.now();
    const currentGroups = getStudentGroups(target).filter(
      (g) => g.toLowerCase() !== trimmedGroup.toLowerCase()
    );
    // Fall back to "Umumiy" if no groups remain (prevents orphan students)
    target.groups = currentGroups.length > 0 ? currentGroups : ["Umumiy"];
    target.group = target.groups[0] || "Umumiy";
    target.updatedAt = now;

    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

    try {
      const sKey = getStudentFbKey(target);
      const updates: Record<string, any> = {};
      updates[`master_students/${sKey}/group`] = target.group;
      updates[`master_students/${sKey}/groups`] = target.groups;
      updates[`master_students/${sKey}/updatedAt`] = now;
      updates[`student_groups/${sanitizeFbKey(target.name)}`] = {
        name: target.name,
        group: target.group,
        groups: target.groups,
        updatedAt: now,
      };
      await fbUpdate(fbRef(db), updates);
    } catch (e) {
      console.warn("removeStudentFromGroup cloud update error:", e);
    }
  }

  async function transferStudentGroup(studentOrIdOrName: Student | string, newGroup: string, addToExisting = false) {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup) return;

    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    if (!target) return;

    const now = Date.now();
    target.updatedAt = now;

    if (addToExisting) {
      const cur = getStudentGroups(target);
      if (!cur.some((g) => g.toLowerCase() === trimmedGroup.toLowerCase())) {
        const filtered = cur.filter((g) => g !== "Umumiy");
        filtered.push(trimmedGroup);
        target.groups = filtered;
      }
      if (!target.group || target.group === "Umumiy") {
        target.group = trimmedGroup;
      }
    } else {
      target.group = trimmedGroup;
      target.groups = [trimmedGroup];
    }

    // In-session update
    const cleanName = target.name.toLowerCase().trim();
    const inSession = students.value.find(
      (s) => (target.id && s.id === target.id) || s.name.toLowerCase().trim() === cleanName
    );
    if (inSession) {
      inSession.group = target.group;
      inSession.groups = target.groups;
    }

    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

    try {
      const sKey = getStudentFbKey(target);
      const updates: Record<string, any> = {};
      updates[`master_students/${sKey}/group`] = target.group;
      updates[`master_students/${sKey}/groups`] = target.groups;
      updates[`master_students/${sKey}/updatedAt`] = now;
      updates[`student_groups/${sanitizeFbKey(target.name)}`] = {
        name: target.name,
        group: target.group,
        groups: target.groups,
        updatedAt: now,
      };
      await fbUpdate(fbRef(db), updates);
    } catch (e) {
      console.warn("transferStudentGroup cloud update error:", e);
    }
  }

  async function transferMultipleStudentsGroup(studentsOrNames: (Student | string)[], newGroup: string, addToExisting = false) {
    const trimmedGroup = newGroup.trim();
    if (!trimmedGroup || studentsOrNames.length === 0) return;

    const now = Date.now();
    const updates: Record<string, any> = {};

    studentsOrNames.forEach((item) => {
      const target = typeof item === "object" ? item : findStudentInRegistry(item);
      if (!target) return;

      target.updatedAt = now;
      if (addToExisting) {
        const cur = getStudentGroups(target);
        if (!cur.some((g) => g.toLowerCase() === trimmedGroup.toLowerCase())) {
          const filtered = cur.filter((g) => g !== "Umumiy");
          filtered.push(trimmedGroup);
          target.groups = filtered;
        }
        if (!target.group || target.group === "Umumiy") {
          target.group = trimmedGroup;
        }
      } else {
        target.group = trimmedGroup;
        target.groups = [trimmedGroup];
      }

      const cleanName = target.name.toLowerCase().trim();
      const inSession = students.value.find(
        (s) => (target.id && s.id === target.id) || s.name.toLowerCase().trim() === cleanName
      );
      if (inSession) {
        inSession.group = target.group;
        inSession.groups = target.groups;
      }

      const sKey = getStudentFbKey(target);
      updates[`master_students/${sKey}/group`] = target.group;
      updates[`master_students/${sKey}/groups`] = target.groups;
      updates[`master_students/${sKey}/updatedAt`] = now;
      updates[`student_groups/${sanitizeFbKey(target.name)}`] = {
        name: target.name,
        group: target.group,
        groups: target.groups,
        updatedAt: now,
      };
    });

    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));

    try {
      await fbUpdate(fbRef(db), updates);
    } catch (e) {
      console.warn("transferMultipleStudentsGroup cloud update error:", e);
    }
  }

  function deleteStudentPermanently(studentOrIdOrName: Student | string) {
    const target = typeof studentOrIdOrName === "object"
      ? studentOrIdOrName
      : findStudentInRegistry(studentOrIdOrName);
    const cleanName = (typeof studentOrIdOrName === "string" ? studentOrIdOrName : target?.name || "").toLowerCase().trim();
    const targetId = target?.id;

    allStudentsRegistry.value = allStudentsRegistry.value.filter(
      (s) => (targetId ? s.id !== targetId : true) && s.name.toLowerCase().trim() !== cleanName
    );
    students.value = students.value.filter(
      (s) => (targetId ? s.id !== targetId : true) && s.name.toLowerCase().trim() !== cleanName
    );
    reminders.value = reminders.value.filter(
      (r) => (r.studentName || "").toLowerCase().trim() !== cleanName
    );
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    deleteStudentFromCloud(target || cleanName);
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
    if (sessionFinalized.value) return;
    sessionFinalized.value = true;

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

      // 4. Record entry into local attendance logs and sync to Firebase
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

      // Sync to Firebase Cloud
      syncAttendanceLogToCloud(todayDate, s.name, status, groupName, reasonText);
    });

    // Trigger reactivity for CRM UI
    allStudentsRegistry.value = [...allStudentsRegistry.value];

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
    const cleanName = groupName.trim();
    if (!groupsMeta.value[cleanName]) {
      return {
        name: cleanName,
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
    return groupsMeta.value[cleanName];
  }

  function saveGroupMeta(meta: GroupMeta) {
    const now = Date.now();
    const updatedMeta: GroupMeta = {
      ...meta,
      updatedAt: now,
    };
    groupsMeta.value[meta.name] = updatedMeta;
    syncGroupMetaToCloud(updatedMeta);
  }

  async function renameGroup(oldName: string, newName: string): Promise<{ success: boolean; error?: string }> {
    const cleanOld = oldName.trim();
    const cleanNew = newName.trim();
    if (!cleanOld || !cleanNew) return { success: false, error: "Guruh nomi bo'sh bo'lishi mumkin emas" };
    if (cleanOld.toLowerCase() === cleanNew.toLowerCase()) return { success: true };

    if (isProtectedGroup(cleanOld)) {
      return { success: false, error: `«${cleanOld}» tizim guruhini qayta nomlash mumkin emas!` };
    }
    if (isProtectedGroup(cleanNew)) {
      return { success: false, error: `«${cleanNew}» nomi tizim tomonidan band qilingan!` };
    }

    const oldKey = sanitizeFbKey(cleanOld);
    const newKey = sanitizeFbKey(cleanNew);
    const now = Date.now();
    const updates: Record<string, any> = {};

    // 1. Update master_students
    allStudentsRegistry.value.forEach((s) => {
      const sGroups = getStudentGroups(s);
      if (sGroups.some((g) => g.toLowerCase() === cleanOld.toLowerCase())) {
        const updatedGroups = sGroups.map((g) => g.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : g);
        const updatedPrimary = (s.group && s.group.toLowerCase() === cleanOld.toLowerCase()) ? cleanNew : (s.group || cleanNew);
        s.groups = updatedGroups;
        s.group = updatedPrimary;
        s.updatedAt = now;

        const sKey = getStudentFbKey(s);
        updates[`master_students/${sKey}/group`] = updatedPrimary;
        updates[`master_students/${sKey}/groups`] = updatedGroups;
        updates[`master_students/${sKey}/updatedAt`] = now;
        updates[`student_groups/${sanitizeFbKey(s.name)}/group`] = updatedPrimary;
        updates[`student_groups/${sanitizeFbKey(s.name)}/groups`] = updatedGroups;
        updates[`student_groups/${sanitizeFbKey(s.name)}/updatedAt`] = now;
      }
    });

    // 2. Update groups_meta
    const existingMeta = groupsMeta.value[cleanOld] || {
      name: cleanOld,
      days: ["Du", "Chor", "Juma"],
      time: "14:00 - 15:30",
      room: "1-xona",
      subject: "Tarix",
      paymentFee: 300000,
    };
    const newMeta: GroupMeta = {
      ...existingMeta,
      name: cleanNew,
      updatedAt: now,
    };
    delete groupsMeta.value[cleanOld];
    groupsMeta.value[cleanNew] = newMeta;
    updates[`groups_meta/${oldKey}`] = null;
    updates[`groups_meta/${newKey}`] = newMeta;

    // 3. Update frozen_groups if it was frozen
    if (cloudFrozenGroups.value.includes(cleanOld.toLowerCase())) {
      cloudFrozenGroups.value = cloudFrozenGroups.value.filter((g) => g !== cleanOld.toLowerCase());
      cloudFrozenGroups.value.push(cleanNew.toLowerCase());
      updates[`frozen_groups/${oldKey}`] = null;
      updates[`frozen_groups/${newKey}`] = {
        group: cleanNew,
        frozenAt: now,
      };
    }

    // 4. Update local and cloud attendance_logs
    localAttendanceLogs.value.forEach((log) => {
      if (log.group && log.group.toLowerCase() === cleanOld.toLowerCase()) {
        log.group = cleanNew;
        const logKey = `${sanitizeFbKey(log.name)}_${log.date}`;
        updates[`attendance_logs/${logKey}/group`] = cleanNew;
      }
    });

    // 5. Update lesson_sessions
    lessonSessions.value.forEach((sess) => {
      if (sess.group && sess.group.toLowerCase() === cleanOld.toLowerCase()) {
        sess.group = cleanNew;
        if (sess.id) {
          updates[`lesson_sessions/${sess.id}/group`] = cleanNew;
        }
      }
    });

    // Save local caches
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    localStorage.setItem("ha_groups_meta", JSON.stringify(groupsMeta.value));
    localStorage.setItem("ha_attendance_logs", JSON.stringify(localAttendanceLogs.value));
    localStorage.setItem("ha_lesson_sessions", JSON.stringify(lessonSessions.value));

    // Execute atomic multi-path update
    try {
      await fbUpdate(fbRef(db), updates);
      return { success: true };
    } catch (e: any) {
      console.error("renameGroup atomic update failed:", e);
      return { success: false, error: e?.message || "Tarmoq xatosi yuz berdi" };
    }
  }

  async function deleteGroup(groupName: string): Promise<{ success: boolean; error?: string }> {
    const cleanGrp = groupName.trim();
    if (!cleanGrp) return { success: false, error: "Guruh nomi ko'rsatilmadi" };

    if (isProtectedGroup(cleanGrp)) {
      return { success: false, error: `«${cleanGrp}» tizim guruhini o'chirish mumkin emas!` };
    }

    const gKey = sanitizeFbKey(cleanGrp);
    const now = Date.now();
    const updates: Record<string, any> = {};

    // 1. Move all enrolled students to "Umumiy" (clean fallback, no orphans)
    allStudentsRegistry.value.forEach((s) => {
      const curGroups = getStudentGroups(s);
      if (curGroups.some((g) => g.toLowerCase() === cleanGrp.toLowerCase())) {
        const remaining = curGroups.filter((g) => g.toLowerCase() !== cleanGrp.toLowerCase());
        s.groups = remaining.length > 0 ? remaining : ["Umumiy"];
        s.group = s.groups[0] || "Umumiy";
        s.updatedAt = now;

        const sKey = getStudentFbKey(s);
        updates[`master_students/${sKey}/group`] = s.group;
        updates[`master_students/${sKey}/groups`] = s.groups;
        updates[`master_students/${sKey}/updatedAt`] = now;
        updates[`student_groups/${sanitizeFbKey(s.name)}/group`] = s.group;
        updates[`student_groups/${sanitizeFbKey(s.name)}/groups`] = s.groups;
        updates[`student_groups/${sanitizeFbKey(s.name)}/updatedAt`] = now;
      }
    });

    // 2. Soft-delete groups_meta (Preserve record for history, mark deleted)
    const existingMeta = groupsMeta.value[cleanGrp] || { name: cleanGrp };
    const softDeletedMeta = {
      ...existingMeta,
      deleted: true,
      deletedAt: now,
    };
    delete groupsMeta.value[cleanGrp];
    updates[`groups_meta/${gKey}`] = softDeletedMeta;

    // 3. Remove from frozen_groups if present
    if (cloudFrozenGroups.value.includes(cleanGrp.toLowerCase())) {
      cloudFrozenGroups.value = cloudFrozenGroups.value.filter((g) => g !== cleanGrp.toLowerCase());
      updates[`frozen_groups/${gKey}`] = null;
    }

    // Historical attendance_logs and lesson_sessions are KEPT intact for reports and financial history!

    // Save local caches
    allStudentsRegistry.value = [...allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(allStudentsRegistry.value));
    localStorage.setItem("ha_groups_meta", JSON.stringify(groupsMeta.value));

    // Execute atomic multi-path update
    try {
      await fbUpdate(fbRef(db), updates);
      return { success: true };
    } catch (e: any) {
      console.error("deleteGroup atomic update failed:", e);
      return { success: false, error: e?.message || "Tarmoq xatosi yuz berdi" };
    }
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

  function toggleCompleteUnifiedReminder(reminder: UnifiedReminder) {
    if (reminder.source === "group" && reminder.group) {
      toggleCompleteGroupReminder(reminder.group, reminder.id);
    } else {
      toggleCompleteReminder(reminder.id);
    }
  }

  function deleteUnifiedReminder(reminder: UnifiedReminder) {
    if (reminder.source === "group" && reminder.group) {
      deleteGroupReminder(reminder.group, reminder.id);
    } else {
      deleteReminder(reminder.id);
    }
  }

  function resetSession() {
    sessionFinalized.value = false;
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

  function resetStudentPattern(studentName: string) {
    const target = allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
    );
    if (target) {
      target.pattern = "";
      allStudentsRegistry.value = [...allStudentsRegistry.value];
      try {
        const key = sanitizeFbKey(target.name);
        fbRemove(fbRef(db, `student_patterns/${key}`)).catch(() => {});
      } catch (e) {}
      return true;
    }
    return false;
  }

  function regenerateStudentPin(studentName: string): string | null {
    const target = allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === studentName.toLowerCase().trim()
    );
    if (target) {
      const newPin = generateUnique6DigitPin(studentName);
      target.pin = newPin;
      target.password = newPin;
      allStudentsRegistry.value = [...allStudentsRegistry.value];
      return newPin;
    }
    return null;
  }

  return {
    teacherName,
    students,
    allStudentsRegistry,
    localAttendanceLogs,
    reminders,
    groupsMeta,
    lessonSessions,
    allUnifiedReminders,
    activeRemindersCount,
    dueReminders,
    toggleCompleteUnifiedReminder,
    deleteUnifiedReminder,
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
    renameGroup,
    deleteGroup,
    isProtectedGroup,
    PROTECTED_GROUPS,
    findStudentInRegistry,
    getStudentFbKey,
    initTeacherStoreSync,
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
    resetStudentPattern,
    regenerateStudentPin,
    toggleFreezeStudent,
    toggleFreezeGroup,
    transferStudentGroup,
    transferMultipleStudentsGroup,
    addStudentToGroup,
    removeStudentFromGroup,
    getStudentGroups,
    isStudentInGroup,
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
    sessionFinalized,
    syncGroupTransferToCloud,
    syncAttendanceLogToCloud,
    recordAttendanceLog,
    normalizeDateToDDMM,
    TEST_TYPES,
    syncGroupFreezeToCloud,
    cloudFrozenGroups,
    cloudFrozenStudents,
    isGroupFrozen,
    syncAllExistingLessonSessionsToCloud,
    syncStudentToCloud,
    deleteStudentFromCloud,
    restoreAndFindAllStudents,
    selectedDoskaStudent,
    requestedTeacherSubview,
    openStudentDoskaGlobal,
    updateProtectedContactsBackup,
    deepRecoverAllDataFromLocalStorage,
    bulkImportContacts,
  };
}
