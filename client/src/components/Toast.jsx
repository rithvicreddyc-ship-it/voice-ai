import React from 'react';

export default function Toast({ toasts = [], onDismiss = () => {} }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <span>{t.text}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            style={{ marginLeft: 8, opacity: 0.6, fontSize: '1rem', cursor: 'pointer' }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
