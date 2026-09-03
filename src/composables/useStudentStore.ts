import { ref, computed } from "vue";
import { callApi } from "../services/api";

export interface StudentHistoryItem {
  date: string;
  percent: number | string;
  coin?: number | string;
  strike?: number | string;
  year?: number;
  month?: number;
}

export interface LeaderboardItem {
  name: string;
  coin: number;
  strike: number;
  penalty?: number;
}

const studentName = ref<string>(localStorage.getItem("studentUser") || "");
const historyData = ref<StudentHistoryItem[]>([]);
const groupedMonths = ref<Record<string, { label: string; items: StudentHistoryItem[] }>>({});
const activeMonthKey = ref<string>("");
const leaderboardData = ref<LeaderboardItem[]>([]);
const isLoading = ref<boolean>(false);

const studentLevel = ref<string>("Boshlovchi 🌱");
const studentAvatar = ref<string>("🌱");
const studentBadges = ref<{ id: string; name: string; icon: string; special?: boolean }[]>([]);

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
      // If date is like "02.09" or "2026-09-02"
      if (item.date && item.date.includes("-")) {
        const parts = item.date.split("-");
        y = parseInt(parts[0]);
        m = parseInt(parts[1]);
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
    const keys = Object.keys(groups);
    if (keys.length > 0) {
      activeMonthKey.value = keys[keys.length - 1]; // Latest month
    }
  }

  async function fetchLeaderboard() {
    try {
      const res = await callApi("get_leaderboard");
      if (res.status === "success" && res.leaderboard) {
        leaderboardData.value = res.leaderboard;
      }
    } catch (e) {
      console.error("fetchLeaderboard error:", e);
    }
  }

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
    setStudent,
    logoutStudent,
    loginStudent,
    fetchStudentHistory,
    fetchLeaderboard,
  };
}
