import React from 'react';
import clsx from 'clsx';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  startAdornment?: React.ReactNode;
};

export const Input: React.FC<Props> = ({ label, error, startAdornment, className, ...rest }) => {
  return (
    <label className="w-full">
      {label && <div className="mb-2 text-sm font-medium text-[var(--color-text)]">{label}</div>}
      <div className={clsx('flex items-center bg-[var(--color-surface)] border rounded-md px-3', className)} style={{ borderColor: 'var(--color-border)' }}>
        {startAdornment && <div className="mr-2 text-sm text-[var(--color-muted)]">{startAdornment}</div>}
        <input
          {...rest}
          className="flex-1 py-3 bg-transparent outline-none text-[var(--color-text)]"
        />
      </div>
      {error && <div className="mt-1 text-xs text-[var(--color-danger)]">{error}</div>}
    </label>
  );
};

export default Input;
