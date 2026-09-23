/**
 * Google Forms API Import Controller & Anti-Cheating Secure Grading Service
 * History Arena PRO
 */

import express from "express";
import cors from "cors";

export const formsRouter = express.Router();

/**
 * In-memory / DB storage mock for secure tests and answer keys.
 * In production, connect this to PostgreSQL, MongoDB, or Firebase Firestore.
 */
const secureTestDatabase = new Map();
const testResultsDatabase = new Map();

/**
 * 1. GOOGLE FORMS API IMPORT CONTROLLER
 * POST /api/forms/import
 * Body: { formId: string, oauthToken: string }
 */
formsRouter.post("/import", async (req, res) => {
  try {
    const { formId, oauthToken } = req.body;

    if (!formId) {
      return res.status(400).json({
        success: false,
        error: "Google Forms ID ko'rsatilmadi (formId is required)",
      });
    }

    if (!oauthToken) {
      return res.status(401).json({
        success: false,
        error: "Google OAuth Access Token talab qilinadi (oauthToken is required)",
      });
    }

    // Call Google Forms API v1
    const googleApiUrl = `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`;
    const response = await fetch(googleApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Google Forms API xatoligi (${response.status}): ${errText}`,
      });
    }

    const formData = await response.json();

    // Map Google Forms data to our clean schema
    const parsedExam = parseGoogleFormData(formData, formId);

    // Save full test (including answer key) securely on backend
    secureTestDatabase.set(parsedExam.id, parsedExam);

    return res.json({
      success: true,
      message: "Google Form muvaffaqiyatli import qilindi",
      data: parsedExam,
    });
  } catch (error) {
    console.error("Google Forms import xatosi:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Google Forms import jarayonida server xatosi",
    });
  }
});

/**
 * 2. TESTNI SAQLASH (TEACHER)
 * POST /api/tests/save
 */
formsRouter.post("/save", (req, res) => {
  try {
    const testData = req.body;
    if (!testData || !testData.id) {
      return res.status(400).json({ success: false, error: "Test ID mavjud emas" });
    }

    testData.updatedAt = Date.now();
    secureTestDatabase.set(testData.id, testData);

    return res.json({
      success: true,
      message: "Test muvaffaqiyatli saqlandi",
      testId: testData.id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. TALABALAR UCHUN TESTNI OLISH (TO'G'RI JAVOBLARSIZ!)
 * GET /api/tests/:testId/take
 * Security Rule: Statically strips correct answers before sending to student's browser!
 */
formsRouter.get("/:testId/take", (req, res) => {
  try {
    const { testId } = req.params;
    const test = secureTestDatabase.get(testId);

    if (!test) {
      return res.status(404).json({ success: false, error: "Test topilmadi" });
    }

    if (!test.published) {
      return res.status(403).json({ success: false, error: "Ushbu test hali e'lon qilinmagan" });
    }

    // Create sanitized version without answer keys
    const sanitizedTest = {
      id: test.id,
      title: test.title,
      description: test.description,
      timeLimitMinutes: test.timeLimitMinutes,
      antiCheat: test.antiCheat,
      questions: test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        points: q.points,
        timeLimitSeconds: q.timeLimitSeconds,
        // Options WITHOUT isCorrect flags!
        options: q.options?.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      })),
    };

    return res.json({
      success: true,
      data: sanitizedTest,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. TEST TOPSHIRISH VA XAVFSIZ BAHOLASH (SECURE GRADING)
 * POST /api/tests/:testId/submit
 * Body: { studentId, studentName, answers: { [questionId]: answerValue }, violations: [] }
 */
formsRouter.post("/:testId/submit", (req, res) => {
  try {
    const { testId } = req.params;
    const { studentId, studentName, answers, violations = [], startedAt } = req.body;

    const test = secureTestDatabase.get(testId);
    if (!test) {
      return res.status(404).json({ success: false, error: "Test topilmadi" });
    }

    let earnedScore = 0;
    let totalPoints = 0;
    const evaluatedQuestions = [];

    // Verify each question against secure server-side answer key
    for (const q of test.questions) {
      totalPoints += q.points || 1;
      const studentAns = answers ? answers[q.id] : null;
      let isCorrect = false;

      if (q.type === "mcq") {
        // Single correct choice
        const correctOpt = q.options?.find((o) => o.isCorrect);
        isCorrect = correctOpt && correctOpt.id === studentAns;
      } else if (q.type === "checkbox") {
        // Multiple choice checkboxes
        const correctOptIds = (q.options || []).filter((o) => o.isCorrect).map((o) => o.id);
        const studentAnsList = Array.isArray(studentAns) ? studentAns : [];
        isCorrect =
          correctOptIds.length === studentAnsList.length &&
          correctOptIds.every((id) => studentAnsList.includes(id));
      } else if (q.type === "short_answer") {
        // Short text matching (trimmed, case-insensitive)
        const expected = (q.correctAnswerText || "").trim().toLowerCase();
        const given = typeof studentAns === "string" ? studentAns.trim().toLowerCase() : "";
        isCorrect = expected.length > 0 && expected === given;
      }

      if (isCorrect) {
        earnedScore += q.points || 1;
      }

      evaluatedQuestions.push({
        questionId: q.id,
        isCorrect,
        pointsEarned: isCorrect ? q.points || 1 : 0,
        pointsPossible: q.points || 1,
      });
    }

    const percentage = totalPoints > 0 ? Math.round((earnedScore / totalPoints) * 100) : 0;
    const isDisqualified =
      test.antiCheat?.zeroTolerance &&
      violations.some((v) => v.type === "tab_switch" || v.type === "blur" || v.type === "fullscreen_exit");

    const result = {
      id: "res_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      testId,
      testTitle: test.title,
      studentId: studentId || "unknown",
      studentName: studentName || "O'quvchi",
      score: earnedScore,
      totalPoints,
      percentage,
      passed: percentage >= 60 && !isDisqualified,
      disqualified: isDisqualified,
      disqualificationReason: isDisqualified
        ? "Anti-cheating nol toleransiya qoidasi buzildi (tab almashtirish yoki ekrandan chiqish)"
        : null,
      startedAt: startedAt || Date.now(),
      completedAt: Date.now(),
      violations,
      evaluatedQuestions,
    };

    // Save result to DB
    testResultsDatabase.set(result.id, result);

    return res.json({
      success: true,
      message: isDisqualified ? "Test qoidabuzarlik sababli to'xtatildi" : "Test muvaffaqiyatli baholandi",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Parser: Google Forms v1 Schema -> Clean Platform JSON
 */
function parseGoogleFormData(formData, formId) {
  const info = formData.info || {};
  const items = formData.items || [];

  const questions = [];

  for (const item of items) {
    // Only process question items
    if (!item.questionItem) continue;

    const qItem = item.questionItem;
    const question = qItem.question || {};
    const grading = question.grading || {};

    let qType = "mcq";
    const options = [];
    let correctAnswerText = "";

    // Multiple Choice / Checkbox
    if (question.choiceQuestion) {
      const choiceQ = question.choiceQuestion;
      if (choiceQ.type === "CHECKBOX") {
        qType = "checkbox";
      } else {
        qType = "mcq";
      }

      const correctSet = new Set(
        (grading.correctAnswers?.answers || []).map((a) => a.value)
      );

      (choiceQ.options || []).forEach((opt, idx) => {
        const optText = opt.value || `Variant ${idx + 1}`;
        options.push({
          id: `opt_${idx + 1}`,
          text: optText,
          isCorrect: correctSet.has(optText),
        });
      });
    } else if (question.textQuestion) {
      qType = "short_answer";
      const correctAns = grading.correctAnswers?.answers?.[0]?.value || "";
      correctAnswerText = correctAns;
    }

    // Default points: 1 if grading not specified
    const points = typeof grading.pointValue === "number" ? grading.pointValue : 1;

    questions.push({
      id: question.questionId || `q_${Date.now()}_${questions.length + 1}`,
      text: item.title || "Savol matni",
      type: qType,
      options,
      points: points || 1,
      timeLimitSeconds: 30, // Default 30s per question
      correctAnswerText,
      explanation: item.description || "",
    });
  }

  return {
    id: `gf_${formId}`,
    title: info.title || "Google Forms Testi",
    description: info.description || "Google Forms orqali import qilingan test",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: true,
    timeLimitMinutes: Math.max(5, Math.ceil((questions.length * 45) / 60)), // 45 seconds per question approx
    questions,
    antiCheat: {
      fullscreenRequired: true,
      zeroTolerance: true, // User requested zero tolerance for tab switch
      maxWarnings: 0,
      blockClipboard: true,
      blockContextMenu: true,
      blockDevTools: true,
      blockScreenshot: true,
      shuffleQuestions: true,
      shuffleOptions: true,
      showWatermark: true,
      questionTimerSeconds: 30,
    },
    source: "google_forms",
    sourceFormId: formId,
  };
}
