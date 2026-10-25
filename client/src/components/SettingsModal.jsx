import React from 'react';

export default function SettingsModal({
  isOpen,
  onClose,
  voice,
  onChangeVoice,
  voiceOutputEnabled,
  onToggleVoiceOutput,
  connectionStatus = 'ready',
  isRealtimeAvailable = false,
  onClearHistory
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="settings-modal" role="dialog" aria-label="InGPT Settings">
        <header className="settings-header">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Settings</h2>
          <button type="button" className="header-btn" onClick={onClose} aria-label="Close settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="settings-group">
          {/* Connection Status */}
          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Connection Mode</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isRealtimeAvailable ? 'OpenAI Realtime WebRTC' : 'Browser Web Speech + Express API'}
              </div>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '9999px',
              background: isRealtimeAvailable ? '#E8F5E9' : '#EDE7F6',
              color: isRealtimeAvailable ? '#2E7D32' : '#5E35B1'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              {isRealtimeAvailable ? 'Live Realtime' : 'Adaptive Fallback'}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Voice Output Toggle */}
          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>Spoken Voice Output</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hear AI responses spoken aloud</div>
            </div>
            <input
              type="checkbox"
              checked={voiceOutputEnabled}
              onChange={(e) => onToggleVoiceOutput(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
            />
          </div>

          {/* Preferred Assistant Voice */}
          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 500 }}>AI Voice Persona</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Realtime voice timbre</div>
            </div>
            <select
              className="settings-select"
              value={voice}
              onChange={(e) => onChangeVoice(e.target.value)}
            >
              <option value="alloy">Alloy (Warm & Balanced)</option>
              <option value="echo">Echo (Soft & Resonant)</option>
              <option value="shimmer">Shimmer (Clear & Bright)</option>
              <option value="ash">Ash (Gentle & Calm)</option>
              <option value="ballad">Ballad (Smooth & Melodic)</option>
              <option value="coral">Coral (Bright & Friendly)</option>
              <option value="sage">Sage (Reflective & Wise)</option>
              <option value="verse">Verse (Articulate)</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

          {/* Microphone Permission Info */}
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>Microphone Access</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              InGPT uses your microphone solely during active voice sessions. Your audio is analyzed locally in real time to deform the Voice Orb and stream speech to the assistant.
            </p>
          </div>

          {/* Privacy Note */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 4 }}>
            InGPT does not store raw audio recordings. Automatic language recognition operates on the fly.
          </p>
        </div>
      </div>
    </>
  );
}
