<template>
  <div class="space-y-4">
    <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-white flex items-center gap-2">
          <span>🛒</span> Do'kon va Jarimalar
        </h2>
        <button
          type="button"
          @click="$emit('back')"
          class="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
        >
          Ortga ↩️
        </button>
      </div>

      <!-- Settings Card -->
      <div class="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
        <div class="flex items-center justify-between gap-3 text-xs">
          <span class="text-slate-300 font-semibold">1 Strike jarimasi (so'm):</span>
          <input
            v-model.number="penaltyUzs"
            type="number"
            class="w-28 rounded-xl border border-white/15 bg-slate-900 px-3 py-1.5 text-center text-xs font-bold text-white outline-none focus:border-emerald-500"
          />
        </div>
        <div class="flex items-center justify-between gap-3 text-xs">
          <span class="text-slate-300 font-semibold">Qalqon narxi (tangada):</span>
          <input
            v-model.number="shieldCoin"
            type="number"
            class="w-28 rounded-xl border border-white/15 bg-slate-900 px-3 py-1.5 text-center text-xs font-bold text-white outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="button"
          @click="saveSettings"
          :disabled="savingSet"
          class="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition"
        >
          {{ savedSet ? "Saqlandi ✅" : savingSet ? "Saqlanmoqda... ⏳" : "Sozlamalarni saqlash" }}
        </button>
      </div>

      <!-- Reset Coins Danger Box -->
      <div class="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 flex items-center justify-between">
        <span class="text-xs font-bold text-red-300">Barcha tangalarni tozalash:</span>
        <button
          type="button"
          @click="resetAllCoins"
          class="rounded-xl bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-xs font-black text-red-300 hover:bg-red-500/30 active:scale-95 transition"
        >
          Nollashtirish ⚠️
        </button>
      </div>

      <!-- Add New Item -->
      <div class="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
        <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">Yangi tovar qo'shish</div>
        <div class="flex gap-2">
          <input
            v-model="newItemIcon"
            type="text"
            placeholder="🎁"
            class="w-12 rounded-xl border border-white/15 bg-slate-900 px-2 py-2 text-center text-lg outline-none"
          />
          <input
            v-model="newItemName"
            type="text"
            placeholder="Nomi..."
            class="flex-1 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
          />
          <input
            v-model.number="newItemPrice"
            type="number"
            placeholder="Narxi..."
            class="w-20 rounded-xl border border-white/15 bg-slate-900 px-2 py-2 text-center text-xs text-white outline-none"
          />
          <button
            type="button"
            @click="addItem"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      <!-- Items List -->
      <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
        <div
          v-for="item in marketItems"
          :key="item.id"
          class="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs"
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ item.icon }}</span>
            <div>
              <div class="font-bold text-white">{{ item.name }}</div>
              <div class="text-amber-400 font-black text-[11px]">{{ item.price }} 🪙</div>
            </div>
          </div>
          <button
            v-if="item.id !== 'shield_special'"
            type="button"
            @click="deleteItem(item.id)"
            class="rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20"
          >
            O'chirish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { callApi } from "../../services/api";

defineEmits<{
  (e: "back"): void;
}>();

interface MarketItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

const penaltyUzs = ref(1000);
const shieldCoin = ref(5);
const savingSet = ref(false);
const savedSet = ref(false);

const marketItems = ref<MarketItem[]>([]);
const newItemIcon = ref("🎁");
const newItemName = ref("");
const newItemPrice = ref<number | "">("");

onMounted(() => {
  loadSettings();
  loadItems();
});

async function loadSettings() {
  try {
    const res = await callApi("get_settings");
    if (res.status === "success" && res.settings) {
      penaltyUzs.value = res.settings.strike_penalty_uzs || 1000;
      shieldCoin.value = res.settings.strike_price_coin || 5;
    }
  } catch (e) {}
}

async function saveSettings() {
  savingSet.value = true;
  savedSet.value = false;
  try {
    await callApi("update_settings", {
      penalty_uzs: penaltyUzs.value,
      price_coin: shieldCoin.value,
    });
    savedSet.value = true;
    setTimeout(() => {
      savedSet.value = false;
    }, 2000);
  } catch (e) {
    alert("Saqlashda xatolik!");
  } finally {
    savingSet.value = false;
  }
}

async function loadItems() {
  try {
    const res = await callApi("get_market_items");
    if (res.status === "success" && res.items) {
      marketItems.value = res.items;
    }
  } catch (e) {}
}

async function addItem() {
  if (!newItemName.value || !newItemPrice.value) return;
  try {
    await callApi("add_market_item", {
      icon: newItemIcon.value || "🎁",
      name: newItemName.value,
      price: newItemPrice.value,
    });
    newItemName.value = "";
    newItemPrice.value = "";
    await loadItems();
  } catch (e) {}
}

async function deleteItem(id: string) {
  if (!confirm("O'chirasizmi?")) return;
  try {
    await callApi("delete_market_item", { id });
    await loadItems();
  } catch (e) {}
}

async function resetAllCoins() {
  if (!confirm("Barcha tangalar nollashtirilsinmi?")) return;
  try {
    await callApi("reset_coins");
    alert("Tangalar nollashtirildi!");
  } catch (e) {
    alert("Xatolik!");
  }
}
</script>
