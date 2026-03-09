import { useState, useEffect } from 'react';
import { Sparkles, Image, Copy, Check } from 'lucide-react';
import { fetchAIProducts, resolveImageUrl, type AIProduct } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, EmptyState } from './TemplatesPage';

export default function AIPage() {
  const [products, setProducts] = useState<AIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchAIProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* ignore */ }
  };

  if (loading) return <LoadingSpinner />;
  if (!products.length) return (
    <div className="py-4">
      <PageHeader title="AI Assistant" subtitle="Get AI-powered product descriptions" />
      <EmptyState icon={<Sparkles size={48} />} message="No AI products yet" />
    </div>
  );

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="py-4">
      <PageHeader title="AI Assistant" subtitle="Your AI-generated product details" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((product) => {
          const imgUrl = product.image?.url || product.image_url || '';
          return (
            <button
              key={product.id}
              onClick={() => setSelectedId(product.id)}
              className={`rounded-xl overflow-hidden border transition-all ${
                selectedId === product.id
                  ? 'border-[var(--color-brand-pink)] shadow-md'
                  : 'border-[var(--color-border-light)] hover:shadow-md'
              }`}
            >
              <div className="aspect-square bg-[var(--color-bg-secondary)]">
                {imgUrl ? (
                  <img src={resolveImageUrl(product.image) || imgUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              {(product.name || product.title) && (
                <p className="px-2 py-2 text-xs font-medium truncate">{product.name || product.title}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Product detail panel */}
      {selected && (
        <div className="mt-6 rounded-xl border border-[var(--color-border-light)] bg-white p-4 space-y-4">
          <h3 className="font-semibold text-lg">{selected.name || selected.title || 'Product'}</h3>

          {selected.description && (
            <CopyBlock
              label="Description"
              text={selected.description}
              copied={copiedField === 'desc'}
              onCopy={() => handleCopy(selected.description!, 'desc')}
            />
          )}
          {selected.social_post && (
            <CopyBlock
              label="Social Post"
              text={selected.social_post}
              copied={copiedField === 'post'}
              onCopy={() => handleCopy(selected.social_post!, 'post')}
            />
          )}
          {selected.hashtags && (
            <CopyBlock
              label="Hashtags"
              text={selected.hashtags}
              copied={copiedField === 'hash'}
              onCopy={() => handleCopy(selected.hashtags!, 'hash')}
            />
          )}
        </div>
      )}
    </div>
  );
}

function CopyBlock({ label, text, copied, onCopy }: { label: string; text: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
        <button onClick={onCopy} className="flex items-center gap-1 text-xs text-[var(--color-brand-pink)]">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3 text-sm leading-relaxed">{text}</div>
    </div>
  );
}
