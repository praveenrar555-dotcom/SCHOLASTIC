import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Deck, Flashcard, CornellNote, StudyTask, QuizQuestion, StudyStats, ReviewRating } from '../types/study';
import { INITIAL_DECKS, INITIAL_CARDS, INITIAL_NOTES, INITIAL_QUIZ, INITIAL_TASKS, INITIAL_STATS } from '../data/initialData';

interface StudyContextType {
  decks: Deck[];
  cards: Flashcard[];
  notes: CornellNote[];
  tasks: StudyTask[];
  quizzes: QuizQuestion[];
  stats: StudyStats;
  activeDeckId: string | null;
  setActiveDeckId: (id: string | null) => void;
  // Flashcard actions
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  addCard: (card: Omit<Flashcard, 'id' | 'box' | 'intervalDays' | 'nextReviewDate' | 'repetitions' | 'lapses'>) => string;
  updateCard: (id: string, updates: Partial<Flashcard>) => void;
  deleteCard: (id: string) => void;
  reviewCard: (cardId: string, rating: ReviewRating) => void;
  // Cornell Note actions
  addNote: (note: Omit<CornellNote, 'id' | 'date'>) => string;
  updateNote: (id: string, updates: Partial<CornellNote>) => void;
  deleteNote: (id: string) => void;
  convertCuesToFlashcards: (noteId: string, deckId: string) => number;
  // Task actions
  addTask: (task: Omit<StudyTask, 'id' | 'completed' | 'completedMinutes'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  // Quiz actions
  addQuizQuestion: (question: Omit<QuizQuestion, 'id'>) => void;
  // Study stats & focus tracking
  logFocusMinutes: (minutes: number) => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DECKS: 'scholastic_study_decks_v1',
  CARDS: 'scholastic_study_cards_v1',
  NOTES: 'scholastic_study_notes_v1',
  TASKS: 'scholastic_study_tasks_v1',
  QUIZ: 'scholastic_study_quiz_v1',
  STATS: 'scholastic_study_stats_v1',
};

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DECKS);
      return saved ? JSON.parse(saved) : INITIAL_DECKS;
    } catch {
      return INITIAL_DECKS;
    }
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [notes, setNotes] = useState<CornellNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUIZ);
      return saved ? JSON.parse(saved) : INITIAL_QUIZ;
    } catch {
      return INITIAL_QUIZ;
    }
  });

  const [stats, setStats] = useState<StudyStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATS);
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks)); } catch { /* ignore */ }
  }, [decks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards)); } catch { /* ignore */ }
  }, [cards]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); } catch { /* ignore */ }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); } catch { /* ignore */ }
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(quizzes)); } catch { /* ignore */ }
  }, [quizzes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); } catch { /* ignore */ }
  }, [stats]);

  // Deck operations
  const addDeck = (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `deck-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newDeck: Deck = {
      ...deckData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setDecks(prev => [newDeck, ...prev]);
    return id;
  };

  const updateDeck = (id: string, updates: Partial<Deck>) => {
    setDecks(prev =>
      prev.map(deck =>
        deck.id === id ? { ...deck, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : deck
      )
    );
  };

  const deleteDeck = (id: string) => {
    setDecks(prev => prev.filter(d => d.id !== id));
    setCards(prev => prev.filter(c => c.deckId !== id));
    if (activeDeckId === id) setActiveDeckId(null);
  };

  // Card operations
  const addCard = (cardData: Omit<Flashcard, 'id' | 'box' | 'intervalDays' | 'nextReviewDate' | 'repetitions' | 'lapses'>): string => {
    const id = `card-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      ...cardData,
      id,
      box: 1,
      intervalDays: 1,
      nextReviewDate: today,
      repetitions: 0,
      lapses: 0,
    };
    setCards(prev => [...prev, newCard]);
    return id;
  };

  const updateCard = (id: string, updates: Partial<Flashcard>) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  // Leitner Spaced Repetition calculation
  const reviewCard = (cardId: string, rating: ReviewRating) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setCards(prev =>
      prev.map(card => {
        if (card.id !== cardId) return card;

        let nextBox = card.box;
        let nextInterval = 1;
        let nextLapses = card.lapses;
        const nextRepetitions = card.repetitions + 1;

        if (rating === 'again') {
          // Failed recall: drop back to Box 1, review tomorrow, record lapse
          nextBox = 1;
          nextInterval = 1;
          nextLapses += 1;
        } else if (rating === 'hard') {
          // Stumbled but recalled: maintain box, slightly expand interval
          nextInterval = Math.max(1, Math.round(card.intervalDays * 1.2));
        } else if (rating === 'good') {
          // Normal recall: advance by 1 box (max 5)
          nextBox = Math.min(5, (card.box + 1) as 1 | 2 | 3 | 4 | 5) as 1 | 2 | 3 | 4 | 5;
          // Progression: Box 1 -> 1d, Box 2 -> 3d, Box 3 -> 7d, Box 4 -> 14d, Box 5 -> 30d
          const boxIntervals: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
          nextInterval = boxIntervals[nextBox] || 7;
        } else if (rating === 'easy') {
          // Effortless recall: advance by 2 boxes (max 5)
          nextBox = Math.min(5, (card.box + 2) as 1 | 2 | 3 | 4 | 5) as 1 | 2 | 3 | 4 | 5;
          const easyIntervals: Record<number, number> = { 1: 2, 2: 5, 3: 10, 4: 21, 5: 45 };
          nextInterval = easyIntervals[nextBox] || 14;
        }

        const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString().split('T')[0];

        return {
          ...card,
          box: nextBox,
          intervalDays: nextInterval,
          nextReviewDate: nextDate,
          lastReviewedDate: todayStr,
          repetitions: nextRepetitions,
          lapses: nextLapses,
        };
      })
    );

    // Update study statistics
    setStats(prev => {
      const isNewActiveDay = prev.lastActiveDate !== todayStr;
      let newStreak = prev.currentStreak;
      if (isNewActiveDay) {
        const lastDate = new Date(prev.lastActiveDate);
        const curDate = new Date(todayStr);
        const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }
      return {
        ...prev,
        totalCardsReviewed: prev.totalCardsReviewed + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: todayStr,
      };
    });
  };

  // Cornell Notes operations
  const addNote = (noteData: Omit<CornellNote, 'id' | 'date'>): string => {
    const id = `note-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newNote: CornellNote = {
      ...noteData,
      id,
      date: today,
    };
    setNotes(prev => [newNote, ...prev]);
    return id;
  };

  const updateNote = (id: string, updates: Partial<CornellNote>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const convertCuesToFlashcards = (noteId: string, targetDeckId: string): number => {
    const note = notes.find(n => n.id === noteId);
    if (!note || note.cues.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const newCards: Flashcard[] = note.cues.map((cue, idx) => ({
      id: `card-from-note-${Date.now()}-${idx}`,
      deckId: targetDeckId,
      question: cue.prompt,
      answer: cue.detail,
      hint: `From Cornell note: ${note.title}`,
      extraNotes: `Source subject: ${note.subject}`,
      tags: [...note.tags, 'Cornell Recall'],
      box: 1,
      intervalDays: 1,
      nextReviewDate: todayStr,
      repetitions: 0,
      lapses: 0,
    }));

    setCards(prev => [...prev, ...newCards]);
    return newCards.length;
  };

  // Task operations
  const addTask = (taskData: Omit<StudyTask, 'id' | 'completed' | 'completedMinutes'>) => {
    const id = `task-${Date.now()}`;
    const newTask: StudyTask = {
      ...taskData,
      id,
      completed: false,
      completedMinutes: 0,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addQuizQuestion = (questionData: Omit<QuizQuestion, 'id'>) => {
    const id = `quiz-${Date.now()}`;
    setQuizzes(prev => [...prev, { ...questionData, id }]);
  };

  const logFocusMinutes = (minutes: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const currentToday = prev.dailyFocusMinutes[todayStr] || 0;
      return {
        ...prev,
        dailyFocusMinutes: {
          ...prev.dailyFocusMinutes,
          [todayStr]: currentToday + minutes,
        },
        totalSessions: prev.totalSessions + 1,
        lastActiveDate: todayStr,
      };
    });
  };

  const exportDataJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      decks,
      cards,
      notes,
      tasks,
      quizzes,
      stats,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scholastic-study-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.decks && Array.isArray(parsed.decks)) setDecks(parsed.decks);
      if (parsed.cards && Array.isArray(parsed.cards)) setCards(parsed.cards);
      if (parsed.notes && Array.isArray(parsed.notes)) setNotes(parsed.notes);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.quizzes && Array.isArray(parsed.quizzes)) setQuizzes(parsed.quizzes);
      if (parsed.stats) setStats(parsed.stats);
      return true;
    } catch (e) {
      console.error('Failed to parse import data:', e);
      return false;
    }
  };

  const resetAllData = () => {
    setDecks(INITIAL_DECKS);
    setCards(INITIAL_CARDS);
    setNotes(INITIAL_NOTES);
    setTasks(INITIAL_TASKS);
    setQuizzes(INITIAL_QUIZ);
    setStats(INITIAL_STATS);
    localStorage.removeItem(STORAGE_KEYS.DECKS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ);
    localStorage.removeItem(STORAGE_KEYS.STATS);
  };

  return (
    <StudyContext.Provider
      value={{
        decks,
        cards,
        notes,
        tasks,
        quizzes,
        stats,
        activeDeckId,
        setActiveDeckId,
        addDeck,
        updateDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        reviewCard,
        addNote,
        updateNote,
        deleteNote,
        convertCuesToFlashcards,
        addTask,
        toggleTask,
        deleteTask,
        addQuizQuestion,
        logFocusMinutes,
        exportDataJSON,
        importDataJSON,
        resetAllData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
