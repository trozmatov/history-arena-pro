<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="⚔️ Duelga Chorlash"
    custom-class="max-w-xl w-full"
  >
    <div class="py-2 space-y-4">
      <!-- Incentive Banner -->
      <div class="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3.5 flex items-center gap-3">
        <div class="text-3xl">⚔️</div>
        <div class="space-y-0.5">
          <div class="text-xs font-bold text-purple-200">
            Raqibingizni tanlang va duel turini belgilang!
          </div>
          <p class="text-[11px] text-slate-400">
            G'olib bo'lgan o'quvchi <b class="text-amber-400">+15 Tanga (🪙)</b> yutib oladi va ligadagi o'rnini mustahkamlaydi!
          </p>
        </div>
      </div>

      <!-- 1. Raqibni Tanlash Qismi -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>👤</span> <span>Raqibni tanlang:</span>
          </label>
          <span v-if="selectedOpponent" class="text-xs text-indigo-300 font-bold">
            Tanlandi: {{ selectedOpponent.name }} ✓
          </span>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 O'quvchi ismini qidirish..."
            class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- Group Filter Tabs -->
        <div class="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            @click="selectedGroupTab = 'all'"
            class="rounded-xl px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition"
            :class="
              selectedGroupTab === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            "
          >
            Barcha Guruhlar ({{ activeEligibleStudents.length }})
          </button>
          <button
            v-for="group in availableGroups"
            :key="group"
            type="button"
            @click="selectedGroupTab = group"
            class="rounded-xl px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition"
            :class="
              selectedGroupTab === group
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            "
          >
            {{ group }}
          </button>
        </div>

        <!-- Students Selection Grid -->
        <div class="max-h-48 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          <div
            v-if="filteredStudents.length === 0"
            class="py-6 text-center text-xs text-slate-500 rounded-2xl border border-white/5 bg-black/20"
          >
            Mos keluvchi faol o'quvchilar topilmadi
          </div>

          <div
            v-for="st in filteredStudents"
            :key="st.id || st.name"
            @click="selectedOpponent = st"
            class="cursor-pointer rounded-2xl border p-2.5 transition flex items-center justify-between gap-3 select-none"
            :class="
              selectedOpponent?.name === st.name
                ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-600/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            "
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-md"
                :class="
                  selectedOpponent?.name === st.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                "
              >
                {{ st.name.charAt(0).toUpperCase() }}
              </div>
              <div class="truncate">
                <div class="text-xs font-bold text-white truncate">{{ st.name }}</div>
                <div class="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span class="rounded bg-white/10 px-1 py-0.2">{{ st.group || 'Guruhsiz' }}</span>
                  <span>•</span>
                  <span>{{ st.avgAccuracy || 0 }}% aniqlik</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-bold text-amber-400">🪙 {{ st.coins || 0 }}</span>
              <div
                class="flex h-6 w-6 items-center justify-center rounded-full border text-xs"
                :class="
                  selectedOpponent?.name === st.name
                    ? 'border-purple-400 bg-purple-600 text-white'
                    : 'border-white/20 bg-transparent text-transparent'
                "
              >
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Duel Turi Tanlash Qismi -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-white">Duel turi va qoidasi:</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- Live Board Duel -->
          <div
            @click="duelType = 'live'"
            class="cursor-pointer rounded-2xl border p-3 transition space-y-1.5"
            :class="
              duelType === 'live'
                ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-600/25 ring-1 ring-purple-500'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            "
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-purple-300 flex items-center gap-1.5">
                <span>🔥</span> <span>Jonli Doskada</span>
              </span>
              <span v-if="duelType === 'live'" class="text-[10px] font-bold text-purple-400">✓ Tanlangan</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Dars paytida doskada / katta ekranda ustoz nazoratida 1 ga 1 navbatma-navbat savollarga javob berish.
            </p>
          </div>

          <!-- Lesson Score Duel -->
          <div
            @click="duelType = 'standard'"
            class="cursor-pointer rounded-2xl border p-3 transition space-y-1.5"
            :class="
              duelType === 'standard'
                ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-600/25 ring-1 ring-blue-500'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            "
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-blue-300 flex items-center gap-1.5">
                <span>📊</span> <span>Dars Natijasi</span>
              </span>
              <span v-if="duelType === 'standard'" class="text-[10px] font-bold text-blue-400">✓ Tanlangan</span>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
              Bugungi dars yoki navbatdagi test natijasida kim yuqori foiz to'plashiga qarab g'olibni avtomatik aniqlash.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition"
      >
        Bekor qilish
      </button>
      <button
        type="button"
        @click="sendDuel"
        :disabled="!selectedOpponent || sending"
        class="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
      >
        <span>{{ sending ? "Yuborilmoqda... ⏳" : "Taklif Yuborish ⚔️" }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { db, ref as fbRef, push } from "../../services/firebase";
import { useStudentStore } from "../../composables/useStudentStore";
import { soundManager } from "../../composables/useAudio";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const studentStore = useStudentStore();
const selectedOpponent = ref<any | null>(null);
const searchQuery = ref("");
const selectedGroupTab = ref<string>("all");
const duelType = ref<"live" | "standard">("live");
const sending = ref(false);

const allMasterStudents = ref<any[]>([]);

onMounted(() => {
  loadEligibleStudents();
});

function loadEligibleStudents() {
  try {
    const saved = localStorage.getItem("ha_all_students");
    if (saved) {
      allMasterStudents.value = JSON.parse(saved);
    }
  } catch (e) {
    allMasterStudents.value = [];
  }
}

// 1. Only active students (exclude frozen), exclude current student
const activeEligibleStudents = computed(() => {
  const currentName = studentStore.studentName.value.toLowerCase().trim();
  return allMasterStudents.value.filter((s) => {
    const isSelf = s.name.toLowerCase().trim() === currentName;
    const isFrozen = s.status === "frozen";
    return !isSelf && !isFrozen;
  });
});

// 2. Available groups list
const availableGroups = computed(() => {
  const set = new Set<string>();
  activeEligibleStudents.value.forEach((s) => {
    if (s.group && s.group.trim()) {
      set.add(s.group.trim());
    }
  });
  return Array.from(set);
});

// 3. Filtered students by Group Tab and Search Query
const filteredStudents = computed(() => {
  return activeEligibleStudents.value.filter((s) => {
    const matchesGroup =
      selectedGroupTab.value === "all" || s.group === selectedGroupTab.value;
    const matchesSearch =
      !searchQuery.value.trim() ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim());
    return matchesGroup && matchesSearch;
  });
});

async function sendDuel() {
  if (!selectedOpponent.value) return;

  sending.value = true;
  try {
    const timeStr = new Date().toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Write to Firebase duels collection with status "pending" so the opponent receives a live alert
    await push(fbRef(db, "duels"), {
      challenger: studentStore.studentName.value,
      target: selectedOpponent.value.name,
      type: duelType.value,
      status: "pending",
      time: timeStr,
      timestamp: Date.now(),
    });

    // Also notify teacher
    await push(fbRef(db, "notifications/teacher"), {
      title: "⚔️ Yangi Duel Taklifi!",
      message: `${studentStore.studentName.value} ➡️ ${selectedOpponent.value.name} (${duelType.value === "live" ? "🔥 Jonli Doskada" : "📊 Dars Natijasi"})`,
      time: timeStr,
    });

    soundManager.playSuccess();
    alert(`⚔️ "${selectedOpponent.value.name}"ga duel taklifi yuborildi! Raqib o'z profilida qabul qilishi kutilmoqda.`);
    selectedOpponent.value = null;
    searchQuery.value = "";
    emit("update:modelValue", false);
  } catch (e: any) {
    alert("Duel taklifini yuborishda xatolik yuz berdi: " + (e.message || e));
  } finally {
    sending.value = false;
  }
}
</script>
