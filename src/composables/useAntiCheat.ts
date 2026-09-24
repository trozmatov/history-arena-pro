/**
 * Ultra-Strict Anti-Cheating & Screenshot Prevention Composable
 * History Arena PRO
 */

import { ref, reactive, onUnmounted } from "vue";
import type { AntiCheatConfig, ViolationEvent } from "../types/test";

export interface AntiCheatOptions {
  config: AntiCheatConfig;
  studentName: string;
  studentId: string;
  onDisqualified?: (reason: string, violations: ViolationEvent[]) => void;
  onViolation?: (violation: ViolationEvent) => void;
}

function extractCleanString(val: any, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val.trim();
  if (typeof val === "object") {
    if (typeof val.value === "string") return val.value.trim();
    if (typeof val.name === "string") return val.name.trim();
  }
  const str = String(val);
  return str === "[object Object]" ? fallback : str;
}

export function useAntiCheat(options: AntiCheatOptions) {
  const { config, studentName, studentId, onDisqualified, onViolation } = options;

  const safeName = extractCleanString(studentName, "O'quvchi");
  const safeId = extractCleanString(studentId, "std");

  const isActive = ref(false);
  const isFullscreen = ref(false);
  const isObscured = ref(false); // Screen is obscured/blackened on blur or screenshot
  const isDisqualified = ref(false);
  const disqualificationReason = ref("");
  const violations = ref<ViolationEvent[]>([]);

  // Grace period flag during initial fullscreen transition (prevents OS space-switch false triggers)
  const isStabilizing = ref(false);
  let stabilizationTimer: any = null;

  // Watermark text updated in real time (shows Student Name + Timestamp)
  const watermarkText = ref(`${safeName} • ${formatTime()}`);
  let watermarkInterval: any = null;

  function formatTime(d = new Date()) {
    return d.toTimeString().split(" ")[0];
  }

  function recordViolation(
    type: ViolationEvent["type"],
    message: string
  ) {
    if (!isActive.value || isDisqualified.value || isStabilizing.value) return;

    const event: ViolationEvent = {
      id: "v_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      timeFormatted: formatTime(),
      type,
      message,
    };

    violations.value.push(event);
    if (onViolation) onViolation(event);

    // ZERO TOLERANCE RULE: Any tab switch, blur, or screenshot attempt immediately disqualifies!
    const isZeroToleranceTrigger =
      config.zeroTolerance &&
      (type === "tab_switch" || type === "blur" || type === "fullscreen_exit" || type === "screenshot_attempt");

    const exceedsMaxWarnings =
      config.maxWarnings > 0 && violations.value.length > config.maxWarnings;

    if (isZeroToleranceTrigger || exceedsMaxWarnings) {
      triggerDisqualification(message);
    }
  }

  function triggerDisqualification(reason: string) {
    if (isDisqualified.value) return;
    isDisqualified.value = true;
    disqualificationReason.value = reason;
    isObscured.value = true;

    // Immediately clear clipboard
    clearClipboard();

    if (onDisqualified) {
      onDisqualified(reason, violations.value);
    }
  }

  async function clearClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText("");
      }
    } catch (e) {
      // Ignore security policy errors in non-focused tabs
    }
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  // 1. Fullscreen Change
  function handleFullscreenChange() {
    if (!isActive.value) return;
    const isNowFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    isFullscreen.value = isNowFullscreen;

    // Ignore fullscreen exit checks during stabilization
    if (isStabilizing.value) return;

    if (config.fullscreenRequired && !isNowFullscreen) {
      recordViolation(
        "fullscreen_exit",
        "To'liq ekran (Fullscreen) rejimidan chiqildi!"
      );
    }
  }

  // 2. Tab Visibility Change (Tab Switch Detection)
  function handleVisibilityChange() {
    if (!isActive.value || isStabilizing.value) return;

    if (document.hidden) {
      // The student switched to another tab!
      isObscured.value = true;
      clearClipboard();
      recordViolation(
        "tab_switch",
        "Boshqa tab yoki oynaga o'tish aniqlandi! (Qat'iy taqiqlangan)"
      );
    } else {
      // Student returned
      if (!isDisqualified.value) {
        isObscured.value = false;
      }
    }
  }

  // 3. Window Blur (App Switch / Snipping Tool / Multi-Window Detection)
  function handleWindowBlur() {
    if (!isActive.value || isStabilizing.value) return;

    // Millisecond-level screen obscuring to defeat external screenshot tools
    isObscured.value = true;
    clearClipboard();

    recordViolation(
      "blur",
      "Dastur fokusdan chiqdi (boshqa ilova yoki dasturga o'tish aniqlandi)!"
    );
  }

  function handleWindowFocus() {
    if (!isActive.value) return;
    if (!isDisqualified.value) {
      isObscured.value = false;
    }
  }

  function dismissObscured() {
    if (!isDisqualified.value) {
      isObscured.value = false;
    }
  }

  // 4. Keyboard Shortcuts & Screenshot Key Interception
  function handleKeyDown(e: KeyboardEvent) {
    if (!isActive.value) return;

    const key = e.key;
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // Screenshot Keys: PrintScreen
    if (key === "PrintScreen") {
      e.preventDefault();
      isObscured.value = true;
      clearClipboard();
      recordViolation(
        "screenshot_attempt",
        "PrintScreen tugmasi orqali skrinshot olishga urinish aniqlandi!"
      );
      return;
    }

    // Windows Snipping Tool: Win + Shift + S OR Ctrl + Shift + S
    if (isShift && isCtrlOrCmd && (key === "S" || key === "s")) {
      e.preventDefault();
      isObscured.value = true;
      clearClipboard();
      recordViolation(
        "screenshot_attempt",
        "Skrinshot vositasi (Snipping Tool) ishlatishga urinish aniqlandi!"
      );
      return;
    }

    // Mac Screenshot: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
    if (e.metaKey && isShift && ["3", "4", "5", "#", "$", "%"].includes(key)) {
      e.preventDefault();
      isObscured.value = true;
      clearClipboard();
      recordViolation(
        "screenshot_attempt",
        "macOS skrinshot kombinatsiyasi (Cmd+Shift+3/4/5) aniqlandi!"
      );
      return;
    }

    // DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (config.blockDevTools) {
      if (
        key === "F12" ||
        (isCtrlOrCmd && isShift && ["I", "i", "J", "j", "C", "c"].includes(key)) ||
        (isCtrlOrCmd && (key === "U" || key === "u"))
      ) {
        e.preventDefault();
        recordViolation("devtools_attempt", "Dasturchi vositalari (DevTools / F12) bloklandi!");
        return;
      }
    }

    // Clipboard: Copy, Cut, Paste
    if (config.blockClipboard) {
      const isInput = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if (isCtrlOrCmd && ["c", "C", "v", "V", "x", "X", "p", "P"].includes(key)) {
        e.preventDefault();
        clearClipboard();
        recordViolation("clipboard_block", "Nusxa olish yoki kiritish (Copy/Paste) bloklandi!");
        return;
      }
      if (!isInput && isCtrlOrCmd && (key === "a" || key === "A")) {
        e.preventDefault();
        return;
      }
    }

    // Alt + Tab or Alt + F4
    if (isAlt && (key === "Tab" || key === "F4")) {
      e.preventDefault();
      recordViolation("tab_switch", "Oynalarni almashtirish (Alt+Tab) bloklandi!");
      return;
    }
  }

  // 5. Context Menu (Right Click)
  function handleContextMenu(e: MouseEvent) {
    if (!isActive.value || !config.blockContextMenu) return;
    e.preventDefault();
    recordViolation("context_menu", "Sichqonchaning o'ng tugmasi bloklandi!");
  }

  // 6. Text Selection & Drag Prevention
  function handleSelectStart(e: Event) {
    if (!isActive.value) return;
    const target = e.target as HTMLElement;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return;
    }
    e.preventDefault();
  }

  function handleDragStart(e: DragEvent) {
    if (!isActive.value) return;
    e.preventDefault();
  }

  // ==========================================
  // LIFECYCLE CONTROLS
  // ==========================================

  async function startMonitoring(): Promise<boolean> {
    isActive.value = true;
    isDisqualified.value = false;
    isObscured.value = false;
    violations.value = [];

    // Set 1.5 second stabilization period so OS fullscreen animation doesn't trigger false blur/switch
    isStabilizing.value = true;
    if (stabilizationTimer) clearTimeout(stabilizationTimer);
    stabilizationTimer = setTimeout(() => {
      isStabilizing.value = false;
    }, 1500);

    // Attempt Fullscreen
    if (config.fullscreenRequired) {
      try {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
        isFullscreen.value = true;
      } catch (err) {
        console.warn("Fullscreen permission denied or not supported:", err);
      }
    }

    // Attach listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    // Update dynamic watermark every 2 seconds
    watermarkInterval = setInterval(() => {
      watermarkText.value = `${safeName} • ${formatTime()}`;
    }, 2000);

    return true;
  }

  function stopMonitoring() {
    isActive.value = false;
    isObscured.value = false;
    isStabilizing.value = false;

    if (stabilizationTimer) {
      clearTimeout(stabilizationTimer);
      stabilizationTimer = null;
    }

    // Detach listeners
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
    window.removeEventListener("keydown", handleKeyDown, true);
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("selectstart", handleSelectStart);
    document.removeEventListener("dragstart", handleDragStart);

    if (watermarkInterval) {
      clearInterval(watermarkInterval);
      watermarkInterval = null;
    }

    // Exit Fullscreen if active
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch (e) {}
    }
  }

  onUnmounted(() => {
    stopMonitoring();
  });

  return {
    isActive,
    isFullscreen,
    isObscured,
    isDisqualified,
    disqualificationReason,
    violations,
    watermarkText,
    dismissObscured,
    startMonitoring,
    stopMonitoring,
    triggerDisqualification,
  };
}
