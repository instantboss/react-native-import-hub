import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingBag, ExternalLink, XCircle } from 'lucide-react';
import { fetchShoppingList, resolveImageUrl, type ShoppingListItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, EmptyState } from './TemplatesPage';

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShoppingList()
      .then(setItems)
      .catch(() => setError('Unable to load shopping list.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="py-4">
      <PageHeader title="Shopping List" subtitle="Curated products for boutique owners" />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Search bar */}
      <div className="mb-4">
        <div className="flex items-center rounded-3xl border border-[var(--color-border-light)] bg-white/70 backdrop-blur-sm px-3">
          <Search size={20} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 py-3.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1">
              <XCircle size={20} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={48} />}
          message={searchQuery ? 'No products found' : 'No items available'}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const imageUrl = typeof item.image === 'string' ? item.image : resolveImageUrl(item.image as { url?: string; path?: string } | null | undefined);
            const hasLink = !!item.link;
            return (
              <div
                key={item.id}
                className="flex rounded-xl border border-[var(--color-border-light)] bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="w-[100px] h-[100px] shrink-0 bg-[var(--color-bg-secondary)]">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col">
                  <p className="font-semibold text-[var(--color-text-primary)] leading-5 line-clamp-2">
                    {item.name || 'Product'}
                  </p>
                  {item.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {hasLink && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-auto"
                    >
                      <span className="text-sm font-semibold text-[var(--color-brand-pink)]">Shop Now</span>
                      <ExternalLink size={14} className="text-[var(--color-brand-pink)]" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
