import { useState, useEffect } from 'react';
import { fetchTemplates, resolveImageUrl, type Template } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Image, Loader2, AlertCircle } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const { isTrial } = useUser();

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!templates.length) return <EmptyState icon={<Image size={40} />} message="No templates available yet." />;

  const visible = isTrial ? templates.slice(0, 2) : templates;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Templates</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visible.map((t) => {
          const url = resolveImageUrl(t.image) || t.image_url || '';
          return (
            <button
              key={t.id}
              onClick={() => url && setLightbox(url)}
              className="group rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              {url ? (
                <img src={url} alt={t.name || ''} className="w-full aspect-square object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                  <Image size={32} className="text-[var(--color-text-muted)]" />
                </div>
              )}
              {t.name && (
                <p className="px-2 py-2 text-sm text-center truncate">{t.name}</p>
              )}
            </button>
          );
        })}
      </div>

      {isTrial && templates.length > 2 && <UpgradeBanner />}

      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

// Shared components used across pages
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={32} className="animate-spin text-[var(--color-brand-pink)]" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={40} className="text-[var(--color-error)] mb-3" />
      <p className="text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-[var(--color-text-muted)] mb-3">{icon}</div>
      <p className="text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}

export function UpgradeBanner() {
  return (
    <div className="mt-6 rounded-xl bg-gradient-to-r from-[#F963C0] to-[#FF85D0] p-5 text-center text-white">
      <p className="font-semibold text-lg mb-1">Unlock all content</p>
      <p className="text-sm opacity-90 mb-3">Upgrade your membership to access everything.</p>
      <a
        href="https://instantbossclub.com/sss"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-2 rounded-full bg-white text-[#F963C0] font-semibold text-sm hover:bg-opacity-90 transition"
      >
        Upgrade Now
      </a>
    </div>
  );
}

export function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl font-light leading-none">&times;</button>
      <img src={src} alt="" className="max-w-full max-h-[90vh] rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
