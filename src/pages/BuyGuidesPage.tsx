import { useState, useEffect } from 'react';
import { fetchBuyGuides, resolveImageUrl, type BuyGuide } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { FileText, Lock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState, UpgradeBanner, Lightbox } from './TemplatesPage';

export default function BuyGuidesPage() {
  const [items, setItems] = useState<BuyGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { isTrial } = useUser();

  useEffect(() => {
    fetchBuyGuides()
      .then(setItems)
      .catch(() => setError('Failed to load buy guides.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<FileText size={40} />} message="No buy guides available" />;

  const visible = isTrial ? items.slice(0, 6) : items;

  const handlePress = (item: BuyGuide, index: number) => {
    if (isTrial && index >= 2) {
      window.open('https://instantbossclub.com/sss', '_blank');
      return;
    }
    const url = resolveImageUrl(item.image) || item.image_url || '';
    if (url) setLightbox(url);
  };

  return (
    <div className="py-4">
      <PageHeader title="Buy Guides" subtitle="Expert purchasing guides to help you stock your boutique" />

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
                  <img src={url} alt={item.name || ''} className={`w-full aspect-[3/4] object-cover ${isLocked ? 'opacity-30' : ''}`} loading="lazy" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-[var(--color-bg-secondary)] flex items-center justify-center">
                    <FileText size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={24} className="text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isTrial && items.length > 0 && <UpgradeBanner featureName="all buy guides" />}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
