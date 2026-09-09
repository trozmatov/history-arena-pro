<template>
  <div class="space-y-6 w-full mx-auto pb-12">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('back')"
          class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-base text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          title="Bosh menyuga qaytish"
        >
          ⬅️
        </button>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>⚔️</span> Chellenj Arena
            <span class="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md shadow-amber-500/20">
              Gemini 3.8 Flash
            </span>
          </h2>
          <p class="text-xs text-slate-400">PDF darslikdan test tuzish, mukofotli chellenjlar e'lon qilish va Telegram guruhda reyting yuritish</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="activeTab = 'create'"
          class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 transition-all"
        >
          <span>➕</span>
          <span>Yangi Chellenj Tuzish</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex rounded-2xl bg-black/50 p-1.5 border border-white/10 text-xs gap-1">
      <button
        type="button"
        @click="activeTab = 'active'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'active' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>🔥</span>
        <span>Faol Chellenjlar ({{ activeChallenges.length }})</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'create'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'create' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>➕</span>
        <span>PDF dan Test Tuzish</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'bank'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'bank' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>📚</span>
        <span>Testlar Banki ({{ draftBanks.length }})</span>
      </button>
      <button
        type="button"
        @click="activeTab = 'history'"
        class="flex-1 rounded-xl py-2.5 font-black transition flex items-center justify-center gap-1.5"
        :class="activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
      >
        <span>🏁</span>
        <span>Yakunlanganlar ({{ pastChallenges.length }})</span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 1: FAOL CHELLENJLAR -->
    <!-- ======================================================== -->
    <div v-if="activeTab === 'active'" class="space-y-4">
      <div v-if="loading" class="py-12 text-center text-xs text-slate-400">
        <span class="animate-spin inline-block text-2xl mb-2">🔄</span>
        <div>Chellenjlar yuklanmoqda...</div>
      </div>

      <div
        v-else-if="activeChallenges.length === 0"
        class="py-16 text-center rounded-3xl border border-white/5 bg-black/20 p-6 space-y-3"
      >
        <div class="text-4xl">⚔️</div>
        <div class="text-sm font-bold text-white">Hozircha faol chellenjlar yo'q</div>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          O'quvchilarda qiziqish uyg'otish uchun PDF darslikdan test tuzing, mukofot va deadline belgilab, birinchi chellenjni boshlang!
        </p>
        <button
          type="button"
          @click="activeTab = 'create'"
          class="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition"
        >
          ➕ Yangi Chellenj Boshlash
        </button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="chal in activeChallenges"
          :key="chal.id"
          class="rounded-3xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden"
        >
          <!-- Glowing Header -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">🏆</span>
                <h3 class="text-base font-black text-white">{{ chal.title }}</h3>
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                <span>📖 {{ chal.topic }}</span> • <span class="text-amber-400 font-bold">{{ chal.group || "Barcha guruhlar" }}</span>
              </div>
            </div>

            <span class="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[10px] font-black text-amber-300 animate-pulse shrink-0">
              ⚡ FAOL JANG
            </span>
          </div>

          <!-- Deadline Countdown Box -->
          <div class="rounded-2xl bg-black/50 border border-white/10 p-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">⏳</span>
              <div>
                <div class="text-[10px] text-slate-400 uppercase font-bold">Qolgan Vaqt (Deadline)</div>
                <div class="text-xs font-black text-amber-300">
                  {{ formatRemainingTime(chal.deadline) }}
                </div>
              </div>
            </div>
            <div class="text-right text-[11px] text-slate-400 font-medium">
              {{ formatDateTime(chal.deadline) }}
            </div>
          </div>

          <!-- Rewards Box -->
          <div class="rounded-2xl bg-gradient-to-r from-amber-950/30 via-black/40 to-indigo-950/30 border border-white/10 p-3 space-y-1.5">
            <div class="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🎁</span> E'lon Qilingan Mukofotlar:
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <span v-if="chal.rewards?.cashPrize && chal.rewards.cashPrize !== '0' && chal.rewards.cashPrize !== '0 so\'m' && chal.rewards.cashPrize !== '0 som' && !chal.rewards.cashPrize.toLowerCase().startsWith('yo\'q')" class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 font-bold flex items-center gap-1">
                <span>💰</span> {{ chal.rewards.cashPrize }}
              </span>
              <span v-if="chal.rewards?.coins" class="rounded-xl bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-amber-300 font-bold flex items-center gap-1">
                <span>🪙</span> +{{ chal.rewards.coins }} coin
              </span>
              <span v-if="chal.rewards?.specialPerk && !chal.rewards.specialPerk.toLowerCase().startsWith('yo\'q')" class="rounded-xl bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 text-purple-300 font-bold flex items-center gap-1">
                <span>🛡️</span> {{ chal.rewards.specialPerk }}
              </span>
            </div>
          </div>

          <!-- Mini Leaderboard (Top 3) -->
          <div class="space-y-2 pt-1 border-t border-white/5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-300 flex items-center gap-1">
                <span>📊</span> Peshqadamlar ({{ getParticipantCount(chal) }} ta ishtirokchi)
              </span>
              <button
                type="button"
                @click="openLeaderboardModal(chal)"
                class="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline"
              >
                Barchasini ko'rish ↗
              </button>
            </div>

            <div v-if="getTopParticipants(chal, 3).length === 0" class="text-[11px] text-slate-500 italic py-1">
              Hozircha hech kim topshirmadi. Birinchi bo'lib topshirgan 1-o'ringa chiqadi!
            </div>
            <div v-else class="space-y-1.5">
              <div
                v-for="(p, idx) in getTopParticipants(chal, 3)"
                :key="p.studentId"
                class="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 px-3 py-1.5 text-xs"
              >
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black">{{ ["🥇", "🥈", "🥉"][idx] }}</span>
                  <span class="text-slate-200 font-bold">{{ p.studentName }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-emerald-400 font-black">{{ p.score }} ball</span>
                  <span class="text-slate-400 text-[10px]">{{ formatSeconds(p.timeSpentSeconds) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              @click="handleFinalizeChallenge(chal)"
              class="flex-1 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white active:scale-95 transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>🏁</span>
              <span>Yakunlash & Botga G'oliblarni Yuborish</span>
            </button>

            <button
              type="button"
              @click="handleSendTelegramReminder(chal)"
              class="rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 text-xs font-bold text-blue-300 active:scale-95 transition flex items-center gap-1"
              title="Guruhga e'lonni qayta yuborish"
            >
              <span>📢</span>
            </button>

            <button
              type="button"
              @click="handleDeleteChallenge(chal.id)"
              class="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300 active:scale-95 transition"
              title="O'chirish"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 2: YANGI TEST & CHELLENJ TUZISH -->
    <!-- ======================================================== -->
    <div v-if="activeTab === 'create'" class="space-y-6 max-w-3xl mx-auto">
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        <div>
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <span>✨</span> Gemini 3.8 Flash orqali Test Tuzish
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Darslik PDF faylini yuklang yoki mavzu nomini kiriting. AI darhol 4 variantli testlarni tuzib beradi, so'ng ularni tahrirlashingiz mumkin.
          </p>
        </div>

        <!-- 1. Topic Title -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-300">Mavzu yoki Bo'lim Nomi *</label>
          <input
            v-model="createForm.topic"
            type="text"
            placeholder="Masalan: Amir Temur saltanati va harbiy yurishlari"
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
          />
        </div>

        <!-- 2. Target Group -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-300">Mo'ljallangan Guruh</label>
          <input
            v-model="createForm.group"
            type="text"
            placeholder="Barcha guruhlar (yoki '9-A', 'Tarix-1')"
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
          />
        </div>

        <!-- 3. Question Count Selection -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-300">Test Savollari Soni</label>
            <span class="text-[11px] font-mono font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              {{ createForm.questionCount || 10 }} ta test
            </span>
          </div>

          <!-- Quick Presets -->
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="count in [5, 10, 20, 30, 50, 60]"
              :key="count"
              type="button"
              @click="createForm.questionCount = count"
              class="rounded-xl border py-2 text-xs font-bold transition text-center"
              :class="createForm.questionCount === count ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30' : 'border-white/10 bg-black/40 text-slate-400 hover:text-white hover:border-white/20'"
            >
              {{ count }} ta
            </button>
          </div>

          <!-- Manual Custom Input -->
          <div class="relative">
            <input
              v-model.number="createForm.questionCount"
              type="number"
              min="1"
              max="100"
              placeholder="Yoki ixtiyoriy test sonini kiriting (masalan: 50 yoki 60)..."
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
            <span class="absolute right-3.5 top-2.5 text-xs text-slate-400 pointer-events-none">ta test (1-100)</span>
          </div>
          <p class="text-[11px] text-slate-400">💡 <b>Eslatma:</b> AI (Gemini 3.8 Flash) 50-60 tagacha test savolini bir vaqtda parallel oqimlarda xatosiz va to'liq variantlari bilan tuzib bera oladi.</p>
        </div>

        <!-- 4. PDF File Upload -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-300">Darslik yoki Qo'llanma PDF Fayli (Ixtiyoriy)</label>
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            class="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition cursor-pointer"
            :class="isDragging ? 'border-emerald-500 bg-emerald-950/20' : selectedFile ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-white/15 bg-black/30 hover:border-white/30'"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".pdf"
              class="hidden"
              @change="handleFileSelect"
            />

            <div v-if="selectedFile" class="space-y-1">
              <span class="text-3xl">📄</span>
              <div class="text-xs font-bold text-emerald-300">{{ selectedFile.name }}</div>
              <div class="text-[10px] text-slate-400">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB • O'qishga tayyor</div>
            </div>

            <div v-else class="space-y-1">
              <span class="text-3xl">📥</span>
              <div class="text-xs font-bold text-white">PDF faylni bu yerga tashlang yoki bosing</div>
              <div class="text-[10px] text-slate-400">PDF dan darslik matni ajratilib, AI faktlarni o'rganadi</div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="isGenerating" class="space-y-2 rounded-2xl bg-black/60 border border-white/10 p-4">
          <div class="flex items-center justify-between text-xs font-bold text-slate-300">
            <span class="flex items-center gap-2">
              <span class="animate-spin inline-block">⚡</span>
              <span>{{ progressStatus }}</span>
            </span>
            <span class="text-emerald-400">{{ progressPercent }}%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>

        <!-- Generate Button -->
        <button
          type="button"
          @click="startTestGeneration"
          :disabled="isGenerating || !createForm.topic.trim()"
          class="w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-3.5 px-6 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-cyan-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ isGenerating ? "Test Tuzilmoqda..." : "🚀 Testni AI Yordamida Tuzish" }}
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 3: TESTLAR BANKI -->
    <!-- ======================================================== -->
    <div v-if="activeTab === 'bank'" class="space-y-4">
      <div
        v-if="draftBanks.length === 0"
        class="py-16 text-center rounded-3xl border border-white/5 bg-black/20 p-6 space-y-3"
      >
        <div class="text-4xl">📚</div>
        <div class="text-sm font-bold text-white">Saqlangan testlar mavjud emas</div>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          AI yordamida tuzilgan testlarni keyinchalik chellenj qilib e'lon qilish uchun bankka saqlab qo'yishingiz mumkin.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="bank in draftBanks"
          :key="bank.id"
          class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-4"
        >
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">📑</span>
              <h4 class="text-sm font-black text-white line-clamp-1">{{ bank.title }}</h4>
            </div>
            <div class="text-xs text-slate-400 line-clamp-2">
              {{ bank.topic }}
            </div>
            <div class="flex items-center gap-2 pt-2 border-t border-white/5 text-xs text-indigo-400 font-bold">
              <span>❓ {{ bank.questions.length }} ta savol</span>
              <span>•</span>
              <span class="text-slate-400">{{ formatDate(bank.createdAt) }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              @click="openLaunchModalFromBank(bank)"
              class="flex-1 rounded-xl bg-amber-600 hover:bg-amber-500 px-3 py-2 text-xs font-bold text-white active:scale-95 transition shadow flex items-center justify-center gap-1"
            >
              <span>🚀</span> Chellenj Boshlash
            </button>
            <button
              type="button"
              @click="openEditorFromBank(bank)"
              class="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs text-slate-300"
              title="Tahrirlash"
            >
              ✏️
            </button>
            <button
              type="button"
              @click="handleDeleteBank(bank.id)"
              class="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs text-red-300"
              title="O'chirish"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 4: YAKUNLANGAN CHELLENJLAR -->
    <!-- ======================================================== -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div
        v-if="pastChallenges.length === 0"
        class="py-16 text-center rounded-3xl border border-white/5 bg-black/20 p-6 space-y-3"
      >
        <div class="text-4xl">🏁</div>
        <div class="text-sm font-bold text-white">Hozircha yakunlangan chellenjlar yo'q</div>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="chal in pastChallenges"
          :key="chal.id"
          class="rounded-3xl border border-white/10 bg-slate-900/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-base font-black text-white">{{ chal.title }}</span>
              <span class="rounded-lg bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300 font-bold">Yakunlangan</span>
            </div>
            <div class="text-xs text-slate-400">
              {{ chal.topic }} • {{ getParticipantCount(chal) }} ta ishtirokchi
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="openLeaderboardModal(chal)"
              class="rounded-xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-2 text-xs font-bold text-indigo-300 active:scale-95 transition flex items-center gap-1.5"
            >
              <span>📊</span>
              <span>Natijalar Jadvali</span>
            </button>
            <button
              type="button"
              @click="handleDeleteChallenge(chal.id)"
              class="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 text-xs font-bold text-red-300"
              title="O'chirish"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 1: TEST TAHRIRLASH MODALI (TEST EDITOR) -->
    <!-- ======================================================== -->
    <div
      v-if="showEditorModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto"
    >
      <div class="w-full max-w-4xl rounded-3xl border border-white/15 bg-slate-900 p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div>
            <h3 class="text-lg font-black text-white flex items-center gap-2">
              <span>✏️</span> Test Savollarini Tahrirlash
            </h3>
            <p class="text-xs text-slate-400">Har bir savolni ko'rib chiqing, to'g'ri javobni tanlang yoki o'zgartiring</p>
          </div>
          <button
            type="button"
            @click="showEditorModal = false"
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- Questions Scrollable List -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-1">
          <div
            v-for="(q, qIdx) in editableQuestions"
            :key="q.id || qIdx"
            class="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-black text-emerald-300">
                {{ qIdx + 1 }}-savol
              </span>
              <button
                type="button"
                @click="removeQuestion(qIdx)"
                class="text-xs text-red-400 hover:text-red-300"
              >
                O'chirish 🗑️
              </button>
            </div>

            <!-- Question Input -->
            <input
              v-model="q.question"
              type="text"
              class="w-full rounded-xl border border-white/15 bg-slate-800/80 px-3 py-2 text-xs font-bold text-white outline-none focus:border-emerald-500"
              placeholder="Savol matni"
            />

            <!-- Options Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="(opt, optIdx) in q.options"
                :key="optIdx"
                class="flex items-center gap-2 rounded-xl border p-2 transition"
                :class="q.correctAnswer === optIdx ? 'border-emerald-500/60 bg-emerald-950/20' : 'border-white/10 bg-black/30'"
              >
                <input
                  type="radio"
                  :name="`correct_${qIdx}`"
                  :checked="q.correctAnswer === optIdx"
                  @change="q.correctAnswer = optIdx"
                  class="accent-emerald-500 shrink-0 cursor-pointer"
                />
                <span class="text-xs font-black text-slate-400 shrink-0">
                  {{ ["A", "B", "C", "D"][optIdx] }})
                </span>
                <input
                  v-model="q.options[optIdx]"
                  type="text"
                  class="w-full bg-transparent text-xs text-white outline-none"
                  placeholder="Variant matni"
                />
              </div>
            </div>

            <!-- Explanation -->
            <div class="space-y-1">
              <label class="text-[10px] text-slate-400 uppercase font-bold">Darslikdagi To'g'ri Izoh:</label>
              <input
                v-model="q.explanation"
                type="text"
                class="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-[11px] text-slate-300 outline-none focus:border-emerald-500"
                placeholder="To'g'ri javob faktining qisqa izohi"
              />
            </div>
          </div>

          <button
            type="button"
            @click="addNewQuestion"
            class="w-full rounded-2xl border border-dashed border-white/20 py-3 text-xs font-bold text-slate-300 hover:border-emerald-500 hover:text-emerald-300 transition text-center"
          >
            ➕ Yangi Savol Qo'shish
          </button>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 shrink-0">
          <button
            type="button"
            @click="handleSaveToBank"
            class="w-full sm:w-auto rounded-2xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 px-5 py-2.5 text-xs font-bold text-indigo-300 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>💾</span> Testlar Bankiga Saqlash
          </button>

          <button
            type="button"
            @click="openLaunchModalFromEditor"
            class="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-amber-600/30 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>🚀</span> Chellenj E'lon Qilish
          </button>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 2: CHELLENJ E'LON QILISH (LAUNCH MODAL) -->
    <!-- ======================================================== -->
    <div
      v-if="showLaunchModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto"
    >
      <div class="w-full max-w-xl rounded-3xl border border-amber-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 class="text-lg font-black text-white flex items-center gap-2">
              <span>🚀</span> Chellenj Parametrlari
            </h3>
            <p class="text-xs text-slate-400">Mukofot va muddatni belgilang, bot darhol guruhga e'lon qiladi</p>
          </div>
          <button
            type="button"
            @click="showLaunchModal = false"
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- Challenge Title & Group -->
        <div class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="font-bold text-slate-300">Chellenj Nomi *</label>
            <input
              v-model="launchForm.title"
              type="text"
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
              placeholder="Masalan: Amir Temur davri bo'yicha blits-chellenj"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-300">Guruh</label>
            <input
              v-model="launchForm.group"
              type="text"
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
              placeholder="Barcha guruhlar"
            />
          </div>
        </div>

        <!-- Deadline Picker -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>⏳ Tugash Sanasi va Vaqti (Deadline) *</span>
          </label>
          <input
            v-model="launchForm.deadlineString"
            type="datetime-local"
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500"
          />

          <!-- Quick Deadline Shortcuts -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <button
              v-for="opt in deadlineOptions"
              :key="opt.label"
              type="button"
              @click="setQuickDeadline(opt.hours)"
              class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Rewards Configuration -->
        <div class="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
          <div class="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>🎁</span> G'oliblar Uchun Mukofotlar:
          </div>

          <!-- Cash Prize -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold text-slate-300">💰 Naqd Pul Mukofoti (Ixtiyoriy)</label>
              <button
                v-if="launchForm.cashPrize"
                type="button"
                @click="launchForm.cashPrize = ''"
                class="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                Bekor qilish ✕
              </button>
            </div>
            <div class="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                v-model="launchForm.cashPrize"
                type="text"
                class="flex-1 min-w-[140px] rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 placeholder-slate-500"
                placeholder="Pul mukofoti yo'q (Ixtiyoriy)"
              />
              <div class="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="launchForm.cashPrize = ''"
                  class="rounded-xl border px-2.5 py-1 text-[10px] font-bold transition"
                  :class="!launchForm.cashPrize || launchForm.cashPrize === '0' || launchForm.cashPrize === '0 so\'m'
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'"
                >
                  Pulsiz
                </button>
                <button
                  v-for="amt in ['20 000', '50 000', '100 000']"
                  :key="amt"
                  type="button"
                  @click="launchForm.cashPrize = `${amt} so'm`"
                  class="rounded-xl border px-2.5 py-1 text-[10px] font-bold transition"
                  :class="launchForm.cashPrize && launchForm.cashPrize.includes(amt)
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'"
                >
                  {{ amt }}
                </button>
              </div>
            </div>
            <p class="text-[10px] text-slate-400">
              * Bo'sh qoldirsangiz yoki "Pulsiz"ni tanlasangiz, Telegram va o'quvchilarda "0 so'm" deb ko'rinmaydi.
            </p>
          </div>

          <!-- Coins -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-300">🪙 Qo'shimcha Tangalar (Coin)</label>
            <div class="flex gap-2">
              <input
                v-model.number="launchForm.coins"
                type="number"
                class="w-32 rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                placeholder="50"
              />
              <button
                v-for="c in [25, 50, 100]"
                :key="c"
                type="button"
                @click="launchForm.coins = c"
                class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-300 hover:bg-white/10 shrink-0"
              >
                +{{ c }} 🪙
              </button>
            </div>
          </div>

          <!-- Special Perk / Custom Right -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-bold text-slate-300">🛡️ Maxsus Huquq / Hazilomuz Imtiyoz (Ixtiyoriy)</label>
              <button
                v-if="launchForm.specialPerk"
                type="button"
                @click="launchForm.specialPerk = ''"
                class="text-[10px] text-purple-400 hover:text-purple-300 font-semibold"
              >
                Imtiyozsiz ✕
              </button>
            </div>
            <input
              v-model="launchForm.specialPerk"
              type="text"
              class="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500 placeholder-slate-500"
              placeholder="O'zingiz xohlagan huquqni erkin yozing (masalan: 1 kun doskaga chiqmaslik)..."
            />

            <!-- Perk presets -->
            <div class="space-y-1 pt-1">
              <span class="text-[10px] text-slate-400 font-medium">Tavsiya etilgan namunalar (bosib tanlashingiz mumkin):</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="perk in perkPresets"
                  :key="perk"
                  type="button"
                  @click="launchForm.specialPerk = perk"
                  class="rounded-lg border px-2 py-1 text-[10px] text-left transition"
                  :class="launchForm.specialPerk === perk
                    ? 'border-purple-500 bg-purple-500/30 text-purple-200 font-bold shadow-sm shadow-purple-500/20'
                    : 'border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'"
                >
                  {{ perk }}
                </button>
                <button
                  v-if="launchForm.specialPerk"
                  type="button"
                  @click="launchForm.specialPerk = ''"
                  class="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/20"
                >
                  ❌ Imtiyozsiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          @click="submitLaunchChallenge"
          :disabled="isLaunching || !launchForm.title.trim()"
          class="w-full rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 py-3 px-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-amber-600/30 hover:from-amber-500 hover:to-orange-500 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>{{ isLaunching ? "E'lon qilinmoqda..." : "Chellenjni E'lon Qilish & Guruhga Yuborish" }}</span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 3: LEADERBOARD MODALI -->
    <!-- ======================================================== -->
    <div
      v-if="showLeaderboardModal && selectedChallengeForModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl"
    >
      <div class="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 my-auto max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
          <div>
            <h3 class="text-base font-black text-white flex items-center gap-2">
              <span>🏆</span> {{ selectedChallengeForModal.title }}
            </h3>
            <p class="text-xs text-slate-400">Peshqadamlar Jadvali (Leaderboard)</p>
          </div>
          <button
            type="button"
            @click="showLeaderboardModal = false"
            class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-2 pr-1">
          <div
            v-if="getAllParticipants(selectedChallengeForModal).length === 0"
            class="py-10 text-center text-xs text-slate-500"
          >
            Hozircha ishtirokchilar mavjud emas
          </div>

          <div
            v-for="(p, idx) in getAllParticipants(selectedChallengeForModal)"
            :key="p.studentId"
            class="flex items-center justify-between rounded-2xl border px-3.5 py-2 text-xs"
            :class="idx === 0 ? 'border-amber-500/50 bg-amber-950/20' : idx === 1 ? 'border-slate-400/40 bg-slate-800/30' : idx === 2 ? 'border-amber-700/40 bg-amber-950/10' : 'border-white/5 bg-black/30'"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-sm font-black w-6 text-center">
                {{ idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}` }}
              </span>
              <span class="text-base">{{ p.studentAvatar || "👤" }}</span>
              <div>
                <div class="font-black text-white">{{ p.studentName }}</div>
                <div class="text-[10px] text-slate-400">
                  {{ p.correctCount }} / {{ p.totalQuestions }} ta to'g'ri • {{ formatSeconds(p.timeSpentSeconds) }}
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="font-black text-emerald-400 text-sm">{{ p.score }} ball</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  extractTextFromPdf,
  generateTestQuestionsWithAi,
  createChallengeInFirebase,
  fetchChallenges,
  fetchDraftTestBanks,
  saveDraftTestBank,
  updateDraftTestBank,
  deleteDraftTestBank,
  deleteChallengeFromFirebase,
  finalizeChallengeInFirebase,
  type Challenge,
  type ChallengeQuestion,
  type DraftTestBank,
  type ChallengeParticipant,
} from "../../services/challengeService";
import { notifyChallengeLaunched } from "../../services/telegram";

defineEmits<{
  (e: "back"): void;
}>();

// Tabs: 'active' | 'create' | 'bank' | 'history'
const activeTab = ref<"active" | "create" | "bank" | "history">("active");
const loading = ref(false);

const challenges = ref<Challenge[]>([]);
const draftBanks = ref<DraftTestBank[]>([]);

// Active and past challenges
const activeChallenges = computed(() => {
  return challenges.value.filter((c) => c.status === "active");
});
const pastChallenges = computed(() => {
  return challenges.value.filter((c) => c.status === "completed");
});

// Create Form State
const createForm = ref({
  topic: "",
  group: "Barcha guruhlar",
  questionCount: 10,
});
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// Generation State
const isGenerating = ref(false);
const progressPercent = ref(0);
const progressStatus = ref("");

// Editor Modal State
const showEditorModal = ref(false);
const editableQuestions = ref<ChallengeQuestion[]>([]);
const currentEditingBankId = ref<string | null>(null);

// Launch Modal State
const showLaunchModal = ref(false);
const isLaunching = ref(false);
const launchForm = ref({
  title: "",
  topic: "",
  group: "Barcha guruhlar",
  deadlineString: "",
  cashPrize: "", // Ixtiyoriy, default bo'sh (0 so'm emas)
  coins: 50,
  specialPerk: "", // Ixtiyoriy, default bo'sh
});

// Leaderboard Modal State
const showLeaderboardModal = ref(false);
const selectedChallengeForModal = ref<Challenge | null>(null);

// Presets
const deadlineOptions = [
  { label: "+2 soat", hours: 2 },
  { label: "Bugun 22:00", hours: "today_22" },
  { label: "+1 kun", hours: 24 },
  { label: "+3 kun", hours: 72 },
];

const perkPresets = [
  "🛌 1 kun darsga kelmaslik (qonuniy dam olish)",
  "🛡️ 1 marta uy vazifasiz darsda qatnashish",
  "⭐ Keyingi darsda kafolatlangan '5' baho",
  "👑 1 haftaga guruh sardori bo'lish huquqi",
];

// Load Data on Mount
onMounted(async () => {
  await loadAllData();
  setDefaultDeadline(24);
});

async function loadAllData() {
  loading.value = true;
  try {
    challenges.value = await fetchChallenges();
    draftBanks.value = await fetchDraftTestBanks();
  } catch (e) {
    console.error("loadAllData error:", e);
  } finally {
    loading.value = false;
  }
}

// File handling
function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    if (!createForm.value.topic) {
      createForm.value.topic = selectedFile.value.name.replace(/\.pdf$/i, "");
    }
  }
}

function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      selectedFile.value = file;
      if (!createForm.value.topic) {
        createForm.value.topic = file.name.replace(/\.pdf$/i, "");
      }
    }
  }
}

// Start AI generation
async function startTestGeneration() {
  if (!createForm.value.topic.trim()) return;

  isGenerating.value = true;
  progressPercent.value = 10;
  progressStatus.value = "Tayyorlanmoqda...";

  try {
    let pdfText = "";
    if (selectedFile.value) {
      progressStatus.value = "PDF fayli o'qilmoqda...";
      const res = await extractTextFromPdf(selectedFile.value, (pct, status) => {
        progressPercent.value = pct;
        progressStatus.value = status;
      });
      pdfText = res.text;
    }

    progressStatus.value = "Gemini 3.8 Flash test savollarini tuzmoqda...";
    progressPercent.value = 80;

    const questions = await generateTestQuestionsWithAi({
      topic: createForm.value.topic,
      pdfText: pdfText,
      questionCount: createForm.value.questionCount,
      onProgress: (pct, status) => {
        progressPercent.value = pct;
        progressStatus.value = status;
      },
    });

    currentEditingBankId.value = null; // Yangi test
    editableQuestions.value = questions;
    launchForm.value.title = createForm.value.topic;
    launchForm.value.topic = createForm.value.topic;
    launchForm.value.group = createForm.value.group || "Barcha guruhlar";
    launchForm.value.cashPrize = "";
    launchForm.value.specialPerk = "";

    // Open Test Editor Modal immediately!
    showEditorModal.value = true;
  } catch (err: any) {
    alert("Xatolik: " + (err.message || "Test tuzishda xatolik yuz berdi."));
  } finally {
    isGenerating.value = false;
  }
}

// Editor actions
function addNewQuestion() {
  editableQuestions.value.push({
    id: `q_${Date.now()}`,
    question: "Yangi savol matni",
    options: ["Variant A", "Variant B", "Variant C", "Variant D"],
    correctAnswer: 0,
    explanation: "Darslikdagi to'g'ri izoh",
  });
}

function removeQuestion(index: number) {
  editableQuestions.value.splice(index, 1);
}

async function handleSaveToBank() {
  if (editableQuestions.value.length === 0) return;
  try {
    const title = createForm.value.topic || "Nomsiz test";
    const topic = createForm.value.topic || title;

    if (currentEditingBankId.value) {
      // Mavjud to'plamni yangilash (duplikat qilmasdan)
      await updateDraftTestBank(
        currentEditingBankId.value,
        title,
        topic,
        editableQuestions.value
      );
      alert("✅ Testlar bankidagi mavjud to'plam muvaffaqiyatli yangilandi!");
    } else {
      // Yangi to'plam yaratish
      const newId = await saveDraftTestBank(
        title,
        topic,
        editableQuestions.value
      );
      currentEditingBankId.value = newId;
      alert("✅ Testlar bankiga muvaffaqiyatli saqlandi!");
    }
    showEditorModal.value = false;
    activeTab.value = "bank";
    await loadAllData();
  } catch (e: any) {
    alert("Saqlashda xatolik: " + e.message);
  }
}

function openLaunchModalFromEditor() {
  showEditorModal.value = false;
  showLaunchModal.value = true;
}

function openLaunchModalFromBank(bank: DraftTestBank) {
  currentEditingBankId.value = bank.id;
  editableQuestions.value = [...bank.questions];
  launchForm.value.title = bank.title;
  launchForm.value.topic = bank.topic;
  launchForm.value.cashPrize = "";
  launchForm.value.specialPerk = "";
  showLaunchModal.value = true;
}

function openEditorFromBank(bank: DraftTestBank) {
  currentEditingBankId.value = bank.id;
  editableQuestions.value = JSON.parse(JSON.stringify(bank.questions));
  createForm.value.topic = bank.topic;
  showEditorModal.value = true;
}

async function handleDeleteBank(id: string) {
  if (confirm("Ushbu testlar to'plamini o'chirishni istaysizmi?")) {
    await deleteDraftTestBank(id);
    await loadAllData();
  }
}

// Launch Challenge
async function submitLaunchChallenge() {
  if (!launchForm.value.title.trim()) return;

  const deadlineMs = launchForm.value.deadlineString
    ? new Date(launchForm.value.deadlineString).getTime()
    : Date.now() + 24 * 3600 * 1000;

  if (deadlineMs <= Date.now()) {
    alert("Deadline vaqti kelajakdagi vaqt bo'lishi kerak!");
    return;
  }

  isLaunching.value = true;
  try {
    // Sanitize cash prize: agar 0, "0 so'm", bo'sh yoki "yo'q" bo'lsa, undefined qilinadi (0 so'm deb e'lon qilinmaydi)
    let finalCashPrize: string | undefined = undefined;
    const rawCash = (launchForm.value.cashPrize || "").trim();
    if (
      rawCash &&
      rawCash !== "0" &&
      rawCash !== "0 so'm" &&
      rawCash !== "0 som" &&
      !rawCash.toLowerCase().startsWith("yo'q") &&
      !rawCash.toLowerCase().startsWith("yoq")
    ) {
      if (/^\d+$/.test(rawCash)) {
        finalCashPrize = Number(rawCash).toLocaleString("ru-RU") + " so'm";
      } else {
        finalCashPrize = rawCash;
      }
    }

    // Sanitize special perk: agar bo'sh yoki "yo'q" bo'lsa, undefined qilinadi
    let finalPerk: string | undefined = undefined;
    const rawPerk = (launchForm.value.specialPerk || "").trim();
    if (rawPerk && !rawPerk.toLowerCase().startsWith("yo'q") && !rawPerk.toLowerCase().startsWith("yoq")) {
      finalPerk = rawPerk;
    }

    const cleanRewards: Record<string, any> = {
      coins: Number(launchForm.value.coins) || 0,
    };
    if (finalCashPrize) {
      cleanRewards.cashPrize = finalCashPrize;
    }
    if (finalPerk) {
      cleanRewards.specialPerk = finalPerk;
    }

    await createChallengeInFirebase({
      title: launchForm.value.title,
      topic: launchForm.value.topic || launchForm.value.title,
      group: launchForm.value.group || "Barcha guruhlar",
      deadline: deadlineMs,
      questions: editableQuestions.value,
      rewards: cleanRewards as any,
    });

    alert("🎉 Chellenj muvaffaqiyatli e'lon qilindi va Telegram guruhga yuborildi!");
    showLaunchModal.value = false;
    activeTab.value = "active";
    await loadAllData();
  } catch (e: any) {
    alert("Chellenj yaratishda xatolik: " + e.message);
  } finally {
    isLaunching.value = false;
  }
}

async function handleFinalizeChallenge(chal: Challenge) {
  if (confirm(`"${chal.title}" chellenjini yakunlab, g'oliblarni Telegram guruhga e'lon qilmoqchimisiz?`)) {
    try {
      const res = await finalizeChallengeInFirebase(chal.id);
      alert(`🏁 Chellenj yakunlandi! ${res.topParticipants.length} ta g'olib bot orqali e'lon qilindi.`);
      await loadAllData();
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    }
  }
}

async function handleSendTelegramReminder(chal: Challenge) {
  try {
    const deadlineDate = new Date(chal.deadline);
    const formattedDeadline = `${deadlineDate.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
    })}, ${deadlineDate.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    await notifyChallengeLaunched({
      title: chal.title,
      topic: chal.topic,
      group: chal.group,
      questionCount: chal.questions.length,
      deadlineFormatted: formattedDeadline,
      rewards: chal.rewards,
    });
    alert("📢 Guruhga xabarnoma qayta yuborildi!");
  } catch (e: any) {
    alert("Xatolik: " + e.message);
  }
}

async function handleDeleteChallenge(id: string) {
  if (confirm("Ushbu chellenjni o'chirishni istaysizmi?")) {
    await deleteChallengeFromFirebase(id);
    await loadAllData();
  }
}

// Helpers
function setDefaultDeadline(hours: number) {
  const d = new Date(Date.now() + hours * 3600 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  launchForm.value.deadlineString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function setQuickDeadline(opt: any) {
  if (opt === "today_22") {
    const d = new Date();
    d.setHours(22, 0, 0, 0);
    if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    launchForm.value.deadlineString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T22:00`;
  } else {
    setDefaultDeadline(Number(opt));
  }
}

function formatRemainingTime(deadline: number): string {
  const diff = deadline - Date.now();
  if (diff <= 0) return "Muddati tugadi";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} kun ${hours % 24} soat qoldi`;
  }
  return `${hours} soat ${mins} daqiqa qoldi`;
}

function formatDateTime(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleString("uz-UZ", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSeconds(secs: number): string {
  const m = Math.floor((secs || 0) / 60);
  const s = (secs || 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getParticipantCount(chal: Challenge): number {
  return chal.participants ? Object.keys(chal.participants).length : 0;
}

function getTopParticipants(chal: Challenge, limit = 3): ChallengeParticipant[] {
  if (!chal.participants) return [];
  const list = Object.values(chal.participants);
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });
  return list.slice(0, limit);
}

function getAllParticipants(chal: Challenge): ChallengeParticipant[] {
  if (!chal.participants) return [];
  const list = Object.values(chal.participants);
  list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });
  return list;
}

function openLeaderboardModal(chal: Challenge) {
  selectedChallengeForModal.value = chal;
  showLeaderboardModal.value = true;
}
</script>
