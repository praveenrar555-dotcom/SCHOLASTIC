import React, { useState } from 'react';
import { Play, Plus, Eye, Edit2, Trash2, BookOpen, Bookmark, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { Deck, Flashcard } from '../../types/study';
import { playCardFlipSound } from '../../utils/audio';

interface Book3DCardProps {
  deck: Deck;
  cards: Flashcard[];
  dueCards: Flashcard[];
  onStartStudy: (deck: Deck, dueOnly?: boolean) => void;
  onOpenNewCardModal: (deckId?: string) => void;
  onOpenDeckModal: (deck?: Deck) => void;
  onEditCardModal: (card: Flashcard) => void;
  onDeleteDeck: (id: string) => void;
  onDeleteCard: (id: string) => void;
}

const COVER_STYLES: Record<string, {
  bg: string;
  spineBg: string;
  foilBorder: string;
  accentText: string;
  ribbon: string;
  bookmarkBg: string;
}> = {
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900',
    spineBg: 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900',
    foilBorder: 'border-amber-400/40',
    accentText: 'text-amber-300',
    ribbon: 'bg-amber-400',
    bookmarkBg: 'bg-indigo-600',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-950 via-stone-900 to-teal-950',
    spineBg: 'bg-gradient-to-r from-stone-950 via-emerald-950 to-stone-900',
    foilBorder: 'border-amber-300/40',
    accentText: 'text-amber-200',
    ribbon: 'bg-emerald-500',
    bookmarkBg: 'bg-emerald-700',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-950 via-stone-900 to-red-950',
    spineBg: 'bg-gradient-to-r from-stone-950 via-rose-950 to-stone-900',
    foilBorder: 'border-amber-200/50',
    accentText: 'text-amber-200',
    ribbon: 'bg-rose-500',
    bookmarkBg: 'bg-rose-700',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-950 via-stone-900 to-yellow-950',
    spineBg: 'bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900',
    foilBorder: 'border-amber-300/50',
    accentText: 'text-amber-300',
    ribbon: 'bg-amber-500',
    bookmarkBg: 'bg-amber-700',
  },
  sky: {
    bg: 'bg-gradient-to-br from-sky-950 via-slate-900 to-cyan-950',
    spineBg: 'bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900',
    foilBorder: 'border-sky-300/40',
    accentText: 'text-sky-200',
    ribbon: 'bg-sky-400',
    bookmarkBg: 'bg-sky-600',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-950 via-stone-900 to-slate-950',
    spineBg: 'bg-gradient-to-r from-stone-950 via-teal-950 to-stone-900',
    foilBorder: 'border-teal-300/40',
    accentText: 'text-teal-200',
    ribbon: 'bg-teal-400',
    bookmarkBg: 'bg-teal-600',
  },
};

export const Book3DCard: React.FC<Book3DCardProps> = ({
  deck,
  cards,
  dueCards,
  onStartStudy,
  onOpenNewCardModal,
  onOpenDeckModal,
  onEditCardModal,
  onDeleteDeck,
  onDeleteCard,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCardList, setShowCardList] = useState(false);

  const style = COVER_STYLES[deck.accentColor] || COVER_STYLES.indigo;
  const total = cards.length;

  const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach(c => {
    boxCounts[c.box] = (boxCounts[c.box] || 0) + 1;
  });

  const handleToggleOpen = () => {
    playCardFlipSound();
    setIsOpen(prev => !prev);
  };

  const handleFlipNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cards.length === 0) return;
    playCardFlipSound();
    setIsFlipping(true);
    setTimeout(() => {
      setPageIndex(prev => (prev + 1) % cards.length);
      setIsFlipping(false);
    }, 450);
  };

  const currentPreviewCard = cards[pageIndex] || cards[0];

  return (
    <div className="flex flex-col items-center">
      {/* 3D Book Container */}
      <div className="book-scene w-full max-w-[360px] py-4">
        <div
          className={`book-3d ${isOpen ? 'is-open' : ''} relative mx-auto h-[460px] w-[310px] cursor-pointer select-none transition-all duration-700`}
          onClick={() => !isOpen && handleToggleOpen()}
        >
          
          {/* Desk shadow underneath book */}
          <div
            className={`absolute -bottom-6 left-4 right-4 h-8 rounded-full bg-stone-900/35 blur-md transition-all duration-700 ${
              isOpen ? 'scale-x-125 opacity-70 -bottom-8' : 'scale-x-95 opacity-40'
            }`}
          />

          {/* Spine 3D block on left side */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-8 z-20 rounded-l-md shadow-2xl flex flex-col items-center justify-between py-6 ${style.spineBg} border-r border-black/40`}
          >
            {/* Raised gilt bands on spine */}
            <div className="w-full space-y-1 px-1">
              <div className="h-0.5 w-full bg-amber-400/40 rounded-full" />
              <div className="h-0.5 w-full bg-amber-400/20 rounded-full" />
            </div>

            {/* Vertical embossed spine title */}
            <span
              className="text-[10px] font-serif font-bold tracking-widest text-amber-200/90 uppercase [writing-mode:vertical-rl] rotate-180 line-clamp-1"
            >
              {deck.title}
            </span>

            {/* Bottom gilt bands */}
            <div className="w-full space-y-1 px-1">
              <div className="h-0.5 w-full bg-amber-400/20 rounded-full" />
              <div className="h-0.5 w-full bg-amber-400/40 rounded-full" />
            </div>
          </div>

          {/* Realistic Paper Pages (The body of the book block) */}
          <div className="absolute left-6 right-0 top-2 bottom-2 z-10 rounded-r-lg bg-[#faf7f2] shadow-xl border-y border-r border-stone-300 overflow-hidden flex flex-col justify-between">
            {/* Layered paper edge texture on the right and bottom */}
            <div className="absolute right-0 top-0 bottom-0 w-3 paper-edges border-l border-stone-200" />
            <div className="absolute left-0 right-3 bottom-0 h-2 paper-edges border-t border-stone-200" />

            {/* Inside Content when book is opened */}
            <div className="flex-1 p-6 pl-8 flex flex-col justify-between overflow-hidden">
              <div>
                {/* Header inside book */}
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-[11px] text-stone-500">
                  <span className="font-serif italic text-stone-700">{deck.subject}</span>
                  <span className="font-mono">{cards.length} Cards</span>
                </div>

                {/* Open Book Preview Card with animated leaf transition */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900">
                      Leaf {cards.length > 0 ? pageIndex + 1 : 0} of {cards.length}
                    </span>
                    {cards.length > 1 && (
                      <button
                        onClick={handleFlipNextPage}
                        className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
                      >
                        <span>Flip Leaf</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {currentPreviewCard ? (
                    <div
                      className={`mt-2 rounded-lg border border-stone-200/80 bg-stone-50/70 p-3.5 transition-all duration-300 ${
                        isFlipping ? 'opacity-30 -translate-x-2 scale-95' : 'opacity-100 translate-x-0 scale-100'
                      }`}
                    >
                      <span className="text-[10px] text-stone-400 font-mono">Question Prompt:</span>
                      <p className="mt-1 font-serif text-xs font-semibold leading-relaxed text-stone-900 line-clamp-3">
                        "{currentPreviewCard.question}"
                      </p>
                      <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                        <span>Box {currentPreviewCard.box} ({currentPreviewCard.intervalDays}d)</span>
                        <span>Due: {currentPreviewCard.nextReviewDate}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-dashed border-stone-200 p-4 text-center">
                      <p className="text-xs text-stone-400 italic">No flashcard leaves inserted yet.</p>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onOpenNewCardModal(deck.id);
                        }}
                        className="mt-2 text-xs font-semibold text-stone-900 underline"
                      >
                        + Add First Card
                      </button>
                    </div>
                  )}
                </div>

                {/* Leitner Box Miniature Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>Leitner Progress</span>
                    <span>{boxCounts[5]}/{total} Mastered</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                    <div style={{ width: `${total ? (boxCounts[1] / total) * 100 : 0}%` }} className="bg-red-400" />
                    <div style={{ width: `${total ? (boxCounts[2] / total) * 100 : 0}%` }} className="bg-amber-400" />
                    <div style={{ width: `${total ? (boxCounts[3] / total) * 100 : 0}%` }} className="bg-blue-400" />
                    <div style={{ width: `${total ? (boxCounts[4] / total) * 100 : 0}%` }} className="bg-teal-500" />
                    <div style={{ width: `${total ? (boxCounts[5] / total) * 100 : 0}%` }} className="bg-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Action Ribbon inside book */}
              <div className="border-t border-stone-200 pt-3 flex items-center gap-2">
                <button
                  disabled={total === 0}
                  onClick={e => {
                    e.stopPropagation();
                    onStartStudy(deck, dueCards.length > 0);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    total === 0
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : dueCards.length > 0
                      ? 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                      : 'bg-stone-800 text-stone-100 hover:bg-stone-900'
                  }`}
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{dueCards.length > 0 ? `Study (${dueCards.length} Due)` : 'Study Volume'}</span>
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenNewCardModal(deck.id);
                  }}
                  title="Add Card"
                  className="rounded-lg border border-stone-300 p-2 text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowCardList(prev => !prev);
                  }}
                  title="Inspect Leaves"
                  className="rounded-lg border border-stone-300 p-2 text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dangling Silk Bookmark Ribbon */}
          <div
            className={`absolute right-12 -bottom-5 w-4 h-9 ${style.ribbon} shadow-md z-30 transition-all duration-500 [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]`}
          />

          {/* Front Hardcover with 3D Hinge */}
          <div
            className={`book-cover-hinge absolute left-6 right-0 top-0 bottom-0 z-30 rounded-r-lg ${style.bg} ${
              isOpen ? '-rotate-y-135 shadow-2xl' : 'shadow-xl'
            } border-l border-black/50 p-6 flex flex-col justify-between text-stone-50`}
          >
            {/* Front Gilded Foil Border */}
            <div className={`absolute inset-2.5 rounded border ${style.foilBorder} pointer-events-none`} />
            <div className={`absolute inset-3.5 rounded border border-white/5 pointer-events-none`} />

            {/* Top Foil Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className={`font-serif text-[11px] font-bold tracking-widest uppercase ${style.accentText}`}>
                {deck.subject}
              </span>
              <Bookmark className={`h-4 w-4 ${style.accentText} opacity-80`} />
            </div>

            {/* Book Title & Ornament */}
            <div className="relative z-10 my-auto text-center px-2">
              <div className="mx-auto mb-3 h-0.5 w-12 bg-amber-400/40" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm leading-tight">
                {deck.title}
              </h3>
              <p className="mt-2 text-[11px] text-stone-300 line-clamp-2 leading-relaxed opacity-90">
                {deck.description || 'Scholastic Spaced Repetition Treatise'}
              </p>
              <div className="mx-auto mt-3 h-0.5 w-12 bg-amber-400/40" />
            </div>

            {/* Bottom Cover Metadata */}
            <div className="relative z-10 border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-stone-300">
              <span className="font-mono">{total} Leaves</span>
              {dueCards.length > 0 ? (
                <span className="font-medium text-amber-300">
                  {dueCards.length} Due Today
                </span>
              ) : (
                <span className="text-emerald-300/90">Mastered</span>
              )}
            </div>

            {/* Subtle click prompt on cover */}
            <div className="absolute inset-x-0 bottom-1 text-center pointer-events-none">
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
                {isOpen ? 'Click to Close' : 'Click to Open Volume'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Footbar: Volume controls */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[310px] px-2 text-xs">
        <button
          onClick={handleToggleOpen}
          className="font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>{isOpen ? 'Close Volume' : 'Open Book'}</span>
        </button>

        <div className="flex items-center gap-1 text-stone-400">
          <button
            onClick={() => onOpenDeckModal(deck)}
            title="Edit Deck"
            className="hover:text-stone-700 p-1 rounded"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete book "${deck.title}" and its ${total} cards?`)) {
                onDeleteDeck(deck.id);
              }
            }}
            title="Delete Deck"
            className="hover:text-red-600 p-1 rounded"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Detailed Card Drawer if toggled */}
      {showCardList && (
        <div className="mt-3 w-full max-w-[310px] rounded-xl border border-stone-200 bg-white p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span>All Cards in Volume</span>
            <span className="font-mono">{cards.length}</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {cards.map(c => (
              <div
                key={c.id}
                className="group flex items-start justify-between rounded border border-stone-100 bg-stone-50/70 p-2 text-xs hover:border-stone-200"
              >
                <div className="flex-1 pr-1.5">
                  <p className="font-medium text-stone-900 line-clamp-1">{c.question}</p>
                  <p className="text-[10px] text-stone-500 font-mono">Box {c.box} · {c.nextReviewDate}</p>
                </div>
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                  <button onClick={() => onEditCardModal(c)} className="text-stone-400 hover:text-stone-700">
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button onClick={() => onDeleteCard(c.id)} className="text-stone-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
