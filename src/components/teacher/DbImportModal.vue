<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="👥 Bazadan Guruhlarni chaqirish"
  >
    <div class="py-2 space-y-3">
      <!-- Quick Sync Bar -->
      <div class="flex items-center justify-between px-1">
        <span class="text-[11px] text-slate-400">⚡️ Faol guruhlar ro'yxati</span>
        <button
          type="button"
          @click="loadData(true)"
          :disabled="loading"
          class="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-white/10 active:scale-95 transition"
        >
          <span>🔄</span> <span>Sheetsdan yangilash</span>
        </button>
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-slate-400 gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        <p class="text-xs">Baza ma'lumotlari yuklanmoqda...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
        {{ error }}
        <button @click="loadData(true)" class="block mx-auto mt-2 underline font-bold">Qayta urinish</button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="Object.keys(normalGroups).length === 0"
        class="py-8 text-center rounded-2xl border border-white/5 bg-black/20 space-y-2"
      >
        <div class="text-3xl">👥</div>
        <div class="text-xs font-bold text-slate-300">Faol guruhlar topilmadi</div>
        <p class="text-[11px] text-slate-500">Mavjud barcha guruhlar muzlatilgan yoki arxivlangan</p>
      </div>

      <!-- Groups List -->
      <div v-else class="space-y-3">
        <div
          v-for="(members, groupName) in normalGroups"
          :key="groupName"
          class="rounded-2xl border border-white/10 bg-black/30 p-3 overflow-hidden transition"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-amber-400">{{ groupName }}</span>
              <span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                {{ members.length }} ta faol
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="toggleGroupOpen(String(groupName))"
                class="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                {{ openGroups[groupName] ? "Yopish" : "Ko'rish" }}
              </button>
              <button
                type="button"
                @click="toggleSelectAllGroup(members)"
                class="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30"
              >
                {{ isGroupAllSelected(members) ? "Bekor" : "Barchasi" }}
              </button>
            </div>
          </div>

          <!-- Members -->
          <div v-show="openGroups[groupName]" class="mt-3 space-y-1 pt-2 border-t border-white/5">
            <label
              v-for="name in members"
              :key="name"
              class="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer text-xs transition"
            >
              <span class="text-slate-200 font-medium">{{ name }}</span>
              <input
                type="checkbox"
                :value="name"
                v-model="selectedNames"
                class="h-4 w-4 rounded accent-blue-600 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
      >
        Yopish
      </button>
      <button
        type="button"
        @click="confirmAdd"
        :disabled="selectedNames.length === 0"
        class="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        Qo'shish ({{ selectedNames.length }})
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseModal from "../common/BaseModal.vue";
import { callApi } from "../../services/api";
import { useTeacherStore } from "../../composables/useTeacherStore";

const props = defineProps<{
  modelValue: boolean;
  targetTeam: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void;
  (e: "imported", count: number): void;
}>();

const teacherStore = useTeacherStore();

const loading = ref(false);
const error = ref("");
const groupsData = ref<Record<string, string[]>>({});
const selectedNames = ref<string[]>([]);
const openGroups = ref<Record<string, boolean>>({});

// Filter out archive groups, completely frozen groups, and reflect group transfers
const normalGroups = computed(() => {
  const result: Record<string, string[]> = {};

  // Build a lookup map of student -> current group & status from allStudentsRegistry
  const studentMasterMap = new Map<string, { group: string; isFrozen: boolean }>();
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    const normName = s.name.toLowerCase().trim();
    studentMasterMap.set(normName, {
      group: s.group ? s.group.trim() : "",
      isFrozen: s.status === "frozen" || teacherStore.isStudentFrozen(s.name),
    });
  });

  // Group buckets: Map groupName -> Set of student display names
  const groupBuckets = new Map<string, Set<string>>();

  // 1. Process Google Sheets groupsData
  for (const g in groupsData.value) {
    const gTrim = g.trim();
    if (!gTrim) continue;
    if (!groupBuckets.has(gTrim)) {
      groupBuckets.set(gTrim, new Set());
    }
    const members = groupsData.value[g] || [];
    for (const name of members) {
      const normName = name.toLowerCase().trim();
      const master = studentMasterMap.get(normName);
      if (master) {
        if (master.isFrozen) continue; // skip frozen
        // Place in transferred group if specified
        const effectiveGroup = master.group || gTrim;
        if (!groupBuckets.has(effectiveGroup)) {
          groupBuckets.set(effectiveGroup, new Set());
        }
        groupBuckets.get(effectiveGroup)!.add(name);
      } else {
        if (teacherStore.isStudentFrozen(name)) continue;
        groupBuckets.get(gTrim)!.add(name);
      }
    }
  }

  // 2. Also include any students in registry who were transferred or registered
  teacherStore.allStudentsRegistry.value.forEach((s) => {
    if (s.status === "frozen" || teacherStore.isStudentFrozen(s.name)) return;
    const gTrim = (s.group || "").trim();
    if (!gTrim) return;
    if (!groupBuckets.has(gTrim)) {
      groupBuckets.set(gTrim, new Set());
    }
    groupBuckets.get(gTrim)!.add(s.name);
  });

  // 3. Assemble result filtering out archive and empty groups
  for (const [groupName, studentSet] of groupBuckets.entries()) {
    const gLower = groupName.toLowerCase();
    if (gLower === "arxiv" || gLower === "archive" || gLower.includes("arxiv")) {
      continue;
    }
    const list = Array.from(studentSet).sort((a, b) => a.localeCompare(b));
    if (list.length > 0) {
      result[groupName] = list;
    }
  }

  return result;
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selectedNames.value = [];
      loadData();
    }
  }
);

async function loadData(force = false) {
  if (Object.keys(groupsData.value).length === 0) {
    loading.value = true;
  }
  error.value = "";
  try {
    const res = await callApi("get_student_list", {}, { forceRefresh: force });
    if (res.status === "success") {
      groupsData.value = res.groups || {};
      const first = Object.keys(normalGroups.value)[0];
      if (first && Object.keys(openGroups.value).length === 0) {
        openGroups.value[first] = true;
      }
    } else {
      error.value = "Ma'lumot topilmadi";
    }
  } catch (e: any) {
    error.value = e.message || "Baza bilan ulanishda xatolik!";
  } finally {
    loading.value = false;
  }
}

function toggleGroupOpen(group: string) {
  openGroups.value[group] = !openGroups.value[group];
}

function isGroupAllSelected(members: string[]) {
  return members.length > 0 && members.every((m) => selectedNames.value.includes(m));
}

function toggleSelectAllGroup(members: string[]) {
  const allSel = isGroupAllSelected(members);
  if (allSel) {
    selectedNames.value = selectedNames.value.filter((n) => !members.includes(n));
  } else {
    members.forEach((m) => {
      if (!selectedNames.value.includes(m)) {
        selectedNames.value.push(m);
      }
    });
  }
}

function confirmAdd() {
  teacherStore.addFromDb(selectedNames.value, props.targetTeam || "standard");
  emit("imported", selectedNames.value.length);
  emit("update:modelValue", false);
}
</script>
