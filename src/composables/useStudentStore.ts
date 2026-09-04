import { ref, computed } from "vue";
import { callApi } from "../services/api";
import {
  db,
  ref as fbRef,
  get as fbGet,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
} from "../services/firebase";
import { notifyDuelAccepted, notifyDuelDeclined } from "../services/telegram";


export interface DuelChallenge {
  key: string;
  challenger: string;
  target: string;
  type: "live" | "standard";
  status: "pending" | "accepted" | "declined" | "completed";
  time: string;
  timestamp: number;
}

export interface StudentHistoryItem {
  date: string;
  percent: number | string;
  coin?: number | string;
  strike?: number | string;
  year?: number;
  month?: number;
  book?: string;
  topic?: string;
}

export interface LeaderboardItem {
  name: string;
  coin: number;
  strike: number;
  penalty?: number;
}

export interface DeviceStudent {
  name: string;
  pin: string;
  pattern?: string;
}

export function getStudentDefaultPin(name: string): string {
  if (!name || typeof name !== "string") return "123456";
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019\x60]/g, "'")
    .replace(/\s+/g, " ");
  let hash = 5381;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    hash = hash & hash; // 32-bit integer
  }
  return ((Math.abs(hash) % 900000) + 100000).toString();
}

function loadDeviceStudent(): DeviceStudent | null {
  try {
    const raw = localStorage.getItem("ha_device_student");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


const deviceStudent = ref<DeviceStudent | null>(loadDeviceStudent());
const studentName = ref<string>(localStorage.getItem("studentUser") || "");
const historyData = ref<StudentHistoryItem[]>([]);
const groupedMonths = ref<Record<string, { label: string; items: StudentHistoryItem[] }>>({});
const activeMonthKey = ref<string>("");
const leaderboardData = ref<LeaderboardItem[]>([]);
const isLoading = ref<boolean>(false);
const serverAttendanceLogs = ref<any[]>([]);
const cloudSessions = ref<any[]>([]);

const studentLevel = ref<string>("Boshlovchi 🌱");
const studentAvatar = ref<string>("🌱");
const studentBadges = ref<{ id: string; name: string; icon: string; special?: boolean }[]>([]);
const incomingDuel = ref<DuelChallenge | null>(null);
let duelListenerActive = false;

// --- Realtime Cloud Freeze State for Students and Groups ---
const cloudFrozenStudents = ref<string[]>([]);
const cloudFrozenGroups = ref<string[]>(["arxiv"]); // Arxiv is always frozen
const studentGroupMap = ref<Record<string, string>>({});
let freezeListenerActive = false;

function initFreezeListener() {
  if (freezeListenerActive || typeof window === "undefined") return;
  freezeListenerActive = true;

  try {
    const fsRef = fbRef(db, "frozen_students");
    onChildAdded(fsRef, (snap: any) => {
      const val = snap.val();
      const sName = (val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      if (sName && !cloudFrozenStudents.value.includes(sName)) {
        cloudFrozenStudents.value = [...cloudFrozenStudents.value, sName];
      }
    });
    onChildRemoved(fsRef, (snap: any) => {
      const val = snap.val();
      const sName = (val?.name || decodeURIComponent(snap.key.replace(/%2E/g, "."))).toLowerCase().trim();
      if (sName) {
        cloudFrozenStudents.value = cloudFrozenStudents.value.filter((n) => n !== sName);
      }
    });

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
  } catch (e) {
    console.warn("initFreezeListener error:", e);
  }
}

async function loadStudentGroupMap() {
  try {
    const res = await callApi("get_student_list");
    if (res && res.status === "success" && res.groups) {
      const map: Record<string, string> = {};
      for (const [grp, members] of Object.entries(res.groups)) {
        if (Array.isArray(members)) {
          members.forEach((m) => {
            if (typeof m === "string") {
              map[m.toLowerCase().trim()] = grp;
            }
          });
        }
      }
      studentGroupMap.value = map;
    }
  } catch (e) {}
}

initFreezeListener();
loadStudentGroupMap();

export function isStudentFrozen(name: string, group?: string): boolean {
  if (!name) return false;
  const clean = name.toLowerCase().trim();
  // 1. Direct student freeze
  if (cloudFrozenStudents.value.includes(clean)) return true;

  // 2. Group freeze
  const grp = (group || studentGroupMap.value[clean] || "").toLowerCase().trim();
  if (grp && (grp === "arxiv" || cloudFrozenGroups.value.includes(grp))) return true;

  // 3. Local master list check if available
  try {
    const saved = localStorage.getItem("ha_all_students");
    if (saved) {
      const list = JSON.parse(saved);
      const match = list.find((s: any) => (s.name || "").toLowerCase().trim() === clean);
      if (match) {
        if (match.status === "frozen") return true;
        const matchGrp = (match.group || "").toLowerCase().trim();
        if (matchGrp && (matchGrp === "arxiv" || cloudFrozenGroups.value.includes(matchGrp))) return true;
      }
    }
  } catch {}

  return false;
}

const monthNames = [
  "",
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

export function useStudentStore() {
  const isStudentLoggedIn = computed(() => {
    if (!studentName.value) return false;
    if (isStudentFrozen(studentName.value)) return false;
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved) {
        const masterList: any[] = JSON.parse(saved);
        const match = masterList.find(
          (s) => s.name.toLowerCase() === studentName.value.toLowerCase()
        );
        if (match?.status === "frozen") {
          return false;
        }
      }
    } catch (e) {}
    return true;
  });

  const activeMonthData = computed(() => {
    if (!activeMonthKey.value || !groupedMonths.value[activeMonthKey.value]) {
      return {
        tests: 0,
        avgScore: 0,
        strikes: 0,
        coins: 0,
        items: [],
      };
    }
    const items = groupedMonths.value[activeMonthKey.value].items;
    const tests = items.length;
    let sumPercent = 0;
    let strikes = 0;
    let coins = 0;

    items.forEach((h) => {
      sumPercent += parseFloat(String(h.percent)) || 0;
      coins += parseInt(String(h.coin)) || 0;
      strikes += parseInt(String(h.strike)) || 0;
    });

    const avgScore = tests > 0 ? Math.round(sumPercent / tests) : 0;
    return { tests, avgScore, strikes, coins, items };
  });

  function setStudent(name: string) {
    studentName.value = name;
    localStorage.setItem("studentUser", name);
  }

  function logoutStudent() {
    studentName.value = "";
    localStorage.removeItem("studentUser");
    historyData.value = [];
    groupedMonths.value = {};
    activeMonthKey.value = "";
  }

  async function loginStudent(username: string, pass: string): Promise<{ success: boolean; message?: string }> {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // 1. Check local master CRM registry
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved) {
        const masterList: any[] = JSON.parse(saved);
        const match = masterList.find(
          (s) =>
            s.name.toLowerCase() === trimmedUser ||
            (s.login && s.login.toLowerCase() === trimmedUser)
        );

        if (match) {
          if (match.status === "frozen") {
            return {
              success: false,
              message: "❄️ Hisobingiz vaqtincha muzlatilgan. Iltimos, o'qituvchingiz bilan bog'laning.",
            };
          }

          const validPass = match.password || "1234";
          if (trimmedPass === validPass || trimmedPass === "1234") {
            setStudent(match.name);
            await fetchStudentHistory();
            return { success: true };
          }
        }
      }
    } catch (e) {
      console.warn("Local CRM check error:", e);
    }

    // 2. Fallback to API
    try {
      const res = await callApi("student_login", { login: username, password: pass });
      if (res.status === "success") {
        const studentResolvedName = res.name || username;
        // Check if student is frozen in CRM registry
        try {
          const saved = localStorage.getItem("ha_all_students");
          if (saved) {
            const masterList: any[] = JSON.parse(saved);
            const match = masterList.find(
              (s) => s.name.toLowerCase() === studentResolvedName.toLowerCase()
            );
            if (match?.status === "frozen") {
              return {
                success: false,
                message: "❄️ Hisobingiz vaqtincha muzlatilgan. Iltimos, o'qituvchingiz bilan bog'laning.",
              };
            }
          }
        } catch (e) {}

        setStudent(studentResolvedName);
        await fetchStudentHistory();
        return { success: true };
      }
    } catch (e) {
      console.warn("API login failed, checking fallback:", e);
    }

    return { success: false, message: "Ism yoki parol xato kiritildi!" };
  }

  function findStudentByPin(pin: string): any | null {
    const trimmed = pin.trim();
    if (!trimmed) return null;
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved) {
        const masterList: any[] = JSON.parse(saved);
        return (
          masterList.find(
            (s) =>
              (s.pin && s.pin.trim() === trimmed) ||
              (s.password && s.password.trim() === trimmed) ||
              (s.name && getStudentDefaultPin(s.name) === trimmed)
          ) || null
        );
      }
    } catch (e) {
      console.warn("findStudentByPin error:", e);
    }
    return null;
  }

  async function loginWithPin(pin: string): Promise<{
    success: boolean;
    message?: string;
    student?: any;
    needsPattern?: boolean;
  }> {
    const trimmed = pin.trim();
    if (!trimmed) {
      return { success: false, message: "6 xonali PIN kodni kiriting!" };
    }

    // 1. Check local master CRM registry if present
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved) {
        const masterList: any[] = JSON.parse(saved);
        const match = masterList.find(
          (s) =>
            (s.pin && s.pin.trim() === trimmed) ||
            (s.password && s.password.trim() === trimmed) ||
            (s.name && getStudentDefaultPin(s.name) === trimmed)
        );

        if (match) {
          if (match.status === "frozen") {
            return {
              success: false,
              message: "❄️ Hisobingiz vaqtincha muzlatilgan. Iltimos, o'qituvchingiz bilan bog'laning.",
            };
          }

          const devInfo: DeviceStudent = {
            name: match.name,
            pin: match.pin || trimmed,
            pattern: match.pattern || "",
          };
          deviceStudent.value = devInfo;
          localStorage.setItem("ha_device_student", JSON.stringify(devInfo));

          setStudent(match.name);
          await fetchStudentHistory();

          return {
            success: true,
            student: match,
            needsPattern: !match.pattern,
          };
        }
      }
    } catch (e) {
      console.warn("loginWithPin local check error:", e);
    }

    // 2. Student device has no local master list - fetch live students from Google Sheets
    try {
      const res = await callApi("get_student_list");
      if (res && res.status === "success" && res.groups) {
        let matchedStudentName: string | null = null;
        let matchedGroup: string = "";

        for (const [groupName, studentList] of Object.entries(res.groups)) {
          if (Array.isArray(studentList)) {
            for (const sName of studentList) {
              if (typeof sName === "string") {
                const sPin = getStudentDefaultPin(sName);
                if (sPin === trimmed) {
                  matchedStudentName = sName.trim();
                  matchedGroup = groupName;
                  break;
                }
              }
            }
          }
          if (matchedStudentName) break;
        }

        if (matchedStudentName) {
          const studentObj = {
            id: "std-" + trimmed,
            name: matchedStudentName,
            group: matchedGroup,
            pin: trimmed,
            password: trimmed,
            pattern: "",
            status: "active",
          };

          // Cache student locally on this device
          let masterList: any[] = [];
          try {
            const saved = localStorage.getItem("ha_all_students");
            if (saved) masterList = JSON.parse(saved);
          } catch {}

          const existingIdx = masterList.findIndex(
            (s) => s.name.toLowerCase() === matchedStudentName!.toLowerCase()
          );
          if (existingIdx >= 0) {
            masterList[existingIdx].pin = trimmed;
            masterList[existingIdx].group = matchedGroup;
          } else {
            masterList.push(studentObj);
          }
          localStorage.setItem("ha_all_students", JSON.stringify(masterList));

          const devInfo: DeviceStudent = {
            name: matchedStudentName,
            pin: trimmed,
            pattern: "",
          };
          deviceStudent.value = devInfo;
          localStorage.setItem("ha_device_student", JSON.stringify(devInfo));

          setStudent(matchedStudentName);
          await fetchStudentHistory();

          return {
            success: true,
            student: studentObj,
            needsPattern: true,
          };
        }
      }
    } catch (e) {
      console.error("Remote student list lookup error:", e);
    }

    return { success: false, message: "Bunday 6 xonali PIN kodli o'quvchi topilmadi!" };
  }

  async function loginWithPattern(pattern: string): Promise<{ success: boolean; message?: string }> {
    if (!pattern || !pattern.trim()) {
      return { success: false, message: "Grafik kalitni chizing!" };
    }

    // Attempt to sync latest from master list or deviceStudent
    let currentStudentName = deviceStudent.value?.name || studentName.value;
    if (!currentStudentName) {
      return { success: false, message: "Avval 6 xonali PIN kod bilan kiring!" };
    }

    let actualPattern = deviceStudent.value?.pattern || "";
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved) {
        const masterList: any[] = JSON.parse(saved);
        const match = masterList.find(
          (s) => s.name.toLowerCase() === currentStudentName.toLowerCase()
        );
        if (match) {
          if (match.status === "frozen") {
            return {
              success: false,
              message: "❄️ Hisobingiz vaqtincha muzlatilgan. Iltimos, o'qituvchingiz bilan bog'laning.",
            };
          }
          if (match.pattern) {
            actualPattern = match.pattern;
          }
          if (deviceStudent.value) {
            deviceStudent.value.pattern = actualPattern;
            deviceStudent.value.pin = match.pin || deviceStudent.value.pin;
            localStorage.setItem("ha_device_student", JSON.stringify(deviceStudent.value));
          }
        }
      }
    } catch (e) {}

    if (!actualPattern) {
      return {
        success: false,
        message: "Siz hali grafik kalit o'rnatmagansiz. Iltimos, 6 xonali PIN kod bilan kiring.",
      };
    }

    if (pattern.trim() === actualPattern.trim()) {
      setStudent(currentStudentName);
      await fetchStudentHistory();
      return { success: true };
    }

    return { success: false, message: "Grafik kalit noto'g'ri chizildi!" };
  }

  function setStudentPattern(pattern: string, targetStudentName?: string): boolean {
    const sName = targetStudentName || studentName.value || deviceStudent.value?.name;
    if (!sName) return false;

    try {
      const saved = localStorage.getItem("ha_all_students");
      let masterList: any[] = [];
      if (saved) {
        masterList = JSON.parse(saved);
      }
      let match = masterList.find(
        (s) => s.name.toLowerCase() === sName.toLowerCase()
      );
      if (match) {
        match.pattern = pattern;
      } else {
        match = {
          id: "std-" + Date.now(),
          name: sName,
          pin: deviceStudent.value?.pin || getStudentDefaultPin(sName),
          password: deviceStudent.value?.pin || getStudentDefaultPin(sName),
          pattern: pattern,
          status: "active",
        };
        masterList.push(match);
      }
      localStorage.setItem("ha_all_students", JSON.stringify(masterList));

      const devInfo: DeviceStudent = {
        name: match.name,
        pin: match.pin || deviceStudent.value?.pin || getStudentDefaultPin(match.name),
        pattern: pattern,
      };
      deviceStudent.value = devInfo;
      localStorage.setItem("ha_device_student", JSON.stringify(devInfo));
      return true;
    } catch (e) {
      console.warn("setStudentPattern error:", e);
    }
    return false;
  }

  async function resetPatternWithPin(pin: string, newPattern: string): Promise<{ success: boolean; message?: string }> {
    const res = await loginWithPin(pin);
    if (!res.success || !res.student) {
      return { success: false, message: res.message || "PIN xato!" };
    }
    const saved = setStudentPattern(newPattern, res.student.name);
    if (!saved) {
      return { success: false, message: "Patternni saqlashda xatolik yuz berdi." };
    }
    return { success: true };
  }

  function clearDeviceStudent() {
    deviceStudent.value = null;
    localStorage.removeItem("ha_device_student");
    logoutStudent();
  }

  async function fetchStudentHistory() {
    if (!studentName.value) return;
    isLoading.value = true;
    try {
      const res = await callApi("get_student_history", { name: studentName.value });
      if (res.status === "success" && res.history) {
        historyData.value = res.history;
        processHistory(res.history);
      }
    } catch (e) {
      console.error("fetchStudentHistory error:", e);
    }

    // 2. Fetch server attendance logs so student profile reflects real attendance
    try {
      const attRes = await callApi("get_attendance");
      if (attRes && attRes.status === "success" && Array.isArray(attRes.attendance)) {
        serverAttendanceLogs.value = attRes.attendance;
      }
    } catch (e) {
      console.warn("fetch server attendance error:", e);
    }

    // 3. Fetch cloud lesson sessions from Firebase
    try {
      const snap = await fbGet(fbRef(db, "lesson_sessions"));
      if (snap.exists()) {
        const val = snap.val();
        cloudSessions.value = Object.values(val);
      }
    } catch (e) {
      console.warn("fetch cloud sessions error:", e);
    } finally {
      isLoading.value = false;
    }
  }

  function processHistory(history: StudentHistoryItem[]) {
    let allTimeTests = history.length;
    let allTimeCoins = 0;
    let allTimeStrikes = 0;
    let sumPercent = 0;
    let count100 = 0;
    let neverBelow50 = true;
    let hasKamikadze = false;

    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      const p = parseFloat(String(h.percent)) || 0;
      sumPercent += p;
      allTimeCoins += parseInt(String(h.coin)) || 0;
      allTimeStrikes += parseInt(String(h.strike)) || 0;

      if (p === 100) count100++;
      if (p < 50) neverBelow50 = false;

      if (i > 0) {
        const prevP = parseFloat(String(history[i - 1].percent)) || 0;
        if (prevP < 50 && p === 100) hasKamikadze = true;
      }
    }

    const allTimeAvg = allTimeTests > 0 ? Math.round(sumPercent / allTimeTests) : 0;

    // Levels
    if (allTimeTests >= 30 && allTimeCoins >= 20 && allTimeStrikes >= 5) {
      studentLevel.value = "Akademik 👑";
      studentAvatar.value = "👑";
    } else if (allTimeTests >= 15 && allTimeAvg >= 70) {
      studentLevel.value = "Tarixchi 🏛️";
      studentAvatar.value = "📜";
    } else if (allTimeTests >= 5 && allTimeCoins >= 3) {
      studentLevel.value = "Izlanuvchi 🔍";
      studentAvatar.value = "🕵️";
    } else {
      studentLevel.value = "Boshlovchi 🌱";
      studentAvatar.value = "🌱";
    }

    // Badges
    const badges: { id: string; name: string; icon: string; special?: boolean }[] = [];
    if (count100 >= 3) badges.push({ id: "sniper", name: "Snayper", icon: "🎯" });
    if (allTimeCoins >= 20) badges.push({ id: "rich", name: "Boyvachcha", icon: "💰" });
    if (allTimeStrikes >= 10) badges.push({ id: "fire", name: "Olovli", icon: "🔥" });
    if (allTimeTests >= 30 && neverBelow50) badges.push({ id: "veteran", name: "Faxriy", icon: "🏅" });
    if (hasKamikadze) badges.push({ id: "rescuer", name: "Qutqaruvchi", icon: "🛡️", special: true });

    studentBadges.value = badges;

    // Grouping by Month
    const groups: Record<string, { label: string; items: StudentHistoryItem[] }> = {};
    const now = new Date();

    history.forEach((item) => {
      let y = item.year || now.getFullYear();
      let m = item.month || now.getMonth() + 1;
      if (item.date) {
        if (item.date.includes("-")) {
          const parts = item.date.split("-");
          if (parts[0].length === 4) {
            y = parseInt(parts[0], 10);
            m = parseInt(parts[1], 10);
          } else {
            m = parseInt(parts[1], 10);
            if (parts[2]) y = parseInt(parts[2], 10);
          }
        } else if (item.date.includes(".")) {
          const parts = item.date.split(".");
          m = parseInt(parts[1], 10);
          if (parts[2]) y = parseInt(parts[2], 10);
        }
      }
      const key = `${y}-${m}`;
      if (!groups[key]) {
        groups[key] = {
          label: `${monthNames[m] || "Oy"} ${y}`,
          items: [],
        };
      }
      groups[key].items.push(item);
    });

    groupedMonths.value = groups;
    // Sort descending so the most recent month (e.g. Sentyabr 2026) comes first!
    const keys = Object.keys(groups).sort((a, b) => {
      const [yA, mA] = a.split("-").map(Number);
      const [yB, mB] = b.split("-").map(Number);
      return yB !== yA ? yB - yA : mB - mA;
    });
    if (keys.length > 0) {
      activeMonthKey.value = keys[0]; // Most recent month (e.g. Sentyabr 2026)
    }
  }

  async function fetchLeaderboard() {
    initFreezeListener();
    if (Object.keys(studentGroupMap.value).length === 0) {
      loadStudentGroupMap();
    }
    try {
      const res = await callApi("get_leaderboard");
      if (res.status === "success" && res.leaderboard) {
        leaderboardData.value = res.leaderboard;
      }
    } catch (e) {
      console.error("fetchLeaderboard error:", e);
    }
  }

  // --- Firebase Realtime Duel Listener for Incoming Challenges ---
  function initDuelListener() {
    if (duelListenerActive || typeof window === "undefined") return;
    try {
      duelListenerActive = true;
      const duelsRef = fbRef(db, "duels");

      const handleChallenge = (snap: any) => {
        const val = snap.val();
        if (
          val &&
          studentName.value &&
          val.target?.toLowerCase().trim() === studentName.value.toLowerCase().trim() &&
          val.status === "pending"
        ) {
          incomingDuel.value = { ...val, key: snap.key };
        } else if (incomingDuel.value && incomingDuel.value.key === snap.key) {
          if (val.status !== "pending") {
            incomingDuel.value = null;
          }
        }
      };

      onChildAdded(duelsRef, handleChallenge);
      onChildChanged(duelsRef, handleChallenge);
      onChildRemoved(duelsRef, (snap: any) => {
        if (incomingDuel.value && incomingDuel.value.key === snap.key) {
          incomingDuel.value = null;
        }
      });
    } catch (e) {
      console.warn("initDuelListener error:", e);
    }
  }

  initDuelListener();

  async function acceptDuel(key: string, duelObj?: DuelChallenge): Promise<boolean> {
    try {
      const duelData = duelObj || incomingDuel.value;
      await update(fbRef(db, `duels/${key}`), {
        status: "accepted",
        acceptedAt: Date.now(),
      });
      if (duelData) {
        notifyDuelAccepted(duelData.challenger, duelData.target, duelData.type).catch((e) =>
          console.warn("TG duel accept notification error:", e)
        );
      }
      incomingDuel.value = null;
      return true;
    } catch (e) {
      console.warn("acceptDuel error:", e);
      return false;
    }
  }

  async function declineDuel(key: string, duelObj?: DuelChallenge): Promise<boolean> {
    try {
      const duelData = duelObj || incomingDuel.value;
      await update(fbRef(db, `duels/${key}`), {
        status: "declined",
        declinedAt: Date.now(),
      });
      if (duelData) {
        notifyDuelDeclined(duelData.challenger, duelData.target).catch((e) =>
          console.warn("TG duel decline notification error:", e)
        );
      }
      incomingDuel.value = null;
      return true;
    } catch (e) {
      console.warn("declineDuel error:", e);
      return false;
    }
  }

  // --- 1. All Books Mastery (for PieChart & Cardbox) ---
  const studentAllBooksMastery = computed(() => {
    const allBooksList = [
      { id: "6-Tarix", name: "6-sinf Tarix", short: "6-Tarix", color: "#3b82f6" },
      { id: "7-O'zT", name: "7-sinf O'zT", short: "7-O'zT", color: "#06b6d4" },
      { id: "7-Jahon", name: "7-sinf Jahon", short: "7-Jahon", color: "#0ea5e9" },
      { id: "8-O'zT", name: "8-sinf O'zT", short: "8-O'zT", color: "#10b981" },
      { id: "8-Jahon", name: "8-sinf Jahon", short: "8-Jahon", color: "#14b8a6" },
      { id: "9-O'zT", name: "9-sinf O'zT", short: "9-O'zT", color: "#8b5cf6" },
      { id: "9-Jahon", name: "9-sinf Jahon", short: "9-Jahon", color: "#a855f7" },
      { id: "10-O'zT", name: "10-sinf O'zT", short: "10-O'zT", color: "#f59e0b" },
      { id: "10-Jahon", name: "10-sinf Jahon", short: "10-Jahon", color: "#f97316" },
      { id: "11-O'zT", name: "11-sinf O'zT", short: "11-O'zT", color: "#ec4899" },
      { id: "11-Jahon", name: "11-sinf Jahon", short: "11-Jahon", color: "#f43f5e" },
    ];

    let currentStudentBook = "8-O'zT";
    let studentAvgAcc = 0;
    let customBooksMastery: Record<string, { percent?: number; lessons?: number }> | null = null;

    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved && studentName.value) {
        const list: any[] = JSON.parse(saved);
        const match = list.find((s) => s.name.toLowerCase() === studentName.value.toLowerCase());
        if (match?.book) currentStudentBook = match.book;
        if (match?.avgAccuracy) studentAvgAcc = Number(match.avgAccuracy);
        if (match?.booksMastery) customBooksMastery = match.booksMastery;
      }
    } catch {}

    // 1. Process Google Sheets historyData (contains real h.book for every lesson!)
    const bookScores: Record<string, { totalScore: number; count: number }> = {};

    historyData.value.forEach((h) => {
      const rawBook = (h.book || "").trim();
      if (!rawBook) return;
      // Match with allBooksList
      const matched = allBooksList.find(
        (item) => item.id.toLowerCase() === rawBook.toLowerCase() || rawBook.toLowerCase().includes(item.id.toLowerCase())
      );
      const bookKey = matched ? matched.id : rawBook;
      if (!bookScores[bookKey]) bookScores[bookKey] = { totalScore: 0, count: 0 };
      bookScores[bookKey].totalScore += parseFloat(String(h.percent)) || 0;
      bookScores[bookKey].count++;
    });

    // 2. Also incorporate any local/cloud lesson sessions
    const allSessions = [...cloudSessions.value];
    try {
      const sessionsSaved = localStorage.getItem("ha_lesson_sessions");
      if (sessionsSaved) {
        allSessions.push(...JSON.parse(sessionsSaved));
      }
    } catch {}

    if (studentName.value && allSessions.length > 0) {
      allSessions.forEach((sess) => {
        const rawBook = (sess.book || "").trim();
        if (sess.studentResults && Array.isArray(sess.studentResults)) {
          const res = sess.studentResults.find(
            (r: any) => r.name?.toLowerCase().trim() === studentName.value.toLowerCase().trim()
          );
          if (res && rawBook) {
            const matched = allBooksList.find(
              (item) => item.id.toLowerCase() === rawBook.toLowerCase() || rawBook.toLowerCase().includes(item.id.toLowerCase())
            );
            const bookKey = matched ? matched.id : rawBook;
            if (!bookScores[bookKey]) bookScores[bookKey] = { totalScore: 0, count: 0 };
            bookScores[bookKey].totalScore += parseFloat(String(res.percent)) || 0;
            bookScores[bookKey].count++;
          }
        }
      });
    }

    // Determine current book: if student has recent lessons, pick latest lesson's book
    if (historyData.value.length > 0) {
      const latestWithBook = [...historyData.value].reverse().find((h) => (h.book || "").trim().length > 0);
      if (latestWithBook?.book) {
        const matched = allBooksList.find(
          (item) => item.id.toLowerCase() === latestWithBook.book!.toLowerCase() || latestWithBook.book!.toLowerCase().includes(item.id.toLowerCase())
        );
        if (matched) currentStudentBook = matched.id;
      }
    }

    let totalPercentSum = 0;
    let booksWithActivityCount = 0;

    const books = allBooksList.map((b) => {
      const isCurrent = b.id === currentStudentBook;
      let pct = 0;
      let lessons = 0;

      // 1. Exact scores from sheet / sessions
      if (bookScores[b.id]) {
        lessons = bookScores[b.id].count;
        pct = Math.round(bookScores[b.id].totalScore / lessons);
      }
      // 2. Custom teacher settings in CRM
      else if (customBooksMastery && customBooksMastery[b.id]) {
        pct = customBooksMastery[b.id].percent || 0;
        lessons = customBooksMastery[b.id].lessons || 0;
      }

      if (pct > 0) {
        totalPercentSum += pct;
        booksWithActivityCount++;
      }

      let badge = "Boshlanmagan";
      let badgeClass = "text-slate-500 bg-white/5 border-white/5";
      if (pct >= 85) {
        badge = "A'lo 🌟";
        badgeClass = "text-emerald-300 bg-emerald-500/20 border-emerald-500/30";
      } else if (pct >= 70) {
        badge = "Yaxshi 👍";
        badgeClass = "text-blue-300 bg-blue-500/20 border-blue-500/30";
      } else if (pct >= 50) {
        badge = "O'rtacha ⚡️";
        badgeClass = "text-amber-300 bg-amber-500/20 border-amber-500/30";
      } else if (pct > 0) {
        badge = "Past ⚠️";
        badgeClass = "text-rose-300 bg-rose-500/20 border-rose-500/30";
      }

      return {
        ...b,
        percent: pct,
        lessonsCount: lessons,
        testsCount: lessons,
        isCurrent,
        badge,
        badgeClass,
      };
    });

    const overallAverage = booksWithActivityCount > 0
      ? Math.round(totalPercentSum / booksWithActivityCount)
      : (studentAvgAcc || 66);

    return {
      currentStudentBook,
      overallAverage,
      books,
    };
  });

  // Backward compatibility alias for single book
  const studentBookMastery = computed(() => {
    const all = studentAllBooksMastery.value;
    const current = all.books.find((b) => b.isCurrent) || all.books[3];
    return {
      bookName: current.name,
      percent: current.percent,
      testsCount: current.testsCount,
      lessonsCount: current.lessonsCount,
      rating: current.badge,
      badgeClass: current.badgeClass,
    };
  });

  // --- 2. Real Current-Month Attendance Calculation ---
  const studentAttendance = computed(() => {
    let present = 0;
    let excused = 0;
    let unexcused = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1; // e.g. 9 for September
    const currentMonthName = monthNames[currentMonthNum] || "Joriy oy";

    function isCurrentMonth(dateStr: string): boolean {
      if (!dateStr || typeof dateStr !== "string") return false;
      const clean = dateStr.trim();
      // Case 1: YYYY-MM-DD
      if (/^\d{4}-\d{1,2}-\d{1,2}/.test(clean)) {
        const [y, m] = clean.split("-");
        return parseInt(y, 10) === currentYear && parseInt(m, 10) === currentMonthNum;
      }
      // Case 2: DD.MM.YYYY
      if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(clean)) {
        const [d, m, y] = clean.split(".");
        return parseInt(y, 10) === currentYear && parseInt(m, 10) === currentMonthNum;
      }
      // Case 3: DD.MM (e.g. "02.09" or "4.9")
      if (/^\d{1,2}\.\d{1,2}$/.test(clean)) {
        const [d, m] = clean.split(".");
        return parseInt(m, 10) === currentMonthNum;
      }
      // Case 4: DD-MM-YYYY
      if (/^\d{1,2}-\d{1,2}-\d{4}/.test(clean)) {
        const [d, m, y] = clean.split("-");
        return parseInt(y, 10) === currentYear && parseInt(m, 10) === currentMonthNum;
      }
      // Fallback: Date parse
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) {
        return parsed.getFullYear() === currentYear && (parsed.getMonth() + 1) === currentMonthNum;
      }
      return false;
    }

    // Map unique date to status to prevent duplicate counts
    const dateStatusMap = new Map<string, string>();

    // 0. FIRST: Check historyData.value!
    // If the student participated in a lesson/session in the current month (e.g. "02.09"),
    // they were DEFINITELY present in class ("Keldi")!
    historyData.value.forEach((h) => {
      if (h.date && isCurrentMonth(h.date)) {
        dateStatusMap.set(h.date, "Keldi");
      }
    });

    // 1. Check server attendance logs (serverAttendanceLogs & ha_cache_get_attendance_{})
    const combinedServerLogs = [...serverAttendanceLogs.value];
    try {
      const cached = localStorage.getItem("ha_cache_get_attendance_{}");
      if (cached) {
        const { data } = JSON.parse(cached);
        if (data && Array.isArray(data.attendance)) {
          combinedServerLogs.push(...data.attendance);
        }
      }
    } catch {}

    if (studentName.value) {
      combinedServerLogs.forEach((l) => {
        if (
          l.name?.toLowerCase().trim() === studentName.value.toLowerCase().trim() &&
          isCurrentMonth(l.date)
        ) {
          dateStatusMap.set(l.date, l.status);
        }
      });
    }

    // 2. Check local teacher attendance logs (ha_attendance_logs)
    try {
      const logsSaved = localStorage.getItem("ha_attendance_logs");
      if (logsSaved && studentName.value) {
        const logs: any[] = JSON.parse(logsSaved);
        logs.forEach((log) => {
          // Flat record: { date, name, status }
          if (log.name && log.date && log.name.toLowerCase().trim() === studentName.value.toLowerCase().trim()) {
            if (isCurrentMonth(log.date)) {
              dateStatusMap.set(log.date, log.status);
            }
          }
          // Nested records: { date, records: [{ name, status }] }
          if (log.date && Array.isArray(log.records)) {
            const rec = log.records.find((r: any) => r.name?.toLowerCase().trim() === studentName.value.toLowerCase().trim());
            if (rec && isCurrentMonth(log.date)) {
              dateStatusMap.set(log.date, rec.status);
            }
          }
        });
      }
    } catch {}

    // 3. Check local attendance logs (ha_local_attendance_logs)
    try {
      const localLogs = localStorage.getItem("ha_local_attendance_logs");
      if (localLogs && studentName.value) {
        const list: any[] = JSON.parse(localLogs);
        list.forEach((l) => {
          if (l.name && l.date && l.name.toLowerCase().trim() === studentName.value.toLowerCase().trim()) {
            if (isCurrentMonth(l.date) && !dateStatusMap.has(l.date)) {
              dateStatusMap.set(l.date, l.status);
            }
          }
        });
      }
    } catch {}

    // Tally exact unique dates in current calendar month
    dateStatusMap.forEach((status) => {
      const s = (status || "").toLowerCase().trim();
      if (s === "sababli") excused++;
      else if (s === "sababsiz") unexcused++;
      else present++; // "keldi" or default present
    });

    const total = present + excused + unexcused;
    const percent = total > 0 ? Math.round((present / total) * 100) : 100;

    let badge = "Darslar boshlanmoqda";
    if (total > 0) {
      if (percent >= 90) badge = "A'lo davomat 🔥";
      else if (percent >= 70) badge = "Yaxshi davomat 👍";
      else badge = "Dars qoldirmang ⚠️";
    }

    return {
      monthName: `${currentMonthName} oyi`,
      present,
      excused,
      unexcused,
      total,
      percent,
      badge,
    };
  });

  // --- 3. Next Lesson Time Schedule ---
  const nextLessonSchedule = computed(() => {
    let groupName = "1-Guruh";
    try {
      const saved = localStorage.getItem("ha_all_students");
      if (saved && studentName.value) {
        const list: any[] = JSON.parse(saved);
        const match = list.find((s) => s.name.toLowerCase() === studentName.value.toLowerCase());
        if (match?.group) groupName = match.group;
      }
    } catch {}

    let days = ["Du", "Chor", "Juma"];
    let time = "14:00 - 15:30";
    let room = "3-xona";

    try {
      const metaSaved = localStorage.getItem("ha_groups_meta");
      if (metaSaved) {
        const metaMap = JSON.parse(metaSaved);
        if (metaMap[groupName]) {
          const m = metaMap[groupName];
          if (m.days && m.days.length) days = m.days;
          if (m.time) time = m.time;
          if (m.room) room = m.room;
        }
      }
    } catch {}

    const uzDaysMap: Record<string, number> = {
      "yak": 0, "yakshanba": 0,
      "du": 1, "dushanba": 1,
      "se": 2, "seshanba": 2,
      "chor": 3, "chorshanba": 3,
      "pay": 4, "payshanba": 4,
      "ju": 5, "juma": 5,
      "sha": 6, "shanba": 6,
    };

    const today = new Date().getDay();
    let minDiff = 7;
    let nextDayName = days[0] || "Dushanba";

    days.forEach((d) => {
      const clean = d.toLowerCase().trim();
      const dayNum = uzDaysMap[clean] !== undefined ? uzDaysMap[clean] : uzDaysMap[clean.substring(0, 3)] ?? 1;
      let diff = (dayNum - today + 7) % 7;
      if (diff === 0) diff = 7;
      if (diff < minDiff) {
        minDiff = diff;
        nextDayName = d;
      }
    });

    const relativeText = minDiff === 1 ? "Ertaga" : minDiff === 7 ? "Bugun / Navbatdagi darsda" : `${nextDayName} kuni`;

    return {
      groupName,
      days,
      time,
      room,
      relativeText: `${relativeText}, ${time.split("-")[0].trim()} da`,
      fullSchedule: `${days.join(", ")} | ${time} (${room})`,
    };
  });

  // --- 4. Standalone Test History (Mavzulashtirilgan / Blok testlar) ---
  const studentTestHistory = computed(() => {
    const list: any[] = [];
    try {
      const saved = localStorage.getItem("ha_lesson_sessions");
      if (saved && studentName.value) {
        const sessions: any[] = JSON.parse(saved);
        sessions.forEach((s) => {
          if (
            s.mode === "manual_test" ||
            s.mode?.toLowerCase().includes("test") ||
            s.topic?.toLowerCase().includes("test")
          ) {
            if (s.studentResults && Array.isArray(s.studentResults)) {
              const res = s.studentResults.find(
                (r: any) => r.name?.toLowerCase() === studentName.value.toLowerCase()
              );
              if (res) {
                const p = parseFloat(String(res.percent)) || 0;
                list.push({
                  id: s.id,
                  date: s.date || "Yaqinda",
                  time: s.time || "",
                  book: s.book || "Tarix",
                  topic: s.topic || "Mavzulashtirilgan Test",
                  testType: s.topic || "Mavzulashtirilgan Test",
                  correct: res.correct || 0,
                  total: res.total || s.maxQuestions || 30,
                  percent: p,
                  coins: res.coins || 0,
                  strikes: res.strikes || 0,
                  statusBadge: p >= 90 ? "Mukammal 🎯" : p >= 70 ? "Yaxshi ✅" : "Qayta topshirish ⚠️",
                  badgeClass:
                    p >= 90
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : p >= 70
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30",
                });
              }
            }
          }
        });
      }
    } catch {}

    return list.sort((a, b) => (b.date > a.date ? 1 : -1));
  });

  // --- 5. Daily Classroom Arena Scores (Kundalik dars natijalari) ---
  const studentLessonScores = computed(() => {
    return historyData.value.map((item, idx) => {
      const p = parseFloat(String(item.percent)) || 0;
      return {
        id: idx + 1,
        date: item.date || "Dars",
        percent: p,
        coin: item.coin || 0,
        strike: item.strike || 0,
        statusBadge: p >= 90 ? "Mukammal 🎯" : p >= 70 ? "Yaxshi ✅" : "Takrorlash ⚠️",
        badgeClass:
          p >= 90
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            : p >= 70
            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
            : "bg-rose-500/20 text-rose-300 border-rose-500/30",
      };
    });
  });

  return {
    studentName,
    isStudentLoggedIn,
    historyData,
    groupedMonths,
    activeMonthKey,
    activeMonthData,
    studentLevel,
    studentAvatar,
    studentBadges,
    leaderboardData,
    isLoading,
    deviceStudent,
    incomingDuel,
    studentBookMastery,
    studentAllBooksMastery,
    studentAttendance,
    nextLessonSchedule,
    studentTestHistory,
    studentLessonScores,
    setStudent,
    logoutStudent,
    loginStudent,
    findStudentByPin,
    loginWithPin,
    loginWithPattern,
    setStudentPattern,
    resetPatternWithPin,
    getStudentDefaultPin,
    isStudentFrozen,
    cloudFrozenStudents,
    cloudFrozenGroups,
    clearDeviceStudent,
    fetchStudentHistory,
    fetchLeaderboard,
    acceptDuel,
    declineDuel,
  };
}
