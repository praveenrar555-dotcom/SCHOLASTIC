import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Flashcard, Deck } from '../../types/study';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: {
    deckId: string;
    question: string;
    answer: string;
    hint?: string;
    extraNotes?: string;
    tags: string[];
  }) => void;
  decks: Deck[];
  defaultDeckId?: string;
  initialCard?: Flashcard | null;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  decks,
  defaultDeckId,
  initialCard,
}) => {
  const [deckId, setDeckId] = useState(initialCard?.deckId || defaultDeckId || (decks[0]?.id ?? ''));
  const [question, setQuestion] = useState(initialCard?.question || '');
  const [answer, setAnswer] = useState(initialCard?.answer || '');
  const [hint, setHint] = useState(initialCard?.hint || '');
  const [extraNotes, setExtraNotes] = useState(initialCard?.extraNotes || '');
  const [tagsInput, setTagsInput] = useState(initialCard?.tags.join(', ') || '');

  useEffect(() => {
    if (initialCard) {
      setDeckId(initialCard.deckId);
      setQuestion(initialCard.question);
      setAnswer(initialCard.answer);
      setHint(initialCard.hint || '');
      setExtraNotes(initialCard.extraNotes || '');
      setTagsInput(initialCard.tags.join(', '));
    } else if (defaultDeckId) {
      setDeckId(defaultDeckId);
      setQuestion('');
      setAnswer('');
      setHint('');
      setExtraNotes('');
      setTagsInput('');
    }
  }, [initialCard, defaultDeckId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !deckId) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      deckId,
      question: question.trim(),
      answer: answer.trim(),
      hint: hint.trim() || undefined,
      extraNotes: extraNotes.trim() || undefined,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {initialCard ? 'Edit Flashcard' : 'Create Flashcard'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Study Deck *
            </label>
            <select
              value={deckId}
              onChange={e => setDeckId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-stone-900 focus:outline-hidden"
              required
            >
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.title} ({deck.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Front: Question or Retrieval Prompt *
            </label>
            <textarea
              rows={3}
              required
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. What is the difference between Intrinsic and Extraneous cognitive load?"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Back: Correct Answer / Recall Solution *
            </label>
            <textarea
              rows={4}
              required
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Detailed explanation, formula, or key points..."
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Memory Cue / Hint (Optional)
              </label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="e.g. Sweller (1988) pedagogy"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. Memory, Psychology, Core"
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Extra Context / Real-world Example (Optional)
            </label>
            <input
              type="text"
              value={extraNotes}
              onChange={e => setExtraNotes(e.target.value)}
              placeholder="e.g. Appears frequently on Section 2 exam"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-5 py-2 text-sm font-medium text-stone-50 hover:bg-stone-800 transition-colors"
            >
              {initialCard ? 'Save Flashcard' : 'Add Flashcard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
