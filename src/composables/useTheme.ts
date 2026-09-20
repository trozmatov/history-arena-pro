import { ref, watch } from "vue";

const storedTheme = typeof window !== "undefined" ? localStorage.getItem("ha_theme") : null;
const initialIsDark = storedTheme !== null
  ? storedTheme === "dark"
  : typeof window !== "undefined" && window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)").matches
  : true;

export const isDark = ref<boolean>(initialIsDark);

function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (dark) {
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  }
}

// Initial application
if (typeof document !== "undefined") {
  applyTheme(isDark.value);
}

watch(
  isDark,
  (val) => {
    applyTheme(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("ha_theme", val ? "dark" : "light");
    }
  },
  { immediate: true }
);

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  function setTheme(theme: "dark" | "light") {
    isDark.value = theme === "dark";
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
  };
}
