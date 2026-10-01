import React from 'react';
import { X, Layers, Plus, BookOpen, CheckSquare, Award } from 'lucide-react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'card' | 'deck' | 'note' | 'task') => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Create New Study Item
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2.5">
          <button
            onClick={() => {
              onSelectAction('card');
              onClose();
            }}
            className="flex items-center gap-3.5 rounded-xl border border-stone-200 p-3.5 text-left transition-all hover:border-stone-400 hover:bg-stone-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">New Flashcard</p>
              <p className="text-xs text-stone-500">Add an active recall prompt to an existing deck</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAction('deck');
              onClose();
            }}
            className="flex items-center gap-3.5 rounded-xl border border-stone-200 p-3.5 text-left transition-all hover:border-stone-400 hover:bg-stone-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">New Study Deck</p>
              <p className="text-xs text-stone-500">Organize a new subject or exam syllabus</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAction('note');
              onClose();
            }}
            className="flex items-center gap-3.5 rounded-xl border border-stone-200 p-3.5 text-left transition-all hover:border-stone-400 hover:bg-stone-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">New Cornell Note</p>
              <p className="text-xs text-stone-500">Structured cues, notes, and blurting test area</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAction('task');
              onClose();
            }}
            className="flex items-center gap-3.5 rounded-xl border border-stone-200 p-3.5 text-left transition-all hover:border-stone-400 hover:bg-stone-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-800">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">New Study Goal / Task</p>
              <p className="text-xs text-stone-500">Plan a targeted deep work session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
