import { useState, useEffect } from 'react';
import { fetchVendors, resolveImageUrl, type ContentItem } from '@/lib/api';
import { Store, Image, ExternalLink } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!vendors.length) return <EmptyState icon={<Store size={40} />} message="No vendors available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Vendors</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vendors.map((vendor) => {
          const imgUrl = resolveImageUrl(vendor.image) || vendor.image_url || '';
          return (
            <a
              key={vendor.id}
              href={vendor.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-[var(--color-bg-secondary)]">
                {imgUrl ? (
                  <img src={imgUrl} alt={vendor.name || ''} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{vendor.name || vendor.title || 'Vendor'}</p>
                {vendor.description && (
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{vendor.description}</p>
                )}
              </div>
              {vendor.link && <ExternalLink size={14} className="shrink-0 text-[var(--color-brand-pink)]" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
