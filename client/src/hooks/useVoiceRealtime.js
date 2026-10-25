import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioVisualizer } from './useAudioVisualizer.js';

export function useVoiceRealtime({
  voice = 'alloy',
  voiceOutputEnabled = true,
  onNewMessage = () => {},
  onNotification = () => {}
}) {
  const [sessionState, setSessionState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking' | 'reconnecting'
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionMode, setConnectionMode] = useState('unknown'); // 'realtime' | 'fallback'

  const { amplitude, initAudioStream, stopAudioStream } = useAudioVisualizer();

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const simulatedOscillatorRef = useRef(null);

  // Initialize invisible remote audio element
  useEffect(() => {
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);
    remoteAudioRef.current = audioEl;

    return () => {
      if (audioEl.parentNode) {
        audioEl.parentNode.removeChild(audioEl);
      }
    };
  }, []);

  // Cleanup all connections on unmount
  const endVoiceSession = useCallback(() => {
    // 1. Stop local media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // 2. Stop visualizer
    stopAudioStream();

    // 3. Close WebRTC peer connection
    if (dataChannelRef.current) {
      try { dataChannelRef.current.close(); } catch (_) {}
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch (_) {}
      peerConnectionRef.current = null;
    }

    // 4. Stop speech recognition fallback
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch (_) {}
      speechRecognitionRef.current = null;
    }

    // 5. Cancel any ongoing speech synthesis
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    setIsVoiceActive(false);
    setIsMuted(false);
    setSessionState('idle');
  }, [stopAudioStream]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const tracks = localStreamRef.current.getAudioTracks();
    if (tracks.length > 0) {
      const nextState = !tracks[0].enabled;
      tracks.forEach((t) => { t.enabled = nextState; });
      setIsMuted(!nextState);
      onNotification(nextState ? 'Microphone unmuted' : 'Microphone muted', 'info');
    }
  }, [onNotification]);

  // Start Realtime Voice Session
  const startVoiceSession = useCallback(async () => {
    try {
      setSessionState('thinking');

      // 1. Request microphone permission
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        localStreamRef.current = stream;
      } catch (micErr) {
        setSessionState('idle');
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          onNotification('Microphone permission was denied. Please allow microphone access in your browser to speak with InGPT.', 'error');
        } else {
          onNotification(`Could not access microphone: ${micErr.message}`, 'error');
        }
        return;
      }

      // Connect Web Audio API visualizer to local mic
      initAudioStream(stream);

      // 2. Request ephemeral session from backend
      let sessionData = null;
      try {
        const res = await fetch('/api/realtime/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voice })
        });
        sessionData = await res.json();
      } catch (netErr) {
        console.warn('Could not contact realtime session endpoint:', netErr.message);
      }

      // 3. Connect via OpenAI Realtime WebRTC if available
      if (sessionData && sessionData.available && sessionData.clientSecret) {
        setConnectionMode('realtime');
        await connectWebRTC(sessionData, stream);
      } else {
        // Fallback to Web Speech API mode
        setConnectionMode('fallback');
        startFallbackVoiceMode(stream);
      }

      setIsVoiceActive(true);
      setSessionState('listening');
    } catch (err) {
      console.error('Failed to start voice session:', err);
      endVoiceSession();
      onNotification('Unable to initialize voice session. Continuing in text mode.', 'error');
    }
  }, [voice, initAudioStream, endVoiceSession, onNotification]);

  // Connect via WebRTC to OpenAI Realtime API
  const connectWebRTC = async (sessionData, stream) => {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;

    // Handle remote audio stream from OpenAI
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        // Connect visualizer to AI speech track when active
        initAudioStream(event.streams[0]);
      }
    };

    // Add local microphone audio track
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Create Data Channel for realtime events
    const dc = pc.createDataChannel('oai-events');
    dataChannelRef.current = dc;

    dc.onopen = () => {
      console.log('[InGPT WebRTC] Data channel established.');
    };

    let assistantSpeechBuffer = '';

    dc.onmessage = (e) => {
      try {
        const realtimeEvent = JSON.parse(e.data);

        // User speech started (interruption)
        if (realtimeEvent.type === 'input_audio_buffer.speech_started') {
          setSessionState('listening');
          initAudioStream(localStreamRef.current);
        }

        // AI Response audio started
        if (realtimeEvent.type === 'response.audio.started') {
          setSessionState('speaking');
        }

        // Assistant transcript delta
        if (realtimeEvent.type === 'response.audio_transcript.delta') {
          assistantSpeechBuffer += realtimeEvent.delta;
        }

        // Assistant transcript done
        if (realtimeEvent.type === 'response.audio_transcript.done') {
          if (assistantSpeechBuffer.trim()) {
            onNewMessage({
              id: 'rt_' + Date.now(),
              role: 'assistant',
              content: assistantSpeechBuffer.trim(),
              timestamp: Date.now()
            });
            assistantSpeechBuffer = '';
          }
          setSessionState('listening');
          initAudioStream(localStreamRef.current);
        }

        // User speech transcription
        if (realtimeEvent.type === 'conversation.item.input_audio_transcription.completed') {
          if (realtimeEvent.transcript?.trim()) {
            onNewMessage({
              id: 'user_' + Date.now(),
              role: 'user',
              content: realtimeEvent.transcript.trim(),
              timestamp: Date.now()
            });
          }
        }
      } catch (err) {
        console.warn('Error parsing realtime event:', err);
      }
    };

    // Create SDP offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = 'https://api.openai.com/v1/realtime';
    const model = sessionData.model || 'gpt-4o-realtime-preview-2024-12-17';
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${sessionData.clientSecret}`,
        'Content-Type': 'application/sdp'
      }
    });

    if (!sdpResponse.ok) {
      throw new Error(`OpenAI SDP handshake failed: ${sdpResponse.status}`);
    }

    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
  };

  // Fallback Voice Mode using Web Speech API + Express backend
  const startFallbackVoiceMode = (stream) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onNotification('Browser speech recognition is not supported in this browser. Please use text chat.', 'error');
      setSessionState('idle');
      return;
    }

    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Model handles any spoken language

    recognition.onstart = () => {
      setSessionState('listening');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (!transcript.trim()) return;

      setSessionState('thinking');

      // Add user message
      onNewMessage({
        id: 'user_' + Date.now(),
        role: 'user',
        content: transcript.trim(),
        timestamp: Date.now()
      });

      // Send to backend
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: transcript.trim() })
        });
        const data = await res.json();

        if (data.reply) {
          onNewMessage({
            id: data.messageId || 'asst_' + Date.now(),
            role: 'assistant',
            content: data.reply,
            language: data.language,
            isRTL: data.isRTL,
            toolUsed: data.toolUsed,
            timestamp: Date.now()
          });

          // Speak reply if voice output is enabled
          if (voiceOutputEnabled && synthRef.current) {
            setSessionState('speaking');
            const utterance = new SpeechSynthesisUtterance(data.reply);
            
            // Set language code on utterance if detected
            if (data.language?.code) {
              utterance.lang = data.language.code;
            }

            utterance.onend = () => {
              setSessionState('listening');
            };
            utterance.onerror = () => {
              setSessionState('listening');
            };

            synthRef.current.speak(utterance);
          } else {
            setSessionState('listening');
          }
        }
      } catch (err) {
        console.error('Chat error in fallback:', err);
        setSessionState('listening');
      }
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      if (e.error === 'not-allowed') {
        endVoiceSession();
        onNotification('Microphone permission was revoked.', 'error');
      }
    };

    recognition.onend = () => {
      // Restart if still active
      if (isVoiceActive && speechRecognitionRef.current) {
        try { speechRecognitionRef.current.start(); } catch (_) {}
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
    }
  };

  // Toggle voice session
  const toggleVoiceSession = useCallback(() => {
    if (isVoiceActive) {
      endVoiceSession();
    } else {
      startVoiceSession();
    }
  }, [isVoiceActive, endVoiceSession, startVoiceSession]);

  return {
    sessionState,
    setSessionState,
    isVoiceActive,
    isMuted,
    connectionMode,
    amplitude,
    toggleVoiceSession,
    toggleMute,
    endVoiceSession
  };
}
