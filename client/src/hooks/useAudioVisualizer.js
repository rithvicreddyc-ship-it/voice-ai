import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Web Audio API Hook for real-time audio amplitude analysis.
 * Feeds normalized smoothed amplitude (0.0 - 1.0) into the Voice Orb.
 */
export function useAudioVisualizer() {
  const [amplitude, setAmplitude] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const smoothedLevelRef = useRef(0);

  const initAudioStream = useCallback((mediaStream) => {
    try {
      if (!mediaStream) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      // Close previous context if exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      sourceRef.current = source;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(1.0, average / 110);

        // Exponential smoothing (decay & attack)
        const alpha = normalized > smoothedLevelRef.current ? 0.35 : 0.15;
        smoothedLevelRef.current += (normalized - smoothedLevelRef.current) * alpha;

        setAmplitude(smoothedLevelRef.current);
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        });
      } else {
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      }
    } catch (err) {
      console.warn('AudioVisualizer setup error:', err);
    }
  }, []);

  const stopAudioStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    smoothedLevelRef.current = 0;
    setAmplitude(0);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioStream();
    };
  }, [stopAudioStream]);

  return {
    amplitude,
    initAudioStream,
    stopAudioStream
  };
}
