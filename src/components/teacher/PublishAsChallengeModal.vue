<template>
  <Transition name="fade">
    <div
      v-if="modelValue && test"
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 select-none font-sans overflow-hidden animate-fade"
      @click.self="close"
    >
      <!-- Ambient Specular Glow -->
      <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-56 bg-gradient-to-b from-amber-500/25 via-red-600/15 to-transparent blur-3xl rounded-full pointer-events-none"></div>

      <!-- Main Modal Card -->
      <div
        class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-5 sm:p-7 border border-amber-500/30 bg-[#0e1629]/95 text-white shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden space-y-4"
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-500 text-2xl shadow-lg shadow-amber-500/25">
              ⚔️
            </div>
            <div class="min-w-0">
              <h3 class="text-base sm:text-lg font-black text-white truncate">
                Chellenjga E'lon Qilish
              </h3>
              <p class="text-xs text-slate-400 mt-0.5 truncate">
                Ushbu testni barcha o'quvchilar uchun ochiq musobaqa qilib e'lon qiling
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="close"
            class="h-9 w-9 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <!-- Form Body -->
        <div class="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar text-xs">
          <!-- Test Title & Questions Badge -->
          <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div class="text-[10px] uppercase font-bold text-amber-400">Asos bo'ladigan test:</div>
            <div class="text-sm font-black text-white truncate">{{ test.title }}</div>
            <div class="text-[11px] text-slate-400">
              Savollar soni: <b class="text-indigo-300">{{ test.questions.length }} ta</b> (Avtomatik 4 variantli musobaqa formatiga o'tkaziladi)
            </div>
          </div>

          <!-- Challenge Title -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">Chellenj Sarlavhasi:</label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Masalan: Temuriylar davri bo'yicha Chellenj"
              class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-amber-400"
            />
          </div>

          <!-- Target Group & Topic -->
          <div class="grid grid-cols-2 gap-2.5">
            <div class="space-y-1">
              <label class="block font-bold text-slate-300">Mavzu / Yo'nalish:</label>
              <input
                v-model="formData.topic"
                type="text"
                placeholder="Tarix"
                class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-amber-400"
              />
            </div>
            <div class="space-y-1">
              <label class="block font-bold text-slate-300">O'quvchilar Guruhi:</label>
              <select
                v-model="formData.group"
                class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-2 text-white outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Umumiy">Barcha o'quvchilar (Umumiy)</option>
                <option v-for="folder in folders" :key="folder.id" :value="folder.name">
                  {{ folder.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Deadline -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">Amal qilish muddati (Deadline):</label>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="d in deadlineOptions"
                :key="d.hours"
                type="button"
                @click="selectedHours = d.hours"
                class="py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center"
                :class="
                  selectedHours === d.hours
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black'
                    : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                "
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- Rewards (Sovrinlar) -->
          <div class="space-y-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div class="font-black text-amber-300 flex items-center gap-1.5">
              <span>🎁</span> <span>G'oliblar uchun rag'bat va mukofotlar:</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <label class="block text-[11px] text-slate-300">💰 Tangalar (Coins):</label>
                <input
                  v-model.number="formData.coins"
                  type="number"
                  min="0"
                  class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-1.5 text-white outline-none"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-[11px] text-slate-300">💵 Pul mukofoti (ixtiyoriy):</label>
                <input
                  v-model="formData.cashPrize"
                  type="text"
                  placeholder="50 000 so'm"
                  class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-1.5 text-white outline-none"
                />
              </div>
            </div>

            <div class="space-y-1 pt-1">
              <label class="block text-[11px] text-slate-300">🎖️ Maxsus imtiyoz / huquq:</label>
              <input
                v-model="formData.specialPerk"
                type="text"
                placeholder="1 kun darsga kelmaslik (qonuniy dam olish huquqi)"
                class="w-full rounded-xl bg-black/40 border border-white/15 px-3 py-1.5 text-white outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            @click="close"
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            @click="submitChallenge"
            :disabled="isSubmitting"
            class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{{ isSubmitting ? 'E\'lon qilinmoqda...' : '🚀 Chellenjni E\'lon Qilish' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { TestExam } from "../../types/test";
import { useTestsStore } from "../../composables/useTestsStore";
import { createChallengeInFirebase, ChallengeQuestion } from "../../services/challengeService";
import { soundManager } from "../../composables/useAudio";

const props = defineProps<{
  modelValue: boolean;
  test: TestExam | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "published"): void;
}>();

const testsStore = useTestsStore();
const { folders } = testsStore;

const isSubmitting = ref(false);
const selectedHours = ref(48);

const deadlineOptions = [
  { hours: 24, label: "24 soat" },
  { hours: 48, label: "48 soat" },
  { hours: 72, label: "3 kun" },
  { hours: 168, label: "1 hafta" },
];

const formData = ref({
  title: "",
  topic: "Tarix",
  group: "Umumiy",
  coins: 50,
  cashPrize: "50 000 so'm",
  specialPerk: "1 kun darsga kelmaslik (qonuniy dam olish huquqi)",
});

watch(
  () => props.test,
  (t) => {
    if (t) {
      formData.value.title = `${t.title} bo'yicha Chellenj`;
      formData.value.topic = t.targetGrade || "Tarix";
      formData.value.group = t.targetGrade || "Umumiy";
    }
  },
  { immediate: true }
);

function close() {
  emit("update:modelValue", false);
}

async function submitChallenge() {
  if (!props.test || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    // Convert TestExam questions to ChallengeQuestion[]
    const challengeQuestions: ChallengeQuestion[] = props.test.questions.map((q, idx) => {
      const opts = (q.options && q.options.length > 0)
        ? q.options.map((o) => o.text)
        : ["A", "B", "C", "D"];

      // Ensure at least 4 options
      while (opts.length < 4) {
        opts.push(`Variant ${opts.length + 1}`);
      }

      const correctIdx = q.options?.findIndex((o) => o.isCorrect) ?? 0;

      return {
        id: q.id || `cq_${idx}`,
        question: q.text,
        options: opts.slice(0, 4),
        correctAnswer: correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0,
        explanation: q.explanation || "",
      };
    });

    const deadline = Date.now() + selectedHours.value * 3600 * 1000;

    await createChallengeInFirebase({
      title: formData.value.title.trim() || props.test.title,
      topic: formData.value.topic.trim() || "Tarix",
      group: formData.value.group,
      deadline,
      rewards: {
        coins: formData.value.coins,
        cashPrize: formData.value.cashPrize.trim() || undefined,
        specialPerk: formData.value.specialPerk.trim() || undefined,
      },
      questions: challengeQuestions,
      teacherName: "Ustoz",
    });

    soundManager.playSuccess();
    emit("published");
    close();
  } catch (e) {
    console.error("submitChallenge error:", e);
    soundManager.playError();
    alert("Chellenj e'lon qilishda xatolik yuz berdi.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>
