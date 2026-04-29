import React from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const PageTransition: React.FC<Props> = ({ children, className = '' }) => {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div
      className={`${className} transition-opacity duration-[360ms] ease-[var(--ease-standard)] will-change-transform transform`}
      style={{ opacity: 1 }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
