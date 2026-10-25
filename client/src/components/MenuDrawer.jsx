import React from 'react';
import Logo from './Logo.jsx';

export default function MenuDrawer({
  isOpen,
  onClose,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onClearAll,
  onOpenAbout
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} aria-hidden="true" />

      <aside className="menu-drawer" role="dialog" aria-label="Conversation History & Menu">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Logo size={24} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>InGPT</span>
          </div>
          <button type="button" className="header-btn" onClick={onClose} aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New Conversation Button */}
        <button
          type="button"
          className="drawer-btn-new"
          onClick={() => {
            onNewConversation();
            onClose();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Conversation</span>
        </button>

        {/* History List */}
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Recent Conversations
        </div>

        <div className="drawer-history-list">
          {conversations.length === 0 ? (
            <div style={{ padding: '20px 0', fontSize: '0.86rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              No previous conversations
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`history-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                    {conv.title || 'Conversation'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Drawer Footer Actions */}
        <footer className="drawer-footer">
          {conversations.length > 0 && (
            <button
              type="button"
              className="drawer-footer-btn"
              onClick={onClearAll}
              style={{ color: '#D32F2F' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            className="drawer-footer-btn"
            onClick={() => {
              onOpenAbout();
              onClose();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>About InGPT & Privacy</span>
          </button>
        </footer>
      </aside>
    </>
  );
}
