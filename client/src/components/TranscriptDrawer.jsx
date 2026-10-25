import React, { useEffect, useRef } from 'react';

export default function TranscriptDrawer({
  isOpen,
  onClose,
  messages = [],
  onClear = () => {}
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop */}
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />

      {/* Slide-up panel */}
      <section className="transcript-panel" role="dialog" aria-label="Conversation Transcript">
        <header className="transcript-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Conversation</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({messages.length} message{messages.length === 1 ? '' : 's'})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '4px 8px' }}
                title="Clear current transcript"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              className="header-btn"
              onClick={onClose}
              aria-label="Close Transcript"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="transcript-body" ref={scrollRef}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>No messages yet. Speak or type to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isRtl = msg.isRTL || ['ur', 'ar', 'he', 'fa', 'ks', 'sd'].includes(msg.language?.code);

              return (
                <div
                  key={msg.id || idx}
                  className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {/* Metadata: language tag or tool tag */}
                  <div style={{ 
                    marginTop: 6, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    fontSize: '0.72rem', 
                    opacity: 0.75,
                    justifyContent: isUser ? 'flex-end' : 'flex-start'
                  }}>
                    {msg.language?.nativeName && (
                      <span>{msg.language.nativeName}</span>
                    )}
                    {msg.toolUsed && (
                      <span style={{ 
                        background: 'rgba(255,255,255,0.4)', 
                        padding: '1px 6px', 
                        borderRadius: 4,
                        fontWeight: 600
                      }}>
                        ⚡ {msg.toolUsed}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
