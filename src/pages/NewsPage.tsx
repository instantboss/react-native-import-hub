import { useState, useEffect } from 'react';
import { fetchNews, type ContentItem } from '@/lib/api';
import { Newspaper, ExternalLink } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function NewsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews()
      .then(setItems)
      .catch(() => setError('Failed to load news.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Newspaper size={40} />} message="No news articles yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">News</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const date = item.created_at
            ? new Date(item.created_at * 1000).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })
            : null;

          return (
            <a
              key={item.id}
              href={item.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.title || item.name || 'Untitled'}</p>
                  {item.description && (
                    <p className="text-sm text-[var(--color-text-muted)] mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {date && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">{date}</p>
                  )}
                </div>
                {item.link && (
                  <ExternalLink size={16} className="shrink-0 mt-1 text-[var(--color-brand-pink)]" />
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
