import { useState, useEffect } from 'react';
import { fetchExtraVideos, resolveImageUrl, type ExtraVideo } from '@/lib/api';
import { Video, Play } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function ExtrasVideosPage() {
  const [items, setItems] = useState<ExtraVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    fetchExtraVideos()
      .then(setItems)
      .catch(() => setError('Failed to load extra videos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Video size={40} />} message="No extra videos available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Extra Videos" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const thumb = resolveImageUrl(item.image) || item.image_url || item.thumbnail || '';
          const videoUrl = item.video?.url || item.link || '';
          const isPlaying = playingId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white"
            >
              {isPlaying && videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                  onEnded={() => setPlayingId(null)}
                />
              ) : (
                <button
                  onClick={() => videoUrl && setPlayingId(item.id)}
                  className="relative w-full aspect-video bg-[var(--color-bg-secondary)] group"
                >
                  {thumb ? (
                    <img src={thumb} alt={item.name || ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={40} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                  {videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <Play size={20} className="text-[var(--color-brand-pink)] ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              )}
              {item.name && (
                <p className="px-3 py-2 text-sm font-medium truncate">{item.name}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
