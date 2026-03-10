import { useState, useEffect } from 'react';
import { fetchTemplates, resolveImageUrl, type Template } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Layers, Lock, Loader2, AlertCircle, Download, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isTrial } = useUser();

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!templates.length) return <EmptyState icon={<Layers size={40} />} message="No templates available" />;

  const handlePress = (t: Template) => {
    if (t.link) window.open(t.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-4">
      <PageHeader title="Templates" subtitle="Ready-to-use templates for your boutique" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {templates.map((t, i) => {
          const url = resolveImageUrl(t.image) || t.image_url || '';
          const isLocked = isTrial && i >= 2;
          return (
            <button
              key={t.id}
              onClick={() => isLocked ? window.open('https://instantbossclub.com/sss', '_blank') : handlePress(t)}
              className="group rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow text-left"
            >
              <div className="relative">
                {url ? (
                  <img src={url} alt={t.name || ''} className={`w-full aspect-square object-cover ${isLocked ? 'opacity-30' : ''}`} loading="lazy" />
                ) : (
                  <div className="w-full aspect-square bg-[var(--color-bg-secondary)] flex items-center justify-center">
                    <Layers size={32} className="text-[var(--color-text-muted)]" />
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

      {isTrial && templates.length > 0 && <UpgradeBanner featureName="all templates" />}
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

export function UpgradeBanner({ featureName }: { featureName?: string } = {}) {
  return (
    <div className="mt-6 rounded-xl bg-gradient-to-r from-[#F963C0] to-[#FF85D0] p-5 text-center text-white">
      <p className="font-semibold text-lg mb-1">Unlock {featureName || 'all content'}</p>
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

async function handleImageDownload(url: string, name?: string) {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

export function Lightbox({ src, onClose, title, downloadUrl, downloadLabel, buttonLabel }: {
  src: string;
  onClose: () => void;
  title?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  buttonLabel?: string;
}) {
  const dlUrl = downloadUrl || src;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg p-5 max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate pr-4">{title || 'Preview'}</h3>
          <button onClick={onClose} className="p-1">
            <X size={24} />
          </button>
        </div>
        <div className="rounded-xl overflow-hidden bg-[var(--color-bg-secondary)] mb-5">
          <img src={src} alt="" className="w-full object-contain" />
        </div>
        <button
          onClick={() => handleImageDownload(dlUrl, downloadLabel)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl bg-[var(--color-brand-pink)] text-white font-semibold hover:opacity-90 transition"
        >
          <Download size={20} />
          {buttonLabel || 'Save Image'}
        </button>
      </div>
    </div>
  );
}
