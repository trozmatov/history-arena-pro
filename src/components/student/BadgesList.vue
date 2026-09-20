<template>
  <div class="apple-glass-card rounded-[2rem] p-5 space-y-3 transition-all duration-300">
    <div class="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
      <span>🏅</span> <span>Yutuq Nishonlari (Badges)</span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      <button
        v-for="badge in allBadges"
        :key="badge.id"
        type="button"
        @click="selectBadge(badge)"
        class="flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-300 active:scale-95 cursor-pointer backdrop-blur-xl"
        :class="
          hasBadge(badge.id)
            ? 'bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent border-amber-500/40 shadow-lg shadow-amber-500/15 scale-100'
            : 'bg-white/40 dark:bg-white/5 border-slate-200/80 dark:border-white/5 opacity-40 grayscale scale-95 hover:opacity-70'
        "
      >
        <span class="text-3xl mb-1 drop-shadow">{{ badge.icon }}</span>
        <span class="text-xs font-extrabold text-slate-900 dark:text-white">{{ badge.name }}</span>
        <span class="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">{{ badge.desc }}</span>
        <span
          v-if="hasBadge(badge.id)"
          class="mt-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm"
        >
          Olingan ✅
        </span>
        <span v-else class="mt-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
          Qulflangan 🔒
        </span>
      </button>
    </div>

    <!-- Badge Info Modal -->
    <BaseModal
      v-model="showInfo"
      :title="selectedItem?.name ? `${selectedItem.icon} ${selectedItem.name}` : 'Nishon'"
    >
      <div v-if="selectedItem" class="py-4 text-center space-y-3">
        <div class="text-5xl">{{ selectedItem.icon }}</div>
        <h4 class="text-lg font-black text-slate-900 dark:text-white">{{ selectedItem.name }}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-300">{{ selectedItem.desc }}</p>
        <div class="pt-2">
          <span
            v-if="hasBadge(selectedItem.id)"
            class="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-4 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400"
          >
            Tabriklaymiz! Siz bu nishonni qo'lga kiritgansiz 🎉
          </span>
          <span
            v-else
            class="inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1 text-xs font-bold text-amber-700 dark:text-amber-300"
          >
            Ushbu nishonni olish uchun shartni bajaring 🎯
          </span>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { useStudentStore } from "../../composables/useStudentStore";

const studentStore = useStudentStore();
const showInfo = ref(false);
const selectedItem = ref<any>(null);

const allBadges = [
  { id: "sniper", name: "Snayper", icon: "🎯", desc: "3 marta 100% olish" },
  { id: "rich", name: "Boyvachcha", icon: "💰", desc: "20+ tanga to'plash" },
  { id: "fire", name: "Olovli", icon: "🔥", desc: "10+ strike yig'ish" },
  { id: "veteran", name: "Faxriy", icon: "🏅", desc: "30+ dars & 50%+ baho" },
  { id: "rescuer", name: "Qutqaruvchi", icon: "🛡️", desc: "Past bahodan so'ng 100%" },
];

function hasBadge(id: string) {
  return studentStore.studentBadges.value.some((b) => b.id === id);
}

function selectBadge(badge: any) {
  selectedItem.value = badge;
  showInfo.value = true;
}
</script>
