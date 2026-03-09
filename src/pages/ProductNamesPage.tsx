import { useState, useEffect, useMemo } from 'react';
import { fetchProductNames, type ContentItem } from '@/lib/api';
import { Tag, Copy, Check, Search, XCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function ProductNamesPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProductNames()
      .then(setItems)
      .catch(() => setError('Failed to load product names.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      ((item.name || item.title || '')).toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

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

      {/* Search bar */}
      <div className="mb-4">
        <div className="flex items-center rounded-3xl border border-[var(--color-border-light)] bg-white/70 backdrop-blur-sm px-3">
          <Search size={20} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product names..."
            className="flex-1 py-3.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1">
              <XCircle size={20} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      <p className="text-[13px] text-[var(--color-text-muted)] mb-3">{filteredItems.length} names</p>

      {filteredItems.length === 0 ? (
        <EmptyState icon={<Tag size={40} />} message={searchQuery ? 'No matching product names' : 'No product names available'} />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const name = item.name || item.title || '';
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[var(--color-border-light)] bg-white hover:bg-[var(--color-bg-secondary)] transition-colors group"
              >
                <button
                  onClick={() => handleCopy(name, item.id)}
                  className="flex-1 text-left text-[15px]"
                >
                  {name}
                </button>
                <button
                  onClick={() => handleCopy(name, item.id)}
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isCopied
                      ? 'bg-[var(--color-brand-pink-light)]'
                      : 'bg-[var(--color-bg-secondary)] group-hover:bg-white'
                  }`}
                  title="Copy"
                >
                  {isCopied ? (
                    <Check size={18} className="text-[var(--color-brand-pink)]" />
                  ) : (
                    <Copy size={18} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-pink)]" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
