import { useState, useEffect } from 'react';
import { fetchPresets, resolveImageUrl, type Preset } from '@/lib/api';
import { Palette, Image, Download } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function PresetsPage() {
  const [items, setItems] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPresets()
      .then(setItems)
      .catch(() => setError('Failed to load presets.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Palette size={40} />} message="No presets available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Presets</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const url = resolveImageUrl(item.image) || item.image_url || '';
          const downloadUrl = item.file?.url || item.link || url;
          return (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              {url ? (
                <img src={url} alt={item.name || ''} className="w-full aspect-square object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <Image size={32} className="text-[var(--color-text-muted)]" />
                </div>
              )}
              <div className="p-2 flex items-center justify-between gap-2">
                <p className="text-sm truncate flex-1">{item.name || 'Preset'}</p>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                    title="Download"
                  >
                    <Download size={16} className="text-[var(--color-brand-pink)]" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
