import { useState, useCallback, useEffect } from 'react';
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
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendLink = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestMagicLink(email.trim().toLowerCase());
      setStep('code');
      setResendCooldown(60);
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

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      await requestMagicLink(email.trim().toLowerCase());
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  }, [email, resendCooldown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10">
          <img
            src="/logo.png"
            alt="Small Shop Social"
            className="w-[200px] h-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-2 text-center">
          {step === 'email' ? 'Welcome Back' : 'Enter Your Code'}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 text-center leading-5">
          {step === 'email'
            ? 'Enter your email to receive a login code'
            : `We sent a 6-digit code to ${email}`}
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center">{error}</div>
        )}

        {step === 'email' ? (
          <>
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                placeholder="Enter your email..."
                className="w-full h-[52px] px-4 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] transition"
                autoFocus
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSendLink}
              disabled={loading}
              className="w-full h-[52px] rounded-full bg-[var(--color-brand-pink)] text-white font-semibold text-base hover:opacity-90 disabled:opacity-70 transition mb-4"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Not a member yet?</p>
              <a
                href="https://instantbossclub.com/small-shop-social"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-[20px] border-2 border-[var(--color-brand-pink)] text-sm font-semibold text-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink-light)] transition"
              >
                Sign Up
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Success banner */}
            <div className="w-full p-3 rounded-lg bg-[#D1FAE5] text-[#065F46] text-sm text-center mb-6">
              Code sent to {email}
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="000000"
              className="w-full h-[52px] px-4 rounded-xl bg-[var(--color-bg-secondary)] text-center text-2xl font-mono tracking-[0.3em] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-pink)] transition mb-4"
              autoFocus
              disabled={loading}
            />

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-[52px] rounded-full bg-[var(--color-brand-pink)] text-white font-semibold text-base hover:opacity-90 disabled:opacity-70 transition mb-4"
            >
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>

            <button
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className="py-2 text-sm text-[var(--color-text-secondary)] disabled:text-[var(--color-text-muted)] transition"
            >
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
            </button>

            <button
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            >
              ← Use a different email
            </button>

            <div className="mt-6 px-4">
              <p className="text-[13px] text-[var(--color-text-muted)] text-center leading-[18px]">
                Not receiving your code?{' '}
                <a href="mailto:info@instantbossclub.com" className="text-[var(--color-brand-pink)]">
                  Email info@instantbossclub.com for support
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
