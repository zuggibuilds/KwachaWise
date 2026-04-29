import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error';
};

export const Toast: React.FC<Props> = ({ open, onClose, children, variant = 'default' }) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    open ? (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-60">
        <div
          className={`px-4 py-3 rounded-md shadow-sm text-sm text-white ${
            variant === 'success' ? 'bg-[var(--color-success)]' : variant === 'error' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'
          }`}
        >
          {children}
        </div>
      </div>
    ) : null,
    document.body
  );
};

export default Toast;
