import { callApi } from "./api";

export const BOT_TOKEN = "7686180552:AAE1qOcFbuoPypIT_SD5T44YUg1R0YnQ8ug";
export const ADMIN_CHAT_ID = "-1003235272020";

/**
 * Sends a message via Telegram Bot API with fallback to Google Apps Script
 */
export async function sendTelegramMessage(
  text: string,
  chatId: string = ADMIN_CHAT_ID
): Promise<boolean> {
  if (!text || !text.trim()) return false;

  // 1. Direct Telegram Bot API
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (data && data.ok) {
      return true;
    }
  } catch (err) {
    console.warn("Direct Telegram API send failed, trying GAS fallback:", err);
  }

  // 2. Fallback via Google Apps Script save action
  try {
    await callApi("save", {
      text: text,
      teacher: "Bot Xabarnomasi",
      mode: "duel_notification",
      students: [],
    });
    return true;
  } catch (err) {
    console.error("Telegram fallback failed:", err);
    return false;
  }
}

/**
 * Notify Telegram channel when a duel challenge is sent
 */
export async function notifyDuelChallenged(
  challenger: string,
  target: string,
  type: "live" | "standard"
): Promise<void> {
  const typeText = type === "live" ? "🔥 Jonli doskada jang" : "📊 Dars natijalari bo'yicha jang";
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    `⚔️ <b>YANGI DUEL TAKLIFI!</b>\n\n` +
    `👤 <b>Tashabbuskor:</b> ${challenger}\n` +
    `🎯 <b>Raqib:</b> ${target}\n` +
    `🎮 <b>Turi:</b> ${typeText}\n` +
    `⏰ <b>Vaqt:</b> ${time}\n\n` +
    `⏳ <i>Raqib o'z shaxsiy profilida taklifni qabul qilishi kutilmoqda...</i>`;

  await sendTelegramMessage(text);
}

/**
 * Notify Telegram channel when a duel challenge is accepted
 */
export async function notifyDuelAccepted(
  challenger: string,
  target: string,
  type: "live" | "standard"
): Promise<void> {
  const typeText = type === "live" ? "🔥 Jonli doskada jang" : "📊 Dars natijalari bo'yicha jang";
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    `🔥 <b>DUEL QABUL QILINDI!</b>\n\n` +
    `👤 <b>Tashabbuskor:</b> ${challenger}\n` +
    `🎯 <b>Qabul qildi:</b> ${target}\n` +
    `🎮 <b>Turi:</b> ${typeText}\n` +
    `⏰ <b>Vaqt:</b> ${time}\n\n` +
    `⚡️ <b>Jang boshlanishiga tayyor!</b> Ustoz doskaga chorlashi mumkin. 🚀`;

  await sendTelegramMessage(text);
}

/**
 * Notify Telegram channel when a duel challenge is declined
 */
export async function notifyDuelDeclined(
  challenger: string,
  target: string
): Promise<void> {
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const text =
    `❌ <b>DUEL RAD ETILDI</b>\n\n` +
    `👤 <b>Tashabbuskor:</b> ${challenger}\n` +
    `🎯 <b>Raqib:</b> ${target}\n` +
    `⏰ <b>Vaqt:</b> ${time}\n\n` +
    `<i>Raqib duelda qatnashishni rad etdi.</i>`;

  await sendTelegramMessage(text);
}
