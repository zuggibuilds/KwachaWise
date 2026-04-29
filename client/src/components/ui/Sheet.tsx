import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
};

export const Sheet: React.FC<SheetProps> = ({ open, onClose, children, 'aria-label': ariaLabel }) => {
  const reduced = usePrefersReducedMotion();
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!nodeRef.current) return;
    if (open) {
      nodeRef.current.style.display = 'block';
      requestAnimationFrame(() => {
        nodeRef.current && (nodeRef.current.style.transform = 'translateY(0)');
        nodeRef.current && (nodeRef.current.style.opacity = '1');
      });
    } else {
      if (reduced) {
        nodeRef.current.style.display = 'none';
      } else {
        nodeRef.current.style.transform = 'translateY(100%)';
        nodeRef.current.style.opacity = '0';
        setTimeout(() => {
          if (nodeRef.current) nodeRef.current.style.display = 'none';
        }, 320);
      }
    }
  }, [open, reduced]);

  return createPortal(
    <div
      aria-hidden={!open}
      role="dialog"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 flex items-end justify-center ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={nodeRef}
        className="w-full max-h-[92vh] bg-[var(--color-surface)] rounded-t-[var(--radius-md)] shadow-lg overflow-auto"
        style={{
          transform: 'translateY(100%)',
          transition: `transform var(--motion-medium) var(--ease-standard), opacity var(--motion-fast) var(--ease-standard)`,
          opacity: 0,
        }}
      >
        <div className="w-full flex justify-center my-2">
          <div className="w-12 h-0.5 bg-[var(--color-border)] rounded-full" />
        </div>
        <div className="px-4 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Sheet;
