import React, { useState, useMemo } from 'react';
import { CheckSquare, Flame, Clock, Award, Plus, Trash2, Download, Upload, RotateCcw, Calendar, Check } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const StudyPlanner: React.FC = () => {
  const {
    tasks,
    cards,
    stats,
    addTask,
    toggleTask,
    deleteTask,
    exportDataJSON,
    importDataJSON,
    resetAllData,
  } = useStudy();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('Psychology');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // 7-day focus bar chart data
  const last7Days = useMemo(() => {
    const days: { dateStr: string; label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        dateStr,
        label: i === 0 ? 'Today' : dayName,
        minutes: stats.dailyFocusMinutes[dateStr] || 0,
      });
    }
    return days;
  }, [stats.dailyFocusMinutes]);

  const maxMinutesInWeek = Math.max(60, ...last7Days.map(d => d.minutes));
  const totalWeekMinutes = last7Days.reduce((acc, d) => acc + d.minutes, 0);

  // Leitner distribution
  const leitnerCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cards.forEach(c => {
      counts[c.box] = (counts[c.box] || 0) + 1;
    });
    return counts;
  }, [cards]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subject: newTaskSubject.trim(),
      priority: newTaskPriority,
      estimatedMinutes: Number(newTaskMinutes) || 25,
      dueDate: todayStr,
    });

    setNewTaskTitle('');
  };

  const handleDoImport = () => {
    if (!importText.trim()) return;
    const success = importDataJSON(importText.trim());
    if (success) {
      setImportStatus('Data successfully restored!');
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportText('');
      }, 1200);
    } else {
      setImportStatus('Invalid JSON format. Please verify your backup file.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Metric Highlights: Zero-pill, unboxed text */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Flame className="h-4 w-4 text-amber-600" />
            <span>Active Streak</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-stone-900 tabular-nums">
            {stats.currentStreak} <span className="text-sm font-sans font-normal text-stone-500">days</span>
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            Best streak: {stats.longestStreak} days
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Focus This Week</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-stone-900 tabular-nums">
            {Math.floor(totalWeekMinutes / 60)}h {totalWeekMinutes % 60}m
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            {stats.totalSessions} sessions logged
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Cards Reviewed</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-stone-900 tabular-nums">
            {stats.totalCardsReviewed}
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            Across all Leitner decks
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <CheckSquare className="h-4 w-4 text-purple-600" />
            <span>Mastered Cards</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-stone-900 tabular-nums">
            {leitnerCounts[5]} <span className="text-sm font-sans font-normal text-stone-500">cards</span>
          </p>
          <p className="mt-1 text-[11px] text-stone-400">
            Box 5 (Permanent memory)
          </p>
        </div>
      </div>

      {/* 7-Day Focus Minutes Visualizer */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Focus Rhythm (Past 7 Days)
            </h3>
            <p className="text-xs text-stone-500">
              Daily deep study minutes logged from your focus sessions.
            </p>
          </div>
          <span className="font-mono text-xs text-stone-600">
            Target: 60m / day
          </span>
        </div>

        <div className="mt-6 flex h-44 items-end justify-between gap-2 sm:gap-4 pt-4">
          {last7Days.map(d => {
            const heightPercent = Math.max(8, Math.round((d.minutes / maxMinutesInWeek) * 100));
            const isToday = d.dateStr === todayStr;

            return (
              <div key={d.dateStr} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                  {d.minutes > 0 ? `${d.minutes}m` : '0'}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      isToday
                        ? 'bg-stone-900'
                        : d.minutes >= 50
                        ? 'bg-stone-700'
                        : d.minutes > 0
                        ? 'bg-stone-300'
                        : 'bg-stone-100'
                    }`}
                  />
                </div>
                <span className={`text-[11px] font-medium ${isToday ? 'text-stone-950 font-bold' : 'text-stone-500'}`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leitner Spaced Repetition Box Distribution */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="pb-3 border-b border-stone-100">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Leitner Retention Curve Distribution
          </h3>
          <p className="text-xs text-stone-500">
            Cards advance through 5 spaced intervals as neural pathways strengthen.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <span className="text-[11px] font-semibold text-red-900 uppercase tracking-wider">
              Box 1 · Daily
            </span>
            <p className="mt-2 font-mono text-2xl font-bold text-red-950">
              {leitnerCounts[1]}
            </p>
            <p className="mt-0.5 text-[10px] text-red-700">Initial acquisition</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
              Box 2 · 3 Days
            </span>
            <p className="mt-2 font-mono text-2xl font-bold text-amber-950">
              {leitnerCounts[2]}
            </p>
            <p className="mt-0.5 text-[10px] text-amber-700">Short-term recall</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">
              Box 3 · 7 Days
            </span>
            <p className="mt-2 font-mono text-2xl font-bold text-blue-950">
              {leitnerCounts[3]}
            </p>
            <p className="mt-0.5 text-[10px] text-blue-700">Consolidating</p>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4">
            <span className="text-[11px] font-semibold text-teal-900 uppercase tracking-wider">
              Box 4 · 14 Days
            </span>
            <p className="mt-2 font-mono text-2xl font-bold text-teal-950">
              {leitnerCounts[4]}
            </p>
            <p className="mt-0.5 text-[10px] text-teal-700">Strong retention</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
              Box 5 · 30 Days
            </span>
            <p className="mt-2 font-mono text-2xl font-bold text-emerald-950">
              {leitnerCounts[5]}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-700">Mastered memory</p>
          </div>
        </div>
      </div>

      {/* Today's Study Tasks */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Daily Study Tasks
            </h3>
            <p className="text-xs text-stone-500">
              Action items mapped to focus blocks and retrieval goals.
            </p>
          </div>
          <span className="text-xs text-stone-500">
            {tasks.filter(t => t.completed).length} of {tasks.length} done
          </span>
        </div>

        {/* New Task Form */}
        <form onSubmit={handleCreateTask} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a concrete study task..."
            className="flex-1 rounded-lg border border-stone-300 px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-hidden"
          />
          <input
            type="text"
            value={newTaskSubject}
            onChange={e => setNewTaskSubject(e.target.value)}
            placeholder="Subject"
            className="w-32 rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
          />
          <select
            value={newTaskPriority}
            onChange={e => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <input
            type="number"
            min="5"
            max="180"
            step="5"
            value={newTaskMinutes}
            onChange={e => setNewTaskMinutes(Number(e.target.value))}
            placeholder="Mins"
            className="w-20 rounded-lg border border-stone-300 px-2.5 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Task List */}
        <div className="mt-4 space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                task.completed
                  ? 'border-stone-100 bg-stone-50/50 text-stone-400'
                  : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    task.completed
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-stone-300 bg-white hover:border-stone-500'
                  }`}
                >
                  {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                </button>
                <div className={task.completed ? 'line-through' : ''}>
                  <p className="font-medium text-stone-900">{task.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-stone-500">
                    <span>{task.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{task.estimatedMinutes}m block</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{task.priority} priority</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-stone-400 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management: Export & Backup */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="pb-3 border-b border-stone-100">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Data Portability & Backup
          </h3>
          <p className="text-xs text-stone-500">
            Export all decks, flashcards, Cornell notes, and stats as a JSON file. Never lose your hard-earned study materials.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={exportDataJSON}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Restore Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all study materials and stats back to default sample data?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Initial Materials</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Restore Study Data from Backup
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Paste the exported JSON content below:
            </p>
            <textarea
              rows={8}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste JSON here..."
              className="mt-3 w-full rounded-lg border border-stone-300 p-2.5 text-xs font-mono text-stone-900 focus:border-stone-900 focus:outline-hidden resize-none"
            />
            {importStatus && (
              <p className={`mt-2 text-xs font-medium ${importStatus.includes('success') ? 'text-emerald-700' : 'text-red-700'}`}>
                {importStatus}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDoImport}
                className="rounded-lg bg-stone-900 px-5 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
              >
                Import & Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
