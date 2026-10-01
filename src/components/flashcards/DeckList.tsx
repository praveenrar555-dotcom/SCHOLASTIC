import React, { useState, useMemo } from 'react';
import { Search, Plus, Play, BookOpen, Edit2, Trash2, Eye, LayoutGrid, Library, BookMarked, Sparkles } from 'lucide-react';
import { Deck, Flashcard } from '../../types/study';
import { useStudy } from '../../context/StudyContext';
import { Book3DCard } from './Book3DCard';

interface DeckListProps {
  onStartStudy: (deck: Deck, dueOnly?: boolean) => void;
  onOpenNewCardModal: (deckId?: string) => void;
  onOpenDeckModal: (deck?: Deck) => void;
  onEditCardModal: (card: Flashcard) => void;
}

export const DeckList: React.FC<DeckListProps> = ({
  onStartStudy,
  onOpenNewCardModal,
  onOpenDeckModal,
  onEditCardModal,
}) => {
  const { decks, cards, deleteDeck, deleteCard } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'3d-books' | 'bookshelf' | 'grid'>('3d-books');
  const [pulledSpineId, setPulledSpineId] = useState<string | null>(null);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    decks.forEach(d => set.add(d.subject));
    return ['all', ...Array.from(set)];
  }, [decks]);

  const filteredDecks = useMemo(() => {
    return decks.filter(deck => {
      const matchesSubject = selectedSubject === 'all' || deck.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesSearch =
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [decks, selectedSubject, searchQuery]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Top Controls: Search, View Mode Toggles, and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search volumes, subjects, or concepts..."
            className="w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
          />
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-3">
          {/* Animated Book View Switcher */}
          <div className="flex items-center rounded-lg border border-stone-200 bg-white p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('3d-books')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === '3d-books'
                  ? 'bg-stone-900 text-stone-50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="3D Animated Volumes (Hover to tilt, click to open cover)"
            >
              <BookMarked className="h-3.5 w-3.5" />
              <span>3D Books</span>
            </button>

            <button
              onClick={() => setViewMode('bookshelf')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'bookshelf'
                  ? 'bg-stone-900 text-stone-50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Bookshelf Spine View"
            >
              <Library className="h-3.5 w-3.5" />
              <span>Bookshelf</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-stone-900 text-stone-50'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Standard Grid"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenNewCardModal()}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Card</span>
            </button>
            <button
              onClick={() => onOpenDeckModal()}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-stone-50 hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Volume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-stone-900 text-stone-50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {subj === 'all' ? 'All Subjects' : subj}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-stone-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>Click any book to open cover · 3D physics enabled</span>
        </div>
      </div>

      {/* No Decks Fallback */}
      {filteredDecks.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-stone-400" />
          <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
            No Study Volumes Found
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Try adjusting your search query or create a new study volume to get started.
          </p>
        </div>
      ) : viewMode === '3d-books' ? (
        /* MODE 1: REAL 3D ANIMATED BOOKS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pt-2">
          {filteredDecks.map(deck => {
            const deckCards = cards.filter(c => c.deckId === deck.id);
            const dueCards = deckCards.filter(c => c.nextReviewDate <= todayStr);

            return (
              <Book3DCard
                key={deck.id}
                deck={deck}
                cards={deckCards}
                dueCards={dueCards}
                onStartStudy={onStartStudy}
                onOpenNewCardModal={onOpenNewCardModal}
                onOpenDeckModal={onOpenDeckModal}
                onEditCardModal={onEditCardModal}
                onDeleteDeck={deleteDeck}
                onDeleteCard={deleteCard}
              />
            );
          })}
        </div>
      ) : viewMode === 'bookshelf' ? (
        /* MODE 2: PHYSICAL ANIMATED BOOKSHELF */
        <div className="space-y-4">
          <div className="rounded-2xl border-4 border-amber-950/20 bg-gradient-to-b from-[#2a1d17] via-[#211612] to-[#1a110d] p-8 shadow-2xl overflow-x-auto">
            {/* Wooden shelf backdrop & lighting */}
            <div className="relative min-w-[700px] flex items-end gap-6 pt-16 pb-3 border-b-8 border-amber-900 shadow-inner">
              
              {/* Back shelf shadow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {filteredDecks.map((deck, idx) => {
                const deckCards = cards.filter(c => c.deckId === deck.id);
                const dueCards = deckCards.filter(c => c.nextReviewDate <= todayStr);
                const isPulled = pulledSpineId === deck.id;

                const spineColors: Record<string, string> = {
                  indigo: 'from-indigo-950 via-slate-900 to-indigo-900 border-indigo-700/50',
                  emerald: 'from-emerald-950 via-stone-900 to-teal-950 border-emerald-700/50',
                  rose: 'from-rose-950 via-stone-900 to-red-950 border-rose-700/50',
                  amber: 'from-amber-950 via-stone-900 to-yellow-950 border-amber-700/50',
                  sky: 'from-sky-950 via-slate-900 to-cyan-950 border-sky-700/50',
                  teal: 'from-teal-950 via-stone-900 to-slate-950 border-teal-700/50',
                };

                const spineColor = spineColors[deck.accentColor] || spineColors.indigo;

                return (
                  <div
                    key={deck.id}
                    onMouseEnter={() => setPulledSpineId(deck.id)}
                    onMouseLeave={() => setPulledSpineId(null)}
                    onClick={() => onStartStudy(deck, dueCards.length > 0)}
                    className={`relative z-10 cursor-pointer select-none transition-all duration-500 ease-out group ${
                      isPulled
                        ? '-translate-y-6 scale-105 z-30 shadow-2xl'
                        : 'translate-y-0 hover:-translate-y-4'
                    }`}
                  >
                    {/* Realistic 3D Book Spine */}
                    <div
                      className={`w-16 sm:w-20 h-72 rounded-t-sm bg-gradient-to-r ${spineColor} border-t-2 border-r-2 border-l-2 p-2 flex flex-col justify-between items-center text-center shadow-xl`}
                    >
                      {/* Top gilt band */}
                      <div className="w-full space-y-1">
                        <div className="h-0.5 w-full bg-amber-400/50" />
                        <div className="h-0.5 w-full bg-amber-400/25" />
                        <span className="text-[9px] font-mono text-amber-200/80 block mt-1 uppercase">
                          Vol. {idx + 1}
                        </span>
                      </div>

                      {/* Spine Title in Gold Foil */}
                      <span className="font-serif text-xs font-bold text-amber-100 tracking-wider [writing-mode:vertical-rl] rotate-180 line-clamp-2 max-h-36 drop-shadow-sm">
                        {deck.title}
                      </span>

                      {/* Bottom Gilt & Card Count */}
                      <div className="w-full space-y-1">
                        <span className="font-mono text-[9px] text-stone-300 block">
                          {deckCards.length} Cards
                        </span>
                        <div className="h-0.5 w-full bg-amber-400/30" />
                        <div className="h-0.5 w-full bg-amber-400/50" />
                      </div>
                    </div>

                    {/* Book pull indicator */}
                    <div
                      className={`absolute -top-7 inset-x-0 text-center transition-opacity ${
                        isPulled ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="text-[10px] bg-stone-900 text-stone-100 px-2 py-0.5 rounded shadow font-sans">
                        Pull & Study
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shelf bottom wood plank */}
            <div className="h-4 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-b shadow-lg" />
          </div>
          <p className="text-center text-xs text-stone-500 italic">
            Hover over any volume to pull it from the shelf, or switch to "3D Books" to open the front cover and flip pages.
          </p>
        </div>
      ) : (
        /* MODE 3: STANDARD CLEAN GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map(deck => {
            const deckCards = cards.filter(c => c.deckId === deck.id);
            const dueCards = deckCards.filter(c => c.nextReviewDate <= todayStr);
            const total = deckCards.length;

            const boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            deckCards.forEach(c => {
              boxCounts[c.box] = (boxCounts[c.box] || 0) + 1;
            });

            return (
              <div
                key={deck.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-2xs hover:border-stone-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-medium text-stone-700">{deck.subject} · {total} cards</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onOpenDeckModal(deck)} className="p-1 text-stone-400 hover:text-stone-700">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteDeck(deck.id)} className="p-1 text-stone-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2 font-serif text-lg font-bold text-stone-950">{deck.title}</h3>
                  <p className="mt-1 text-xs text-stone-600 line-clamp-2">{deck.description}</p>

                  <div className="mt-3 text-xs text-amber-800 font-medium">
                    {dueCards.length > 0 ? `${dueCards.length} due for review today` : 'All caught up'}
                  </div>
                </div>

                <div className="mt-5 border-t border-stone-100 pt-3 flex items-center gap-2">
                  <button
                    disabled={total === 0}
                    onClick={() => onStartStudy(deck, dueCards.length > 0)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Study Now</span>
                  </button>
                  <button
                    onClick={() => onOpenNewCardModal(deck.id)}
                    className="rounded-lg border border-stone-200 p-2 text-stone-600 hover:bg-stone-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
