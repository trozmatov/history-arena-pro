<template>
  <div class="mx-auto w-full max-w-md rounded-3xl liquid-glass-panel p-8 text-center shadow-2xl">
    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-xl shadow-blue-500/25 text-3xl">
      👨‍🏫
    </div>
    <h2 class="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">O'qituvchi Portali</h2>
    <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Tizimga kirish uchun login va parolingizni kiriting</p>

    <form @submit.prevent="submitLogin" class="space-y-4">
      <div>
        <input
          v-model="loginUser"
          type="text"
          placeholder="Login"
          required
          class="w-full rounded-2xl liquid-glass-inset px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
      </div>
      <div>
        <input
          v-model="loginPass"
          type="password"
          placeholder="Parol"
          required
          class="w-full rounded-2xl liquid-glass-inset px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
        />
      </div>

      <div v-if="errorMsg" class="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-bold text-red-500">
        {{ errorMsg }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-bold text-sm text-white shadow-lg shadow-blue-600/30 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
      >
        <span v-if="loading">Tekshirilmoqda... ⏳</span>
        <span v-else>Kirish 🚀</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { callApi } from "../../services/api";
import { useTeacherStore } from "../../composables/useTeacherStore";

const teacherStore = useTeacherStore();
const loginUser = ref("");
const loginPass = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function submitLogin() {
  if (!loginUser.value || !loginPass.value) return;
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await callApi("login", {
      login: loginUser.value.trim(),
      password: loginPass.value.trim(),
    });
    if (res.status === "success") {
      teacherStore.setTeacher(res.name || loginUser.value);
    } else {
      errorMsg.value = "Login yoki parol noto'g'ri!";
    }
  } catch (e: any) {
    errorMsg.value = "Baza bilan ulanishda xatolik yuz berdi.";
  } finally {
    loading.value = false;
  }
}
</script>
