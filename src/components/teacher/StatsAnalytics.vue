<template>
  <div class="space-y-6 w-full mx-auto pb-12">
    <!-- Top Bar: Header, Back, Refresh, and PDF Export -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('back')"
          class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
          title="Ortga qaytish"
        >
          ⬅️
        </button>
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>📊</span> O'zlashtirish Tahlili & Statistika
          </h2>
          <p class="text-xs text-slate-400">Darslar, testlar va sun'iy intellekt tahlillari</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- AI Analyze Action Button (available in Lessons tab) -->
        <button
          v-if="activeStatsTab === 'lessons'"
          type="button"
          @click="runAiAnalysis"
          :disabled="analyzingAi || filteredRecords.length === 0"
          class="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 active:scale-95 disabled:opacity-40 transition-all"
        >
          <span class="text-base" :class="{ 'animate-spin': analyzingAi }">✨</span>
          <span>{{ analyzingAi ? "AI tahlil qilmoqda..." : "Gemini AI Tahlili" }}</span>
        </button>

        <button
          type="button"
          @click="fetchHistory(true)"
          :disabled="loading"
          class="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition"
          title="Ma'lumotlarni qayta yuklash"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
        </button>

        <!-- PDF Export Button -->
        <button
          type="button"
          @click="exportToPdf"
          :disabled="(activeStatsTab === 'lessons' ? filteredRecords.length === 0 : filteredTestSessions.length === 0) || loading"
          class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/30 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-40 transition-all"
        >
          <span>📄</span>
          <span>PDF Hisobot</span>
        </button>
      </div>
    </div>

    <!-- PRIMARY TAB NAVIGATION (Darslar vs Testlar Statistikasi) -->
    <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 w-fit backdrop-blur-xl shadow-lg">
      <button
        type="button"
        @click="switchStatsTab('lessons')"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all"
        :class="
          activeStatsTab === 'lessons'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-slate-400 hover:text-white'
        "
      >
        <span>🎮</span>
        <span>Darslar & Savol-Javob</span>
      </button>

      <button
        type="button"
        @click="switchStatsTab('tests')"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all"
        :class="
          activeStatsTab === 'tests'
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
            : 'text-slate-400 hover:text-white'
        "
      >
        <span>📝</span>
        <span>Testlar Statistikasi & Imtihonlar</span>
      </button>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 1: LESSONS & CLASSROOM ARENA ANALYTICS -->
    <!-- ======================================================== -->
    <div v-if="activeStatsTab === 'lessons'" class="space-y-6">
      <!-- Filters: Group, Book & Student Search -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- 1. Group Selector -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Guruhni tanlang:</label>
          <select
            v-model="selectedGroup"
            @change="updateCharts"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Barcha guruhlar</option>
            <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <!-- 2. Book Filter -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Darslik bo'yicha filter:</label>
          <select
            v-model="selectedBook"
            @change="updateCharts"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Barcha darsliklar</option>
            <option v-for="b in availableBooks" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <!-- 3. Student Search -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">O'quvchini qidirish:</label>
          <input
            v-model="searchQuery"
            @input="updateCharts"
            type="text"
            placeholder="🔍 Ism bo'yicha filter..."
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <!-- Executive KPI Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">O'rtacha O'zlashtirish</div>
          <div class="text-3xl font-black mt-1 tabular-nums" :class="avgScoreColor">
            {{ overallAvgScore }}%
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Sinf bo'yicha umumiy</div>
        </div>

        <div class="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jami Sinovlar</div>
          <div class="text-3xl font-black text-white mt-1 tabular-nums">
            {{ filteredRecords.length }} <span class="text-xs font-normal text-slate-400">ta</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">{{ uniqueStudentsCount }} nafar o'quvchi</div>
        </div>

        <div class="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eng Kuchli Mavzu</div>
          <div class="text-sm font-black text-emerald-300 mt-2 line-clamp-1">
            {{ topMasteryTopic.name }}
          </div>
          <div class="text-[10px] text-emerald-400/90 font-bold mt-0.5">{{ topMasteryTopic.score }}% natija 🏆</div>
        </div>

        <div class="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">E'tibor Talab Mavzu</div>
          <div class="text-sm font-black text-rose-300 mt-2 line-clamp-1">
            {{ lowestMasteryTopic.name }}
          </div>
          <div class="text-[10px] text-rose-400/90 font-bold mt-0.5">{{ lowestMasteryTopic.score }}% natija ⚠️</div>
        </div>
      </div>

      <!-- GEMINI AI PEDAGOGICAL ANALYSIS BANNER (IF ACTIVE) -->
      <div
        v-if="aiAnalysisResult"
        class="rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🤖</span>
            <div>
              <h3 class="text-base font-black text-white flex items-center gap-2">
                Gemini AI Pedagogik Tahlil Xulosasi
                <span class="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  PRO AI
                </span>
              </h3>
              <p class="text-[11px] text-slate-400">O'quvchilar ko'rsatkichlari asosida sun'iy intellekt xulosalari</p>
            </div>
          </div>
          <button
            @click="aiAnalysisResult = ''"
            class="rounded-xl bg-white/5 p-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-black/40 p-4 rounded-2xl border border-white/10">
          {{ aiAnalysisResult }}
        </div>
      </div>

      <!-- 3 INTERACTIVE CHARTS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 1. Mastery Trend Line Chart -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>📈</span> O'zlashtirish Dinamikasi (Trend)
            </h4>
            <span class="text-[11px] text-slate-500">Vaqt kesimida</span>
          </div>
          <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
            <canvas ref="trendChartRef"></canvas>
          </div>
        </div>

        <!-- 2. Grade Distribution Doughnut Chart -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>🎯</span> O'zlashtirish Darajalari Taqsimoti
            </h4>
            <span class="text-[11px] text-slate-500">Sinf balansi</span>
          </div>
          <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3 flex items-center justify-center">
            <canvas ref="distChartRef"></canvas>
          </div>
        </div>

        <!-- 3. Topic Mastery Bar Chart (Full Width) -->
        <div class="col-span-1 lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>📚</span> Darsliklar va Mavzular Bo'yicha O'zlashtirish Foizlari
            </h4>
            <span class="text-[11px] text-slate-500">Bo'shliqlarni aniqlash</span>
          </div>
          <div class="relative h-72 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
            <canvas ref="topicChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- STUDENT MASTERY LEADERBOARD TABLE -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between px-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span>🏆</span> O'quvchilarning O'zlashtirish Reyting Jadvali
          </h4>
          <span class="text-[11px] text-slate-400">
            Jami: <b>{{ studentRankingRows.length }}</b> nafar o'quvchi
          </span>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner custom-scrollbar">
          <table class="w-full text-center text-xs text-slate-200 border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
                <th class="px-3 py-3 text-left w-12">O'rin</th>
                <th class="px-3 py-3 text-left">O'quvchi F.I.O</th>
                <th class="px-3 py-3">Guruh</th>
                <th class="px-3 py-3">Sinovlar</th>
                <th class="px-3 py-3">Maksimal</th>
                <th class="px-3 py-3">Strikes ⭐</th>
                <th class="px-3 py-3 font-black text-white">O'rtacha Ball</th>
                <th class="px-3 py-3">Holat</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in studentRankingRows"
                :key="row.name"
                class="border-b border-white/5 hover:bg-white/5 transition"
              >
                <!-- Rank -->
                <td class="px-3 py-3 text-left font-black text-sm">
                  <span v-if="idx === 0">🥇 1</span>
                  <span v-else-if="idx === 1">🥈 2</span>
                  <span v-else-if="idx === 2">🥉 3</span>
                  <span v-else class="text-slate-400 text-xs">{{ idx + 1 }}</span>
                </td>

                <!-- Name -->
                <td class="px-3 py-3 text-left font-bold text-white whitespace-nowrap">
                  {{ row.name }}
                </td>

                <!-- Group -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {{ row.group }}
                  </span>
                </td>

                <!-- Tests count -->
                <td class="px-3 py-3 font-mono text-slate-300">
                  {{ row.testsCount }} ta
                </td>

                <!-- Max Score -->
                <td class="px-3 py-3 font-mono font-bold text-emerald-400">
                  {{ row.maxScore }}%
                </td>

                <!-- Strikes -->
                <td class="px-3 py-3 font-bold text-amber-400">
                  <span v-if="row.strikes > 0">⭐ {{ row.strikes }}</span>
                  <span v-else class="text-slate-600">-</span>
                </td>

                <!-- Avg Score -->
                <td class="px-3 py-3 font-black text-sm tabular-nums" :class="getScoreColor(row.avgScore)">
                  {{ row.avgScore }}%
                </td>

                <!-- Status Badge -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-black"
                    :class="
                      row.avgScore >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : row.avgScore >= 70
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : row.avgScore >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    "
                  >
                    {{ row.avgScore >= 90 ? 'A\'lo 🏆' : row.avgScore >= 70 ? 'Yaxshi 👍' : row.avgScore >= 50 ? 'O\'rtacha ⚠️' : 'Qoniqarsiz ❌' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- TAB 2: COMPREHENSIVE TEST ANALYTICS & EXAM HUB -->
    <!-- ======================================================== -->
    <div v-else-if="activeStatsTab === 'tests'" class="space-y-6">
      <!-- Test Filters: Group, Test Type, Book & Search -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 1. Group Selector -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Guruhni tanlang:</label>
          <select
            v-model="selectedTestGroup"
            @change="updateTestCharts"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Barcha guruhlar</option>
            <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <!-- 2. Test Type Filter -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">🏷️ Test turi:</label>
          <select
            v-model="selectedTestType"
            @change="updateTestCharts"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-amber-300 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Barcha test turlari</option>
            <option v-for="t in TEST_TYPES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- 3. Book Filter -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">📚 Darslik:</label>
          <select
            v-model="selectedTestBook"
            @change="updateTestCharts"
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">Barcha darsliklar</option>
            <option v-for="b in BOOK_LIST" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <!-- 4. Search Query -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3.5 shadow-xl backdrop-blur-xl flex flex-col justify-center">
          <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">🔍 Qidirish:</label>
          <input
            v-model="testSearchQuery"
            @input="updateTestCharts"
            type="text"
            placeholder="Mavzu yoki o'quvchi..."
            class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <!-- Test KPI Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- 1. Total Tests -->
        <div class="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-purple-300 uppercase tracking-wider">O'tkazilgan Testlar</div>
          <div class="text-3xl font-black text-white mt-1 tabular-nums">
            {{ filteredTestSessions.length }} <span class="text-xs font-normal text-slate-400">ta</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Barcha sinovlar</div>
        </div>

        <!-- 2. Avg Accuracy -->
        <div class="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-blue-300 uppercase tracking-wider">O'rtacha Aniqlik</div>
          <div class="text-3xl font-black mt-1 tabular-nums" :class="getScoreColor(overallTestAvgAccuracy)">
            {{ overallTestAvgAccuracy }}%
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Testlar bo'yicha</div>
        </div>

        <!-- 3. Top Record -->
        <div class="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Eng Yuqori Natija</div>
          <div class="text-2xl font-black text-emerald-300 mt-1 tabular-nums">
            {{ topTestRecord.score }}%
          </div>
          <div class="text-[10px] text-emerald-400/90 font-bold mt-0.5 truncate">
            🏆 {{ topTestRecord.student }}
          </div>
        </div>

        <!-- 4. Active Test Takers -->
        <div class="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-4 text-center shadow-lg">
          <div class="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Faol Topshiruvchilar</div>
          <div class="text-3xl font-black text-amber-300 mt-1 tabular-nums">
            {{ uniqueTestTakersCount }} <span class="text-xs font-normal text-slate-400">nafar</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">Jami o'quvchilar</div>
        </div>
      </div>

      <!-- TEST CHARTS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Chart 1: Test Trend Line Chart (2 Cols) -->
        <div class="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span>📈</span> Testlar O'zlashtirish Dinamikasi (Trend)
            </h4>
            <span class="text-[11px] text-slate-500">O'rtacha foizlar dinamikasi</span>
          </div>
          <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
            <canvas ref="testTrendChartRef"></canvas>
          </div>
        </div>

        <!-- Chart 2: Grade Distribution Doughnut Chart (1 Col) -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>🎯</span> Test Baholari Taqsimoti
            </h4>
            <span class="text-[11px] text-slate-500">Sinf balansi</span>
          </div>
          <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3 flex items-center justify-center">
            <canvas ref="testDistChartRef"></canvas>
          </div>
        </div>

        <!-- Chart 3: Test Types Comparison Bar Chart (Full Width) -->
        <div class="col-span-1 lg:col-span-3 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>📊</span> Test Turlari Bo'yicha O'rtacha Ko'rsatkichlar Taqqoslanishi
            </h4>
            <span class="text-[11px] text-slate-500">5 ta rasmiy test turi</span>
          </div>
          <div class="relative h-64 w-full rounded-2xl border border-white/10 bg-black/40 p-3">
            <canvas ref="testTypeChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- TABLE 1: ALL CONDUCTED TESTS LIST -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between px-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <span>📝</span> O'tkazilgan Barcha Testlar Ro'yxati
          </h4>
          <span class="text-[11px] text-slate-400">
            Jami: <b>{{ filteredTestSessions.length }}</b> ta test
          </span>
        </div>

        <div v-if="filteredTestSessions.length === 0" class="py-10 text-center text-xs text-slate-400">
          Ushbu parametrlar bo'yicha o'tkazilgan testlar topilmadi.
        </div>

        <div v-else class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner custom-scrollbar">
          <table class="w-full text-center text-xs text-slate-200 border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
                <th class="px-3 py-3 text-left w-10">№</th>
                <th class="px-3 py-3 text-left">Sana</th>
                <th class="px-3 py-3">Guruh</th>
                <th class="px-3 py-3 text-left">Test Mavzusi</th>
                <th class="px-3 py-3">Darslik</th>
                <th class="px-3 py-3">Test Turi</th>
                <th class="px-3 py-3">Savollar</th>
                <th class="px-3 py-3">Qatnashdi</th>
                <th class="px-3 py-3 font-black text-white">O'rtacha %</th>
                <th class="px-3 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, idx) in filteredTestSessions"
                :key="s.id"
                class="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                @click="openTestDetail(s)"
              >
                <!-- Index -->
                <td class="px-3 py-3 text-left font-mono text-slate-500">{{ idx + 1 }}</td>

                <!-- Date -->
                <td class="px-3 py-3 text-left font-bold text-white whitespace-nowrap">
                  📅 {{ normalizeDateToDDMM(s.date) }}
                </td>

                <!-- Group -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {{ s.group }}
                  </span>
                </td>

                <!-- Topic -->
                <td class="px-3 py-3 text-left font-bold text-white max-w-xs truncate" :title="s.topic">
                  {{ s.topic || "Mavzulashgan Test" }}
                </td>

                <!-- Book -->
                <td class="px-3 py-3 whitespace-nowrap text-cyan-300 font-mono text-[11px]">
                  {{ s.book || "Umumiy" }}
                </td>

                <!-- Type -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-bold border"
                    :class="
                      s.mode === 'DTM'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : s.mode === 'MOCK'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : s.mode === 'Oylik imtihon'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : s.mode === 'Konkurs test'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    "
                  >
                    {{ s.mode || "Mavzulashgan" }}
                  </span>
                </td>

                <!-- Max Questions -->
                <td class="px-3 py-3 font-mono text-slate-300">
                  {{ s.maxQuestions || 30 }} ta
                </td>

                <!-- Participants Count -->
                <td class="px-3 py-3 font-mono text-slate-400">
                  {{ (s.studentResults || []).filter(r => r.attStatus !== 'Sababsiz' && r.attStatus !== 'Sababli').length }} nafar
                </td>

                <!-- Avg Percent -->
                <td class="px-3 py-3 font-black text-sm tabular-nums" :class="getScoreColor(s.avgPercent)">
                  {{ s.avgPercent }}%
                </td>

                <!-- Actions -->
                <td class="px-3 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    @click.stop="openTestDetail(s)"
                    class="rounded-xl border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-[11px] font-bold text-purple-300 hover:bg-purple-500/30 active:scale-95 transition"
                  >
                    👁️ Natijalar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TABLE 2: STUDENTS TEST RANKINGS -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
        <div class="flex items-center justify-between px-1">
          <h4 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>🏆</span> O'quvchilarning Testlar Bo'yicha Reytingi
          </h4>
          <span class="text-[11px] text-slate-400">
            Jami: <b>{{ studentTestRankings.length }}</b> nafar o'quvchi
          </span>
        </div>

        <div v-if="studentTestRankings.length === 0" class="py-10 text-center text-xs text-slate-400">
          Hozircha test topshirgan o'quvchilar ma'lumotlari mavjud emas.
        </div>

        <div v-else class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner custom-scrollbar">
          <table class="w-full text-center text-xs text-slate-200 border-collapse">
            <thead>
              <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
                <th class="px-3 py-3 text-left w-12">O'rin</th>
                <th class="px-3 py-3 text-left">O'quvchi F.I.O</th>
                <th class="px-3 py-3">Guruh</th>
                <th class="px-3 py-3">Topshirgan Testlar</th>
                <th class="px-3 py-3">Maksimal Natija</th>
                <th class="px-3 py-3">Yig'ilgan Tangalar</th>
                <th class="px-3 py-3 font-black text-white">O'rtacha Aniqlik</th>
                <th class="px-3 py-3">Darajasi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(st, idx) in studentTestRankings"
                :key="st.name"
                class="border-b border-white/5 hover:bg-white/5 transition"
              >
                <!-- Rank -->
                <td class="px-3 py-3 text-left font-black text-sm">
                  <span v-if="idx === 0">🥇 1</span>
                  <span v-else-if="idx === 1">🥈 2</span>
                  <span v-else-if="idx === 2">🥉 3</span>
                  <span v-else class="text-slate-400 text-xs">{{ idx + 1 }}</span>
                </td>

                <!-- Name -->
                <td class="px-3 py-3 text-left font-bold text-white whitespace-nowrap">
                  {{ st.name }}
                </td>

                <!-- Group -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    {{ st.group }}
                  </span>
                </td>

                <!-- Tests Count -->
                <td class="px-3 py-3 font-mono text-slate-300">
                  {{ st.testsCount }} ta
                </td>

                <!-- Max Score -->
                <td class="px-3 py-3 font-mono font-bold text-emerald-400">
                  {{ st.maxScore }}%
                </td>

                <!-- Coins -->
                <td class="px-3 py-3 font-bold text-amber-400">
                  +{{ st.totalCoins }} 🪙
                </td>

                <!-- Avg Accuracy -->
                <td class="px-3 py-3 font-black text-sm tabular-nums" :class="getScoreColor(st.avgAccuracy)">
                  {{ st.avgAccuracy }}%
                </td>

                <!-- Badge -->
                <td class="px-3 py-3 whitespace-nowrap">
                  <span
                    class="rounded-full px-2.5 py-0.5 text-[10px] font-black"
                    :class="
                      st.avgAccuracy >= 90
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : st.avgAccuracy >= 70
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : st.avgAccuracy >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    "
                  >
                    {{ st.avgAccuracy >= 90 ? 'A\'lo 🏆' : st.avgAccuracy >= 70 ? 'Yaxshi 👍' : st.avgAccuracy >= 50 ? 'O\'rtacha ⚠️' : 'Qoniqarsiz ❌' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- MODAL: DETAILED TEST RESULTS VIEWER -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showTestDetailModal"
      :title="selectedTestSession ? `📝 ${selectedTestSession.topic || 'Test Natijalari'}` : 'Test Tafsilotlari'"
    >
      <div v-if="selectedTestSession" class="space-y-4">
        <!-- Test Info Pill Matrix -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-black/40 p-3 text-xs">
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Guruh:</span>
            <span class="font-bold text-white">{{ selectedTestSession.group }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Sana:</span>
            <span class="font-bold text-purple-300">📅 {{ normalizeDateToDDMM(selectedTestSession.date) }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Test Turi:</span>
            <span class="font-bold text-amber-300">{{ selectedTestSession.mode || "Mavzulashgan" }}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 block uppercase">Darslik:</span>
            <span class="font-bold text-cyan-300">{{ selectedTestSession.book || "Umumiy" }}</span>
          </div>
        </div>

        <!-- Student Results Table in Modal -->
        <div class="rounded-2xl border border-white/10 bg-slate-950 overflow-hidden">
          <div class="overflow-x-auto max-h-72 custom-scrollbar">
            <table class="w-full text-center text-xs text-slate-200 border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-[10px] font-black text-slate-400 bg-white/5">
                  <th class="px-3 py-2 text-left">№</th>
                  <th class="px-3 py-2 text-left">O'quvchi F.I.O</th>
                  <th class="px-3 py-2">Davomat</th>
                  <th class="px-3 py-2">Ball</th>
                  <th class="px-3 py-2">Foiz %</th>
                  <th class="px-3 py-2 text-right">Tangalar</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, idx) in [...(selectedTestSession.studentResults || [])].sort((a, b) => (b.percent || 0) - (a.percent || 0))"
                  :key="r.name"
                  class="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td class="px-3 py-2 text-left font-mono text-slate-500">{{ idx + 1 }}</td>
                  <td class="px-3 py-2 text-left font-bold text-white">{{ r.name }}</td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span
                      class="rounded-md px-2 py-0.5 text-[10px] font-bold"
                      :class="
                        r.attStatus === 'Sababsiz'
                          ? 'bg-red-500/20 text-red-300'
                          : r.attStatus === 'Sababli'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      "
                    >
                      {{ r.attStatus || "Keldi" }}
                    </span>
                  </td>
                  <td class="px-3 py-2 font-mono font-bold text-amber-300">
                    {{ r.correct }}/{{ selectedTestSession.maxQuestions || 30 }}
                  </td>
                  <td class="px-3 py-2 font-black tabular-nums" :class="getScoreColor(r.percent)">
                    {{ r.percent }}%
                  </td>
                  <td class="px-3 py-2 text-right font-bold text-amber-400">
                    <span v-if="r.coins">+{{ r.coins }} 🪙</span>
                    <span v-else class="text-slate-600">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="copySelectedTestTelegram"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition"
        >
          📋 Matnni nusxalash
        </button>
        <button
          type="button"
          @click="showTestDetailModal = false"
          class="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 active:scale-95 transition"
        >
          Yopish
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { callApi } from "../../services/api";
import { useTeacherStore, BOOK_LIST, TEST_TYPES, LessonSessionRecord, normalizeDateToDDMM } from "../../composables/useTeacherStore";
import BaseModal from "../common/BaseModal.vue";

Chart.register(...registerables);

defineEmits<{
  (e: "back"): void;
}>();

const teacherStore = useTeacherStore();

// Navigation tab state
const activeStatsTab = ref<"lessons" | "tests">("lessons");

function switchStatsTab(tab: "lessons" | "tests") {
  activeStatsTab.value = tab;
  nextTick(() => {
    if (tab === "lessons") {
      updateCharts();
    } else {
      updateTestCharts();
    }
  });
}

interface HistoryRecord {
  date: string;
  name: string;
  percent: number | string;
  group?: string;
  book?: string;
  topic?: string;
  strike?: number;
}

const loading = ref(false);
const rawHistory = ref<HistoryRecord[]>([]);
const groupsDict = ref<Record<string, string[]>>({});
const selectedGroup = ref("all");
const selectedBook = ref("all");
const searchQuery = ref("");

// AI State
const analyzingAi = ref(false);
const aiAnalysisResult = ref("");

// Chart references & instances for Lessons
const trendChartRef = ref<HTMLCanvasElement | null>(null);
const distChartRef = ref<HTMLCanvasElement | null>(null);
const topicChartRef = ref<HTMLCanvasElement | null>(null);

let trendChart: Chart | null = null;
let distChart: Chart | null = null;
let topicChart: Chart | null = null;

// ========================================================
// TEST ANALYTICS STATE & REFS
// ========================================================
const selectedTestGroup = ref("all");
const selectedTestType = ref("all");
const selectedTestBook = ref("all");
const testSearchQuery = ref("");

const testTrendChartRef = ref<HTMLCanvasElement | null>(null);
const testDistChartRef = ref<HTMLCanvasElement | null>(null);
const testTypeChartRef = ref<HTMLCanvasElement | null>(null);

let testTrendChart: Chart | null = null;
let testDistChart: Chart | null = null;
let testTypeChart: Chart | null = null;

const showTestDetailModal = ref(false);
const selectedTestSession = ref<LessonSessionRecord | null>(null);

onMounted(async () => {
  await fetchHistory();
});

async function fetchHistory(forceRefresh = false) {
  loading.value = true;
  try {
    const [resHist, resGroups] = await Promise.all([
      callApi("get_history", {}, { forceRefresh }),
      callApi("get_student_list", {}, { forceRefresh }),
    ]);

    if (resHist.status === "success" && resHist.history) {
      rawHistory.value = resHist.history;
    }
    if (resGroups.status === "success" && resGroups.groups) {
      groupsDict.value = resGroups.groups;
    }
  } catch (e) {
    console.error("fetchHistory error:", e);
  } finally {
    loading.value = false;
    nextTick(() => {
      if (activeStatsTab.value === "lessons") {
        updateCharts();
      } else {
        updateTestCharts();
      }
    });
  }
}

// Map student to their group
const studentGroupMap = computed(() => {
  const map: Record<string, string> = {};
  for (const [grp, members] of Object.entries(groupsDict.value)) {
    if (Array.isArray(members)) {
      members.forEach((m) => {
        map[m.toLowerCase().trim()] = grp;
      });
    }
  }
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.name && s.group) {
      map[s.name.toLowerCase().trim()] = s.group;
    }
  });
  return map;
});

const availableGroups = computed(() => {
  const set = new Set<string>();
  Object.keys(groupsDict.value).forEach((g) => {
    if (g !== "Arxiv" && !g.toLowerCase().includes("arxiv")) set.add(g.trim());
  });
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.group && s.group !== "Arxiv" && !s.group.toLowerCase().includes("arxiv")) {
      set.add(s.group.trim());
    }
  });
  return Array.from(set).sort();
});

const availableBooks = computed(() => {
  const set = new Set<string>();
  rawHistory.value.forEach((r) => {
    if (r.book && r.book.trim()) set.add(r.book.trim());
  });
  BOOK_LIST.forEach((b) => set.add(b));
  return Array.from(set).sort();
});

// Filtered Records for Lessons
const filteredRecords = computed(() => {
  return rawHistory.value.filter((r) => {
    const sGroup = studentGroupMap.value[r.name.toLowerCase().trim()] || r.group || "Umumiy";
    if (selectedGroup.value !== "all" && sGroup !== selectedGroup.value) return false;
    if (selectedBook.value !== "all" && (r.book || "").trim() !== selectedBook.value) return false;
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      if (!r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
});

const overallAvgScore = computed(() => {
  if (filteredRecords.value.length === 0) return 0;
  const sum = filteredRecords.value.reduce(
    (acc, r) => acc + (parseFloat(String(r.percent)) || 0),
    0
  );
  return Math.round(sum / filteredRecords.value.length);
});

const avgScoreColor = computed(() => getScoreColor(overallAvgScore.value));

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

const uniqueStudentsCount = computed(() => {
  const set = new Set(filteredRecords.value.map((r) => r.name.toLowerCase().trim()));
  return set.size;
});

// Topic mastery map
const topicMasteryList = computed(() => {
  const map: Record<string, { sum: number; count: number }> = {};
  filteredRecords.value.forEach((r) => {
    const key = (r.topic || r.book || "Umumiy dars").trim();
    if (!map[key]) map[key] = { sum: 0, count: 0 };
    map[key].sum += parseFloat(String(r.percent)) || 0;
    map[key].count++;
  });

  return Object.entries(map)
    .map(([name, data]) => ({
      name,
      score: Math.round(data.sum / data.count),
      count: data.count,
    }))
    .sort((a, b) => b.score - a.score);
});

const topMasteryTopic = computed(() => {
  if (topicMasteryList.value.length === 0) return { name: "Ma'lumot yo'q", score: 0 };
  return topicMasteryList.value[0];
});

const lowestMasteryTopic = computed(() => {
  if (topicMasteryList.value.length === 0) return { name: "Ma'lumot yo'q", score: 0 };
  return topicMasteryList.value[topicMasteryList.value.length - 1];
});

// Student Rankings for Lessons
interface StudentRankRow {
  name: string;
  group: string;
  testsCount: number;
  avgScore: number;
  maxScore: number;
  strikes: number;
}

const studentRankingRows = computed<StudentRankRow[]>(() => {
  const map: Record<string, { group: string; count: number; sum: number; max: number; strikes: number }> = {};
  filteredRecords.value.forEach((r) => {
    const key = r.name.trim();
    if (!map[key]) {
      const g = studentGroupMap.value[key.toLowerCase()] || r.group || "Umumiy";
      map[key] = { group: g, count: 0, sum: 0, max: 0, strikes: 0 };
    }
    const p = parseFloat(String(r.percent)) || 0;
    map[key].count++;
    map[key].sum += p;
    if (p > map[key].max) map[key].max = p;
    map[key].strikes += parseInt(String(r.strike)) || 0;
  });

  return Object.entries(map)
    .map(([name, data]) => ({
      name,
      group: data.group,
      testsCount: data.count,
      avgScore: Math.round(data.sum / data.count),
      maxScore: Math.round(data.max),
      strikes: data.strikes,
    }))
    .sort((a, b) => b.avgScore - a.avgScore || b.testsCount - a.testsCount);
});

// Render Lesson Charts
function updateCharts() {
  if (activeStatsTab.value !== "lessons") return;
  const records = [...filteredRecords.value].reverse();

  // 1. Trend Line Chart
  if (trendChartRef.value) {
    if (trendChart) trendChart.destroy();
    const groupedDates: Record<string, { sum: number; count: number }> = {};
    records.forEach((r) => {
      const d = normalizeDateToDDMM(r.date);
      if (!groupedDates[d]) groupedDates[d] = { sum: 0, count: 0 };
      groupedDates[d].sum += parseFloat(String(r.percent)) || 0;
      groupedDates[d].count++;
    });

    const labels = Object.keys(groupedDates);
    const data = labels.map((d) => Math.round(groupedDates[d].sum / groupedDates[d].count));

    trendChart = new Chart(trendChartRef.value, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "O'rtacha Ball (%)",
            data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: "#60a5fa",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", autoSkip: true, maxTicksLimit: 10 },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  // 2. Grade Distribution Doughnut Chart
  if (distChartRef.value) {
    if (distChart) distChart.destroy();
    let excellent = 0, good = 0, satisfactory = 0, low = 0;
    records.forEach((r) => {
      const p = parseFloat(String(r.percent)) || 0;
      if (p >= 85) excellent++;
      else if (p >= 70) good++;
      else if (p >= 50) satisfactory++;
      else low++;
    });

    distChart = new Chart(distChartRef.value, {
      type: "doughnut",
      data: {
        labels: ["A'lo (85-100%)", "Yaxshi (70-84%)", "Qoniqarli (50-69%)", "Qoniqarsiz (<50%)"],
        datasets: [
          {
            data: [excellent, good, satisfactory, low],
            backgroundColor: [
              "rgba(16, 185, 129, 0.85)",
              "rgba(59, 130, 246, 0.85)",
              "rgba(245, 158, 11, 0.85)",
              "rgba(239, 68, 68, 0.85)",
            ],
            borderColor: "#0f172a",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", font: { size: 10 } },
          },
        },
      },
    });
  }

  // 3. Topic Mastery Bar Chart
  if (topicChartRef.value) {
    if (topicChart) topicChart.destroy();
    const topics = topicMasteryList.value.slice(0, 10);
    topicChart = new Chart(topicChartRef.value, {
      type: "bar",
      data: {
        labels: topics.map((t) => t.name),
        datasets: [
          {
            label: "O'zlashtirish (%)",
            data: topics.map((t) => t.score),
            backgroundColor: topics.map((t) =>
              t.score >= 80 ? "rgba(16, 185, 129, 0.7)" : t.score >= 60 ? "rgba(245, 158, 11, 0.7)" : "rgba(239, 68, 68, 0.7)"
            ),
            borderColor: topics.map((t) =>
              t.score >= 80 ? "#10b981" : t.score >= 60 ? "#f59e0b" : "#ef4444"
            ),
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#cbd5e1", autoSkip: false },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  }
}

// ========================================================
// TEST ANALYTICS LOGIC & COMPUTED METRICS
// ========================================================
const allTestSessions = computed(() => {
  return teacherStore.lessonSessions.value.filter((s) => {
    const m = (s.mode || "").toLowerCase();
    const t = (s.topic || "").toLowerCase();
    return (
      m === "manual_test" ||
      m.includes("test") ||
      m.includes("dtm") ||
      m.includes("mock") ||
      m.includes("imtihon") ||
      m.includes("konkurs") ||
      t.includes("test") ||
      t.includes("dtm") ||
      t.includes("mock") ||
      t.includes("imtihon")
    );
  });
});

const filteredTestSessions = computed(() => {
  let list = allTestSessions.value;
  if (selectedTestGroup.value !== "all") {
    list = list.filter((s) => s.group === selectedTestGroup.value);
  }
  if (selectedTestType.value !== "all") {
    list = list.filter((s) => (s.mode || "").toLowerCase() === selectedTestType.value.toLowerCase());
  }
  if (selectedTestBook.value !== "all") {
    list = list.filter((s) => (s.book || "").toLowerCase().includes(selectedTestBook.value.toLowerCase()));
  }
  if (testSearchQuery.value.trim()) {
    const q = testSearchQuery.value.trim().toLowerCase();
    list = list.filter(
      (s) =>
        (s.topic || "").toLowerCase().includes(q) ||
        (s.group || "").toLowerCase().includes(q) ||
        (s.book || "").toLowerCase().includes(q) ||
        (s.studentResults || []).some((r) => r.name?.toLowerCase().includes(q))
    );
  }
  return [...list].sort((a, b) => (b.date > a.date ? 1 : -1));
});

const overallTestAvgAccuracy = computed(() => {
  if (filteredTestSessions.value.length === 0) return 0;
  const sum = filteredTestSessions.value.reduce((acc, s) => acc + (s.avgPercent || 0), 0);
  return Math.round(sum / filteredTestSessions.value.length);
});

const topTestRecord = computed(() => {
  let maxP = 0;
  let topStudent = "Mavjud emas";
  filteredTestSessions.value.forEach((s) => {
    (s.studentResults || []).forEach((r) => {
      const p = parseFloat(String(r.percent)) || 0;
      if (p > maxP) {
        maxP = p;
        topStudent = r.name;
      }
    });
  });
  return { score: maxP, student: topStudent };
});

const uniqueTestTakersCount = computed(() => {
  const set = new Set<string>();
  filteredTestSessions.value.forEach((s) => {
    (s.studentResults || []).forEach((r) => {
      if (r.name) set.add(r.name.toLowerCase().trim());
    });
  });
  return set.size;
});

interface StudentTestRanking {
  name: string;
  group: string;
  testsCount: number;
  avgAccuracy: number;
  maxScore: number;
  totalCoins: number;
}

const studentTestRankings = computed<StudentTestRanking[]>(() => {
  const map: Record<string, { group: string; count: number; sumPercent: number; maxScore: number; coins: number }> = {};
  const sessions = filteredTestSessions.value;

  sessions.forEach((s) => {
    (s.studentResults || []).forEach((r) => {
      if (!r.name) return;
      const key = r.name.trim();
      const isPresent = r.attStatus !== "Sababsiz" && r.attStatus !== "Sababli";
      if (!isPresent) return;

      if (!map[key]) {
        const reg = teacherStore.allStudentsRegistry.value.find((item) => item.name.toLowerCase().trim() === key.toLowerCase());
        map[key] = {
          group: reg?.group || s.group || "Umumiy",
          count: 0,
          sumPercent: 0,
          maxScore: 0,
          coins: 0,
        };
      }
      const p = parseFloat(String(r.percent)) || 0;
      map[key].count++;
      map[key].sumPercent += p;
      if (p > map[key].maxScore) map[key].maxScore = p;
      map[key].coins += r.coins || (p >= 80 ? 20 : 5);
    });
  });

  return Object.entries(map)
    .map(([name, data]) => ({
      name,
      group: data.group,
      testsCount: data.count,
      avgAccuracy: data.count > 0 ? Math.round(data.sumPercent / data.count) : 0,
      maxScore: Math.round(data.maxScore),
      totalCoins: data.coins,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy || b.testsCount - a.testsCount);
});

// Render Test Analytics Charts
function updateTestCharts() {
  if (activeStatsTab.value !== "tests") return;
  const sessions = [...filteredTestSessions.value].reverse();

  // 1. Test Trend Line Chart
  if (testTrendChartRef.value) {
    if (testTrendChart) testTrendChart.destroy();
    const labels = sessions.map((s) => `${normalizeDateToDDMM(s.date)} • ${(s.topic || s.mode).slice(0, 15)}`);
    const data = sessions.map((s) => s.avgPercent || 0);

    testTrendChart = new Chart(testTrendChartRef.value, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "O'rtacha Aniqlik (%)",
            data,
            borderColor: "#c084fc",
            backgroundColor: "rgba(192, 132, 252, 0.15)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: "#e879f9",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", autoSkip: true, maxTicksLimit: 12 },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#e879f9",
            borderColor: "rgba(192, 132, 252, 0.3)",
            borderWidth: 1,
            callbacks: {
              label: (item) => `O'rtacha ball: ${item.formattedValue}%`,
            },
          },
        },
      },
    });
  }

  // 2. Test Types Bar Chart
  if (testTypeChartRef.value) {
    if (testTypeChart) testTypeChart.destroy();
    const types = [...TEST_TYPES];
    const typeAvgScores = types.map((t) => {
      const matched = sessions.filter((s) => (s.mode || "").toLowerCase() === t.toLowerCase());
      if (matched.length === 0) return 0;
      const sum = matched.reduce((a, b) => a + (b.avgPercent || 0), 0);
      return Math.round(sum / matched.length);
    });

    testTypeChart = new Chart(testTypeChartRef.value, {
      type: "bar",
      data: {
        labels: types,
        datasets: [
          {
            label: "O'rtacha Natija (%)",
            data: typeAvgScores,
            backgroundColor: [
              "rgba(59, 130, 246, 0.75)",
              "rgba(168, 85, 247, 0.75)",
              "rgba(234, 179, 8, 0.75)",
              "rgba(16, 185, 129, 0.75)",
              "rgba(244, 63, 94, 0.75)",
            ],
            borderColor: [
              "#3b82f6",
              "#a855f7",
              "#eab308",
              "#10b981",
              "#f43f5e",
            ],
            borderWidth: 1.5,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: "rgba(255, 255, 255, 0.06)" },
            ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#cbd5e1", font: { weight: "bold" } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `O'rtacha: ${item.formattedValue}%`,
            },
          },
        },
      },
    });
  }

  // 3. Score Distribution Doughnut Chart
  if (testDistChartRef.value) {
    if (testDistChart) testDistChart.destroy();
    let excellent = 0, good = 0, satisfactory = 0, low = 0;

    sessions.forEach((s) => {
      (s.studentResults || []).forEach((r) => {
        if (r.attStatus === "Sababsiz" || r.attStatus === "Sababli") return;
        const p = parseFloat(String(r.percent)) || 0;
        if (p >= 90) excellent++;
        else if (p >= 70) good++;
        else if (p >= 50) satisfactory++;
        else low++;
      });
    });

    testDistChart = new Chart(testDistChartRef.value, {
      type: "doughnut",
      data: {
        labels: ["A'lo (90-100%)", "Yaxshi (70-89%)", "O'rtacha (50-69%)", "Qoniqarsiz (<50%)"],
        datasets: [
          {
            data: [excellent, good, satisfactory, low],
            backgroundColor: [
              "rgba(16, 185, 129, 0.85)",
              "rgba(59, 130, 246, 0.85)",
              "rgba(234, 179, 8, 0.85)",
              "rgba(239, 68, 68, 0.85)",
            ],
            borderColor: "#0f172a",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#cbd5e1", font: { size: 10 } },
          },
        },
      },
    });
  }
}

// Modal functions
function openTestDetail(session: LessonSessionRecord) {
  selectedTestSession.value = session;
  showTestDetailModal.value = true;
}

function copySelectedTestTelegram() {
  if (!selectedTestSession.value) return;
  const s = selectedTestSession.value;
  let text = `📝 <b>«${s.group}» — ${s.topic}</b>\n`;
  text += `🏷️ Test turi: <b>${s.mode}</b> | 📚 Darslik: <b>${s.book}</b>\n`;
  text += `🎯 Maks: <b>${s.maxQuestions} ta</b> | 📅 Sana: <b>${normalizeDateToDDMM(s.date)}</b>\n\n`;

  const results = [...(s.studentResults || [])].sort((a, b) => (b.percent || 0) - (a.percent || 0));
  results.forEach((r, idx) => {
    const num = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
    text += `${num} <b>${r.name}</b>: ${r.correct}/${s.maxQuestions} (${r.percent}%)\n`;
  });

  text += `\n🌐 <b>history-pro.uz</b>`;
  navigator.clipboard.writeText(text);
  alert("Test natijalari matni nusxalandi!");
}

// AI Pedagogical Analysis in Lessons Tab
async function runAiAnalysis() {
  if (filteredRecords.value.length === 0) return;
  analyzingAi.value = true;
  aiAnalysisResult.value = "";

  const groupName = selectedGroup.value === "all" ? "Barcha guruhlar" : selectedGroup.value;
  const topStudents = studentRankingRows.value.slice(0, 3).map((s) => `${s.name} (${s.avgScore}%)`).join(", ");
  const needAttention = studentRankingRows.value.filter((s) => s.avgScore < 60).slice(0, 3).map((s) => `${s.name} (${s.avgScore}%)`).join(", ");

  const prompt = `Sen tajribali Pedagog va Ta'lim Tahlilchisisan. Tarix fani o'qituvchisiga quyidagi sinf o'zlashtirish ma'lumotlari bo'yicha professional xulosa va tavsiyalar ber:
Guruh: ${groupName}
Jami sinovlar: ${filteredRecords.value.length} ta
O'rtacha o'zlashtirish: ${overallAvgScore.value}%
Eng kuchli mavzu: ${topMasteryTopic.value.name} (${topMasteryTopic.value.score}%)
E'tibor talab mavzu: ${lowestMasteryTopic.value.name} (${lowestMasteryTopic.value.score}%)
Yetakchi o'quvchilar: ${topStudents || "Mavjud emas"}
Yordamga muhtoj o'quvchilar: ${needAttention || "Mavjud emas"}

Iltimos, javobni quyidagi 3 ta aniq bo'limda taqdim et:
1. 🎯 SINF BO'YICHA UMUMIY PEDAGOGIK XULOSA
2. 💡 DARS SAMARADORLIGINI OSHIRISH BO'YICHA 3 TA ANIQ TAVSIYA
3. 👤 ALOHIDA O'QUVCHILAR BILAN ISHLASH YO'NALISHLARI`;

  try {
    const res = await callApi("ask_ai", { prompt });
    if (res.status === "success" && res.answer) {
      aiAnalysisResult.value = res.answer;
    } else {
      aiAnalysisResult.value = generateFallbackAiReport(groupName, topStudents, needAttention);
    }
  } catch (e) {
    aiAnalysisResult.value = generateFallbackAiReport(groupName, topStudents, needAttention);
  } finally {
    analyzingAi.value = false;
  }
}

function generateFallbackAiReport(groupName: string, topStudents: string, needAttention: string): string {
  return `🎯 SINF BO'YICHA UMUMIY PEDAGOGIK XULOSA:
«${groupName}» guruhida umumiy o'zlashtirish darajasi ${overallAvgScore.value}% ni tashkil qilmoqda. O'quvchilar ${topMasteryTopic.value.name} mavzusini a'lo darajada o'zlashtirgan bo'lsa-da, ${lowestMasteryTopic.value.name} mavzusida qo'shimcha tahlilga ehtiyoj sezilmoqda.

💡 DARS SAMARADORLIGINI OSHIRISH BO'YICHA 3 TA ANIQ TAVSIYA:
1. Qiyin mavzular bo'yicha vizual xaritalar va xronologik jadvallardan faolroq foydalanish.
2. Savol-javob o'yinlarida jamoaviy duel rejimlarini qo'llash orqali faollikni oshirish.
3. Uyga beriladigan test topshiriqlarida zaif mavzular bo'yicha takrorlash savollarini qo'shish.

👤 ALOHIDA O'QUVCHILAR BILAN ISHLASH:
• Yetakchilar (${topStudents || "A'lochi o'quvchilar"}): Murakkabroq tahliliy topshiriqlar va olimpiada darajasidagi savollar berish tavsiya etiladi.
• Diqqat talab o'quvchilar (${needAttention || "Past ko'rsatkichli o'quvchilar"}): Asosiy xronologik sanalarni yodlashda individual yordam ko'rsatish lozim.`;
}

// PDF Export (Supports both Lessons and Tests tabs!)
function exportToPdf() {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const teacher = teacherStore.teacherName.value || "Ustoz";

  if (activeStatsTab.value === "tests") {
    const groupLabel = selectedTestGroup.value === "all" ? "Barcha guruhlar" : selectedTestGroup.value;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("HISTORY ARENA PRO — TESTLAR VA IMTIHONLAR TAHLILI HISOBOTI", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Guruh: ${groupLabel}  |  O'qituvchi: ${teacher}  |  Jami testlar: ${filteredTestSessions.value.length} ta  |  O'rtacha aniqlik: ${overallTestAvgAccuracy.value}%`, 14, 22);

    const headers = [["№", "Sana", "Guruh", "Test Mavzusi", "Darslik", "Test Turi", "Savollar", "O'rtacha %"]];
    const rows = filteredTestSessions.value.map((s, idx) => [
      String(idx + 1),
      normalizeDateToDDMM(s.date),
      s.group,
      s.topic || "Mavzulashgan Test",
      s.book || "Umumiy",
      s.mode || "Mavzulashgan",
      String(s.maxQuestions || 30),
      `${s.avgPercent}%`,
    ]);

    autoTable(doc, {
      startY: 27,
      head: headers,
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [107, 33, 168],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      styles: { fontSize: 8, cellPadding: 2, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        3: { cellWidth: 70, halign: "left", fontStyle: "bold" },
      },
    });

    const safeGroup = groupLabel.replace(/\s+/g, "_");
    doc.save(`Testlar_Statistikasi_${safeGroup}.pdf`);
  } else {
    const groupLabel = selectedGroup.value === "all" ? "Barcha guruhlar" : selectedGroup.value;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("HISTORY ARENA PRO — DARSLAR VA O'ZLASHTIRISH HISOBOTI", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Guruh: ${groupLabel}  |  O'qituvchi: ${teacher}  |  Jami sinovlar: ${filteredRecords.value.length} ta  |  O'rtacha o'zlashtirish: ${overallAvgScore.value}%`, 14, 22);

    const headers = [["№", "O'quvchi F.I.O", "Guruh", "Sinovlar soni", "Maksimal ball", "Strikes ⭐", "O'rtacha Ball"]];
    const rows = studentRankingRows.value.map((r, i) => [
      String(i + 1),
      r.name,
      r.group,
      String(r.testsCount),
      `${r.maxScore}%`,
      String(r.strikes),
      `${r.avgScore}%`,
    ]);

    autoTable(doc, {
      startY: 27,
      head: headers,
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      styles: { fontSize: 8, cellPadding: 2, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 55, halign: "left", fontStyle: "bold" },
      },
    });

    const safeGroup = groupLabel.replace(/\s+/g, "_");
    doc.save(`Statistika_Hisoboti_${safeGroup}.pdf`);
  }
}
</script>
