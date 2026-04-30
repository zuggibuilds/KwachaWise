import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { AuthCard } from './AuthShared';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/app/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Track your ZMW spending in seconds"
      footer={
        <div className="space-y-2">
          <p>
            New here?{' '}
            <Link className="font-semibold text-brand-600" to="/register">
              Create an account
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Demo login: demo@kwachawise.app / KwachaWise2026!
          </p>
        </div>
      }
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-base"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="w-full rounded-xl border border-brand-100 px-4 py-3 text-base"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-brand-500 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  );
}
