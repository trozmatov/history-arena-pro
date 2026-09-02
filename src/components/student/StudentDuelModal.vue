<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="⚔️ Duelga chorlash"
  >
    <div class="py-2 space-y-4">
      <p class="text-xs text-slate-300">
        Raqibingizni tanlang va duel turini belgilang. G'olib o'quvchi <b class="text-amber-400">+15 Tanga (🪙)</b> yutib oladi!
      </p>

      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Raqib ismi:</label>
        <input
          v-model="targetStudent"
          type="text"
          placeholder="Raqib ismi..."
          class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-400 mb-1">Duel turi:</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="duelType = 'live'"
            class="rounded-xl p-3 border text-xs font-bold transition"
            :class="
              duelType === 'live'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 border-white/10 text-slate-400'
            "
          >
            🔥 Jonli Doskada
          </button>
          <button
            type="button"
            @click="duelType = 'standard'"
            class="rounded-xl p-3 border text-xs font-bold transition"
            :class="
              duelType === 'standard'
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                : 'bg-white/5 border-white/10 text-slate-400'
            "
          >
            📊 Dars Natijasi
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
      >
        Bekor
      </button>
      <button
        type="button"
        @click="sendDuel"
        :disabled="!targetStudent.trim() || sending"
        class="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-40 transition"
      >
        {{ sending ? "Yuborilmoqda..." : "Taklif yuborish ⚔️" }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { db, ref as fbRef, push } from "../../services/firebase";
import { useStudentStore } from "../../composables/useStudentStore";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const studentStore = useStudentStore();
const targetStudent = ref("");
const duelType = ref<"live" | "standard">("live");
const sending = ref(false);

async function sendDuel() {
  if (!targetStudent.value.trim()) return;
  sending.value = true;
  try {
    const timeStr = new Date().toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });

    await push(fbRef(db, "duels"), {
      challenger: studentStore.studentName.value,
      target: targetStudent.value.trim(),
      type: duelType.value,
      status: "accepted", // Auto accepted or pending
      time: timeStr,
      timestamp: Date.now(),
    });

    // Notify teacher
    await push(fbRef(db, "notifications/teacher"), {
      title: "⚔️ Yangi Duel!",
      message: `${studentStore.studentName.value} vs ${targetStudent.value.trim()} (${duelType.value})`,
      time: timeStr,
    });

    alert("Duel taklifi muvaffaqiyatli yuborildi! ⚔️");
    targetStudent.value = "";
    emit("update:modelValue", false);
  } catch (e) {
    alert("Yuborishda xatolik yuz berdi!");
  } finally {
    sending.value = false;
  }
}
</script>
