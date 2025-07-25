// client/src/components/Breathing/BreathingExercise.jsx
import { useState, useEffect } from 'react';

function BreathingExercise() {
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isRunning, setIsRunning] = useState(true);

  // Breathing durations (in seconds)
  const durations = {
    inhale: 4,
    hold: 4,
    exhale: 6
  };

  useEffect(() => {
    if (!isRunning) return;

    const currentDuration = durations[phase] * 1000;
    const interval = currentDuration / 100; // Update 100 times per phase

    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / currentDuration) * 100, 100);
      setProgress(progress);

      if (progress >= 100) {
        // Move to next phase
        setPhase(prev => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          return 'inhale';
        });
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [phase, isRunning]);

  // Dynamic circle size and color
  const size = 120 + (phase === 'inhale' ? progress : phase === 'exhale' ? 100 - progress : 50) * 1.5;
  const bgColor = phase === 'inhale' 
    ? `rgba(99, 102, 241, ${0.2 + (progress / 100) * 0.4})`
    : phase === 'hold'
    ? `rgba(168, 85, 247, ${0.4 + (progress / 100) * 0.4})`
    : `rgba(245, 158, 11, ${0.6 - (progress / 100) * 0.4})`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '2rem',
        background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '2rem'
      }}>
        🧘 Guided Breathing
      </h2>

      {/* Breathing Circle */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        border: '2px solid rgba(251, 191, 36, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fbbf24',
        fontSize: '1.3rem',
        fontWeight: 600,
        transition: 'all 0.1s ease-out',
        backdropFilter: 'blur(5px)',
        marginBottom: '1.5rem'
      }}>
        {phase === 'inhale' && 'Breathe In'}
        {phase === 'hold' && 'Hold'}
        {phase === 'exhale' && 'Breathe Out'}
      </div>

      <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
        Inhale for {durations.inhale}s, hold for {durations.hold}s, exhale for {durations.exhale}s
      </p>

      {/* Control Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#e11d48' : '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => {
            setPhase('inhale');
            setProgress(0);
            setIsRunning(true);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#5a67d8',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}

export default BreathingExercise;