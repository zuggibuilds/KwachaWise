import React from 'react';

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
    <path d="M22 12a10 10 0 00-10-10" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default Spinner;
