import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, XCircle, FileText } from 'lucide-react';
import { fetchNews, resolveImageUrl, type ContentItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner } from './TemplatesPage';

function formatFriendlyDate(timestamp: number | string | undefined): string {
  if (!timestamp) return '';
  // Xano returns ms timestamps or ISO strings — detect and handle both
  const date = typeof timestamp === 'string'
    ? new Date(timestamp)
    : new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NewsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNews(50)
      .then(setItems)
      .catch(() => setError('Unable to load news.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) =>
      (item.title || item.name || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="py-4">
      <PageHeader title="Small Shop News" subtitle="Get the latest from your biz besties!" />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Search bar */}
      <div className="mb-4 relative">
        <div className="flex items-center rounded-3xl border border-[var(--color-border-light)] bg-white/70 backdrop-blur-sm px-3">
          <Search size={20} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news..."
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
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <FileText size={48} className="text-[var(--color-text-muted)]" />
          <p className="text-base text-[var(--color-text-secondary)]">
            {searchQuery ? 'No news found' : 'No news available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const imageUrl = resolveImageUrl(item.image);
            const link = item.link || '#';

            return (
              <a
                key={item.id}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex rounded-xl border border-[var(--color-border-light)] bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="w-[100px] h-[100px] shrink-0 bg-[var(--color-bg-secondary)]">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText size={24} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 flex flex-col">
                  <p className="font-semibold text-[var(--color-text-primary)] leading-5 line-clamp-2">
                    {item.title || item.name || 'Untitled'}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {formatFriendlyDate(item.created_at)}
                  </p>
                  <div className="flex items-center gap-1 mt-auto">
                    <ExternalLink size={16} className="text-[var(--color-brand-pink)]" />
                    <span className="text-sm font-semibold text-[var(--color-brand-pink)]">Read More</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
