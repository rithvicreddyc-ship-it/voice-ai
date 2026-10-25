import React, { useEffect, useRef, useState } from 'react';

/**
 * Signature Mouse Effect:
 * Soft blue-white radial glow that smoothly follows the cursor.
 * Disabled on touchscreens, coarse pointers, and reduced-motion environments.
 */
export default function MouseGlow() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);
  const targetPos = useRef({ x: -500, y: -500 });
  const currentPos = useRef({ x: -500, y: -500 });
  const rafId = useRef(null);

  useEffect(() => {
    // Check for touch / coarse pointer or reduced motion
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const onMouseMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth lerp animation loop
    const animate = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      
      currentPos.current.x += dx * 0.12;
      currentPos.current.y += dy * 0.12;

      setPos({ x: currentPos.current.x, y: currentPos.current.y });
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  if (!enabled) return null;

  return (
    <div
      className="mouse-glow-canvas"
      style={{
        opacity: visible ? 1 : 0,
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(141, 168, 222, 0.11), rgba(229, 224, 242, 0.05) 45%, transparent 75%)`
      }}
      aria-hidden="true"
    />
  );
}
