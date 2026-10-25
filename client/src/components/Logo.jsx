import React from 'react';

/**
 * Original InGPT Logo:
 * Continuous infinity-orbit / flowing soundwave minimal vector graphic.
 * Soft blue (#8DA8DE), silver-white, and restrained lavender (#D4CCE8).
 */
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="InGPT Logo"
    >
      <defs>
        <linearGradient id="ingpt-logo-grad1" x1="6" y1="14" x2="42" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8DA8DE" />
          <stop offset="50%" stopColor="#A9C4F5" />
          <stop offset="80%" stopColor="#D4CCE8" />
          <stop offset="100%" stopColor="#8DA8DE" />
        </linearGradient>
        <linearGradient id="ingpt-logo-grad2" x1="14" y1="34" x2="34" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8DA8DE" stopOpacity="0.3" />
        </linearGradient>
        <filter id="ingpt-subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Infinity-orbit soundwave loop */}
      <path 
        d="M14 24 C14 18 19 14 24 24 C29 34 34 30 34 24 C34 18 29 14 24 24 C19 34 14 30 14 24 Z" 
        stroke="url(#ingpt-logo-grad1)" 
        strokeWidth="3.6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#ingpt-subtle-glow)"
      />

      {/* Shimmering nodes */}
      <circle cx="24" cy="24" r="2.4" fill="#FFFFFF" />
      <circle cx="16" cy="21" r="1.4" fill="#A9C4F5" />
      <circle cx="32" cy="27" r="1.4" fill="#D4CCE8" />
    </svg>
  );
}
