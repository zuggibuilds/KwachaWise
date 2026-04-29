import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { AuthCard } from './AuthShared';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Start budgeting with local insights"
      footer={
        <div className="space-y-2">
          <p>
            Already registered?{' '}
            <Link className="font-semibold text-brand-600" to="/login">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Or use the demo account from the sign-in screen.
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
          placeholder="Password (min 8 chars)"
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
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  );
}
