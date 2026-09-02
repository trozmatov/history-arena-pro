<template>
  <div class="space-y-4 max-w-xl mx-auto pb-6">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Title -->
      <div class="text-center">
        <span class="text-3xl">🏆</span>
        <h2 class="text-2xl font-black text-white tracking-tight mt-1">Dars Natijalari</h2>
        <p class="text-xs text-slate-400">Rejim: <b class="text-blue-400 capitalize">{{ teacherStore.currentMode.value }}</b></p>
      </div>

      <!-- Results list -->
      <div class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-for="(s, idx) in sortedPlayers"
          :key="s.name"
          class="flex items-center justify-between rounded-2xl border p-3.5 text-xs transition shadow-md"
          :class="getRowClass(s)"
        >
          <!-- Name & strikes/penalties -->
          <div class="flex items-center gap-2.5">
            <span class="font-extrabold text-slate-400 w-5">{{ idx + 1 }}.</span>
            <span class="font-black text-white text-sm">{{ s.name }}</span>
            <span v-if="s.strikes > 0" class="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-black text-amber-400 border border-amber-500/30">
              ⭐ {{ s.strikes }}
            </span>
            <span v-if="s.penalties > 0" class="rounded-md bg-red-500/20 px-1.5 py-0.5 font-black text-red-400 border border-red-500/30">
              ⚠️ {{ s.penalties }}
            </span>
          </div>

          <!-- Score or absence status -->
          <div>
            <span v-if="s.attStatus === 'Sababsiz'" class="font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-full text-[11px]">
              ❌ Sababsiz
            </span>
            <span v-else-if="s.attStatus === 'Sababli'" class="font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px]">
              🟡 Sababli
            </span>
            <div v-else class="text-right">
              <span class="text-base font-black tabular-nums" :class="getPercentColor(s)">
                {{ teacherStore.calcPercent(s) }}%
              </span>
              <span class="block text-[10px] text-slate-400 tabular-nums">
                ({{ s.correct }}/{{ s.total }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Telegram Send Button -->
      <button
        type="button"
        @click="sendTelegram"
        :disabled="sendingTg"
        class="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-50 transition"
      >
        <span>✈️</span>
        <span>{{ tgSent ? "Telegramga yuborildi ✅" : sendingTg ? "Yuborilmoqda... ⏳" : "Telegramga yuborish" }}</span>
      </button>

      <!-- Back to Game & Reset Actions -->
      <div class="grid grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          @click="$emit('backToGame')"
          class="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-extrabold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
        >
          ⬅️ O'yinga qaytish
        </button>
        <button
          type="button"
          @click="showResetModal = true"
          class="rounded-2xl border border-red-500/40 bg-red-500/15 py-3.5 text-xs font-black text-red-300 hover:bg-red-500/25 active:scale-95 transition"
        >
          Yangi darsga o'tish 🔄
        </button>
      </div>
    </div>

    <!-- Custom In-App Confirmation Modal for New Lesson -->
    <BaseModal
      v-model="showResetModal"
      title="🔄 Yangi darsga o'tish"
    >
      <div class="py-4 text-center space-y-3">
        <div class="text-4xl">⚠️</div>
        <p class="text-sm text-slate-200 leading-relaxed">
          Haqiqatan ham yangi darsga o'tmoqchimisiz?
        </p>
        <p class="text-xs text-slate-400">
          Barcha joriy o'quvchilar ballari va hisoblagichlar nollashtirilib, boshlang'ich menyuga qaytiladi.
        </p>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showResetModal = false"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          @click="doResetNewLesson"
          class="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-600/30 hover:bg-red-500 active:scale-95 transition"
        >
          Ha, Yangi dars 🚀
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTeacherStore, Student } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import BaseModal from "../common/BaseModal.vue";

const emit = defineEmits<{
  (e: "backToGame"): void;
  (e: "newLesson"): void;
}>();

const teacherStore = useTeacherStore();
const sendingTg = ref(false);
const tgSent = ref(false);
const showResetModal = ref(false);

const sortedPlayers = computed(() => {
  const list = [...teacherStore.getActivePlayers()];
  return list.sort((a, b) => {
    if (a.attStatus && !b.attStatus) return 1;
    if (!a.attStatus && b.attStatus) return -1;
    return teacherStore.calcPercent(b) - teacherStore.calcPercent(a);
  });
});

function getRowClass(s: Student) {
  if (s.attStatus === "Sababsiz") return "bg-red-500/10 border-red-500/30";
  if (s.attStatus === "Sababli") return "bg-amber-500/10 border-amber-500/30";
  const p = teacherStore.calcPercent(s);
  if (p >= 80) return "bg-emerald-500/10 border-emerald-500/30";
  if (p < 50) return "bg-red-500/10 border-red-500/30";
  return "bg-slate-900/60 border-white/10";
}

function getPercentColor(s: Student) {
  const p = teacherStore.calcPercent(s);
  if (p >= 80) return "text-emerald-400";
  if (p < 50) return "text-red-400";
  return "text-amber-400";
}

async function sendTelegram() {
  const players = teacherStore.getActivePlayers();
  const present: Student[] = [];
  const absent: string[] = [];
  const excused: string[] = [];

  players.forEach((s) => {
    if (s.attStatus === "Sababsiz") absent.push(s.name);
    else if (s.attStatus === "Sababli") excused.push(s.name);
    else present.push(s);
  });

  let msg = `📊 <b>NATIJALAR (${teacherStore.currentMode.value})</b>\n\n`;
  present.forEach((s) => {
    const p = teacherStore.calcPercent(s);
    const st = s.strikes > 0 ? `⭐` : "";
    const pn = s.penalties > 0 ? `⚠️` : "";
    msg += `👤 ${s.name} ${st}${pn}: ${p}% (${s.correct}/${s.total})\n`;
  });

  if (absent.length > 0 || excused.length > 0) {
    msg += `\n📅 <b>DAVOMAT (Kelmadi):</b>\n`;
    if (absent.length > 0) msg += `❌ Sababsiz: ${absent.join(", ")}\n`;
    if (excused.length > 0) msg += `🟡 Sababli: ${excused.join(", ")}\n`;
  }

  sendingTg.value = true;
  try {
    await callApi("save", {
      text: msg,
      teacher: teacherStore.teacherName.value,
      mode: teacherStore.currentMode.value,
      students: players,
    });
    tgSent.value = true;
  } catch (e) {
    alert("Telegramga yuborishda xatolik yuz berdi!");
  } finally {
    sendingTg.value = false;
  }
}

function doResetNewLesson() {
  teacherStore.resetSession();
  showResetModal.value = false;
  emit("newLesson");
}
</script>
