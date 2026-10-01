import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCw, Lightbulb, CheckCircle2, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { Flashcard, Deck, ReviewRating } from '../../types/study';
import { useStudy } from '../../context/StudyContext';
import { playCardFlipSound, playCompletionChime } from '../../utils/audio';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
  filterDueOnly?: boolean;
}

export const StudySession: React.FC<StudySessionProps> = ({
  deck,
  onExit,
  filterDueOnly = false,
}) => {
  const { cards, reviewCard } = useStudy();

  const sessionCards = React.useMemo(() => {
    const deckCards = cards.filter(c => c.deckId === deck.id);
    if (!filterDueOnly) return deckCards;
    const today = new Date().toISOString().split('T')[0];
    const due = deckCards.filter(c => c.nextReviewDate <= today);
    return due.length > 0 ? due : deckCards;
  }, [cards, deck.id, filterDueOnly]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [sessionResults, setSessionResults] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const currentCard: Flashcard | undefined = sessionCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => {
      playCardFlipSound();
      return !prev;
    });
  }, []);

  const handleRating = useCallback((rating: ReviewRating) => {
    if (!currentCard) return;

    reviewCard(currentCard.id, rating);
    setSessionResults(prev => ({ ...prev, [rating]: prev[rating] + 1 }));

    if (currentIndex + 1 < sessionCards.length) {
      setIsFlipped(false);
      setShowHint(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      playCompletionChime();
    }
  }, [currentCard, currentIndex, sessionCards.length, reviewCard]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRating, isFlipped]);

  if (sessionCards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
        <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900">
          No Flashcards in this Deck
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Add flashcards to begin your active recall session.
        </p>
        <button
          onClick={onExit}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Decks</span>
        </button>
      </div>
    );
  }

  // Completion summary screen
  if (isFinished) {
    const total = sessionCards.length;
    const recalledWell = sessionResults.good + sessionResults.easy;
    const retentionRate = Math.round((recalledWell / total) * 100);

    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="mt-5 font-serif text-2xl font-bold text-stone-900">
            Session Completed!
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            You reviewed all {total} cards in <span className="font-semibold text-stone-900">{deck.title}</span>.
          </p>

          {/* Retention breakdown: unboxed editorial display */}
          <div className="mt-6 border-y border-stone-100 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500">Retention Mastery</p>
              <p className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                {retentionRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Cards Consolidated</p>
              <p className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                {total}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-6 text-xs text-stone-600">
            <div>
              <span className="font-mono font-medium text-red-700">{sessionResults.again}</span>
              <span className="ml-1">Again</span>
            </div>
            <div>
              <span className="font-mono font-medium text-amber-700">{sessionResults.hard}</span>
              <span className="ml-1">Hard</span>
            </div>
            <div>
              <span className="font-mono font-medium text-blue-700">{sessionResults.good}</span>
              <span className="ml-1">Good</span>
            </div>
            <div>
              <span className="font-mono font-medium text-emerald-700">{sessionResults.easy}</span>
              <span className="ml-1">Easy</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowHint(false);
                setIsFinished(false);
                setSessionResults({ again: 0, hard: 0, good: 0, easy: 0 });
              }}
              className="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <RotateCw className="h-4 w-4" />
              <span>Review Again</span>
            </button>
            <button
              onClick={onExit}
              className="flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-stone-50 hover:bg-stone-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Decks</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / sessionCards.length) * 100);

  return (
    <div className="mx-auto max-w-3xl py-6 px-4">
      {/* Session Top Bar */}
      <div className="flex items-center justify-between pb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">
            {deck.title}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="font-mono text-xs font-semibold text-stone-900 tabular-nums">
            {currentIndex + 1} / {sessionCards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full bg-stone-900 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* The 3D Interactive Flashcard */}
      <div className="mt-8 perspective-1000">
        <div
          onClick={handleFlip}
          className={`relative min-h-[360px] w-full cursor-pointer select-none rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-stone-300 ${
            isFlipped ? 'bg-stone-50/50' : 'bg-white'
          }`}
        >
          {/* Card metadata kicker: unboxed clean text */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-stone-700">
                {isFlipped ? 'Answer' : 'Question'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Leitner Box {currentCard.box}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentCard.intervalDays}d interval</span>
            </div>

            <div className="flex items-center gap-2 text-stone-400">
              <span className="hidden sm:inline">Press Space to flip</span>
              <RotateCw className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Card Body Content */}
          <div className="mt-8 flex flex-col justify-center min-h-[200px]">
            {!isFlipped ? (
              /* Front / Question */
              <div>
                <p className="font-serif text-2xl font-semibold leading-relaxed text-stone-950 sm:text-3xl">
                  {currentCard.question}
                </p>

                {/* Optional Hint area */}
                {currentCard.hint && (
                  <div className="mt-6">
                    {showHint ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
                        <span className="font-semibold">Memory Cue: </span>
                        {currentCard.hint}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setShowHint(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Show Memory Hint (H)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Back / Answer */
              <div className="space-y-4">
                <div className="font-sans text-base leading-relaxed text-stone-800 whitespace-pre-line sm:text-lg">
                  {currentCard.answer}
                </div>

                {currentCard.extraNotes && (
                  <div className="mt-4 border-t border-stone-200/80 pt-3 text-xs text-stone-500">
                    <span className="font-semibold text-stone-700">Context: </span>
                    {currentCard.extraNotes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {currentCard.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-stone-500">
              {currentCard.tags.map((tag, i) => (
                <span key={i}>
                  #{tag}
                  {i < currentCard.tags.length - 1 && <span className="ml-2 text-stone-300">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leitner Rating Controls */}
      <div className="mt-6">
        {isFlipped ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleRating('again')}
                className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-3 text-red-900 transition-all hover:bg-red-100 hover:border-red-300"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  [1] Again
                </span>
                <span className="mt-0.5 text-xs text-red-700 font-mono">
                  &lt;1 day
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRating('hard')}
                className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-amber-900 transition-all hover:bg-amber-100 hover:border-amber-300"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  [2] Hard
                </span>
                <span className="mt-0.5 text-xs text-amber-700 font-mono">
                  +{Math.round(currentCard.intervalDays * 1.2)}d
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRating('good')}
                className="flex flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-blue-900 transition-all hover:bg-blue-100 hover:border-blue-300"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  [3] Good
                </span>
                <span className="mt-0.5 text-xs text-blue-700 font-mono">
                  +{Math.min(30, currentCard.intervalDays * 2 || 3)}d
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleRating('easy')}
                className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-emerald-900 transition-all hover:bg-emerald-100 hover:border-emerald-300"
              >
                <span className="text-xs font-semibold uppercase tracking-wider">
                  [4] Easy
                </span>
                <span className="mt-0.5 text-xs text-emerald-700 font-mono">
                  +{Math.min(45, currentCard.intervalDays * 3 || 7)}d
                </span>
              </button>
            </div>
            <p className="text-center text-xs text-stone-500">
              Select your recall confidence or use keys 1, 2, 3, 4
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleFlip}
              className="flex items-center gap-2 rounded-xl bg-stone-900 px-8 py-3 text-sm font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>Reveal Answer</span>
              <span className="text-xs font-mono text-stone-400">(Space)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
