import { useState, useEffect } from 'react';
import { fetchProductNames, type ContentItem } from '@/lib/api';
import { Tag, Copy, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function ProductNamesPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchProductNames()
      .then(setItems)
      .catch(() => setError('Failed to load product names.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<Tag size={40} />} message="No product names available" />;

  return (
    <div className="py-4 max-w-xl mx-auto">
      <PageHeader title="Product Names" subtitle="Tap any name to copy it to your clipboard" />
      <div className="space-y-1">
        {items.map((item) => {
          const name = item.name || item.title || '';
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors group"
            >
              <span className="text-sm flex-1">{name}</span>
              <button
                onClick={() => handleCopy(name, item.id)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white transition-colors"
                title="Copy"
              >
                {isCopied ? (
                  <Check size={16} className="text-[var(--color-success)]" />
                ) : (
                  <Copy size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-pink)]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
