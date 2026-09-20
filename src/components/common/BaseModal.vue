<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        @click.self="closeOnBackdrop && $emit('update:modelValue', false)"
      >
        <div
          class="relative w-full overflow-hidden rounded-[2.25rem] border border-white/70 dark:border-white/15 bg-white/90 dark:bg-[#0b1528]/85 p-5 sm:p-6 text-slate-900 dark:text-white shadow-2xl backdrop-blur-3xl transition-all duration-300 transform scale-100"
          :class="customClass ? customClass : 'max-w-lg'"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="mb-4 flex items-center justify-between">
            <slot name="header">
              <h3 class="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="showClose"
              @click="$emit('update:modelValue', false)"
              class="rounded-full h-8 w-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="custom-scrollbar max-h-[75vh] overflow-y-auto pr-1">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    showClose?: boolean;
    closeOnBackdrop?: boolean;
    customClass?: string;
  }>(),
  {
    showClose: true,
    closeOnBackdrop: true,
  }
);

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
