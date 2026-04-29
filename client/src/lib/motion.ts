export const motion = {
  durations: {
    instant: '80ms',
    fast: '160ms',
    medium: '360ms',
    slow: '640ms'
  },
  easings: {
    standard: 'cubic-bezier(.2,.9,.2,1)',
    emphasized: 'cubic-bezier(.16,1,.3,1)'
  },
  distances: {
    lift: '6px',
    slideSm: '8px',
    slideMd: '16px'
  }
};

export const prefersReducedMotionQuery = '(prefers-reduced-motion: reduce)';
