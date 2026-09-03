<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="!targetStudent ? '📚 Umumiy vazifa belgilash' : `✏️ ${targetStudent} uchun vazifa belgilash`"
  >
    <div class="space-y-4 py-2">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Darslikni tanlang:
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="book in BOOK_LIST"
            :key="book"
            type="button"
            @click="selectedBook = (selectedBook === book ? '' : book)"
            class="rounded-xl px-3 py-2 text-xs font-bold transition-all border"
            :class="
              selectedBook === book
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-105'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            "
          >
            {{ book }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Mavzular yoki sahifalar (masalan: 1-10):
        </label>
        <input
          v-model="topicInput"
          type="text"
          placeholder="Mavzular (1-10)..."
          class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition"
      >
        Bekor qilish
      </button>
      <button
        type="button"
        @click="save"
        class="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition"
      >
        Saqlash
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { BOOK_LIST, useTeacherStore } from "../../composables/useTeacherStore";

const props = defineProps<{
  modelValue: boolean;
  targetStudent?: string; // empty for global
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
}>();

const teacherStore = useTeacherStore();
const selectedBook = ref<string>("");
const topicInput = ref<string>("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (!props.targetStudent) {
        selectedBook.value = teacherStore.globalBook.value;
        topicInput.value = teacherStore.globalTopic.value;
      } else {
        const s = teacherStore.students.value.find(
          (item) => item.name.toLowerCase().trim() === props.targetStudent?.toLowerCase().trim()
        );
        selectedBook.value = s?.book || "";
        topicInput.value = s?.topic || "";
      }
    }
  }
);

function save() {
  if (!props.targetStudent) {
    teacherStore.setGlobalTask(selectedBook.value, topicInput.value);
  } else {
    teacherStore.setIndividualTask(props.targetStudent, selectedBook.value, topicInput.value);
  }
  emit("update:modelValue", false);
}
</script>
