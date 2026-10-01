import React, { useState, useMemo } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Plus, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '../../types/study';
import { useStudy } from '../../context/StudyContext';
import { playCompletionChime } from '../../utils/audio';

export const PracticeExam: React.FC = () => {
  const { quizzes, addQuizQuestion } = useStudy();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isExamFinished, setIsExamFinished] = useState<boolean>(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState<boolean>(false);

  // Form for new question
  const [newQuestion, setNewQuestion] = useState('');
  const [newSubject, setNewSubject] = useState('Psychology');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');

  const subjects = useMemo(() => {
    const s = new Set<string>();
    quizzes.forEach(q => s.add(q.subject));
    return ['all', ...Array.from(s)];
  }, [quizzes]);

  const activeQuestions = useMemo(() => {
    if (selectedSubject === 'all') return quizzes;
    return quizzes.filter(q => q.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [quizzes, selectedSubject]);

  const currentQ: QuizQuestion | undefined = activeQuestions[currentIndex];

  const handleStartExam = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setUserAnswers({});
    setIsExamFinished(false);
    setExamStarted(true);
  };

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOption(idx);
  };

  const handleSubmitCurrentAnswer = () => {
    if (selectedOption === null) return;
    setHasSubmittedAnswer(true);
    setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
    } else {
      setIsExamFinished(true);
      playCompletionChime();
    }
  };

  const handleSaveCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some(o => !o.trim()) || !newExplanation.trim()) return;

    addQuizQuestion({
      question: newQuestion.trim(),
      subject: newSubject.trim(),
      options: newOptions.map(o => o.trim()),
      correctIndex: newCorrectIndex,
      explanation: newExplanation.trim(),
    });

    setIsCreatingQuestion(false);
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <Award className="mx-auto h-8 w-8 text-stone-400" />
        <h3 className="mt-3 font-serif text-lg font-semibold text-stone-900">
          No Practice Questions Found
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          Add custom practice questions to test your knowledge retention.
        </p>
        <button
          onClick={() => setIsCreatingQuestion(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-stone-50 hover:bg-stone-800"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Practice Question</span>
        </button>
      </div>
    );
  }

  // Score Screen
  if (isExamFinished) {
    const total = activeQuestions.length;
    let score = 0;
    activeQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score += 1;
    });
    const percent = Math.round((score / total) * 100);

    return (
      <div className="mx-auto max-w-2xl py-8 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-stone-50">
            <Award className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-stone-900">
            Practice Exam Results
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Assessment completed for {selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
          </p>

          <div className="mt-6 border-y border-stone-100 py-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500">Score</p>
              <p className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                {percent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Correct Answers</p>
              <p className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                {score} / {total}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleStartExam}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-5 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Exam</span>
            </button>
            <button
              onClick={() => setExamStarted(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Back to Overview
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Question Review & Concept Explanations
          </h3>

          <div className="space-y-3">
            {activeQuestions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctIndex;
              const chosen = userAnswers[idx];

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 bg-white ${
                    isCorrect ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs text-stone-500">
                      Question {idx + 1} · {q.subject}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCorrect ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="mt-2 font-medium text-sm text-stone-950">
                    {q.question}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = chosen === oIdx;
                      const isTargetCorrect = q.correctIndex === oIdx;

                      let rowClass = 'border-stone-100 bg-stone-50/50 text-stone-600';
                      if (isTargetCorrect) rowClass = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-medium';
                      else if (wasSelected) rowClass = 'border-red-300 bg-red-50 text-red-900';

                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 ${rowClass}`}
                        >
                          <span>{opt}</span>
                          {isTargetCorrect && <span className="text-[11px] font-semibold text-emerald-800">Correct Answer</span>}
                          {wasSelected && !isTargetCorrect && <span className="text-[11px] font-semibold text-red-800">Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                    <span className="font-semibold text-stone-800">Explanation: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam In Progress
  if (examStarted && currentQ) {
    const isAnswerSubmitted = hasSubmittedAnswer;

    return (
      <div className="mx-auto max-w-3xl py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExamStarted(false)}
            className="text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            ← Exit Exam
          </button>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>{currentQ.subject}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-stone-900">
              {currentIndex + 1} of {activeQuestions.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-stone-900 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Practice Item {currentIndex + 1}
          </span>
          <h2 className="mt-3 font-serif text-xl sm:text-2xl font-bold leading-relaxed text-stone-950">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="mt-6 space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = currentQ.correctIndex === idx;

              let style = 'border-stone-200 hover:border-stone-400 bg-white text-stone-800';
              if (isAnswerSubmitted) {
                if (isCorrectAnswer) {
                  style = 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium';
                } else if (isSelected) {
                  style = 'border-red-300 bg-red-50 text-red-950';
                } else {
                  style = 'border-stone-100 bg-stone-50/50 text-stone-400';
                }
              } else if (isSelected) {
                style = 'border-stone-900 bg-stone-900 text-stone-50';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left rounded-xl border p-4 text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold opacity-70">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswerSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if submitted */}
          {isAnswerSubmitted && (
            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-relaxed text-stone-700">
              <span className="font-semibold text-stone-900">Concept Breakdown: </span>
              {currentQ.explanation}
            </div>
          )}

          {/* Next Button */}
          <div className="mt-8 flex justify-end">
            {!isAnswerSubmitted ? (
              <button
                disabled={selectedOption === null}
                onClick={handleSubmitCurrentAnswer}
                className={`rounded-xl px-6 py-2.5 text-xs font-semibold transition-colors ${
                  selectedOption === null
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-semibold text-stone-50 hover:bg-stone-800"
              >
                <span>{currentIndex + 1 < activeQuestions.length ? 'Next Question' : 'Complete Exam'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overview / Welcome View
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Practice Exams & Self-Testing
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Simulate real exam pressure to calibrate your metacognitive accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Question</span>
          </button>
          <button
            onClick={handleStartExam}
            className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-5 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
          >
            <span>Start Practice Exam</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {subjects.map(subj => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              selectedSubject === subj
                ? 'bg-stone-900 text-stone-50'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {subj === 'all' ? 'All Subjects' : subj}
          </button>
        ))}
      </div>

      {/* Question Bank Preview */}
      <div className="space-y-3">
        {activeQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs hover:border-stone-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium text-stone-700">{q.subject}</span>
              <span className="font-mono">Item #{idx + 1}</span>
            </div>
            <h4 className="mt-2 font-serif text-base font-semibold text-stone-950">
              {q.question}
            </h4>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="rounded-lg bg-stone-50 px-3 py-1.5 border border-stone-100">
                  <span className="font-mono font-medium text-stone-400 mr-1.5">
                    {String.fromCharCode(65 + oIdx)}.
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal to add custom question */}
      {isCreatingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Create Practice Question
            </h3>
            <form onSubmit={handleSaveCustomQuestion} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="e.g. Which process triggers synaptic depression?"
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2.5 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Neuroscience, Computer Science"
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Answer Options (Choose the correct radio button) *
                </label>
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctChoice"
                      checked={newCorrectIndex === idx}
                      onChange={() => setNewCorrectIndex(idx)}
                      className="accent-stone-900"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={e => {
                        const val = e.target.value;
                        setNewOptions(prev => prev.map((o, i) => (i === idx ? val : o)));
                      }}
                      className="flex-1 rounded-lg border border-stone-300 p-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Explanation / Rationale *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newExplanation}
                  onChange={e => setNewExplanation(e.target.value)}
                  placeholder="Explain why this choice is correct and clarify common misconceptions..."
                  className="mt-1 w-full rounded-lg border border-stone-300 p-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingQuestion(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-stone-900 px-5 py-2 text-xs font-semibold text-stone-50 hover:bg-stone-800"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
