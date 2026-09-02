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

    <!-- 2. Groups Strip & Group-Level Freeze Control -->
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>📚</span> <span>Guruhlar & Guruhni Muzlatish Boshqaruvi</span>
        </h3>
        <span class="text-xs text-slate-500">{{ groupsList.length }} ta guruh mavjud</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <div
          v-for="grp in groupsList"
          :key="grp.name"
          class="flex items-center justify-between rounded-2xl border p-3 transition"
          :class="grp.isAllFrozen ? 'border-cyan-500/40 bg-cyan-950/30' : 'border-white/10 bg-black/40'"
        >
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <span class="font-black text-sm text-white">{{ grp.name }}</span>
              <span
                v-if="grp.isAllFrozen"
                class="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-1.5 py-0.5 text-[9px] font-black text-cyan-300"
              >
                ❄️ Muzlatilgan Guruh
              </span>
            </div>
            <div class="text-[11px] text-slate-400">
              {{ grp.count }} ta o'quvchi (Faol: {{ grp.activeCount }}, Muzlagan: {{ grp.frozenCount }})
            </div>
          </div>

          <!-- Group Toggle Freeze Button -->
          <button
            type="button"
            @click="toggleGroupFreeze(grp.name, !grp.isAllFrozen)"
            class="rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 shadow"
            :class="
              grp.isAllFrozen
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
            "
            :title="grp.isAllFrozen ? 'Guruhni qayta faollashtirish' : 'Guruhdagi barcha o\'quvchilarni muzlatish'"
          >
            {{ grp.isAllFrozen ? '☀️ Eritish' : '❄️ Muzlatish' }}
          </button>
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
      <div class="flex items-center justify-between">
        <div class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>O'quvchilar Ro'yxati ({{ filteredStudents.length }})</span>
          <span v-if="filteredStudents.length > 0" class="text-slate-500">•</span>
          <label v-if="filteredStudents.length > 0" class="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-400 hover:text-white">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="h-3.5 w-3.5 rounded accent-blue-600 cursor-pointer"
            />
            <span>Hammasini tanlash</span>
          </label>
        </div>

        <button
          v-if="hasSampleStudents"
          type="button"
          @click="clearSampleStudents"
          class="text-[11px] font-bold text-slate-400 hover:text-red-400 underline transition"
          title="Boshlang'ich namuna tariqasida kiritilgan test o'quvchilarni tozalash"
        >
          🧹 Namunaviy o'quvchilarni tozalash
        </button>
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
          v-for="st in filteredStudents"
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
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-md"
              :class="
                st.status === 'frozen'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-600/20'
              "
            >
              {{ st.status === 'frozen' ? '❄️' : st.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Details -->
            <div class="space-y-1 min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span class="font-extrabold text-white text-sm sm:text-base truncate">{{ st.name }}</span>

                <!-- Clickable Group Pill to Transfer Group -->
                <button
                  type="button"
                  @click="openTransferModal(st)"
                  class="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300 hover:bg-indigo-500/30 transition flex items-center gap-1 shrink-0"
                  title="Guruhni o'zgartirish"
                >
                  <span>📚 {{ st.group || 'Umumiy' }}</span>
                  <span class="text-[9px] opacity-70">🔄</span>
                </button>

                <span
                  class="rounded-lg px-2 py-0.5 text-[10px] font-black shrink-0"
                  :class="
                    st.status === 'frozen'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  "
                >
                  {{ st.status === 'frozen' ? '❄️ Muzlatilgan' : '🟢 Faol' }}
                </span>
              </div>

              <!-- Login & Password Display -->
              <div class="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span class="font-mono bg-black/50 px-2 py-0.5 rounded-md border border-white/10 text-slate-300 text-[11px]">
                  👤 {{ st.login || st.name.toLowerCase().replace(/\s+/g, '_') }}
                </span>
                <span class="font-mono bg-black/50 px-2 py-0.5 rounded-md border border-white/10 text-amber-300 text-[11px]">
                  🔑 {{ st.password || '1234' }}
                </span>
                <button
                  type="button"
                  @click="copyCredentials(st)"
                  class="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline shrink-0"
                  title="Kirish ma'lumotlarini nusxalash"
                >
                  📋 Nusxalash
                </button>
              </div>

              <!-- Phone & Parent Contacts -->
              <div v-if="st.phone || st.parentPhone" class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                <span v-if="st.phone">📞 {{ st.phone }}</span>
                <span v-if="st.parentPhone" class="text-slate-500">• Ota-ona: <b class="text-slate-300">{{ st.parentPhone }}</b> ({{ st.parentName || 'Vasiy' }})</span>
              </div>
            </div>
          </div>

          <!-- Middle & Right Sections (Always single-row flex-nowrap) -->
          <div class="flex flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-2.5 sm:gap-3 shrink-0">
            <!-- Performance Quick Pills -->
            <div class="flex items-center gap-1.5 shrink-0 text-xs">
              <div class="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-center min-w-[54px]">
                <div class="text-[9px] text-slate-400 font-bold uppercase">Aniqlik</div>
                <div class="font-black text-xs sm:text-sm text-emerald-400">{{ st.avgAccuracy || 0 }}%</div>
              </div>
              <div class="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-center min-w-[54px]">
                <div class="text-[9px] text-slate-400 font-bold uppercase">Tangalar</div>
                <div class="font-black text-xs sm:text-sm text-amber-400">🪙 {{ st.coins || 0 }}</div>
              </div>
              <div class="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5 text-center min-w-[54px]">
                <div class="text-[9px] text-slate-400 font-bold uppercase">Striklar</div>
                <div class="font-black text-xs sm:text-sm text-yellow-400">⭐ {{ st.strikes || 0 }}</div>
              </div>
            </div>

            <!-- CRM Action Buttons (Locked in single row flex-nowrap) -->
            <div class="flex items-center gap-1 shrink-0 flex-nowrap">
              <!-- 1. Deep Stats -->
              <button
                type="button"
                @click="openStudentDetail(st)"
                class="flex items-center gap-1 rounded-xl bg-blue-600/20 border border-blue-500/30 px-2.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-600/30 active:scale-95 transition shrink-0"
                title="Individual Statistika"
              >
                <span>📊</span> <span class="hidden sm:inline">Statistika</span>
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
      </div>
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
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Guruhi *</label>
            <input
              v-model="formStudent.group"
              type="text"
              required
              placeholder="Masalan: 7-A Guruh"
              list="existing-groups-list"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <datalist id="existing-groups-list">
              <option v-for="g in groupsList" :key="g.name" :value="g.name" />
            </datalist>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Holati</label>
            <select
              v-model="formStudent.status"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-xs text-white outline-none focus:border-blue-500"
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
              <label class="block text-[10px] text-slate-400 mb-1">Login</label>
              <input
                v-model="formStudent.login"
                type="text"
                placeholder="ali_valiyev"
                class="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-[10px] text-slate-400 mb-1">Parol / PIN</label>
              <input
                v-model="formStudent.password"
                type="text"
                placeholder="1234"
                class="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 font-mono text-xs text-amber-300 outline-none focus:border-indigo-500"
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

        <!-- Target Group Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-300">Yangi guruhni tanlang yoki kiriting *</label>
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
            class="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 active:scale-95 disabled:opacity-40 transition"
          >
            Guruhni o'zgartirish 🚀
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- ======================================================== -->
    <!-- MODAL 3: STUDENT DEEP-DIVE ANALYTICS MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showDetailModal"
      :title="selectedStudent ? `📊 ${selectedStudent.name} — Shaxsiy Dosyesi` : 'Statistika'"
    >
      <div v-if="selectedStudent" class="py-2 space-y-4">
        <!-- Profile Header -->
        <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl text-white shadow-lg">
              🎓
            </div>
            <div>
              <h4 class="text-base font-black text-white">{{ selectedStudent.name }}</h4>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span>📚 {{ selectedStudent.group || 'Umumiy' }}</span>
                <span>•</span>
                <span :class="selectedStudent.status === 'frozen' ? 'text-cyan-400 font-bold' : 'text-emerald-400 font-bold'">
                  {{ selectedStudent.status === 'frozen' ? '❄️ Muzlatilgan' : '🟢 Faol O\'quvchi' }}
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400 font-bold">Tangalar</div>
            <div class="text-lg font-black text-amber-400">🪙 {{ selectedStudent.coins || 0 }}</div>
          </div>
        </div>

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

        <!-- Attendance Stats -->
        <div class="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
          <div class="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>📅 Davomat Ko'rsatkichlari</span>
            <span class="text-white font-bold">
              {{ (selectedStudent.attendanceStats?.present || 0) + (selectedStudent.attendanceStats?.excused || 0) + (selectedStudent.attendanceStats?.unexcused || 0) }} jami dars
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-1">
            <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-center">
              <div class="text-xs font-black text-emerald-400">✅ {{ selectedStudent.attendanceStats?.present || 0 }}</div>
              <div class="text-[10px] text-slate-400">Qatnashdi</div>
            </div>
            <div class="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-center">
              <div class="text-xs font-black text-amber-400">🟡 {{ selectedStudent.attendanceStats?.excused || 0 }}</div>
              <div class="text-[10px] text-slate-400">Sababli</div>
            </div>
            <div class="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-center">
              <div class="text-xs font-black text-red-400">❌ {{ selectedStudent.attendanceStats?.unexcused || 0 }}</div>
              <div class="text-[10px] text-slate-400">Sababsiz</div>
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
              <span class="text-[10px] text-slate-400 block font-sans">Login:</span>
              <span class="text-white font-bold">{{ selectedStudent.login || selectedStudent.name.toLowerCase().replace(/\s+/g, '_') }}</span>
            </div>
            <div class="bg-black/50 p-2.5 rounded-xl border border-white/10">
              <span class="text-[10px] text-slate-400 block font-sans">Parol:</span>
              <span class="text-amber-300 font-bold">{{ selectedStudent.password || '1234' }}</span>
            </div>
          </div>
        </div>

        <!-- Teacher Notes -->
        <div v-if="selectedStudent.notes" class="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1">
          <div class="text-xs font-bold text-slate-300">📝 O'qituvchi eslatmasi:</div>
          <p class="text-xs text-slate-400 italic">{{ selectedStudent.notes }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTeacherStore, Student, TeacherReminder } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import BaseModal from "../common/BaseModal.vue";

const emit = defineEmits<{
  (e: "back"): void;
  (e: "nav", view: string): void;
}>();

const teacherStore = useTeacherStore();

// Search & Filter & Selection
const searchQuery = ref("");
const selectedGroupFilter = ref("");
const statusFilter = ref<"all" | "active" | "frozen">("all");
const syncingDb = ref(false);
const selectedStudentNames = ref<string[]>([]);

// Modals State
const showAddEditModal = ref(false);
const editingStudent = ref(false);
const showDetailModal = ref(false);
const selectedStudent = ref<Student | null>(null);

// Transfer Group Modal State
const showTransferModal = ref(false);
const transferTargetStudent = ref<Student | null>(null);
const isBatchTransfer = ref(false);
const transferNewGroupName = ref("");

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
  password: "",
  notes: "",
});

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

const hasSampleStudents = computed(() => {
  return teacherStore.allStudentsRegistry.value.some(
    (s) => sampleStudentNames.has(s.name) || s.id?.startsWith("std-")
  );
});

// Group summary list
const groupsList = computed(() => {
  const map: Record<
    string,
    { name: string; count: number; activeCount: number; frozenCount: number; isAllFrozen: boolean }
  > = {};

  teacherStore.allStudentsRegistry.value.forEach((s) => {
    const g = s.group || "Umumiy";
    if (!map[g]) {
      map[g] = { name: g, count: 0, activeCount: 0, frozenCount: 0, isAllFrozen: true };
    }
    map[g].count++;
    if (s.status === "frozen") {
      map[g].frozenCount++;
    } else {
      map[g].activeCount++;
      map[g].isAllFrozen = false;
    }
  });

  return Object.values(map);
});

// Filtered Students list
const filteredStudents = computed(() => {
  let list = teacherStore.allStudentsRegistry.value;

  if (selectedGroupFilter.value) {
    list = list.filter((s) => s.group === selectedGroupFilter.value);
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
        (s.phone && s.phone.toLowerCase().includes(query)) ||
        (s.login && s.login.toLowerCase().includes(query)) ||
        (s.parentPhone && s.parentPhone.toLowerCase().includes(query))
    );
  }

  return list;
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

  if (isBatchTransfer.value) {
    teacherStore.transferMultipleStudentsGroup(selectedStudentNames.value, newGroup);
    selectedStudentNames.value = [];
  } else if (transferTargetStudent.value) {
    teacherStore.transferStudentGroup(transferTargetStudent.value.name, newGroup);
  }

  showTransferModal.value = false;
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
            teacherStore.saveStudent({
              id: "db-" + Math.random().toString(36).substring(2, 9),
              name: trimmed,
              group: groupName,
              status: "active",
              login: trimmed.toLowerCase().replace(/\s+/g, "_"),
              password: "PIN" + Math.floor(1000 + Math.random() * 9000),
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
          } else if (!exists.group || exists.group === "Umumiy") {
            exists.group = groupName;
          }
        });
      }
      alert(`Baza bilan muvaffaqiyatli sinxronlandi! ${countAdded > 0 ? countAdded + " ta yangi o'quvchi qo'shildi." : "Barcha o'quvchilar yangilandi."}`);
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
  if (confirm("Namunaviy o'quvchilar ro'yxatdan o'chirilsinmi? (Haqiqiy bazadan yuklangan o'quvchilar saqlanib qoladi)")) {
    teacherStore.allStudentsRegistry.value = teacherStore.allStudentsRegistry.value.filter(
      (s) => !sampleStudentNames.has(s.name) && !s.id?.startsWith("std-")
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

// --- Student CRUD Actions ---
function openAddModal() {
  editingStudent.value = false;
  formStudent.value = {
    id: "usr-" + Date.now(),
    name: "",
    group: selectedGroupFilter.value || (groupsList.value[0]?.name || ""),
    status: "active",
    phone: "",
    parentName: "",
    parentPhone: "",
    parentTg: "",
    login: "",
    password: "PIN" + Math.floor(1000 + Math.random() * 9000),
    notes: "",
  };
  showAddEditModal.value = true;
}

function openEditModal(student: Student) {
  editingStudent.value = true;
  formStudent.value = { ...student };
  showAddEditModal.value = true;
}

function generateCredentials() {
  const base = formStudent.value.name?.trim().toLowerCase().replace(/\s+/g, "_") || "student";
  formStudent.value.login = base + (Math.floor(10 + Math.random() * 90));
  formStudent.value.password = "PIN" + Math.floor(1000 + Math.random() * 9000);
}

function saveStudentData() {
  if (!formStudent.value.name?.trim()) return;
  teacherStore.saveStudent(formStudent.value as any);
  showAddEditModal.value = false;
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
  showDetailModal.value = true;
}

function copyCredentials(student: Student) {
  const login = student.login || student.name.toLowerCase().replace(/\s+/g, "_");
  const pass = student.password || "1234";
  const url = window.location.origin;

  const text = `🎓 Hurmatli ${student.name}!\nSizning "History Arena Pro" portaliga kirish ma'lumotlaringiz:\n🌐 Sayt: ${url}\n👤 Login: ${login}\n🔑 Parol: ${pass}\n\nDarslarda faol ishtirok eting! 🚀`;

  navigator.clipboard.writeText(text);
  alert("Kirish ma'lumotlari nusxalandi! O'quvchi yoki ota-onasiga yuborishingiz mumkin.");
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
</script>
