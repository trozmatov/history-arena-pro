<template>
  <div class="space-y-6 w-full mx-auto pb-12">
    <!-- ======================================================== -->
    <!-- VIEW 1: MAIN CRM VIEW -->
    <!-- ======================================================== -->
    <div v-if="managerView === 'main'" class="space-y-6">
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
            <span>👨‍🎓</span> O'quvchilar Boshqaruvi & CRM
          </h2>
          <p class="text-xs text-slate-400">O'quvchilar profili, login-parollar, guruhlararo ko'chirish va eslatmalar</p>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Live Class Chat Button -->
        <button
          type="button"
          @click="$emit('nav', 'chat')"
          class="flex items-center gap-1.5 rounded-2xl border border-blue-500/30 bg-blue-600/20 px-3.5 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-600/30 active:scale-95 transition shadow-md"
          title="Umumiy sinf chati va AI suhbatini ochish"
        >
          <span>💬</span>
          <span>Sinf Chati & AI</span>
        </button>

        <!-- Sync from Database (Sheets) -->
        <button
          type="button"
          @click="syncFromDb(true)"
          :disabled="syncingDb"
          class="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 active:scale-95 disabled:opacity-50 transition shadow-md"
          title="Google Sheets bazasidan barcha guruhlar va o'quvchilarni yuklash"
        >
          <span :class="{ 'animate-spin': syncingDb }">🔄</span>
          <span>{{ syncingDb ? "Yuklanmoqda..." : "Bazadan Sinxronlash" }}</span>
        </button>

        <!-- Excel Export Button -->
        <button
          type="button"
          @click="exportStudentsToExcel()"
          class="flex items-center gap-1.5 rounded-2xl border border-emerald-500/40 bg-emerald-600/20 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 active:scale-95 transition shadow-md"
          title="Barcha yoki saralangan o'quvchilar ro'yxatini Excel (.xlsx) fayl qilib yuklab olish"
        >
          <span>📥</span>
          <span>Excelga Yuklash</span>
        </button>

        <!-- Phone & Contact Recovery Button -->
        <button
          type="button"
          @click="openPhoneRecoveryModal"
          class="flex items-center gap-1.5 rounded-2xl border border-rose-500/40 bg-rose-600/20 px-3.5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-600/30 active:scale-95 transition shadow-md"
          title="Yo'qolgan telefon raqamlarini lokal xotiradan tiklash va yangilash"
        >
          <span>📱</span>
          <span>Telefonlarni Tiklash</span>
        </button>

        <!-- Restore Previous Students Button -->
        <button
          type="button"
          @click="triggerRestoreStudents"
          :disabled="restoringStudents"
          class="flex items-center gap-1.5 rounded-2xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 active:scale-95 disabled:opacity-50 transition shadow-md"
          title="Avval kiritilgan barcha o'quvchilarni lokal xotira, sessiyalar, Firebase va Google Sheets'dan qidirib tiklash"
        >
          <span :class="{ 'animate-spin': restoringStudents }">🔍</span>
          <span>{{ restoringStudents ? "Qidirilmoqda..." : "Avvalgilarni Tiklash" }}</span>
        </button>

        <!-- Store/Market Button -->
        <button
          type="button"
          @click="$emit('nav', 'market')"
          class="flex items-center gap-1.5 rounded-2xl border border-teal-500/30 bg-teal-600/20 px-3.5 py-2.5 text-xs font-bold text-teal-300 hover:bg-teal-600/30 active:scale-95 transition shadow-md"
          title="O'quvchilar do'koni va tangalar boshqaruvi"
        >
          <span>🛒</span>
          <span>Do'kon Boshqaruvi</span>
        </button>

        <!-- Reminders Button -->
        <button
          type="button"
          @click="openRemindersListModal"
          class="relative flex items-center gap-1.5 rounded-2xl border border-purple-500/30 bg-purple-500/15 px-3.5 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-500/25 active:scale-95 transition shadow-md"
        >
          <span>🔔</span>
          <span>Eslatmalar</span>
          <span
            v-if="teacherStore.activeRemindersCount.value > 0"
            class="ml-1 rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-black text-white"
          >
            {{ teacherStore.activeRemindersCount.value }}
          </span>
        </button>

        <!-- Add Student Button -->
        <button
          type="button"
          @click="openAddModal"
          class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
        >
          <span>➕</span>
          <span>Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- 1. Overview Dashboard Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <!-- Total Students -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-white/10 space-y-1 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami O'quvchilar</span>
          <span class="text-xl">👥</span>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-white tabular-nums">
          {{ totalStudentsCount }}
        </div>
        <div class="text-[11px] text-slate-400">
          <b class="text-blue-400">{{ groupsList.length }}</b> ta guruh kesimida
        </div>
      </div>

      <!-- Active Students -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-emerald-500/20 bg-emerald-950/20 space-y-1 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Faol O'quvchilar</span>
          <span class="text-xl">🟢</span>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
          {{ activeStudentsCount }}
        </div>
        <div class="text-[11px] text-emerald-300/80">
          Jami o'quvchilarning <b class="font-bold">{{ totalStudentsCount > 0 ? Math.round((activeStudentsCount / totalStudentsCount) * 100) : 0 }}%</b> qismi
        </div>
      </div>

      <!-- Frozen Students -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-cyan-500/20 bg-cyan-950/20 space-y-1 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Muzlatilganlar</span>
          <span class="text-xl">❄️</span>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-cyan-300 tabular-nums">
          {{ frozenStudentsCount }}
        </div>
        <div class="text-[11px] text-cyan-300/80">
          Vaqtincha to'xtatilgan yoki ta'tilda
        </div>
      </div>

      <!-- Active Reminders -->
      <div class="glass-card rounded-3xl p-4 sm:p-5 border-amber-500/20 bg-amber-950/20 space-y-1 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Eslatmalar</span>
          <span class="text-xl">🔔</span>
        </div>
        <div class="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums">
          {{ teacherStore.activeRemindersCount.value }}
        </div>
        <div class="text-[11px]" :class="teacherStore.dueReminders.value.length > 0 ? 'text-red-400 font-bold' : 'text-amber-300/80'">
          <span v-if="teacherStore.dueReminders.value.length > 0">
            ⚠️ {{ teacherStore.dueReminders.value.length }} ta eslatma muddati keldi!
          </span>
          <span v-else>
            Muddati kelgan eslatmalar yo'q
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Groups Benchmark Leaderboard Banner (Top Groups) -->
    <div v-if="groupsBenchmarkList.length > 1" class="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-purple-500/10 p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-2.5">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
          <span>🏆</span> Guruhlararo Qiyosiy Reyting (Groups Benchmark)
        </h4>
        <span class="text-[11px] text-slate-400">O'rtacha o'zlashtirish foizi bo'yicha</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div
          v-for="(grp, idx) in groupsBenchmarkList.slice(0, 4)"
          :key="grp.name"
          @click="openGroupHub(grp.name)"
          class="glass-card rounded-2xl p-3 text-center border-white/10 hover:border-amber-500/40 cursor-pointer transition active:scale-95"
        >
          <div class="text-xs font-black text-amber-400">#{{ idx + 1 }} {{ idx === 0 ? '👑' : '' }}</div>
          <div class="font-extrabold text-sm text-white truncate mt-0.5">{{ grp.name }}</div>
          <div class="text-xs font-black text-emerald-400 mt-0.5">{{ grp.avgAccuracy }}% aniqlik</div>
        </div>
      </div>
    </div>

    <!-- 3. Groups Management & Dedicated Group Hub Cards -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span>📚</span> <span>Guruhlar Boshqaruv Markazi (Group Hub)</span>
          </h3>
          <p class="text-xs text-slate-400">Guruh ichiga kirish, dars jadvali, eslatmalar, o'zlashtirish va login-parollar</p>
        </div>

        <!-- Group Status Filter Tabs & Add Group Button -->
        <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs">
            <button
              type="button"
              @click="groupFilterTab = 'all'"
              class="rounded-xl px-3 py-1.5 font-bold transition"
              :class="groupFilterTab === 'all' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              Hammasi ({{ groupsList.length }})
            </button>
            <button
              type="button"
              @click="groupFilterTab = 'active'"
              class="rounded-xl px-3 py-1.5 font-bold transition"
              :class="groupFilterTab === 'active' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              🟢 Faol ({{ activeGroupsCount }})
            </button>
            <button
              type="button"
              @click="groupFilterTab = 'frozen'"
              class="rounded-xl px-3 py-1.5 font-bold transition"
              :class="groupFilterTab === 'frozen' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              ❄️ Muzlagan ({{ frozenGroupsCount }})
            </button>
          </div>

          <!-- + Create New Group Button -->
          <button
            type="button"
            @click="openCreateGroupModal"
            class="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition"
            title="Yangi dars guruhi ochish"
          >
            <span>➕</span>
            <span>Yangi Guruh Ochish</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="grp in displayedGroupsList"
          :key="grp.name"
          class="rounded-3xl border p-4 transition-all duration-200 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-blue-500/40 hover:bg-slate-900/90"
          :class="grp.isAllFrozen ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-white/10 bg-black/40'"
        >
          <!-- Top Row: Name, Freeze Status & Accuracy -->
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-black text-base text-white group-hover:text-blue-400 transition">{{ grp.name }}</span>
                <span
                  v-if="grp.isAllFrozen"
                  class="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[9px] font-black text-cyan-300"
                >
                  ❄️ Muzlagan
                </span>
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-2">
                <span>👥 <b>{{ grp.count }}</b> nafar</span>
                <span class="text-slate-600">•</span>
                <span class="text-emerald-400 font-bold">🟢 {{ grp.activeCount }} faol</span>
              </div>
            </div>

            <!-- Accuracy Pill -->
            <div class="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-center shrink-0">
              <div class="text-[9px] text-slate-400 uppercase font-bold">Aniqlik</div>
              <div class="text-xs font-black text-amber-400">{{ grp.avgAccuracy }}%</div>
            </div>
          </div>

          <!-- Schedule & Room Info -->
          <div class="rounded-2xl bg-black/50 border border-white/5 p-2.5 text-xs space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400 flex items-center gap-1">
                <span>📅</span> <span>{{ grp.days && grp.days.length > 0 ? grp.days.join(', ') : 'Kunlar belgilanmagan' }}</span>
              </span>
              <span class="font-bold text-cyan-300">{{ grp.time || '14:00' }}</span>
            </div>
            <div v-if="grp.room || grp.subject" class="text-[10px] text-slate-500 flex items-center gap-2">
              <span v-if="grp.room">📍 {{ grp.room }}</span>
              <span v-if="grp.subject">📖 {{ grp.subject }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 pt-1">
            <!-- Open Group Hub Button -->
            <button
              type="button"
              @click="openGroupHub(grp.name)"
              class="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-blue-600/20 border border-blue-500/40 py-2.5 text-xs font-black text-blue-300 hover:bg-blue-600/30 active:scale-95 transition shadow"
              title="Guruh boshqaruv markazini ochish"
            >
              <span>⚙️</span> <span>Guruh Markazi</span>
            </button>

            <!-- Group Freeze Toggle -->
            <button
              type="button"
              @click="toggleGroupFreeze(grp.name, !grp.isAllFrozen)"
              class="rounded-2xl p-2.5 text-xs font-bold transition active:scale-95 shadow border shrink-0"
              :class="
                grp.isAllFrozen
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
              "
              :title="grp.isAllFrozen ? 'Guruhni qayta faollashtirish' : 'Guruhni muzlatish'"
            >
              {{ grp.isAllFrozen ? '☀️' : '❄️' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Search, Filter Bar & Batch Actions -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <!-- Search -->
      <div class="relative flex-1">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ism, login, telefon yoki guruh bo'yicha qidirish..."
          class="w-full rounded-2xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      <!-- Filters: Group & Status -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Batch Transfer Button if selected -->
        <button
          v-if="selectedStudentNames.length > 0"
          type="button"
          @click="openBatchTransferModal"
          class="rounded-2xl bg-amber-500 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 active:scale-95 transition flex items-center gap-1.5"
        >
          <span>🔄</span> <span>Guruhga ko'chirish ({{ selectedStudentNames.length }})</span>
        </button>

        <!-- Batch Export Button if selected -->
        <button
          v-if="selectedStudentNames.length > 0"
          type="button"
          @click="exportSelectedStudentsToExcel"
          class="rounded-2xl bg-emerald-500 px-3.5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition flex items-center gap-1.5 animate-pulse"
          title="Tanlangan o'quvchilarni Excel formatida yuklab olish"
        >
          <span>📥</span> <span>Tanlanganlarni yuklash ({{ selectedStudentNames.length }})</span>
        </button>

        <!-- Group Filter -->
        <select
          v-model="selectedGroupFilter"
          class="rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="">Barcha guruhlar</option>
          <option v-for="g in groupsList" :key="g.name" :value="g.name">
            {{ g.name }} ({{ g.count }})
          </option>
        </select>

        <!-- Status Filter Tabs -->
        <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10">
          <button
            type="button"
            @click="statusFilter = 'all'"
            class="rounded-xl px-3 py-1 text-xs font-bold transition"
            :class="statusFilter === 'all' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            Hammasi
          </button>
          <button
            type="button"
            @click="statusFilter = 'active'"
            class="rounded-xl px-3 py-1 text-xs font-bold transition"
            :class="statusFilter === 'active' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            🟢 Faol
          </button>
          <button
            type="button"
            @click="statusFilter = 'frozen'"
            class="rounded-xl px-3 py-1 text-xs font-bold transition"
            :class="statusFilter === 'frozen' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            ❄️ Muzlagan
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Students CRM Table / Grid -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-2xl space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 flex-wrap">
          <span>O'quvchilar Ro'yxati ({{ filteredStudents.length }})</span>
          <span v-if="filteredStudents.length > 0" class="text-slate-500">•</span>
          <label v-if="filteredStudents.length > 0" class="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-300 hover:text-white bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 transition">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer"
            />
            <span>Hammasini tanlash</span>
          </label>
        </div>

        <!-- Export Buttons in List Header -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Download Selected -->
          <button
            v-if="selectedStudentNames.length > 0"
            type="button"
            @click="exportSelectedStudentsToExcel"
            class="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-600/30 px-3 py-1.5 text-xs font-black text-emerald-300 hover:bg-emerald-600/40 active:scale-95 transition shadow-md animate-pulse"
            title="Katakchalari belgilangan o'quvchilar ma'lumotlarini Excel (.xlsx) fayl qilib yuklab olish"
          >
            <span>📥</span>
            <span>Belgilanganlarni yuklash ({{ selectedStudentNames.length }})</span>
          </button>

          <!-- Download All -->
          <button
            type="button"
            @click="exportAllStudentsToExcel"
            class="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-600/20 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-600/30 active:scale-95 transition shadow-sm"
            title="Barcha o'quvchilar ma'lumotlarini Excel (.xlsx) fayl qilib yuklab olish"
          >
            <span>📥</span>
            <span>Barchasini yuklash ({{ filteredStudents.length }})</span>
          </button>

          <button
            v-if="hasSampleStudents"
            type="button"
            @click="clearSampleStudents"
            class="text-[11px] font-bold text-slate-400 hover:text-red-400 underline transition ml-1"
            title="Boshlang'ich namuna tariqasida kiritilgan test o'quvchilarni tozalash"
          >
            🧹 Namunaviy o'quvchilarni tozalash
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredStudents.length === 0"
        class="py-12 text-center rounded-2xl border border-white/5 bg-black/20 space-y-3"
      >
        <div class="text-4xl">🔍</div>
        <div class="text-sm font-bold text-slate-300">O'quvchi topilmadi</div>
        <p class="text-xs text-slate-500">Qidiruv so'zini o'zgartiring yoki bazadan guruhlarni sinxronlang</p>
        <div class="flex justify-center gap-2">
          <button
            type="button"
            @click="syncFromDb(true)"
            class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 transition shadow"
          >
            🔄 Bazadan yuklash
          </button>
          <button
            type="button"
            @click="openAddModal"
            class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow"
          >
            + Qo'lda Qo'shish
          </button>
        </div>
      </div>

      <!-- Students List -->
      <div v-else class="space-y-2.5">
        <div
          v-for="st in paginatedStudents"
          :key="st.id || st.name"
          class="rounded-2xl border p-3 sm:p-4 transition-all duration-200 shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 overflow-hidden"
          :class="
            st.status === 'frozen'
              ? 'border-cyan-500/30 bg-cyan-950/20 opacity-80 hover:opacity-100'
              : 'border-white/10 bg-black/40 hover:border-white/25'
          "
        >
          <!-- Left: Checkbox, Avatar, Name, Group, Credentials & Contacts -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <!-- Select Checkbox -->
            <input
              type="checkbox"
              :value="st.name"
              v-model="selectedStudentNames"
              class="h-4 w-4 shrink-0 rounded accent-blue-600 cursor-pointer"
            />

            <!-- Avatar -->
            <div
              @click="openStudentDetail(st)"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-md cursor-pointer hover:scale-105 transition"
              :class="
                st.status === 'frozen'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
              "
              title="Shaxsiy doskani ochish"
            >
              {{ st.status === 'frozen' ? '❄️' : st.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Info text -->
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  @click="openStudentDetail(st)"
                  class="font-black text-sm sm:text-base text-white truncate cursor-pointer hover:text-indigo-400 hover:underline transition"
                  title="Shaxsiy doskasini ochish"
                >
                  {{ st.name }}
                </span>
                <span
                  class="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  :class="
                    st.status === 'frozen'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                      : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  "
                >
                  {{ st.status === 'frozen' ? '❄️ Muzlagan' : '🟢 Faol' }}
                </span>
                <div class="inline-flex flex-wrap items-center gap-1">
                  <span
                    v-for="grp in getStudentGroupList(st)"
                    :key="grp"
                    class="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300"
                  >
                    📚 {{ grp }}
                  </span>
                </div>
              </div>

              <!-- 6-digit PIN, Pattern & Contact bar -->
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono pt-0.5">
                <span class="flex items-center gap-1.5 bg-black/50 px-2.5 py-0.5 rounded-lg border border-amber-500/30 text-amber-300">
                  <span class="text-slate-400 font-sans text-[11px]">🔢 PIN:</span>
                  <b class="font-extrabold text-sm tracking-wider">{{ st.pin || st.password || '123456' }}</b>
                  <button
                    type="button"
                    @click.stop="copyPin(st.pin || st.password || '123456')"
                    class="hover:text-white transition p-0.5"
                    title="PIN kodni nusxalash"
                  >
                    📋
                  </button>
                </span>

                <!-- Pattern Status Badge -->
                <span
                  class="flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-sans font-bold"
                  :class="st.pattern ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-white/10 text-slate-400'"
                >
                  <span>{{ st.pattern ? '🟢 Pattern faol' : '⏳ Pattern kutilmoqda' }}</span>
                </span>

                <!-- Quick Student Phone -->
                <a
                  v-if="st.phone"
                  :href="'tel:' + st.phone"
                  class="inline-flex items-center gap-1 text-slate-300 hover:text-indigo-300 text-[11px] font-sans bg-white/5 px-2 py-0.5 rounded-md border border-white/10 transition"
                  title="O'quvchiga qo'ng'iroq"
                >
                  📱 {{ st.phone }}
                </a>
                <button
                  v-else
                  type="button"
                  @click.stop="quickAddPhone(st)"
                  class="inline-flex items-center gap-1 text-rose-300 hover:text-white text-[10px] font-sans bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/30 hover:bg-rose-500/30 transition shadow-sm"
                  title="Telefon raqamini kiritish"
                >
                  <span>+ 📱 Tel kiritish</span>
                </button>

                <!-- Quick Parent Contact -->
                <a
                  v-if="st.parentPhone"
                  :href="'tel:' + st.parentPhone"
                  class="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 text-[11px] font-sans bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 transition"
                  :title="(st.parentName ? st.parentName + ' ga' : 'Ota-onaga') + ' qo\'ng\'iroq qilish'"
                >
                  👨‍👩‍👧 {{ st.parentName ? st.parentName + ': ' : 'Ota-ona: ' }}{{ st.parentPhone }}
                </a>

                <a
                  v-if="st.parentTg"
                  :href="'https://t.me/' + st.parentTg.replace('@', '')"
                  target="_blank"
                  class="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 text-[11px] font-sans bg-sky-500/15 px-1.5 py-0.5 rounded-md border border-sky-500/30 transition"
                  title="Ota-onasi Telegramiga yozish"
                >
                  💬 TG
                </a>
              </div>
            </div>
          </div>

          <!-- Right: Metrics & Actions -->
          <div class="flex items-center justify-between xl:justify-end gap-3 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/10">
            <!-- Badges Metrics -->
            <div class="flex items-center gap-3 text-center shrink-0 pr-2">
              <div class="space-y-0.5">
                <div class="text-[10px] uppercase font-bold text-slate-500">Aniqlik</div>
                <div class="font-black text-xs sm:text-sm text-emerald-400">{{ st.avgAccuracy || 0 }}%</div>
              </div>
              <div class="space-y-0.5">
                <div class="text-[10px] uppercase font-bold text-slate-500">Tangalar</div>
                <div class="font-black text-xs sm:text-sm text-amber-400">🪙 {{ st.coins || 0 }}</div>
              </div>
              <div class="space-y-0.5">
                <div class="text-[10px] uppercase font-bold text-slate-500">Strikes</div>
                <div class="font-black text-xs sm:text-sm text-yellow-400">⭐ {{ st.strikes || 0 }}</div>
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div class="flex items-center gap-1 shrink-0 flex-nowrap">
              <!-- 1. Deep Stats / Doskasi -->
              <button
                type="button"
                @click="openStudentDetail(st)"
                class="flex items-center gap-1 rounded-xl bg-blue-600/20 border border-blue-500/30 px-2.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-600/30 active:scale-95 transition shrink-0"
                title="Shaxsiy Doskasi"
              >
                <span>🪪</span> <span class="hidden sm:inline">Doskasi</span>
              </button>

              <!-- 2. Transfer Group Button -->
              <button
                type="button"
                @click="openTransferModal(st)"
                class="flex items-center gap-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 active:scale-95 transition shrink-0"
                title="O'quvchini boshqa guruhga o'tkazish"
              >
                <span>🔄</span> <span class="hidden sm:inline">Guruh</span>
              </button>

              <!-- 3. Freeze / Unfreeze Toggle -->
              <button
                type="button"
                @click="toggleFreeze(st)"
                class="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold transition active:scale-95 shrink-0"
                :class="
                  st.status === 'frozen'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30'
                "
                :title="st.status === 'frozen' ? 'O\'quvchini qayta faollashtirish' : 'O\'quvchini muzlatish'"
              >
                <span>{{ st.status === 'frozen' ? '☀️' : '❄️' }}</span>
                <span class="hidden sm:inline">{{ st.status === 'frozen' ? 'Eritish' : 'Muzlatish' }}</span>
              </button>

              <!-- 4. Edit Details -->
              <button
                type="button"
                @click="openEditModal(st)"
                class="rounded-xl bg-white/5 border border-white/10 p-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition shrink-0"
                title="Tahrirlash"
              >
                ✏️
              </button>

              <!-- 5. Add Reminder -->
              <button
                type="button"
                @click="openReminderModal(st)"
                class="rounded-xl bg-purple-500/15 border border-purple-500/30 p-2 text-xs text-purple-300 hover:bg-purple-500/25 transition shrink-0"
                title="Eslatma belgilash"
              >
                🔔
              </button>

              <!-- 6. Parent Alert / Telegram -->
              <button
                type="button"
                @click="openParentAlert(st)"
                class="rounded-xl bg-indigo-500/20 border border-indigo-500/30 p-2 text-xs text-indigo-300 hover:bg-indigo-500/30 transition shrink-0"
                title="Ota-onaga Telegram xabarnomasi"
              >
                ✈️
              </button>

              <!-- 7. Delete -->
              <button
                type="button"
                @click="confirmDelete(st)"
                class="rounded-xl bg-red-500/15 border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/25 transition shrink-0"
                title="O'chirish"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div
          v-if="filteredStudents.length > 0"
          class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs"
        >
          <!-- Left: Showing info & Page Size selector -->
          <div class="flex flex-wrap items-center gap-3 text-slate-400">
            <span>
              Ko'rsatilmoqda: <b class="text-white">{{ paginationStart + 1 }}-{{ Math.min(paginationStart + pageSize, filteredStudents.length) }}</b> / jami <b class="text-white">{{ filteredStudents.length }}</b> ta o'quvchi
            </span>
            <div class="flex items-center gap-1.5">
              <span>Har sahifada:</span>
              <select
                v-model.number="pageSize"
                class="rounded-xl border border-white/15 bg-black/60 px-2 py-1 text-xs font-bold text-white outline-none cursor-pointer focus:border-blue-500"
              >
                <option :value="10">10 ta</option>
                <option :value="15">15 ta</option>
                <option :value="25">25 ta</option>
                <option :value="50">50 ta</option>
                <option :value="100">100 ta</option>
              </select>
            </div>
          </div>

          <!-- Right: Page Number Buttons -->
          <div class="flex items-center gap-1 flex-wrap justify-center">
            <!-- First Page -->
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage = 1"
              class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Birinchi sahifa"
            >
              ⏮
            </button>
            <!-- Prev Page -->
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Oldingi sahifa"
            >
              ◀️
            </button>

            <!-- Numeric Page Pills -->
            <button
              v-for="p in visiblePages"
              :key="p"
              type="button"
              @click="currentPage = p"
              class="rounded-xl px-3 py-1.5 font-black transition"
              :class="
                currentPage === p
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              "
            >
              {{ p }}
            </button>

            <!-- Next Page -->
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Keyingi sahifa"
            >
              ▶️
            </button>
            <!-- Last Page -->
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="currentPage = totalPages"
              class="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 font-bold text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Oxirgi sahifa"
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /VIEW 1: MAIN CRM VIEW -->
    </div>

    <!-- ======================================================== -->
    <!-- MODAL 1: ADD / EDIT STUDENT MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showAddEditModal"
      :title="editingStudent ? '✏️ O\'quvchini Tahrirlash' : '➕ Yangi O\'quvchi Qo\'shish'"
    >
      <form @submit.prevent="saveStudentData" class="space-y-4 py-2">
        <!-- Name -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">To'liq F.I.Sh *</label>
          <input
            v-model="formStudent.name"
            type="text"
            required
            placeholder="Masalan: Ali Valiyev"
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <!-- Group & Status -->
        <!-- Groups & Status (Multi-group selector) -->
        <div class="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-black uppercase tracking-wider text-indigo-300">
              📚 O'quvchi Guruhlari (Multi-Group) *
            </label>
            <span class="text-[11px] text-indigo-300 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-full">
              {{ formStudentGroups.length }} ta guruhga a'zo
            </span>
          </div>

          <!-- Selected Groups Chips -->
          <div v-if="formStudentGroups.length > 0" class="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/40 border border-white/10">
            <span
              v-for="(grp, gIdx) in formStudentGroups"
              :key="grp"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition"
              :class="gIdx === 0 ? 'bg-indigo-600 text-white shadow' : 'bg-white/10 text-slate-200 border border-white/10'"
            >
              <span>{{ grp }}</span>
              <span v-if="gIdx === 0" class="text-[9px] bg-black/40 px-1.5 py-0.5 rounded uppercase font-black text-indigo-200">Asosiy</span>
              <button
                type="button"
                @click="removeFormGroup(grp)"
                class="hover:text-rose-400 ml-0.5 text-slate-400 p-0.5 transition"
                title="Ushbu guruhni olib tashlash"
              >
                ✕
              </button>
            </span>
          </div>

          <!-- Quick pick chips from available groups -->
          <div class="space-y-1">
            <div class="text-[11px] text-slate-400">Mavjud guruhlardan tanlang (ustiga bosing):</div>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
              <button
                v-for="g in groupsList"
                :key="g.name"
                type="button"
                @click="toggleFormGroup(g.name)"
                class="px-2.5 py-1 rounded-xl text-xs font-bold border transition active:scale-95"
                :class="formStudentGroups.includes(g.name) ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'"
              >
                {{ formStudentGroups.includes(g.name) ? '✓ ' : '+ ' }}{{ g.name }}
              </button>
            </div>
          </div>

          <!-- Add Custom Group input -->
          <div class="flex gap-2 pt-1">
            <input
              v-model="formCustomGroupInput"
              type="text"
              placeholder="+ Yangi guruh nomini yozing..."
              @keypress.enter.prevent="addCustomGroupToForm"
              class="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              @click="addCustomGroupToForm"
              class="rounded-xl bg-indigo-600/30 border border-indigo-500/40 px-3 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-600/50 active:scale-95 transition"
            >
              + Qo'shish
            </button>
          </div>

          <!-- Status Select -->
          <div class="pt-1 border-t border-white/10">
            <label class="block text-xs font-bold text-slate-300 mb-1">Holati</label>
            <select
              v-model="formStudent.status"
              class="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="active">🟢 Faol</option>
              <option value="frozen">❄️ Muzlatilgan</option>
            </select>
          </div>
        </div>

        <!-- Student Phone -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">O'quvchi telefoni</label>
          <input
            v-model="formStudent.phone"
            type="text"
            placeholder="+998 90 123 45 67"
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <!-- Parent Info -->
        <div class="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-3">
          <div class="text-xs font-black text-slate-300 flex items-center gap-1.5">
            <span>👨‍👩‍👧</span> <span>Ota-ona ma'lumotlari</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              v-model="formStudent.parentName"
              type="text"
              placeholder="Ota-onasi ismi (masalan: Vali aka)"
              class="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
            <input
              v-model="formStudent.parentPhone"
              type="text"
              placeholder="Ota-onasi telefoni (+998 ...)"
              class="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
          <input
            v-model="formStudent.parentTg"
            type="text"
            placeholder="Telegram username yoki ID (@username)"
            class="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <!-- Login & Password -->
        <div class="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black text-indigo-300 flex items-center gap-1.5">
              <span>🔑</span> <span>Portalga Kirish Login & Paroli</span>
            </span>
            <button
              type="button"
              @click="generateCredentials"
              class="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              🔄 Yangilash
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[10px] text-slate-400 mb-1">Login (Zaxira)</label>
              <input
                v-model="formStudent.login"
                type="text"
                placeholder="ali_valiyev"
                class="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-[10px] text-amber-300 font-bold">🔢 6 Xonali PIN Kod</label>
                <button
                  type="button"
                  @click="generatePinForForm"
                  class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  ⚡️ Yangilash
                </button>
              </div>
              <input
                v-model="formStudent.pin"
                type="text"
                maxlength="6"
                placeholder="123456"
                class="w-full rounded-xl border border-amber-500/30 bg-black/50 px-3 py-2 font-mono text-xs text-amber-300 font-black tracking-widest outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">O'qituvchi eslatmasi / Izoh</label>
          <textarea
            v-model="formStudent.notes"
            rows="2"
            placeholder="O'quvchining qobiliyati, darsdagi xatti-harakati haqida shaxsiy izoh..."
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showAddEditModal = false"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            class="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition"
          >
            {{ editingStudent ? "Saqlash ✅" : "Qo'shish 🚀" }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 2: TRANSFER STUDENT GROUP MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showTransferModal"
      title="🔄 O'quvchini Boshqa Guruhga O'tkazish"
    >
      <div v-if="transferTargetStudent || isBatchTransfer" class="py-2 space-y-4">
        <div class="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-1">
          <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">O'tkazilayotgan o'quvchi(lar):</div>
          <div v-if="!isBatchTransfer && transferTargetStudent" class="text-sm font-black text-white flex items-center justify-between">
            <span>👤 {{ transferTargetStudent.name }}</span>
            <span class="rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-300">Hozirgi: <b>{{ transferTargetStudent.group || 'Umumiy' }}</b></span>
          </div>
          <div v-else class="text-sm font-black text-amber-300">
            👥 {{ selectedStudentNames.length }} nafar tanlangan o'quvchi
          </div>
        </div>

        <!-- Action Type: Add to Group vs Move Group -->
        <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs">
          <button
            type="button"
            @click="transferActionType = 'add'"
            class="py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
            :class="transferActionType === 'add' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
          >
            <span>➕</span> <span>Qo'shimcha guruhga</span>
          </button>
          <button
            type="button"
            @click="transferActionType = 'move'"
            class="py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
            :class="transferActionType === 'move' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'"
          >
            <span>🔄</span> <span>Faqat ko'chirish</span>
          </button>
        </div>

        <p class="text-[11px] text-slate-400 px-1">
          <span v-if="transferActionType === 'add'">
            💡 <b>Qo'shimcha guruh (Multi-group):</b> O'quvchi avvalgi guruhlarida ham saqlanadi va yangi tanlangan guruhga ham bir vaqtda a'zo bo'ladi.
          </span>
          <span v-else>
            ⚠️ <b>Ko'chirish:</b> O'quvchi avvalgi guruhidan chiqariladi va faqat yangi tanlangan guruhga o'tkaziladi.
          </span>
        </p>

        <!-- Target Group Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-300">Guruhni tanlang yoki kiriting *</label>
          <input
            v-model="transferNewGroupName"
            type="text"
            required
            placeholder="Guruh nomi (masalan: 8-B Guruh)"
            list="transfer-groups-list"
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
          <datalist id="transfer-groups-list">
            <option v-for="g in groupsList" :key="g.name" :value="g.name" />
          </datalist>

          <!-- Quick pick buttons -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span class="text-[11px] text-slate-400 py-1">Mavjud guruhlar:</span>
            <button
              v-for="g in groupsList"
              :key="g.name"
              type="button"
              @click="transferNewGroupName = g.name"
              class="rounded-lg border px-2.5 py-1 text-[11px] font-bold transition"
              :class="transferNewGroupName === g.name ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'"
            >
              {{ g.name }}
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-white/10">
          <button
            type="button"
            @click="showTransferModal = false"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            @click="doConfirmTransfer"
            :disabled="!transferNewGroupName.trim()"
            class="rounded-xl px-5 py-2.5 text-xs font-black shadow-lg active:scale-95 disabled:opacity-40 transition"
            :class="transferActionType === 'add' ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500' : 'bg-amber-500 text-slate-950 shadow-amber-500/30 hover:bg-amber-400'"
          >
            {{ transferActionType === 'add' ? "➕ Guruhga biriktirish" : "🔄 Guruhni o'zgartirish" }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL: ADD GUEST STUDENT TO TEST MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showAddGuestModal"
      title="➕ Boshqa guruhdan o'quvchi chaqirish (Mehmon)"
    >
      <div class="py-2 space-y-3">
        <p class="text-xs text-slate-400">
          Ushbu testda boshqa guruh o'quvchilari ham qatnashishi uchun ularni ro'yxatga vaqtincha taklif qilishingiz mumkin. Ularning o'z guruhi o'zgarmaydi, ammo test natijasi o'z profiliga to'liq yoziladi.
        </p>

        <!-- Search and Group Filter -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            v-model="guestSearchQuery"
            type="text"
            placeholder="Ism bo'yicha qidirish..."
            class="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
          />
          <select
            v-model="guestGroupFilter"
            class="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
          >
            <option value="all">Barcha boshqa guruhlar</option>
            <option
              v-for="g in groupsList.filter((x) => x.name !== selectedGroupHubName)"
              :key="g.name"
              :value="g.name"
            >
              {{ g.name }}
            </option>
          </select>
        </div>

        <!-- Candidate Students List -->
        <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar border border-white/5 rounded-2xl p-2 bg-black/30">
          <div
            v-for="cand in availableGuestStudents"
            :key="cand.name"
            class="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs transition"
          >
            <div>
              <div class="font-bold text-white">{{ cand.name }}</div>
              <div class="text-[10px] text-purple-300">Guruhi: {{ cand.group || 'Umumiy' }}</div>
            </div>
            <button
              type="button"
              @click="addGuestStudent(cand)"
              class="rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 text-xs transition active:scale-95"
            >
              + Chaqirish
            </button>
          </div>
          <div v-if="availableGuestStudents.length === 0" class="text-center py-6 text-xs text-slate-500">
            Mos keluvchi faol o'quvchilar topilmadi
          </div>
        </div>

        <!-- Currently Added Guests summary -->
        <div v-if="extraTestStudents.length > 0" class="rounded-xl bg-purple-950/30 border border-purple-500/30 p-2.5 space-y-1">
          <div class="text-[11px] font-bold text-purple-300 flex items-center justify-between">
            <span>Testga chaqirilgan mehmonlar ({{ extraTestStudents.length }} ta):</span>
            <button
              type="button"
              @click="extraTestStudents = []"
              class="text-[10px] text-red-400 hover:underline"
            >
              Tozalash
            </button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="gs in extraTestStudents"
              :key="gs.name"
              class="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-xs text-purple-200"
            >
              <span>{{ gs.name }} ({{ gs.group }})</span>
              <button
                type="button"
                @click="removeGuestStudent(gs.name)"
                class="hover:text-red-400 font-bold ml-0.5"
              >
                ✕
              </button>
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showAddGuestModal = false"
          class="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 transition"
        >
          Tayyor ({{ extraTestStudents.length }} kiritildi)
        </button>
      </template>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 3: STUDENT DEEP-DIVE ANALYTICS MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showDetailModal"
      :title="selectedStudent ? `🪪 ${selectedStudent.name} — Shaxsiy Doskasi` : 'Shaxsiy Doskasi'"
      customClass="max-w-2xl"
    >
      <div v-if="selectedStudent" class="py-2 space-y-4">
        <!-- Profile Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl text-white shadow-lg shrink-0">
              🎓
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base sm:text-lg font-black text-white">{{ selectedStudent.name }}</h4>
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="selectedStudent.status === 'frozen' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'"
                >
                  {{ selectedStudent.status === 'frozen' ? '❄️ Muzlatilgan' : '🟢 Faol' }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span
                  v-for="grp in getStudentGroupList(selectedStudent)"
                  :key="grp"
                  class="rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-bold text-indigo-300"
                >
                  📚 {{ grp }}
                </span>
                <span class="text-xs text-slate-500">•</span>
                <span class="text-xs text-slate-400">📅 {{ selectedStudent.joinedDate ? selectedStudent.joinedDate + ' da qo\'shilgan' : 'Faol a\'zo' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Coins in Header -->
          <div class="flex items-center gap-2 self-end sm:self-auto">
            <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-center">
              <div class="text-[9px] uppercase font-bold text-amber-300">Tangalar</div>
              <div class="text-sm font-black text-amber-400">🪙 {{ selectedStudent.coins || 0 }}</div>
            </div>
            <button
              type="button"
              @click="openEditModal(selectedStudent)"
              class="rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 p-2 text-slate-300 hover:text-white transition shadow active:scale-95"
              title="O'quvchi ma'lumotlarini tahrirlash"
            >
              ✏️
            </button>
            <button
              type="button"
              @click="openParentAlert(selectedStudent)"
              class="rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/25 p-2 text-sky-300 transition shadow active:scale-95"
              title="Ota-onasiga Telegram orqali xabar yuborish"
            >
              ✉️
            </button>
            <button
              type="button"
              @click="openReminderModal(selectedStudent)"
              class="rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 p-2 text-indigo-300 transition shadow active:scale-95"
              title="O'quvchi bo'yicha eslatma qo'shish"
            >
              🔔
            </button>
          </div>
        </div>

        <!-- Doska Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-black/50 border border-white/10 text-xs">
          <button
            type="button"
            @click="activeDoskaTab = 'overview'"
            class="flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
            :class="activeDoskaTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          >
            <span>👤 Shaxsiy & Aloqa</span>
          </button>
          <button
            type="button"
            @click="activeDoskaTab = 'attendance'"
            class="flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
            :class="activeDoskaTab === 'attendance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          >
            <span>📅 Davomat</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono font-bold">
              {{ selectedStudentAttendanceData.percent }}%
            </span>
          </button>
          <button
            type="button"
            @click="activeDoskaTab = 'history'"
            class="flex-1 py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5"
            :class="activeDoskaTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'"
          >
            <span>📈 Natijalar</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 font-mono font-bold">
              {{ selectedStudentHistory.length || selectedStudent.totalTests || 0 }} ta
            </span>
          </button>
        </div>

        <!-- ================= TAB 1: SHAXSIY & ALOQA ================= -->
        <div v-if="activeDoskaTab === 'overview'" class="space-y-3">
          <!-- 4 Key Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <div class="text-[10px] uppercase font-bold text-slate-400">Aniqlik</div>
              <div class="text-lg font-black text-emerald-400">{{ selectedStudent.avgAccuracy || 0 }}%</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <div class="text-[10px] uppercase font-bold text-slate-400">Darslar</div>
              <div class="text-lg font-black text-white">{{ selectedStudent.totalTests || 0 }} ta</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <div class="text-[10px] uppercase font-bold text-slate-400">Strikylar</div>
              <div class="text-lg font-black text-yellow-400">⭐ {{ selectedStudent.strikes || 0 }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <div class="text-[10px] uppercase font-bold text-slate-400">Jarimalar</div>
              <div class="text-lg font-black text-red-400">⚠️ {{ selectedStudent.penalties || 0 }}</div>
            </div>
          </div>

          <!-- Enrolled Groups Management Card inside Doska -->
          <div class="rounded-2xl border border-indigo-500/30 bg-indigo-950/25 p-4 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-wider text-indigo-300">📚 A'zo Bo'lgan Guruhlari</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {{ getStudentGroupList(selectedStudent).length }} ta guruh
                </span>
              </div>

              <!-- Quick Add Group Select -->
              <div class="flex items-center gap-2">
                <select
                  v-if="availableGroupsToAdd(selectedStudent).length > 0"
                  @change="handleQuickAddGroupToSelectedStudent($event)"
                  class="text-xs bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-indigo-600/50 transition font-bold"
                >
                  <option value="" disabled selected>+ Boshqa guruhga qo'shish...</option>
                  <option
                    v-for="g in availableGroupsToAdd(selectedStudent)"
                    :key="g.name"
                    :value="g.name"
                  >
                    ➕ {{ g.name }}
                  </option>
                </select>
                <span v-else class="text-[11px] text-slate-500 italic">
                  Barcha mavjud guruhlarga a'zo
                </span>
              </div>
            </div>

            <!-- Group Badges with Remove Option -->
            <div class="flex flex-wrap items-center gap-2">
              <div
                v-for="(grp, gIdx) in getStudentGroupList(selectedStudent)"
                :key="grp"
                class="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm"
                :class="gIdx === 0 ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-200' : 'border-white/10 bg-black/40 text-slate-200'"
              >
                <span>👥 {{ grp }}</span>
                <span v-if="gIdx === 0" class="text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-black">
                  Asosiy
                </span>
                <button
                  type="button"
                  @click="handleRemoveGroupFromSelectedStudent(grp)"
                  class="ml-1 text-slate-400 hover:text-rose-400 p-0.5 transition"
                  title="Guruhdan chiqarish"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Personal Contacts & Family Card -->
          <div class="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-300">📞 Aloqa va Oila Ma'lumotlari</span>
              <button
                type="button"
                @click="openEditModal(selectedStudent)"
                class="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                ✏️ Tahrirlash
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <!-- Student Phone -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">📱 O'quvchi Telefoni</span>
                <div v-if="selectedStudent.phone" class="flex items-center justify-between gap-1 flex-wrap">
                  <a :href="'tel:' + selectedStudent.phone" class="font-mono text-white font-bold hover:text-indigo-400">
                    {{ selectedStudent.phone }}
                  </a>
                  <div class="flex items-center gap-1">
                    <a :href="'tel:' + selectedStudent.phone" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30">
                      📞 Qo'ng'iroq
                    </a>
                    <a :href="'sms:' + selectedStudent.phone" class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30">
                      💬 SMS
                    </a>
                  </div>
                </div>
                <div v-else class="text-slate-500 italic text-[11px] flex items-center justify-between">
                  <span>Kiritilmagan</span>
                  <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[10px] font-bold hover:underline">
                    + Kiritish
                  </button>
                </div>
              </div>

              <!-- Parent Name -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">👨‍👩‍👧 Ota-onasi (F.I.SH)</span>
                <div class="text-white font-semibold truncate">
                  {{ selectedStudent.parentName || "Kiritilmagan" }}
                </div>
              </div>

              <!-- Parent Phone -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">📞 Ota-ona Telefoni</span>
                <div v-if="selectedStudent.parentPhone" class="flex items-center justify-between gap-1 flex-wrap">
                  <a :href="'tel:' + selectedStudent.parentPhone" class="font-mono text-white font-bold hover:text-indigo-400">
                    {{ selectedStudent.parentPhone }}
                  </a>
                  <div class="flex items-center gap-1">
                    <a :href="'tel:' + selectedStudent.parentPhone" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30">
                      📞 Qo'ng'iroq
                    </a>
                    <a :href="'sms:' + selectedStudent.parentPhone" class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500/30">
                      💬 SMS
                    </a>
                  </div>
                </div>
                <div v-else class="text-slate-500 italic text-[11px] flex items-center justify-between">
                  <span>Kiritilmagan</span>
                  <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[10px] font-bold hover:underline">
                    + Kiritish
                  </button>
                </div>
              </div>

              <!-- Parent Telegram -->
              <div class="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">💬 Ota-ona Telegrami</span>
                <div v-if="selectedStudent.parentTg" class="flex items-center justify-between">
                  <a
                    :href="'https://t.me/' + selectedStudent.parentTg.replace('@', '')"
                    target="_blank"
                    class="text-sky-400 font-bold hover:underline truncate max-w-[120px]"
                  >
                    {{ selectedStudent.parentTg.startsWith('@') ? selectedStudent.parentTg : '@' + selectedStudent.parentTg }}
                  </a>
                  <a
                    :href="'https://t.me/' + selectedStudent.parentTg.replace('@', '')"
                    target="_blank"
                    class="text-[10px] px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold hover:bg-sky-500/30"
                  >
                    💬 Yozish
                  </a>
                </div>
                <div v-else class="text-slate-500 italic text-[11px] flex items-center justify-between">
                  <span>Kiritilmagan</span>
                  <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[10px] font-bold hover:underline">
                    + Kiritish
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Credentials Card (Ready to Copy/Share) -->
          <div class="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-indigo-300">🔑 O'quvchi Kirish Kartasi</span>
              <button
                type="button"
                @click="copyCredentials(selectedStudent)"
                class="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 shadow transition"
              >
                📋 Nusxalash
              </button>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
              <div class="bg-black/50 p-2.5 rounded-xl border border-white/10">
                <span class="text-[10px] text-slate-400 block font-sans">Login (Zaxira):</span>
                <span class="text-white font-bold">{{ selectedStudent.login || selectedStudent.name.toLowerCase().replace(/\s+/g, '_') }}</span>
              </div>
              <div class="bg-black/50 p-2.5 rounded-xl border border-amber-500/30">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] text-amber-300 block font-sans font-bold">🔢 6 Xonali PIN:</span>
                  <button
                    type="button"
                    @click="handleRegeneratePin(selectedStudent)"
                    class="text-[9px] text-indigo-400 hover:text-indigo-300 font-sans font-bold"
                    title="Yangi PIN generatsiya qilish"
                  >
                    ⚡️ Yangilash
                  </button>
                </div>
                <span class="text-amber-300 font-black text-sm tracking-widest">{{ selectedStudent.pin || selectedStudent.password || '123456' }}</span>
              </div>
            </div>

            <!-- Pattern status & Reset Action in Detail Modal -->
            <div class="rounded-xl border border-white/10 bg-white/5 p-2.5 flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 font-sans">
                <span class="text-slate-400 text-[11px]">Grafik Kalit (Pattern):</span>
                <span
                  class="px-2 py-0.5 rounded-md font-bold text-[10px]"
                  :class="selectedStudent.pattern ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'"
                >
                  {{ selectedStudent.pattern ? '🟢 O\'rnatilgan' : '⏳ O\'rnatilmagan' }}
                </span>
              </div>
              <button
                v-if="selectedStudent.pattern"
                type="button"
                @click="handleResetPattern(selectedStudent)"
                class="rounded-lg bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 active:scale-95 transition"
                title="Patternni tozalash, o'quvchi qayta o'rnatishi uchun"
              >
                🔄 Patternni Tozalash
              </button>
            </div>
          </div>

          <!-- Teacher Notes / Dossier Characteristics -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>📝 O'qituvchi Xarakteristikasi & Eslatmasi</span>
              </div>
              <button
                type="button"
                @click="openEditModal(selectedStudent)"
                class="text-[10px] text-indigo-400 hover:underline font-bold"
              >
                ✏️ {{ selectedStudent.notes ? "Tahrirlash" : "+ Eslatma yozish" }}
              </button>
            </div>
            <p v-if="selectedStudent.notes" class="text-xs text-slate-300 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
              {{ selectedStudent.notes }}
            </p>
            <p v-else class="text-xs text-slate-500 italic">
              O'quvchi bo'yicha maxsus pedagogik eslatma yoki xarakteristika kiritilmagan.
            </p>
          </div>
        </div>

        <!-- ================= TAB 2: DAVOMAT JURNALI ================= -->
        <div v-if="activeDoskaTab === 'attendance'" class="space-y-3">
          <!-- Attendance Stats -->
          <div class="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black uppercase tracking-wider text-slate-300">📅 Davomat Ko'rsatkichlari</span>
                <span
                  class="px-2 py-0.5 text-[11px] font-black rounded-full"
                  :class="selectedStudentAttendanceData.percent >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : selectedStudentAttendanceData.percent >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
                >
                  {{ selectedStudentAttendanceData.percent }}% davomat
                </span>
              </div>
              <span class="text-xs font-bold text-slate-400">
                {{ selectedStudentAttendanceData.total }} ta dars
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="selectedStudentAttendanceData.percent >= 80 ? 'bg-emerald-500' : selectedStudentAttendanceData.percent >= 60 ? 'bg-amber-500' : 'bg-rose-500'"
                :style="{ width: `${selectedStudentAttendanceData.percent}%` }"
              ></div>
            </div>

            <!-- 3 Stats Pills -->
            <div class="grid grid-cols-3 gap-2">
              <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-center">
                <div class="text-base font-black text-emerald-400">✅ {{ selectedStudentAttendanceData.present }}</div>
                <div class="text-[10px] font-semibold text-slate-400">Qatnashdi</div>
              </div>
              <div class="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-center">
                <div class="text-base font-black text-amber-400">🟡 {{ selectedStudentAttendanceData.excused }}</div>
                <div class="text-[10px] font-semibold text-slate-400">Sababli</div>
              </div>
              <div class="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-center">
                <div class="text-base font-black text-rose-400">❌ {{ selectedStudentAttendanceData.unexcused }}</div>
                <div class="text-[10px] font-semibold text-slate-400">Sababsiz</div>
              </div>
            </div>

            <!-- Recent Attendance History Logs -->
            <div v-if="selectedStudentAttendanceData.logs && selectedStudentAttendanceData.logs.length > 0" class="pt-2 border-t border-white/10 space-y-1.5">
              <div class="text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>Darslar davomati jurnali ({{ selectedStudentAttendanceData.logs.length }} ta)</span>
                <span class="text-[10px] text-slate-500">Sana bo'yicha</span>
              </div>
              <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                <div
                  v-for="(log, idx) in selectedStudentAttendanceData.logs"
                  :key="idx"
                  class="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs hover:border-white/15 transition"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="font-mono text-xs font-bold text-indigo-300 shrink-0">🗓️ {{ log.date }}</span>
                    <span class="text-slate-300 text-xs truncate">{{ log.topic || 'Dars' }}</span>
                  </div>
                  <span
                    class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ml-2"
                    :class="log.status === 'Keldi' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : log.status === 'Sababli' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
                  >
                    {{ log.status === 'Keldi' ? '✅ Keldi' : log.status === 'Sababli' ? '🟡 Sababli' : '❌ Sababsiz' }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else-if="selectedStudentAttendanceData.total === 0" class="pt-1 text-center text-xs text-slate-500 italic py-4">
              Hozircha davomat yozuvlari kiritilmagan
            </div>
          </div>
        </div>

        <!-- ================= TAB 3: AKADEMIK NATIJALAR & BAHOLAR ================= -->
        <div v-if="activeDoskaTab === 'history'" class="space-y-3">
          <div class="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-300">
                📈 Topshirilgan Sinovlar Tarixi ({{ selectedStudentHistory.length }} ta)
              </span>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-slate-400">O'rtacha:</span>
                <span class="font-bold text-emerald-400">{{ selectedStudent.avgAccuracy || 0 }}%</span>
              </div>
            </div>

            <div v-if="selectedStudentHistory.length > 0" class="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <div
                v-for="(h, idx) in selectedStudentHistory"
                :key="idx"
                class="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition text-xs space-y-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="font-mono text-xs font-bold text-indigo-300 shrink-0">🗓️ {{ h.date || "Avvalgi dars" }}</span>
                    <span class="text-white font-semibold truncate">{{ formatCleanTopicName(h.topic || (h.book ? `${h.book} darsi` : "Savol-Javob Darsi")) }}</span>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded-lg text-xs font-black shrink-0 ml-2"
                    :class="(parseFloat(h.percent) || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : (parseFloat(h.percent) || 0) >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
                  >
                    {{ Math.round(parseFloat(h.percent) || 0) }}%
                  </span>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <div class="flex items-center gap-3">
                    <span>Natija: <b class="text-white">{{ h.correct || Math.round(((parseFloat(h.percent) || 0) / 100) * (parseInt(h.total) || 10)) }} / {{ h.total || 10 }}</b></span>
                    <span v-if="h.coin" class="text-amber-400 font-bold">🪙 +{{ h.coin }}</span>
                    <span v-if="h.strike && parseInt(h.strike) > 0" class="text-yellow-400 font-bold">⭐ +{{ h.strike }}</span>
                  </div>
                  <span v-if="h.time" class="text-slate-500 font-mono text-[10px]">⏰ {{ h.time }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-xs text-slate-500 italic">
              Bu o'quvchi bo'yicha hali darslar yoki test natijalari yozuvi mavjud emas.
            </div>
          </div>
        </div>

      </div>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 4: ADD REMINDER MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showReminderModal"
      title="🔔 O'qituvchi uchun Eslatma Qo'shish"
    >
      <form @submit.prevent="saveReminder" class="space-y-4 py-2">
        <div v-if="reminderTargetStudent" class="rounded-xl bg-blue-500/15 border border-blue-500/30 p-3 text-xs text-blue-300 flex items-center gap-2">
          <span>👤</span>
          <span>Biriktirilgan o'quvchi: <b>{{ reminderTargetStudent.name }}</b> ({{ reminderTargetStudent.group }})</span>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Eslatma sarlavhasi *</label>
          <input
            v-model="formReminder.title"
            type="text"
            required
            placeholder="Masalan: Ota-onasi bilan oylik to'lov va yutuqlar haqida suhbat"
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <!-- Date & Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Sana *</label>
            <input
              v-model="formReminder.date"
              type="date"
              required
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Vaqt *</label>
            <input
              v-model="formReminder.time"
              type="time"
              required
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Type -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Eslatma turi</label>
          <select
            v-model="formReminder.type"
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="call">📞 Ota-onaga qo'ng'iroq</option>
            <option value="payment">💳 Oylik to'lov</option>
            <option value="lesson">📖 Qo'shimcha dars / Vazifa</option>
            <option value="warning">⚠️ Ogohlantirish / Intizom</option>
            <option value="other">📌 Boshqa eslatma</option>
          </select>
        </div>

        <!-- Note -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Qo'shimcha izoh</label>
          <textarea
            v-model="formReminder.note"
            rows="2"
            placeholder="Qo'shimcha tafsilotlar..."
            class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showReminderModal = false"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            class="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 active:scale-95 transition"
          >
            Eslatma Qo'shish 🔔
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 5: ALL REMINDERS LIST MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showRemindersListModal"
      title="🔔 Barcha O'qituvchi Eslatmalari"
    >
      <div class="py-2 space-y-3">
        <div v-if="teacherStore.reminders.value.length === 0" class="py-8 text-center text-xs text-slate-500">
          Hozircha saqlangan eslatmalar yo'q.
        </div>

        <div
          v-for="rem in teacherStore.reminders.value"
          :key="rem.id"
          class="rounded-2xl border p-3.5 space-y-2 transition"
          :class="
            rem.completed
              ? 'border-white/5 bg-black/20 opacity-60'
              : isReminderDue(rem)
              ? 'border-red-500/40 bg-red-950/30 shadow-lg shadow-red-500/10'
              : 'border-white/10 bg-black/40'
          "
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-black" :class="rem.completed ? 'line-through text-slate-400' : 'text-white'">
                  {{ rem.title }}
                </span>
                <span
                  v-if="isReminderDue(rem) && !rem.completed"
                  class="rounded-md bg-red-500/20 border border-red-500/40 px-1.5 py-0.5 text-[9px] font-black text-red-400"
                >
                  ⚠️ Vaqti keldi!
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>📅 {{ rem.date }} soat {{ rem.time }}</span>
                <span v-if="rem.studentName">• 👤 {{ rem.studentName }} ({{ rem.group }})</span>
              </div>
              <p v-if="rem.note" class="text-xs text-slate-300 italic pt-1">{{ rem.note }}</p>
            </div>

            <!-- Toggle complete & Delete buttons -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="teacherStore.toggleCompleteReminder(rem.id)"
                class="rounded-xl px-2.5 py-1.5 text-xs font-bold transition shadow"
                :class="
                  rem.completed
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                "
              >
                {{ rem.completed ? '↩️ Qaytarish' : '✅ Bajarildi' }}
              </button>
              <button
                type="button"
                @click="teacherStore.deleteReminder(rem.id)"
                class="rounded-xl bg-red-500/20 border border-red-500/30 p-1.5 text-xs text-red-400 hover:bg-red-500/30"
                title="O'chirish"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 6: PARENT ALERT / TELEGRAM NOTIFICATION MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showParentAlertModal"
      title="✈️ Ota-onaga Telegram Xabarnomasi"
    >
      <div v-if="parentAlertStudent" class="py-2 space-y-4">
        <!-- Target Info -->
        <div class="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-indigo-300">O'quvchi: <b>{{ parentAlertStudent.name }}</b></span>
            <span class="text-slate-400">{{ parentAlertStudent.group }}</span>
          </div>
          <div class="text-xs text-slate-300 flex items-center gap-2">
            <span>👨‍👩‍👧 Ota-onasi: <b>{{ parentAlertStudent.parentName || 'Vasiy' }}</b></span>
            <span v-if="parentAlertStudent.parentPhone">({{ parentAlertStudent.parentPhone }})</span>
            <span v-if="parentAlertStudent.parentTg" class="text-blue-400 font-bold">{{ parentAlertStudent.parentTg }}</span>
          </div>
        </div>

        <!-- Template Selector -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-2">Xabarnoma shabloni:</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="setAlertTemplate('result')"
              class="rounded-xl border p-2.5 text-xs font-bold text-left transition"
              :class="alertTemplate === 'result' ? 'border-blue-500 bg-blue-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'"
            >
              📊 Dars Natijasi
            </button>
            <button
              type="button"
              @click="setAlertTemplate('warning')"
              class="rounded-xl border p-2.5 text-xs font-bold text-left transition"
              :class="alertTemplate === 'warning' ? 'border-red-500 bg-red-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'"
            >
              ⚠️ Ogohlantirish & Davomat
            </button>
            <button
              type="button"
              @click="setAlertTemplate('payment')"
              class="rounded-xl border p-2.5 text-xs font-bold text-left transition"
              :class="alertTemplate === 'payment' ? 'border-amber-500 bg-amber-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'"
            >
              💳 To'lov Eslatmasi
            </button>
            <button
              type="button"
              @click="setAlertTemplate('praise')"
              class="rounded-xl border p-2.5 text-xs font-bold text-left transition"
              :class="alertTemplate === 'praise' ? 'border-emerald-500 bg-emerald-600/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'"
            >
              🌟 Maqtov & Yutuq
            </button>
          </div>
        </div>

        <!-- Generated Message Text Area -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Xabar matni (tahrirlashingiz mumkin):</label>
          <textarea
            v-model="generatedAlertText"
            rows="6"
            class="w-full rounded-2xl border border-white/15 bg-black/60 p-3.5 font-sans text-xs text-white leading-relaxed outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <!-- Notification Status -->
        <div v-if="tgSent" class="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
          ✅ Xabarnoma bot orqali muvaffaqiyatli yuborildi!
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-1">
          <div class="flex flex-col sm:flex-row gap-2">
            <!-- 1. Copy button -->
            <button
              type="button"
              @click="copyAlertText"
              class="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition"
            >
              📋 Matnni nusxalash
            </button>

            <!-- 2. Send via Bot API button (Direct text dispatch) -->
            <button
              type="button"
              @click="sendViaTelegramBot"
              :disabled="sendingTg"
              class="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-purple-500 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              <span>✈️</span>
              <span>{{ tgSent ? "Qayta yuborish 🚀" : sendingTg ? "Yuborilmoqda... ⏳" : "Telegramdan yuborish" }}</span>
            </button>
          </div>

          <!-- Secondary link to open in Telegram app if parent has username -->
          <div v-if="parentAlertStudent.parentTg" class="pt-1 text-center">
            <button
              type="button"
              @click="sendViaTelegramApp"
              class="text-blue-400 hover:underline text-[11px] font-semibold"
            >
              Telegram ilovasida ochish ({{ parentAlertStudent.parentTg }}) ↗️
            </button>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Phone & Contact Recovery Modal -->
    <BaseModal
      v-model="showPhoneRecoveryModal"
      title="📱 Telefon Raqamlar va Ma'lumotlarni Tiklash Markazi"
      custom-class="max-w-3xl w-full"
    >
      <div class="space-y-4 py-1">
        <!-- Status summary counter cards -->
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div class="rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
            <div class="text-[10px] uppercase font-bold text-slate-400">Jami O'quvchilar</div>
            <div class="text-lg sm:text-2xl font-black text-white mt-0.5">
              {{ teacherStore.allStudentsRegistry.value.length }}
            </div>
          </div>
          <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
            <div class="text-[10px] uppercase font-bold text-emerald-400">Telefonli O'quvchilar</div>
            <div class="text-lg sm:text-2xl font-black text-emerald-400 mt-0.5">
              {{ studentsWithPhoneCount }} ta
            </div>
          </div>
          <div class="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3 text-center">
            <div class="text-[10px] uppercase font-bold text-rose-400">Telefoni Kiritilmagan</div>
            <div class="text-lg sm:text-2xl font-black text-rose-400 mt-0.5">
              {{ studentsWithoutPhoneCount }} ta
            </div>
          </div>
        </div>

        <!-- Mode selector tabs -->
        <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs">
          <button
            type="button"
            @click="recoveryActiveTab = 'scan'"
            class="flex-1 rounded-xl py-2 font-bold transition text-center flex items-center justify-center gap-1.5"
            :class="recoveryActiveTab === 'scan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>🔍</span>
            <span>1. Lokal Xotirani Skanerlash</span>
          </button>
          <button
            type="button"
            @click="recoveryActiveTab = 'import'"
            class="flex-1 rounded-xl py-2 font-bold transition text-center flex items-center justify-center gap-1.5"
            :class="recoveryActiveTab === 'import' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📋</span>
            <span>2. Matn / Exceldan Import</span>
          </button>
          <button
            type="button"
            @click="recoveryActiveTab = 'quick'"
            class="flex-1 rounded-xl py-2 font-bold transition text-center flex items-center justify-center gap-1.5"
            :class="recoveryActiveTab === 'quick' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>✏️</span>
            <span>3. Yetishmayotganlar ({{ studentsWithoutPhoneCount }})</span>
          </button>
        </div>

        <!-- TAB 1: DEEP LOCALSTORAGE SCANNER -->
        <div v-if="recoveryActiveTab === 'scan'" class="rounded-2xl border border-blue-500/20 bg-blue-950/15 p-4 sm:p-5 space-y-3">
          <div class="flex items-start gap-3">
            <span class="text-2xl">🧠</span>
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-white">Brauzer Lokal Xotirasini (LocalStorage) Chuqur Qidiruv</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Ushbu vosita brauzeringizdagi dars sessiyalari tarixi, davomat jurnali yozuvlari, eski o'quvchilar ro'yxati va zaxira kalitlarining barchasini chuqur skanerlab chiqadi va yo'qolgan telefon raqamlarini qayta tiklaydi.
              </p>
            </div>
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="triggerDeepScanFromModal"
              class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>Lokal Xotirani Chuqur Skanerlash va Tiklash</span>
            </button>
          </div>

          <!-- Scan result report -->
          <div v-if="recoveryDeepScanResult" class="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs space-y-1.5">
            <div class="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>✅</span>
              <span>Skanerlash muvaffaqiyatli yakunlandi!</span>
            </div>
            <div class="text-slate-300">
              Tekshirilgan xotira kalitlari soni: <b>{{ recoveryDeepScanResult.scannedKeysCount }}</b> ta.
            </div>
            <div class="text-slate-300">
              Yangi topilgan va tiklangan kontaktlar: <b class="text-emerald-400">{{ recoveryDeepScanResult.recoveredContactsCount }}</b> ta.
            </div>
            <div class="text-slate-300">
              Hozirgi vaqtda bazada telefon raqami mavjud o'quvchilar: <b class="text-emerald-400">{{ recoveryDeepScanResult.totalStudentsWithPhone }}</b> ta.
            </div>
          </div>
        </div>

        <!-- TAB 2: BULK IMPORT TEXT / EXCEL -->
        <div v-if="recoveryActiveTab === 'import'" class="rounded-2xl border border-purple-500/20 bg-purple-950/15 p-4 sm:p-5 space-y-3">
          <div class="flex items-start gap-3">
            <span class="text-2xl">📋</span>
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-white">Matn, Telegram yoki Excel jadvalidan telefonlarni import qilish</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Agar sizda telefon raqamlari yozilgan boshqa ro'yxat yoki fayl bo'lsa, quyidagi maydonga har bir qatorga bittadan o'quvchi va uning telefonini nusxalab tashlang. Tizim ismni o'zi moslab, telefonni biriktiradi.
              </p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">
              Namuna: <code>Zumrad Abdukaimova, +998901234567, +998907654321</code> (Vergul, nuqta-vergul yoki Tab bilan ajratilgan)
            </label>
            <textarea
              v-model="bulkPhoneInputText"
              rows="6"
              placeholder="Zumrad Abdukaimova, +998901234567&#10;Zulayho, +998931112233&#10;Zuhra Komilova, +998945556677, +998978889900"
              class="w-full rounded-2xl border border-white/15 bg-black/60 p-3 font-mono text-xs text-white outline-none focus:border-purple-500 custom-scrollbar"
            ></textarea>
          </div>

          <div class="flex items-center justify-between gap-3 pt-1">
            <span v-if="bulkImportResultMsg" class="text-xs font-bold text-emerald-400">
              {{ bulkImportResultMsg }}
            </span>
            <span v-else class="text-[11px] text-slate-400">
              Ismlar katta-kichikligidan qat'i nazar bazadagi o'quvchilar bilan solishtiriladi.
            </span>
            <button
              type="button"
              @click="handleBulkPhoneImport"
              class="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-500 active:scale-95 transition shadow-md shrink-0"
            >
              📥 Telefonlarni Bazaga Biriktirish
            </button>
          </div>
        </div>

        <!-- TAB 3: QUICK EDIT MISSING PHONES -->
        <div v-if="recoveryActiveTab === 'quick'" class="rounded-2xl border border-amber-500/20 bg-amber-950/15 p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="text-xs font-bold text-white">
              Telefoni kiritilmagan o'quvchilar ro'yxati ({{ studentsWithoutPhoneList.length }} ta)
            </div>
            <input
              v-model="phoneMissingSearch"
              type="text"
              placeholder="🔍 Ism bo'yicha qidirish..."
              class="rounded-xl border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 w-48"
            />
          </div>

          <div class="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div v-if="studentsWithoutPhoneList.length === 0" class="py-8 text-center text-xs text-emerald-400 font-bold">
              🎉 Barcha o'quvchilarning telefon raqamlari to'liq kiritilgan!
            </div>
            <div
              v-for="st in studentsWithoutPhoneList"
              :key="st.name"
              class="rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div class="min-w-0 flex-1">
                <span
                  @click="openStudentDetail(st)"
                  class="font-bold text-white hover:text-indigo-400 hover:underline cursor-pointer truncate block"
                  title="Shaxsiy doskasini ochish"
                >
                  {{ st.name }}
                </span>
                <span class="text-[10px] text-slate-400">{{ st.group || 'Umumiy' }}</span>
              </div>

              <!-- Quick input fields -->
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  type="text"
                  :placeholder="'O\'quvchi tel'"
                  v-model="st.phone"
                  class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white font-mono w-28 sm:w-32 outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  :placeholder="'Ota-ona tel'"
                  v-model="st.parentPhone"
                  class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-emerald-300 font-mono w-28 sm:w-32 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  @click="saveSingleMissingPhone(st, st.phone || '', st.parentPhone)"
                  class="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                  title="Saqlash"
                >
                  💾
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
    <!-- VIEW 2: DEDICATED GROUP CRM HUB FULL-PAGE VIEW -->
    <!-- ======================================================== -->
    <div v-if="managerView === 'group-hub' && selectedGroupHubName" class="space-y-6 animate-fade-in">
      <!-- Dedicated Group Hub Navigation Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="closeGroupHub"
            class="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition shadow"
            title="Guruhlar ro'yxatiga qaytish"
          >
            <span>⬅️</span>
            <span>Guruhlar Ro'yxatiga Qaytish</span>
          </button>
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>📚</span> «{{ selectedGroupHubName }}» Guruhi Boshqaruv Markazi
            </h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>O'quvchilar CRM</span>
              <span>/</span>
              <span>Guruhlar</span>
              <span>/</span>
              <span class="text-indigo-400 font-bold">{{ selectedGroupHubName }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4 py-1">
        <!-- Group Header Card with Quick Stats & Actions -->
        <div class="rounded-3xl border border-white/10 bg-slate-950/90 p-4 sm:p-5 space-y-4 shadow-xl">
          <!-- Top Hero Action Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
            <!-- Left: Group Meta & Quick Actions -->
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-xl px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border"
                :class="
                  isCurrentGroupAllFrozen
                    ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                "
              >
                {{ isCurrentGroupAllFrozen ? '❄️ Muzlagan Guruh' : '🟢 Faol Guruh' }}
              </span>

              <!-- Copy All Credentials for Telegram -->
              <button
                type="button"
                @click="copyAllGroupCredentials(selectedGroupHubName)"
                class="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600/40 active:scale-95 transition"
                title="Guruh o'quvchilari login va PIN kodlarini Telegram formatida nusxalash"
              >
                <span>📋</span> <span>Login-Parollarni nusxalash</span>
              </button>

              <!-- Toggle Freeze Group -->
              <button
                type="button"
                @click="toggleGroupFreeze(selectedGroupHubName, !isCurrentGroupAllFrozen)"
                class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 border"
                :class="
                  isCurrentGroupAllFrozen
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                "
              >
                <span>{{ isCurrentGroupAllFrozen ? '☀️ Eritish' : '❄️ Muzlatish' }}</span>
              </button>
            </div>

            <!-- Right: Prominent START LESSON Hero Button -->
            <button
              type="button"
              @click="startLessonWithGroup(selectedGroupHubName)"
              class="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 transition shrink-0 ring-2 ring-emerald-400/30"
            >
              <span class="text-base animate-pulse">🚀</span>
              <span>DARSNI BOSHLASH</span>
            </button>
          </div>

          <!-- Bottom Row: 4 Metric Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col justify-center">
              <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">O'quvchilar</div>
              <div class="text-xl font-black text-white mt-0.5">{{ currentGroupStudents.length }} ta</div>
            </div>
            <div class="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3 flex flex-col justify-center">
              <div class="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Faollar</div>
              <div class="text-xl font-black text-emerald-400 mt-0.5">{{ currentGroupActiveCount }} ta</div>
            </div>
            <div class="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 flex flex-col justify-center">
              <div class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">O'rtacha Natija</div>
              <div class="text-xl font-black text-amber-300 mt-0.5">{{ currentGroupAvgAccuracy }}%</div>
            </div>
            <div class="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3 flex flex-col justify-center">
              <div class="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Jami Tangalar</div>
              <div class="text-xl font-black text-purple-300 mt-0.5">🪙 {{ currentGroupTotalCoins }}</div>
            </div>
          </div>
        </div>

        <!-- Group Hub Segmented Tabs -->
        <div class="flex rounded-2xl bg-black/50 p-1.5 border border-white/10 gap-1 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            @click="activeGroupTab = 'schedule'"
            class="flex-1 min-w-[105px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'schedule' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📅</span> <span>Dars jadvali</span>
          </button>
          <button
            type="button"
            @click="activeGroupTab = 'stats'"
            class="flex-1 min-w-[105px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'stats' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📊</span> <span>O'zlashtirish</span>
          </button>
          <button
            type="button"
            @click="activeGroupTab = 'students'"
            class="flex-1 min-w-[110px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>👥</span> <span>O'quvchilar ({{ currentGroupStudents.length }})</span>
          </button>
          <button
            type="button"
            @click="activeGroupTab = 'manual_test'"
            class="flex-1 min-w-[90px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'manual_test' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📝</span> <span>Test</span>
          </button>
          <button
            type="button"
            @click="activeGroupTab = 'history'"
            class="flex-1 min-w-[105px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'history' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>📜</span> <span>Dars tarixi</span>
          </button>
          <button
            type="button"
            @click="activeGroupTab = 'payments'"
            class="flex-1 min-w-[90px] whitespace-nowrap rounded-xl py-2 px-2.5 text-xs font-extrabold transition flex items-center justify-center gap-1.5 shrink-0"
            :class="activeGroupTab === 'payments' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>💳</span> <span>To'lov</span>
          </button>
        </div>

        <!-- ============================================ -->
        <!-- TAB 1: SCHEDULE & REMINDERS -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'schedule'" class="space-y-4">
          <!-- Schedule Editor Card -->
          <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>⏰</span> Dars Vaqti va Haftalik Kunlar
              </h4>
              <button
                type="button"
                @click="saveGroupSchedule"
                class="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-black text-white hover:bg-blue-500 active:scale-95 transition shadow"
              >
                Saqlash 💾
              </button>
            </div>

            <!-- Days Selector Chips -->
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-2">Haftalik dars kunlari:</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="d in ['Du', 'Se', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak']"
                  :key="d"
                  type="button"
                  @click="toggleScheduleDay(d)"
                  class="rounded-xl px-3 py-2 text-xs font-bold border transition"
                  :class="
                    groupScheduleForm.days?.includes(d)
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  "
                >
                  {{ d }}
                </button>
              </div>
            </div>

            <!-- Time, Room, Subject Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-400 mb-1">Dars vaqti:</label>
                <input
                  v-model="groupScheduleForm.time"
                  type="text"
                  placeholder="14:00 - 15:30"
                  class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 mb-1">Xona / Manzil:</label>
                <input
                  v-model="groupScheduleForm.room"
                  type="text"
                  placeholder="3-xona / Online"
                  class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-400 mb-1">Darslik / Fan:</label>
                <input
                  v-model="groupScheduleForm.subject"
                  type="text"
                  placeholder="O'zbekiston Tarixi"
                  class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Group Notes -->
            <div>
              <label class="block text-xs font-bold text-slate-400 mb-1">Guruh haqida o'qituvchi eslatmasi (Reja):</label>
              <textarea
                v-model="groupScheduleForm.note"
                rows="2"
                placeholder="Guruhning umumiy maqsadi yoki vazifalari..."
                class="w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-xs text-white outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Group Reminders Section -->
          <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 space-y-3">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <span>🔔</span> Guruh Eslatmalari & Katta Testlar
              </h4>
              <span class="text-xs text-slate-400">{{ (currentGroupMeta.reminders || []).length }} ta eslatma</span>
            </div>

            <!-- Add reminder inline -->
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="newGroupReminderText"
                type="text"
                placeholder="Eslatma matni (masalan: 8-bob nazorat ishi)..."
                class="flex-1 rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500"
              />
              <input
                v-model="newGroupReminderDate"
                type="date"
                class="rounded-2xl border border-white/15 bg-black/50 px-3 py-2.5 text-xs text-purple-300 outline-none focus:border-purple-500"
              />
              <button
                type="button"
                @click="addReminderToCurrentGroup"
                class="rounded-2xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 active:scale-95 transition shadow"
              >
                + Qo'shish
              </button>
            </div>

            <!-- Reminders List -->
            <div class="space-y-2 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
              <div v-if="!currentGroupMeta.reminders || currentGroupMeta.reminders.length === 0" class="py-6 text-center text-xs text-slate-500">
                Ushbu guruh uchun maxsus eslatmalar qo'shilmagan
              </div>
              <div
                v-for="rem in currentGroupMeta.reminders"
                :key="rem.id"
                class="flex items-center justify-between rounded-2xl border p-3 text-xs transition"
                :class="rem.completed ? 'border-white/5 bg-black/20 opacity-60' : 'border-purple-500/30 bg-purple-950/20'"
              >
                <div class="space-y-0.5">
                  <div class="font-bold text-white" :class="{ 'line-through text-slate-400': rem.completed }">
                    {{ rem.text }}
                  </div>
                  <div class="text-[10px] text-purple-300">📅 {{ rem.date }}</div>
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="teacherStore.toggleCompleteGroupReminder(selectedGroupHubName, rem.id)"
                    class="rounded-xl px-2.5 py-1 text-[11px] font-bold transition shadow"
                    :class="rem.completed ? 'bg-white/10 text-slate-300' : 'bg-emerald-600 text-white'"
                  >
                    {{ rem.completed ? '↩️ Qaytarish' : '✅ Bajarildi' }}
                  </button>
                  <button
                    type="button"
                    @click="teacherStore.deleteGroupReminder(selectedGroupHubName, rem.id)"
                    class="rounded-xl bg-red-500/20 text-red-400 p-1.5 text-xs hover:bg-red-500/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- TAB 2: MASTERY & STATS -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'stats'" class="space-y-4">
          <!-- Top 3 Leaders in this Group -->
          <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>🏆</span> Guruh Peshqadamlari (Top O'quvchilar)
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                v-for="(st, idx) in currentGroupTopLeaders"
                :key="st.name"
                class="rounded-2xl border p-3.5 text-center space-y-1 relative overflow-hidden"
                :class="
                  idx === 0
                    ? 'border-amber-500/40 bg-amber-950/20 shadow-amber-500/10'
                    : idx === 1
                    ? 'border-slate-300/30 bg-slate-900/40'
                    : 'border-amber-700/30 bg-amber-950/10'
                "
              >
                <div class="text-xl">
                  {{ idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉' }}
                </div>
                <div
                  @click="openStudentDetail(st)"
                  class="font-extrabold text-sm text-white truncate cursor-pointer hover:text-indigo-400 hover:underline transition"
                  title="Shaxsiy doskasini ochish"
                >
                  {{ st.name }}
                </div>
                <div class="text-xs font-black text-amber-400">🪙 {{ st.coins || 0 }} tanga</div>
                <div class="text-[10px] text-emerald-400 font-bold">{{ st.avgAccuracy || 0 }}% aniqlik</div>
              </div>
            </div>
          </div>

          <!-- Group Performance Table -->
          <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 space-y-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>📊</span> O'quvchilar Ko'rsatkichlari Jadvali
            </h4>
            <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-1 custom-scrollbar">
              <table class="w-full text-center text-xs text-slate-200 border-collapse">
                <thead>
                  <tr class="border-b border-white/10 text-[11px] font-black text-slate-400">
                    <th class="px-3 py-2.5 text-left">O'quvchi</th>
                    <th class="px-3 py-2.5">Aniqlik</th>
                    <th class="px-3 py-2.5">Tangalar</th>
                    <th class="px-3 py-2.5">Strikes ⭐</th>
                    <th class="px-3 py-2.5">Holati</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="st in currentGroupStudents"
                    :key="st.name"
                    class="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td class="px-3 py-2.5 text-left font-bold text-white">
                      <span
                        @click="openStudentDetail(st)"
                        class="cursor-pointer hover:text-indigo-400 hover:underline transition"
                        title="Shaxsiy doskasini ochish"
                      >
                        {{ st.name }}
                      </span>
                    </td>
                    <td class="px-3 py-2.5 font-black text-emerald-400">{{ st.avgAccuracy || 0 }}%</td>
                    <td class="px-3 py-2.5 font-black text-amber-400">🪙 {{ st.coins || 0 }}</td>
                    <td class="px-3 py-2.5 font-black text-yellow-400">⭐ {{ st.strikes || 0 }}</td>
                    <td class="px-3 py-2.5">
                      <span
                        class="rounded-md px-2 py-0.5 text-[10px] font-bold"
                        :class="st.status === 'frozen' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-emerald-500/20 text-emerald-300'"
                      >
                        {{ st.status === 'frozen' ? '❄️ Muzlagan' : '🟢 Faol' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- TAB 3: GROUP STUDENTS & CREDENTIALS -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'students'" class="space-y-3">
          <!-- Add Student Directly to this group -->
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400">
              Ushbu guruhdagi barcha o'quvchilar ({{ currentGroupStudents.length }})
            </span>
            <button
              type="button"
              @click="openAddStudentToGroup"
              class="flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition shadow"
            >
              <span>➕</span> <span>Guruhga o'quvchi qo'shish</span>
            </button>
          </div>

          <!-- Students List Cards -->
          <div class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="st in currentGroupStudents"
              :key="st.name"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3 text-xs transition"
              :class="st.status === 'frozen' ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-white/10 bg-black/40'"
            >
              <div class="flex items-center gap-3">
                <div
                  @click="openStudentDetail(st)"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow cursor-pointer hover:scale-105 transition"
                  :class="st.status === 'frozen' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-600 text-white'"
                  title="Shaxsiy doskasini ochish"
                >
                  {{ st.status === 'frozen' ? '❄️' : st.name.charAt(0).toUpperCase() }}
                </div>
                <div class="space-y-0.5">
                  <div
                    @click="openStudentDetail(st)"
                    class="font-bold text-white text-sm cursor-pointer hover:text-indigo-400 hover:underline transition"
                    title="Shaxsiy doskasini ochish"
                  >
                    {{ st.name }}
                  </div>
                  <div class="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span class="text-amber-300 font-bold">🔢 PIN: {{ st.pin || st.password || '123456' }}</span>
                    <span>•</span>
                    <span class="font-sans text-[10px]" :class="st.pattern ? 'text-emerald-400 font-bold' : 'text-slate-500'">
                      {{ st.pattern ? '🟢 Pattern' : '⏳ Kutilmoqda' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <!-- Copy Single Student Credentials -->
                <button
                  type="button"
                  @click="copyCredentials(st)"
                  class="rounded-xl bg-white/5 border border-white/10 p-2 text-xs text-slate-300 hover:bg-white/10"
                  title="Login va PIN nusxalash"
                >
                  📋
                </button>
                <!-- Transfer Group -->
                <button
                  type="button"
                  @click="openTransferModal(st)"
                  class="rounded-xl bg-amber-500/20 border border-amber-500/30 p-2 text-xs text-amber-300 hover:bg-amber-500/30"
                  title="Boshqa guruhga ko'chirish"
                >
                  🔄
                </button>
                <!-- Toggle Freeze -->
                <button
                  type="button"
                  @click="toggleFreeze(st)"
                  class="rounded-xl p-2 text-xs font-bold border"
                  :class="st.status === 'frozen' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'"
                  :title="st.status === 'frozen' ? 'Eritish' : 'Muzlatish'"
                >
                  {{ st.status === 'frozen' ? '☀️' : '❄️' }}
                </button>
                <!-- Edit -->
                <button
                  type="button"
                  @click="openEditModal(st)"
                  class="rounded-xl bg-white/5 border border-white/10 p-2 text-xs text-slate-300 hover:bg-white/10"
                  title="Tahrirlash"
                >
                  ✏️
                </button>
                <!-- Delete -->
                <button
                  type="button"
                  @click="confirmDelete(st)"
                  class="rounded-xl bg-red-500/20 border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/30"
                  title="O'chirish"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- TAB 4: MANUAL TEST ENTRY & BOT SENDER -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'manual_test'" class="space-y-4">
          <!-- Test Parameters Card -->
          <div class="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5 space-y-3">
            <div class="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
              <h4 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <span>📝</span> O'tkazilgan Test Natijalarini Qo'lda Kiritish
              </h4>
              <span class="text-xs text-slate-400 font-mono">{{ currentGroupActiveCount }} nafar faol o'quvchi</span>
            </div>

            <!-- Parameters Grid: Date, Book, Topic, Test Type, Max Questions -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <!-- Date -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">📅 Test Sanasi:</label>
                <input
                  v-model="manualTestDate"
                  type="date"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-purple-300 outline-none focus:border-purple-500"
                />
              </div>

              <!-- Book / Darslik (Multi-select) -->
              <div class="relative">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-bold text-slate-300">📚 Darsliklar:</label>
                  <div class="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      @click="selectAllBooks"
                      class="text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                    >
                      Barchasi
                    </button>
                    <span class="text-slate-600">•</span>
                    <button
                      type="button"
                      @click="clearBooks"
                      class="text-slate-400 hover:text-slate-200 font-bold hover:underline"
                    >
                      Tozalash
                    </button>
                  </div>
                </div>

                <!-- Multi-select trigger button -->
                <button
                  type="button"
                  @click="showBookDropdown = !showBookDropdown"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-purple-500 flex items-center justify-between gap-2 text-left"
                >
                  <span class="truncate">{{ getSelectedBooksLabel() }}</span>
                  <span class="text-[10px] text-slate-400 shrink-0">{{ showBookDropdown ? '▲' : '▼' }}</span>
                </button>

                <!-- Multi-select dropdown panel -->
                <div
                  v-if="showBookDropdown"
                  class="absolute top-full left-0 mt-1.5 w-72 sm:w-80 rounded-2xl border border-cyan-500/30 bg-slate-950 p-3 shadow-2xl z-50 space-y-2 backdrop-blur-2xl"
                >
                  <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span class="text-[11px] font-bold text-slate-300">Darsliklarni tanlang (multi-select):</span>
                    <button
                      type="button"
                      @click="showBookDropdown = false"
                      class="text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Book Pills Grid -->
                  <div class="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    <button
                      v-for="b in BOOK_LIST"
                      :key="b"
                      type="button"
                      @click="toggleBookSelection(b)"
                      class="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold border transition text-left"
                      :class="
                        isBookSelected(b)
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      "
                    >
                      <span class="text-xs">{{ isBookSelected(b) ? '✓' : '○' }}</span>
                      <span class="truncate">{{ b }}</span>
                    </button>
                  </div>

                  <!-- Custom Source input -->
                  <div class="pt-1.5 border-t border-white/10 flex items-center gap-1.5">
                    <input
                      v-model="manualTestCustomBook"
                      type="text"
                      placeholder="Boshqa manba (ixtiyoriy)..."
                      class="w-full rounded-xl border border-white/15 bg-black/70 px-2.5 py-1 text-[11px] text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Topic / Mavzu -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">📖 Test Mavzusi:</label>
                <input
                  v-model="manualTestTitle"
                  type="text"
                  placeholder="Masalan: 8-bob: Amir Temur davlati"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-white outline-none focus:border-purple-500"
                />
              </div>

              <!-- Test Turi (5 ta rasmiy test turi) -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">🏷️ Test Turi:</label>
                <select
                  v-model="manualTestType"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-amber-300 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Mavzulashgan">🎯 Mavzulashgan</option>
                  <option value="DTM">🏛️ DTM</option>
                  <option value="MOCK">⚡ MOCK</option>
                  <option value="Oylik imtihon">📅 Oylik imtihon</option>
                  <option value="Konkurs test">🏆 Konkurs test</option>
                </select>
              </div>

              <!-- Max Questions -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">🎯 Max Savollar:</label>
                <input
                  v-model.number="manualTestMaxQ"
                  type="number"
                  min="1"
                  max="500"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-amber-300 outline-none focus:border-purple-500 text-center"
                />
              </div>
            </div>
          </div>

          <!-- Students Test Entry Table -->
          <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-4 sm:p-5 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <h5 class="text-xs font-black text-slate-300">O'quvchilarning to'g'ri javoblari soni (ballari):</h5>
                <span
                  v-if="currentGroupStudents.length - currentGroupActiveStudents.length > 0"
                  class="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-bold text-cyan-300"
                  title="Muzlatilgan o'quvchilar test ballari va hisobotidan avtomatik chiqarilgan"
                >
                  ❄️ {{ currentGroupStudents.length - currentGroupActiveStudents.length }} ta muzlatilgan chetlatildi
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="showAddGuestModal = true"
                  class="flex items-center gap-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-600 hover:text-white transition active:scale-95"
                >
                  <span>➕</span>
                  <span>Boshqa guruhdan chaqirish</span>
                  <span
                    v-if="extraTestStudents.length > 0"
                    class="rounded-full bg-purple-500 text-white px-1.5 py-0.2 text-[10px] font-black"
                  >
                    {{ extraTestStudents.length }}
                  </span>
                </button>
                <span class="text-[11px] text-slate-500 font-bold whitespace-nowrap">Maks: {{ manualTestMaxQ }} ta</span>
              </div>
            </div>

            <div class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-if="testEntryStudents.length === 0"
                class="py-8 text-center text-xs text-slate-500 space-y-1"
              >
                <div class="text-2xl">👥</div>
                <div>Guruhda faol o'quvchilar yo'q yoki barchasi muzlatilgan.</div>
                <div class="text-[11px] text-purple-400">Yuqoridagi tugma orqali boshqa guruhdan o'quvchi taklif qilishingiz mumkin.</div>
              </div>

              <div
                v-for="st in testEntryStudents"
                :key="st.name"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-3 text-xs transition"
                :class="
                  getManualTestScore(st.name).attStatus === 'Sababsiz'
                    ? 'border-red-500/30 bg-red-950/20'
                    : getManualTestScore(st.name).attStatus === 'Sababli'
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-white/10 bg-black/40'
                "
              >
                <!-- Student Name & Status & Guest Tag -->
                <div class="space-y-0.5 min-w-[160px]">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white text-sm">{{ st.name }}</span>
                    <span
                      v-if="st.group && st.group.toLowerCase().trim() !== (selectedGroupHubName || '').toLowerCase().trim()"
                      class="rounded-md bg-purple-500/20 border border-purple-500/40 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 flex items-center gap-1"
                    >
                      <span>Mehmon:</span>
                      <b>{{ st.group }}</b>
                      <button
                        type="button"
                        @click="removeGuestStudent(st.name)"
                        class="text-red-400 hover:text-red-300 ml-1 font-black text-xs"
                        title="Ushbu testdan chiqarish"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-400">
                    Avvalgi o'rtacha aniqligi: <b class="text-slate-300">{{ st.avgAccuracy || 0 }}%</b>
                  </div>
                </div>

                <!-- Score Inputs & Controls -->
                <div class="flex items-center gap-3 flex-wrap">
                  <!-- Attendance status toggle buttons -->
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      @click="setManualTestAtt(st.name, 'Keldi')"
                      class="rounded-xl px-2.5 py-1 text-[11px] font-bold transition"
                      :class="getManualTestScore(st.name).attStatus === 'Keldi' ? 'bg-emerald-600 text-white font-black shadow' : 'bg-white/5 text-slate-400'"
                    >
                      Keldi
                    </button>
                    <button
                      type="button"
                      @click="setManualTestAtt(st.name, 'Sababsiz')"
                      class="rounded-xl px-2 py-1 text-[11px] font-bold transition"
                      :class="getManualTestScore(st.name).attStatus === 'Sababsiz' ? 'bg-red-600 text-white font-black shadow' : 'bg-white/5 text-slate-400'"
                    >
                      Kelmadi
                    </button>
                  </div>

                  <!-- Correct answers input -->
                  <div v-if="getManualTestScore(st.name).attStatus === 'Keldi'" class="flex items-center gap-1.5">
                    <span class="text-slate-400 text-[11px]">To'g'ri:</span>
                    <input
                      type="number"
                      min="0"
                      :max="manualTestMaxQ"
                      :value="getManualTestScore(st.name).correct"
                      @input="updateManualTestScore(st.name, ($event.target as HTMLInputElement).value)"
                      class="w-16 rounded-xl border border-white/20 bg-black/80 px-2.5 py-1.5 text-xs font-black text-amber-300 text-center outline-none focus:border-purple-500"
                    />
                    <span class="text-slate-500">/ {{ manualTestMaxQ }}</span>

                    <!-- Calculated Percent -->
                    <div
                      class="rounded-xl px-2.5 py-1 font-black text-xs min-w-[50px] text-center ml-1"
                      :class="
                        calcManualTestPercent(st.name) >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : calcManualTestPercent(st.name) >= 60
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      "
                    >
                      {{ calcManualTestPercent(st.name) }}%
                    </div>
                  </div>

                  <div v-else class="text-xs font-bold text-red-400 px-3">
                    Darsda qatnashmadi
                  </div>
                </div>
              </div>
            </div>

            <!-- Ustoz AI Xulosasi (Gemini orqali o'quvchilarning ota-onalari uchun) -->
            <div class="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-base">🧠</span>
                  <div>
                    <h5 class="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-2">
                      <span>Ustoz AI Xulosasi (Ota-onalar uchun)</span>
                      <span class="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[9px] font-bold lowercase">
                        gemini
                      </span>
                    </h5>
                    <p class="text-[11px] text-slate-400">
                      Gemini natijalarni pedagog kabi o'qib, ota-onalar uchun samimiy va tavsiyaviy xulosa yozadi
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="handleGenerateAiSummary"
                  :disabled="generatingAiSummary || testEntryStudents.length === 0"
                  class="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-50 transition"
                >
                  <span v-if="generatingAiSummary" class="animate-spin">⏳</span>
                  <span v-else>✨</span>
                  <span>{{ generatingAiSummary ? "Gemini tahlil qilmoqda..." : "Gemini orqali xulosa olish" }}</span>
                </button>
              </div>

              <div class="relative">
                <textarea
                  v-model="manualTestAiSummary"
                  rows="3"
                  placeholder="Gemini AI bu yerda natijalarni tahlil qilib, ota-onalar uchun pedagogik xulosa tayyorlaydi. Xabarni yuborishdan oldin ko'rib chiqishingiz yoki o'zingiz tahrirlashingiz mumkin. (Agar bo'sh qoldirilsa, yuborishda avtomatik to'ldiriladi)..."
                  class="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500/60 focus:outline-none focus:ring-1 focus:ring-purple-500/60 transition resize-y"
                ></textarea>
                <div v-if="manualTestAiSummary" class="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>💡 Ushbu xulosa Telegram xabariga kiritiladi. O'qituvchi sifatida matnni tahrirlashingiz mumkin.</span>
                  <button
                    type="button"
                    @click="manualTestAiSummary = ''"
                    class="text-rose-400 hover:underline hover:text-rose-300 font-medium"
                  >
                    Tozalash
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
              <div v-if="manualTestSent" class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>✅</span> <span>Natijalar tizimga saqlandi va Telegram orqali yuborildi!</span>
              </div>
              <div v-else class="text-xs text-slate-400">
                Natijalarni saqlash bazaga yozadi va bot orqali guruhga yetkazadi.
              </div>

              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  @click="copyManualTestTelegramText"
                  class="flex-1 sm:flex-initial rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition"
                >
                  📋 Matnni nusxalash
                </button>

                <button
                  type="button"
                  @click="submitManualTestResults"
                  :disabled="sendingManualTestTg"
                  class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 active:scale-95 disabled:opacity-50 transition"
                >
                  <span>🚀</span>
                  <span>{{ sendingManualTestTg ? "Saqlanmoqda... ⏳" : "Saqlash va Botga Yuborish ✈️" }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- TAB 5: LESSONS & TESTS DETAILED HISTORY + LINEGRAPH + AI INSIGHTS -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'history'" class="space-y-4">
          <!-- Header & History Mode Filter Tabs -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-2">
                <span>📜</span> Dars va Testlar Tarixi & AI Tahlil
              </h4>
              <p class="text-[11px] text-slate-400">Guruhning o'zlashtirish dinamikasi va kunma-kun dars bayonnomalari</p>
            </div>

            <!-- History Sub-filters -->
            <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs self-start sm:self-auto">
              <button
                type="button"
                @click="historyModeFilter = 'all'"
                class="rounded-xl px-3 py-1.5 font-bold transition"
                :class="historyModeFilter === 'all' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'"
              >
                Hammasi ({{ currentGroupSessions.length }})
              </button>
              <button
                type="button"
                @click="historyModeFilter = 'lessons'"
                class="rounded-xl px-3 py-1.5 font-bold transition"
                :class="historyModeFilter === 'lessons' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
              >
                🎮 Darslar ({{ historyLessonsCount }})
              </button>
              <button
                type="button"
                @click="historyModeFilter = 'tests'"
                class="rounded-xl px-3 py-1.5 font-bold transition"
                :class="historyModeFilter === 'tests' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'"
              >
                📝 Testlar ({{ historyTestsCount }})
              </button>
            </div>
          </div>

          <!-- Month Selector Pills (Oyma-oy ko'rish) -->
          <div v-if="availableGroupMonths.length > 0" class="rounded-2xl border border-white/10 bg-slate-900/60 p-2.5 space-y-2">
            <div class="flex items-center justify-between text-xs px-1">
              <span class="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                <span>📅</span> <span>Oylar Bo'yicha Tahlil</span>
              </span>
              <span class="text-[10px] text-slate-500 font-mono">Tanlangan oy bo'yicha grafik va tahlil</span>
            </div>

            <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <!-- All Months Pill -->
              <button
                type="button"
                @click="historyMonthFilter = 'all'"
                class="group flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 border"
                :class="
                  historyMonthFilter === 'all'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black shadow-lg shadow-teal-500/30 border-teal-400/50'
                    : 'bg-black/50 text-slate-300 border-white/10 hover:border-teal-500/40 hover:bg-white/5 hover:text-white'
                "
              >
                <span>🌐</span>
                <span>Barcha oylar</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black transition"
                  :class="historyMonthFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white/10 text-teal-300 group-hover:bg-teal-500/20'"
                >
                  {{ currentGroupSessions.length }}
                </span>
              </button>

              <!-- Month Pills -->
              <button
                v-for="m in availableGroupMonths"
                :key="m.key"
                type="button"
                @click="historyMonthFilter = m.key"
                class="group flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap shrink-0 border"
                :class="
                  historyMonthFilter === m.key
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black shadow-lg shadow-teal-500/30 border-teal-400/50'
                    : 'bg-black/50 text-slate-300 border-white/10 hover:border-teal-500/40 hover:bg-white/5 hover:text-white'
                "
              >
                <span>📅</span>
                <span>{{ m.label }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black transition"
                  :class="historyMonthFilter === m.key ? 'bg-white/20 text-white' : 'bg-white/10 text-emerald-300 group-hover:bg-emerald-500/20'"
                >
                  {{ m.count }}
                </span>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="currentGroupSessions.length === 0" class="py-12 text-center rounded-3xl border border-white/5 bg-black/20 space-y-2">
            <div class="text-3xl">📂</div>
            <div class="text-xs font-bold text-slate-300">Ushbu guruhda o'tkazilgan darslar tarixi mavjud emas</div>
            <p class="text-[11px] text-slate-500">Dars o'tib natijalarni saqlaganingizda yoki test kiritganingizda bu yerda to'liq bayonnomasi chiqadi</p>
          </div>

          <div v-else class="space-y-4">
            <!-- 1. Interactive Linegraph & Trend Card -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Line Chart Canvas (2 Cols) -->
              <div class="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/90 p-4 space-y-2 flex flex-col justify-between">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span>📈</span> <span>O'zlashtirish Dinamikasi Grafigi</span>
                  </div>
                  <span
                    class="rounded-xl px-2.5 py-1 text-[11px] font-black border"
                    :class="
                      groupAiAnalysis.trendStatus === 'positive'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : groupAiAnalysis.trendStatus === 'negative'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    "
                  >
                    {{ groupAiAnalysis.trendText }}
                  </span>
                </div>

                <div class="h-44 w-full relative">
                  <canvas ref="groupHistoryChartRef"></canvas>
                </div>
              </div>

              <!-- Quick Mastery Stats Sidebar (1 Col) -->
              <div class="rounded-3xl border border-teal-500/20 bg-teal-950/20 p-4 space-y-3 flex flex-col justify-between text-xs">
                <div>
                  <div class="text-[10px] uppercase font-bold text-teal-300 tracking-wider">Guruh Umumiy Aniqligi</div>
                  <div class="text-3xl font-black text-white mt-1">{{ currentGroupAvgAccuracy }}%</div>
                  <p class="text-[11px] text-slate-400 mt-1">Jami {{ currentGroupSessions.length }} ta dars va test natijasi asosida</p>
                </div>

                <!-- Strong & Weak Topics -->
                <div class="space-y-2 border-t border-teal-500/20 pt-2.5">
                  <div v-if="groupAiAnalysis.strongTopics.length > 0">
                    <span class="text-[10px] uppercase font-bold text-emerald-400">🔥 Eng kuchli mavzu:</span>
                    <div class="text-[11px] font-bold text-white truncate">
                      {{ groupAiAnalysis.strongTopics[0].name }} ({{ groupAiAnalysis.strongTopics[0].score }}%)
                    </div>
                  </div>
                  <div v-if="groupAiAnalysis.weakTopics.length > 0">
                    <span class="text-[10px] uppercase font-bold text-amber-400">⚠️ Takrorlash kerak:</span>
                    <div class="text-[11px] font-bold text-slate-200 truncate">
                      {{ groupAiAnalysis.weakTopics[0].name }} ({{ groupAiAnalysis.weakTopics[0].score }}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. AI Pedagogical Insights & Analytics Card -->
            <div class="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/90 p-5 space-y-3 shadow-xl">
              <div class="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                <h5 class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <span>🧠</span> Sun'iy Intellekt (AI) O'quv Tahlili & Xulosasi
                </h5>
                <span class="text-[10px] font-mono bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-lg">
                  Avto-generatsiya
                </span>
              </div>

              <!-- AI Narrative Summary -->
              <p class="text-xs text-slate-200 leading-relaxed">
                {{ groupAiAnalysis.aiSummary }}
              </p>

              <!-- Top & Attention Students Pills -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <!-- Top Performers -->
                <div class="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3 space-y-1">
                  <div class="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>🌟</span> <span>Yetakchi O'quvchilar:</span>
                  </div>
                  <div v-if="groupAiAnalysis.topPerformers.length > 0" class="flex flex-wrap gap-1.5 pt-0.5">
                    <span
                      v-for="st in groupAiAnalysis.topPerformers"
                      :key="st.name"
                      class="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200"
                    >
                      {{ st.name }} ({{ st.avgAccuracy }}%)
                    </span>
                  </div>
                  <div v-else class="text-[11px] text-slate-400">Barcha o'quvchilar o'rtacha darajada</div>
                </div>

                <!-- Needs Attention -->
                <div class="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-3 space-y-1">
                  <div class="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>⚠️</span> <span>E'tibor Talab Qiluvchilar:</span>
                  </div>
                  <div v-if="groupAiAnalysis.attentionStudents.length > 0" class="flex flex-wrap gap-1.5 pt-0.5">
                    <span
                      v-for="st in groupAiAnalysis.attentionStudents"
                      :key="st.name"
                      class="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-200"
                    >
                      {{ st.name }} ({{ st.avgAccuracy }}%)
                    </span>
                  </div>
                  <div v-else class="text-[11px] text-emerald-400 font-bold">Barcha o'quvchilar 60% dan yuqori natijada! 🎉</div>
                </div>
              </div>

              <!-- Pedagogical Advice for Teacher -->
              <div class="rounded-2xl bg-black/40 border border-white/10 p-3 text-xs flex items-start gap-2.5">
                <span class="text-base shrink-0">💡</span>
                <div>
                  <span class="font-black text-amber-300">Ustoz uchun AI Tavsiyasi: </span>
                  <span class="text-slate-300">{{ groupAiAnalysis.advice }}</span>
                </div>
              </div>
            </div>

            <!-- 3. Chronological Sessions List -->
            <div class="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="sess in filteredGroupSessions"
                :key="sess.id"
                class="rounded-2xl border border-white/10 bg-slate-900/90 p-4 space-y-3 transition hover:border-teal-500/40 shadow-md"
              >
                <!-- Session Header Summary -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div class="space-y-0.5">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="rounded-lg px-2 py-0.5 text-[10px] font-black"
                        :class="
                          sess.mode?.includes('Test') || sess.mode === 'manual_test'
                            ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                            : 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
                        "
                      >
                        {{ sess.mode }}
                      </span>
                      <span v-if="sess.book" class="rounded-lg bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        📚 {{ sess.book }}
                      </span>
                      <span class="font-extrabold text-sm text-white">
                        {{ sess.topic || "Mavzulashtirilgan Dars" }}
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>📅 {{ sess.date }}</span>
                      <span>•</span>
                      <span>⏰ {{ sess.time }}</span>
                      <span>•</span>
                      <span>👨‍🏫 {{ sess.teacher }}</span>
                      <span>•</span>
                      <span>👥 {{ sess.studentResults.length }} nafar</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-start sm:self-auto">
                    <div class="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-center">
                      <div class="text-[9px] text-slate-400 uppercase font-bold">O'rtacha</div>
                      <div class="text-xs font-black text-emerald-400">{{ sess.avgPercent }}%</div>
                    </div>
                    <button
                      type="button"
                      @click="toggleExpandSession(sess.id)"
                      class="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
                    >
                      {{ expandedSessionIds.includes(sess.id) ? "▲ Yopish" : "▼ Tafsilotlar" }}
                    </button>
                  </div>
                </div>

                <!-- Expanded Detailed Student Scores Table -->
                <div v-if="expandedSessionIds.includes(sess.id)" class="pt-1">
                  <div class="overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-1 custom-scrollbar">
                    <table class="w-full text-center text-xs text-slate-200 border-collapse">
                      <thead>
                        <tr class="border-b border-white/10 text-[10px] font-black text-slate-400 uppercase">
                          <th class="px-3 py-2 text-left">O'quvchi</th>
                          <th class="px-3 py-2">Savollar / Ball</th>
                          <th class="px-3 py-2">Foiz (%)</th>
                          <th class="px-3 py-2">⭐ Strikes</th>
                          <th class="px-3 py-2">🪙 Tangalar</th>
                          <th class="px-3 py-2">Davomat</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="res in sess.studentResults"
                          :key="res.name"
                          class="border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <td class="px-3 py-2 text-left font-bold text-white">{{ res.name }}</td>
                          <td class="px-3 py-2 font-mono font-bold text-slate-300">{{ res.correct }} / {{ res.total }}</td>
                          <td class="px-3 py-2 font-black" :class="res.percent >= 80 ? 'text-emerald-400' : res.percent >= 50 ? 'text-amber-400' : 'text-red-400'">
                            {{ res.percent }}%
                          </td>
                          <td class="px-3 py-2 font-bold text-yellow-400">{{ res.strikes ? '⭐ ' + res.strikes : '-' }}</td>
                          <td class="px-3 py-2 font-bold text-amber-400">🪙 +{{ res.coins || 0 }}</td>
                          <td class="px-3 py-2">
                            <span
                              class="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                              :class="res.attStatus === 'Sababsiz' ? 'bg-red-500/20 text-red-300' : res.attStatus === 'Sababli' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'"
                            >
                              {{ res.attStatus || 'Keldi' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================ -->
        <!-- TAB 6: PAYMENT TRACKER -->
        <!-- ============================================ -->
        <div v-if="activeGroupTab === 'payments'" class="space-y-4">
          <!-- Fee Setting Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4 text-xs">
            <div>
              <div class="font-bold text-white text-sm">Oylik Kurs To'lovi:</div>
              <div class="text-[11px] text-slate-400">Har bir o'quvchi uchun standart oylik narx</div>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="currentGroupMeta.paymentFee"
                type="number"
                class="w-32 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-emerald-400 text-center outline-none"
              />
              <span class="text-xs font-bold text-slate-300">so'm</span>
              <button
                type="button"
                @click="saveGroupSchedule"
                class="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Saqlash 💾
              </button>
            </div>
          </div>

          <!-- Student Payments List -->
          <div class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <div
              v-for="st in currentGroupStudents"
              :key="st.name"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-white/10 bg-black/40 p-3 text-xs"
            >
              <div class="space-y-0.5">
                <div class="font-bold text-white">{{ st.name }}</div>
                <div class="text-[11px] text-slate-400">
                  <span v-if="getStudentPayment(st.name)?.paidDate">To'langan sana: {{ getStudentPayment(st.name)?.paidDate }}</span>
                  <span v-else>To'lov kutilmoqda</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Status Switch Buttons -->
                <button
                  type="button"
                  @click="setPaymentStatus(st.name, 'paid')"
                  class="rounded-xl px-3 py-1.5 text-xs font-bold transition"
                  :class="
                    getStudentPayment(st.name)?.status === 'paid'
                      ? 'bg-emerald-600 text-white shadow font-black'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  "
                >
                  ✅ To'landi
                </button>
                <button
                  type="button"
                  @click="setPaymentStatus(st.name, 'pending')"
                  class="rounded-xl px-3 py-1.5 text-xs font-bold transition"
                  :class="
                    getStudentPayment(st.name)?.status === 'pending'
                      ? 'bg-amber-600 text-white shadow font-black'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  "
                >
                  ⏳ Kutilmoqda
                </button>
                <button
                  type="button"
                  @click="setPaymentStatus(st.name, 'debt')"
                  class="rounded-xl px-3 py-1.5 text-xs font-bold transition"
                  :class="
                    getStudentPayment(st.name)?.status === 'debt'
                      ? 'bg-red-600 text-white shadow font-black'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  "
                >
                  ⚠️ Qarz
                </button>

                <!-- Telegram Alert button for payment -->
                <button
                  type="button"
                  @click="openParentAlert(st); setAlertTemplate('payment')"
                  class="rounded-xl bg-purple-600/25 border border-purple-500/40 p-1.5 text-purple-300 hover:bg-purple-600/40"
                  title="Ota-onasiga to'lov eslatmasini yuborish"
                >
                  🔔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Return Button -->
      <div class="flex justify-end pt-2 pb-6">
        <button
          type="button"
          @click="closeGroupHub"
          class="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition shadow"
        >
          <span>⬅️</span>
          <span>Guruhlar Ro'yxatiga Qaytish</span>
        </button>
      </div>
    </div>
    <!-- /VIEW 2: DEDICATED GROUP CRM HUB FULL-PAGE VIEW -->

    <!-- ======================================================== -->
    <!-- VIEW 3: DEDICATED STUDENT DOSKA FULL-PAGE VIEW -->
    <!-- ======================================================== -->
    <div v-if="managerView === 'student-doska' && selectedStudent" class="space-y-6 animate-fade-in">
      <!-- Top Navigation & Action Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="closeStudentDoska"
            class="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition shadow shrink-0"
            title="O'quvchilar ro'yxatiga qaytish"
          >
            <span>⬅️</span>
            <span>Ro'yxatga Qaytish</span>
          </button>
          <div class="min-w-0">
            <h2 class="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 truncate">
              <span>🪪</span> {{ selectedStudent.name }} — Shaxsiy Doskasi
            </h2>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
              <span>O'quvchilar CRM</span>
              <span>/</span>
              <span class="text-indigo-400 font-bold">Shaxsiy Doska</span>
              <span>/</span>
              <span class="text-emerald-400 font-bold">{{ selectedStudent.name }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Excel Export for this student -->
          <button
            type="button"
            @click="exportSingleStudentDoskaToExcel(selectedStudent)"
            class="flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-600/20 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 active:scale-95 transition shadow-md"
            title="Ushbu o'quvchining dars va test natijalari hamda davomatini Excel (.xlsx) fayl qilib yuklab olish"
          >
            <span>📥</span>
            <span>Natijalarni Excelga Yuklash</span>
          </button>

          <!-- Edit Student -->
          <button
            type="button"
            @click="openEditModal(selectedStudent)"
            class="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition shadow-md"
            title="O'quvchi ma'lumotlarini tahrirlash"
          >
            <span>✏️</span>
            <span>Tahrirlash</span>
          </button>

          <!-- Telegram Message to Parent -->
          <button
            type="button"
            @click="openParentAlert(selectedStudent)"
            class="flex items-center gap-1.5 rounded-2xl border border-sky-500/30 bg-sky-600/20 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-600/30 active:scale-95 transition shadow-md"
            title="Ota-onasiga Telegram orqali xabar yoki natija yuborish"
          >
            <span>✉️</span>
            <span>Ota-onaga Xabar</span>
          </button>

          <!-- Add Reminder -->
          <button
            type="button"
            @click="openReminderModal(selectedStudent)"
            class="flex items-center gap-1.5 rounded-2xl border border-purple-500/30 bg-purple-600/20 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-600/30 active:scale-95 transition shadow-md"
            title="O'quvchi bo'yicha eslatma qo'shish"
          >
            <span>🔔</span>
            <span>Eslatma</span>
          </button>

          <!-- Freeze / Unfreeze -->
          <button
            type="button"
            @click="toggleFreeze(selectedStudent)"
            class="flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold active:scale-95 transition shadow-md"
            :class="selectedStudent.status === 'frozen' ? 'border border-emerald-500/30 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30' : 'border border-cyan-500/30 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30'"
            :title="selectedStudent.status === 'frozen' ? 'O\'quvchini qayta faollashtirish' : 'O\'quvchini muzlatish'"
          >
            <span>{{ selectedStudent.status === 'frozen' ? '☀️' : '❄️' }}</span>
            <span>{{ selectedStudent.status === 'frozen' ? 'Eritish' : 'Muzlatish' }}</span>
          </button>
        </div>
      </div>

      <!-- Hero Student Profile Banner -->
      <div class="rounded-3xl border border-white/10 bg-slate-950/90 p-5 sm:p-6 shadow-xl space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-white/10 pb-5">
          <!-- Left: Big Avatar + Info -->
          <div class="flex items-center gap-4">
            <div class="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-3xl text-white font-black shadow-xl shadow-indigo-600/30 shrink-0">
              <span>{{ selectedStudent.name.charAt(0).toUpperCase() }}</span>
              <span
                class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold border-2 border-slate-950 shadow"
                :class="selectedStudent.status === 'frozen' ? 'bg-cyan-500 text-slate-950' : 'bg-emerald-500 text-slate-950'"
                :title="selectedStudent.status === 'frozen' ? 'Muzlatilgan' : 'Faol'"
              >
                {{ selectedStudent.status === 'frozen' ? '❄️' : '✓' }}
              </span>
            </div>

            <div class="space-y-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h3 class="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {{ selectedStudent.name }}
                </h3>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
                  :class="selectedStudent.status === 'frozen' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'"
                >
                  {{ selectedStudent.status === 'frozen' ? '❄️ Muzlatilgan' : '🟢 Faol' }}
                </span>
              </div>

              <!-- Enrolled Groups with quick add/remove -->
              <div class="flex flex-wrap items-center gap-1.5 pt-1">
                <span class="text-xs text-slate-400 font-bold">Guruhlari:</span>
                <span
                  v-for="(grp, gIdx) in getStudentGroupList(selectedStudent)"
                  :key="grp"
                  class="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold transition shadow-sm"
                  :class="gIdx === 0 ? 'border-indigo-500/40 bg-indigo-600/25 text-indigo-200' : 'border-white/10 bg-black/40 text-slate-200'"
                >
                  <span>📚 {{ grp }}</span>
                  <span v-if="gIdx === 0" class="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.2 rounded uppercase font-black">
                    Asosiy
                  </span>
                  <button
                    type="button"
                    @click="handleRemoveGroupFromSelectedStudent(grp)"
                    class="ml-0.5 text-slate-400 hover:text-rose-400 transition"
                    title="Guruhdan chiqarish"
                  >
                    ✕
                  </button>
                </span>

                <!-- Quick add group dropdown -->
                <select
                  v-if="availableGroupsToAdd(selectedStudent).length > 0"
                  @change="handleQuickAddGroupToSelectedStudent($event)"
                  class="text-[11px] bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:bg-indigo-600/50 transition font-bold"
                >
                  <option value="" disabled selected>+ Guruh qo'shish...</option>
                  <option
                    v-for="g in availableGroupsToAdd(selectedStudent)"
                    :key="g.name"
                    :value="g.name"
                  >
                    ➕ {{ g.name }}
                  </option>
                </select>
              </div>

              <div class="text-[11px] text-slate-500 font-medium pt-0.5">
                <span>📅 A'zo bo'lgan sana: </span>
                <b class="text-slate-400">{{ selectedStudent.joinedDate || "Faol a'zo" }}</b>
              </div>
            </div>
          </div>

          <!-- Right: Credentials Card with copy & regenerate -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-black/40 border border-white/10 p-3 rounded-2xl">
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-3">
                <span class="text-[10px] uppercase font-bold text-slate-400">Kirish PIN Kodi</span>
                <button
                  type="button"
                  @click="handleRegeneratePin(selectedStudent)"
                  class="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  title="Yangi 6 xonali PIN generatsiya qilish"
                >
                  ⚡️ Yangilash
                </button>
              </div>
              <div class="text-base sm:text-lg font-black text-amber-300 font-mono tracking-widest flex items-center gap-2">
                <span>🔢 {{ selectedStudent.pin || selectedStudent.password || '123456' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:border-l sm:border-white/10 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <button
                type="button"
                @click="copyCredentials(selectedStudent)"
                class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition shadow"
                title="Kirish ma'lumotlarini nusxalash"
              >
                <span>📋</span>
                <span>PIN Nusxalash</span>
              </button>

              <button
                v-if="selectedStudent.pattern"
                type="button"
                @click="handleResetPattern(selectedStudent)"
                class="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30 active:scale-95 transition"
                title="O'quvchi grafik kalitini (pattern) tozalash"
              >
                🔄 Patternni Tozalash
              </button>
            </div>
          </div>
        </div>

        <!-- Contacts Grid (Student Phone, Parent Info, Telegram, Notes) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Student Phone -->
          <div class="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">📱 O'quvchi Telefoni</span>
            <div v-if="selectedStudent.phone" class="space-y-2">
              <a :href="'tel:' + selectedStudent.phone" class="font-mono text-sm font-bold text-white hover:text-indigo-300 block">
                {{ selectedStudent.phone }}
              </a>
              <div class="flex items-center gap-1.5">
                <a :href="'tel:' + selectedStudent.phone" class="flex-1 text-center text-[11px] py-1 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/30 transition">
                  📞 Qo'ng'iroq
                </a>
                <a :href="'sms:' + selectedStudent.phone" class="flex-1 text-center text-[11px] py-1 px-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/30 transition">
                  💬 SMS
                </a>
              </div>
            </div>
            <div v-else class="flex items-center justify-between text-xs text-slate-500 italic py-1">
              <span>Kiritilmagan</span>
              <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[11px] font-bold hover:underline">
                + Qo'shish
              </button>
            </div>
          </div>

          <!-- Parent Name -->
          <div class="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">👨‍👩‍👧 Ota-onasi (F.I.SH)</span>
            <div class="text-sm font-bold text-white truncate py-0.5">
              {{ selectedStudent.parentName || "Kiritilmagan" }}
            </div>
            <div class="text-[10px] text-slate-500">
              O'quvchining vasiysi yoki ota-onasi
            </div>
          </div>

          <!-- Parent Phone -->
          <div class="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">📞 Ota-ona Telefoni</span>
            <div v-if="selectedStudent.parentPhone" class="space-y-2">
              <a :href="'tel:' + selectedStudent.parentPhone" class="font-mono text-sm font-bold text-white hover:text-indigo-300 block">
                {{ selectedStudent.parentPhone }}
              </a>
              <div class="flex items-center gap-1.5">
                <a :href="'tel:' + selectedStudent.parentPhone" class="flex-1 text-center text-[11px] py-1 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/30 transition">
                  📞 Qo'ng'iroq
                </a>
                <a :href="'sms:' + selectedStudent.parentPhone" class="flex-1 text-center text-[11px] py-1 px-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold hover:bg-blue-500/30 transition">
                  💬 SMS
                </a>
              </div>
            </div>
            <div v-else class="flex items-center justify-between text-xs text-slate-500 italic py-1">
              <span>Kiritilmagan</span>
              <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[11px] font-bold hover:underline">
                + Qo'shish
              </button>
            </div>
          </div>

          <!-- Parent Telegram -->
          <div class="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-2">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">💬 Ota-ona Telegrami</span>
            <div v-if="selectedStudent.parentTg" class="space-y-2">
              <a
                :href="'https://t.me/' + selectedStudent.parentTg.replace('@', '')"
                target="_blank"
                class="font-bold text-sky-400 hover:underline block text-sm truncate"
              >
                {{ selectedStudent.parentTg.startsWith('@') ? selectedStudent.parentTg : '@' + selectedStudent.parentTg }}
              </a>
              <a
                :href="'https://t.me/' + selectedStudent.parentTg.replace('@', '')"
                target="_blank"
                class="block text-center text-[11px] py-1 px-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold hover:bg-sky-500/30 transition"
              >
                ✈️ Telegramda Yozish
              </a>
            </div>
            <div v-else class="flex items-center justify-between text-xs text-slate-500 italic py-1">
              <span>Kiritilmagan</span>
              <button type="button" @click="openEditModal(selectedStudent)" class="text-indigo-400 text-[11px] font-bold hover:underline">
                + Qo'shish
              </button>
            </div>
          </div>
        </div>

        <!-- Teacher Notes / Dossier Characteristics Banner -->
        <div v-if="selectedStudent.notes" class="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>📝</span> O'qituvchi Eslatmasi & Xarakteristika
            </span>
            <button
              type="button"
              @click="openEditModal(selectedStudent)"
              class="text-[10px] text-indigo-400 hover:underline font-bold"
            >
              ✏️ Tahrirlash
            </button>
          </div>
          <p class="text-xs text-slate-300 italic pt-0.5">
            «{{ selectedStudent.notes }}»
          </p>
        </div>
      </div>

      <!-- 4 Key KPI Scoreboard Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <!-- 1. Accuracy -->
        <div class="glass-card rounded-3xl p-4 sm:p-5 border-emerald-500/20 bg-emerald-950/20 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">O'rtacha Aniqlik</span>
            <span class="text-xl">🎯</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-300 tabular-nums">
            {{ selectedStudent.avgAccuracy || 0 }}%
          </div>
          <div class="text-[11px] font-bold" :class="(selectedStudent.avgAccuracy || 0) >= 80 ? 'text-emerald-400' : (selectedStudent.avgAccuracy || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'">
            {{ (selectedStudent.avgAccuracy || 0) >= 85 ? '🏆 A\'lochi o\'quvchi' : (selectedStudent.avgAccuracy || 0) >= 70 ? '👍 Yaxshi o\'zlashtirmoqda' : '⚠️ Ko\'proq amaliyot kerak' }}
          </div>
        </div>

        <!-- 2. Total Tests & Lessons -->
        <div class="glass-card rounded-3xl p-4 sm:p-5 border-white/10 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Darslar & Testlar</span>
            <span class="text-xl">📈</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white tabular-nums">
            {{ selectedStudentHistory.length || selectedStudent.totalTests || 0 }} <span class="text-sm font-normal text-slate-400">ta</span>
          </div>
          <div class="text-[11px] text-slate-400">
            Jami topshirilgan sinovlar
          </div>
        </div>

        <!-- 3. Attendance Rate -->
        <div class="glass-card rounded-3xl p-4 sm:p-5 border-blue-500/20 bg-blue-950/20 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Davomat Ko'rsatkichi</span>
            <span class="text-xl">📅</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-blue-300 tabular-nums">
            {{ selectedStudentAttendanceData.percent }}%
          </div>
          <div class="text-[11px] text-slate-300 flex items-center gap-1.5 flex-wrap">
            <span class="text-emerald-400 font-bold">✅ {{ selectedStudentAttendanceData.present }}</span>
            <span>•</span>
            <span class="text-amber-400 font-bold">🟡 {{ selectedStudentAttendanceData.excused }}</span>
            <span>•</span>
            <span class="text-rose-400 font-bold">❌ {{ selectedStudentAttendanceData.unexcused }}</span>
          </div>
        </div>

        <!-- 4. Coins & Strikes -->
        <div class="glass-card rounded-3xl p-4 sm:p-5 border-amber-500/20 bg-amber-950/20 space-y-1 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Yutuqlar & Mukofotlar</span>
            <span class="text-xl">🪙</span>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums flex items-center gap-2">
            <span>{{ selectedStudent.coins || 0 }}</span>
            <span class="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg">Tanga</span>
          </div>
          <div class="text-[11px] text-slate-300 flex items-center gap-2">
            <span class="text-yellow-400 font-bold">⭐ {{ selectedStudent.strikes || 0 }} striky</span>
            <span>•</span>
            <span class="text-rose-400 font-bold">⚠️ {{ selectedStudent.penalties || 0 }} jarima</span>
          </div>
        </div>
      </div>

      <!-- Main Content Tabs Navigation -->
      <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          @click="activeDoskaTab = 'history'"
          class="flex-1 min-w-[170px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          :class="activeDoskaTab === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <span>📈</span>
          <span>Dars va Test Natijalari</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-black/40 font-mono font-bold">
            {{ selectedStudentHistory.length }}
          </span>
        </button>

        <button
          type="button"
          @click="activeDoskaTab = 'attendance'"
          class="flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          :class="activeDoskaTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <span>📅</span>
          <span>Davomat Jurnali</span>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-black/40 font-mono font-bold">
            {{ selectedStudentAttendanceData.percent }}%
          </span>
        </button>

        <button
          type="button"
          @click="activeDoskaTab = 'overview'"
          class="flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          :class="activeDoskaTab === 'overview' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'"
        >
          <span>👤</span>
          <span>Shaxsiy & Guruhlar</span>
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: BATAFSIL DARS VA TEST NATIJALARI (HISTORY) -->
      <!-- ======================================================== -->
      <div v-if="activeDoskaTab === 'history'" class="space-y-4">
        <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>📊</span> O'quvchining Barcha Dars va Test Natijalari Xronologiyasi
              </h4>
              <p class="text-xs text-slate-400">Har bir dars, test va savol-javob sessiyasidagi aniqlik va ballar</p>
            </div>

            <!-- Search & Actions -->
            <div class="flex items-center gap-2">
              <div class="relative">
                <input
                  v-model="doskaTestSearch"
                  type="text"
                  placeholder="Mavzu yoki kitob nomi..."
                  class="rounded-xl border border-white/15 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-48 sm:w-60"
                />
                <span class="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
              </div>

              <button
                type="button"
                @click="exportSingleStudentDoskaToExcel(selectedStudent)"
                class="flex items-center gap-1 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition"
                title="Faqat test natijalarini Excelga eksport qilish"
              >
                <span>📥</span> <span>Excel</span>
              </button>
            </div>
          </div>

          <!-- Tests Table & Cards List -->
          <div v-if="filteredDoskaTests.length > 0" class="space-y-3">
            <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-1 custom-scrollbar">
              <table class="w-full text-left text-xs text-slate-200 border-collapse">
                <thead>
                  <tr class="border-b border-white/10 text-[11px] font-black uppercase text-slate-400">
                    <th class="px-4 py-3">№</th>
                    <th class="px-4 py-3">Sana & Vaqt</th>
                    <th class="px-4 py-3">Dars / Test Mavzusi</th>
                    <th class="px-4 py-3 text-center">To'g'ri / Jami</th>
                    <th class="px-4 py-3 text-center">O'zlashtirish (%)</th>
                    <th class="px-4 py-3 text-center">Daraja</th>
                    <th class="px-4 py-3 text-center">Tangalar</th>
                    <th class="px-4 py-3 text-center">Rejim</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  <tr
                    v-for="(h, idx) in filteredDoskaTests"
                    :key="idx"
                    class="hover:bg-white/5 transition"
                  >
                    <td class="px-4 py-3 text-slate-500 font-mono">{{ idx + 1 }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="font-bold text-white font-mono">{{ h.date || "Avvalgi dars" }}</div>
                      <div v-if="h.time" class="text-[10px] text-slate-400 font-mono">⏰ {{ h.time }}</div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="font-bold text-white max-w-xs sm:max-w-md truncate">
                        {{ formatCleanTopicName(h.topic || (h.book ? `${h.book} darsi` : "Savol-Javob")) }}
                      </div>
                      <div v-if="h.book" class="text-[10px] text-indigo-400 font-semibold">
                        📖 {{ h.book }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <span class="font-black text-white text-sm">
                        {{ h.correct !== undefined ? h.correct : Math.round(((parseFloat(h.percent) || 0) / 100) * (parseInt(h.total) || 10)) }}
                      </span>
                      <span class="text-slate-500"> / {{ h.total || 10 }}</span>
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        class="px-3 py-1 rounded-xl text-xs font-black inline-block min-w-[55px]"
                        :class="(parseFloat(h.percent) || 0) >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : (parseFloat(h.percent) || 0) >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'"
                      >
                        {{ Math.round(parseFloat(h.percent) || 0) }}%
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        class="px-2.5 py-0.5 rounded-lg text-[10px] font-black"
                        :class="(parseFloat(h.percent) || 0) >= 85 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : (parseFloat(h.percent) || 0) >= 70 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : (parseFloat(h.percent) || 0) >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'"
                      >
                        {{ (parseFloat(h.percent) || 0) >= 85 ? '🏆 A\'lo' : (parseFloat(h.percent) || 0) >= 70 ? '👍 Yaxshi' : (parseFloat(h.percent) || 0) >= 50 ? 'Qoniqarli' : 'Past' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <span v-if="h.coin" class="font-bold text-amber-400">🪙 +{{ h.coin }}</span>
                      <span v-else class="text-slate-500">-</span>
                      <span v-if="h.strike && parseInt(h.strike) > 0" class="ml-1.5 text-yellow-400 font-bold">⭐ +{{ h.strike }}</span>
                    </td>
                    <td class="px-4 py-3 text-center whitespace-nowrap text-slate-400 text-[11px]">
                      {{ h.mode || "Savol-Javob" }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 bg-white/5 space-y-3">
            <div class="text-4xl">📝</div>
            <h5 class="text-base font-bold text-white">Hozircha dars yoki test natijalari mavjud emas</h5>
            <p class="text-xs text-slate-400 max-w-md mx-auto">
              O'quvchi dars jarayonidagi savol-javoblar, AI imtihonlari yoki test sessiyalarida qatnashgandan so'ng uning barcha natijalari ushbu doskada avtomatik aks etadi.
            </p>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: DAVOMAT JURNALI (ATTENDANCE) -->
      <!-- ======================================================== -->
      <div v-if="activeDoskaTab === 'attendance'" class="space-y-4">
        <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h4 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>📅</span> Darslar Davomati Jurnali
              </h4>
              <p class="text-xs text-slate-400">Har bir dars bo'yicha qatnashish va sabablar qaydnomasi</p>
            </div>
            <div class="text-sm font-black text-white font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              Jami darslar: <span class="text-indigo-400">{{ selectedStudentAttendanceData.total }}</span> ta
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-bold">
              <span class="text-slate-300">Davomat ko'rsatkichi:</span>
              <span
                class="font-black"
                :class="selectedStudentAttendanceData.percent >= 80 ? 'text-emerald-400' : selectedStudentAttendanceData.percent >= 60 ? 'text-amber-400' : 'text-rose-400'"
              >
                {{ selectedStudentAttendanceData.percent }}%
              </span>
            </div>
            <div class="w-full h-3 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="selectedStudentAttendanceData.percent >= 80 ? 'bg-emerald-500' : selectedStudentAttendanceData.percent >= 60 ? 'bg-amber-500' : 'bg-rose-500'"
                :style="{ width: `${selectedStudentAttendanceData.percent}%` }"
              ></div>
            </div>
          </div>

          <!-- 3 Stats Cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-1">
              <div class="text-2xl font-black text-emerald-400">{{ selectedStudentAttendanceData.present }}</div>
              <div class="text-xs font-bold text-slate-300">✅ Qatnashdi</div>
            </div>
            <div class="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-center space-y-1">
              <div class="text-2xl font-black text-amber-400">{{ selectedStudentAttendanceData.excused }}</div>
              <div class="text-xs font-bold text-slate-300">🟡 Sababli</div>
            </div>
            <div class="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-center space-y-1">
              <div class="text-2xl font-black text-rose-400">{{ selectedStudentAttendanceData.unexcused }}</div>
              <div class="text-xs font-bold text-slate-300">❌ Sababsiz</div>
            </div>
          </div>

          <!-- Logs List -->
          <div v-if="selectedStudentAttendanceData.logs && selectedStudentAttendanceData.logs.length > 0" class="space-y-2 pt-2">
            <h5 class="text-xs font-black uppercase tracking-wider text-slate-400">
              Darsma-dars davomat ro'yxati ({{ selectedStudentAttendanceData.logs.length }} ta)
            </h5>
            <div class="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="(log, idx) in selectedStudentAttendanceData.logs"
                :key="idx"
                class="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition text-xs"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span class="font-mono text-xs font-black text-indigo-300 shrink-0 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    🗓️ {{ log.date }}
                  </span>
                  <div class="min-w-0">
                    <div class="font-bold text-white truncate">{{ log.topic || 'Dars' }}</div>
                    <div v-if="log.reason" class="text-[10px] text-amber-400 italic">Sabab: {{ log.reason }}</div>
                  </div>
                </div>

                <span
                  class="px-3 py-1 rounded-xl text-xs font-black shrink-0 ml-2"
                  :class="log.status === 'Keldi' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : log.status === 'Sababli' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'"
                >
                  {{ log.status === 'Keldi' ? '✅ Keldi' : log.status === 'Sababli' ? '🟡 Sababli' : '❌ Sababsiz' }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-10 text-xs text-slate-500 italic">
            Bu o'quvchi bo'yicha hali dars davomati yozuvlari kiritilmagan.
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 3: SHAXSIY VA GURUHLAR (OVERVIEW) -->
      <!-- ======================================================== -->
      <div v-if="activeDoskaTab === 'overview'" class="space-y-4">
        <!-- Multi-Group Management Card -->
        <div class="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h4 class="text-base font-black text-white flex items-center gap-2">
                <span>📚</span> Biriktirilgan Guruhlar Boshqaruvi
              </h4>
              <p class="text-xs text-slate-400">O'quvchi bir vaqtning o'zida bir nechta guruhlarda o'qishi mumkin</p>
            </div>
            <div class="flex items-center gap-2">
              <select
                v-if="availableGroupsToAdd(selectedStudent).length > 0"
                @change="handleQuickAddGroupToSelectedStudent($event)"
                class="text-xs bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-indigo-600/50 transition font-bold"
              >
                <option value="" disabled selected>+ Yangi guruhga qo'shish...</option>
                <option
                  v-for="g in availableGroupsToAdd(selectedStudent)"
                  :key="g.name"
                  :value="g.name"
                >
                  ➕ {{ g.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="(grp, gIdx) in getStudentGroupList(selectedStudent)"
              :key="grp"
              class="rounded-2xl border p-4 flex items-center justify-between gap-2 shadow transition"
              :class="gIdx === 0 ? 'border-indigo-500/40 bg-indigo-950/30' : 'border-white/10 bg-black/40'"
            >
              <div class="space-y-1">
                <div class="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>👥</span> {{ grp }}
                </div>
                <div class="text-[10px] uppercase font-black tracking-wider" :class="gIdx === 0 ? 'text-indigo-400' : 'text-slate-500'">
                  {{ gIdx === 0 ? 'Asosiy Guruh' : 'Qo\'shimcha Guruh' }}
                </div>
              </div>
              <button
                type="button"
                @click="handleRemoveGroupFromSelectedStudent(grp)"
                class="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition text-xs"
                title="Guruhdan chiqarish"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Student Login & Security Card -->
        <div class="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <h4 class="text-base font-black text-white flex items-center gap-2">
              <span>🔑</span> Tizimga Kirish Kartasi
            </h4>
            <button
              type="button"
              @click="copyCredentials(selectedStudent)"
              class="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 active:scale-95 transition shadow"
            >
              📋 Nusxalash
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Login (Zaxira)</span>
              <div class="text-sm font-bold text-white font-mono truncate">
                {{ selectedStudent.login || selectedStudent.name.toLowerCase().replace(/\s+/g, '_') }}
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-amber-300 font-bold uppercase">6 Xonali PIN</span>
                <button
                  type="button"
                  @click="handleRegeneratePin(selectedStudent)"
                  class="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  ⚡️ Yangilash
                </button>
              </div>
              <div class="text-base font-black text-amber-300 font-mono tracking-widest">
                {{ selectedStudent.pin || selectedStudent.password || '123456' }}
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">Grafik Kalit (Pattern)</span>
                <span
                  class="px-2 py-0.5 rounded-md font-bold text-[10px] inline-block mt-1"
                  :class="selectedStudent.pattern ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'"
                >
                  {{ selectedStudent.pattern ? '🟢 O\'rnatilgan' : '⏳ O\'rnatilmagan' }}
                </span>
              </div>
              <button
                v-if="selectedStudent.pattern"
                type="button"
                @click="handleResetPattern(selectedStudent)"
                class="rounded-xl bg-rose-500/20 border border-rose-500/30 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 transition"
              >
                🔄 Tozalash
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Return Button -->
      <div class="flex justify-end pt-2 pb-6">
        <button
          type="button"
          @click="closeStudentDoska"
          class="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition shadow"
        >
          <span>⬅️</span>
          <span>O'quvchilar Ro'yxatiga Qaytish</span>
        </button>
      </div>
    </div>
    <!-- /VIEW 3: DEDICATED STUDENT DOSKA FULL-PAGE VIEW -->

    <!-- ======================================================== -->
    <!-- MODAL 7: CREATE NEW GROUP MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showCreateGroupModal"
      title="➕ Yangi Guruh Ochish"
      custom-class="max-w-2xl w-full"
    >
      <div class="space-y-4 py-1">
        <!-- 1. Group Core Info Card -->
        <div class="rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 space-y-4">
          <h4 class="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <span>🏷️</span> Guruh Asosiy Ma'lumotlari
          </h4>

          <!-- Group Name -->
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Guruh Nomi *</label>
            <input
              v-model="newGroupForm.name"
              type="text"
              required
              placeholder="Masalan: 10-A Tarix yoki Target 2026"
              class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <!-- Schedule Days: Presets & Chips -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-300">Dars kunlari:</label>
              <!-- Quick Presets -->
              <div class="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  @click="setNewGroupDaysPreset('toq')"
                  class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-slate-300 hover:bg-emerald-600 hover:text-white transition"
                >
                  Toq kunlar
                </button>
                <button
                  type="button"
                  @click="setNewGroupDaysPreset('juft')"
                  class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-slate-300 hover:bg-emerald-600 hover:text-white transition"
                >
                  Juft kunlar
                </button>
                <button
                  type="button"
                  @click="setNewGroupDaysPreset('har_kuni')"
                  class="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-slate-300 hover:bg-emerald-600 hover:text-white transition"
                >
                  Har kuni
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="d in ['Du', 'Se', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak']"
                :key="d"
                type="button"
                @click="toggleNewGroupDay(d)"
                class="rounded-xl px-3.5 py-2 text-xs font-bold border transition"
                :class="
                  newGroupForm.days.includes(d)
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                "
              >
                {{ d }}
              </button>
            </div>
          </div>

          <!-- Time, Room, Subject Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Dars vaqti:</label>
              <input
                v-model="newGroupForm.time"
                type="text"
                placeholder="14:00 - 15:30"
                class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Xona / Manzil:</label>
              <input
                v-model="newGroupForm.room"
                type="text"
                placeholder="1-xona"
                class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Fan / Darslik:</label>
              <input
                v-model="newGroupForm.subject"
                type="text"
                placeholder="O'zbekiston Tarixi"
                class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <!-- Monthly Fee & Note -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Oylik to'lov summasi (so'm):</label>
              <input
                v-model.number="newGroupForm.paymentFee"
                type="number"
                step="10000"
                placeholder="300000"
                class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-amber-300 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Guruh izohi (ixtiyoriy):</label>
              <input
                v-model="newGroupForm.note"
                type="text"
                placeholder="Masalan: Katta imtihonga tayyorgarlik"
                class="w-full rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- 2. Students Assignment Section -->
        <div class="rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h4 class="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <span>👥</span> Guruhga O'quvchilarni Biriktirish
            </h4>

            <!-- Mode Selector Tabs -->
            <div class="flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs">
              <button
                type="button"
                @click="newGroupStudentMode = 'existing'"
                class="rounded-lg px-3 py-1 font-bold transition"
                :class="newGroupStudentMode === 'existing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'"
              >
                Mavjud o'quvchilardan ({{ newGroupSelectedExistingStudents.length }})
              </button>
              <button
                type="button"
                @click="newGroupStudentMode = 'new'"
                class="rounded-lg px-3 py-1 font-bold transition"
                :class="newGroupStudentMode === 'new' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
              >
                Yangi o'quvchi qo'shish ({{ newGroupDirectStudents.length }})
              </button>
            </div>
          </div>

          <!-- TAB A: Existing Students Multi-select -->
          <div v-if="newGroupStudentMode === 'existing'" class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <input
                v-model="newGroupExistingSearch"
                type="text"
                placeholder="🔍 Qidirish (ism yoki guruh)..."
                class="flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                @click="toggleSelectAllExistingForNewGroup"
                class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 shrink-0 transition"
              >
                {{ newGroupSelectedExistingStudents.length === filteredExistingStudentsForNewGroup.length && filteredExistingStudentsForNewGroup.length > 0 ? 'Tozalash' : 'Barchasini tanlash' }}
              </button>
            </div>

            <!-- List of existing students with checkboxes -->
            <div class="max-h-56 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              <div
                v-for="st in filteredExistingStudentsForNewGroup"
                :key="st.name"
                @click="toggleSelectExistingForNewGroup(st.name)"
                class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none"
                :class="
                  newGroupSelectedExistingStudents.includes(st.name)
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-sm'
                    : 'border-white/5 bg-black/30 hover:bg-white/5'
                "
              >
                <div class="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    :checked="newGroupSelectedExistingStudents.includes(st.name)"
                    class="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                  <span class="font-bold text-xs text-white">{{ st.name }}</span>
                </div>
                <span class="text-[11px] text-slate-400 rounded-md bg-white/5 px-2 py-0.5 border border-white/5">
                  Hozirgi: <b class="text-slate-200">{{ st.group || 'Umumiy' }}</b>
                </span>
              </div>
              <div v-if="filteredExistingStudentsForNewGroup.length === 0" class="text-center py-4 text-xs text-slate-500">
                O'quvchi topilmadi
              </div>
            </div>
            <div class="text-[11px] text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-2 flex items-center gap-1.5">
              <span>💡</span>
              <span>Tanlangan <b>{{ newGroupSelectedExistingStudents.length }} ta</b> o'quvchi guruh yaratilgach, avtomatik ravishda yangi guruhga ko'chiriladi.</span>
            </div>
          </div>

          <!-- TAB B: Add Brand New Student directly -->
          <div v-if="newGroupStudentMode === 'new'" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                v-model="directStudentName"
                type="text"
                placeholder="F.I.Sh *"
                class="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                @keyup.enter="addDirectStudentToNewGroup"
              />
              <input
                v-model="directStudentPhone"
                type="text"
                placeholder="Telefon (+998...)"
                class="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                @keyup.enter="addDirectStudentToNewGroup"
              />
              <div class="flex gap-2">
                <input
                  v-model="directStudentParentPhone"
                  type="text"
                  placeholder="Ota-ona tel"
                  class="flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  @keyup.enter="addDirectStudentToNewGroup"
                />
                <button
                  type="button"
                  @click="addDirectStudentToNewGroup"
                  class="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 shrink-0 transition"
                >
                  ➕ Qo'shish
                </button>
              </div>
            </div>

            <!-- List of directly added new students -->
            <div v-if="newGroupDirectStudents.length > 0" class="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="(st, idx) in newGroupDirectStudents"
                :key="idx"
                class="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs"
              >
                <div>
                  <span class="font-bold text-white">{{ st.name }}</span>
                  <span v-if="st.phone" class="text-slate-400 ml-2 font-mono text-[11px]">{{ st.phone }}</span>
                </div>
                <button
                  type="button"
                  @click="removeDirectStudentFromNewGroup(idx)"
                  class="text-red-400 hover:text-red-300 text-xs px-2 py-1"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div v-else class="text-center py-4 text-xs text-slate-500">
              Hozircha yangi o'quvchi kiritilmadi. Yuqoridagi maydonga ismini yozib "Qo'shish" tugmasini bosing.
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showCreateGroupModal = false"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Bekor qilish
        </button>
        <button
          type="button"
          @click="saveNewGroup"
          class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition"
        >
          💾 Guruhni Yaratish va Saqlash
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { useTeacherStore, Student, TeacherReminder, GroupMeta, GroupReminder, BOOK_LIST, LessonSessionRecord, normalizeDateToDDMM, getStudentGroups, isStudentInGroup } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import { getStudentDefaultPin } from "../../composables/useStudentStore";
import { sendTelegramMessage } from "../../services/telegram";
import { generateTeacherAiSummary, TeacherAiSummaryInput } from "../../services/geminiLiveService";
import BaseModal from "../common/BaseModal.vue";

Chart.register(...registerables);

const emit = defineEmits<{
  (e: "back"): void;
  (e: "nav", view: string): void;
}>();

const teacherStore = useTeacherStore();

// View Navigation State (Main CRM vs Group Hub vs Student Doska)
const managerView = ref<"main" | "group-hub" | "student-doska">("main");

function closeGroupHub() {
  managerView.value = "main";
  selectedGroupHubName.value = "";
}

function closeStudentDoska() {
  managerView.value = "main";
}

// Search & Filter & Selection
const searchQuery = ref("");
const selectedGroupFilter = ref("");
const statusFilter = ref<"all" | "active" | "frozen">("all");
const groupFilterTab = ref<"all" | "active" | "frozen">("all");
const syncingDb = ref(false);
const selectedStudentNames = ref<string[]>([]);

// Pagination State
const currentPage = ref(1);
const pageSize = ref(15);

// Create New Group State
const showCreateGroupModal = ref(false);
const newGroupForm = ref({
  name: "",
  days: ["Du", "Chor", "Juma"],
  time: "14:00 - 15:30",
  room: "1-xona",
  subject: "O'zbekiston Tarixi",
  note: "",
  paymentFee: 300000,
});
const newGroupStudentMode = ref<"existing" | "new">("existing");
const newGroupSelectedExistingStudents = ref<string[]>([]);
const newGroupExistingSearch = ref("");
const newGroupDirectStudents = ref<Array<{ name: string; phone: string; parentPhone: string }>>([]);
const directStudentName = ref("");
const directStudentPhone = ref("");
const directStudentParentPhone = ref("");

const filteredExistingStudentsForNewGroup = computed(() => {
  const query = newGroupExistingSearch.value.toLowerCase().trim();
  const all = teacherStore.allStudentsRegistry.value;
  if (!query) return all;
  return all.filter(
    (s) =>
      s.name.toLowerCase().includes(query) ||
      (s.group || "").toLowerCase().includes(query)
  );
});

function openCreateGroupModal() {
  newGroupForm.value = {
    name: "",
    days: ["Du", "Chor", "Juma"],
    time: "14:00 - 15:30",
    room: "1-xona",
    subject: "O'zbekiston Tarixi",
    note: "",
    paymentFee: 300000,
  };
  newGroupStudentMode.value = "existing";
  newGroupSelectedExistingStudents.value = [];
  newGroupExistingSearch.value = "";
  newGroupDirectStudents.value = [];
  directStudentName.value = "";
  directStudentPhone.value = "";
  directStudentParentPhone.value = "";
  showCreateGroupModal.value = true;
}

function toggleNewGroupDay(d: string) {
  if (newGroupForm.value.days.includes(d)) {
    newGroupForm.value.days = newGroupForm.value.days.filter((day) => day !== d);
  } else {
    newGroupForm.value.days.push(d);
  }
}

function setNewGroupDaysPreset(preset: "toq" | "juft" | "har_kuni") {
  if (preset === "toq") {
    newGroupForm.value.days = ["Du", "Chor", "Juma"];
  } else if (preset === "juft") {
    newGroupForm.value.days = ["Se", "Pay", "Shan"];
  } else if (preset === "har_kuni") {
    newGroupForm.value.days = ["Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"];
  }
}

function toggleSelectExistingForNewGroup(name: string) {
  if (newGroupSelectedExistingStudents.value.includes(name)) {
    newGroupSelectedExistingStudents.value = newGroupSelectedExistingStudents.value.filter((n) => n !== name);
  } else {
    newGroupSelectedExistingStudents.value.push(name);
  }
}

function toggleSelectAllExistingForNewGroup() {
  const allFilteredNames = filteredExistingStudentsForNewGroup.value.map((s) => s.name);
  const allSelected =
    allFilteredNames.length > 0 &&
    allFilteredNames.every((n) => newGroupSelectedExistingStudents.value.includes(n));
  if (allSelected) {
    newGroupSelectedExistingStudents.value = newGroupSelectedExistingStudents.value.filter(
      (n) => !allFilteredNames.includes(n)
    );
  } else {
    const combined = new Set([...newGroupSelectedExistingStudents.value, ...allFilteredNames]);
    newGroupSelectedExistingStudents.value = Array.from(combined);
  }
}

function addDirectStudentToNewGroup() {
  const name = directStudentName.value.trim();
  if (!name) return;
  newGroupDirectStudents.value.push({
    name,
    phone: directStudentPhone.value.trim(),
    parentPhone: directStudentParentPhone.value.trim(),
  });
  directStudentName.value = "";
  directStudentPhone.value = "";
  directStudentParentPhone.value = "";
}

function removeDirectStudentFromNewGroup(idx: number) {
  newGroupDirectStudents.value.splice(idx, 1);
}

function saveNewGroup() {
  const gName = newGroupForm.value.name.trim();
  if (!gName) {
    alert("Iltimos, guruh nomini kiriting!");
    return;
  }
  const exists = groupsList.value.some(
    (g) => g.name.toLowerCase().trim() === gName.toLowerCase().trim()
  );
  if (exists) {
    alert(`«${gName}» nomli guruh allaqachon mavjud! Iltimos, boshqa nom kiriting.`);
    return;
  }

  // 1. Create and save GroupMeta (syncs to Firebase groups_meta)
  const meta: GroupMeta = {
    name: gName,
    days: [...newGroupForm.value.days],
    time: newGroupForm.value.time.trim() || "14:00 - 15:30",
    room: newGroupForm.value.room.trim() || "1-xona",
    subject: newGroupForm.value.subject.trim() || "O'zbekiston Tarixi",
    note: newGroupForm.value.note.trim() || "",
    paymentFee: Number(newGroupForm.value.paymentFee) || 300000,
    reminders: [],
    studentPayments: {},
  };
  teacherStore.saveGroupMeta(meta);

  // 2. Transfer selected existing students to this new group
  if (newGroupSelectedExistingStudents.value.length > 0) {
    teacherStore.transferMultipleStudentsGroup(newGroupSelectedExistingStudents.value, gName);
  }

  // 3. Add directly added new students
  if (newGroupDirectStudents.value.length > 0) {
    newGroupDirectStudents.value.forEach((ds) => {
      const pin = getStudentDefaultPin(ds.name);
      const studentObj: Student = {
        name: ds.name.trim(),
        group: gName,
        status: "active",
        phone: ds.phone.trim(),
        parentPhone: ds.parentPhone.trim(),
        login: ds.name.trim().toLowerCase().replace(/\s+/g, ""),
        password: pin,
        pin: pin,
        coins: 0,
        avgAccuracy: 0,
        totalBattles: 0,
        victories: 0,
      };
      teacherStore.saveStudent(studentObj);
    });
  }

  showCreateGroupModal.value = false;
  openGroupHub(gName);
  alert(
    `🎉 «${gName}» guruhi muvaffaqiyatli ochildi va ${
      newGroupSelectedExistingStudents.value.length + newGroupDirectStudents.value.length
    } nafar o'quvchi biriktirildi!`
  );
}

// Group Hub State
const showGroupHubModal = ref(false);
const selectedGroupHubName = ref("");
const activeGroupTab = ref<"schedule" | "stats" | "students" | "payments">("schedule");
const groupScheduleForm = ref<GroupMeta>({
  name: "",
  days: ["Du", "Chor", "Juma"],
  time: "14:00 - 15:30",
  room: "1-xona",
  subject: "O'zbekiston Tarixi",
  note: "",
  paymentFee: 300000,
  reminders: [],
  studentPayments: {},
});
const newGroupReminderText = ref("");
const newGroupReminderDate = ref(new Date().toISOString().split("T")[0]);
const newGroupReminderTime = ref("14:00");

// Modals State
const showAddEditModal = ref(false);
const editingStudent = ref(false);
const showDetailModal = ref(false);
const selectedStudent = ref<Student | null>(null);
const studentAttendanceLogsMap = ref<Record<string, { present: number; excused: number; unexcused: number; logs: any[] }>>({});

const selectedStudentAttendanceData = computed(() => {
  if (!selectedStudent.value) {
    return { present: 0, excused: 0, unexcused: 0, total: 0, percent: 100, logs: [] };
  }
  const key = selectedStudent.value.name.trim().toLowerCase();
  const att = studentAttendanceLogsMap.value[key];
  if (att) {
    const total = att.present + att.excused + att.unexcused;
    const percent = total > 0 ? Math.round((att.present / total) * 100) : 100;
    return {
      present: att.present,
      excused: att.excused,
      unexcused: att.unexcused,
      total,
      percent,
      logs: att.logs || [],
    };
  }
  const st = selectedStudent.value.attendanceStats || { present: 0, excused: 0, unexcused: 0 };
  const total = (st.present || 0) + (st.excused || 0) + (st.unexcused || 0);
  const percent = total > 0 ? Math.round(((st.present || 0) / total) * 100) : 100;
  return {
    present: st.present || 0,
    excused: st.excused || 0,
    unexcused: st.unexcused || 0,
    total,
    percent,
    logs: [],
  };
});

const studentHistoryMap = ref<Record<string, any[]>>({});
const activeDoskaTab = ref<"overview" | "attendance" | "history">("overview");

const selectedStudentHistory = computed(() => {
  if (!selectedStudent.value) return [];
  const key = selectedStudent.value.name.trim().toLowerCase();
  const list = studentHistoryMap.value[key] || [];
  return [...list].sort((a, b) => {
    const tA = parseDateStrToMillis(a.date, 0);
    const tB = parseDateStrToMillis(b.date, 0);
    return tB - tA;
  });
});

const doskaTestSearch = ref("");
const filteredDoskaTests = computed(() => {
  let list = selectedStudentHistory.value;
  const q = doskaTestSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (h) =>
        (h.topic && h.topic.toLowerCase().includes(q)) ||
        (h.book && h.book.toLowerCase().includes(q)) ||
        (h.date && h.date.toLowerCase().includes(q)) ||
        (h.mode && h.mode.toLowerCase().includes(q))
    );
  }
  return list;
});
const showTransferModal = ref(false);
const transferTargetStudent = ref<Student | null>(null);
const isBatchTransfer = ref(false);
const transferNewGroupName = ref("");
const transferActionType = ref<"add" | "move">("add");

const showReminderModal = ref(false);
const reminderTargetStudent = ref<Student | null>(null);
const showRemindersListModal = ref(false);

const showParentAlertModal = ref(false);
const parentAlertStudent = ref<Student | null>(null);
const alertTemplate = ref<"result" | "warning" | "payment" | "praise">("result");
const generatedAlertText = ref("");
const sendingTg = ref(false);
const tgSent = ref(false);

// Add/Edit Form State
const formStudent = ref<Partial<Student>>({
  name: "",
  group: "",
  status: "active",
  phone: "",
  parentName: "",
  parentPhone: "",
  parentTg: "",
  login: "",
  pin: "",
  password: "",
  pattern: "",
  notes: "",
});
const formStudentGroups = ref<string[]>([]);
const formCustomGroupInput = ref("");

// Reminder Form State
const formReminder = ref({
  title: "",
  date: new Date().toISOString().split("T")[0],
  time: "15:00",
  type: "call" as const,
  note: "",
});

// --- Computed Statistics ---
const totalStudentsCount = computed(() => teacherStore.allStudentsRegistry.value.length);
const activeStudentsCount = computed(
  () => teacherStore.allStudentsRegistry.value.filter((s) => s.status !== "frozen").length
);
const frozenStudentsCount = computed(
  () => teacherStore.allStudentsRegistry.value.filter((s) => s.status === "frozen").length
);

const sampleStudentNames = new Set(["Ali Valiyev", "Madina Karimova", "Jasur Rahimov", "Zuhra Yusupova", "Bekzod Rustamov"]);
const sampleStudentIds = new Set(["std-1", "std-2", "std-3", "std-4", "std-5"]);

const hasSampleStudents = computed(() => {
  return teacherStore.allStudentsRegistry.value.some(
    (s) => sampleStudentNames.has(s.name.trim()) || sampleStudentIds.has(s.id || "")
  );
});

// Rich Group summary list with schedule, room, accuracy
const groupsList = computed(() => {
  const map: Record<
    string,
    {
      name: string;
      count: number;
      activeCount: number;
      frozenCount: number;
      isAllFrozen: boolean;
      totalAccuracy: number;
      avgAccuracy: number;
      days: string[];
      time: string;
      room: string;
      subject: string;
      note: string;
    }
  > = {};

  // 1. Seed with groups from groupsMeta so newly created or cloud-synced empty groups are always listed!
  for (const [gName, meta] of Object.entries(teacherStore.groupsMeta.value)) {
    if (gName && gName.trim()) {
      const cleanName = gName.trim();
      map[cleanName] = {
        name: cleanName,
        count: 0,
        activeCount: 0,
        frozenCount: 0,
        isAllFrozen: teacherStore.isGroupFrozen(cleanName),
        totalAccuracy: 0,
        avgAccuracy: 0,
        days: meta?.days || ["Du", "Chor", "Juma"],
        time: meta?.time || "14:00 - 15:30",
        room: meta?.room || "",
        subject: meta?.subject || "Tarix",
        note: meta?.note || "",
      };
    }
  }

  // 2. Count students for each group (multi-group support)
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    const sGroups = getStudentGroupList(s);
    sGroups.forEach((g) => {
      if (!g || !g.trim()) return;
      const cleanG = g.trim();
      if (!map[cleanG]) {
        const meta = teacherStore.getGroupMeta(cleanG);
        map[cleanG] = {
          name: cleanG,
          count: 0,
          activeCount: 0,
          frozenCount: 0,
          isAllFrozen: teacherStore.isGroupFrozen(cleanG),
          totalAccuracy: 0,
          avgAccuracy: 0,
          days: meta.days || ["Du", "Chor", "Juma"],
          time: meta.time || "14:00 - 15:30",
          room: meta.room || "",
          subject: meta.subject || "Tarix",
          note: meta.note || "",
        };
      }
      map[cleanG].count++;
      if (s.status === "frozen") {
        map[cleanG].frozenCount++;
      } else {
        map[cleanG].activeCount++;
        map[cleanG].totalAccuracy += s.avgAccuracy || 0;
      }
    });
  });

  const list = Object.values(map);
  list.forEach((g) => {
    g.avgAccuracy = g.activeCount > 0 ? Math.round(g.totalAccuracy / g.activeCount) : 0;
    g.isAllFrozen = teacherStore.isGroupFrozen(g.name);
  });
  return list;
});

const activeGroupsCount = computed(() => {
  return groupsList.value.filter((g) => !g.isAllFrozen).length;
});

const frozenGroupsCount = computed(() => {
  return groupsList.value.filter((g) => g.isAllFrozen).length;
});

const displayedGroupsList = computed(() => {
  if (groupFilterTab.value === "active") {
    return groupsList.value.filter((g) => !g.isAllFrozen);
  }
  if (groupFilterTab.value === "frozen") {
    return groupsList.value.filter((g) => g.isAllFrozen);
  }
  return groupsList.value;
});

// Benchmark ranking of groups (Faqat faol guruhlar ko'rsatiladi)
const groupsBenchmarkList = computed(() => {
  return groupsList.value
    .filter((g) => !g.isAllFrozen && g.activeCount > 0)
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy);
});

// Group Hub Active Group Info
const currentGroupMeta = computed(() => {
  return teacherStore.getGroupMeta(selectedGroupHubName.value);
});

const currentGroupStudents = computed(() => {
  if (!selectedGroupHubName.value) return [];
  return teacherStore.allStudentsRegistry.value.filter(
    (s) => isStudentInGroup(s, selectedGroupHubName.value)
  );
});

const currentGroupActiveStudents = computed(() => {
  return currentGroupStudents.value.filter(
    (s) => s.status !== "frozen" && !teacherStore.isStudentFrozen(s.name, s.group)
  );
});

const currentGroupActiveCount = computed(() => {
  return currentGroupActiveStudents.value.length;
});

// Guest students from other groups participating in this group's manual test
const extraTestStudents = ref<Student[]>([]);
const showAddGuestModal = ref(false);
const guestSearchQuery = ref("");
const guestGroupFilter = ref("all");

const availableGuestStudents = computed(() => {
  const currentAddedNames = new Set([
    ...currentGroupActiveStudents.value.map((s) => s.name.toLowerCase().trim()),
    ...extraTestStudents.value.map((s) => s.name.toLowerCase().trim()),
  ]);
  return teacherStore.allStudentsRegistry.value.filter((s) => {
    const normName = s.name.toLowerCase().trim();
    const sGroup = (s.group || "Umumiy").toLowerCase().trim();
    if (currentAddedNames.has(normName)) return false;
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name, s.group)) return false;
    if (guestGroupFilter.value !== "all" && sGroup !== guestGroupFilter.value.toLowerCase().trim()) return false;
    if (guestSearchQuery.value.trim()) {
      const q = guestSearchQuery.value.toLowerCase().trim();
      return normName.includes(q) || sGroup.includes(q);
    }
    return true;
  });
});

function addGuestStudent(student: Student) {
  if (!extraTestStudents.value.some((s) => s.name.toLowerCase().trim() === student.name.toLowerCase().trim())) {
    extraTestStudents.value.push(student);
  }
}

function removeGuestStudent(name: string) {
  extraTestStudents.value = extraTestStudents.value.filter(
    (s) => s.name.toLowerCase().trim() !== name.toLowerCase().trim()
  );
}

// Combined list for Manual Test entry: Active group members + Guest participants
const testEntryStudents = computed(() => {
  return [...currentGroupActiveStudents.value, ...extraTestStudents.value];
});

const currentGroupAvgAccuracy = computed(() => {
  if (currentGroupStudents.value.length === 0) return 0;
  const sum = currentGroupStudents.value.reduce((acc, s) => acc + (s.avgAccuracy || 0), 0);
  return Math.round(sum / currentGroupStudents.value.length);
});

const currentGroupTotalCoins = computed(() => {
  return currentGroupStudents.value.reduce((acc, s) => acc + (s.coins || 0), 0);
});

const currentGroupTopLeaders = computed(() => {
  return [...currentGroupStudents.value]
    .sort((a, b) => (b.coins || 0) - (a.coins || 0) || (b.avgAccuracy || 0) - (a.avgAccuracy || 0))
    .slice(0, 3);
});

const isCurrentGroupAllFrozen = computed(() => {
  if (!selectedGroupHubName.value) return false;
  return teacherStore.isGroupFrozen(selectedGroupHubName.value);
});

// Filtered Students list
const filteredStudents = computed(() => {
  let list = teacherStore.allStudentsRegistry.value;

  if (selectedGroupFilter.value) {
    list = list.filter((s) => isStudentInGroup(s, selectedGroupFilter.value));
  }

  if (statusFilter.value === "active") {
    list = list.filter((s) => s.status !== "frozen");
  } else if (statusFilter.value === "frozen") {
    list = list.filter((s) => s.status === "frozen");
  }

  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.group && s.group.toLowerCase().includes(query)) ||
        (Array.isArray(s.groups) && s.groups.some((g) => g.toLowerCase().includes(query))) ||
        (s.phone && s.phone.toLowerCase().includes(query)) ||
        (s.login && s.login.toLowerCase().includes(query)) ||
        (s.parentName && s.parentName.toLowerCase().includes(query)) ||
        (s.parentPhone && s.parentPhone.toLowerCase().includes(query))
    );
  }

  return list;
});

// Pagination Computeds
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value);

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredStudents.value.length / pageSize.value));
});

const paginatedStudents = computed(() => {
  return filteredStudents.value.slice(paginationStart.value, paginationStart.value + pageSize.value);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const cur = currentPage.value;
  let start = Math.max(1, cur - 2);
  let end = Math.min(total, start + 2);

  if (start < 1) {
    end = Math.min(total, end + (1 - start));
    start = 1;
  }
  if (end > total) {
    start = Math.max(1, start - (end - total));
    end = total;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

watch([searchQuery, selectedGroupFilter, statusFilter, pageSize], () => {
  currentPage.value = 1;
});

// Calculate actual historical accuracy, coins and strikes from database
const dbHistorySessions = ref<LessonSessionRecord[]>([]);

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function parseDateStrToMillis(dateStr: string, fallbackOffset = 0): number {
  try {
    if (!dateStr) return Date.now() - fallbackOffset * 1000;
    const str = String(dateStr).trim();

    // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    if (/^\d{4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}/.test(str)) {
      const p = str.split(/[-\/\.]/);
      return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2])).getTime();
    }

    // 2. Day.Month.Year: DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{4}/.test(str)) {
      const p = str.split(/[-\/\.]/);
      return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
    }

    // 3. Day.Month format: DD.MM or DD/MM (e.g. 13.07, 02.08) -> assume current year 2026
    if (/^\d{1,2}[-\/\.]\d{1,2}$/.test(str)) {
      const p = str.split(/[-\/\.]/);
      const year = new Date().getFullYear();
      return new Date(year, parseInt(p[1]) - 1, parseInt(p[0])).getTime();
    }

    // 4. Fallback direct JS parse
    const t = new Date(str).getTime();
    if (!isNaN(t)) return t;
  } catch {}
  return Date.now() - fallbackOffset * 1000;
}

function formatCleanTopicName(rawTopic: string): string {
  if (!rawTopic) return "Savol-Javob Darsi";
  const str = String(rawTopic).trim();
  if (/^(sun|mon|tue|wed|thu|fri|sat)\s/i.test(str) || str.includes("GMT+")) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year} darsi`;
      }
    } catch {}
    return "Savol-Javob Darsi";
  }
  return str;
}

async function refreshStudentStats(force = false) {
  try {
    const [resHist, resLb, resAtt] = await Promise.all([
      callApi("get_history", {}, { forceRefresh: force }),
      callApi("get_leaderboard", {}, { forceRefresh: force }),
      callApi("get_attendance", {}, { forceRefresh: force }),
    ]);

    const historyByName: Record<string, any[]> = {};
    if (resHist.status === "success" && resHist.history) {
      const sessionMap: Record<string, LessonSessionRecord> = {};

      resHist.history.forEach((h: any, idx: number) => {
        if (!h.name) return;
        const sName = String(h.name).trim();
        const key = sName.toLowerCase();
        if (!historyByName[key]) historyByName[key] = [];
        historyByName[key].push(h);

        // Group into Lesson Session Record
        const regStudent = teacherStore.allStudentsRegistry.value.find(
          (s) => s.name.toLowerCase() === key
        );
        const sGroup = regStudent?.group || h.group || "Umumiy";
        const dateStr = h.date ? String(h.date).trim() : "Avvalgi dars";
        const rawTopic = h.topic || (h.book ? `${h.book} darsi` : "Savol-Javob Darsi");
        const topicStr = formatCleanTopicName(rawTopic);
        const modeStr = h.mode ? (h.mode === "standard" ? "Savol-Javob" : h.mode) : "Savol-Javob";

        const groupKey = `${dateStr}___${sGroup.toLowerCase()}___${topicStr.toLowerCase()}`;

        if (!sessionMap[groupKey]) {
          sessionMap[groupKey] = {
            id: "db-sess-" + idx + "-" + Math.abs(hashCode(groupKey)),
            date: dateStr,
            time: h.time || "14:00",
            teacher: h.teacher || teacherStore.teacherName.value || "Ustoz",
            group: sGroup,
            mode: modeStr,
            book: h.book || "",
            topic: topicStr,
            maxQuestions: 0,
            avgPercent: 0,
            studentResults: [],
            createdAt: parseDateStrToMillis(dateStr, idx),
          };
        }

        const p = Math.round(parseFloat(String(h.percent)) || 0);
        const correctVal = h.correct ? parseInt(h.correct) : Math.round((p / 100) * 10);
        const totalVal = h.total ? parseInt(h.total) : 10;

        sessionMap[groupKey].studentResults.push({
          name: sName,
          correct: correctVal,
          total: totalVal,
          percent: p,
          strikes: parseInt(h.strike) || 0,
          penalties: 0,
          coins: parseInt(h.coin) || (p >= 80 ? 20 : 5),
          attStatus: "Keldi",
        });
      });

      // Calculate avgPercent for each session and sort students by percent
      for (const key in sessionMap) {
        const sess = sessionMap[key];
        if (sess.studentResults.length > 0) {
          const sumP = sess.studentResults.reduce((acc, st) => acc + st.percent, 0);
          sess.avgPercent = Math.round(sumP / sess.studentResults.length);
          sess.studentResults.sort((a, b) => b.percent - a.percent);
        }
      }

      dbHistorySessions.value = Object.values(sessionMap);
    }

    // Merge local teacher lesson sessions into historyByName so offline/local tests are included!
    if (Array.isArray(teacherStore.lessonSessions.value)) {
      teacherStore.lessonSessions.value.forEach((sess: any) => {
        const sessDate = sess.date || "Dars";
        const sessTime = sess.time || "";
        const sessTopic = formatCleanTopicName(sess.topic || (sess.book ? `${sess.book} darsi` : "Dars"));
        const sessBook = sess.book || "";
        const results = sess.studentResults || sess.results || [];
        if (Array.isArray(results)) {
          results.forEach((r: any) => {
            if (!r || !r.name) return;
            const sName = String(r.name).trim();
            const key = sName.toLowerCase();
            if (!historyByName[key]) historyByName[key] = [];
            const alreadyExists = historyByName[key].some(
              (item) => item.date === sessDate && (item.topic === sessTopic || item.topic === sess.topic)
            );
            if (!alreadyExists) {
              const p = Math.round(parseFloat(r.percent) || 0);
              historyByName[key].push({
                name: sName,
                date: sessDate,
                time: sessTime,
                book: sessBook,
                topic: sessTopic,
                correct: r.correct !== undefined ? r.correct : Math.round((p / 100) * (r.total || 10)),
                total: r.total || 10,
                percent: p,
                coin: r.coins || (p >= 80 ? 20 : 5),
                strike: r.strikes || 0,
                mode: sess.mode || "Savol-Javob",
              });
            }
          });
        }
      });
    }

    studentHistoryMap.value = historyByName;

    const lbByName: Record<string, any> = {};
    if (resLb.status === "success" && resLb.leaderboard) {
      resLb.leaderboard.forEach((lb: any) => {
        if (!lb.name) return;
        lbByName[lb.name.trim().toLowerCase()] = lb;
      });
    }

    // Process Attendance Logs
    const studentDatesMap: Record<string, Map<string, { date: string; status: "Keldi" | "Sababli" | "Sababsiz"; topic: string }>> = {};
    const getStudentDates = (name: string) => {
      const k = name.trim().toLowerCase();
      if (!studentDatesMap[k]) studentDatesMap[k] = new Map();
      return { key: k, map: studentDatesMap[k] };
    };

    // 1. Google Sheets attendance records
    if (resAtt && resAtt.status === "success" && Array.isArray(resAtt.attendance)) {
      resAtt.attendance.forEach((att: any) => {
        if (!att || !att.name) return;
        const dStr = att.date ? String(att.date).trim() : "";
        if (!dStr) return;
        const { map } = getStudentDates(String(att.name));

        const rawStatus = String(att.status || "").trim().toLowerCase();
        let status: "Keldi" | "Sababli" | "Sababsiz" = "Keldi";
        if (rawStatus === "sababli" || rawStatus === "excused") {
          status = "Sababli";
        } else if (rawStatus === "sababsiz" || rawStatus === "unexcused") {
          status = "Sababsiz";
        }

        map.set(dStr, {
          date: dStr,
          status,
          topic: att.topic || "Dars",
        });
      });
    }

    // 2. Local teacher attendance logs (offline/recent marks)
    try {
      const localLogsStr = localStorage.getItem("ha_attendance_logs");
      if (localLogsStr) {
        const localLogs = JSON.parse(localLogsStr);
        if (Array.isArray(localLogs)) {
          localLogs.forEach((item: any) => {
            if (item.name && item.date) {
              const { map } = getStudentDates(String(item.name));
              const dStr = String(item.date).trim();
              const rawStatus = String(item.status || "").trim().toLowerCase();
              let status: "Keldi" | "Sababli" | "Sababsiz" = "Keldi";
              if (rawStatus === "sababli" || rawStatus === "excused") status = "Sababli";
              else if (rawStatus === "sababsiz" || rawStatus === "unexcused") status = "Sababsiz";
              map.set(dStr, { date: dStr, status, topic: item.topic || "Dars" });
            }
            if (item.date && Array.isArray(item.records)) {
              item.records.forEach((rec: any) => {
                if (rec.name) {
                  const { map } = getStudentDates(String(rec.name));
                  const dStr = String(item.date).trim();
                  const rawStatus = String(rec.status || "").trim().toLowerCase();
                  let status: "Keldi" | "Sababli" | "Sababsiz" = "Keldi";
                  if (rawStatus === "sababli" || rawStatus === "excused") status = "Sababli";
                  else if (rawStatus === "sababsiz" || rawStatus === "unexcused") status = "Sababsiz";
                  map.set(dStr, { date: dStr, status, topic: item.topic || "Dars" });
                }
              });
            }
          });
        }
      }
    } catch {}

    // 3. Test history (students who took tests were definitely in class)
    if (resHist.status === "success" && resHist.history) {
      resHist.history.forEach((h: any) => {
        if (!h.name || !h.date) return;
        const dStr = String(h.date).trim();
        const { map } = getStudentDates(String(h.name));
        if (!map.has(dStr)) {
          map.set(dStr, {
            date: dStr,
            status: "Keldi",
            topic: formatCleanTopicName(h.topic || (h.book ? `${h.book} darsi` : "Savol-Javob Darsi")),
          });
        }
      });
    }

    const finalAttMap: Record<string, { present: number; excused: number; unexcused: number; logs: any[] }> = {};
    for (const key in studentDatesMap) {
      const records = Array.from(studentDatesMap[key].values());
      records.sort((a, b) => {
        const tA = parseDateStrToMillis(a.date, 0);
        const tB = parseDateStrToMillis(b.date, 0);
        return tB - tA;
      });

      let present = 0;
      let excused = 0;
      let unexcused = 0;
      records.forEach((r) => {
        if (r.status === "Keldi") present++;
        else if (r.status === "Sababli") excused++;
        else if (r.status === "Sababsiz") unexcused++;
      });

      finalAttMap[key] = {
        present,
        excused,
        unexcused,
        logs: records,
      };
    }

    studentAttendanceLogsMap.value = finalAttMap;

    // Update all students in master registry
    teacherStore.allStudentsRegistry.value.forEach((s) => {
      const key = s.name.trim().toLowerCase();
      const histList = historyByName[key] || [];
      const lb = lbByName[key];
      const att = finalAttMap[key];

      if (histList.length > 0) {
        s.totalTests = histList.length;
        const sumPercent = histList.reduce((acc: number, h: any) => acc + (parseFloat(h.percent) || 0), 0);
        s.avgAccuracy = Math.round(sumPercent / histList.length);
      }
      if (lb) {
        s.coins = parseInt(lb.coin) || s.coins || 0;
        s.strikes = parseInt(lb.strike) || s.strikes || 0;
      } else if (histList.length > 0) {
        s.coins = histList.reduce((acc: number, h: any) => acc + (parseInt(h.coin) || 0), 0);
        s.strikes = histList.reduce((acc: number, h: any) => acc + (parseInt(h.strike) || 0), 0);
      }

      if (att) {
        s.attendanceStats = {
          present: att.present,
          excused: att.excused,
          unexcused: att.unexcused,
        };
      }
    });
  } catch (e) {
    console.warn("refreshStudentStats error:", e);
  }
}

const restoringStudents = ref(false);

async function triggerRestoreStudents() {
  if (restoringStudents.value) return;
  restoringStudents.value = true;
  try {
    const res = await teacherStore.restoreAndFindAllStudents();
    await refreshStudentStats(true);
    alert(
      `✅ Qidiruv va tiklash muvaffaqiyatli yakunlandi!\n\n` +
      `📊 Jami bazadagi o'quvchilar: ${res.total} ta\n` +
      `✨ Yangi topilgan va tiklanganlar: ${res.newlyRestored} ta\n` +
      `📱 Tekshirilgan manbalar: Lokal dars sessiyalari, davomat jurnali, Firebase buluti va Google Sheets.`
    );
  } catch (e: any) {
    alert("O'quvchilarni qidirishda xatolik yuz berdi: " + (e.message || e));
  } finally {
    restoringStudents.value = false;
  }
}

function getStudentAttendanceSummary(student: Student) {
  const key = student.name.trim().toLowerCase();
  const att = studentAttendanceLogsMap.value[key];
  if (att) {
    const total = att.present + att.excused + att.unexcused;
    const percent = total > 0 ? Math.round((att.present / total) * 100) : 100;
    return { present: att.present, excused: att.excused, unexcused: att.unexcused, total, percent };
  }
  const st = student.attendanceStats || { present: 0, excused: 0, unexcused: 0 };
  const total = (st.present || 0) + (st.excused || 0) + (st.unexcused || 0);
  const percent = total > 0 ? Math.round(((st.present || 0) / total) * 100) : 100;
  return { present: st.present || 0, excused: st.excused || 0, unexcused: st.unexcused || 0, total, percent };
}

function exportStudentsToExcel(subset?: Student[], customTitle?: string) {
  const listToExport = subset || filteredStudents.value;
  if (!listToExport || listToExport.length === 0) {
    alert("Eksport qilish uchun o'quvchilar ro'yxati bo'sh!");
    return;
  }

  const rows = listToExport.map((s, idx) => {
    const groupsStr = getStudentGroupList(s).join(", ");
    const attData = getStudentAttendanceSummary(s);
    return {
      "№": idx + 1,
      "O'quvchi F.I.SH": s.name,
      "Guruh(lar)": groupsStr,
      "Asosiy Guruhi": s.group || "Umumiy",
      "Holati": s.status === "frozen" ? "Muzlatilgan" : "Faol",
      "O'quvchi Telefoni": s.phone || "",
      "Ota-onasi F.I.SH": s.parentName || "",
      "Ota-onasi Telefoni": s.parentPhone || "",
      "Ota-onasi Telegrami": s.parentTg || "",
      "6-Xonali PIN": s.pin || s.password || "",
      "Login": s.login || s.name.toLowerCase().replace(/\s+/g, "_"),
      "O'rtacha Aniqlik (%)": (s.avgAccuracy || 0) + "%",
      "Darslar va Testlar Soni": s.totalTests || 0,
      "Yig'ilgan Tangalar": s.coins || 0,
      "Strikylar": s.strikes || 0,
      "Jarimalar": s.penalties || 0,
      "Davomat (%)": (attData.percent || 0) + "%",
      "Kelgan Darslar": attData.present || 0,
      "Sababli Qoldirilgan": attData.excused || 0,
      "Sababsiz Qoldirilgan": attData.unexcused || 0,
      "Qo'shilgan Sana": s.joinedDate || "",
      "Eslatma / Xarakteristika": s.notes || "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },  // №
    { wch: 25 }, // Ism
    { wch: 28 }, // Guruhlar
    { wch: 18 }, // Asosiy guruh
    { wch: 14 }, // Holat
    { wch: 16 }, // Tel
    { wch: 24 }, // Ota-ona
    { wch: 16 }, // Ota-ona tel
    { wch: 18 }, // Telegram
    { wch: 14 }, // PIN
    { wch: 20 }, // Login
    { wch: 18 }, // Aniqlik %
    { wch: 20 }, // Testlar soni
    { wch: 16 }, // Tangalar
    { wch: 10 }, // Strikylar
    { wch: 10 }, // Jarimalar
    { wch: 14 }, // Davomat %
    { wch: 12 }, // Keldi
    { wch: 12 }, // Sababli
    { wch: 12 }, // Sababsiz
    { wch: 15 }, // Sana
    { wch: 35 }, // Eslatma
  ];

  const wb = XLSX.utils.book_new();
  const rawTitle = customTitle || selectedGroupFilter.value || "Barcha_Oquvchilar";
  const sheetTitle = rawTitle.replace(/[/\\?*[\]]/g, "_").substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

  const nowStr = new Date().toISOString().split("T")[0];
  const filename = `Oquvchilar_Royxati_${sheetTitle}_${nowStr}.xlsx`.replace(/\s+/g, "_");
  XLSX.writeFile(wb, filename);
}

function exportSingleStudentDoskaToExcel(student: Student) {
  if (!student) return;
  const wb = XLSX.utils.book_new();

  // Sheet 1: General Student Profile & Stats
  const attData = selectedStudentAttendanceData.value;
  const profileRow = [
    {
      "F.I.SH": student.name,
      "Holati": student.status === "frozen" ? "Muzlatilgan" : "Faol",
      "Guruhlari": getStudentGroupList(student).join(", "),
      "O'quvchi Telefoni": student.phone || "Kiritilmagan",
      "Ota-onasi": student.parentName || "Kiritilmagan",
      "Ota-ona Telefoni": student.parentPhone || "Kiritilmagan",
      "Ota-ona Telegram": student.parentTg || "Kiritilmagan",
      "6-Xonali PIN": student.pin || student.password || "",
      "O'rtacha Aniqlik (%)": (student.avgAccuracy || 0) + "%",
      "Jami Darslar/Testlar": selectedStudentHistory.value.length || student.totalTests || 0,
      "Tangalar": student.coins || 0,
      "Strikylar": student.strikes || 0,
      "Jarimalar": student.penalties || 0,
      "Davomat (%)": attData.percent + "%",
      "Qatnashdi": attData.present,
      "Sababli": attData.excused,
      "Sababsiz": attData.unexcused,
      "Qo'shilgan Sana": student.joinedDate || "",
      "Eslatma / Xarakteristika": student.notes || "",
    }
  ];
  const wsProfile = XLSX.utils.json_to_sheet(profileRow);
  XLSX.utils.book_append_sheet(wb, wsProfile, "Shaxsiy Ma'lumotlar");

  // Sheet 2: Detailed Test & Lesson Results
  const historyRows = selectedStudentHistory.value.map((h, i) => {
    const p = Math.round(parseFloat(h.percent) || 0);
    const correctVal = h.correct !== undefined ? h.correct : Math.round((p / 100) * (parseInt(h.total) || 10));
    const totalVal = parseInt(h.total) || 10;
    return {
      "№": i + 1,
      "Sana": h.date || "Avvalgi dars",
      "Vaqt": h.time || "",
      "Dars / Test Mavzusi": formatCleanTopicName(h.topic || (h.book ? `${h.book} darsi` : "Savol-Javob")),
      "Kitob / Fan": h.book || "",
      "To'g'ri Javoblar": correctVal,
      "Jami Savollar": totalVal,
      "O'zlashtirish (%)": `${p}%`,
      "Daraja": p >= 85 ? "A'lo 🏆" : p >= 70 ? "Yaxshi 👍" : p >= 50 ? "Qoniqarli" : "Past",
      "Tangalar": h.coin ? `+${h.coin}` : "",
      "Strikylar": h.strike ? `+${h.strike}` : "",
      "Rejim": h.mode || "Savol-Javob",
    };
  });
  const wsHistory = XLSX.utils.json_to_sheet(historyRows.length > 0 ? historyRows : [{ "Xabar": "Natijalar mavjud emas" }]);
  wsHistory["!cols"] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 10 },
    { wch: 32 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsHistory, "Test va Dars Natijalari");

  // Sheet 3: Attendance Journal
  const attRows = (attData.logs || []).map((log: any, i: number) => ({
    "№": i + 1,
    "Sana": log.date,
    "Mavzu / Guruh": log.topic || "Dars",
    "Davomat Holati": log.status,
  }));
  const wsAtt = XLSX.utils.json_to_sheet(attRows.length > 0 ? attRows : [{ "Xabar": "Davomat yozuvlari mavjud emas" }]);
  wsAtt["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 28 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsAtt, "Davomat Jurnali");

  const cleanName = student.name.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, "_");
  const nowStr = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Oquvchi_Doskasi_${cleanName}_${nowStr}.xlsx`);
}

// --- Selective & Bulk Export to Excel ---
function exportSelectedStudentsToExcel() {
  if (selectedStudentNames.value.length === 0) {
    alert("Iltimos, avval ro'yxatdan o'quvchilarni belgilang!");
    return;
  }
  const selectedList = teacherStore.allStudentsRegistry.value.filter((s) =>
    selectedStudentNames.value.includes(s.name)
  );
  if (selectedList.length === 0) {
    alert("Belgilangan o'quvchilar topilmadi!");
    return;
  }
  exportStudentsToExcel(selectedList, `Tanlangan_${selectedList.length}_Oquvchi`);
}

function exportAllStudentsToExcel() {
  const allList = teacherStore.allStudentsRegistry.value;
  if (!allList || allList.length === 0) {
    alert("O'quvchilar ro'yxati bo'sh!");
    return;
  }
  exportStudentsToExcel(allList, "Barcha_Oquvchilar");
}

// --- Phone & Contact Recovery Center State ---
const showPhoneRecoveryModal = ref(false);
const recoveryActiveTab = ref<"scan" | "import" | "quick">("scan");
const recoveryDeepScanResult = ref<{
  scannedKeysCount: number;
  recoveredContactsCount: number;
  totalStudentsWithPhone: number;
} | null>(null);
const bulkPhoneInputText = ref("");
const bulkImportResultMsg = ref("");
const phoneMissingSearch = ref("");

const studentsWithPhoneCount = computed(() => {
  return (teacherStore.allStudentsRegistry.value || []).filter(
    (s) => !!(s.phone && s.phone.trim())
  ).length;
});

const studentsWithoutPhoneCount = computed(() => {
  return (teacherStore.allStudentsRegistry.value || []).filter(
    (s) => !(s.phone && s.phone.trim())
  ).length;
});

const studentsWithoutPhoneList = computed(() => {
  const list = (teacherStore.allStudentsRegistry.value || []).filter(
    (s) => !(s.phone && s.phone.trim())
  );
  if (!phoneMissingSearch.value.trim()) return list;
  const q = phoneMissingSearch.value.toLowerCase().trim();
  return list.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.group && s.group.toLowerCase().includes(q))
  );
});

function openPhoneRecoveryModal() {
  recoveryDeepScanResult.value = null;
  bulkImportResultMsg.value = "";
  recoveryActiveTab.value = "scan";
  showPhoneRecoveryModal.value = true;
}

function triggerDeepScanFromModal() {
  const res = teacherStore.deepRecoverAllDataFromLocalStorage();
  recoveryDeepScanResult.value = res;
  refreshStudentStats(true);
}

function handleBulkPhoneImport() {
  if (!bulkPhoneInputText.value.trim()) {
    alert("Iltimos, avval matn kiriting!");
    return;
  }
  const res = teacherStore.bulkImportContacts(bulkPhoneInputText.value);
  bulkImportResultMsg.value = `✅ Muvaffaqiyatli: ${res.matchedCount} ta o'quvchining kontakt ma'lumotlari yangilandi!`;
  bulkPhoneInputText.value = "";
  refreshStudentStats(true);
}

function saveSingleMissingPhone(student: any, phone: string, parentPhone?: string) {
  if (!student) return;
  teacherStore.saveStudent({
    ...student,
    phone: (phone || "").trim(),
    parentPhone: parentPhone !== undefined ? parentPhone.trim() : student.parentPhone || "",
  });
  alert(`✅ "${student.name}" uchun telefon raqami muvaffaqiyatli saqlandi!`);
}

function quickAddPhone(student: any) {
  if (!student) return;
  const input = prompt(
    `"${student.name}" uchun telefon raqamini kiriting (masalan, +998901234567):`,
    student.phone || "+998"
  );
  if (input !== null && input.trim() && input.trim() !== "+998") {
    saveSingleMissingPhone(student, input.trim(), student.parentPhone);
  }
}

// Watch for globally triggered student doska request from any component
watch(
  () => teacherStore.selectedDoskaStudent?.value,
  (st) => {
    if (st) {
      openStudentDetail(st);
      teacherStore.selectedDoskaStudent.value = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Proactively run recovery from local storage if contacts exist in backup
  teacherStore.deepRecoverAllDataFromLocalStorage();
  refreshStudentStats();

  if (teacherStore.selectedDoskaStudent?.value) {
    openStudentDetail(teacherStore.selectedDoskaStudent.value);
    teacherStore.selectedDoskaStudent.value = null;
  }

  if (teacherStore.allStudentsRegistry.value.length === 0) {
    teacherStore
      .restoreAndFindAllStudents()
      .then(() => {
        refreshStudentStats(true);
      })
      .catch(() => {});
  }
});

const isAllSelected = computed(() => {
  return (
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every((s) => selectedStudentNames.value.includes(s.name))
  );
});

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedStudentNames.value = [];
  } else {
    selectedStudentNames.value = filteredStudents.value.map((s) => s.name);
  }
}

// --- Group Transfer Actions ---
function openTransferModal(student: Student) {
  isBatchTransfer.value = false;
  transferTargetStudent.value = student;
  transferNewGroupName.value = student.group || "";
  showTransferModal.value = true;
}

function openBatchTransferModal() {
  if (selectedStudentNames.value.length === 0) return;
  isBatchTransfer.value = true;
  transferTargetStudent.value = null;
  transferNewGroupName.value = groupsList.value[0]?.name || "";
  showTransferModal.value = true;
}

function doConfirmTransfer() {
  const newGroup = transferNewGroupName.value.trim();
  if (!newGroup) return;
  const isAdd = transferActionType.value === "add";

  if (isBatchTransfer.value) {
    teacherStore.transferMultipleStudentsGroup(selectedStudentNames.value, newGroup, isAdd);
    selectedStudentNames.value = [];
  } else if (transferTargetStudent.value) {
    teacherStore.transferStudentGroup(transferTargetStudent.value.name, newGroup, isAdd);
  }

  showTransferModal.value = false;
  alert(
    isAdd
      ? `✅ Tanlangan o'quvchi(lar) "${newGroup}" guruhiga ham muvaffaqiyatli a'zo qilindi!`
      : `✅ Tanlangan o'quvchi(lar) "${newGroup}" guruhiga ko'chirildi!`
  );
}

// --- Sync Real Students from Google Sheets Database ---
async function syncFromDb(force = true) {
  syncingDb.value = true;
  try {
    const res = await callApi("get_student_list", {}, { forceRefresh: force });
    if (res.status === "success" && res.groups) {
      let countAdded = 0;
      for (const groupName in res.groups) {
        if (groupName === "Arxiv") continue;
        const members: string[] = res.groups[groupName] || [];
        members.forEach((name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          const exists = teacherStore.allStudentsRegistry.value.find(
            (s) => s.name.toLowerCase() === trimmed.toLowerCase()
          );
          if (!exists) {
            const pin = teacherStore.generateUnique6DigitPin(trimmed);
            teacherStore.saveStudent({
              id: "db-" + Math.random().toString(36).substring(2, 9),
              name: trimmed,
              group: groupName,
              status: "active",
              login: trimmed.toLowerCase().replace(/\s+/g, "_"),
              pin: pin,
              password: pin,
              correct: 0,
              total: 0,
              sess: 0,
              strikes: 0,
              penalties: 0,
              bonus: 0,
              coins: 0,
              totalTests: 0,
              avgAccuracy: 0,
              attendanceStats: { present: 0, excused: 0, unexcused: 0 },
              joinedDate: new Date().toISOString().split("T")[0],
            });
            countAdded++;
          } else {
            let updated = false;
            if (!exists.group || exists.group === "Umumiy") {
              exists.group = groupName;
              exists.groups = [groupName];
              updated = true;
            }
            if (!exists.pin || !/^\d{6}$/.test(exists.pin)) {
              const defPin = teacherStore.generateUnique6DigitPin(trimmed);
              exists.pin = defPin;
              exists.password = defPin;
              updated = true;
            }
            if (updated) {
              teacherStore.syncStudentToCloud(exists);
              teacherStore.syncGroupTransferToCloud(exists.name, exists.group);
            }
          }
        });
      }
      teacherStore.allStudentsRegistry.value = [...teacherStore.allStudentsRegistry.value];
      localStorage.setItem("ha_all_students", JSON.stringify(teacherStore.allStudentsRegistry.value));
      await refreshStudentStats(true);
      alert(`Baza bilan muvaffaqiyatli sinxronlandi! ${countAdded > 0 ? countAdded + " ta yangi o'quvchi qo'shildi." : "Barcha o'quvchilar va natijalar yangilandi."}`);
    } else {
      alert("Bazada guruhlar topilmadi.");
    }
  } catch (e: any) {
    alert("Baza bilan ulanishda xatolik yuz berdi: " + (e.message || e));
  } finally {
    syncingDb.value = false;
  }
}

function clearSampleStudents() {
  if (confirm("Namunaviy o'quvchilar ro'yxatdan o'chirilsinmi? (Haqiqiy o'quvchilar saqlanib qoladi)")) {
    teacherStore.allStudentsRegistry.value = teacherStore.allStudentsRegistry.value.filter(
      (s) => !sampleStudentNames.has(s.name.trim()) && !sampleStudentIds.has(s.id || "")
    );
    teacherStore.reminders.value = teacherStore.reminders.value.filter(
      (r) => r.id !== "rem-1" && r.id !== "rem-2"
    );
  }
}

// --- Group Freeze Actions ---
function toggleGroupFreeze(groupName: string, freeze: boolean) {
  teacherStore.toggleFreezeGroup(groupName, freeze);
}

// --- Helper methods for Multi-group & Doska ---
function getStudentGroupList(student: Partial<Student>): string[] {
  return getStudentGroups(student as Student);
}

function toggleFormGroup(groupName: string) {
  const clean = groupName.trim();
  if (!clean) return;
  const idx = formStudentGroups.value.indexOf(clean);
  if (idx !== -1) {
    if (formStudentGroups.value.length > 1) {
      formStudentGroups.value.splice(idx, 1);
    } else {
      alert("O'quvchi kamida bitta guruhda bo'lishi kerak!");
    }
  } else {
    formStudentGroups.value.push(clean);
  }
}

function removeFormGroup(groupName: string) {
  const clean = groupName.trim();
  if (formStudentGroups.value.length <= 1) {
    alert("O'quvchi kamida bitta guruhda bo'lishi kerak!");
    return;
  }
  formStudentGroups.value = formStudentGroups.value.filter((g) => g !== clean);
}

function addCustomGroupToForm() {
  const clean = formCustomGroupInput.value.trim();
  if (!clean) return;
  if (!formStudentGroups.value.includes(clean)) {
    formStudentGroups.value.push(clean);
  }
  formCustomGroupInput.value = "";
}

function handleQuickAddGroupToSelectedStudent(event: Event) {
  const select = event.target as HTMLSelectElement;
  const newGroup = select.value;
  if (!newGroup || !selectedStudent.value) return;
  teacherStore.addStudentToGroup(selectedStudent.value.name, newGroup);
  const updated = teacherStore.allStudentsRegistry.value.find(
    (s) => s.name.toLowerCase().trim() === selectedStudent.value?.name.toLowerCase().trim()
  );
  if (updated) {
    selectedStudent.value = updated;
  }
  select.value = "";
}

function handleRemoveGroupFromSelectedStudent(groupName: string) {
  if (!selectedStudent.value) return;
  const curGroups = getStudentGroupList(selectedStudent.value);
  if (curGroups.length <= 1) {
    alert("O'quvchi kamida bitta guruhda bo'lishi shart!");
    return;
  }
  if (confirm(`"${selectedStudent.value.name}"ni "${groupName}" guruhidan chiqarishni tasdiqlaysizmi?`)) {
    teacherStore.removeStudentFromGroup(selectedStudent.value.name, groupName);
    const updated = teacherStore.allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === selectedStudent.value?.name.toLowerCase().trim()
    );
    if (updated) {
      selectedStudent.value = updated;
    }
  }
}

function availableGroupsToAdd(student: Partial<Student>): Array<{ name: string }> {
  const current = getStudentGroupList(student);
  return groupsList.value.filter((g) => !current.includes(g.name));
}

// --- Student CRUD Actions ---
function openAddModal() {
  editingStudent.value = false;
  const pin = teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value);
  const initialGroup = selectedGroupFilter.value || (groupsList.value[0]?.name || "Umumiy");
  formStudentGroups.value = [initialGroup];
  formCustomGroupInput.value = "";
  formStudent.value = {
    id: "usr-" + Date.now(),
    name: "",
    group: initialGroup,
    groups: [initialGroup],
    status: "active",
    phone: "",
    parentName: "",
    parentPhone: "",
    parentTg: "",
    login: "",
    pin: pin,
    password: pin,
    pattern: "",
    notes: "",
  };
  showAddEditModal.value = true;
}

function openEditModal(student: Student) {
  editingStudent.value = true;
  const sGroups = getStudentGroupList(student);
  formStudentGroups.value = [...sGroups];
  formCustomGroupInput.value = "";
  formStudent.value = {
    ...student,
    group: student.group || sGroups[0] || "Umumiy",
    groups: sGroups,
    pin: student.pin || student.password || teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value),
  };
  showAddEditModal.value = true;
}

function generateCredentials() {
  const base = formStudent.value.name?.trim().toLowerCase().replace(/\s+/g, "_") || "student";
  formStudent.value.login = base + (Math.floor(10 + Math.random() * 90));
  const pin = teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value);
  formStudent.value.pin = pin;
  formStudent.value.password = pin;
}

function generatePinForForm() {
  const pin = teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value);
  formStudent.value.pin = pin;
  formStudent.value.password = pin;
}

function copyPin(pin: string) {
  navigator.clipboard.writeText(pin);
  alert(`6 xonali PIN (${pin}) nusxalandi!`);
}

function handleResetPattern(student: Student) {
  if (confirm(`"${student.name}"ning grafik kalitini (Pattern) tozalashni tasdiqlaysizmi?`)) {
    teacherStore.resetStudentPattern(student.name);
    student.pattern = "";
    if (selectedStudent.value && selectedStudent.value.name === student.name) {
      selectedStudent.value.pattern = "";
    }
    alert(`"${student.name}"ning grafik kaliti tozalandi! O'quvchi keyingi safar o'z 6 xonali PIN kodi (${student.pin || student.password || '123456'}) orqali kirib yangi grafik kalit chizib oladi.`);
  }
}

function handleRegeneratePin(student: Student) {
  if (confirm(`"${student.name}" uchun yangi 6 xonali PIN kod generatsiya qilinsinmi?`)) {
    const newPin = teacherStore.regenerateStudentPin(student.name);
    if (newPin) {
      student.pin = newPin;
      student.password = newPin;
      if (selectedStudent.value && selectedStudent.value.name === student.name) {
        selectedStudent.value.pin = newPin;
        selectedStudent.value.password = newPin;
      }
      alert(`"${student.name}" uchun yangi 6 xonali PIN kod berildi: 🔢 ${newPin}`);
    }
  }
}

function saveStudentData() {
  const name = formStudent.value.name?.trim();
  if (!name) {
    alert("Iltimos, o'quvchining to'liq F.I.Sh ni kiriting!");
    return;
  }
  const selectedGroups = formStudentGroups.value.length > 0
    ? formStudentGroups.value
    : [formStudent.value.group?.trim() || "Umumiy"];
  const primaryGroup = selectedGroups[0] || "Umumiy";

  if (!formStudent.value.pin || !/^\d{6}$/.test(formStudent.value.pin)) {
    formStudent.value.pin = teacherStore.generateUnique6DigitPin(name);
    formStudent.value.password = formStudent.value.pin;
  }

  teacherStore.saveStudent({
    ...formStudent.value,
    name,
    group: primaryGroup,
    groups: selectedGroups,
    pin: formStudent.value.pin,
    password: formStudent.value.password || formStudent.value.pin,
  } as any);

  if (selectedGroupFilter.value && !selectedGroups.includes(selectedGroupFilter.value)) {
    selectedGroupFilter.value = primaryGroup;
  }

  if (selectedStudent.value && selectedStudent.value.name.toLowerCase().trim() === name.toLowerCase()) {
    const updated = teacherStore.allStudentsRegistry.value.find(
      (s) => s.name.toLowerCase().trim() === name.toLowerCase()
    );
    if (updated) selectedStudent.value = updated;
  }

  searchQuery.value = "";
  currentPage.value = 1;
  showAddEditModal.value = false;

  alert(`✅ "${name}" muvaffaqiyatli saqlandi!\n👥 Guruhlari: ${selectedGroups.join(", ")}\n🔢 6 xonali PIN kod: ${formStudent.value.pin}`);
}

function toggleFreeze(student: Student) {
  teacherStore.toggleFreezeStudent(student.name);
}

function confirmDelete(student: Student) {
  if (confirm(`Haqiqatan ham "${student.name}"ni ro'yxatdan o'chirmoqchimisiz?`)) {
    teacherStore.deleteStudentPermanently(student.name);
  }
}

function openStudentDetail(student: Student) {
  selectedStudent.value = student;
  activeDoskaTab.value = "history";
  managerView.value = "student-doska";
  showDetailModal.value = false;
  if (Object.keys(studentAttendanceLogsMap.value).length === 0 || Object.keys(studentHistoryMap.value).length === 0) {
    refreshStudentStats();
  }
}

function copyCredentials(student: Student) {
  const pin = student.pin || student.password || "123456";
  const url = window.location.origin;

  const text = `🎓 Hurmatli ${student.name}!\nSizning "History Arena Pro" portaliga kirish 6 xonali PIN kodingiz: 🔢 ${pin}\n🌐 Sayt: ${url}\n\n💡 Saytga kiring va 6 xonali PIN kodingizni terib, o'zingizga qulay grafik kalit (Pattern) chizib oling! 🚀`;

  navigator.clipboard.writeText(text);
  alert("O'quvchining 6 xonali PIN kodi nusxalandi! O'quvchi yoki ota-onasiga yuborishingiz mumkin.");
}

// --- Reminders Actions ---
function openReminderModal(student?: Student) {
  reminderTargetStudent.value = student || null;
  formReminder.value = {
    title: student ? `${student.name} bilan bog'lanish va natijalarni tahlil qilish` : "",
    date: new Date().toISOString().split("T")[0],
    time: "15:00",
    type: "call",
    note: "",
  };
  showReminderModal.value = true;
}

function openRemindersListModal() {
  showRemindersListModal.value = true;
}

function saveReminder() {
  if (!formReminder.value.title.trim()) return;
  teacherStore.addReminder({
    studentName: reminderTargetStudent.value?.name,
    group: reminderTargetStudent.value?.group,
    title: formReminder.value.title.trim(),
    date: formReminder.value.date,
    time: formReminder.value.time,
    type: formReminder.value.type,
    note: formReminder.value.note.trim(),
  });
  showReminderModal.value = false;
}

function isReminderDue(rem: TeacherReminder) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const curTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (rem.date < todayStr) return true;
  if (rem.date === todayStr && rem.time <= curTimeStr) return true;
  return false;
}

// --- Parent Alert Actions ---
function openParentAlert(student: Student) {
  parentAlertStudent.value = student;
  tgSent.value = false;
  setAlertTemplate("result");
  showParentAlertModal.value = true;
}

function setAlertTemplate(type: "result" | "warning" | "payment" | "praise") {
  alertTemplate.value = type;
  const s = parentAlertStudent.value;
  if (!s) return;

  const parent = s.parentName || "Ota-onasi";
  const group = s.group || "Tarix guruhi";
  const acc = s.avgAccuracy || 0;
  const coins = s.coins || 0;

  if (type === "result") {
    generatedAlertText.value = `Assalomu alaykum, hurmatli ${parent}!\n\nFarzandingiz ${s.name} ning "${group}" tarix darslaridagi o'zlashtirish hisoboti:\n📊 Umumiy aniqlik foizi: ${acc}%\n🪙 Yig'ilgan tangalar: ${coins}\n⭐ Strikylar (A'lo javoblar): ${s.strikes || 0}\n\nO'qituvchi: ${teacherStore.teacherName.value || "Tarix fani o'qituvchisi"}`;
  } else if (type === "warning") {
    generatedAlertText.value = `Assalomu alaykum, hurmatli ${parent}!\n\nFarzandingiz ${s.name} ning "${group}" darslarida sababsiz qoldirish yoki past natija qayd etilmoqda. Iltimos, darslarga tayyorgarligini nazorat qilib berishingizni so'raymiz.\n\nSavollar bo'lsa, o'qituvchi bilan bog'laning.`;
  } else if (type === "payment") {
    generatedAlertText.value = `Assalomu alaykum, hurmatli ${parent}!\n\nFarzandingiz ${s.name} ning "${group}" bo'yicha navbatdagi oylik dars to'lovi muddati yaqinlashmoqda. Darslar to'xtovsiz davom etishi uchun to'lovni o'z vaqtida amalga oshirishingizni so'raymiz.\n\nRahmat!`;
  } else if (type === "praise") {
    generatedAlertText.value = `🎉 Assalomu alaykum, hurmatli ${parent}!\n\nFarzandingiz ${s.name} bugungi tarix darsida yuqori natija (${acc}%) va faollik ko'rsatib, ⭐ ${s.strikes || 1} ta strik va 🪙 ${coins} tanga yutib oldi! Iqtidorli farzandingiz bilan faxrlanamiz! 🚀`;
  }
}

function copyAlertText() {
  navigator.clipboard.writeText(generatedAlertText.value);
  alert("Xabar matni nusxalandi!");
}

async function sendViaTelegramBot() {
  if (!generatedAlertText.value.trim() || !parentAlertStudent.value) return;
  sendingTg.value = true;
  tgSent.value = false;

  const BOT_TOKEN = "7686180552:AAE1qOcFbuoPypIT_SD5T44YUg1R0YnQ8ug";
  const ADMIN_CHAT_ID = "-1003235272020";

  try {
    // 1. Send direct to Telegram Bot API with the exact custom text
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: generatedAlertText.value,
      }),
    });

    const data = await res.json();
    if (data && data.ok) {
      tgSent.value = true;
    } else {
      // Fallback via Apps Script
      await callApi("save", {
        text: generatedAlertText.value,
        teacher: teacherStore.teacherName.value,
        mode: "team_battle",
        students: [],
      });
      tgSent.value = true;
    }
  } catch (e: any) {
    try {
      // Fallback
      await callApi("save", {
        text: generatedAlertText.value,
        teacher: teacherStore.teacherName.value,
        mode: "team_battle",
        students: [],
      });
      tgSent.value = true;
    } catch (err: any) {
      alert("Telegram bot orqali yuborishda xatolik: " + (err.message || err));
    }
  } finally {
    sendingTg.value = false;
  }
}

function sendViaTelegramApp() {
  const text = encodeURIComponent(generatedAlertText.value);
  if (parentAlertStudent.value?.parentTg) {
    const handle = parentAlertStudent.value.parentTg.replace("@", "");
    window.open(`https://t.me/${handle}?text=${text}`, "_blank");
  } else {
    window.open(`https://t.me/share/url?url=&text=${text}`, "_blank");
  }
}

// --- Group Hub Actions ---
function openGroupHub(groupName: string) {
  selectedGroupHubName.value = groupName;
  activeGroupTab.value = "schedule";
  const meta = teacherStore.getGroupMeta(groupName);
  groupScheduleForm.value = JSON.parse(JSON.stringify(meta));
  managerView.value = "group-hub";
  showGroupHubModal.value = false;
  manualTestAiSummary.value = "";
}

function toggleScheduleDay(day: string) {
  if (!groupScheduleForm.value.days) groupScheduleForm.value.days = [];
  const idx = groupScheduleForm.value.days.indexOf(day);
  if (idx > -1) {
    groupScheduleForm.value.days.splice(idx, 1);
  } else {
    groupScheduleForm.value.days.push(day);
  }
}

function saveGroupSchedule() {
  if (!selectedGroupHubName.value) return;
  groupScheduleForm.value.name = selectedGroupHubName.value;
  teacherStore.saveGroupMeta(groupScheduleForm.value);
  alert(`"${selectedGroupHubName.value}" guruhi ma'lumotlari muvaffaqiyatli saqlandi!`);
}

function addReminderToCurrentGroup() {
  const text = newGroupReminderText.value.trim();
  if (!text || !selectedGroupHubName.value) return;
  teacherStore.addGroupReminder(
    selectedGroupHubName.value,
    text,
    newGroupReminderDate.value,
    newGroupReminderTime.value
  );
  newGroupReminderText.value = "";
}

function copyAllGroupCredentials(groupName: string) {
  const students = teacherStore.allStudentsRegistry.value.filter((s) => (s.group || "Umumiy") === groupName);
  if (students.length === 0) {
    alert("Ushbu guruhda o'quvchilar yo'q!");
    return;
  }
  const meta = teacherStore.getGroupMeta(groupName);

  let text = `📚 «${groupName.toUpperCase()}» GURUHI O'QUVCHILARI KIRISH MA'LUMOTLARI\n`;
  if (meta.days && meta.days.length > 0) {
    text += `📅 Dars kunlari: ${meta.days.join(", ")}  |  ⏰ Vaqti: ${meta.time || "14:00"}\n`;
  }
  text += `🌐 Sayt: ${window.location.origin}\n\n`;
  text += `------------------------------------\n`;

  students.forEach((s, idx) => {
    const pin = s.pin || s.password || "123456";
    const patternStatus = s.pattern ? "🟢 Pattern o'rnatilgan" : "⏳ Pattern kutilmoqda";
    const statusIcon = s.status === "frozen" ? " [❄️ Muzlatilgan]" : "";
    text += `${idx + 1}. 👤 ${s.name}${statusIcon}\n   🔢 6 xonali PIN: ${pin} (${patternStatus})\n\n`;
  });

  text += `------------------------------------\n`;
  text += `Darslarda faol ishtirok eting va o'zlashtirish foizingizni oshiring! 🚀`;

  navigator.clipboard.writeText(text);
  alert(`"${groupName}" guruhidagi ${students.length} nafar o'quvchining login va PIN kodlari nusxalandi! Telegram guruhga yuborishingiz mumkin.`);
}

function startLessonWithGroup(groupName: string) {
  const students = teacherStore.allStudentsRegistry.value.filter(
    (s) => isStudentInGroup(s, groupName) && s.status !== "frozen"
  );
  if (students.length === 0) {
    alert("Ushbu guruhda faol o'quvchilar yo'q!");
    return;
  }
  teacherStore.students.value = [];
  teacherStore.addFromDb(students.map((s) => s.name), "standard");
  closeGroupHub();
  showGroupHubModal.value = false;
  emit("back");
}

function openAddStudentToGroup() {
  formStudent.value = {
    name: "",
    group: selectedGroupHubName.value,
    status: "active",
    phone: "",
    parentName: "",
    parentPhone: "",
    parentTg: "",
    login: "",
    password: "",
    notes: "",
  };
  editingStudent.value = false;
  showAddEditModal.value = true;
}

function getStudentPayment(studentName: string) {
  return currentGroupMeta.value.studentPayments?.[studentName];
}

function setPaymentStatus(studentName: string, status: "paid" | "pending" | "debt") {
  teacherStore.setStudentPaymentStatus(selectedGroupHubName.value, studentName, status);
}

// ========================================================
// MANUAL TEST ENTRY & LESSON HISTORY METHODS
// ========================================================
const manualTestDate = ref(new Date().toISOString().split("T")[0]);
const manualTestBooks = ref<string[]>([]);
const manualTestCustomBook = ref("");
const showBookDropdown = ref(false);
const manualTestTitle = ref("Mavzulashgan Test");
const manualTestType = ref("Mavzulashgan");
const manualTestMaxQ = ref(30);
const manualTestScores = ref<Record<string, { correct: number; attStatus: string }>>({});
const sendingManualTestTg = ref(false);
const manualTestSent = ref(false);
const manualTestAiSummary = ref("");
const generatingAiSummary = ref(false);

function toggleBookSelection(b: string) {
  const idx = manualTestBooks.value.indexOf(b);
  if (idx > -1) {
    manualTestBooks.value.splice(idx, 1);
  } else {
    manualTestBooks.value.push(b);
  }
}

function isBookSelected(b: string): boolean {
  return manualTestBooks.value.includes(b);
}

function selectAllBooks() {
  manualTestBooks.value = [...BOOK_LIST];
}

function clearBooks() {
  manualTestBooks.value = [];
  manualTestCustomBook.value = "";
}

function getSelectedBooksLabel(): string {
  const list = [...manualTestBooks.value];
  if (manualTestCustomBook.value.trim()) {
    list.push(manualTestCustomBook.value.trim());
  }
  if (list.length === 0) return "Umumiy darslik";
  if (list.length === BOOK_LIST.length && !manualTestCustomBook.value.trim()) {
    return "Barcha darsliklar (6-11)";
  }
  return list.join(", ");
}

const historyModeFilter = ref<"all" | "lessons" | "tests">("all");
const historyMonthFilter = ref<string>("all");
const groupHistoryChartRef = ref<HTMLCanvasElement | null>(null);
let groupHistoryChart: Chart | null = null;

const UZ_MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentyabr",
  "Oktyabr",
  "Noyabr",
  "Dekabr",
];

const expandedSessionIds = ref<string[]>([]);

function toggleExpandSession(id: string) {
  const idx = expandedSessionIds.value.indexOf(id);
  if (idx > -1) {
    expandedSessionIds.value.splice(idx, 1);
  } else {
    expandedSessionIds.value.push(id);
  }
}

const currentGroupSessions = computed(() => {
  if (!selectedGroupHubName.value) return [];
  const gName = selectedGroupHubName.value.toLowerCase().trim();

  // 1. Sessions from teacherStore (localStorage & Firebase)
  const localList = teacherStore.lessonSessions.value.filter(
    (s) => (s.group || "Umumiy").toLowerCase().trim() === gName
  );

  // 2. Sessions parsed from Google Sheets History
  const dbList = dbHistorySessions.value.filter(
    (s) => (s.group || "Umumiy").toLowerCase().trim() === gName
  );

  // Merge and deduplicate by date + topic
  const seen = new Set<string>();
  const combined: LessonSessionRecord[] = [];

  localList.forEach((s) => {
    const key = `${s.date}___${(s.topic || s.book || '').toLowerCase()}`;
    seen.add(key);
    combined.push(s);
  });

  dbList.forEach((s) => {
    const key = `${s.date}___${(s.topic || s.book || '').toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(s);
    }
  });

  return combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
});

// Dynamic available months extracted from group's sessions
const availableGroupMonths = computed(() => {
  const map: Record<string, { key: string; label: string; count: number; timestamp: number }> = {};
  currentGroupSessions.value.forEach((s) => {
    const d = new Date(s.createdAt || Date.now());
    const year = d.getFullYear();
    const mIdx = d.getMonth();
    const key = `${year}-${String(mIdx + 1).padStart(2, "0")}`;
    const label = `${UZ_MONTHS[mIdx]} ${year}`;
    if (!map[key]) {
      map[key] = {
        key,
        label,
        count: 0,
        timestamp: new Date(year, mIdx, 1).getTime(),
      };
    }
    map[key].count++;
  });
  return Object.values(map).sort((a, b) => b.timestamp - a.timestamp);
});

function isTestSession(s: { mode?: string; topic?: string }): boolean {
  const m = (s.mode || "").toLowerCase();
  const t = (s.topic || "").toLowerCase();
  return (
    m === "manual_test" ||
    m.includes("test") ||
    m.includes("dtm") ||
    m.includes("mock") ||
    m.includes("imtihon") ||
    m.includes("mavzulashgan") ||
    m.includes("konkurs") ||
    t.includes("test") ||
    t.includes("dtm") ||
    t.includes("mock") ||
    t.includes("imtihon")
  );
}

const historyLessonsCount = computed(() => {
  return currentGroupSessions.value.filter((s) => !isTestSession(s)).length;
});

const historyTestsCount = computed(() => {
  return currentGroupSessions.value.filter((s) => isTestSession(s)).length;
});

const filteredGroupSessions = computed(() => {
  let list = currentGroupSessions.value;

  // 1. Filter by mode (all / lessons / tests)
  if (historyModeFilter.value === "lessons") {
    list = list.filter((s) => !isTestSession(s));
  } else if (historyModeFilter.value === "tests") {
    list = list.filter((s) => isTestSession(s));
  }

  // 2. Filter by month (all / YYYY-MM)
  if (historyMonthFilter.value !== "all") {
    list = list.filter((s) => {
      const d = new Date(s.createdAt || 0);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === historyMonthFilter.value;
    });
  }

  return list;
});

// AI Pedagogical Analysis & Trend Insights (Scoped to filtered view)
const groupAiAnalysis = computed(() => {
  const sessions = filteredGroupSessions.value;
  const students = currentGroupStudents.value;

  if (sessions.length === 0) {
    return {
      trendText: "Hozircha tanlangan davrda dars ma'lumotlari mavjud emas.",
      trendStatus: "neutral",
      trendDiff: 0,
      strongTopics: [],
      weakTopics: [],
      topPerformers: [],
      attentionStudents: [],
      aiSummary: `«${selectedGroupHubName.value}» guruhida ushbu davr bo'yicha darslar o'tkazilgach, sun'iy intellekt o'quv dinamikasi va har bir o'quvchining o'sish tendensiyasini avtomatik tahlil qiladi.`,
      advice: "Darslarda savol-javob o'tkazishni boshlang va test natijalarini kiritib boring.",
    };
  }

  // Calculate trend from recent vs older in this filtered period
  const recent = sessions.slice(0, Math.min(3, sessions.length));
  const older = sessions.slice(Math.min(3, sessions.length), Math.min(6, sessions.length));
  const recentAvg = recent.reduce((a, s) => a + s.avgPercent, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, s) => a + s.avgPercent, 0) / older.length : recentAvg;
  const diff = Math.round(recentAvg - olderAvg);

  let trendStatus = "neutral";
  let trendText = "Barqaror o'zlashtirish";
  if (diff > 3) {
    trendStatus = "positive";
    trendText = `+${diff}% O'sish tendensiyasi 🚀`;
  } else if (diff < -3) {
    trendStatus = "negative";
    trendText = `${diff}% Pasayish xavfi ⚠️`;
  }

  // Strong and Weak topics
  const topicMap: Record<string, { sum: number; count: number }> = {};
  sessions.forEach((s) => {
    const key = formatCleanTopicName(s.topic || (s.book ? `${s.book} darsi` : "Umumiy dars"));
    if (!topicMap[key]) topicMap[key] = { sum: 0, count: 0 };
    topicMap[key].sum += s.avgPercent;
    topicMap[key].count++;
  });
  const topicList = Object.entries(topicMap).map(([name, data]) => ({
    name,
    score: Math.round(data.sum / data.count),
  }));
  topicList.sort((a, b) => b.score - a.score);

  const strongTopics = topicList.filter((t) => t.score >= 70).slice(0, 2);
  const weakTopics = topicList.filter((t) => t.score < 65).slice(0, 2);

  // Top performers and needs attention
  const activeStudents = students.filter((s) => s.status !== "frozen");
  const sortedByAcc = [...activeStudents].sort((a, b) => (b.avgAccuracy || 0) - (a.avgAccuracy || 0));
  const topPerformers = sortedByAcc.filter((s) => (s.avgAccuracy || 0) >= 75).slice(0, 3);
  const attentionStudents = sortedByAcc.filter((s) => (s.avgAccuracy || 0) < 60);

  // Filtered average percent
  const filterAvgAcc = Math.round(
    sessions.reduce((acc, s) => acc + s.avgPercent, 0) / sessions.length
  );

  // Selected month label
  const monthObj = availableGroupMonths.value.find((m) => m.key === historyMonthFilter.value);
  const periodLabel = monthObj ? monthObj.label : "barcha davr";

  // AI Summary generation
  let summary = `«${selectedGroupHubName.value}» guruhining ${periodLabel} bo'yicha o'rtacha o'zlashtirish darajasi ${filterAvgAcc}% ni tashkil etadi (${sessions.length} ta mashg'ulot). `;
  if (diff > 0) {
    summary += `Davr davomida o'quvchilar faolligi oshgan va natijalar +${diff}% ga yaxshilangan. `;
  } else if (diff < 0) {
    summary += `Natijalarda biroz pasayish (${diff}%) kuzatilgan, asosiy e'tiborni qiyin mavzularni mustahkamlashga qaratish zarur. `;
  } else {
    summary += `O'quvchilar ko'rsatkichi barqaror holatda saqlanmoqda. `;
  }
  if (strongTopics.length > 0) {
    summary += `Eng yuqori o'zlashtirilgan mavzu: "${strongTopics[0].name}" (${strongTopics[0].score}%). `;
  }

  // Pedagogical advice
  let advice = "";
  if (weakTopics.length > 0) {
    advice = `"${weakTopics[0].name}" mavzusi bo'yicha tezkor blitz savol-javob yoki qisqa test o'tkazish orqali o'quvchilarning tushunmagan joylarini to'ldirish tavsiya etiladi.`;
  } else if (attentionStudents.length > 0) {
    advice = `${attentionStudents.map((s) => s.name).join(", ")} kabi o'quvchilarga individual yondashib, qo'shimcha rag'batlantiruvchi topshiriqlar berish foydali bo'ladi.`;
  } else {
    advice = `Guruh yuqori sur'atda ketmoqda! O'quvchilarni bellashuv rejimiga (Duel yoki Jamoalar jangi) jalb qilib, qiziqishni yanada oshirishingiz mumkin.`;
  }

  return {
    trendText,
    trendStatus,
    trendDiff: diff,
    strongTopics,
    weakTopics,
    topPerformers,
    attentionStudents,
    aiSummary: summary,
    advice,
  };
});

// Render Linegraph using Chart.js
function renderGroupHistoryChart() {
  if (!groupHistoryChartRef.value) return;
  // Sort strictly ascending by createdAt (oldest -> newest, left -> right)
  const sessions = [...filteredGroupSessions.value].sort(
    (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
  );

  if (sessions.length === 0) {
    if (groupHistoryChart) {
      groupHistoryChart.destroy();
      groupHistoryChart = null;
    }
    return;
  }

  const labels = sessions.map((s) => s.date);
  const data = sessions.map((s) => s.avgPercent);

  if (groupHistoryChart) {
    groupHistoryChart.destroy();
  }

  const ctx = groupHistoryChartRef.value.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 180);
  gradient.addColorStop(0, "rgba(20, 184, 166, 0.45)");
  gradient.addColorStop(1, "rgba(20, 184, 166, 0.0)");

  groupHistoryChart = new Chart(groupHistoryChartRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "O'rtacha Aniqlik (%)",
          data,
          borderColor: "#14b8a6",
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#0d9488",
          pointBorderWidth: 2,
          pointRadius: sessions.length > 40 ? 2 : 4,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(255, 255, 255, 0.06)" },
          ticks: { color: "#94a3b8", callback: (v) => `${v}%` },
        },
        x: {
          grid: { display: false },
          ticks: {
            color: "#94a3b8",
            maxTicksLimit: sessions.length > 30 ? 15 : undefined,
            autoSkip: true,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#5eead4",
          borderColor: "rgba(255, 255, 255, 0.15)",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const s = sessions[idx];
              return `${s.date} • ${s.topic || s.book || s.mode}`;
            },
            label: (item) => `O'rtacha natija: ${item.formattedValue}%`,
          },
        },
      },
    },
  });
}

watch(
  [activeGroupTab, historyModeFilter, historyMonthFilter, selectedGroupHubName, filteredGroupSessions],
  () => {
    if (activeGroupTab.value === "history") {
      nextTick(() => {
        renderGroupHistoryChart();
      });
    }
  }
);

function getManualTestScore(studentName: string) {
  if (!manualTestScores.value[studentName]) {
    manualTestScores.value[studentName] = { correct: 0, attStatus: "Keldi" };
  }
  return manualTestScores.value[studentName];
}

function updateManualTestScore(studentName: string, val: string) {
  const num = Math.max(0, Math.min(parseInt(val) || 0, manualTestMaxQ.value));
  getManualTestScore(studentName).correct = num;
}

function setManualTestAtt(studentName: string, status: string) {
  getManualTestScore(studentName).attStatus = status;
}

function calcManualTestPercent(studentName: string): number {
  const score = getManualTestScore(studentName);
  if (score.attStatus === "Sababsiz" || score.attStatus === "Sababli") return 0;
  if (!manualTestMaxQ.value || manualTestMaxQ.value <= 0) return 0;
  const clampedCorrect = Math.max(0, Math.min(Number(score.correct) || 0, manualTestMaxQ.value));
  return Math.min(100, Math.round((clampedCorrect / manualTestMaxQ.value) * 100));
}

function buildManualTestTelegramText(): string {
  const group = selectedGroupHubName.value;
  const normDate = normalizeDateToDDMM(manualTestDate.value);
  const effectiveBook = getSelectedBooksLabel();
  const title = manualTestTitle.value || "Mavzulashgan Test";
  const type = manualTestType.value || "Mavzulashgan";
  const maxQ = manualTestMaxQ.value;

  const present: { name: string; correct: number; percent: number; isGuest?: boolean; originGroup?: string }[] = [];
  const absent: string[] = [];
  const excused: string[] = [];

  testEntryStudents.value.forEach((s) => {
    const sc = getManualTestScore(s.name);
    const isGuest = (s.group || "").trim().toLowerCase() !== (group || "").trim().toLowerCase();
    const guestSuffix = isGuest ? ` [Mehmon: ${s.group || 'Boshqa guruh'}]` : "";

    if (sc.attStatus === "Sababsiz") {
      absent.push(`${s.name}${guestSuffix}`);
    } else if (sc.attStatus === "Sababli") {
      excused.push(`${s.name}${guestSuffix}`);
    } else {
      const p = calcManualTestPercent(s.name);
      const clamped = Math.max(0, Math.min(Number(sc.correct) || 0, maxQ));
      present.push({
        name: s.name,
        correct: clamped,
        percent: p,
        isGuest,
        originGroup: s.group,
      });
    }
  });

  present.sort((a, b) => b.percent - a.percent || b.correct - a.correct);

  const sumPercent = present.reduce((acc, p) => acc + p.percent, 0);
  const avgPercent = present.length > 0 ? Math.round(sumPercent / present.length) : 0;

  // AI Pedagogical Summary strictly based on present active attendees & addressed to parents
  let aiSummary = manualTestAiSummary.value.trim();
  if (!aiSummary) {
    if (present.length === 0) {
      aiSummary = "Hurmatli ota-onalar! Bugungi dars va test mashg'ulotida guruh o'quvchilari qatnashmadi.";
    } else if (avgPercent >= 85) {
      const topScorers = present.filter((p) => p.percent >= 85).map((p) => p.name).slice(0, 3).join(", ");
      aiSummary = `Hurmatli ota-onalar! Guruhimiz bugungi test bo'yicha o'rtacha <b>${avgPercent}%</b> yuqori ko'rsatkich qayd etdi. ${topScorers ? `Ayniqsa, <b>${topScorers}</b> mavzuni mustahkam o'zlashtirib, barchaga o'rnak bo'lishdi.` : ""} Barcha o'quvchilarimiz va sizlarni ushbu muvaffaqiyat bilan tabriklayman!`;
    } else if (avgPercent >= 70) {
      aiSummary = `Hurmatli ota-onalar! Guruhimiz bugungi testda o'rtacha <b>${avgPercent}%</b> barqaror natija ko'rsatdi. Asosiy test savollari muvaffaqiyatli topshirildi. O'quvchilar bilan xatolar ustida qo'shimcha ishlaymiz, uyda darslikni yana bir bor takrorlashlarini nazorat qilishingizni so'rayman.`;
    } else {
      const lowCount = present.filter((p) => p.percent < 60).length;
      aiSummary = `Hurmatli ota-onalar! Guruhimiz bugungi testda o'rtacha <b>${avgPercent}%</b> natija bilan diqqat talab holatda (${lowCount} nafar o'quvchi 60% dan past). O'quvchilarimiz tushkunlikka tushmasdan darslik bo'yicha mavzuni qayta mustahkamlashlari va mashg'ulotlarni qoldirmasliklari muhimdir.`;
    }
  }

  let msg = `📝 <b>«${group}» — ${title}</b>\n`;
  msg += `🏷️ Test turi: <b>${type}</b> | 📚 Darslik: <b>${effectiveBook}</b>\n`;
  msg += `🎯 Maks: <b>${maxQ} ta</b> | 📅 Sana: <b>${normDate}</b>\n\n`;

  present.forEach((p, idx) => {
    const num = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
    const guestLabel = p.isGuest ? ` <i>[Mehmon: ${p.originGroup}]</i>` : "";
    msg += `${num} <b>${p.name}</b>${guestLabel}: ${p.correct}/${maxQ} (${p.percent}%)\n`;
  });

  msg += `\n📅 <b>DAVOMAT:</b>\n`;
  msg += `✅ Qatnashdi: ${present.length} nafar\n`;
  if (absent.length > 0) msg += `❌ Kelmadi: ${absent.join(", ")}\n`;
  if (excused.length > 0) msg += `🟡 Sababli: ${excused.join(", ")}\n`;

  msg += `\n🧠 <b>Ustoz AI Xulosasi:</b>\n${aiSummary}\n`;
  msg += `\n🌐 <b>history-pro.uz</b>`;

  return msg.trim();
}

function buildTeacherAiParams(): TeacherAiSummaryInput {
  const group = selectedGroupHubName.value;
  const effectiveBook = getSelectedBooksLabel();
  const title = manualTestTitle.value || "Mavzulashgan Test";
  const type = manualTestType.value || "Mavzulashgan";
  const maxQ = manualTestMaxQ.value || 1;

  const present: { name: string; score: number; percent: number }[] = [];
  const absent: string[] = [];

  testEntryStudents.value.forEach((s) => {
    const sc = getManualTestScore(s.name);
    if (sc.attStatus === "Sababsiz") {
      absent.push(s.name);
    } else if (sc.attStatus === "Sababli") {
      // excused
    } else {
      const p = calcManualTestPercent(s.name);
      const clamped = Math.max(0, Math.min(Number(sc.correct) || 0, maxQ));
      present.push({ name: s.name, score: clamped, percent: p });
    }
  });

  present.sort((a, b) => b.percent - a.percent || b.score - a.score);
  const sumPercent = present.reduce((acc, p) => acc + p.percent, 0);
  const avgPercent = present.length > 0 ? Math.round(sumPercent / present.length) : 0;

  const topScorers = present.filter((p) => p.percent >= 85);
  const strugglingStudents = present.filter((p) => p.percent < 65);

  return {
    groupName: group,
    testTitle: title,
    testType: type,
    bookName: effectiveBook,
    maxQuestions: maxQ,
    totalPresent: present.length,
    totalAbsent: absent.length,
    averagePercent: avgPercent,
    topScorers,
    strugglingStudents,
    absentStudents: absent,
  };
}

async function handleGenerateAiSummary() {
  if (generatingAiSummary.value) return;
  generatingAiSummary.value = true;
  try {
    const params = buildTeacherAiParams();
    const result = await generateTeacherAiSummary(params);
    if (result) {
      manualTestAiSummary.value = result;
    }
  } catch (err: any) {
    console.error("Gemini AI xulosa olishda xatolik:", err);
  } finally {
    generatingAiSummary.value = false;
  }
}

async function copyManualTestTelegramText() {
  if (!manualTestAiSummary.value.trim() && testEntryStudents.value.length > 0) {
    await handleGenerateAiSummary();
  }
  const text = buildManualTestTelegramText();
  navigator.clipboard.writeText(text);
  alert("Test natijalari matni nusxalandi!");
}

async function submitManualTestResults() {
  if (!manualTestTitle.value.trim()) {
    alert("Iltimos, test mavzusini kiriting!");
    return;
  }
  if (!manualTestMaxQ.value || manualTestMaxQ.value <= 0) {
    alert("Iltimos, maksimal savollar sonini to'g'ri kiriting!");
    return;
  }

  sendingManualTestTg.value = true;
  manualTestSent.value = false;

  // If Ustoz AI summary not generated yet, generate via Gemini before compiling message
  if (!manualTestAiSummary.value.trim() && testEntryStudents.value.length > 0) {
    try {
      const params = buildTeacherAiParams();
      manualTestAiSummary.value = await generateTeacherAiSummary(params);
    } catch (e) {
      console.warn("Auto Gemini summary generation failed:", e);
    }
  }

  const msgText = buildManualTestTelegramText();
  const maxQ = manualTestMaxQ.value;
  const normDate = normalizeDateToDDMM(manualTestDate.value);
  const effectiveBook = getSelectedBooksLabel();
  const testType = manualTestType.value || "Mavzulashgan";

  try {
    // 1. Build session record and student updates FIRST to guarantee local & cloud persistence
    const sessionStudentResults: any[] = [];
    let sumPercent = 0;
    let presentCount = 0;

    testEntryStudents.value.forEach((s) => {
      const sc = getManualTestScore(s.name);
      const isPresent = sc.attStatus !== "Sababsiz" && sc.attStatus !== "Sababli";
      const clampedCorrect = Math.max(0, Math.min(Number(sc.correct) || 0, maxQ));
      const p = isPresent ? calcManualTestPercent(s.name) : 0;
      if (isPresent) {
        sumPercent += p;
        presentCount++;
      }

      const coinsEarned = p >= 80 ? 20 : 5;

      sessionStudentResults.push({
        name: s.name,
        correct: clampedCorrect,
        total: maxQ,
        percent: p,
        coin: isPresent ? coinsEarned : 0,
        coins: isPresent ? coinsEarned : 0,
        strike: 0,
        attStatus: sc.attStatus || "Keldi",
        group: s.group || selectedGroupHubName.value,
      });

      // Save attendance to localAttendanceLogs & cloud
      teacherStore.recordAttendanceLog(
        normDate,
        s.name,
        sc.attStatus || "Keldi",
        s.group || selectedGroupHubName.value,
        "Test davomati"
      );

      // Update in master registry and sync to master_students in Firebase
      const reg = teacherStore.allStudentsRegistry.value.find((item) => item.name === s.name);
      if (reg && isPresent) {
        reg.totalTests = (reg.totalTests || 0) + 1;
        reg.coins = (reg.coins || 0) + coinsEarned;
        const oldTotal = reg.totalTests > 1 ? reg.totalTests - 1 : 0;
        const oldSum = (reg.avgAccuracy || 0) * oldTotal;
        reg.avgAccuracy = Math.round((oldSum + p) / reg.totalTests);
        teacherStore.syncStudentToCloud(reg);
      }
    });

    // Commit registry to Vue reactivity and LocalStorage
    teacherStore.allStudentsRegistry.value = [...teacherStore.allStudentsRegistry.value];
    localStorage.setItem("ha_all_students", JSON.stringify(teacherStore.allStudentsRegistry.value));

    const sessionRecord: LessonSessionRecord = {
      id: "sess-test-" + Date.now(),
      date: normDate,
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      teacher: teacherStore.teacherName.value || "Ustoz",
      group: selectedGroupHubName.value,
      mode: testType,
      book: effectiveBook,
      topic: manualTestTitle.value,
      maxQuestions: maxQ,
      avgPercent: presentCount > 0 ? Math.round(sumPercent / presentCount) : 0,
      studentResults: sessionStudentResults,
      createdAt: Date.now(),
    };

    // Save session record locally and to Firebase lesson_sessions
    teacherStore.saveLessonSession(sessionRecord);

    // 2. Safely Send to Telegram Bot (Isolated try/catch so saving is never blocked!)
    let tgSentSuccess = false;
    try {
      tgSentSuccess = await sendTelegramMessage(msgText);
    } catch (tgErr) {
      console.warn("Telegram bot send error:", tgErr);
    }

    // 3. Save to Google Apps Script
    try {
      await callApi("save", {
        teacher: teacherStore.teacherName.value,
        mode: testType,
        students: sessionStudentResults.map((s) => ({
          name: s.name,
          correct: s.correct,
          total: s.total,
          percent: s.percent,
          coin: s.coins,
          strike: 0,
          attStatus: s.attStatus,
        })),
      });
    } catch (gasErr) {
      console.warn("GAS save error:", gasErr);
    }

    manualTestSent.value = true;
    extraTestStudents.value = []; // Reset guest list after saving
    manualTestAiSummary.value = ""; // Reset AI summary for next test

    const tgNotice = tgSentSuccess
      ? " va Telegram guruhga yuborildi ✅"
      : " (Telegram xabarnomada kechikish bo'ldi, ammo barcha natijalar bazaga saqlandi)";
    alert(`🎉 Test natijalari muvaffaqiyatli saqlandi${tgNotice}!`);
  } catch (e: any) {
    alert("Saqlashda kutilmagan xatolik yuz berdi: " + (e.message || e));
  } finally {
    sendingManualTestTg.value = false;
  }
}
</script>
