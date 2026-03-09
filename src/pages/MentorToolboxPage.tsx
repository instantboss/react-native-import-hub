import { useState, useEffect } from 'react';
import { Wrench, Image } from 'lucide-react';
import { fetchToolbox, resolveImageUrl, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState, Lightbox } from './TemplatesPage';

export default function MentorToolboxPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetchToolbox()
      .then(setItems)
      .catch(() => setError('Failed to load toolbox.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Wrench size={40} />} message="No toolbox items available yet." />;

  const handleClick = (item: ContentItem) => {
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else {
      const url = resolveImageUrl(item.image) || item.image_url || '';
      if (url) setLightbox(url);
    }
  };

  return (
    <div className="py-4">
      <PageHeader title="Mentors Toolbox" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const url = resolveImageUrl(item.image) || item.image_url || '';
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="group rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow text-left"
            >
              <div className="relative">
                {url ? (
                  <img src={url} alt={item.name || ''} className="w-full aspect-square object-cover" loading="lazy" />
                ) : (
                  <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                    <Image size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              {item.name && (
                <p className="px-2 py-2 text-sm text-center truncate">{item.name}</p>
              )}
            </button>
          );
        })}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
