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

/**
 * Notify Telegram channel when a duel battle finishes
 */
export async function notifyDuelResult(
  p1Name: string,
  p1Score: number,
  p2Name: string,
  p2Score: number
): Promise<boolean> {
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let winnerText = "";
  if (p1Score > p2Score) {
    winnerText = `🏆 G'olib: <b>${p1Name}</b>! 🎉`;
  } else if (p2Score > p1Score) {
    winnerText = `🏆 G'olib: <b>${p2Name}</b>! 🎉`;
  } else {
    winnerText = `🤝 Durrang! Har ikki raqib munosib kurashdi.`;
  }

  const text =
    `⚔️ <b>DUEL YAKUNLANDI!</b>\n\n` +
    `🔴 <b>${p1Name}</b>: ${p1Score} ball\n` +
    `🔵 <b>${p2Name}</b>: ${p2Score} ball\n\n` +
    `${winnerText}\n` +
    `⏰ Vaqt: ${time}`;

  return await sendTelegramMessage(text);
}

/**
 * Notify Telegram channel when a team battle finishes
 */
export async function notifyTeamBattleResult(
  team1Name: string,
  score1: number,
  team2Name: string,
  score2: number,
  team1Members?: string[],
  team2Members?: string[]
): Promise<boolean> {
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let winnerText = "";
  if (score1 > score2) {
    winnerText = `🏆 G'olib jamoa: <b>${team1Name}</b>! 🎉`;
  } else if (score2 > score1) {
    winnerText = `🏆 G'olib jamoa: <b>${team2Name}</b>! 🎉`;
  } else {
    winnerText = `🤝 Durrang! Har ikki jamoa teng natija ko'rsatdi.`;
  }

  let text =
    `🚩 <b>JAMOAVIY JANG YAKUNLANDI!</b>\n\n` +
    `🔴 <b>${team1Name}</b>: ${score1} ball\n` +
    `🔵 <b>${team2Name}</b>: ${score2} ball\n\n` +
    `${winnerText}\n`;

  if (team1Members && team1Members.length > 0) {
    text += `\n👥 <b>${team1Name}:</b> ${team1Members.join(", ")}`;
  }
  if (team2Members && team2Members.length > 0) {
    text += `\n👥 <b>${team2Name}:</b> ${team2Members.join(", ")}`;
  }
  text += `\n\n⏰ Vaqt: ${time}`;

  return await sendTelegramMessage(text);
}
