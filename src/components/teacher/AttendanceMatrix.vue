<template>
  <div class="space-y-5 w-full mx-auto pb-10">
    <!-- Top Bar: Header, Back, Manual Entry, and PDF Export Button -->
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
            <span>📅</span> Oylik Davomat CRM
          </h2>
          <p class="text-xs text-slate-400">Guruhlar va oylar bo'yicha to'liq davomat jurnali</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Manual Offline Attendance Button -->
        <button
          type="button"
          @click="openManualAttendanceModal"
          class="flex items-center gap-1.5 rounded-2xl bg-emerald-600/25 border border-emerald-500/40 px-3.5 py-2 text-xs font-black text-emerald-300 hover:bg-emerald-600/40 active:scale-95 transition shadow-md"
        >
          <span>➕</span>
          <span>Qo'lda kiritish</span>
        </button>

        <button
          type="button"
          @click="fetchAttendance(true)"
          :disabled="loading"
          class="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition"
          title="Ma'lumotlarni bazadan qayta yuklash"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
        </button>

        <!-- Professional PDF Export Button -->
        <button
          type="button"
          @click="exportToPdf"
          :disabled="filteredStudentRows.length === 0 || loading"
          class="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/30 hover:from-red-500 hover:to-pink-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span class="text-base">📄</span>
          <span>PDF</span>
        </button>
      </div>
    </div>

    <!-- Filters: Month Navigator, Group Selector & Search Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <!-- 1. Month Navigator -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl flex items-center justify-between">
        <button
          type="button"
          @click="navMonth(-1)"
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
        >
          ◀
        </button>
        <div class="text-center px-2">
          <div class="text-[10px] uppercase font-bold text-slate-400">Tanlangan Oy</div>
          <div class="text-sm font-black text-cyan-300">
            {{ formatMonthLabel(selectedMonth) }}
          </div>
        </div>
        <button
          type="button"
          @click="navMonth(1)"
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
        >
          ▶
        </button>
      </div>

      <!-- 2. Group Selector -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl flex flex-col justify-center">
        <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">Guruhni tanlang:</label>
        <select
          v-model="selectedGroup"
          class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">Barcha guruhlar (Umumiy)</option>
          <option v-for="g in uniqueGroups" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <!-- 3. Student Search -->
      <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl flex flex-col justify-center">
        <label class="text-[10px] uppercase font-bold text-slate-400 mb-1 px-1">O'quvchi qidirish:</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Ism bo'yicha filter..."
          class="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
        />
      </div>
    </div>

    <!-- Monthly KPI Cards Banner -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="glass-card rounded-3xl p-4 text-center border-blue-500/20 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Oylik Darslar</div>
        <div class="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums">
          {{ monthDates.length }} <span class="text-xs font-normal text-slate-400">ta</span>
        </div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-emerald-500/20 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Guruh Davomati</div>
        <div class="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tabular-nums">
          {{ groupAvgAttendance }}%
        </div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-amber-500/20 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">O'quvchilar</div>
        <div class="text-2xl sm:text-3xl font-black text-amber-300 mt-1 tabular-nums">
          {{ filteredStudentRows.length }} <span class="text-xs font-normal text-slate-400">nafar</span>
        </div>
      </div>

      <div class="glass-card rounded-3xl p-4 text-center border-purple-500/20 shadow-lg">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Namunali (100%)</div>
        <div class="text-2xl sm:text-3xl font-black text-purple-300 mt-1 tabular-nums">
          {{ perfectStudentsCount }} <span class="text-xs font-normal text-slate-400">nafar</span>
        </div>
      </div>
    </div>

    <!-- CRM Attendance Matrix Table Card -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-2xl space-y-3">
      <div class="flex items-center justify-between px-1">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>📊 Davomat jadvali:</span>
          <span class="text-cyan-400">{{ formatMonthLabel(selectedMonth) }}</span>
          <span v-if="selectedGroup !== 'all'" class="text-amber-400 font-bold">({{ selectedGroup }})</span>
        </div>
        <span class="text-[11px] text-slate-400 hidden sm:inline">
          🔒 Xavfsiz rejim: Tahrirlash uchun katakchaga bosing
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-16 text-center space-y-3">
        <div class="h-9 w-9 mx-auto animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
        <p class="text-xs font-bold text-slate-400">Davomat ma'lumotlari yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredStudentRows.length === 0"
        class="rounded-3xl border border-white/5 bg-black/20 p-12 text-center text-xs text-slate-500 space-y-3"
      >
        <div class="text-4xl">📭</div>
        <p class="font-bold text-slate-300 text-sm">Ushbu oy va guruh uchun davomat ma'lumotlari topilmadi</p>
        <p class="text-[11px] text-slate-500">
          Oylarni almashtirib ko'ring yoki yuqoridagi <b>«➕ Qo'lda kiritish»</b> tugmasi orqali yangi davomat qo'shing.
        </p>
        <button
          type="button"
          @click="openManualAttendanceModal"
          class="rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-500 active:scale-95 transition"
        >
          ➕ Yangi dars davomatini kiritish
        </button>
      </div>

      <!-- CRM Matrix Grid -->
      <div v-else class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-1 shadow-inner custom-scrollbar">
        <table class="w-full text-center text-xs text-slate-200 border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
              <!-- Sticky Left Column: Student Name -->
              <th class="sticky left-0 bg-slate-950/95 px-3 py-3 text-left z-20 whitespace-nowrap min-w-[160px] border-r border-white/10">
                № &nbsp; O'quvchi F.I.O
              </th>

              <!-- Dynamic Lesson Date Columns -->
              <th
                v-for="d in monthDates"
                :key="d"
                class="px-2 py-2.5 whitespace-nowrap border-r border-white/5 min-w-[44px]"
              >
                <div class="text-white font-black">{{ normalizeDateToDDMM(d) }}</div>
                <div class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ getWeekdayShort(d) }}</div>
              </th>

              <!-- Summary Columns -->
              <th class="px-2.5 py-3 text-emerald-400 font-black border-l border-white/10 min-w-[50px]" title="Kelgan darslar soni">
                ✅ Keldi
              </th>
              <th class="px-2.5 py-3 text-red-400 font-black min-w-[50px]" title="Sababsiz qoldirgan darslar">
                ❌ Qoldi
              </th>
              <th class="px-2.5 py-3 text-amber-400 font-black min-w-[50px]" title="Sababli ruxsat so'ragan">
                🟡 Sababli
              </th>
              <th class="px-3 py-3 text-white font-black min-w-[70px]" title="Oylik davomat foizi">
                Foiz %
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in filteredStudentRows"
              :key="row.name"
              class="border-b border-white/5 hover:bg-white/5 transition"
            >
              <!-- Sticky Student Name -->
              <td class="sticky left-0 bg-slate-950/95 px-3 py-2.5 text-left font-bold text-white z-10 whitespace-nowrap border-r border-white/10 flex items-center justify-between gap-2">
                <span class="truncate">
                  <span class="text-slate-400 font-normal mr-1.5">{{ idx + 1 }}.</span>
                  {{ row.name }}
                </span>
                <span v-if="row.group" class="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-normal text-slate-400">
                  {{ row.group }}
                </span>
              </td>

              <!-- Date Cells: Protected with Edit Modal trigger -->
              <td
                v-for="d in monthDates"
                :key="d"
                @click="openEditModal(row.name, d, row.records[d])"
                class="px-1.5 py-2 border-r border-white/5 cursor-pointer hover:bg-white/15 transition-all select-none group relative"
                title="Tahrirlash uchun bosing"
              >
                <span
                  v-if="row.records[d] === 'Keldi'"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black shadow-sm group-hover:scale-110 transition"
                >
                  ✓
                </span>
                <span
                  v-else-if="row.records[d] === 'Sababsiz'"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/25 text-red-300 text-xs font-black shadow-sm group-hover:scale-110 transition"
                >
                  ✕
                </span>
                <span
                  v-else-if="row.records[d] === 'Sababli'"
                  class="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/25 text-amber-300 text-xs font-black shadow-sm group-hover:scale-110 transition"
                >
                  ●
                </span>
                <span v-else class="text-slate-600 text-xs group-hover:text-slate-400">-</span>

                <!-- Modified Reason Indicator Dot -->
                <span
                  v-if="row.reasons && row.reasons[d]"
                  class="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-1 ring-slate-950"
                  :title="`Izoh: ${row.reasons[d]}`"
                ></span>
              </td>

              <!-- Summary Cells -->
              <td class="px-2 py-2.5 font-bold text-emerald-400 border-l border-white/10 tabular-nums">
                {{ row.present }}
              </td>
              <td class="px-2 py-2.5 font-bold text-red-400 tabular-nums">
                {{ row.absent }}
              </td>
              <td class="px-2 py-2.5 font-bold text-amber-400 tabular-nums">
                {{ row.excused }}
              </td>
              <td class="px-3 py-2.5 font-black">
                <span
                  class="inline-block rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums"
                  :class="
                    row.percent >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : row.percent >= 70
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  "
                >
                  {{ row.percent }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Action Footer -->
      <div class="pt-2 flex justify-between items-center text-xs text-slate-400">
        <span>
          Jami o'quvchilar: <b class="text-white">{{ filteredStudentRows.length }}</b> nafar
        </span>
        <span class="text-[11px] text-slate-500">
          History Arena PRO CRM Database
        </span>
      </div>
    </div>

    <!-- 1. SAFE ATTENDANCE STATUS EDIT MODAL (WITH MANDATORY REASON) -->
    <BaseModal
      v-model="showEditModal"
      title="✏️ Davomatni tahrirlash"
    >
      <div v-if="editTarget" class="py-2 space-y-4">
        <!-- Target Info Box -->
        <div class="rounded-2xl border border-white/10 bg-black/40 p-3.5 space-y-1">
          <div class="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>O'quvchi:</span>
            <span class="text-white font-black text-sm">{{ editTarget.name }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Dars sanasi:</span>
            <span class="text-cyan-300 font-bold">{{ editTarget.date }} ({{ getWeekdayShort(editTarget.date) }})</span>
          </div>
        </div>

        <!-- New Status Segmented Pills -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Yangi holatni tanlang:
          </label>
          <div class="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
            <button
              type="button"
              @click="editTarget.status = 'Keldi'"
              class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all"
              :class="
                editTarget.status === 'Keldi'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>✅</span> <span>Keldi</span>
            </button>
            <button
              type="button"
              @click="editTarget.status = 'Sababsiz'"
              class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all"
              :class="
                editTarget.status === 'Sababsiz'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>❌</span> <span>Sababsiz</span>
            </button>
            <button
              type="button"
              @click="editTarget.status = 'Sababli'"
              class="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all"
              :class="
                editTarget.status === 'Sababli'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              "
            >
              <span>🟡</span> <span>Sababli</span>
            </button>
          </div>
        </div>

        <!-- Mandatory Reason Input -->
        <div class="space-y-1.5">
          <label class="block text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <span>O'zgartirish sababi (Majburiy): *</span>
            <span class="text-[10px] font-normal text-slate-400">Kamida 4 ta belgi</span>
          </label>
          <textarea
            v-model="editReason"
            rows="3"
            placeholder="Masalan: O'quvchi 15 daqiqa kechikib keldi yoki ota-onasi ruxsat so'ragan..."
            class="w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
          ></textarea>
          <div v-if="editReason.trim().length > 0 && editReason.trim().length < 4" class="text-[11px] text-red-400">
            ⚠️ Iltimos, sababni to'liqroq yozing.
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showEditModal = false"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          @click="saveStatusEdit"
          :disabled="editReason.trim().length < 4"
          class="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Saqlash va Tasdiqlash 🚀
        </button>
      </template>
    </BaseModal>

    <!-- 2. MANUAL OFFLINE ATTENDANCE MODAL -->
    <BaseModal
      v-model="showManualModal"
      title="➕ Qo'lda Davomat Kiritish (Offline dars)"
      custom-class="max-w-2xl"
    >
      <div class="py-2 space-y-4">
        <!-- Group & Date Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Guruhni tanlang:
            </label>
            <select
              v-model="manualGroup"
              @change="onManualGroupChange"
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-3 text-xs font-bold text-white outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option v-for="g in availableManualGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Dars Sanasi (Kun.Oy, masalan: 02.09):
            </label>
            <input
              v-model="manualDate"
              type="text"
              placeholder="02.09"
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-3 text-xs font-bold text-cyan-300 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <!-- Quick "All Present" Shortcut -->
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
            O'quvchilar ro'yxati ({{ manualStudentsList.length }})
          </span>
          <button
            type="button"
            @click="markAllManual('Keldi')"
            class="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-400 hover:bg-emerald-500/30 transition"
          >
            Barchasi Keldi ✅
          </button>
        </div>

        <!-- Students Attendance List -->
        <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-if="manualStudentsList.length === 0"
            class="rounded-2xl border border-white/5 bg-black/30 p-8 text-center text-xs text-slate-500"
          >
            Ushbu guruhda o'quvchilar topilmadi
          </div>

          <div
            v-for="(sName, idx) in manualStudentsList"
            :key="sName"
            class="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2 shadow-md"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-white">
                <span class="text-slate-400 font-normal mr-1">{{ idx + 1 }}.</span>
                {{ sName }}
              </span>
              <span
                class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                :class="
                  manualStatuses[sName] === 'Keldi'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : manualStatuses[sName] === 'Sababli'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                "
              >
                {{ manualStatuses[sName] || 'Keldi' }}
              </span>
            </div>

            <!-- 3 Chip Buttons -->
            <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/5">
              <button
                type="button"
                @click="manualStatuses[sName] = 'Keldi'"
                class="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all"
                :class="
                  manualStatuses[sName] === 'Keldi'
                    ? 'bg-emerald-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                "
              >
                <span>✅</span> <span>Keldi</span>
              </button>
              <button
                type="button"
                @click="manualStatuses[sName] = 'Sababsiz'"
                class="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all"
                :class="
                  manualStatuses[sName] === 'Sababsiz'
                    ? 'bg-red-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                "
              >
                <span>❌</span> <span>Sababsiz</span>
              </button>
              <button
                type="button"
                @click="manualStatuses[sName] = 'Sababli'"
                class="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all"
                :class="
                  manualStatuses[sName] === 'Sababli'
                    ? 'bg-amber-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                "
              >
                <span>🟡</span> <span>Sababli</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showManualModal = false"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          @click="saveManualAttendance"
          :disabled="manualStudentsList.length === 0 || !manualDate.trim() || savingManual"
          class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 active:scale-95 disabled:opacity-40 transition"
        >
          {{ savingManual ? "Saqlanmoqda... ⏳" : "Saqlash va Bazaga yozish 🚀" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { callApi } from "../../services/api";
import { useTeacherStore, normalizeDateToDDMM } from "../../composables/useTeacherStore";
import BaseModal from "../common/BaseModal.vue";

defineEmits<{
  (e: "back"): void;
}>();

const teacherStore = useTeacherStore();

interface AttendanceLog {
  date: string; // "DD.MM" or "YYYY-MM-DD"
  name: string;
  status: "Keldi" | "Sababsiz" | "Sababli";
  group?: string;
  reason?: string;
}

const loading = ref(false);
const rawLogs = ref<AttendanceLog[]>([]);
const selectedGroup = ref("all");
const searchQuery = ref("");
const selectedMonth = ref("09"); // Default to September ("09") or latest available

// Edit Modal State
const showEditModal = ref(false);
const editTarget = ref<{ name: string; date: string; status: "Keldi" | "Sababsiz" | "Sababli" } | null>(null);
const editReason = ref("");

// Manual Attendance Modal State
const showManualModal = ref(false);
const manualGroup = ref("");
const manualDate = ref("");
const manualStudentsList = ref<string[]>([]);
const manualStatuses = ref<Record<string, "Keldi" | "Sababsiz" | "Sababli">>({});
const savingManual = ref(false);
const allGroupsDict = ref<Record<string, string[]>>({});

onMounted(() => {
  fetchAttendance();
});

// Helper: Extract month code ("01" - "12") from date string ("DD.MM" or "YYYY-MM-DD")
function getMonthFromDate(dStr: string): string {
  if (!dStr) return "";
  const norm = normalizeDateToDDMM(dStr);
  if (norm.includes(".")) {
    const parts = norm.split(".");
    return parts[1] || ""; // e.g. "05.09" -> "09"
  }
  return "";
}

async function fetchAttendance(forceRefresh = false) {
  loading.value = true;
  try {
    const res = await callApi("get_attendance", {}, { forceRefresh });
    const serverLogs: AttendanceLog[] = (res && res.status === "success" && Array.isArray(res.attendance)) ? res.attendance : [];

    // Merge server logs and local logs seamlessly with date normalization
    const mergedMap = new Map<string, AttendanceLog>();
    serverLogs.forEach((l) => {
      const normDate = normalizeDateToDDMM(l.date);
      mergedMap.set(`${l.name}_${normDate}`, { ...l, date: normDate });
    });
    teacherStore.localAttendanceLogs.value.forEach((l) => {
      const normDate = normalizeDateToDDMM(l.date);
      mergedMap.set(`${l.name}_${normDate}`, { ...l, date: normDate });
    });

    rawLogs.value = Array.from(mergedMap.values());

    // Auto pick current month or latest available month
    const now = new Date();
    const curMonth = ("0" + (now.getMonth() + 1)).slice(-2);
    const months = allAvailableMonths.value;
    if (months.includes(curMonth)) {
      selectedMonth.value = curMonth;
    } else if (months.length > 0 && !months.includes(selectedMonth.value)) {
      selectedMonth.value = months[months.length - 1];
    }
  } catch (e) {
    console.error("fetchAttendance error:", e);
    rawLogs.value = [...teacherStore.localAttendanceLogs.value];
  } finally {
    loading.value = false;
  }
}

// All unique months present in logs (e.g. ["04", "05", "06", "07", "08", "09"])
const allAvailableMonths = computed(() => {
  const set = new Set<string>();
  rawLogs.value.forEach((l) => {
    const m = getMonthFromDate(l.date);
    if (m) set.add(m);
  });
  const list = [...set].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return list.length > 0 ? list : ["09"];
});

function navMonth(dir: number) {
  const months = allAvailableMonths.value;
  const currIdx = months.indexOf(selectedMonth.value);
  if (currIdx === -1) {
    if (months.length > 0) selectedMonth.value = months[0];
    return;
  }
  const nextIdx = currIdx + dir;
  if (nextIdx >= 0 && nextIdx < months.length) {
    selectedMonth.value = months[nextIdx];
  }
}

const uniqueGroups = computed(() => {
  const set = new Set<string>();
  // 1. From allStudentsRegistry (only active, non-frozen students)
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name)) return;
    const g = (s.group || "").trim();
    if (g && g !== "Arxiv" && !g.toLowerCase().includes("arxiv")) {
      set.add(g);
    }
  });
  // 2. From rawLogs
  rawLogs.value.forEach((l) => {
    if (teacherStore.isStudentFrozen(l.name)) return;
    const g = (l.group || "").trim();
    if (g && g !== "Arxiv" && !g.toLowerCase().includes("arxiv")) {
      set.add(g);
    }
  });
  return [...set].sort();
});

// Dates of lessons in the selected month
const monthDates = computed(() => {
  const targetM = selectedMonth.value;
  const set = new Set<string>();

  // Lookup for student group transfers
  const studentGroupMap = new Map<string, string>();
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    studentGroupMap.set(s.name.toLowerCase().trim(), (s.group || "").trim());
  });

  rawLogs.value.forEach((l) => {
    const norm = normalizeDateToDDMM(l.date);
    if (getMonthFromDate(norm) === targetM) {
      const effectiveGroup = studentGroupMap.get(l.name.toLowerCase().trim()) || l.group || "Boshqa";
      if (selectedGroup.value === "all" || effectiveGroup === selectedGroup.value) {
        set.add(norm);
      }
    }
  });

  // Also include dates from lessonSessions (normalized to DD.MM)
  teacherStore.lessonSessions.value.forEach((sess) => {
    if (sess.date) {
      const norm = normalizeDateToDDMM(sess.date);
      if (getMonthFromDate(norm) === targetM) {
        if (selectedGroup.value === "all" || sess.group === selectedGroup.value) {
          set.add(norm);
        }
      }
    }
  });

  return [...set].sort((a, b) => {
    const dayA = parseInt(a.split(".")[0] || a, 10);
    const dayB = parseInt(b.split(".")[0] || b, 10);
    return dayA - dayB;
  });
});

interface StudentRow {
  name: string;
  group: string;
  records: Record<string, "Keldi" | "Sababsiz" | "Sababli">;
  reasons: Record<string, string>;
  present: number;
  absent: number;
  excused: number;
  total: number;
  percent: number;
}

const allStudentRows = computed<StudentRow[]>(() => {
  const targetM = selectedMonth.value;
  const studentsMap: Record<string, { group: string; records: Record<string, any>; reasons: Record<string, any> }> = {};

  // Build lookup of master student info from registry
  const masterMap = new Map<string, { group: string; isFrozen: boolean }>();
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    masterMap.set(s.name.toLowerCase().trim(), {
      group: (s.group || "").trim(),
      isFrozen: s.status === "frozen" || teacherStore.isStudentFrozen(s.name),
    });
  });

  // 1. Seed all active students belonging to selectedGroup (or all active students if selectedGroup === 'all')
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name)) return;
    const g = (s.group || "Boshqa").trim();
    if (g === "Arxiv" || g.toLowerCase().includes("arxiv")) return;
    if (selectedGroup.value !== "all" && g !== selectedGroup.value) return;

    studentsMap[s.name] = { group: g, records: {}, reasons: {} };
  });

  // 2. Populate logs and discover any additional students in rawLogs
  rawLogs.value.forEach((l) => {
    const norm = l.name.toLowerCase().trim();
    const master = masterMap.get(norm);
    if (master?.isFrozen || teacherStore.isStudentFrozen(l.name)) return;
    const normDate = normalizeDateToDDMM(l.date);
    if (getMonthFromDate(normDate) !== targetM) return;

    const g = master?.group || l.group || "Boshqa";
    if (selectedGroup.value !== "all" && g !== selectedGroup.value) return;

    if (!studentsMap[l.name]) {
      studentsMap[l.name] = { group: g, records: {}, reasons: {} };
    }
    studentsMap[l.name].records[normDate] = l.status;
    if (l.reason) {
      studentsMap[l.name].reasons[normDate] = l.reason;
    }
  });

  // 3. Also merge attendance records from lessonSessions (especially test sessions)
  teacherStore.lessonSessions.value.forEach((sess) => {
    if (!sess.date) return;
    const normDate = normalizeDateToDDMM(sess.date);
    if (getMonthFromDate(normDate) !== targetM) return;
    if (sess.studentResults && Array.isArray(sess.studentResults)) {
      sess.studentResults.forEach((sr: any) => {
        if (!sr.name) return;
        const norm = sr.name.toLowerCase().trim();
        const master = masterMap.get(norm);
        if (master?.isFrozen || teacherStore.isStudentFrozen(sr.name)) return;
        const g = master?.group || sess.group || "Boshqa";
        if (selectedGroup.value !== "all" && g !== selectedGroup.value) return;

        if (!studentsMap[sr.name]) {
          studentsMap[sr.name] = { group: g, records: {}, reasons: {} };
        }
        if (!studentsMap[sr.name].records[normDate] && sr.attStatus) {
          studentsMap[sr.name].records[normDate] = sr.attStatus;
        }
      });
    }
  });

  const rows: StudentRow[] = [];
  const dates = monthDates.value;

  for (const name in studentsMap) {
    const { group, records, reasons } = studentsMap[name];
    let present = 0;
    let absent = 0;
    let excused = 0;

    dates.forEach((d) => {
      const st = records[d];
      if (st === "Keldi") present++;
      else if (st === "Sababsiz") absent++;
      else if (st === "Sababli") excused++;
    });

    const total = present + absent + excused;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    rows.push({
      name,
      group,
      records,
      reasons,
      present,
      absent,
      excused,
      total,
      percent,
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name));
});

const filteredStudentRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return allStudentRows.value;
  return allStudentRows.value.filter((r) => r.name.toLowerCase().includes(q));
});

// Group Average Attendance
const groupAvgAttendance = computed(() => {
  const rows = filteredStudentRows.value;
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + r.percent, 0);
  return Math.round(sum / rows.length);
});

// Perfect Students Count
const perfectStudentsCount = computed(() => {
  return filteredStudentRows.value.filter((r) => r.percent === 100 && r.present > 0).length;
});

// Helper formatting for Month Label
function formatMonthLabel(mCode: string) {
  const m = parseInt(mCode, 10);
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];
  const name = monthNames[m - 1] || mCode;
  return `2026-yil ${name}`;
}

function getWeekdayShort(dateStr: string) {
  if (!dateStr) return "";
  const norm = normalizeDateToDDMM(dateStr);
  const parts = norm.split(".");
  if (parts.length === 2) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const d = new Date(2026, month, day);
    const weekdays = ["Yak", "Du", "Se", "Chor", "Pay", "Juma", "Shan"];
    return weekdays[d.getDay()] || "";
  }
  return "";
}

// 1. Open Safe Edit Modal
function openEditModal(name: string, dateStr: string, currentStatus?: "Keldi" | "Sababsiz" | "Sababli") {
  const normDate = normalizeDateToDDMM(dateStr);
  editTarget.value = {
    name,
    date: normDate,
    status: currentStatus || "Keldi",
  };
  editReason.value = "";
  showEditModal.value = true;
}

// Save Edit with mandatory reason
function saveStatusEdit() {
  if (!editTarget.value || editReason.value.trim().length < 4) return;
  const { name, date, status } = editTarget.value;
  const normDate = normalizeDateToDDMM(date);
  const reasonText = editReason.value.trim();
  const master = teacherStore.allStudentsRegistry.value.find(
    (s) => s.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
  const group = master?.group || (selectedGroup.value === "all" ? "Boshqa" : selectedGroup.value);

  // Find and update or insert in rawLogs
  const item = rawLogs.value.find((l) => l.name === name && normalizeDateToDDMM(l.date) === normDate);
  if (item) {
    item.date = normDate;
    item.status = status;
    item.reason = reasonText;
    item.group = group;
  } else {
    rawLogs.value.push({
      name,
      date: normDate,
      status,
      reason: reasonText,
      group,
    });
  }

  // Update in localAttendanceLogs
  const localItem = teacherStore.localAttendanceLogs.value.find((l) => l.name === name && normalizeDateToDDMM(l.date) === normDate);
  if (localItem) {
    localItem.date = normDate;
    localItem.status = status;
    localItem.reason = reasonText;
    localItem.group = group;
  } else {
    teacherStore.localAttendanceLogs.value.push({
      name,
      date: normDate,
      status,
      reason: reasonText,
      group,
    });
  }

  // Sync to Firebase Cloud
  teacherStore.syncAttendanceLogToCloud(normDate, name, status, group, reasonText);

  showEditModal.value = false;
}

// 2. Open Manual Attendance Modal
const availableManualGroups = computed(() => {
  const set = new Set<string>();
  // 1. Google Sheets groups
  Object.keys(allGroupsDict.value).forEach((g) => {
    if (g === "Arxiv" || g.toLowerCase().includes("arxiv")) return;
    set.add(g.trim());
  });
  // 2. Registry groups
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name)) return;
    const g = (s.group || "").trim();
    if (g && g !== "Arxiv" && !g.toLowerCase().includes("arxiv")) {
      set.add(g);
    }
  });
  const list = Array.from(set).sort();
  return list.length > 0 ? list : uniqueGroups.value;
});

async function openManualAttendanceModal() {
  // Set default date to today as DD.MM
  const now = new Date();
  const d = ("0" + now.getDate()).slice(-2);
  const m = ("0" + (now.getMonth() + 1)).slice(-2);
  manualDate.value = `${d}.${m}`;

  // Fetch groups if not yet loaded
  try {
    const res = await callApi("get_student_list");
    if (res.status === "success" && res.groups) {
      allGroupsDict.value = res.groups;
    }
  } catch (e) {}

  const gList = availableManualGroups.value;
  manualGroup.value = selectedGroup.value !== "all" ? selectedGroup.value : gList[0] || "apple";
  onManualGroupChange();
  showManualModal.value = true;
}

function onManualGroupChange() {
  const g = manualGroup.value.trim();
  const set = new Set<string>();

  // 1. Google Sheets members (checking if transferred in CRM)
  const list = allGroupsDict.value[g] || [];
  list.forEach((name) => {
    const master = teacherStore.allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (master) {
      if (master.status === "frozen" || teacherStore.isStudentFrozen(name)) return;
      if (master.group && master.group.toLowerCase().trim() !== g.toLowerCase()) return; // transferred away
      set.add(master.name);
    } else {
      if (!teacherStore.isStudentFrozen(name)) {
        set.add(name);
      }
    }
  });

  // 2. Students in allStudentsRegistry whose current group is g
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name)) return;
    if ((s.group || "").toLowerCase().trim() === g.toLowerCase()) {
      set.add(s.name);
    }
  });

  manualStudentsList.value = Array.from(set).sort((a, b) => a.localeCompare(b));

  const st: Record<string, "Keldi" | "Sababsiz" | "Sababli"> = {};
  manualStudentsList.value.forEach((name) => {
    st[name] = "Keldi"; // Default to present
  });
  manualStatuses.value = st;
}

function markAllManual(status: "Keldi" | "Sababsiz" | "Sababli") {
  manualStudentsList.value.forEach((name) => {
    manualStatuses.value[name] = status;
  });
}

async function saveManualAttendance() {
  if (!manualDate.value.trim() || manualStudentsList.value.length === 0) return;
  savingManual.value = true;

  const dateStr = manualDate.value.trim();
  const group = manualGroup.value;

  // Insert or update entries in local rawLogs and localAttendanceLogs
  manualStudentsList.value.forEach((name) => {
    const status = manualStatuses.value[name] || "Keldi";
    const existing = rawLogs.value.find((l) => l.name === name && l.date === dateStr);
    if (existing) {
      existing.status = status;
      existing.group = group;
    } else {
      rawLogs.value.push({
        date: dateStr,
        name,
        status,
        group,
        reason: "Offline darsda qo'lda kiritildi",
      });
    }

    const localExisting = teacherStore.localAttendanceLogs.value.find((l) => l.name === name && l.date === dateStr);
    if (localExisting) {
      localExisting.status = status;
      localExisting.group = group;
    } else {
      teacherStore.localAttendanceLogs.value.push({
        date: dateStr,
        name,
        status,
        group,
        reason: "Offline darsda qo'lda kiritildi",
      });
    }

    // Also update allStudentsRegistry stats
    const reg = teacherStore.allStudentsRegistry.value.find((s) => s.name === name);
    if (reg) {
      if (!reg.attendanceStats) reg.attendanceStats = { present: 0, excused: 0, unexcused: 0 };
      if (status === "Keldi") reg.attendanceStats.present++;
      else if (status === "Sababli") reg.attendanceStats.excused++;
      else if (status === "Sababsiz") reg.attendanceStats.unexcused++;
    }

    // Sync to Firebase Cloud
    teacherStore.syncAttendanceLogToCloud(dateStr, name, status, group, "Offline darsda qo'lda kiritildi");
  });

  // Trigger reactivity for CRM UI
  teacherStore.allStudentsRegistry.value = [...teacherStore.allStudentsRegistry.value];

  // Switch selected month to match the inserted date
  const m = getMonthFromDate(dateStr);
  if (m) {
    selectedMonth.value = m;
  }
  selectedGroup.value = group;

  savingManual.value = false;
  showManualModal.value = false;
}

// --- PROFESSIONAL PDF EXPORT GENERATOR ---
function exportToPdf() {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const monthLabel = formatMonthLabel(selectedMonth.value);
  const groupLabel = selectedGroup.value === "all" ? "Barcha guruhlar" : selectedGroup.value;
  const teacher = teacherStore.teacherName.value || "Ustoz";

  // 1. Header & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("HISTORY ARENA PRO — OYLIK DAVOMAT TABELI", 14, 15);

  // 2. Info Bar
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Guruh: ${groupLabel}  |  Oy: ${monthLabel}  |  O'qituvchi: ${teacher}  |  Darslar soni: ${monthDates.value.length} ta`, 14, 22);

  // 3. Prepare Table Headers and Rows
  const dates = monthDates.value;
  const headDates = dates.map((d) => `${d}\n${getWeekdayShort(d)}`);
  const headers = [["№", "O'quvchi F.I.O", ...headDates, "Keldi", "Qoldi", "Sababli", "Davomat %"]];

  const rows = filteredStudentRows.value.map((r, i) => {
    const dateValues = dates.map((d) => {
      const st = r.records[d];
      if (st === "Keldi") return "V";
      if (st === "Sababsiz") return "X";
      if (st === "Sababli") return "O";
      return "-";
    });

    return [
      String(i + 1),
      r.name,
      ...dateValues,
      String(r.present),
      String(r.absent),
      String(r.excused),
      `${r.percent}%`,
    ];
  });

  // 4. Generate AutoTable
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
      valign: "middle",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 45, halign: "left", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Color cell indicators
      if (data.section === "body" && data.column.index >= 2 && data.column.index < 2 + dates.length) {
        const val = data.cell.raw;
        if (val === "V") {
          data.cell.styles.textColor = [16, 185, 129]; // emerald
          data.cell.styles.fontStyle = "bold";
        } else if (val === "X") {
          data.cell.styles.textColor = [239, 68, 68]; // red
          data.cell.styles.fontStyle = "bold";
        } else if (val === "O") {
          data.cell.styles.textColor = [245, 158, 11]; // amber
          data.cell.styles.fontStyle = "bold";
        }
      }
      // Percent column
      if (data.section === "body" && data.column.index === 2 + dates.length + 3) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // 5. Signature Footer
  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 14 : 150;
  if (finalY < 190) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("O'qituvchi imzosi: ____________________", 14, finalY);
    doc.text("O'quv bo'limi: ____________________", 120, finalY);
    doc.text(`Sana: ${new Date().toLocaleDateString()}`, 230, finalY);
  }

  // 6. Save File
  const safeGroup = groupLabel.replace(/\s+/g, "_");
  const safeMonth = selectedMonth.value.replace("-", "_");
  doc.save(`Davomat_${safeGroup}_Oy_${safeMonth}.pdf`);
}
</script>
