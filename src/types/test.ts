export type QuestionType = "mcq" | "checkbox" | "short_answer";

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  points: number;
  timeLimitSeconds?: number; // Optional per-question timer (e.g., 30s)
  correctAnswerText?: string; // For short_answer type
  explanation?: string;
  imageUrl?: string; // Question image (Base64 data URI or external URL)
}

export interface TestFolder {
  id: string; // e.g. "folder_umumiy", "folder_5_sinf", etc.
  name: string; // e.g. "Umumiy (Aralash)", "7-sinf"
  icon?: string; // e.g. "🌐", "📘", "📗", "📕"
  color?: string;
  isSystem?: boolean;
}

export interface AntiCheatConfig {
  fullscreenRequired: boolean;
  zeroTolerance: boolean; // If true: 1 single tab/blur violation disqualifies instantly
  maxWarnings: number; // e.g., 0 or 1
  blockClipboard: boolean; // Block copy, cut, paste
  blockContextMenu: boolean; // Block right click
  blockDevTools: boolean; // Block F12, Ctrl+Shift+I, etc.
  blockScreenshot: boolean; // Block PrintScreen, Snipping tool, obscure screen on blur
  shuffleQuestions: boolean; // Random shuffle questions for each student
  shuffleOptions: boolean; // Random shuffle options for each question
  showWatermark: boolean; // Dynamic moving watermark with student name & ID
  questionTimerSeconds: number; // Default per-question timer (0 if none)
}

export interface TestExam {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  published: boolean;
  timeLimitMinutes: number; // 0 = no overall limit
  questions: Question[];
  antiCheat: AntiCheatConfig;
  createdBy?: string;
  source?: "google_forms" | "manual" | "imported";
  sourceFormId?: string;
  folderId?: string; // Target folder/class section (default: "folder_umumiy")
  targetGrade?: string; // Optional class tag (e.g. "7-sinf", "Umumiy")
}

export interface ViolationEvent {
  id: string;
  timestamp: number;
  timeFormatted: string;
  type:
    | "tab_switch"
    | "fullscreen_exit"
    | "blur"
    | "screenshot_attempt"
    | "clipboard_block"
    | "context_menu"
    | "devtools_attempt";
  message: string;
}

export interface QuestionReviewItem {
  questionId: string;
  questionText: string;
  type: QuestionType;
  imageUrl?: string;
  points: number;
  earnedPoints: number;
  isCorrect: boolean;
  studentAnswer: string | string[];
  options?: QuestionOption[];
  correctAnswerText?: string;
  explanation?: string;
}

export interface ExamResult {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  disqualified: boolean;
  disqualificationReason?: string;
  violations: ViolationEvent[];
  answers: Record<string, string | string[]>;
  review?: QuestionReviewItem[];
}
