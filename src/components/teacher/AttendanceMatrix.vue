<template>
  <div class="space-y-4">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>📅</span> Sinf Davomati
        </h2>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Group Filter -->
      <div>
        <select
          v-model="selectedGroup"
          class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-xs font-bold text-white outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">Barcha guruhlar</option>
          <option v-for="g in uniqueGroups" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <!-- Table Container -->
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        Davomat yuklanmoqda... ⏳
      </div>
      <div v-else-if="filteredLogs.length === 0" class="py-12 text-center text-xs text-slate-500">
        Hozircha davomat ma'lumotlari mavjud emas
      </div>
      <div v-else class="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-2">
        <table class="w-full text-center text-xs text-slate-200 border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
              <th class="sticky left-0 bg-slate-950 px-3 py-2 text-left z-10">F.I.O</th>
              <th v-for="d in uniqueDates" :key="d" class="px-2 py-2 whitespace-nowrap">{{ d }}</th>
              <th class="px-2 py-2 text-red-400 font-bold">Q</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(namesObj, grp) in groupedMatrix" :key="grp">
              <!-- Group separator -->
              <tr class="bg-white/5 font-black text-amber-400 text-left">
                <td :colspan="uniqueDates.length + 2" class="px-3 py-2 text-xs">
                  📘 {{ grp }}
                </td>
              </tr>
              <!-- Students -->
              <tr
                v-for="(datesMap, name) in namesObj"
                :key="name"
                class="border-b border-white/5 hover:bg-white/5 transition"
              >
                <td class="sticky left-0 bg-slate-950 px-3 py-2 text-left font-bold text-white z-10 whitespace-nowrap">
                  {{ name }}
                </td>
                <td v-for="d in uniqueDates" :key="d" class="px-2 py-2">
                  <span v-if="datesMap[d] === 'Keldi'">✅</span>
                  <span v-else-if="datesMap[d] === 'Sababsiz'">❌</span>
                  <span v-else-if="datesMap[d] === 'Sababli'">🟡</span>
                  <span v-else class="text-slate-600">-</span>
                </td>
                <td class="px-2 py-2 font-black text-red-400">
                  {{ datesMap._totalQ || 0 }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Clear Attendance button -->
      <button
        type="button"
        @click="clearAttendance"
        class="w-full rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-xs font-extrabold text-red-400 hover:bg-red-500/20 active:scale-95 transition"
      >
        Davomatni tozalash (Nollashtirish) 🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { callApi } from "../../services/api";

defineEmits<{
  (e: "back"): void;
}>();

interface AttendanceLog {
  date: string;
  name: string;
  status: "Keldi" | "Sababsiz" | "Sababli";
  group?: string;
}

const loading = ref(false);
const logs = ref<AttendanceLog[]>([]);
const selectedGroup = ref("all");

onMounted(() => {
  fetchAttendance();
});

async function fetchAttendance() {
  loading.value = true;
  try {
    const res = await callApi("get_attendance");
    if (res.status === "success" && res.attendance) {
      logs.value = res.attendance;
    }
  } catch (e) {
    console.error("fetchAttendance error:", e);
  } finally {
    loading.value = false;
  }
}

const uniqueGroups = computed(() => {
  return [...new Set(logs.value.map((l) => l.group || "Boshqa"))].sort();
});

const filteredLogs = computed(() => {
  if (selectedGroup.value === "all") return logs.value;
  return logs.value.filter((l) => (l.group || "Boshqa") === selectedGroup.value);
});

const uniqueDates = computed(() => {
  return [...new Set(filteredLogs.value.map((l) => l.date))].sort();
});

const groupedMatrix = computed(() => {
  const grouped: Record<string, Record<string, Record<string, any>>> = {};
  filteredLogs.value.forEach((l) => {
    const g = l.group || "Boshqa";
    if (!grouped[g]) grouped[g] = {};
    if (!grouped[g][l.name]) grouped[g][l.name] = { _totalQ: 0 };
    grouped[g][l.name][l.date] = l.status;
    if (l.status === "Sababsiz") {
      grouped[g][l.name]._totalQ++;
    }
  });
  return grouped;
});

async function clearAttendance() {
  if (
    !confirm(
      "Rostdan ham barcha davomatlarni o'chirib tashlaysizmi? Bu amalni ortga qaytarib bo'lmaydi!"
    )
  ) {
    return;
  }
  try {
    await callApi("clear_attendance");
    logs.value = [];
    alert("Davomat tozalandi!");
  } catch (e) {
    alert("Tozalashda xatolik!");
  }
}
</script>
