import React, { useMemo } from 'react';

/**
 * Signature Voice Orb:
 * Unique blue-white sphere with soft blue gradient, cloud-like white highlight,
 * gentle inner lighting, subtle shadow, and fluid audio-reactive deformation.
 */
export default function Orb({
  state = 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking' | 'reconnecting'
  amplitude = 0,   // 0.0 to 1.0 (Web Audio API real audio level)
  greeting = "Hi, I'm InGPT.",
  onClick = () => {}
}) {
  // Compute fluid scaling based on audio amplitude and state
  const dynamicTransform = useMemo(() => {
    if (state === 'listening' || state === 'speaking') {
      const scale = 1 + Math.min(amplitude * 0.22, 0.25);
      return `scale(${scale})`;
    }
    return undefined;
  }, [state, amplitude]);

  const dynamicAuraTransform = useMemo(() => {
    if (state === 'listening' || state === 'speaking') {
      const scale = 1 + Math.min(amplitude * 0.45, 0.55);
      return `scale(${scale})`;
    }
    return undefined;
  }, [state, amplitude]);

  // Status label text
  const statusLabel = useMemo(() => {
    switch (state) {
      case 'listening': return 'Listening';
      case 'thinking': return 'Thinking';
      case 'speaking': return 'Speaking';
      case 'reconnecting': return 'Reconnecting';
      case 'idle':
      default:
        return 'Ready when you are';
    }
  }, [state]);

  return (
    <section className={`orb-container state-${state}`} aria-live="polite">
      {/* Interactive Orb Sphere */}
      <button 
        type="button"
        className="orb-wrapper" 
        onClick={onClick}
        aria-label={`InGPT Voice Assistant (${statusLabel}). Click to ${state === 'idle' ? 'start speaking' : 'stop session'}.`}
      >
        {/* Ambient aura glow */}
        <div 
          className="orb-aura" 
          style={dynamicAuraTransform ? { transform: dynamicAuraTransform } : {}}
        />

        {/* Core sphere */}
        <div 
          className="orb-sphere"
          style={dynamicTransform ? { transform: dynamicTransform } : {}}
        >
          {/* Cloud-like white highlight */}
          <div className="orb-cloud-highlight" />
          {/* Soft lavender luminescence accent */}
          <div className="orb-lavender-glow" />
          {/* Fluid sheen overlay */}
          <div className="orb-fluid-sheen" />
        </div>

        {/* Ground shadow beneath sphere */}
        <div className="orb-ground-shadow" />
      </button>

      {/* Greeting and Status Badge */}
      <div className="orb-meta">
        <h1 className="orb-greeting">{greeting}</h1>
        <div className="orb-status-pill">
          <span className="orb-status-dot" aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>
      </div>
    </section>
  );
}
