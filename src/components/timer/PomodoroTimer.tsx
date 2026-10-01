import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Bell, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { playAmbientSound, stopAmbientSound, setAmbientVolume, playCompletionChime, AmbientSoundType } from '../../utils/audio';

interface TimerPreset {
  id: string;
  name: string;
  durationMinutes: number;
  type: 'focus' | 'break';
}

const PRESETS: TimerPreset[] = [
  { id: 'pomo25', name: '25m Pomodoro', durationMinutes: 25, type: 'focus' },
  { id: 'deep50', name: '50m Deep Study', durationMinutes: 50, type: 'focus' },
  { id: 'sprint15', name: '15m Review Sprint', durationMinutes: 15, type: 'focus' },
  { id: 'short5', name: '5m Short Break', durationMinutes: 5, type: 'break' },
  { id: 'long15', name: '15m Long Break', durationMinutes: 15, type: 'break' },
];

const SOUNDSCAPES: { type: AmbientSoundType; label: string; desc: string }[] = [
  { type: 'none', label: 'Silence', desc: 'No background audio' },
  { type: 'brown-noise', label: 'Deep Brown Noise', desc: 'Warm rumble, blocks sudden external noises' },
  { type: 'soft-rain', label: 'Rain on Skylight', desc: 'Gentle droplet texture for deep immersion' },
  { type: 'alpha-waves', label: 'Alpha Study Waves (10Hz)', desc: 'Binaural tone for calm, relaxed vigilance' },
  { type: 'gamma-focus', label: 'Gamma Recall (40Hz)', desc: 'High-frequency binaural rhythm for retention' },
  { type: 'white-noise', label: 'Smooth White Noise', desc: 'Constant acoustic curtain' },
];

export const PomodoroTimer: React.FC<{ onAudioStateChange?: (isPlaying: boolean) => void }> = ({
  onAudioStateChange,
}) => {
  const { tasks, logFocusMinutes, toggleTask } = useStudy();

  const [currentPreset, setCurrentPreset] = useState<TimerPreset>(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState<number>(PRESETS[0].durationMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [customGoal, setCustomGoal] = useState<string>('');

  // Ambient sound states
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.35);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  const initialTotalSeconds = currentPreset.durationMinutes * 60;
  const progressRatio = (initialTotalSeconds - timeLeft) / initialTotalSeconds;

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed timer!
      setIsRunning(false);
      playCompletionChime();
      if (currentPreset.type === 'focus') {
        logFocusMinutes(currentPreset.durationMinutes);
        setCompletedSessionsCount(prev => prev + 1);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentPreset, logFocusMinutes]);

  // Ambient sound controller
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      playAmbientSound(ambientSound, volume);
      onAudioStateChange?.(true);
    } else {
      stopAmbientSound();
      onAudioStateChange?.(false);
    }

    return () => {
      stopAmbientSound();
      onAudioStateChange?.(false);
    };
  }, [isRunning, ambientSound, onAudioStateChange]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  const handleSelectPreset = (preset: TimerPreset) => {
    setCurrentPreset(preset);
    setIsRunning(false);
    setTimeLeft(preset.durationMinutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(currentPreset.durationMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Preset Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              currentPreset.id === preset.id
                ? 'bg-stone-900 text-stone-50 shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Focus Dial */}
      <div className="rounded-2xl border border-stone-200 bg-white p-8 sm:p-12 shadow-2xs text-center">
        
        {/* Unboxed Status Kicker */}
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
          <span className="font-semibold uppercase tracking-wider text-stone-700">
            {currentPreset.type === 'focus' ? 'Deep Work Block' : 'Restorative Break'}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>{currentPreset.name}</span>
          {completedSessionsCount > 0 && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono text-stone-900">{completedSessionsCount} blocks done</span>
            </>
          )}
        </div>

        {/* Circular SVG Ring & Time Counter */}
        <div className="relative mx-auto mt-8 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-stone-100"
              strokeWidth="5"
              fill="none"
            />
            {/* Animated progress circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`transition-all duration-1000 ease-linear ${
                currentPreset.type === 'focus' ? 'stroke-stone-900' : 'stroke-emerald-600'
              }`}
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - progressRatio)}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold tracking-tight text-stone-950 sm:text-6xl tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="mt-1 text-xs text-stone-500">
              {isRunning ? 'Session in progress' : 'Ready to focus'}
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset Timer"
            className="flex items-center justify-center rounded-xl border border-stone-200 p-3 text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Goal / Task Attachment */}
        <div className="mt-8 max-w-md mx-auto pt-6 border-t border-stone-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 text-left">
            Current Focus Target
          </label>
          <div className="mt-2 flex gap-2">
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
            >
              <option value="">Select study task or custom target...</option>
              {tasks.filter(t => !t.completed).map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.estimatedMinutes}m · {t.subject})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Web Audio Soundscape Panel */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Acoustic Focus Soundscape
            </h3>
            <p className="text-xs text-stone-500">
              Synthesized in real-time via Web Audio API. Zero distraction, pure focus.
            </p>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 text-stone-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-stone-700" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              className="w-28 accent-stone-900"
            />
            <span className="font-mono text-xs text-stone-500 w-8 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Sound Presets */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SOUNDSCAPES.map(snd => {
            const isSelected = ambientSound === snd.type;
            return (
              <button
                key={snd.type}
                onClick={() => setAmbientSound(snd.type)}
                className={`text-left rounded-xl p-3.5 border transition-all ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-stone-50'
                    : 'border-stone-200 bg-stone-50/50 text-stone-800 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">{snd.label}</span>
                  {isSelected && isRunning && (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <p className={`mt-1 text-[11px] leading-snug ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {snd.desc}
                </p>
              </button>
            );
          })}
        </div>

        {ambientSound !== 'none' && !isRunning && (
          <p className="mt-3 text-center text-xs text-stone-500 italic">
            Audio will automatically play when you press "Start Focus".
          </p>
        )}
      </div>
    </div>
  );
};
