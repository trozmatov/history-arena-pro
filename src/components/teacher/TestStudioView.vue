<template>
  <div class="fixed inset-0 z-[100] bg-[#0a0f1d] text-white flex flex-col overflow-hidden font-sans select-none">
    <!-- ==========================================
         TOP STUDIO NAVIGATION BAR
         ========================================== -->
    <header class="flex-shrink-0 border-b border-white/10 bg-[#0e1629]/95 backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3 relative z-30">
      <!-- Left: Back button & Title editing -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          @click="handleExit"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition active:scale-95 cursor-pointer shrink-0"
        >
          <span>←</span>
          <span class="hidden sm:inline">Chiqish</span>
        </button>

        <div class="flex-1 min-w-0">
          <input
            v-model="testData.title"
            type="text"
            placeholder="Test nomi..."
            class="w-full bg-transparent text-sm sm:text-base font-black text-white outline-none border-b border-transparent hover:border-white/20 focus:border-indigo-500 transition px-1 py-0.5 truncate"
          />
          <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
            <span class="text-indigo-400 font-bold uppercase tracking-wider">Test Studio</span>
            <span>•</span>
            <span class="truncate">{{ testData.source === 'google_forms' ? 'Google Forms orqali import qilingan' : 'Qo\'lda yaratilmoqda' }}</span>
          </div>
        </div>
      </div>

      <!-- Center: Folder & Class selector -->
      <div class="hidden md:flex items-center gap-2 shrink-0">
        <div class="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-2xl px-3 py-1.5 text-xs">
          <span class="text-indigo-400 font-bold text-sm">📁</span>
          <label class="text-[11px] text-slate-400 font-bold">Bo'lim:</label>
          <select
            v-model="testData.folderId"
            @change="handleFolderChange"
            class="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
          >
            <option
              v-for="folder in folders"
              :key="folder.id"
              :value="folder.id"
              class="bg-slate-900 text-white"
            >
              {{ folder.icon || '📁' }} {{ folder.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Right: Stats & Action Buttons -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Quick Stats Pill -->
        <div class="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 text-xs text-slate-300 font-bold">
          <span>❓ {{ testData.questions.length }} ta</span>
          <span>•</span>
          <span class="text-emerald-400 font-black">🎯 {{ totalPoints }} ball</span>
        </div>

        <!-- Anti-Cheat Settings Drawer Button -->
        <button
          type="button"
          @click="showAntiCheatDrawer = true"
          class="flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-black transition active:scale-95 cursor-pointer shadow-md"
          :class="
            testData.antiCheat.zeroTolerance
              ? 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
              : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
          "
        >
          <span>🛡️</span>
          <span class="hidden sm:inline">Anti-Cheat</span>
          <span
            v-if="testData.antiCheat.zeroTolerance"
            class="h-2 w-2 rounded-full bg-rose-400 animate-pulse"
          ></span>
        </button>

        <!-- Save Button -->
        <button
          type="button"
          @click="handleSaveAndExit"
          class="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <span>💾</span>
          <span>Saqlash va Chiqish</span>
        </button>
      </div>
    </header>

    <!-- Mobile Subheader: Folder Selector on Small Screens -->
    <div class="md:hidden bg-[#0c1322] border-b border-white/10 px-4 py-2 flex items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-1.5 text-slate-300">
        <span>📁 Bo'lim:</span>
        <select
          v-model="testData.folderId"
          @change="handleFolderChange"
          class="bg-black/40 border border-white/10 rounded-xl px-2 py-1 text-white font-bold outline-none"
        >
          <option
            v-for="folder in folders"
            :key="folder.id"
            :value="folder.id"
            class="bg-slate-900 text-white"
          >
            {{ folder.icon || '📁' }} {{ folder.name }}
          </option>
        </select>
      </div>
      <div class="text-[11px] text-emerald-400 font-bold">
        {{ testData.questions.length }} ta savol • {{ totalPoints }} ball
      </div>
    </div>

    <!-- ==========================================
         MAIN TWO-COLUMN STUDIO WORKSPACE
         ========================================== -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 1. LEFT SIDEBAR: QUESTIONS OUTLINE / NAVIGATOR -->
      <aside class="w-72 sm:w-80 border-r border-white/10 bg-[#090e1a]/80 backdrop-blur-xl flex flex-col shrink-0">
        <!-- Sidebar Header: Add Question Action -->
        <div class="p-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>Mundarija</span>
            <span class="rounded-full bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 text-[10px]">
              {{ testData.questions.length }}
            </span>
          </div>

          <!-- Add question dropdown -->
          <div class="relative">
            <button
              type="button"
              @click="showAddMenu = !showAddMenu"
              class="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Qo'shish</span>
              <span class="text-[9px]">▼</span>
            </button>

            <!-- Dropdown Options -->
            <div
              v-if="showAddMenu"
              class="absolute right-0 top-full mt-1 w-52 rounded-2xl bg-[#131d33] border border-white/15 shadow-2xl p-1.5 z-50 space-y-1"
            >
              <button
                type="button"
                @click="addQuestion('mcq')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer transition"
              >
                <span>🔘</span>
                <span>Bitta to'g'ri javob (MCQ)</span>
              </button>
              <button
                type="button"
                @click="addQuestion('checkbox')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer transition"
              >
                <span>☑️</span>
                <span>Bir nechta javob (Checkbox)</span>
              </button>
              <button
                type="button"
                @click="addQuestion('short_answer')"
                class="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer transition"
              >
                <span>✍️</span>
                <span>Qisqa matnli javob</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Question Cards List -->
        <div class="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          <div
            v-for="(q, idx) in testData.questions"
            :key="q.id"
            @click="activeQuestionIdx = idx"
            class="rounded-2xl p-3 border transition-all cursor-pointer relative group flex items-start gap-2.5"
            :class="
              activeQuestionIdx === idx
                ? 'border-indigo-500 bg-gradient-to-r from-indigo-600/25 to-blue-600/15 shadow-lg shadow-indigo-500/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
            "
          >
            <!-- Question Number Badge -->
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-black text-xs transition"
              :class="activeQuestionIdx === idx ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'"
            >
              {{ idx + 1 }}
            </div>

            <!-- Content Preview -->
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-white truncate leading-snug">
                {{ q.text || "Savol matni kiritilmagan..." }}
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                <span>
                  {{ q.type === 'mcq' ? '🔘 Bitta tanlov' : q.type === 'checkbox' ? '☑️ Bir nechta' : '✍️ Matn' }}
                </span>
                <span>•</span>
                <span class="text-emerald-400 font-bold">{{ q.points }} b</span>
                <span v-if="q.imageUrl" class="text-amber-400 font-black" title="Rasm biriktirilgan">🖼️ Rasm</span>
              </div>
            </div>

            <!-- Actions: Reorder / Duplicate / Delete -->
            <div class="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                :disabled="idx === 0"
                @click.stop="moveQuestion(idx, -1)"
                class="p-0.5 rounded text-[10px] hover:bg-white/20 disabled:opacity-20 cursor-pointer"
                title="Yuqoriga"
              >
                ▲
              </button>
              <button
                type="button"
                :disabled="idx === testData.questions.length - 1"
                @click.stop="moveQuestion(idx, 1)"
                class="p-0.5 rounded text-[10px] hover:bg-white/20 disabled:opacity-20 cursor-pointer"
                title="Pastga"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar Footer: Description & Time Limit summary -->
        <div class="p-3 border-t border-white/10 bg-black/30 space-y-2 text-xs">
          <div class="flex items-center justify-between text-slate-400">
            <span>Umumiy Imtihon Vaqti:</span>
            <div class="flex items-center gap-1 font-bold text-white">
              <input
                v-model.number="testData.timeLimitMinutes"
                type="number"
                min="0"
                max="300"
                class="w-12 bg-black/50 border border-white/15 rounded-lg px-1.5 py-0.5 text-center text-xs outline-none"
              />
              <span>daqiqa</span>
            </div>
          </div>
          <div class="text-[10px] text-slate-500">
            * 0 qo'yilsa, umumiy vaqt cheklovisiz bo'ladi.
          </div>
        </div>
      </aside>

      <!-- 2. RIGHT CANVAS: ACTIVE QUESTION EDITOR -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar">
        <div
          v-if="activeQuestion"
          class="w-full max-w-3xl apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 border border-white/15 bg-[#0f1a30]/85 shadow-2xl relative"
        >
          <!-- Active Question Header: Type, Points, Timer, Delete, Duplicate -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div class="flex items-center gap-2.5">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xs">
                #{{ activeQuestionIdx + 1 }}
              </span>

              <!-- Type Selector -->
              <select
                v-model="activeQuestion.type"
                class="rounded-xl bg-black/40 border border-white/15 px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer hover:border-indigo-500/50"
              >
                <option value="mcq">🔘 Bitta to'g'ri javobli (MCQ)</option>
                <option value="checkbox">☑️ Bir nechta to'g'ri javobli (Checkbox)</option>
                <option value="short_answer">✍️ Qisqa matnli yozma javob</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <!-- Points -->
              <div class="flex items-center gap-1 bg-black/40 border border-white/15 rounded-xl px-2.5 py-1 text-xs">
                <span class="text-slate-400 font-bold text-[11px]">Ball:</span>
                <input
                  v-model.number="activeQuestion.points"
                  type="number"
                  min="1"
                  max="100"
                  class="w-10 bg-transparent text-emerald-400 font-black text-xs outline-none text-center"
                />
              </div>

              <!-- Question Timer Seconds -->
              <div class="flex items-center gap-1 bg-black/40 border border-white/15 rounded-xl px-2.5 py-1 text-xs">
                <span class="text-slate-400 font-bold text-[11px]">Taymer:</span>
                <input
                  v-model.number="activeQuestion.timeLimitSeconds"
                  type="number"
                  min="5"
                  max="300"
                  placeholder="30"
                  class="w-10 bg-transparent text-amber-400 font-black text-xs outline-none text-center"
                />
                <span class="text-[10px] text-slate-500">sek</span>
              </div>

              <!-- Duplicate Button -->
              <button
                type="button"
                @click="duplicateQuestion(activeQuestionIdx)"
                class="p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer text-xs"
                title="Nusxa olish"
              >
                ⎘
              </button>

              <!-- Delete Button -->
              <button
                type="button"
                :disabled="testData.questions.length <= 1"
                @click="deleteQuestion(activeQuestionIdx)"
                class="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                title="Savolni o'chirish"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Question Text Input -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-300">
              Savol matni:
            </label>
            <textarea
              v-model="activeQuestion.text"
              rows="3"
              placeholder="Savolni bu yerga kiriting..."
              class="w-full rounded-2xl p-4 text-sm bg-black/50 border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none text-white font-medium resize-none transition"
            ></textarea>
          </div>

          <!-- ==========================================
               IMAGE ATTACHMENT SECTION (Upload / URL)
               ========================================== -->
          <div class="space-y-3 rounded-2xl bg-black/30 border border-white/10 p-4">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-slate-200 flex items-center gap-2">
                <span>🖼️</span>
                <span>Savol Rasmi (Ixtiyoriy)</span>
              </label>

              <button
                v-if="!activeQuestion.imageUrl"
                type="button"
                @click="showUrlInput = !showUrlInput"
                class="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer"
              >
                {{ showUrlInput ? 'Fayl yuklashga qaytish' : 'Havola (URL) orqali kiritish' }}
              </button>
            </div>

            <!-- 1. Existing Image Preview -->
            <div v-if="activeQuestion.imageUrl" class="space-y-2">
              <div class="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 max-h-72 flex items-center justify-center group">
                <img
                  :src="activeQuestion.imageUrl"
                  alt="Savol rasmi"
                  class="max-h-72 w-auto object-contain rounded-2xl transition group-hover:scale-[1.01]"
                />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-xs">
                  <a
                    :href="activeQuestion.imageUrl"
                    target="_blank"
                    class="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                  >
                    To'liq ko'rish ↗
                  </a>
                  <button
                    type="button"
                    @click="activeQuestion.imageUrl = undefined"
                    class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                  >
                    Rasmni o'chirish 🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. No Image: Upload via File or Enter URL -->
            <div v-else>
              <!-- URL Input Mode -->
              <div v-if="showUrlInput" class="flex gap-2">
                <input
                  v-model="imageUrlDraft"
                  type="text"
                  placeholder="https://misol.uz/rasm.jpg havolasini kiriting..."
                  class="flex-1 rounded-xl px-3 py-2 text-xs bg-black/50 border border-white/15 text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  @click="applyImageUrl"
                  class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Biriktirish
                </button>
              </div>

              <!-- File Upload Dropzone Mode -->
              <div
                v-else
                @click="triggerFileInput"
                class="rounded-2xl border-2 border-dashed border-white/20 hover:border-indigo-500/60 p-5 text-center cursor-pointer transition bg-white/5 hover:bg-indigo-500/5 group"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileUpload"
                />
                <div class="text-3xl mb-1 group-hover:scale-110 transition-transform">📷</div>
                <div class="text-xs font-bold text-slate-300">
                  Kompyuterdan rasm tanlash uchun bosing
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  PNG, JPG, WEBP, GIF (avtomatik Base64 formatda saqlanadi)
                </div>
              </div>
            </div>
          </div>

          <!-- ==========================================
               OPTIONS SECTION: MCQ & CHECKBOX
               ========================================== -->
          <div v-if="activeQuestion.type === 'mcq' || activeQuestion.type === 'checkbox'" class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-300">
                Javob variantlari (To'g'ri javobni belgilang):
              </label>
              <button
                type="button"
                @click="addOption(activeQuestion)"
                class="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>+ Variant qo'shish</span>
              </button>
            </div>

            <div class="space-y-2">
              <div
                v-for="(opt, optIdx) in activeQuestion.options"
                :key="opt.id"
                class="flex items-center gap-2.5 rounded-2xl p-2.5 border transition-all"
                :class="
                  opt.isCorrect
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-white/10 bg-white/5'
                "
              >
                <!-- Radio / Checkbox toggle for correct answer -->
                <button
                  type="button"
                  @click="toggleCorrectAnswer(activeQuestion, opt.id)"
                  class="h-6 w-6 rounded-lg flex items-center justify-center transition cursor-pointer shrink-0"
                  :class="
                    opt.isCorrect
                      ? 'bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/30'
                      : 'border-2 border-slate-600 hover:border-slate-400 text-transparent'
                  "
                  :title="opt.isCorrect ? 'To\'g\'ri javob' : 'To\'g\'ri javob sifatida belgilash'"
                >
                  ✓
                </button>

                <!-- Option Text -->
                <input
                  v-model="opt.text"
                  type="text"
                  placeholder="Variant matni..."
                  class="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-white outline-none"
                />

                <!-- Delete Option -->
                <button
                  type="button"
                  :disabled="activeQuestion.options.length <= 2"
                  @click="removeOption(activeQuestion, optIdx)"
                  class="p-1 rounded-lg text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                  title="Variantni o'chirish"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>

          <!-- ==========================================
               SHORT ANSWER SECTION
               ========================================== -->
          <div v-else-if="activeQuestion.type === 'short_answer'" class="space-y-2">
            <label class="block text-xs font-bold text-slate-300">
              Kutilayotgan to'g'ri javob (kalit so'z):
            </label>
            <input
              v-model="activeQuestion.correctAnswerText"
              type="text"
              placeholder="To'g'ri javob matnini yozing (masalan: 1370-yil)..."
              class="w-full rounded-2xl px-4 py-3 text-sm bg-black/50 border border-white/15 focus:border-indigo-500 outline-none text-emerald-400 font-bold"
            />
            <p class="text-[10px] text-slate-400">
              * O'quvchi javobini tekshirishda katta-kichik harflar va bo'shliqlar inobatga olinmaydi.
            </p>
          </div>

          <!-- Explanation / Feedback -->
          <div class="space-y-2 border-t border-white/10 pt-4">
            <label class="block text-xs font-bold text-slate-400">
              Izoh / Tushuntirish (Imtihondan so'ng o'quvchiga ko'rsatiladi):
            </label>
            <input
              v-model="activeQuestion.explanation"
              type="text"
              placeholder="Masalan: Ushbu voqea 1370-yilda Amir Temurning Samarqandda taxtga o'tirishi bilan bog'liq..."
              class="w-full rounded-xl px-3 py-2 text-xs bg-black/30 border border-white/10 text-slate-300 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div v-else class="text-center py-20 text-slate-400">
          Savol tanlanmagan. Chap mundarijadan savolni tanlang.
        </div>
      </main>
    </div>

    <!-- ==========================================
         ANTI-CHEAT CONFIGURATION DRAWER / MODAL
         ========================================== -->
    <div
      v-if="showAntiCheatDrawer"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade"
    >
      <div class="w-full max-w-lg apple-glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-5 border border-white/20 bg-[#0e1629] shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🛡️</span>
            <div>
              <h3 class="text-base font-black text-white">Anti-Cheating Xavfsizlik Sozlamalari</h3>
              <p class="text-[11px] text-slate-400">Imtihon paytida ko'chirishga qarshi himoyalar</p>
            </div>
          </div>
          <button
            type="button"
            @click="showAntiCheatDrawer = false"
            class="text-slate-400 hover:text-white text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          <!-- 1. Zero Tolerance -->
          <div class="flex items-center justify-between rounded-2xl p-3 border border-rose-500/30 bg-rose-500/10">
            <div>
              <div class="font-black text-rose-300">0-Toleransiya (Nol-ruxsat)</div>
              <div class="text-[10px] text-slate-400">Boshqa tab yoki ilovaga hatto 1 marta ham o'tilsa — darhol chetlatish</div>
            </div>
            <input
              v-model="testData.antiCheat.zeroTolerance"
              type="checkbox"
              class="h-5 w-5 accent-rose-500 cursor-pointer"
            />
          </div>

          <!-- 2. Fullscreen Required -->
          <div class="flex items-center justify-between rounded-2xl p-3 border border-white/10 bg-white/5">
            <div>
              <div class="font-bold text-white">To'liq ekran (Fullscreen) majburiy</div>
              <div class="text-[10px] text-slate-400">To'liq ekrandan chiqish qoidabuzarlik sifatida qayd etiladi</div>
            </div>
            <input
              v-model="testData.antiCheat.fullscreenRequired"
              type="checkbox"
              class="h-5 w-5 accent-indigo-500 cursor-pointer"
            />
          </div>

          <!-- 3. Block Screenshot -->
          <div class="flex items-center justify-between rounded-2xl p-3 border border-white/10 bg-white/5">
            <div>
              <div class="font-bold text-white">Skrinshot olishni taqiqlash</div>
              <div class="text-[10px] text-slate-400">PrintScreen, Snipping tool, Cmd+Shift tugmalarini bloklash</div>
            </div>
            <input
              v-model="testData.antiCheat.blockScreenshot"
              type="checkbox"
              class="h-5 w-5 accent-indigo-500 cursor-pointer"
            />
          </div>

          <!-- 4. Watermark -->
          <div class="flex items-center justify-between rounded-2xl p-3 border border-white/10 bg-white/5">
            <div>
              <div class="font-bold text-white">Harakatlanuvchi Suv belgisi (Watermark)</div>
              <div class="text-[10px] text-slate-400">Telefonga suratga olishni oldini olish uchun ekranda o'quvchi ismi chiqadi</div>
            </div>
            <input
              v-model="testData.antiCheat.showWatermark"
              type="checkbox"
              class="h-5 w-5 accent-indigo-500 cursor-pointer"
            />
          </div>

          <!-- 5. Shuffle Questions & Options -->
          <div class="flex items-center justify-between rounded-2xl p-3 border border-white/10 bg-white/5">
            <div>
              <div class="font-bold text-white">Savollarni va variantlarni aralashtirish (Shuffle)</div>
              <div class="text-[10px] text-slate-400">Har bir o'quvchiga savollar va variantlar tasodifiy tartibda chiqadi</div>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="testData.antiCheat.shuffleQuestions"
                type="checkbox"
                class="h-5 w-5 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="showAntiCheatDrawer = false"
          class="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer"
        >
          Sozlamalarni Tasdiqlash ✓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { TestExam, Question, QuestionType, TestFolder } from "../../types/test";

const props = defineProps<{
  initialTest: TestExam;
  folders: TestFolder[];
}>();

const emit = defineEmits<{
  (e: "save", test: TestExam): void;
  (e: "cancel"): void;
}>();

// Deep clone to allow safe editing without modifying store state until saved
const testData = ref<TestExam>(JSON.parse(JSON.stringify(props.initialTest)));

// Ensure folderId has default
if (!testData.value.folderId) {
  testData.value.folderId = "folder_umumiy";
}

const activeQuestionIdx = ref(0);
const showAddMenu = ref(false);
const showAntiCheatDrawer = ref(false);

// Image uploading state
const fileInputRef = ref<HTMLInputElement | null>(null);
const showUrlInput = ref(false);
const imageUrlDraft = ref("");

const activeQuestion = computed<Question | undefined>(() => {
  return testData.value.questions[activeQuestionIdx.value];
});

const totalPoints = computed(() => {
  return testData.value.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

function handleFolderChange() {
  const matched = props.folders.find((f) => f.id === testData.value.folderId);
  if (matched) {
    testData.value.targetGrade = matched.name.includes("sinf")
      ? matched.name
      : "Umumiy";
  }
}

// Add a new question
function addQuestion(type: QuestionType) {
  showAddMenu.value = false;
  const newQ: Question = {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    text: "",
    type,
    points: 2,
    timeLimitSeconds: 30,
    options:
      type === "short_answer"
        ? []
        : [
            { id: `opt_1`, text: "1-variant", isCorrect: true },
            { id: `opt_2`, text: "2-variant", isCorrect: false },
            { id: `opt_3`, text: "3-variant", isCorrect: false },
            { id: `opt_4`, text: "4-variant", isCorrect: false },
          ],
    correctAnswerText: "",
    explanation: "",
  };

  testData.value.questions.push(newQ);
  activeQuestionIdx.value = testData.value.questions.length - 1;
}

function duplicateQuestion(idx: number) {
  const target = testData.value.questions[idx];
  if (!target) return;
  const cloned = JSON.parse(JSON.stringify(target)) as Question;
  cloned.id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  cloned.text = `${cloned.text} (Nusxa)`;
  testData.value.questions.splice(idx + 1, 0, cloned);
  activeQuestionIdx.value = idx + 1;
}

function deleteQuestion(idx: number) {
  if (testData.value.questions.length <= 1) return;
  testData.value.questions.splice(idx, 1);
  if (activeQuestionIdx.value >= testData.value.questions.length) {
    activeQuestionIdx.value = testData.value.questions.length - 1;
  }
}

function moveQuestion(idx: number, delta: number) {
  const targetIdx = idx + delta;
  if (targetIdx < 0 || targetIdx >= testData.value.questions.length) return;
  const temp = testData.value.questions[idx];
  testData.value.questions[idx] = testData.value.questions[targetIdx];
  testData.value.questions[targetIdx] = temp;
  activeQuestionIdx.value = targetIdx;
}

// Option handlers
function addOption(question: Question) {
  const nextNum = (question.options?.length || 0) + 1;
  question.options.push({
    id: `opt_${Date.now()}_${nextNum}`,
    text: `${nextNum}-variant`,
    isCorrect: false,
  });
}

function removeOption(question: Question, idx: number) {
  if (question.options.length <= 2) return;
  question.options.splice(idx, 1);
}

function toggleCorrectAnswer(question: Question, optionId: string) {
  if (question.type === "mcq") {
    // Only one correct
    question.options.forEach((opt) => {
      opt.isCorrect = opt.id === optionId;
    });
  } else if (question.type === "checkbox") {
    // Multiple correct allowed
    const opt = question.options.find((o) => o.id === optionId);
    if (opt) {
      opt.isCorrect = !opt.isCorrect;
    }
  }
}

// Image handling
function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Convert to Base64 Data URL so it's fully stored locally without needing external backend upload server
  const reader = new FileReader();
  reader.onload = (event) => {
    if (activeQuestion.value && event.target?.result) {
      activeQuestion.value.imageUrl = event.target.result as string;
    }
  };
  reader.readAsDataURL(file);
}

function applyImageUrl() {
  if (imageUrlDraft.value.trim() && activeQuestion.value) {
    activeQuestion.value.imageUrl = imageUrlDraft.value.trim();
    imageUrlDraft.value = "";
    showUrlInput.value = false;
  }
}

// Save & Exit
function handleSaveAndExit() {
  if (!testData.value.title.trim()) {
    testData.value.title = "Nomsiz Test";
  }
  emit("save", testData.value);
}

function handleExit() {
  if (confirm("Test studio oynasidan chiqmoqchimisiz? Saqlanmagan o'zgarishlar bekor bo'lishi mumkin.")) {
    emit("cancel");
  }
}
</script>
