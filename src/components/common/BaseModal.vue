<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        @click.self="closeOnBackdrop && $emit('update:modelValue', false)"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 transform scale-100"
          :class="customClass"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="mb-4 flex items-center justify-between">
            <slot name="header">
              <h3 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {{ title }}
              </h3>
            </slot>
            <button
              v-if="showClose"
              @click="$emit('update:modelValue', false)"
              class="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="custom-scrollbar max-h-[75vh] overflow-y-auto pr-1">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
  showClose?: boolean;
  closeOnBackdrop?: boolean;
  customClass?: string;
}>();

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
