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

        <!-- Group Status Filter Tabs -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
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
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm shadow-md"
              :class="
                st.status === 'frozen'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
              "
            >
              {{ st.status === 'frozen' ? '❄️' : st.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Info text -->
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-black text-sm sm:text-base text-white truncate">{{ st.name }}</span>
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
                <span class="rounded-lg bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {{ st.group || 'Guruhsiz' }}
                </span>
              </div>

              <!-- 6-digit PIN & Pattern bar -->
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

                <span v-if="st.phone" class="text-slate-400 text-[11px] font-sans">
                  📞 {{ st.phone }}
                </span>
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

    <!-- ======================================================== -->
    <!-- MODAL 7: DEDICATED GROUP CRM HUB MODAL -->
    <!-- ======================================================== -->
    <BaseModal
      v-model="showGroupHubModal"
      :title="`📚 «${selectedGroupHubName}» Guruhi Boshqaruv Markazi`"
      custom-class="max-w-5xl sm:max-w-6xl w-full"
    >
      <div v-if="selectedGroupHubName" class="space-y-4 py-1">
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
                <div class="font-extrabold text-sm text-white truncate">{{ st.name }}</div>
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
                    <td class="px-3 py-2.5 text-left font-bold text-white">{{ st.name }}</td>
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
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow"
                  :class="st.status === 'frozen' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-indigo-600 text-white'"
                >
                  {{ st.status === 'frozen' ? '❄️' : st.name.charAt(0).toUpperCase() }}
                </div>
                <div class="space-y-0.5">
                  <div class="font-bold text-white text-sm">{{ st.name }}</div>
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

              <!-- Book / Darslik -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">📚 Kitob / Darslik:</label>
                <select
                  v-model="manualTestBook"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="">Umumiy darslik</option>
                  <option v-for="b in BOOK_LIST" :key="b" :value="b">{{ b }}</option>
                  <option value="Boshqa">Boshqa manba</option>
                </select>
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

              <!-- Test Turi -->
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">🏷️ Test Turi:</label>
                <select
                  v-model="manualTestType"
                  class="w-full rounded-2xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-bold text-amber-300 outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Mavzulashtirilgan Test">Mavzulashtirilgan Test</option>
                  <option value="Blok / Katta Test">Blok / Katta Test</option>
                  <option value="Nazorat Ishi">Nazorat Ishi</option>
                  <option value="DTM / Attestatsiya Simulyatsiyasi">DTM / Attestatsiya</option>
                  <option value="Haftalik Imtihon">Haftalik Imtihon</option>
                  <option value="Oylik Imtihon">Oylik Imtihon</option>
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
            <div class="flex items-center justify-between">
              <h5 class="text-xs font-black text-slate-300">O'quvchilarning to'g'ri javoblari soni (ballari):</h5>
              <span class="text-[11px] text-slate-500">Maksimal: {{ manualTestMaxQ }} ta</span>
            </div>

            <div class="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="st in currentGroupStudents"
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
                <!-- Student Name & Status -->
                <div class="space-y-0.5 min-w-[160px]">
                  <div class="font-bold text-white text-sm">{{ st.name }}</div>
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

      <template #footer>
        <button
          type="button"
          @click="showGroupHubModal = false"
          class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Yopish
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { Chart, registerables } from "chart.js";
import { useTeacherStore, Student, TeacherReminder, GroupMeta, GroupReminder, BOOK_LIST, LessonSessionRecord } from "../../composables/useTeacherStore";
import { callApi } from "../../services/api";
import BaseModal from "../common/BaseModal.vue";

Chart.register(...registerables);

const emit = defineEmits<{
  (e: "back"): void;
  (e: "nav", view: string): void;
}>();

const teacherStore = useTeacherStore();

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
  pin: "",
  password: "",
  pattern: "",
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

  teacherStore.allStudentsRegistry.value.forEach((s) => {
    const g = s.group || "Umumiy";
    if (!map[g]) {
      const meta = teacherStore.getGroupMeta(g);
      map[g] = {
        name: g,
        count: 0,
        activeCount: 0,
        frozenCount: 0,
        isAllFrozen: true,
        totalAccuracy: 0,
        avgAccuracy: 0,
        days: meta.days || ["Du", "Chor", "Juma"],
        time: meta.time || "14:00 - 15:30",
        room: meta.room || "",
        subject: meta.subject || "Tarix",
        note: meta.note || "",
      };
    }
    map[g].count++;
    if (s.status === "frozen") {
      map[g].frozenCount++;
    } else {
      map[g].activeCount++;
      map[g].isAllFrozen = false;
      map[g].totalAccuracy += s.avgAccuracy || 0;
    }
  });

  const list = Object.values(map);
  list.forEach((g) => {
    g.avgAccuracy = g.activeCount > 0 ? Math.round(g.totalAccuracy / g.activeCount) : 0;
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
    (s) => (s.group || "Umumiy") === selectedGroupHubName.value
  );
});

const currentGroupActiveCount = computed(() => {
  return currentGroupStudents.value.filter((s) => s.status !== "frozen").length;
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
  if (currentGroupStudents.value.length === 0) return false;
  return currentGroupStudents.value.every((s) => s.status === "frozen");
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
    const [resHist, resLb] = await Promise.all([
      callApi("get_history", {}, { forceRefresh: force }),
      callApi("get_leaderboard", {}, { forceRefresh: force }),
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

    const lbByName: Record<string, any> = {};
    if (resLb.status === "success" && resLb.leaderboard) {
      resLb.leaderboard.forEach((lb: any) => {
        if (!lb.name) return;
        lbByName[lb.name.trim().toLowerCase()] = lb;
      });
    }

    // Update all students in master registry
    teacherStore.allStudentsRegistry.value.forEach((s) => {
      const key = s.name.trim().toLowerCase();
      const histList = historyByName[key] || [];
      const lb = lbByName[key];

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
    });
  } catch (e) {
    console.warn("refreshStudentStats error:", e);
  }
}

onMounted(() => {
  refreshStudentStats();
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
            if (!exists.group || exists.group === "Umumiy") {
              exists.group = groupName;
            }
            if (!exists.pin || !/^\d{6}$/.test(exists.pin)) {
              const defPin = teacherStore.generateUnique6DigitPin(trimmed);
              exists.pin = defPin;
              exists.password = defPin;
            }
          }
        });
      }
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
  const pin = teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value);
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
    pin: pin,
    password: pin,
    pattern: "",
    notes: "",
  };
  showAddEditModal.value = true;
}

function openEditModal(student: Student) {
  editingStudent.value = true;
  formStudent.value = {
    ...student,
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
  if (!formStudent.value.name?.trim()) return;
  if (!formStudent.value.pin) {
    formStudent.value.pin = teacherStore.generateUnique6DigitPin(teacherStore.allStudentsRegistry.value);
    formStudent.value.password = formStudent.value.pin;
  }
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
  showGroupHubModal.value = true;
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
    (s) => (s.group || "Umumiy") === groupName && s.status !== "frozen"
  );
  if (students.length === 0) {
    alert("Ushbu guruhda faol o'quvchilar yo'q!");
    return;
  }
  teacherStore.students.value = [];
  teacherStore.addFromDb(students.map((s) => s.name), "standard");
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
const manualTestBook = ref("");
const manualTestTitle = ref("Mavzulashtirilgan Test");
const manualTestType = ref("Mavzulashtirilgan Test");
const manualTestMaxQ = ref(30);
const manualTestScores = ref<Record<string, { correct: number; attStatus: string }>>({});
const sendingManualTestTg = ref(false);
const manualTestSent = ref(false);

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

const historyLessonsCount = computed(() => {
  return currentGroupSessions.value.filter(
    (s) => !s.mode?.includes("Test") && s.mode !== "manual_test"
  ).length;
});

const historyTestsCount = computed(() => {
  return currentGroupSessions.value.filter(
    (s) => s.mode?.includes("Test") || s.mode === "manual_test"
  ).length;
});

const filteredGroupSessions = computed(() => {
  let list = currentGroupSessions.value;

  // 1. Filter by mode (all / lessons / tests)
  if (historyModeFilter.value === "lessons") {
    list = list.filter((s) => !s.mode?.includes("Test") && s.mode !== "manual_test");
  } else if (historyModeFilter.value === "tests") {
    list = list.filter((s) => s.mode?.includes("Test") || s.mode === "manual_test");
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

function calcManualTestPercent(studentName: string) {
  const score = getManualTestScore(studentName);
  if (score.attStatus === "Sababsiz" || score.attStatus === "Sababli") return 0;
  if (!manualTestMaxQ.value || manualTestMaxQ.value <= 0) return 0;
  return Math.round((score.correct / manualTestMaxQ.value) * 100);
}

function buildManualTestTelegramText(): string {
  const group = selectedGroupHubName.value;
  const date = manualTestDate.value;
  const book = manualTestBook.value ? `📚 Kitob: ${manualTestBook.value}\n` : "";
  const title = manualTestTitle.value || "Test Natijasi";
  const type = manualTestType.value || "Mavzulashtirilgan Test";
  const maxQ = manualTestMaxQ.value;

  const present: { name: string; correct: number; percent: number }[] = [];
  const absent: string[] = [];
  const excused: string[] = [];

  currentGroupStudents.value.forEach((s) => {
    const sc = getManualTestScore(s.name);
    if (sc.attStatus === "Sababsiz") {
      absent.push(s.name);
    } else if (sc.attStatus === "Sababli") {
      excused.push(s.name);
    } else {
      const p = calcManualTestPercent(s.name);
      present.push({ name: s.name, correct: sc.correct, percent: p });
    }
  });

  present.sort((a, b) => b.percent - a.percent || b.correct - a.correct);

  let msg = `📝 <b>«${group.toUpperCase()}» GURUHI — ${type.toUpperCase()} NATIJALARI</b>\n`;
  msg += `📅 Sana: ${date}\n`;
  if (book) msg += `${book}`;
  msg += `📖 Mavzu: ${title}\n`;
  msg += `🎯 Maksimal ball: ${maxQ} ta savol\n`;
  msg += `👨‍🏫 Ustoz: ${teacherStore.teacherName.value || "Tarix o'qituvchisi"}\n\n`;
  msg += `🏆 <b>O'QUVCHILAR REYTINGI:</b>\n`;

  present.forEach((p, idx) => {
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;
    const stars = p.percent >= 90 ? "⭐⭐⭐" : p.percent >= 75 ? "⭐⭐" : p.percent >= 50 ? "⭐" : "";
    msg += `${medal} 👤 <b>${p.name}</b> — ${p.correct}/${maxQ} (${p.percent}%) ${stars}\n`;
  });

  if (absent.length > 0 || excused.length > 0) {
    msg += `\n📅 <b>DAVOMAT:</b>\n`;
    if (absent.length > 0) msg += `❌ Kelmadi: ${absent.join(", ")}\n`;
    if (excused.length > 0) msg += `🟡 Sababli: ${excused.join(", ")}\n`;
  }

  msg += `\nBarcha o'quvchilarga keyingi darslarda muvaffaqiyat tilaymiz! 🚀`;
  return msg;
}

function copyManualTestTelegramText() {
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

  const BOT_TOKEN = "7686180552:AAE1qOcFbuoPypIT_SD5T44YUg1R0YnQ8ug";
  const ADMIN_CHAT_ID = "-1003235272020";
  const msgText = buildManualTestTelegramText();

  try {
    // 1. Send to Telegram bot
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: msgText,
        parse_mode: "HTML",
      }),
    });

    // 2. Build session record and student updates
    const sessionStudentResults: any[] = [];
    let sumPercent = 0;
    let presentCount = 0;

    currentGroupStudents.value.forEach((s) => {
      const sc = getManualTestScore(s.name);
      const isPresent = sc.attStatus !== "Sababsiz" && sc.attStatus !== "Sababli";
      const p = isPresent ? calcManualTestPercent(s.name) : 0;
      if (isPresent) {
        sumPercent += p;
        presentCount++;
      }

      const coinsEarned = p >= 80 ? 20 : 5;

      sessionStudentResults.push({
        name: s.name,
        correct: sc.correct,
        total: manualTestMaxQ.value,
        percent: p,
        coins: isPresent ? coinsEarned : 0,
        attStatus: sc.attStatus || "Keldi",
      });

      // Update in master registry
      const reg = teacherStore.allStudentsRegistry.value.find((item) => item.name === s.name);
      if (reg && isPresent) {
        reg.totalTests = (reg.totalTests || 0) + 1;
        reg.coins = (reg.coins || 0) + coinsEarned;
        // Recalculate avgAccuracy
        const oldTotal = reg.totalTests > 1 ? reg.totalTests - 1 : 0;
        const oldSum = (reg.avgAccuracy || 0) * oldTotal;
        reg.avgAccuracy = Math.round((oldSum + p) / reg.totalTests);
      }
    });

    const sessionRecord: LessonSessionRecord = {
      id: "sess-test-" + Date.now(),
      date: manualTestDate.value,
      time: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      teacher: teacherStore.teacherName.value || "Ustoz",
      group: selectedGroupHubName.value,
      mode: manualTestType.value || "Yozma Test",
      book: manualTestBook.value || "",
      topic: manualTestTitle.value,
      maxQuestions: manualTestMaxQ.value,
      avgPercent: presentCount > 0 ? Math.round(sumPercent / presentCount) : 0,
      studentResults: sessionStudentResults,
      createdAt: Date.now(),
    };

    teacherStore.saveLessonSession(sessionRecord);

    // 3. Save to Google Apps Script
    await callApi("save", {
      text: msgText,
      teacher: teacherStore.teacherName.value,
      mode: "manual_test",
      students: currentGroupStudents.value,
    });

    manualTestSent.value = true;
    alert("Test natijalari muvaffaqiyatli saqlandi va Telegram guruhga yuborildi!");
  } catch (e: any) {
    alert("Saqlashda xatolik yuz berdi: " + (e.message || e));
  } finally {
    sendingManualTestTg.value = false;
  }
}
</script>
