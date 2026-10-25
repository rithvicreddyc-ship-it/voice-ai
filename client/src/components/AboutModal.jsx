import React from 'react';
import Logo from './Logo.jsx';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />

      <div className="settings-modal" style={{ maxWidth: 480 }} role="dialog" aria-label="About InGPT">
        <header className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={28} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>InGPT</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your AI. Your Voice. Your Conversation.</p>
            </div>
          </div>
          <button type="button" className="header-btn" onClick={onClose} aria-label="Close about">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div style={{ display: 'flex', flexExpansion: 1, flexDirection: 'column', gap: 14, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          <p>
            InGPT is an all-in-one conversational AI voice assistant crafted for effortless, natural speech and multi-turn conversations.
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Multilingual by Design</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Supports all 22 official languages in the Eighth Schedule of the Indian Constitution (Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia, Assamese, Urdu, etc.) and major world languages with automatic script and language adaptation.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Live Connected Services</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Integrated with real-time weather forecasts, verified factual web searches, and exact local time across the globe.
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Privacy & Security</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Audio processing is isolated to your active session. Microphone tracks are instantly released upon disconnect.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
