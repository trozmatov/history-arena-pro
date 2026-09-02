<template>
  <div class="space-y-4">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>💬</span> Umumiy Guruh Chati
        </h2>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Messages Area -->
      <div
        ref="chatBoxRef"
        class="h-80 overflow-y-auto space-y-3 rounded-2xl border border-white/10 bg-black/50 p-4 custom-scrollbar"
      >
        <div v-if="messages.length === 0" class="flex h-full items-center justify-center text-xs text-slate-500">
          Xabarlar mavjud emas. Birinchi xabarni yozing!
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="max-w-[85%] rounded-2xl p-3 text-xs shadow-md transition-all"
          :class="
            msg.senderType === 'T'
              ? 'ml-auto bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-none'
              : msg.senderType === 'A'
              ? 'mr-auto bg-gradient-to-tr from-amber-600/30 to-yellow-600/30 border border-amber-500/40 text-amber-100 rounded-bl-none'
              : 'mr-auto bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none'
          "
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-extrabold text-[11px]" :class="getSenderColor(msg)">
              {{ msg.senderType === 'T' ? '👨‍🏫 ' + msg.senderName : msg.senderType === 'A' ? '🤖 ' + msg.senderName : msg.senderName }}
            </span>
            <span class="text-[9px] opacity-60">{{ msg.time }}</span>
          </div>

          <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>

          <!-- Actions for Teacher's own messages -->
          <div v-if="msg.senderType === 'T'" class="mt-2 flex justify-end gap-2 text-[10px] opacity-80 pt-1 border-t border-white/10">
            <button @click="editMessage(msg)" class="hover:underline">✏️ Tahrirlash</button>
            <button @click="deleteMessage(msg.id)" class="hover:underline text-red-300">🗑️ O'chirish</button>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="aiTyping" class="text-xs text-amber-400 font-semibold italic flex items-center gap-1 px-1">
        <span>🤖</span> <span>Suhbatdosh xabar yozmoqda... ⏳</span>
      </div>

      <!-- Input Row -->
      <div class="flex gap-2">
        <input
          v-model="inputMsg"
          type="text"
          placeholder="Xabar yozing (AI uchun @ belgisini qo'shing)..."
          @keypress.enter="sendMessage"
          class="flex-1 rounded-2xl border border-white/15 bg-black/50 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
        />
        <button
          type="button"
          @click="sendMessage"
          class="rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30 transition"
        >
          ➤
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { db, ref as fbRef, push, update, remove, onChildAdded, onChildChanged, onChildRemoved } from "../../services/firebase";
import { callApi } from "../../services/api";
import { useTeacherStore } from "../../composables/useTeacherStore";

defineEmits<{
  (e: "back"): void;
}>();

interface ChatMessage {
  id: string;
  senderName: string;
  senderType: "T" | "S" | "A";
  text: string;
  time: string;
  timestamp?: number;
}

const teacherStore = useTeacherStore();
const messages = ref<ChatMessage[]>([]);
const inputMsg = ref("");
const aiTyping = ref(false);
const chatBoxRef = ref<HTMLDivElement | null>(null);

const chatRef = fbRef(db, "chats/umumiy");

onMounted(() => {
  onChildAdded(chatRef, (snap: any) => {
    messages.value.push({ id: snap.key, ...snap.val() });
    scrollToBottom();
  });

  onChildChanged(chatRef, (snap: any) => {
    const idx = messages.value.findIndex((m) => m.id === snap.key);
    if (idx !== -1) {
      messages.value[idx] = { id: snap.key, ...snap.val() };
    }
  });

  onChildRemoved(chatRef, (snap: any) => {
    messages.value = messages.value.filter((m) => m.id !== snap.key);
  });
});

function scrollToBottom() {
  nextTick(() => {
    if (chatBoxRef.value) {
      chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
    }
  });
}

function getSenderColor(msg: ChatMessage) {
  if (msg.senderType === "T") return "text-white";
  if (msg.senderType === "A") return "text-amber-300";
  return "text-blue-400";
}

async function sendMessage() {
  const text = inputMsg.value.trim();
  if (!text) return;
  inputMsg.value = "";

  const timeStr = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  await push(chatRef, {
    time: timeStr,
    senderName: teacherStore.teacherName.value || "Ustoz",
    senderType: "T",
    text,
    timestamp: Date.now(),
  });

  // AI Response trigger
  if (text.includes("@")) {
    aiTyping.value = true;
    try {
      const res = await callApi("ask_ai", {
        persona: "Umumiy Guruh",
        text,
      });
      if (res.status === "success" && res.aiText) {
        await push(chatRef, {
          time: new Date().toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          senderName: res.aiName || "AI Assistent",
          senderType: "A",
          text: res.aiText,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error("AI error:", e);
    } finally {
      aiTyping.value = false;
    }
  }
}

async function editMessage(msg: ChatMessage) {
  const newText = prompt("Xabarni tahrirlash:", msg.text);
  if (newText !== null && newText.trim() !== "") {
    await update(fbRef(db, `chats/umumiy/${msg.id}`), {
      text: newText.trim() + " (tahrirlandi)",
    });
  }
}

async function deleteMessage(id: string) {
  if (confirm("Xabar o'chirilsinmi?")) {
    await remove(fbRef(db, `chats/umumiy/${id}`));
  }
}
</script>
