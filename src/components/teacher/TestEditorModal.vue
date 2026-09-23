<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditing ? '✏️ Testni Tahrirlash (Form Builder)' : '➕ Yangi Test Yaratish'"
    custom-class="max-w-4xl w-full"
  >
    <div v-if="formData" class="space-y-5 py-1 text-slate-800 dark:text-slate-100">
      <!-- Top Navigation Tabs: Asosiy Ma'lumotlar, Savollar, Anti-Cheating Sozlamalari -->
      <div class="flex rounded-2xl p-1 border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-xl gap-1 text-xs">
        <button
          type="button"
          @click="activeTab = 'general'"
          class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'general'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>📋</span>
          <span>Umumiy Ma'lumot</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'questions'"
          class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>❓</span>
          <span>Savollar ({{ formData.questions.length }})</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'anticheat'"
          class="flex-1 py-2 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          :class="
            activeTab === 'anticheat'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          "
        >
          <span>🛡️</span>
          <span>Anti-Cheating Himoyasi</span>
        </button>
      </div>

      <!-- 1. GENERAL TAB -->
      <div v-show="activeTab === 'general'" class="space-y-4">
        <div class="liquid-glass-card rounded-2xl p-4 space-y-3 border border-white/60 dark:border-white/10">
          <div>
            <label class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              Test Nomi <span class="text-rose-500">*</span>:
            </label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Masalan: 8-sinf O'zbekiston tarixi 1-chorak nazorati"
              class="w-full rounded-xl px-3.5 py-2.5 text-xs font-bold bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              Tavsifi yoki yo'riqnoma:
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Test qoidalari, talablar yoki mavzu haqida qisqacha ma'lumot..."
              class="w-full rounded-xl px-3.5 py-2 text-xs bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                Umumiy Vaqt chegarasi (daqiqa):
              </label>
              <input
                v-model.number="formData.timeLimitMinutes"
                type="number"
                min="0"
                placeholder="0 = cheksiz"
                class="w-full rounded-xl px-3.5 py-2 text-xs bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span class="text-[10px] text-slate-400">0 kiritilsa umumiy vaqt chegaralanmaydi</span>
            </div>

            <div>
              <label class="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                E'lon qilish holati (Published):
              </label>
              <div class="flex items-center gap-3 pt-1.5">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="formData.published" class="sr-only peer" />
                  <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span class="ml-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {{ formData.published ? "Talabalarga ko'rinadi (Faol)" : "Qoralama (Yopiq)" }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. QUESTIONS TAB (FORM BUILDER) -->
      <div v-show="activeTab === 'questions'" class="space-y-4">
        <!-- Actions: Add Question + Overview -->
        <div class="flex items-center justify-between">
          <div class="text-xs font-black text-slate-600 dark:text-slate-400">
            Jami savollar: <span class="text-indigo-600 dark:text-indigo-400">{{ formData.questions.length }} ta</span> • Jami ball: <span class="text-emerald-600 dark:text-emerald-400">{{ totalPoints }} ball</span>
          </div>
          <button
            type="button"
            @click="addNewQuestion"
            class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>➕</span>
            <span>Yangi Savol Qo'shish</span>
          </button>
        </div>

        <!-- Questions List -->
        <div v-if="formData.questions.length === 0" class="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 space-y-2">
          <div class="text-3xl">❓</div>
          <div class="text-xs font-bold text-slate-400">Hozircha savollar yo'q</div>
          <button
            type="button"
            @click="addNewQuestion"
            class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
          >
            Birinchi savolni qo'shish
          </button>
        </div>

        <div v-else class="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="(q, qIdx) in formData.questions"
            :key="q.id"
            class="liquid-glass-card rounded-2xl p-4 border border-white/60 dark:border-white/10 space-y-3 relative group"
          >
            <!-- Question Header -->
            <div class="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                  {{ qIdx + 1 }}
                </span>
                <!-- Question Type Select -->
                <select
                  v-model="q.type"
                  class="rounded-xl px-2.5 py-1 text-xs font-bold bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 outline-none"
                >
                  <option value="mcq">🔘 Bitta to'g'ri javob (Radio)</option>
                  <option value="checkbox">☑️ Bir nechta javob (Checkbox)</option>
                  <option value="short_answer">✍️ Qisqa yozma javob</option>
                </select>
              </div>

              <!-- Points & Actions -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <span class="text-[10px] font-bold text-slate-400">Ball:</span>
                  <input
                    v-model.number="q.points"
                    type="number"
                    min="1"
                    class="w-12 rounded-lg px-2 py-1 text-xs font-black text-center bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 outline-none"
                  />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[10px] font-bold text-slate-400">Taymer (soniya):</span>
                  <input
                    v-model.number="q.timeLimitSeconds"
                    type="number"
                    min="5"
                    placeholder="30"
                    class="w-14 rounded-lg px-2 py-1 text-xs font-black text-center bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 outline-none"
                  />
                </div>
                <button
                  type="button"
                  @click="removeQuestion(qIdx)"
                  class="text-rose-500 hover:text-rose-400 p-1 transition cursor-pointer"
                  title="Savolni o'chirish"
                >
                  🗑️
                </button>
              </div>
            </div>

            <!-- Question Text -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Savol matni:
              </label>
              <textarea
                v-model="q.text"
                rows="2"
                placeholder="Savol matnini kiriting..."
                class="w-full rounded-xl px-3 py-2 text-xs font-bold bg-white/70 dark:bg-black/50 border border-slate-300 dark:border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
            </div>

            <!-- Options for MCQ and Checkbox -->
            <div v-if="q.type === 'mcq' || q.type === 'checkbox'" class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-[11px] font-black text-slate-500 dark:text-slate-400">
                <span>Variantlar (To'g'ri javobni belgilang):</span>
                <button
                  type="button"
                  @click="addOption(q)"
                  class="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Variant qo'shish
                </button>
              </div>

              <div class="space-y-1.5">
                <div
                  v-for="(opt, optIdx) in q.options"
                  :key="opt.id"
                  class="flex items-center gap-2"
                >
                  <!-- Radio or Checkbox for marking correct answer -->
                  <input
                    v-if="q.type === 'mcq'"
                    type="radio"
                    :name="'q_correct_' + q.id"
                    :checked="opt.isCorrect"
                    @change="setMcqCorrect(q, opt.id)"
                    class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    title="To'g'ri javob qilib belgilash"
                  />
                  <input
                    v-else
                    type="checkbox"
                    v-model="opt.isCorrect"
                    class="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                    title="To'g'ri javob qilib belgilash"
                  />

                  <input
                    v-model="opt.text"
                    type="text"
                    :placeholder="`Variant ${optIdx + 1}`"
                    class="flex-1 rounded-xl px-3 py-1.5 text-xs bg-white/70 dark:bg-black/50 border outline-none transition"
                    :class="
                      opt.isCorrect
                        ? 'border-emerald-500/60 bg-emerald-500/10 font-black text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-300 dark:border-white/10'
                    "
                  />

                  <button
                    v-if="q.options.length > 2"
                    type="button"
                    @click="removeOption(q, optIdx)"
                    class="text-slate-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                    title="Variantni o'chirish"
                  >
                    ✖
                  </button>
                </div>
              </div>
            </div>

            <!-- Short Answer Correct Text -->
            <div v-else-if="q.type === 'short_answer'" class="space-y-1 pt-1">
              <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Kutilgan to'g'ri javob matni (kichik va katta harflar farqlanmaydi):
              </label>
              <input
                v-model="q.correctAnswerText"
                type="text"
                placeholder="To'g'ri javobni kiriting..."
                class="w-full rounded-xl px-3 py-2 text-xs bg-emerald-500/10 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. ANTI-CHEATING TAB -->
      <div v-show="activeTab === 'anticheat'" class="space-y-4">
        <div class="liquid-glass-card rounded-2xl p-4 border border-rose-500/30 bg-rose-500/5 space-y-4">
          <div class="flex items-center gap-2 text-rose-500 dark:text-rose-400 font-black text-xs uppercase tracking-wider">
            <span>🛡️</span>
            <span>Ultra-Qat'iy Ko'chirishga Qarshi Himoya Tizimi</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <!-- 1. Fullscreen Enforcement -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/40 dark:bg-black/30 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.fullscreenRequired" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-slate-900 dark:text-white">Majburiy To'liq Ekran (Fullscreen)</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Test faqat to'liq ekranda ishlaydi, chiqishga ruxsat yo'q.</div>
              </div>
            </label>

            <!-- 2. Zero-Tolerance Tab Switch -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.zeroTolerance" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-rose-600 dark:text-rose-300">0-Toleransiya (1 marta ham tab o'zgarmasin)</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Boshqa tab yoki ilovaga 1 marta o'tilsa darhol test bekor qilinadi.</div>
              </div>
            </label>

            <!-- 3. Block Screenshot & Obscure -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/40 dark:bg-black/30 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.blockScreenshot" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-slate-900 dark:text-white">Skrinshotni taqiqlash & Blur</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">PrintScreen, Snipping tool, Mac skrinshotlari bloklanadi va ekran qoraytiriladi.</div>
              </div>
            </label>

            <!-- 4. Clipboard & Context Menu Block -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/40 dark:bg-black/30 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.blockClipboard" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-slate-900 dark:text-white">Nusxa ko'chirish & O'ng tugma taqiqi</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Ctrl+C, Ctrl+V, matn tanlash va sichqoncha o'ng tugmasi bloklanadi.</div>
              </div>
            </label>

            <!-- 5. Random Shuffle -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/40 dark:bg-black/30 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.shuffleQuestions" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-slate-900 dark:text-white">Savollar va Variantlarni Aralashtirish</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Har bir o'quvchida savollar va variantlar tartibi random aralashtiriladi.</div>
              </div>
            </label>

            <!-- 6. Watermark -->
            <label class="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/40 dark:bg-black/30 cursor-pointer">
              <input type="checkbox" v-model="formData.antiCheat.showWatermark" class="mt-0.5 rounded text-rose-600 focus:ring-rose-500" />
              <div>
                <div class="font-extrabold text-slate-900 dark:text-white">Dinamik Suv Belgisi (Watermark)</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400">Ekranda talabaning ismi va vaqti suv belgisi bo'lib aylanadi.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <div class="flex items-center justify-between border-t border-white/10 pt-3">
        <div class="text-xs text-rose-500 font-bold" v-if="validationError">
          ⚠️ {{ validationError }}
        </div>
        <div v-else></div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            @click="handleSave"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>💾 Testni Saqlash</span>
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import BaseModal from "../common/BaseModal.vue";
import type { TestExam, Question } from "../../types/test";

const props = defineProps<{
  modelValue: boolean;
  initialTest?: TestExam | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "saved", test: TestExam): void;
}>();

const activeTab = ref<"general" | "questions" | "anticheat">("general");
const formData = ref<TestExam | null>(null);
const validationError = ref("");

const isEditing = computed(() => !!props.initialTest);

const totalPoints = computed(() => {
  if (!formData.value) return 0;
  return formData.value.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.initialTest) {
        formData.value = JSON.parse(JSON.stringify(props.initialTest));
      } else {
        formData.value = createEmptyTest();
      }
      activeTab.value = "general";
      validationError.value = "";
    }
  },
  { immediate: true }
);

function createEmptyTest(): TestExam {
  return {
    id: "test_" + Date.now(),
    title: "",
    description: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: true,
    timeLimitMinutes: 15,
    questions: [
      {
        id: "q_1",
        text: "",
        type: "mcq",
        points: 2,
        timeLimitSeconds: 30,
        options: [
          { id: "o_1", text: "", isCorrect: true },
          { id: "o_2", text: "", isCorrect: false },
          { id: "o_3", text: "", isCorrect: false },
          { id: "o_4", text: "", isCorrect: false },
        ],
      },
    ],
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true,
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 30,
    },
    source: "manual",
  };
}

function addNewQuestion() {
  if (!formData.value) return;
  const newId = "q_" + Date.now() + "_" + (formData.value.questions.length + 1);
  formData.value.questions.push({
    id: newId,
    text: "",
    type: "mcq",
    points: 2,
    timeLimitSeconds: 30,
    options: [
      { id: "o_1", text: "", isCorrect: true },
      { id: "o_2", text: "", isCorrect: false },
      { id: "o_3", text: "", isCorrect: false },
      { id: "o_4", text: "", isCorrect: false },
    ],
  });
}

function removeQuestion(idx: number) {
  if (!formData.value) return;
  formData.value.questions.splice(idx, 1);
}

function addOption(q: Question) {
  const newOptId = "o_" + Date.now() + "_" + (q.options.length + 1);
  q.options.push({
    id: newOptId,
    text: "",
    isCorrect: false,
  });
}

function removeOption(q: Question, idx: number) {
  q.options.splice(idx, 1);
}

function setMcqCorrect(q: Question, optionId: string) {
  q.options.forEach((o) => {
    o.isCorrect = o.id === optionId;
  });
}

function handleSave() {
  validationError.value = "";
  if (!formData.value) return;

  if (!formData.value.title.trim()) {
    activeTab.value = "general";
    validationError.value = "Test nomini kiritish majburiy!";
    return;
  }

  if (formData.value.questions.length === 0) {
    activeTab.value = "questions";
    validationError.value = "Kamida bitta savol qo'shishingiz kerak!";
    return;
  }

  // Validate questions
  for (let i = 0; i < formData.value.questions.length; i++) {
    const q = formData.value.questions[i];
    if (!q.text.trim()) {
      activeTab.value = "questions";
      validationError.value = `${i + 1}-savol matni bo'sh bo'lishi mumkin emas!`;
      return;
    }

    if (q.type === "mcq" || q.type === "checkbox") {
      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        activeTab.value = "questions";
        validationError.value = `${i + 1}-savolda to'g'ri javob belgilanmagan!`;
        return;
      }
    } else if (q.type === "short_answer") {
      if (!q.correctAnswerText?.trim()) {
        activeTab.value = "questions";
        validationError.value = `${i + 1}-savolda kutilgan to'g'ri javob kiritilmagan!`;
        return;
      }
    }
  }

  emit("saved", formData.value);
  emit("update:modelValue", false);
}
</script>
