import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitSupportRequest } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Send, CheckCircle, HelpCircle, Mail } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const CATEGORIES = [
  'General Question',
  'Technical Issue',
  'Billing Issue',
  'Cancellation Request',
  'Content Request',
  'Other',
];

export default function SupportPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError('Please select a category'); return; }
    if (!subject.trim()) { setError('Please enter a subject'); return; }
    if (!message.trim()) { setError('Please enter your message'); return; }
    if (submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await submitSupportRequest({ subject: subject.trim(), message: message.trim(), category });
      setSubmitted(true);
      setSubject('');
      setMessage('');
      setCategory('');
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
        <h2 className="text-xl font-bold mb-2">Request Submitted</h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          We've received your support request and will get back to you soon.
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
    <div className="py-4 max-w-xl mx-auto">
      <PageHeader title="Help & Support" subtitle="We're here to help!" />

      <p className="text-[15px] text-[var(--color-text-secondary)] mb-6 leading-relaxed">
        Send us a message and our team will get back to you as soon as possible.
      </p>

      {/* FAQs Quick Link */}
      <button
        onClick={() => navigate('/faqs')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-3xl bg-[var(--color-brand-pink-light)] mb-6 hover:opacity-90 transition-opacity"
      >
        <HelpCircle size={20} className="text-[var(--color-brand-pink)]" />
        <span className="text-sm font-semibold text-[var(--color-brand-pink)]">View FAQs</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-base font-semibold mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium border transition-colors ${
                  category === cat
                    ? 'bg-[var(--color-brand-pink-light)] border-[var(--color-brand-pink)] text-[var(--color-brand-pink)]'
                    : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-light)] text-[var(--color-text-secondary)] hover:border-[var(--color-border)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-base font-semibold mb-3">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors text-[15px]"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-base font-semibold mb-3">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            placeholder="Any more details we should know..."
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] focus:border-[var(--color-brand-pink)] focus:outline-none transition-colors resize-none text-[15px]"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] min-w-0 flex-1 mr-3">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">We'll respond to: {user?.email || 'your email'}</span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)] shrink-0">{message.length}/2000</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-3xl bg-[var(--color-brand-pink)] text-white font-semibold text-base hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? (
            'Submitting...'
          ) : (
            <>
              Submit Request
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
