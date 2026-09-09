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

/**
 * Notify Telegram channel/group when a new AI Challenge is launched
 */
export async function notifyChallengeLaunched(params: {
  title: string;
  topic: string;
  group?: string;
  questionCount: number;
  deadlineFormatted: string;
  rewards: {
    cashPrize?: string;
    coins?: number;
    specialPerk?: string;
  };
}): Promise<boolean> {
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let rewardLines = "";
  const cp = (params.rewards.cashPrize || "").trim();
  const isValidCash = cp && cp !== "0" && cp !== "0 so'm" && cp !== "0 som" && !cp.toLowerCase().startsWith("yo'q");
  if (isValidCash) {
    rewardLines += `\n💰 <b>Pul mukofoti:</b> ${cp}`;
  }
  if (params.rewards.coins) {
    rewardLines += `\n🪙 <b>Tangalar:</b> +${params.rewards.coins} coin`;
  }
  const perk = (params.rewards.specialPerk || "").trim();
  if (perk && !perk.toLowerCase().startsWith("yo'q")) {
    rewardLines += `\n🛡️ <b>Maxsus Imtiyoz:</b> ${perk}`;
  }
  if (!rewardLines) {
    rewardLines = "\n🎁 Faxriy sertifikat va guruh reytingi!";
  }

  const text =
    `🔥 <b>YANGI CHELLENJ E'LON QILINDI!</b> 🏆\n\n` +
    `📌 <b>Mavzu:</b> ${params.title}\n` +
    `📖 <b>Bo'lim:</b> ${params.topic}\n` +
    `👥 <b>Guruh:</b> ${params.group || "Barcha guruhlar"}\n` +
    `❓ <b>Savollar:</b> ${params.questionCount} ta test\n` +
    `⏳ <b>Muddati (Deadline):</b> <b>${params.deadlineFormatted}</b> gacha\n\n` +
    `🎁 <b>G'OLIBLAR UCHUN MUKOFOT:</b>${rewardLines}\n\n` +
    `⚡️ <i>O'quvchilar o'z shaxsiy kabinetiga kirib, chellenjda qatnashishi va peshqadamlar jadvalida (Leaderboard) 1-o'rinni egallashi mumkin! Shoshiling!</i> 🚀\n` +
    `⏰ E'lon vaqti: ${time}`;

  return await sendTelegramMessage(text);
}

/**
 * Notify Telegram channel/group when a Challenge finishes and winners are determined
 */
export async function notifyChallengeCompleted(params: {
  title: string;
  topic: string;
  group?: string;
  rewards: {
    cashPrize?: string;
    coins?: number;
    specialPerk?: string;
  };
  topParticipants: {
    rank: number;
    studentName: string;
    score: number;
    timeFormatted: string;
  }[];
}): Promise<boolean> {
  const time = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let winnersText = "";
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
  if (params.topParticipants.length > 0) {
    params.topParticipants.forEach((p, idx) => {
      const medal = medals[idx] || "🎖️";
      winnersText += `\n${medal} <b>${p.studentName}</b> — ${p.score} ball (${p.timeFormatted})`;
    });
  } else {
    winnersText = "\n<i>Hech kim ushbu chellenjda qatnashmadi.</i>";
  }

  let prizeSummary = "";
  if (params.topParticipants.length > 0) {
    const winner = params.topParticipants[0];
    prizeSummary = `\n\n👑 <b>Bosh sovrin sohibi:</b> <b>${winner.studentName}</b>! 🎉`;
    const cp = (params.rewards.cashPrize || "").trim();
    if (cp && cp !== "0" && cp !== "0 so'm" && cp !== "0 som" && !cp.toLowerCase().startsWith("yo'q")) {
      prizeSummary += `\n💰 Pul mukofoti: ${cp}`;
    }
    const perk = (params.rewards.specialPerk || "").trim();
    if (perk && !perk.toLowerCase().startsWith("yo'q")) {
      prizeSummary += `\n🛡️ Imtiyoz: ${perk}`;
    }
  }

  const text =
    `🏁 <b>CHELLENJ YAKUNLANDI! G'OLIBLAR ANIQLANDI!</b> 🏆\n\n` +
    `📌 <b>Chellenj:</b> ${params.title}\n` +
    `📖 <b>Mavzu:</b> ${params.topic}\n\n` +
    `📊 <b>Peshqadamlar Natijasi:</b>${winnersText}${prizeSummary}\n\n` +
    `👏 <i>Barcha ishtirokchilarga tashakkur! Keyingi chellenjlarda g'olib bo'lishga harakat qiling!</i> 🚀\n` +
    `⏰ Yakunlangan vaqt: ${time}`;

  return await sendTelegramMessage(text);
}

