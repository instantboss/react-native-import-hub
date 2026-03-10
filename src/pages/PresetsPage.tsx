import { useState, useEffect } from 'react';
import { fetchPresets, resolveImageUrl, type Preset } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Sliders, Lock, Play, X, Download } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState, UpgradeBanner } from './TemplatesPage';

const INTRO_VIDEO_ID = 'jO_blUegYOk';

function getDropboxDirectUrl(url: string): string {
  if (!url) return url;
  return url.replace(/[?&]dl=0/, '?dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
}

export default function PresetsPage() {
  const [items, setItems] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const { isTrial } = useUser();

  useEffect(() => {
    fetchPresets()
      .then(setItems)
      .catch(() => setError('Failed to load presets.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Sliders size={40} />} message="No presets available" />;

  const visible = isTrial ? items.slice(0, 6) : items;

  const handlePress = (item: Preset, index: number) => {
    if (isTrial && index >= 2) {
      window.open('https://instantbossclub.com/sss', '_blank');
      return;
    }
    // Open the Dropbox download link (same as RN app)
    const downloadUrl = getDropboxDirectUrl(item.link || '');
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="py-4">
      <PageHeader title="Presets" subtitle="Professional Lightroom presets for your product photos" />

      {/* Intro Video */}
      <button
        onClick={() => setVideoOpen(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-[var(--color-bg-secondary)]"
      >
        <img
          src={`https://img.youtube.com/vi/${INTRO_VIDEO_ID}/maxresdefault.jpg`}
          alt="How to Install Presets"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center mb-2">
            <Play size={32} className="text-white ml-1" />
          </div>
          <p className="text-sm font-semibold text-white drop-shadow">Watch: How to Install Presets</p>
        </div>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((item, i) => {
          const url = resolveImageUrl(item.image) || item.image_url || '';
          const isLocked = isTrial && i >= 2;
          return (
            <button
              key={item.id}
              onClick={() => handlePress(item, i)}
              className="group rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow text-left"
            >
              <div className="relative">
                {url ? (
                  <img src={url} alt="" className={`w-full aspect-square object-cover ${isLocked ? 'opacity-30' : ''}`} loading="lazy" />
                ) : (
                  <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                    <Sliders size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
                {isLocked ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={24} className="text-white" />
                  </div>
                ) : item.link && (
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={16} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isTrial && items.length > 0 && <UpgradeBanner featureName="all presets" />}

      {/* YouTube Video Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setVideoOpen(false)}>
          <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <X size={24} className="text-white" />
          </button>
          <div className="w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${INTRO_VIDEO_ID}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
