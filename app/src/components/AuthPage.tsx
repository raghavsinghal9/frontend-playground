import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setInfo('Account created! Check your inbox to confirm your email, then sign in.');
          setMode('login');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <img className="logo-big" src="/favicon.svg" alt="" />
        <h1>Prep Tracker</h1>
        <p className="lead">
          Your 12-week frontend interview prep — organized like a sprint board.
          Track every ticket across phases, weeks, and days.
        </p>

        {!isSupabaseConfigured && (
          <div className="alert alert-error">
            Supabase isn't configured. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-ok">{info}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy || !isSupabaseConfigured}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
              setInfo('');
            }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
