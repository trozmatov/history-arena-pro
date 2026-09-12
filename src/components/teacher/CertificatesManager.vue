<template>
  <div class="space-y-5 max-w-7xl mx-auto pb-12">
    <!-- Header Section -->
    <div class="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-black text-blue-400">
            <span>🏆</span> <span>Natijalar & Sertifikatlar Admin Paneli</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            O'quvchilar Yutuqlari va Sertifikatlari
          </h2>
          <p class="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Saytning ommaviy <span class="font-mono text-cyan-400">history-pro.uz/results</span> sahifasida ko'rinadigan sertifikatlar, ballar va OTMga kirish natijalarini boshqaring.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            @click="openPublicResults"
            class="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-black text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition flex items-center gap-2 shadow-lg shadow-cyan-500/10"
            title="Ommaviy natijalar sahifasini ochish"
          >
            <span>🌐</span> <span>Vitrinani ko'rish (/results)</span>
          </button>

          <button
            type="button"
            @click="openAddModal"
            class="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-purple-500 active:scale-95 transition flex items-center gap-2"
          >
            <span>+</span> <span>Yangi Natija Qo'shish</span>
          </button>

          <button
            type="button"
            @click="$emit('back')"
            class="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 active:scale-95 transition"
          >
            Ortga ↩️
          </button>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-5 border-t border-white/10">
        <div class="glass-card rounded-2xl p-3 text-center border-white/5">
          <div class="text-[10px] uppercase font-bold text-slate-400">Jami Sertifikatlar</div>
          <div class="text-xl sm:text-2xl font-black text-white mt-0.5 tabular-nums">{{ allResults.length }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center border-white/5">
          <div class="text-[10px] uppercase font-bold text-slate-400">Davlat Granti & A+</div>
          <div class="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 tabular-nums">{{ grantAndTopCount }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center border-white/5">
          <div class="text-[10px] uppercase font-bold text-slate-400">PDF Biriktirilgan</div>
          <div class="text-xl sm:text-2xl font-black text-purple-400 mt-0.5 tabular-nums">{{ pdfAttachedCount }}</div>
        </div>
        <div class="glass-card rounded-2xl p-3 text-center border-white/5">
          <div class="text-[10px] uppercase font-bold text-slate-400">Asosiy Vitrinada (Featured)</div>
          <div class="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 tabular-nums">{{ featuredCount }}</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="glass-panel rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Ism yoki OTM bo'yicha qidirish..."
          class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Filters: Year & Category -->
      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
        <!-- Year Filter -->
        <select
          v-model="filterYear"
          class="rounded-2xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Barcha yillar</option>
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}-yil</option>
        </select>

        <!-- Certificate Type Filter -->
        <select
          v-model="filterType"
          class="rounded-2xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Barcha sertifikat turlari</option>
          <option value="Milliy Sertifikat">Milliy Sertifikat</option>
          <option value="DTM Davlat Granti">DTM Davlat Granti</option>
          <option value="Respublika Olimpiadasi">Respublika Olimpiadasi</option>
          <option value="Xalqaro Sertifikat">Xalqaro Sertifikat</option>
        </select>

        <!-- Study Format Filter (Online/Offline) -->
        <select
          v-model="filterFormat"
          class="rounded-2xl border border-white/15 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Barcha ta'lim shakli</option>
          <option value="offline">🏛️ Oflayn ta'lim</option>
          <option value="online">🌐 Onlayn ta'lim</option>
        </select>

        <!-- View Mode: Cards / Table -->
        <div class="flex rounded-2xl bg-black/50 p-1 border border-white/10 text-xs">
          <button
            type="button"
            @click="viewMode = 'grid'"
            class="rounded-xl px-3 py-1.5 font-bold transition"
            :class="viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            title="Kartochka ko'rinishi"
          >
            Grid
          </button>
          <button
            type="button"
            @click="viewMode = 'table'"
            class="rounded-xl px-3 py-1.5 font-bold transition"
            :class="viewMode === 'table' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            title="Jadval ko'rinishi"
          >
            Jadval
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredResults.length === 0"
      class="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3"
    >
      <div class="text-4xl">📜</div>
      <h3 class="text-base font-bold text-white">Hech qanday natija topilmadi</h3>
      <p class="text-xs text-slate-400 max-w-md mx-auto">
        Qidiruv shartlarini o'zgartiring yoki o'quvchilar natijalarini kiritish uchun yuqoridagi tugmani bosing.
      </p>
      <button
        type="button"
        @click="openAddModal"
        class="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition"
      >
        <span>+</span> <span>Birinchi natijani qo'shish</span>
      </button>
    </div>

    <!-- 1. GRID VIEW -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredResults"
        :key="item.id"
        class="glass-card rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 transition duration-300 group"
      >
        <!-- Certificate Image Preview -->
        <div class="relative w-full h-52 bg-slate-950 overflow-hidden cursor-pointer" @click="previewImage(item)">
          <img
            :src="item.certificateImage"
            :alt="item.studentName"
            class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

          <!-- Featured Badge -->
          <div v-if="item.isFeatured" class="absolute top-3 left-3">
            <span class="rounded-xl bg-amber-500 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-md flex items-center gap-1">
              <span>⭐</span> <span>Top Vitrina</span>
            </span>
          </div>

          <!-- PDF Badge -->
          <div v-if="item.pdfUrl" class="absolute top-3 right-3">
            <span class="rounded-xl bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1 border border-purple-400/30">
              <span>📄</span> <span>PDF Bor</span>
            </span>
          </div>

          <!-- Score Pill -->
          <div v-if="item.score" class="absolute bottom-3 right-3">
            <span class="rounded-xl bg-emerald-500 px-2.5 py-1 text-xs font-black text-slate-950 shadow-md">
              {{ item.score }}
            </span>
          </div>

          <!-- Year Pill -->
          <div class="absolute bottom-3 left-3">
            <span class="rounded-xl bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-300">
              📅 {{ item.year }}
            </span>
          </div>
        </div>

        <!-- Info Body -->
        <div class="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
          <div class="space-y-1.5">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-black text-white group-hover:text-cyan-300 transition">
                  {{ item.studentName }}
                </h3>
                <div class="flex flex-wrap items-center gap-1.5 mt-1">
                  <!-- Study format badge -->
                  <span
                    class="rounded-md px-2 py-0.5 text-[10px] font-black border inline-flex items-center gap-1"
                    :class="
                      item.studyFormat === 'online'
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    "
                  >
                    {{ item.studyFormat === 'online' ? '🌐 Onlayn' : '🏛️ Oflayn' }}
                  </span>
                  <span
                    v-if="item.badgeText"
                    class="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[10px] font-black text-indigo-300"
                  >
                    {{ item.badgeText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Target University / Direction -->
            <p v-if="item.targetUniversity" class="text-xs text-cyan-300/90 font-semibold flex items-center gap-1.5">
              <span>🏛️</span> <span>{{ item.targetUniversity }}</span>
            </p>

            <!-- Certificate Type -->
            <div class="flex items-center gap-2 text-[11px] text-slate-400">
              <span>📜 {{ item.certificateType || 'Sertifikat' }}</span>
              <span v-if="item.examDate">• {{ item.examDate }}</span>
            </div>

            <!-- Teacher Note Preview -->
            <p v-if="item.teacherNote" class="text-xs text-slate-400 italic line-clamp-2 pt-1 border-t border-white/5">
              "{{ item.teacherNote }}"
            </p>
          </div>

          <!-- Actions Bar -->
          <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <!-- Toggle Featured -->
            <button
              type="button"
              @click="toggleFeatured(item)"
              class="rounded-xl px-2.5 py-1 text-[11px] font-bold border transition flex items-center gap-1"
              :class="
                item.isFeatured
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              "
              title="Vitrinada birinchi ko'rsatish"
            >
              <span>{{ item.isFeatured ? '⭐ Tanlangan' : '☆ Oddiy' }}</span>
            </button>

            <!-- Action buttons -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="previewImage(item)"
                class="rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 text-xs hover:bg-cyan-500/30 transition"
                title="Ko'rish"
              >
                👁️
              </button>
              <button
                type="button"
                @click="openEditModal(item)"
                class="rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 px-2.5 py-1 text-xs hover:bg-blue-500/30 transition"
                title="Tahrirlash"
              >
                ✏️
              </button>
              <button
                type="button"
                @click="handleDelete(item)"
                class="rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 px-2.5 py-1 text-xs hover:bg-red-500/30 transition"
                title="O'chirish"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TABLE VIEW -->
    <div v-else class="glass-panel rounded-3xl overflow-hidden border border-white/10">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-white/10 bg-black/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th class="p-3.5">Rasm</th>
              <th class="p-3.5">O'quvchi</th>
              <th class="p-3.5 text-center">Ta'lim</th>
              <th class="p-3.5">Ball / Natija</th>
              <th class="p-3.5">OTM / Yo'nalish</th>
              <th class="p-3.5">Turi & Yil</th>
              <th class="p-3.5 text-center">PDF</th>
              <th class="p-3.5 text-center">Vitrina</th>
              <th class="p-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr
              v-for="item in filteredResults"
              :key="item.id"
              class="hover:bg-white/5 transition"
            >
              <td class="p-3.5">
                <div
                  class="h-12 w-16 rounded-xl bg-slate-950 border border-white/15 overflow-hidden cursor-pointer"
                  @click="previewImage(item)"
                >
                  <img :src="item.certificateImage" :alt="item.studentName" class="h-full w-full object-cover" />
                </div>
              </td>
              <td class="p-3.5">
                <div class="font-extrabold text-white text-sm">{{ item.studentName }}</div>
                <div v-if="item.badgeText" class="text-[10px] text-indigo-300">{{ item.badgeText }}</div>
              </td>
              <td class="p-3.5 text-center">
                <span
                  class="rounded-md px-2 py-0.5 text-[10px] font-black border inline-flex items-center gap-1"
                  :class="
                    item.studyFormat === 'online'
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  "
                >
                  {{ item.studyFormat === 'online' ? '🌐 Onlayn' : '🏛️ Oflayn' }}
                </span>
              </td>
              <td class="p-3.5">
                <span class="rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black px-2 py-0.5">
                  {{ item.score || '—' }}
                </span>
              </td>
              <td class="p-3.5 text-slate-300 max-w-xs truncate">
                {{ item.targetUniversity || '—' }}
              </td>
              <td class="p-3.5 text-slate-400">
                <div>{{ item.certificateType || 'Sertifikat' }}</div>
                <div class="text-[10px] font-mono text-slate-500">{{ item.year }}</div>
              </td>
              <td class="p-3.5 text-center">
                <span v-if="item.pdfUrl" class="text-purple-400 font-bold" title="PDF biriktirilgan">📄 Bor</span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="p-3.5 text-center">
                <button
                  type="button"
                  @click="toggleFeatured(item)"
                  class="text-sm"
                  :title="item.isFeatured ? 'Asosiy vitrinadan olish' : 'Asosiy vitrinaga qo\'yish'"
                >
                  {{ item.isFeatured ? '⭐' : '☆' }}
                </button>
              </td>
              <td class="p-3.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="previewImage(item)"
                    class="rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 p-1.5 hover:bg-cyan-500/30 transition"
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    @click="openEditModal(item)"
                    class="rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 p-1.5 hover:bg-blue-500/30 transition"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    @click="handleDelete(item)"
                    class="rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 p-1.5 hover:bg-red-500/30 transition"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
    <BaseModal
      v-model="showFormModal"
      :title="isEditing ? '✏️ Natijani Tahrirlash' : '➕ Yangi Natija va Sertifikat Qo\'shish'"
      custom-class="max-w-2xl w-full"
    >
      <form @submit.prevent="handleSubmitForm" class="space-y-4 py-1 text-xs">
        <!-- Student Name (Autocomplete from registry or custom) -->
        <div class="space-y-1">
          <label class="block font-bold text-slate-300">
            O'quvchi ism-familiyasi <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <input
              v-model="formData.studentName"
              type="text"
              list="students-datalist"
              required
              placeholder="Masalan: Azizbek Karimov"
              class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
            />
            <datalist id="students-datalist">
              <option v-for="s in registeredStudentNames" :key="s" :value="s" />
            </datalist>
          </div>
          <p class="text-[11px] text-slate-500">Mavjud o'quvchilar ro'yxatidan tanlashingiz yoki yangi ism yozishingiz mumkin</p>
        </div>

        <!-- Ta'lim shakli (Onlayn / Oflayn) -->
        <div class="space-y-1.5 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
          <label class="block font-bold text-slate-200 text-xs">
            Ta'lim shakli <span class="text-red-400">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="formData.studyFormat = 'offline'"
              class="rounded-xl py-2.5 px-3 text-xs font-black transition flex items-center justify-center gap-2 border cursor-pointer"
              :class="
                formData.studyFormat === 'offline' || !formData.studyFormat
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              "
            >
              <span>🏛️</span> <span>Oflayn ta'lim</span>
            </button>
            <button
              type="button"
              @click="formData.studyFormat = 'online'"
              class="rounded-xl py-2.5 px-3 text-xs font-black transition flex items-center justify-center gap-2 border cursor-pointer"
              :class="
                formData.studyFormat === 'online'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
              "
            >
              <span>🌐</span> <span>Onlayn ta'lim</span>
            </button>
          </div>
        </div>

        <!-- 1. CERTIFICATE IMAGE UPLOAD (REQUIRED) -->
        <div class="space-y-2 rounded-2xl border border-white/10 bg-slate-900/60 p-3.5">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-200 flex items-center gap-1.5">
              <span>🖼️ Sertifikat Rasmi</span>
              <span class="rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] px-1.5 py-0.2 font-black uppercase">Majburiy</span>
            </label>
            <span v-if="formData.certificateImage" class="text-[10px] text-emerald-400 font-bold">✓ Rasm yuklandi</span>
          </div>

          <!-- Drag and drop zone -->
          <div
            @dragover.prevent="isDraggingImage = true"
            @dragleave.prevent="isDraggingImage = false"
            @drop.prevent="handleImageDrop"
            class="rounded-2xl border-2 border-dashed p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2"
            :class="
              isDraggingImage
                ? 'border-blue-500 bg-blue-500/10'
                : formData.certificateImage
                ? 'border-emerald-500/40 bg-emerald-950/10'
                : 'border-white/20 hover:border-white/40 bg-black/30'
            "
            @click="triggerImageFileInput"
          >
            <input
              ref="imageFileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageFileSelect"
            />

            <!-- Preview if uploaded -->
            <div v-if="isProcessingImage" class="space-y-1 py-4">
              <div class="text-2xl animate-spin">⏳</div>
              <div class="font-bold text-white text-xs">Rasm optimallashtirilmoqda...</div>
            </div>
            <div v-else-if="formData.certificateImage" class="relative group w-full max-w-sm h-40 rounded-xl overflow-hidden border border-white/20 bg-black">
              <img :src="formData.certificateImage" alt="Preview" class="w-full h-full object-contain" />
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <span class="text-xs font-bold text-white">Rasmni almashtirish 🔄</span>
              </div>
            </div>

            <!-- Upload prompt if not uploaded -->
            <div v-else class="space-y-1">
              <div class="text-3xl">📥</div>
              <div class="font-bold text-white text-xs">Sertifikat rasmini bu yerga tashlang yoki bosing</div>
              <p class="text-[11px] text-slate-400">JPG, PNG, WEBP formatlar qo'llab-quvvatlanadi (avtomatik siqiladi)</p>
            </div>
          </div>

          <!-- Alternative URL input toggle -->
          <div class="pt-1">
            <button
              type="button"
              @click="showImageUrlInput = !showImageUrlInput"
              class="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
            >
              {{ showImageUrlInput ? 'Rasmni fayldan tanlashga qaytish' : 'yoki to\'g\'ridan-to\'g\'ri rasm havolasini (URL) kiritish' }}
            </button>
            <input
              v-if="showImageUrlInput"
              v-model="formData.certificateImage"
              type="url"
              placeholder="https://example.com/certificate.jpg"
              class="w-full mt-1.5 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <!-- 2. PDF FILE UPLOAD (OPTIONAL) -->
        <div class="space-y-2 rounded-2xl border border-white/10 bg-slate-900/60 p-3.5">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-200 flex items-center gap-1.5">
              <span>📄 Rasmiy PDF Fayli</span>
              <span class="rounded bg-slate-700/50 border border-white/10 text-slate-400 text-[10px] px-1.5 py-0.2 font-bold uppercase">Ixtiyoriy</span>
            </label>
            <button
              v-if="formData.pdfUrl"
              type="button"
              @click="formData.pdfUrl = ''; formData.pdfName = ''"
              class="text-[10px] text-red-400 hover:underline"
            >
              ✕ O'chirish
            </button>
          </div>

          <!-- PDF Drop / Select Zone -->
          <div
            @dragover.prevent="isDraggingPdf = true"
            @dragleave.prevent="isDraggingPdf = false"
            @drop.prevent="handlePdfDrop"
            class="rounded-2xl border-2 border-dashed p-3.5 text-center transition cursor-pointer flex items-center justify-between gap-3"
            :class="
              isDraggingPdf
                ? 'border-purple-500 bg-purple-500/10'
                : formData.pdfUrl
                ? 'border-purple-500/40 bg-purple-950/20'
                : 'border-white/15 hover:border-white/30 bg-black/20'
            "
            @click="triggerPdfFileInput"
          >
            <input
              ref="pdfFileInputRef"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="handlePdfFileSelect"
            />

            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-2xl">📄</span>
              <div class="text-left min-w-0">
                <div v-if="formData.pdfUrl" class="font-extrabold text-white text-xs truncate">
                  {{ formData.pdfName || 'Sertifikat.pdf biriktirildi' }}
                </div>
                <div v-else class="font-bold text-slate-300 text-xs">
                  PDF faylni tanlash (Sertifikat yoki DTM qaydnomasi)
                </div>
                <p class="text-[10px] text-slate-500">Istalgan paytda yuklab olish uchun ommaviy sahifada ko'rinadi</p>
              </div>
            </div>

            <div class="shrink-0">
              <span class="rounded-xl bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 text-[11px] font-bold text-purple-300">
                {{ formData.pdfUrl ? 'Almashtirish' : 'Tanlash' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. ADDITIONAL DETAILS: Score, University, Type, Year -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Score / Ball -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">To'plangan ball / Natija</label>
            <input
              v-model="formData.score"
              type="text"
              placeholder="Masalan: 189.5 ball, A+, 56.4 ball"
              class="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <!-- Quick Chips -->
            <div class="flex flex-wrap gap-1 pt-1">
              <button
                v-for="chip in ['189.5 ball', 'A+ (90%+)', 'A Daraja', '100% Grant', '56.4 ball']"
                :key="chip"
                type="button"
                @click="formData.score = chip"
                class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                {{ chip }}
              </button>
            </div>
          </div>

          <!-- Target University / OTM -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">OTM / Fakultet</label>
            <input
              v-model="formData.targetUniversity"
              type="text"
              placeholder="Masalan: O'zMU Tarix fakulteti"
              class="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <!-- Quick Chips -->
            <div class="flex flex-wrap gap-1 pt-1">
              <button
                v-for="u in ['O\'zMU', 'TDYU', 'JIDU', 'O\'zDJTU', 'TDPU']"
                :key="u"
                type="button"
                @click="formData.targetUniversity = u"
                class="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                {{ u }}
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Certificate Type -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">Sertifikat turi</label>
            <select
              v-model="formData.certificateType"
              class="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Milliy Sertifikat (A+)">Milliy Sertifikat (A+)</option>
              <option value="Milliy Sertifikat (A)">Milliy Sertifikat (A)</option>
              <option value="DTM Davlat Granti">DTM Davlat Granti</option>
              <option value="Respublika Olimpiadasi">Respublika Olimpiadasi</option>
              <option value="Xalqaro Sertifikat">Xalqaro Sertifikat</option>
              <option value="Oltin Medal">Oltin Medal</option>
            </select>
          </div>

          <!-- Year -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">Yil</label>
            <select
              v-model="formData.year"
              class="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <!-- Exam Date -->
          <div class="space-y-1">
            <label class="block font-bold text-slate-300">Imtihon sanasi</label>
            <input
              v-model="formData.examDate"
              type="date"
              class="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Badge Text -->
        <div class="space-y-1">
          <label class="block font-bold text-slate-300">Qo'shimcha Nishon / Yutuq shiori</label>
          <input
            v-model="formData.badgeText"
            type="text"
            placeholder="Masalan: 100% Davlat Granti 🎓, A+ Daraja ⭐"
            class="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <!-- Teacher Motivational Note -->
        <div class="space-y-1">
          <label class="block font-bold text-slate-300">Ustoz fikri & Motivatsion so'zlar</label>
          <textarea
            v-model="formData.teacherNote"
            rows="3"
            placeholder="O'quvchining erishgan natijasi, o'rganishdagi tirishqoqligi va boshqa o'quvchilarga motivatsiya beruvchi fikrlarni yozing..."
            class="w-full rounded-2xl border border-white/15 bg-black/40 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 custom-scrollbar"
          ></textarea>
        </div>

        <!-- Featured Checkbox -->
        <div class="flex items-center gap-2.5 pt-1">
          <input
            id="featured-check"
            v-model="formData.isFeatured"
            type="checkbox"
            class="h-4 w-4 rounded accent-blue-600 cursor-pointer"
          />
          <label for="featured-check" class="font-bold text-slate-200 cursor-pointer select-none">
            ⭐ Asosiy sahifada eng yuqorida (Featured) ko'rsatilsin
          </label>
        </div>

        <!-- Submit & Cancel Buttons -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <button
            type="button"
            @click="showFormModal = false"
            class="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <span v-if="isSubmitting">Saqlanmoqda...</span>
            <span v-else>{{ isEditing ? 'Saqlash' : 'Yuklash va Chop Etish 🚀' }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- CERTIFICATE PREVIEW MODAL -->
    <BaseModal
      v-model="showPreviewModal"
      :title="previewTarget ? `${previewTarget.studentName} — Sertifikati` : 'Sertifikat'"
      custom-class="max-w-4xl w-full"
    >
      <div v-if="previewTarget" class="space-y-4 py-2">
        <div class="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-black flex items-center justify-center max-h-[70vh]">
          <img :src="previewTarget.certificateImage" :alt="previewTarget.studentName" class="max-h-[70vh] w-auto object-contain" />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-white/10 pt-3">
          <div class="space-y-0.5">
            <div class="font-black text-sm text-white">{{ previewTarget.studentName }}</div>
            <div class="text-slate-400">
              {{ previewTarget.score }} • {{ previewTarget.targetUniversity }}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a
              v-if="previewTarget.pdfUrl"
              :href="previewTarget.pdfUrl"
              :download="previewTarget.pdfName || `${previewTarget.studentName}_sertifikat.pdf`"
              target="_blank"
              class="rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white hover:bg-purple-500 transition flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
            >
              <span>📄</span> <span>PDF Faylni Yuklab Olish</span>
            </a>

            <a
              :href="previewTarget.certificateImage"
              :download="`${previewTarget.studentName}_sertifikat.png`"
              class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500 transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <span>💾</span> <span>Rasmni Saqlash</span>
            </a>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { useTeacherStore } from "../../composables/useTeacherStore";
import {
  StudentResult,
  fetchAllResults,
  saveStudentResult,
  deleteStudentResult,
  subscribeToResults,
  compressImageFile,
  readPdfFileAsDataUrl,
} from "../../services/resultsService";

const emit = defineEmits<{
  (e: "back"): void;
  (e: "openPublicResults"): void;
}>();

const teacherStore = useTeacherStore();

const allResults = ref<StudentResult[]>([]);
const searchQuery = ref("");
const filterYear = ref("all");
const filterType = ref("all");
const filterFormat = ref("all");
const viewMode = ref<"grid" | "table">("grid");

const showFormModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const showPreviewModal = ref(false);
const previewTarget = ref<StudentResult | null>(null);

const isDraggingImage = ref(false);
const isDraggingPdf = ref(false);
const showImageUrlInput = ref(false);
const isProcessingImage = ref(false);
const isProcessingPdf = ref(false);

const imageFileInputRef = ref<HTMLInputElement | null>(null);
const pdfFileInputRef = ref<HTMLInputElement | null>(null);

// Form Model
const formData = ref<Partial<StudentResult>>({
  studentName: "",
  certificateImage: "",
  pdfUrl: "",
  pdfName: "",
  score: "",
  targetUniversity: "",
  certificateType: "Milliy Sertifikat (A+)",
  studyFormat: "offline",
  year: "2025",
  examDate: new Date().toISOString().split("T")[0],
  badgeText: "100% Davlat Granti 🎓",
  teacherNote: "",
  isFeatured: false,
});

// Autocomplete list from teacherStore students registry
const registeredStudentNames = computed(() => {
  return teacherStore.allStudentsRegistry.value.map((s) => s.name);
});

// Dynamic available years
const availableYears = computed(() => {
  const set = new Set<string | number>();
  allResults.value.forEach((r) => {
    if (r.year) set.add(r.year);
  });
  return Array.from(set).sort().reverse();
});

// Filtered Results
const filteredResults = computed(() => {
  let list = allResults.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.targetUniversity && r.targetUniversity.toLowerCase().includes(q)) ||
        (r.teacherNote && r.teacherNote.toLowerCase().includes(q))
    );
  }

  if (filterYear.value !== "all") {
    list = list.filter((r) => String(r.year) === String(filterYear.value));
  }

  if (filterType.value !== "all") {
    list = list.filter((r) => r.certificateType?.includes(filterType.value));
  }

  if (filterFormat.value !== "all") {
    list = list.filter((r) => (r.studyFormat || "offline") === filterFormat.value);
  }

  return list;
});

// Quick metrics
const grantAndTopCount = computed(() => {
  return allResults.value.filter(
    (r) =>
      r.score?.includes("A+") ||
      r.score?.includes("Grant") ||
      r.badgeText?.includes("Grant") ||
      r.certificateType?.includes("Grant")
  ).length;
});

const pdfAttachedCount = computed(() => {
  return allResults.value.filter((r) => !!r.pdfUrl).length;
});

const featuredCount = computed(() => {
  return allResults.value.filter((r) => r.isFeatured).length;
});

let unsubscribeResults: (() => void) | null = null;

onMounted(async () => {
  allResults.value = await fetchAllResults();
  unsubscribeResults = subscribeToResults((updated) => {
    allResults.value = updated;
  });
});

onUnmounted(() => {
  if (unsubscribeResults) {
    unsubscribeResults();
  }
});

function openAddModal() {
  isEditing.value = false;
  showImageUrlInput.value = false;
  formData.value = {
    id: "",
    studentName: "",
    certificateImage: "",
    pdfUrl: "",
    pdfName: "",
    score: "189.5 ball",
    targetUniversity: "O'zbekiston Milliy Universiteti",
    certificateType: "Milliy Sertifikat (A+)",
    studyFormat: "offline",
    year: "2025",
    examDate: new Date().toISOString().split("T")[0],
    badgeText: "100% Davlat Granti 🎓",
    teacherNote: "",
    isFeatured: false,
  };
  showFormModal.value = true;
}

function openEditModal(item: StudentResult) {
  isEditing.value = true;
  showImageUrlInput.value = false;
  formData.value = { ...item };
  showFormModal.value = true;
}

function triggerImageFileInput() {
  imageFileInputRef.value?.click();
}

function triggerPdfFileInput() {
  pdfFileInputRef.value?.click();
}

async function handleImageFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  await processImageFile(files[0]);
}

async function handleImageDrop(e: DragEvent) {
  isDraggingImage.value = false;
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await processImageFile(files[0]);
}

async function processImageFile(file: File) {
  try {
    isProcessingImage.value = true;
    const compressed = await compressImageFile(file, 850, 650, 0.72);
    formData.value.certificateImage = compressed;
  } catch (err: any) {
    alert("Rasm yuklashda xatolik: " + (err.message || err));
  } finally {
    isProcessingImage.value = false;
  }
}

async function handlePdfFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files || files.length === 0) return;
  await processPdfFile(files[0]);
}

async function handlePdfDrop(e: DragEvent) {
  isDraggingPdf.value = false;
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await processPdfFile(files[0]);
}

async function processPdfFile(file: File) {
  try {
    isProcessingPdf.value = true;
    const res = await readPdfFileAsDataUrl(file);
    formData.value.pdfUrl = res.dataUrl;
    formData.value.pdfName = res.name;
  } catch (err: any) {
    alert("PDF yuklashda xatolik: " + (err.message || err));
  } finally {
    isProcessingPdf.value = false;
  }
}

async function handleSubmitForm() {
  if (!formData.value.studentName?.trim()) {
    alert("Iltimos, o'quvchi ismini kiriting!");
    return;
  }
  if (!formData.value.certificateImage) {
    alert("Iltimos, sertifikat rasmini yuklang! (Majburiy)");
    return;
  }

  // 1. Instantly copy data and close the modal (0 ms perceived wait time!)
  const itemToSave = { ...formData.value } as StudentResult;
  showFormModal.value = false;

  // 2. Save locally immediately and sync in background
  try {
    await saveStudentResult(itemToSave);
  } catch (e: any) {
    console.warn("Natijani saqlashda ogohlantirish:", e);
  }
}

async function toggleFeatured(item: StudentResult) {
  try {
    item.isFeatured = !item.isFeatured;
    await saveStudentResult(item);
  } catch (e) {
    console.warn("Could not toggle featured status:", e);
  }
}

async function handleDelete(item: StudentResult) {
  if (!confirm(`Haqiqatdan ham "${item.studentName}" natijasini o'chirmoqchimisiz?`)) {
    return;
  }
  try {
    await deleteStudentResult(item.id);
  } catch (e: any) {
    alert("O'chirishda xatolik: " + (e.message || e));
  }
}

function previewImage(item: StudentResult) {
  previewTarget.value = item;
  showPreviewModal.value = true;
}

function openPublicResults() {
  emit("openPublicResults");
}
</script>
