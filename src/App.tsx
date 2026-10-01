import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header, NavTab } from './components/Header';
import { DeckList } from './components/flashcards/DeckList';
import { StudySession } from './components/flashcards/StudySession';
import { DeckModal } from './components/flashcards/DeckModal';
import { CardEditorModal } from './components/flashcards/CardEditorModal';
import { CornellNotesView } from './components/notes/CornellNotesView';
import { PomodoroTimer } from './components/timer/PomodoroTimer';
import { PracticeExam } from './components/quiz/PracticeExam';
import { StudyPlanner } from './components/analytics/StudyPlanner';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { Deck, Flashcard } from './types/study';

function StudyAppContent() {
  const { decks, cards, addDeck, updateDeck, addCard, updateCard, addNote, addTask } = useStudy();

  const [currentTab, setCurrentTab] = useState<NavTab>('flashcards');
  const [activeStudyDeck, setActiveStudyDeck] = useState<{ deck: Deck; dueOnly: boolean } | null>(null);

  // Modal states
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardModalDeckId, setCardModalDeckId] = useState<string | undefined>(undefined);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Deck modal handlers
  const handleOpenDeckModal = (deck?: Deck) => {
    setEditingDeck(deck || null);
    setIsDeckModalOpen(true);
  };

  const handleSaveDeck = (data: { title: string; description: string; subject: string; accentColor: string }) => {
    if (editingDeck) {
      updateDeck(editingDeck.id, data);
    } else {
      addDeck(data);
    }
  };

  // Card modal handlers
  const handleOpenNewCardModal = (deckId?: string) => {
    setEditingCard(null);
    setCardModalDeckId(deckId || decks[0]?.id);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card: Flashcard) => {
    setEditingCard(card);
    setCardModalDeckId(card.deckId);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (cardData: {
    deckId: string;
    question: string;
    answer: string;
    hint?: string;
    extraNotes?: string;
    tags: string[];
  }) => {
    if (editingCard) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
  };

  // Study session handlers
  const handleStartStudy = (deck: Deck, dueOnly = false) => {
    setActiveStudyDeck({ deck, dueOnly });
  };

  const handleExitStudy = () => {
    setActiveStudyDeck(null);
  };

  // Quick create routing
  const handleQuickCreateAction = (action: 'card' | 'deck' | 'note' | 'task') => {
    if (action === 'card') {
      handleOpenNewCardModal();
    } else if (action === 'deck') {
      handleOpenDeckModal();
    } else if (action === 'note') {
      setCurrentTab('notes');
      addNote({
        title: 'New Cornell Study Note',
        subject: 'General Study',
        cues: [{ id: `cue-${Date.now()}`, prompt: 'Core recall question?', detail: 'Key definition or principle' }],
        notes: '### Concept Deep Dive\n- Note key arguments and findings\n- Synthesize without copy-pasting',
        summary: 'Essential 2-sentence summary.',
        tags: ['Study'],
      });
    } else if (action === 'task') {
      setCurrentTab('planner');
      addTask({
        title: 'Complete focused study session',
        subject: 'General',
        priority: 'high',
        estimatedMinutes: 25,
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-amber-100 selection:text-amber-900 flex flex-col justify-between">
      <div>
        {/* Top Bar adhering to strict one-row contract */}
        <Header
          currentTab={currentTab}
          onSelectTab={tab => {
            setActiveStudyDeck(null);
            setCurrentTab(tab);
          }}
          onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
          isAudioPlaying={isAudioPlaying}
        />

        {/* Main Content Workspace */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {currentTab === 'flashcards' && (
            activeStudyDeck ? (
              <StudySession
                deck={activeStudyDeck.deck}
                filterDueOnly={activeStudyDeck.dueOnly}
                onExit={handleExitStudy}
              />
            ) : (
              <DeckList
                onStartStudy={handleStartStudy}
                onOpenNewCardModal={handleOpenNewCardModal}
                onOpenDeckModal={handleOpenDeckModal}
                onEditCardModal={handleOpenEditCardModal}
              />
            )
          )}

          {currentTab === 'notes' && <CornellNotesView />}

          {currentTab === 'timer' && (
            <PomodoroTimer onAudioStateChange={setIsAudioPlaying} />
          )}

          {currentTab === 'quiz' && <PracticeExam />}

          {currentTab === 'planner' && <StudyPlanner />}
        </main>
      </div>

      {/* Footer adhering to quiet, unpretentious contract */}
      <footer className="mt-16 border-t border-stone-200/80 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">SCHOLASTIC</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Spaced Repetition & Cornell Retrieval OS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Evidence-based cognitive study architecture</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>All data stored locally</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DeckModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        onSave={handleSaveDeck}
        initialDeck={editingDeck}
      />

      <CardEditorModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        decks={decks}
        defaultDeckId={cardModalDeckId}
        initialCard={editingCard}
      />

      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSelectAction={handleQuickCreateAction}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <StudyAppContent />
    </StudyProvider>
  );
}
