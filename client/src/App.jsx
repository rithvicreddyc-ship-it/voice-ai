import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import Orb from './components/Orb.jsx';
import BottomControls from './components/BottomControls.jsx';
import MouseGlow from './components/MouseGlow.jsx';
import MenuDrawer from './components/MenuDrawer.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import AboutModal from './components/AboutModal.jsx';
import TranscriptDrawer from './components/TranscriptDrawer.jsx';
import Toast from './components/Toast.jsx';
import { useVoiceRealtime } from './hooks/useVoiceRealtime.js';

import './styles/index.css';
import './styles/orb.css';
import './styles/controls.css';

export default function App() {
  // Conversation and Messages State
  const [activeConversationId, setActiveConversationId] = useState(() => 'conv_' + Date.now());
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  // UI Modal / Drawer States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  // Settings & Preferences
  const [voice, setVoice] = useState('alloy');
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [isRealtimeAvailable, setIsRealtimeAvailable] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((text, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial conversations list & backend health
  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      }
    } catch (err) {
      console.warn('Could not load conversations:', err.message);
    }
  }, []);

  useEffect(() => {
    refreshConversations();

    // Check health & OpenAI realtime status
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setIsRealtimeAvailable(!!data.capabilities?.realtimeVoice);
      })
      .catch(() => {});
  }, [refreshConversations]);

  // Handle incoming message from voice hook
  const handleNewVoiceMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
    refreshConversations();
  }, [refreshConversations]);

  // Real-time Voice Hook
  const {
    sessionState: voiceSessionState,
    setSessionState: setVoiceSessionState,
    isVoiceActive,
    isMuted,
    amplitude,
    toggleVoiceSession,
    toggleMute,
    endVoiceSession
  } = useVoiceRealtime({
    voice,
    voiceOutputEnabled,
    onNewMessage: handleNewVoiceMessage,
    onNotification: addToast
  });

  // Effective State for the Central Orb
  const currentOrbState = isVoiceActive ? voiceSessionState : (isThinking ? 'thinking' : 'idle');

  // Handle Text Message Submission
  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || isThinking) return;

    const userMsg = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationId: activeConversationId,
          history: messages.slice(-10)
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Unable to process message');
      }

      const data = await res.json();

      const assistantMsg = {
        id: data.messageId || 'msg_asst_' + Date.now(),
        role: 'assistant',
        content: data.reply,
        language: data.language,
        isRTL: data.isRTL,
        toolUsed: data.toolUsed,
        timestamp: data.timestamp || Date.now()
      };

      setMessages((prev) => [...prev, assistantMsg]);
      refreshConversations();

      // If voice output is enabled and not in active voice call, optionally synthesize
      if (voiceOutputEnabled && window.speechSynthesis && !isVoiceActive) {
        try {
          const utterance = new SpeechSynthesisUtterance(data.reply);
          if (data.language?.code) {
            utterance.lang = data.language.code;
          }
          window.speechSynthesis.speak(utterance);
        } catch (_) {}
      }
    } catch (err) {
      console.error('Chat error:', err);
      addToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsThinking(false);
    }
  };

  // Switch Conversation
  const handleSelectConversation = async (convId) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setActiveConversationId(data.conversation.id);
          setMessages(data.conversation.messages || []);
        }
      }
    } catch (err) {
      addToast('Could not load conversation', 'error');
    }
  };

  // Start Fresh Conversation
  const handleNewConversation = () => {
    setActiveConversationId('conv_' + Date.now());
    setMessages([]);
    if (isVoiceActive) endVoiceSession();
    addToast('Started new conversation', 'info');
  };

  // Clear All Saved Conversations
  const handleClearAllConversations = async () => {
    try {
      await fetch('/api/conversations', { method: 'DELETE' });
      setConversations([]);
      setMessages([]);
      setActiveConversationId('conv_' + Date.now());
      setIsMenuOpen(false);
      addToast('Conversation history cleared', 'info');
    } catch (err) {
      addToast('Could not clear history', 'error');
    }
  };

  // Orb click triggers voice conversation toggle
  const handleOrbClick = () => {
    toggleVoiceSession();
  };

  return (
    <div className="ingpt-app">
      {/* Signature soft blue-white mouse glow */}
      <MouseGlow />

      {/* Toast Alert Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Header */}
      <Header
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Center Stage */}
      <main className="ingpt-stage">
        <Orb
          state={currentOrbState}
          amplitude={amplitude}
          greeting="Hi, I'm InGPT."
          onClick={handleOrbClick}
        />
      </main>

      {/* Bottom Controls */}
      <BottomControls
        isVoiceActive={isVoiceActive}
        isMuted={isMuted}
        onToggleVoice={toggleVoiceSession}
        onToggleMute={toggleMute}
        onEndVoice={endVoiceSession}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
        transcriptCount={messages.length}
        onToggleTranscript={() => setIsTranscriptOpen((prev) => !prev)}
      />

      {/* Left Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onClearAll={handleClearAllConversations}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voice={voice}
        onChangeVoice={setVoice}
        voiceOutputEnabled={voiceOutputEnabled}
        onToggleVoiceOutput={setVoiceOutputEnabled}
        isRealtimeAvailable={isRealtimeAvailable}
        onClearHistory={handleClearAllConversations}
      />

      {/* About & Privacy Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Slide-Up Transcript Sheet */}
      <TranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        messages={messages}
        onClear={() => setMessages([])}
      />
    </div>
  );
}
