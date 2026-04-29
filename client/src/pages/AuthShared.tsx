import { Link } from 'react-router-dom';

export function AuthCard({
  title,
  subtitle,
  footer,
  children
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">KwachaWise</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
        <div className="mt-5 text-sm text-slate-600">{footer}</div>
      </div>
      <Link className="mt-4 text-center text-xs text-slate-500" to="/">
        Secure JWT session stored in localStorage for MVP only.
      </Link>
    </div>
  );
}
