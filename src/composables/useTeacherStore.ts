import { ref, computed, watch } from "vue";
import { callApi } from "../services/api";
import { soundManager, fireConfetti, fireVictoryConfetti } from "./useAudio";

export interface Student {
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

const teacherName = ref<string>(localStorage.getItem("teacherName") || "");
const students = ref<Student[]>(
  JSON.parse(localStorage.getItem("st") || "[]")
);
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

// Watch & persist students
watch(
  students,
  (newVal) => {
    localStorage.setItem("st", JSON.stringify(newVal));
  },
  { deep: true }
);

export function useTeacherStore() {
  const isTeacherLoggedIn = computed(() => !!teacherName.value);

  const standardStudents = computed(() =>
    students.value.filter((s) => !s.team || s.team === "standard")
  );
  const teamAStudents = computed(() =>
    students.value.filter((s) => s.team === "A")
  );
  const teamBStudents = computed(() =>
    students.value.filter((s) => s.team === "B")
  );
  const duelStudents = computed(() =>
    students.value.filter((s) => s.team === "Duel")
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
    });
  }

  function removeStudent(index: number) {
    students.value.splice(index, 1);
  }

  function addFromDb(names: string[], targetTeam: string = "standard") {
    names.forEach((name) => {
      const existing = students.value.find((s) => s.name === name);
      if (existing) {
        existing.team = targetTeam;
        existing.correct = 0;
        existing.total = 0;
        existing.sess = 0;
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
        });
      }
    });
  }

  function setGlobalTask(book: string, topic: string) {
    globalBook.value = book;
    globalTopic.value = topic;
    students.value.forEach((s) => {
      s.book = book;
      s.topic = topic;
    });
  }

  function setIndividualTask(index: number, book: string, topic: string) {
    if (students.value[index]) {
      students.value[index].book = book;
      students.value[index].topic = topic;
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
    if (currentMode.value === "standard") {
      return standardStudents.value;
    }
    if (currentMode.value === "Duel") {
      return duelStudents.value;
    }
    return [...teamAStudents.value, ...teamBStudents.value];
  }

  function checkZeroScorers(): Student[] {
    const players = getActivePlayers();
    zeroScorers.value = players.filter((s) => !s.total || s.total === 0);
    return zeroScorers.value;
  }

  function finalizeResults() {
    stopTimer();
    fireVictoryConfetti();
    const players = getActivePlayers();

    players.forEach((s) => {
      const p = calcPercent(s);
      if (s.attStatus === "Sababsiz" || s.attStatus === "Sababli") return;
      if (p >= 90 && s.total > 0 && !s.strikeAdded) {
        s.strikes = (s.strikes || 0) + 1;
        s.strikeAdded = true;
      }
      if (p < 50 && s.total > 0 && !s.penaltyAdded) {
        s.penalties = (s.penalties || 0) + 1;
        s.penaltyAdded = true;
      }
    });
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
    teamAScore,
    teamBScore,
    zeroScorers,
    activeDuels,
    suggestedLiveDuel,
    setTeacher,
    logoutTeacher,
    setMode,
    addStudent,
    removeStudent,
    addFromDb,
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
