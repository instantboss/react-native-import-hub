import { useState, useEffect } from 'react';
import { fetchExtraGraphics, resolveImageUrl, type ExtraGraphic } from '@/lib/api';
import { Image } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState, Lightbox } from './TemplatesPage';

export default function ExtrasGraphicsPage() {
  const [items, setItems] = useState<ExtraGraphic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetchExtraGraphics()
      .then(setItems)
      .catch(() => setError('Failed to load extra graphics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Image size={40} />} message="No extra graphics available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Extra Graphics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const url = resolveImageUrl(item.image) || item.image_url || '';
          return (
            <button
              key={item.id}
              onClick={() => url && setLightbox(url)}
              className="rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              {url ? (
                <img src={url} alt={item.name || ''} className="w-full aspect-square object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <Image size={32} className="text-[var(--color-text-muted)]" />
                </div>
              )}
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
