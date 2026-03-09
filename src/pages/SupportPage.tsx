import { useState } from 'react';
import { submitSupportRequest } from '@/lib/api';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await submitSupportRequest({ subject: subject.trim(), message: message.trim() });
      setSubmitted(true);
      setSubject('');
      setMessage('');
    } catch {
      setError('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
        <CheckCircle size={48} className="text-[var(--color-success)] mb-4" />
        <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          We've received your message and will get back to you as soon as possible.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-6 py-2.5 rounded-full bg-[var(--color-brand-pink)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center">
          <MessageSquare size={20} className="text-[var(--color-brand-pink)]" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Support</h2>
          <p className="text-sm text-[var(--color-text-muted)]">We're here to help!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What do you need help with?"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more..."
            required
            rows={6}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !subject.trim() || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--color-brand-pink)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Send size={18} />
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
