import { useState, useEffect } from 'react';
import { Headphones, ExternalLink, Image } from 'lucide-react';
import { fetchPodcasts, resolveImageUrl, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorPodcastsPage() {
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPodcasts()
      .then(setPodcasts)
      .catch(() => setError('Failed to load podcasts.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!podcasts.length) return <EmptyState icon={<Headphones size={40} />} message="No podcasts available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Mentor Podcasts" />

      <div className="space-y-3">
        {podcasts.map((item) => {
          const thumb = resolveImageUrl(item.image) || item.image_url || item.thumbnail || '';
          return (
            <a
              key={item.id}
              href={item.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] shrink-0">
                {thumb ? (
                  <img src={thumb} alt={item.title || item.name || ''} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                  {item.title || item.name || 'Untitled'}
                </p>
                {item.description && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
              {item.link && (
                <ExternalLink size={14} className="text-[var(--color-text-muted)] shrink-0 mt-1" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
