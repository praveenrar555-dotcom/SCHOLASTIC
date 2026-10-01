import React from 'react';
import { BookOpen, Flame, Clock, CheckSquare, Layers, Award, Sparkles, Volume2, Plus } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export type NavTab = 'flashcards' | 'notes' | 'timer' | 'quiz' | 'planner';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickCreate: () => void;
  isAudioPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickCreate,
  isAudioPlaying = false,
}) => {
  const { stats, cards } = useStudy();

  const dueTodayCount = cards.filter(c => {
    const today = new Date().toISOString().split('T')[0];
    return c.nextReviewDate <= today;
  }).length;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-stone-50 shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-950">
              SCHOLASTIC
            </span>
            <span className="hidden text-xs text-stone-400 sm:inline">
              Study Hub
            </span>
          </div>
        </div>

        {/* Navigation Zone: Single-row clean text links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'flashcards'
                ? 'text-stone-950 underline decoration-stone-900 decoration-2 underline-offset-8'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Flashcards</span>
            {dueTodayCount > 0 && (
              <span className="ml-1 text-xs font-mono text-amber-700">
                ({dueTodayCount})
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('notes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'notes'
                ? 'text-stone-950 underline decoration-stone-900 decoration-2 underline-offset-8'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Cornell Notes</span>
          </button>

          <button
            onClick={() => onSelectTab('timer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'timer'
                ? 'text-stone-950 underline decoration-stone-900 decoration-2 underline-offset-8'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Focus Timer</span>
            {isAudioPlaying && (
              <Volume2 className="h-3.5 w-3.5 animate-pulse text-amber-700" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'quiz'
                ? 'text-stone-950 underline decoration-stone-900 decoration-2 underline-offset-8'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Practice Exam</span>
          </button>

          <button
            onClick={() => onSelectTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              currentTab === 'planner'
                ? 'text-stone-950 underline decoration-stone-900 decoration-2 underline-offset-8'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="h-4 w-4" />
            <span>Planner & Stats</span>
          </button>
        </nav>

        {/* Action & Metric Zone */}
        <div className="flex items-center gap-4">
          {/* Subtle streak info: zero-pill, unboxed text */}
          <div className="hidden items-center gap-1 text-xs text-stone-600 md:flex">
            <Flame className="h-4 w-4 text-amber-600" />
            <span className="font-mono font-medium text-stone-900 tabular-nums">
              {stats.currentStreak}
            </span>
            <span>day streak</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-mono text-stone-900 tabular-nums">
              {stats.totalCardsReviewed}
            </span>
            <span>reviewed</span>
          </div>

          <button
            onClick={onOpenQuickCreate}
            className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-stone-50 transition-colors hover:bg-stone-800 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Item</span>
          </button>
        </div>

      </div>
    </header>
  );
};
