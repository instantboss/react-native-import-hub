import { useState, useEffect } from 'react';
import { fetchFAQs, type FAQ } from '@/lib/api';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs()
      .then(setFaqs)
      .catch(() => setError('Failed to load FAQs.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!faqs.length) return <EmptyState icon={<HelpCircle size={40} />} message="No FAQs available yet." />;

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">FAQs</h2>
      <div className="space-y-2">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-xl border border-[var(--color-border-light)] bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <span className="font-medium text-sm">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="border-t border-[var(--color-border-light)] pt-3">
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
