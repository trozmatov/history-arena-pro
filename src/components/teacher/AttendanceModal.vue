<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="⚠️ Davomat tekshiruvi"
  >
    <div class="py-2 space-y-3">
      <p class="text-xs text-amber-400">
        Quyidagi o'quvchilarga hali savol berilmadi. Iltimos, ularning darsdagi holatini belgilang:
      </p>

      <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        <div
          v-for="s in zeroScorers"
          :key="s.name"
          class="rounded-3xl border border-white/10 bg-black/50 p-3.5 space-y-2.5 shadow-lg"
        >
          <!-- Student name and current badge -->
          <div class="flex items-center justify-between">
            <span class="font-black text-sm text-white tracking-wide">{{ s.name }}</span>
            <span
              class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
              :class="
                statuses[s.name] === 'Keldi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : statuses[s.name] === 'Sababli'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              "
            >
              {{ statuses[s.name] }}
            </span>
          </div>

          <!-- 3 Segmented Custom Chip Buttons -->
          <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-white/5">
            <button
              type="button"
              @click="statuses[s.name] = 'Sababsiz'"
              class="flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all"
              :class="
                statuses[s.name] === 'Sababsiz'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/40 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>❌</span> <span class="truncate">Sababsiz</span>
            </button>
            <button
              type="button"
              @click="statuses[s.name] = 'Keldi'"
              class="flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all"
              :class="
                statuses[s.name] === 'Keldi'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>✅</span> <span class="truncate">Keldi</span>
            </button>
            <button
              type="button"
              @click="statuses[s.name] = 'Sababli'"
              class="flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all"
              :class="
                statuses[s.name] === 'Sababli'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/40 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>🟡</span> <span class="truncate">Sababli</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
      >
        Bekor qilish
      </button>
      <button
        type="button"
        @click="confirm"
        class="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition"
      >
        Tasdiqlash va Natijalar 🚀
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { Student } from "../../composables/useTeacherStore";

const props = defineProps<{
  modelValue: boolean;
  zeroScorers: Student[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "confirmed", statuses: Record<string, string>): void;
}>();

const statuses = ref<Record<string, string>>({});

watch(
  () => props.zeroScorers,
  (list) => {
    const s: Record<string, string> = {};
    list.forEach((item) => {
      s[item.name] = "Sababsiz";
    });
    statuses.value = s;
  },
  { immediate: true }
);

function confirm() {
  emit("confirmed", statuses.value);
  emit("update:modelValue", false);
}
</script>
