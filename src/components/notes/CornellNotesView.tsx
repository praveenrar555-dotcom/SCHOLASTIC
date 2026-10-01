import React, { useState } from 'react';
import { Plus, BookOpen, Layers, Eye, EyeOff, Sparkles, Download, Trash2, Edit3, Check, ArrowRight } from 'lucide-react';
import { CornellNote } from '../../types/study';
import { useStudy } from '../../context/StudyContext';

export const CornellNotesView: React.FC = () => {
  const { notes, decks, addNote, updateNote, deleteNote, convertCuesToFlashcards } = useStudy();
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isBlurtingMode, setIsBlurtingMode] = useState<boolean>(false);
  const [blurtText, setBlurtText] = useState<string>('');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [targetDeckId, setTargetDeckId] = useState<string>(decks[0]?.id || '');
  const [conversionMessage, setConversionMessage] = useState<string | null>(null);

  // Form states for note editing
  const selectedNote = notes.find(n => n.id === selectedNoteId) || notes[0];
  const [title, setTitle] = useState(selectedNote?.title || '');
  const [subject, setSubject] = useState(selectedNote?.subject || '');
  const [notesContent, setNotesContent] = useState(selectedNote?.notes || '');
  const [summary, setSummary] = useState(selectedNote?.summary || '');
  const [cues, setCues] = useState(selectedNote?.cues || []);

  const handleSelectNote = (note: CornellNote) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setSubject(note.subject);
    setNotesContent(note.notes);
    setSummary(note.summary);
    setCues(note.cues);
    setIsEditing(false);
    setIsBlurtingMode(false);
    setIsComparing(false);
    setBlurtText('');
  };

  const handleCreateNewNote = () => {
    const newId = addNote({
      title: 'Untitled Cornell Note',
      subject: 'General Study',
      cues: [
        { id: `cue-${Date.now()}-1`, prompt: 'Key Question or Recall Prompt', detail: 'Essential answer or principle' }
      ],
      notes: '### Main Concept Outline\n- Detailed lecture or reading notes\n- Key definitions and mechanisms\n- Evidence and examples',
      summary: 'Concise 2-sentence synthesis of the material in your own words.',
      tags: ['Study Note'],
    });
    setSelectedNoteId(newId);
    setTitle('Untitled Cornell Note');
    setSubject('General Study');
    setCues([{ id: `cue-${Date.now()}-1`, prompt: 'Key Question or Recall Prompt', detail: 'Essential answer or principle' }]);
    setNotesContent('### Main Concept Outline\n- Detailed lecture or reading notes\n- Key definitions and mechanisms\n- Evidence and examples');
    setSummary('Concise 2-sentence synthesis of the material in your own words.');
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, {
      title,
      subject,
      notes: notesContent,
      summary,
      cues,
    });
    setIsEditing(false);
  };

  const handleAddCue = () => {
    setCues(prev => [
      ...prev,
      { id: `cue-${Date.now()}`, prompt: '', detail: '' }
    ]);
  };

  const handleUpdateCue = (index: number, field: 'prompt' | 'detail', value: string) => {
    setCues(prev =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveCue = (index: number) => {
    setCues(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvertToCards = () => {
    if (!selectedNote || !targetDeckId) return;
    const count = convertCuesToFlashcards(selectedNote.id, targetDeckId);
    const deck = decks.find(d => d.id === targetDeckId);
    setConversionMessage(`Converted ${count} cues into flashcards in "${deck?.title || 'deck'}"!`);
    setTimeout(() => setConversionMessage(null), 4000);
  };

  const handleExportMarkdown = () => {
    if (!selectedNote) return;
    const md = `# ${selectedNote.title}\n**Subject:** ${selectedNote.subject}  \n**Date:** ${selectedNote.date}\n\n## Cornell Cues & Questions\n${selectedNote.cues.map(c => `- **${c.prompt}**: ${c.detail}`).join('\n')}\n\n## Detailed Notes\n${selectedNote.notes}\n\n## Summary\n${selectedNote.summary}\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedNote.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-stone-400" />
        <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
          No Cornell Notes Yet
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          Create your first note to practice structured active recall and note synthesis.
        </p>
        <button
          onClick={handleCreateNewNote}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-stone-50 hover:bg-stone-800"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Cornell Note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar: Note List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Notebook
          </h2>
          <button
            onClick={handleCreateNewNote}
            className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-3 w-3" />
            <span>New Note</span>
          </button>
        </div>

        <div className="space-y-1.5 max-h-[700px] overflow-y-auto pr-1">
          {notes.map(note => {
            const isSelected = note.id === selectedNote?.id;
            return (
              <button
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`w-full text-left rounded-lg p-3 transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-white border border-stone-200 text-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] opacity-80">
                  <span>{note.subject}</span>
                  <span className="font-mono">{note.date}</span>
                </div>
                <h4 className="mt-1 font-serif text-sm font-semibold line-clamp-1">
                  {note.title}
                </h4>
                <p className={`mt-0.5 text-xs line-clamp-1 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {note.cues.length} recall cues · {note.summary ? 'Synthesized' : 'In progress'}
                </p>
              </button>
            );
          })}
        </div>

        {/* Convert Cues to Flashcards Drawer */}
        {selectedNote && selectedNote.cues.length > 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <Layers className="h-3.5 w-3.5 text-stone-700" />
              <span>Convert Cues to Flashcards</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Transform {selectedNote.cues.length} retrieval cues from this note into active recall cards:
            </p>
            <select
              value={targetDeckId}
              onChange={e => setTargetDeckId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            >
              {decks.map(d => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleConvertToCards}
              className="w-full rounded-lg bg-stone-100 py-1.5 text-xs font-medium text-stone-900 hover:bg-stone-200 transition-colors"
            >
              Generate Cards
            </button>
            {conversionMessage && (
              <p className="text-[11px] text-emerald-700 font-medium">
                {conversionMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Area: The Cornell Note Studio */}
      <div className="lg:col-span-3 space-y-4">
        {selectedNote && (
          <div className="rounded-xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
            {/* Note Header & Action Ribbon */}
            <div className="border-b border-stone-200 bg-stone-50/70 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Note Title"
                        className="w-full font-serif text-2xl font-bold text-stone-900 bg-white rounded border border-stone-300 px-3 py-1"
                      />
                      <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Subject / Course"
                        className="text-xs text-stone-600 bg-white rounded border border-stone-300 px-2 py-1"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-medium text-stone-700">{selectedNote.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{selectedNote.date}</span>
                        <span aria-hidden="true">·</span>
                        <span>{selectedNote.cues.length} cues</span>
                      </div>
                      <h1 className="mt-1 font-serif text-2xl font-bold text-stone-950 sm:text-3xl">
                        {selectedNote.title}
                      </h1>
                    </div>
                  )}
                </div>

                {/* Top Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsBlurtingMode(prev => !prev);
                      setIsComparing(false);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isBlurtingMode
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {isBlurtingMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span>{isBlurtingMode ? 'Exit Recall Test' : 'Active Recall Mode'}</span>
                  </button>

                  {isEditing ? (
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-medium text-stone-50 hover:bg-stone-800"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportMarkdown}
                    title="Export as Markdown"
                    className="rounded-lg border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete Cornell Note "${selectedNote.title}"?`)) {
                        deleteNote(selectedNote.id);
                      }
                    }}
                    title="Delete Note"
                    className="rounded-lg border border-stone-300 bg-white p-2 text-stone-600 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Recall / Blurting Notice Banner */}
            {isBlurtingMode && (
              <div className="border-b border-amber-200 bg-amber-50/70 px-6 py-2.5 text-xs text-amber-900">
                <span className="font-semibold">Active Recall Blurting Protocol: </span>
                Review the retrieval cues on the left. Type everything you recall from memory into the blurting box without peeking at the original notes!
              </div>
            )}

            {/* Cornell 2-Column Split: Cues (30%) & Notes (70%) */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] divide-y md:divide-y-0 md:divide-x divide-stone-200">
              
              {/* Cue Column: Left 4 cols (Walter Pauk Cue Column) */}
              <div className="md:col-span-4 bg-stone-50/40 p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Cues & Retrieval Prompts
                  </span>
                  {isEditing && (
                    <button
                      onClick={handleAddCue}
                      className="text-xs text-stone-700 hover:text-stone-950 font-medium"
                    >
                      + Cue
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {cues.map((cue, idx) => (
                    <div
                      key={cue.id || idx}
                      className="rounded-lg border border-stone-200 bg-white p-3 text-xs shadow-2xs"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Cue / Question"
                            value={cue.prompt}
                            onChange={e => handleUpdateCue(idx, 'prompt', e.target.value)}
                            className="w-full font-semibold text-stone-900 border-b border-stone-200 pb-1 focus:outline-hidden"
                          />
                          <textarea
                            rows={2}
                            placeholder="Key answer / detail"
                            value={cue.detail}
                            onChange={e => handleUpdateCue(idx, 'detail', e.target.value)}
                            className="w-full text-stone-600 focus:outline-hidden resize-none"
                          />
                          <button
                            onClick={() => handleRemoveCue(idx)}
                            className="text-[10px] text-red-600 hover:underline"
                          >
                            Remove cue
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-stone-900">
                            {cue.prompt}
                          </p>
                          {!isBlurtingMode && (
                            <p className="mt-1 text-stone-600">
                              {cue.detail}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Column: Right 8 cols */}
              <div className="md:col-span-8 p-6">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    {isBlurtingMode ? 'Active Recall Blurting Workspace' : 'Main Lecture & Synthesis Notes'}
                  </span>
                </div>

                {isBlurtingMode ? (
                  /* Blurting Workspace */
                  <div className="mt-4 space-y-4">
                    {!isComparing ? (
                      <div>
                        <textarea
                          rows={14}
                          value={blurtText}
                          onChange={e => setBlurtText(e.target.value)}
                          placeholder="Type everything you can retrieve from memory for this topic. Use the cues on the left as your retrieval triggers..."
                          className="w-full rounded-xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden resize-none font-sans"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => setIsComparing(true)}
                            className="flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2 text-xs font-medium text-stone-50 hover:bg-stone-800"
                          >
                            <span>Reveal Original & Compare Recall</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Side-by-Side Comparison */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
                            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                              Your Retrieval Blurt
                            </span>
                            <p className="mt-2 text-xs leading-relaxed text-stone-800 whitespace-pre-line font-mono">
                              {blurtText || '(No text entered during recall test)'}
                            </p>
                          </div>
                          <div className="rounded-lg border border-stone-200 bg-white p-4">
                            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                              Original Master Notes
                            </span>
                            <div className="mt-2 text-xs leading-relaxed text-stone-700 whitespace-pre-line">
                              {selectedNote.notes}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            onClick={() => setIsComparing(false)}
                            className="rounded-lg border border-stone-300 px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                          >
                            Keep Editing Blurt
                          </button>
                          <button
                            onClick={() => setIsBlurtingMode(false)}
                            className="rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-medium text-stone-50 hover:bg-stone-800"
                          >
                            Done Reviewing
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Notes View or Edit */
                  <div className="mt-4">
                    {isEditing ? (
                      <textarea
                        rows={14}
                        value={notesContent}
                        onChange={e => setNotesContent(e.target.value)}
                        placeholder="Write comprehensive notes with headers, bullet points, and code..."
                        className="w-full rounded-xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-900 font-mono focus:border-stone-900 focus:outline-hidden resize-none"
                      />
                    ) : (
                      <div className="font-sans text-sm leading-relaxed text-stone-800 whitespace-pre-line space-y-2">
                        {selectedNote.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: Cornell Summary Block */}
            <div className="border-t border-stone-200 bg-stone-50/60 p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Summary & Synthesis
              </span>
              <div className="mt-2">
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="Brief 2-3 sentence synthesis summarizing the overarching takeaways..."
                    className="w-full rounded-lg border border-stone-300 p-3 text-xs leading-relaxed text-stone-900 focus:border-stone-900 focus:outline-hidden resize-none"
                  />
                ) : (
                  <p className="font-serif text-sm italic text-stone-800 leading-relaxed">
                    "{selectedNote.summary}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
