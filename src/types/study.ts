export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  hint?: string;
  extraNotes?: string;
  tags: string[];
  box: LeitnerBox;
  intervalDays: number;
  nextReviewDate: string; // ISO date string YYYY-MM-DD
  lastReviewedDate?: string;
  repetitions: number;
  lapses: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  subject: string;
  accentColor: string; // e.g., 'amber' | 'emerald' | 'indigo' | 'rose' | 'sky' | 'teal'
  createdAt: string;
  updatedAt: string;
}

export interface CornellCue {
  id: string;
  prompt: string;
  detail: string;
}

export interface CornellNote {
  id: string;
  title: string;
  subject: string;
  date: string;
  cues: CornellCue[];
  notes: string;
  summary: string;
  tags: string[];
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  estimatedMinutes: number;
  completedMinutes: number;
  dueDate: string; // YYYY-MM-DD
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
  deckId?: string;
}

export interface StudyStats {
  dailyFocusMinutes: Record<string, number>; // "YYYY-MM-DD" -> minutes
  totalCardsReviewed: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalSessions: number;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
