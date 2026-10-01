import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Deck } from '../../types/study';

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deck: { title: string; description: string; subject: string; accentColor: string }) => void;
  initialDeck?: Deck | null;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-600' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-600' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-600' },
];

export const DeckModal: React.FC<DeckModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDeck,
}) => {
  const [title, setTitle] = useState(initialDeck?.title || '');
  const [description, setDescription] = useState(initialDeck?.description || '');
  const [subject, setSubject] = useState(initialDeck?.subject || '');
  const [accentColor, setAccentColor] = useState(initialDeck?.accentColor || 'indigo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      accentColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {initialDeck ? 'Edit Deck' : 'Create New Study Deck'}
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
              Deck Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Cognitive Psychology & Memory"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Subject / Discipline *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Psychology, Computer Science, Biology"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of topics, concepts, or exam objectives covered..."
              className="mt-1 w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Accent Color
            </label>
            <div className="mt-2 flex gap-3">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAccentColor(c.id)}
                  className={`h-7 w-7 rounded-full ${c.bg} transition-all ${
                    accentColor === c.id
                      ? 'ring-2 ring-stone-900 ring-offset-2 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={c.label}
                />
              ))}
            </div>
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
              {initialDeck ? 'Save Changes' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
