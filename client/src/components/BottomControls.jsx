import React, { useState } from 'react';

export default function BottomControls({
  isVoiceActive = false,
  isMuted = false,
  onToggleVoice = () => {},
  onToggleMute = () => {},
  onEndVoice = () => {},
  onSendMessage = () => {},
  isThinking = false,
  transcriptCount = 0,
  onToggleTranscript = () => {}
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isThinking) return;
    onSendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="ingpt-bottom-area">
      {/* Transcript Quick Toggle Pill */}
      {transcriptCount > 0 && (
        <button 
          type="button" 
          className="transcript-toggle-pill" 
          onClick={onToggleTranscript}
          aria-label="Toggle Conversation Transcript"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Transcript ({transcriptCount})</span>
        </button>
      )}

      {/* Active Voice Session Controls (Mute / End) */}
      {isVoiceActive && (
        <div className="voice-session-bar" role="toolbar" aria-label="Voice Session Controls">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            className={`voice-control-btn ${isMuted ? 'is-muted' : ''}`}
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* End Conversation Button */}
          <button
            type="button"
            className="voice-control-btn btn-end"
            onClick={onEndVoice}
            aria-label="End voice conversation"
            title="End conversation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Primary Input Dock */}
      <form className="input-dock" onSubmit={handleSubmit}>
        {/* Main Microphone Button */}
        <button
          type="button"
          className={`mic-btn-main ${isVoiceActive ? 'is-active' : ''}`}
          onClick={onToggleVoice}
          aria-label={isVoiceActive ? 'Stop listening' : 'Start real-time voice conversation'}
          title={isVoiceActive ? 'Stop listening' : 'Speak to InGPT'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask InGPT"
          aria-label="Message input"
          disabled={isThinking}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Send Button */}
        <div className="input-actions">
          <button
            type="submit"
            className="send-btn-main"
            disabled={!inputText.trim() || isThinking}
            aria-label="Send message"
            title="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </footer>
  );
}
