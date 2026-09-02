<template>
  <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
    <div class="text-xs font-black uppercase tracking-wider text-slate-400">
      🏅 Yutuq Nishonlari (Badges)
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      <button
        v-for="badge in allBadges"
        :key="badge.id"
        type="button"
        @click="selectBadge(badge)"
        class="flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-300 active:scale-95 cursor-pointer"
        :class="
          hasBadge(badge.id)
            ? 'bg-gradient-to-b from-amber-500/20 to-yellow-500/10 border-amber-500/40 shadow-lg shadow-amber-500/15 scale-100'
            : 'bg-white/5 border-white/5 opacity-40 grayscale scale-95 hover:opacity-60'
        "
      >
        <span class="text-3xl mb-1 drop-shadow">{{ badge.icon }}</span>
        <span class="text-xs font-extrabold text-white">{{ badge.name }}</span>
        <span class="text-[9px] text-slate-400 mt-0.5">{{ badge.desc }}</span>
        <span
          v-if="hasBadge(badge.id)"
          class="mt-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30"
        >
          Olingan ✅
        </span>
        <span v-else class="mt-1.5 text-[9px] text-slate-500 font-bold">
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
        <h4 class="text-lg font-black text-white">{{ selectedItem.name }}</h4>
        <p class="text-xs text-slate-300">{{ selectedItem.desc }}</p>
        <div class="pt-2">
          <span
            v-if="hasBadge(selectedItem.id)"
            class="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-4 py-1 text-xs font-black text-emerald-400"
          >
            Tabriklaymiz! Siz bu nishonni qo'lga kiritgansiz 🎉
          </span>
          <span
            v-else
            class="inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-4 py-1 text-xs font-bold text-amber-300"
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
