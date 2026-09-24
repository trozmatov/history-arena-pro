<template>
  <Transition name="fade">
    <div
      v-if="modelValue && test"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-5 border shadow-2xl relative transition-all duration-300 overflow-hidden"
        :class="isDark ? 'border-white/20 bg-[#0e1629] text-white' : 'border-slate-200 bg-white text-slate-900'"
      >
        <!-- Ambient Specular Glow -->
        <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-36 bg-gradient-to-b from-indigo-500/25 via-blue-500/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

        <!-- Header -->
        <div
          class="flex items-center justify-between border-b pb-3 relative z-10"
          :class="isDark ? 'border-white/10' : 'border-slate-200'"
        >
          <div class="flex items-center gap-2.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl shadow-md">
              🔗
            </span>
            <div>
              <h3 class="text-base font-black tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                Test Havolasini Ulashish
              </h3>
              <p class="text-[11px] text-slate-400">
                O'quvchilar ushbu havola orqali kirib test yechishlari mumkin
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="close"
            class="text-slate-400 hover:text-slate-900 dark:hover:text-white text-xl cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <!-- Test Brief Overview Card -->
        <div
          class="rounded-2xl p-4 border space-y-2 relative z-10"
          :class="isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'"
        >
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-black text-sm line-clamp-1" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ test.title }}
            </h4>
            <span
              class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase shrink-0"
              :class="
                test.published
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              "
            >
              {{ test.published ? '● Faol (Published)' : '○ Qoralama' }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>❓ {{ test.questions.length }} ta savol</span>
            <span>•</span>
            <span>⏱️ {{ test.timeLimitMinutes > 0 ? `${test.timeLimitMinutes} daqiqa` : 'Cheklovsiz' }}</span>
            <span>•</span>
            <span>📁 {{ getFolderName(test.folderId) }}</span>
          </div>
        </div>

        <!-- Warning if Test is NOT Published yet -->
        <div
          v-if="!test.published"
          class="rounded-2xl p-3.5 border border-amber-500/40 bg-amber-500/10 space-y-2 text-xs relative z-10"
        >
          <div class="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-300">
            <span>⚠️</span>
            <span>Diqqat: Test hozirda 'Qoralama' (Yopiq) holatida!</span>
          </div>
          <p class="text-[11px] text-amber-700 dark:text-amber-200/80">
            O'quvchilar havola orqali kirganlarida test ochilishi uchun testni faollashtirishingiz lozim.
          </p>
          <button
            type="button"
            @click="handlePublishNow"
            class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>🟢</span>
            <span>Hozir Faol qilish (Publish)</span>
          </button>
        </div>

        <!-- Share Link Box -->
        <div class="space-y-2 relative z-10">
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400">
            Unikal Test Havolasi:
          </label>
          <div
            class="flex items-center gap-2 rounded-2xl border p-1.5 pl-3 transition-colors"
            :class="isDark ? 'border-white/15 bg-black/40' : 'border-slate-300 bg-slate-50'"
          >
            <input
              type="text"
              readonly
              :value="shareUrl"
              class="w-full bg-transparent text-xs font-mono outline-none select-all"
              :class="isDark ? 'text-indigo-300' : 'text-indigo-700'"
              @click="($event.target as HTMLInputElement).select()"
            />
            <button
              type="button"
              @click="copyLink"
              class="shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shadow-md flex items-center gap-1.5"
              :class="
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
              "
            >
              <span>{{ copied ? '✅' : '📋' }}</span>
              <span>{{ copied ? 'Nusxalandi!' : 'Nusxalash' }}</span>
            </button>
          </div>
        </div>

        <!-- Direct Share Actions -->
        <div class="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          <button
            type="button"
            @click="shareViaTelegram"
            class="py-2.5 px-3 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/40 text-[#229ED9] text-xs font-black transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✈️</span>
            <span>Telegram'da Ulashish</span>
          </button>

          <button
            type="button"
            @click="copyLink"
            class="py-2.5 px-3 rounded-2xl border text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            :class="isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'"
          >
            <span>📋</span>
            <span>Havolani Olish</span>
          </button>
        </div>

        <!-- Student Instructions Notice -->
        <div
          class="rounded-2xl p-3 border text-[11px] space-y-1 relative z-10"
          :class="isDark ? 'border-white/5 bg-black/20 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'"
        >
          <div class="font-bold text-slate-300 dark:text-slate-300 flex items-center gap-1">
            <span>💡</span>
            <span>O'quvchilar uchun eslatma:</span>
          </div>
          <p>
            O'quvchilar ushbu havolani ochganlarida, testni boshlashdan avval o'zlarining <b>6 xonali shaxsiy PIN-kodlari</b> orqali shaxsini tasdiqlashlari so'raladi.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TestExam } from "../../types/test";
import { useTheme } from "../../composables/useTheme";
import { useTestsStore } from "../../composables/useTestsStore";

const props = defineProps<{
  modelValue: boolean;
  test: TestExam | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "publishChanged"): void;
}>();

const { isDark } = useTheme();
const testsStore = useTestsStore();
const { folders } = testsStore;

const copied = ref(false);

const shareUrl = computed(() => {
  if (!props.test) return "";
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const path = window.location.pathname.replace(/\/teacher.*$/, "").replace(/\/results.*$/, "");
  return `${origin}${path}?exam=${encodeURIComponent(props.test.id)}`;
});

function getFolderName(folderId?: string): string {
  const f = folders.value.find((item) => item.id === folderId);
  return f ? f.name : "Umumiy (Aralash)";
}

function close() {
  emit("update:modelValue", false);
}

function handlePublishNow() {
  if (!props.test) return;
  testsStore.togglePublish(props.test.id);
  emit("publishChanged");
}

async function copyLink() {
  if (!shareUrl.value) return;
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch (e) {
    // Fallback prompt
    window.prompt("Havolani nusxalang:", shareUrl.value);
  }
}

function shareViaTelegram() {
  if (!props.test || !shareUrl.value) return;
  const text = `📝 ${props.test.title}\nImtihon testini yechish uchun havola:`;
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
</script>
