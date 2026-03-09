import { useState, useEffect } from 'react';
import { MessageCircle, ExternalLink, Image } from 'lucide-react';
import { fetchAskMentorItems, resolveImageUrl, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorAskPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAskMentorItems()
      .then(setItems)
      .catch(() => setError('Failed to load items.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<MessageCircle size={40} />} message="No items available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Ask a Mentor" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const url = resolveImageUrl(item.image) || item.image_url || '';
          return (
            <a
              key={item.id}
              href={item.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              {url ? (
                <img src={url} alt={item.name || ''} className="w-full aspect-square object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <Image size={32} className="text-[var(--color-text-muted)]" />
                </div>
              )}
              {item.name && (
                <div className="px-2 py-2 flex items-center gap-1">
                  <p className="text-sm text-center truncate flex-1">{item.name}</p>
                  {item.link && <ExternalLink size={12} className="text-[var(--color-text-muted)] shrink-0" />}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
