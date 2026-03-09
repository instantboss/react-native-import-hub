import { useState, useEffect } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { fetchMentorExtras, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorExtrasPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMentorExtras()
      .then(setItems)
      .catch(() => setError('Failed to load extras.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Star size={40} />} message="No extras available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Mentor Extras" />

      <div className="space-y-3">
        {items.map((item) => {
          const Wrapper = item.link ? 'a' : 'div';
          const linkProps = item.link
            ? { href: item.link, target: '_blank' as const, rel: 'noopener noreferrer' }
            : {};
          return (
            <Wrapper
              key={item.id}
              {...linkProps}
              className="block p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.title || item.name || 'Untitled'}
                  </p>
                  {item.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{item.description}</p>
                  )}
                </div>
                {item.link && (
                  <ExternalLink size={14} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
