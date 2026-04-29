import React, { useState } from 'react';
import clsx from 'clsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button: React.FC<Props> = ({ variant = 'primary', size = 'md', className, children, ...rest }) => {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(false);

  const base = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none';
  const variants: Record<Variant, string> = {
    primary: 'bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-600)]',
    secondary: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text)]',
    ghost: 'bg-transparent text-[var(--color-text)]',
    destructive: 'bg-[var(--color-danger)] text-white'
  };

  const sizes: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm h-10',
    md: 'px-4 py-3 text-base h-12',
    lg: 'px-5 py-3 text-base h-14'
  };

  return (
    <button
      {...rest}
      className={clsx(base, variants[variant], sizes[size], className)}
      onMouseDown={() => !reduced && setActive(true)}
      onMouseUp={() => !reduced && setActive(false)}
      onMouseLeave={() => !reduced && setActive(false)}
      style={
        active && !reduced
          ? { transform: 'scale(0.98)', transition: 'transform 120ms var(--ease-standard)' }
          : { transform: 'none', transition: 'transform 120ms var(--ease-standard)' }
      }
    >
      {children}
    </button>
  );
};

export default Button;
