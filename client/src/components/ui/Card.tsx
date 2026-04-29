import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  role?: string;
};

export const Card: React.FC<Props> = ({ children, className = '', role = 'group' }) => {
  return (
    <div
      role={role}
      className={`bg-[var(--color-surface)] rounded-[var(--radius-md)] shadow-sm p-4 ${className}`}
      style={{ border: '1px solid var(--color-border)' }}
    >
      {children}
    </div>
  );
};

export default Card;
