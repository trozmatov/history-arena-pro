<template>
  <div class="min-h-screen text-slate-100 selection:bg-blue-600 selection:text-white pb-20 relative overflow-x-hidden">
    <!-- Ambient Background Lighting / Glows -->
    <div class="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
    <div class="fixed bottom-10 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
    <div class="fixed top-1/2 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

    <!-- Navigation Header Bar for Public View -->
    <div class="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer" @click="$emit('goHome')">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-lg shadow-amber-500/30 text-slate-950 font-black text-lg">
            🏆
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-base sm:text-lg font-black tracking-tight text-white">HistoryPro</span>
            </div>
            <p class="text-[10px] sm:text-[11px] text-slate-400">To'lqin Ro'zmatov</p>
          </div>
        </div>

        <!-- Back to Portal / Login button -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('goHome')"
            class="rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-slate-200 transition active:scale-95 flex items-center gap-1.5 shadow-md"
          >
            <span>←</span> <span class="hidden sm:inline">Bosh sahifaga qaytish</span><span class="sm:hidden">Ortga</span>
          </button>
        </div>
      </div>
    </div>

    <!-- HERO SECTION: Motivational Banner & Trophy Showcase -->
    <section class="relative px-4 pt-8 pb-6 sm:pt-14 sm:pb-10 max-w-7xl mx-auto text-center space-y-6">
      <!-- Floating Badge -->
      <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 px-4 py-1.5 text-xs font-black text-amber-300 shadow-xl backdrop-blur-xl">
        <span class="text-sm animate-bounce">🌟</span>
        <span>Bizning o'quvchilarimiz!</span>
        <span class="rounded-full bg-amber-400 text-slate-950 px-2 py-0.2 text-[10px] font-black">
          {{ allResults.length }} ta
        </span>
      </div>

      <!-- Main Headline with Gradient Glow -->
      <div class="space-y-3 max-w-3xl mx-auto">
        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Milliy sertifikat, BMBA va <br class="hidden sm:block" />
          <span class="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
            olimpiada g'oliblari!
          </span>
        </h1>
        <!-- <p class="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Mehnat, qat'iyat va intizom mevalari! Bizning o'quvchilarimiz Milliy Sertifikat imtihonlari va OTM kirish sinovlarida eng yuqori natijalarni qayd etib, 100% davlat grantlarini qo'lga kiritishdi.
        </p> -->
      </div>

      <!-- 4 Motivational Stat Counters -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2">
        <div class="glass-panel rounded-3xl p-4 sm:p-5 border-amber-500/20 text-center relative overflow-hidden group hover:border-amber-500/50 transition">
          <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition"></div>
          <div class="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
            {{ grantCount }}
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-white mt-1">Davlat Granti</div>
          <p class="text-[10px] text-slate-400 mt-0.5">100% budjet asosida</p>
        </div>

        <div class="glass-panel rounded-3xl p-4 sm:p-5 border-emerald-500/20 text-center relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
            {{ aPlusCount }}
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-white mt-1">A+ va A Daraja</div>
          <p class="text-[10px] text-slate-400 mt-0.5">Milliy Sertifikat sohiblari</p>
        </div>

        <div class="glass-panel rounded-3xl p-4 sm:p-5 border-blue-500/20 text-center relative overflow-hidden group hover:border-blue-500/50 transition">
          <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
          <div class="text-2xl sm:text-3xl font-black text-blue-400 tabular-nums">
            189
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-white mt-1">Eng yuqori ball</div>
          <p class="text-[10px] text-slate-400 mt-0.5">BMBA test natijalari</p>
        </div>

        <div class="glass-panel rounded-3xl p-4 sm:p-5 border-purple-500/20 text-center relative overflow-hidden group hover:border-purple-500/50 transition">
          <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition"></div>
          <div class="text-2xl sm:text-3xl font-black text-purple-400 tabular-nums">
            98%
          </div>
          <div class="text-xs sm:text-sm font-extrabold text-white mt-1">Natija ko'rsatkichi</div>
          <p class="text-[10px] text-slate-400 mt-0.5">Milliy sertifikat bo'yicha</p>
        </div>
      </div>
    </section>

    <!-- SEARCH & CATEGORY FILTERS -->
    <section class="px-4 max-w-7xl mx-auto space-y-4">
      <div class="glass-panel rounded-3xl p-4 sm:p-5 border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Live Search Input -->
        <div class="relative w-full md:w-96">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 O'quvchi ismi yoki universitet bo'yicha izlash..."
            class="w-full rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        <!-- Filter Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-start md:justify-end text-xs">
          <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            @click="activeCategory = cat.key"
            class="rounded-xl px-3.5 py-2 font-black transition-all flex items-center gap-1.5"
            :class="
              activeCategory === cat.key
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            "
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Year Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
        <span class="text-slate-400 text-[11px] font-bold shrink-0">Yil bo'yicha:</span>
        <button
          type="button"
          @click="selectedYear = 'all'"
          class="rounded-xl px-3 py-1 font-bold shrink-0 transition"
          :class="selectedYear === 'all' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'"
        >
          Barcha yillar ({{ allResults.length }})
        </button>
        <button
          v-for="y in availableYears"
          :key="y"
          type="button"
          @click="selectedYear = String(y)"
          class="rounded-xl px-3 py-1 font-bold shrink-0 transition"
          :class="selectedYear === String(y) ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'"
        >
          {{ y }}-yil
        </button>
      </div>
    </section>

    <!-- CERTIFICATES SHOWCASE GRID -->
    <main class="px-4 max-w-7xl mx-auto pt-6">
      <!-- Empty State -->
      <div
        v-if="displayedResults.length === 0"
        class="glass-panel rounded-3xl p-12 text-center space-y-3 max-w-md mx-auto my-6"
      >
        <div class="text-4xl">📜</div>
        <h3 class="text-base font-bold text-white">
          {{ allResults.length === 0 ? "Hozircha natijalar kiritilmagan" : "Hech qanday natija topilmadi" }}
        </h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          {{ allResults.length === 0 ? "Ustoz tomonidan o'quvchilarning yangi natijalari va sertifikatlari yuklanishi bilan bu yerda namoyish etiladi." : "Qidiruv so'zini o'zgartirib ko'ring yoki boshqa toifani tanlang." }}
        </p>
        <button
          v-if="allResults.length > 0"
          type="button"
          @click="searchQuery = ''; activeCategory = 'all'; selectedYear = 'all'"
          class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
        >
          Barcha natijalarni ko'rsatish
        </button>
      </div>

      <!-- Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="item in displayedResults"
          :key="item.id"
          class="glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col justify-between hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/15 transition-all duration-300 group hover:-translate-y-1.5"
        >
          <!-- Certificate Visual Container -->
          <div class="relative w-full h-64 bg-slate-950 overflow-hidden cursor-pointer" @click="openLightbox(item)">
            <img
              :src="item.certificateImage"
              :alt="item.studentName"
              class="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 opacity-70"></div>

            <!-- Top Floating Badges -->
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span
                v-if="item.isFeatured"
                class="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-[11px] font-black text-slate-950 shadow-lg flex items-center gap-1"
              >
                <span>⭐</span> <span>TOP NATIJA</span>
              </span>
              <span
                v-if="item.certificateType"
                class="rounded-xl bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-extrabold text-slate-200 shadow"
              >
                {{ item.certificateType }}
              </span>
            </div>

            <!-- PDF badge if attached -->
            <div v-if="item.pdfUrl" class="absolute top-3 right-3">
              <span class="rounded-xl bg-purple-600/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white shadow-md flex items-center gap-1 border border-purple-400/30">
                <span>📄</span> <span>PDF Bor</span>
              </span>
            </div>

            <!-- Hover Zoom Hint Overlay -->
            <div class="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
              <span class="rounded-2xl bg-white/20 border border-white/40 px-4 py-2 text-xs font-black text-white shadow-xl backdrop-blur-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition">
                <span>🔍</span> <span>Sertifikatni to'liq ko'rish</span>
              </span>
            </div>

            <!-- Bottom Floating Score & Year -->
            <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span class="rounded-xl bg-black/80 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[11px] font-mono font-bold text-slate-300">
                📅 {{ item.year }}
              </span>

              <span
                v-if="item.score"
                class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1 text-xs font-black text-slate-950 shadow-lg ring-2 ring-emerald-400/30"
              >
                {{ item.score }}
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <!-- Student Name & Achievement Ribbon -->
              <div>
                <h3
                  @click="openLightbox(item)"
                  class="text-lg font-black text-white group-hover:text-amber-300 transition cursor-pointer"
                >
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

                  <div v-if="item.badgeText" class="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-300">
                    {{ item.badgeText }}
                  </div>
                </div>
              </div>

              <!-- University / Faculty -->
              <div v-if="item.targetUniversity" class="text-xs text-slate-300 font-semibold flex items-start gap-1.5">
                <span class="text-base leading-none">🏛️</span>
                <span class="leading-snug">{{ item.targetUniversity }}</span>
              </div>

              <!-- Teacher Note / Motivational Quote -->
              <div v-if="item.teacherNote" class="rounded-2xl border border-white/5 bg-black/40 p-3 text-xs text-slate-300 italic leading-relaxed">
                "{{ item.teacherNote }}"
              </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <!-- View / Open Lightbox -->
              <button
                type="button"
                @click="openLightbox(item)"
                class="flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-2.5 px-3 text-xs font-black text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <span>🔍</span> <span>Ko'rish</span>
              </button>

              <!-- PDF Button if attached -->
              <a
                v-if="item.pdfUrl"
                :href="item.pdfUrl"
                :download="item.pdfName || `${item.studentName}_sertifikat.pdf`"
                target="_blank"
                class="rounded-xl border border-purple-500/30 bg-purple-500/20 px-3 py-2.5 text-xs font-black text-purple-300 hover:bg-purple-500/30 active:scale-95 transition flex items-center gap-1"
                title="Rasmiy PDF sertifikatni yuklab olish"
              >
                <span>📄</span> <span class="hidden sm:inline">PDF</span>
              </a>

              <!-- Celebrate Button -->
              <button
                type="button"
                @click="celebrateStudent(item)"
                class="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white active:scale-95 transition"
                title="Tabriklash (Konfetti!)"
              >
                🎉
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MOTIVATIONAL CALL TO ACTION FOOTER -->
    <section class="px-4 max-w-5xl mx-auto pt-16">
      <div class="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-950/80 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl space-y-4 relative overflow-hidden">
        <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-3xl shadow-lg shadow-amber-500/20">
          🚀
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Siz ham navbatdagi chempion bo'lishingiz mumkin!
        </h2>
        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
          Har bir buyuk natija — har kuni yechilgan bitta test va o'rganilgan bitta mavzudan boshlanadi. O'quvchi kabinetingizga kiring, duellarda bellashing va o'z maqsadingiz sari intiling!
        </p>

        <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            @click="$emit('goHome')"
            class="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 text-xs sm:text-sm font-black text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-purple-500 active:scale-95 transition flex items-center gap-2"
          >
            <span>🎓</span> <span>Kabinetga Kirish & Boshlash</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FULLSCREEN CERTIFICATE LIGHTBOX MODAL -->
    <BaseModal
      v-model="showLightbox"
      :title="activeLightboxItem ? `${activeLightboxItem.studentName} — Rasmiy Sertifikat` : 'Sertifikat'"
      custom-class="max-w-5xl w-full"
    >
      <div v-if="activeLightboxItem" class="space-y-5 py-2">
        <!-- Certificate Image Container with Zoom -->
        <div class="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-black flex items-center justify-center max-h-[72vh] p-2">
          <img
            :src="activeLightboxItem.certificateImage"
            :alt="activeLightboxItem.studentName"
            class="max-h-[70vh] w-auto object-contain transition duration-300 rounded-lg shadow-2xl"
            :style="{ transform: `scale(${zoomScale})` }"
          />

          <!-- Zoom Controls -->
          <div class="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-2xl bg-black/80 backdrop-blur-md p-1.5 border border-white/20 shadow-xl">
            <button
              type="button"
              @click="zoomScale = Math.max(0.7, zoomScale - 0.2)"
              class="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-white text-sm"
              title="Kichraytirish"
            >
              -
            </button>
            <span class="text-[11px] font-mono font-bold text-slate-300 px-1">{{ Math.round(zoomScale * 100) }}%</span>
            <button
              type="button"
              @click="zoomScale = Math.min(2.0, zoomScale + 0.2)"
              class="h-8 w-8 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-white text-sm"
              title="Kattalashtirish"
            >
              +
            </button>
            <button
              type="button"
              @click="zoomScale = 1.0"
              class="rounded-xl px-2 py-1 bg-white/10 hover:bg-white/20 text-[10px] font-bold text-slate-300"
              title="Asl o'lcham"
            >
              100%
            </button>
          </div>
        </div>

        <!-- Details & Actions Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-xl font-black text-white">{{ activeLightboxItem.studentName }}</h3>
              <span
                v-if="activeLightboxItem.score"
                class="rounded-xl bg-emerald-500 px-3 py-0.5 text-xs font-black text-slate-950 shadow"
              >
                {{ activeLightboxItem.score }}
              </span>
              <span
                v-if="activeLightboxItem.badgeText"
                class="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 text-xs font-bold"
              >
                {{ activeLightboxItem.badgeText }}
              </span>
            </div>

            <div class="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span
                class="rounded-md px-2 py-0.5 text-[10px] font-black border inline-flex items-center gap-1"
                :class="
                  activeLightboxItem.studyFormat === 'online'
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                "
              >
                {{ activeLightboxItem.studyFormat === 'online' ? '🌐 Onlayn ta\'lim' : '🏛️ Oflayn ta\'lim' }}
              </span>
              <span>•</span>
              <span v-if="activeLightboxItem.targetUniversity">🏛️ {{ activeLightboxItem.targetUniversity }}</span>
              <span>•</span>
              <span>📜 {{ activeLightboxItem.certificateType }}</span>
              <span>•</span>
              <span>📅 {{ activeLightboxItem.year }}-yil</span>
            </div>

            <p v-if="activeLightboxItem.teacherNote" class="text-xs text-slate-400 italic pt-1 max-w-2xl">
              "{{ activeLightboxItem.teacherNote }}"
            </p>
          </div>

          <!-- Actions: Download Image, Download PDF, Confetti -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <!-- Celebrate button -->
            <button
              type="button"
              @click="celebrateStudent(activeLightboxItem)"
              class="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-orange-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5 active:scale-95"
            >
              <span>🎉</span> <span>Tabriklash!</span>
            </button>

            <!-- PDF Download -->
            <a
              v-if="activeLightboxItem.pdfUrl"
              :href="activeLightboxItem.pdfUrl"
              :download="activeLightboxItem.pdfName || `${activeLightboxItem.studentName}_sertifikat.pdf`"
              target="_blank"
              class="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-black text-white hover:bg-purple-500 transition shadow-lg shadow-purple-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <span>📄</span> <span>PDF Yuklab Olish</span>
            </a>

            <!-- Image Download -->
            <a
              :href="activeLightboxItem.certificateImage"
              :download="`${activeLightboxItem.studentName}_sertifikat.png`"
              class="rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-1.5 active:scale-95"
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
import {
  StudentResult,
  fetchAllResults,
  subscribeToResults,
} from "../../services/resultsService";
import { fireConfetti, soundManager } from "../../composables/useAudio";

defineEmits<{
  (e: "goHome"): void;
}>();

const allResults = ref<StudentResult[]>([]);
const searchQuery = ref("");
const activeCategory = ref("all");
const selectedYear = ref("all");

const showLightbox = ref(false);
const activeLightboxItem = ref<StudentResult | null>(null);
const zoomScale = ref(1.0);

const categories = [
  { key: "all", label: "Hammasi", icon: "🏆" },
  { key: "offline", label: "Oflayn ta'lim", icon: "🏛️" },
  { key: "online", label: "Onlayn ta'lim", icon: "🌐" },
  { key: "grant", label: "Davlat Granti", icon: "🎓" },
  { key: "milliy", label: "Milliy Sertifikat (A/A+)", icon: "⭐" },
  { key: "olimpiada", label: "Olimpiada", icon: "🥇" },
];

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

// Dynamic available years
const availableYears = computed(() => {
  const set = new Set<string | number>();
  allResults.value.forEach((r) => {
    if (r.year) set.add(r.year);
  });
  return Array.from(set).sort().reverse();
});

// Filtered Results
const displayedResults = computed(() => {
  let list = allResults.value;

  // 1. Category Filter
  if (activeCategory.value === "offline") {
    list = list.filter((r) => (r.studyFormat || "offline") === "offline");
  } else if (activeCategory.value === "online") {
    list = list.filter((r) => r.studyFormat === "online");
  } else if (activeCategory.value === "grant") {
    list = list.filter(
      (r) =>
        r.badgeText?.toLowerCase().includes("grant") ||
        r.targetUniversity?.toLowerCase().includes("grant") ||
        r.certificateType?.toLowerCase().includes("grant")
    );
  } else if (activeCategory.value === "milliy") {
    list = list.filter(
      (r) =>
        r.certificateType?.toLowerCase().includes("milliy") ||
        r.score?.includes("A+") ||
        r.score?.includes("A")
    );
  } else if (activeCategory.value === "olimpiada") {
    list = list.filter((r) => r.certificateType?.toLowerCase().includes("olimpiada"));
  }

  // 2. Year Filter
  if (selectedYear.value !== "all") {
    list = list.filter((r) => String(r.year) === String(selectedYear.value));
  }

  // 3. Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        (r.targetUniversity && r.targetUniversity.toLowerCase().includes(q)) ||
        (r.score && r.score.toLowerCase().includes(q)) ||
        (r.teacherNote && r.teacherNote.toLowerCase().includes(q)) ||
        (r.badgeText && r.badgeText.toLowerCase().includes(q))
    );
  }

  return list;
});

// Computed Metric Counters
const grantCount = computed(() => {
  return allResults.value.filter(
    (r) =>
      r.badgeText?.toLowerCase().includes("grant") ||
      r.targetUniversity?.toLowerCase().includes("grant") ||
      r.certificateType?.toLowerCase().includes("grant")
  ).length;
});

const aPlusCount = computed(() => {
  return allResults.value.filter(
    (r) =>
      r.score?.includes("A+") ||
      r.score?.includes("A") ||
      r.certificateType?.includes("A+")
  ).length;
});

function openLightbox(item: StudentResult) {
  activeLightboxItem.value = item;
  zoomScale.value = 1.0;
  showLightbox.value = true;
  soundManager.playClick();
}

function celebrateStudent(item: StudentResult) {
  fireConfetti();
  soundManager.playVictory();
}
</script>
