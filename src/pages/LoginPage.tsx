import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { requestMagicLink, verifyMagicLink } from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendLink = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await requestMagicLink(email.trim().toLowerCase());
      const msg = typeof res.message === 'string' ? res.message : 'Check your email for a login code.';
      setMessage(msg);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleVerify = useCallback(async () => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyMagicLink(email.trim().toLowerCase(), code.trim());
      login(res.authToken, res.user);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, code, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-cream)] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Small Shop Social</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {step === 'email' ? (
          <>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:border-transparent transition"
              autoFocus
              disabled={loading}
            />
            <button
              onClick={handleSendLink}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-[var(--color-brand-pink)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </>
        ) : (
          <>
            {message && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--color-brand-pink-light)] text-[var(--color-text-secondary)] text-sm">
                {message}
              </div>
            )}
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Enter the 6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] text-center text-2xl font-mono tracking-[0.3em] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] focus:border-transparent transition"
              autoFocus
              disabled={loading}
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-[var(--color-brand-pink)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={() => { setStep('email'); setCode(''); setError(''); setMessage(''); }}
              className="w-full mt-2 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition"
            >
              Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
