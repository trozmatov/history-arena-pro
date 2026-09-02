<template>
  <div class="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl text-center">
    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 text-3xl">
      🎓
    </div>
    <h2 class="text-2xl font-black tracking-tight text-white mb-1">O'quvchi Portali</h2>
    <p class="text-xs text-slate-400 mb-6">Shaxsiy kabinetga kirish uchun ism va parolingizni kiriting</p>

    <form @submit.prevent="submitLogin" class="space-y-4">
      <div>
        <input
          v-model="loginUser"
          type="text"
          placeholder="Ismingiz (masalan: Ali Valiyev)"
          required
          class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>
      <div>
        <input
          v-model="loginPass"
          type="password"
          placeholder="Parol (standart: 1234)"
          required
          class="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div v-if="errorMsg" class="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-bold text-red-400">
        {{ errorMsg }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:opacity-50 transition-all"
      >
        <span v-if="loading">Tekshirilmoqda... ⏳</span>
        <span v-else>Kirish 🚀</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStudentStore } from "../../composables/useStudentStore";

const studentStore = useStudentStore();
const loginUser = ref("");
const loginPass = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function submitLogin() {
  if (!loginUser.value || !loginPass.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await studentStore.loginStudent(loginUser.value.trim(), loginPass.value.trim());
    if (!res.success) {
      errorMsg.value = res.message || "Ism yoki parol xato kiritildi!";
    }
  } catch (e: any) {
    errorMsg.value = "Tizimga ulanishda xatolik yuz berdi.";
  } finally {
    loading.value = false;
  }
}
</script>
