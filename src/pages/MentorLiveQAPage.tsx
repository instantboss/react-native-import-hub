import { useState, useEffect } from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { fetchQAItems, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorLiveQAPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQAItems()
      .then(setItems)
      .catch(() => setError('Failed to load Q&A items.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<HelpCircle size={40} />} message="No Q&A items available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Live Q & As" />

      <div className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
          >
            <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">
              {item.title || item.name || 'Untitled'}
            </span>
            {item.link && (
              <ExternalLink size={14} className="text-[var(--color-text-muted)] shrink-0" />
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
