import { useState, useEffect } from 'react';
import { fetchPrintables, type Printable } from '@/lib/api';
import { FileText, ExternalLink, Download } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function PrintablesPage() {
  const [items, setItems] = useState<Printable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrintables()
      .then(setItems)
      .catch(() => setError('Failed to load printables.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!items.length) return <EmptyState icon={<FileText size={40} />} message="No printables available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Printables</h2>
      <div className="space-y-3">
        {items.map((item) => {
          const pdfUrl = item.file?.url || item.link || '';
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border-light)] bg-white"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--color-brand-pink-light)] flex items-center justify-center">
                <FileText size={20} className="text-[var(--color-brand-pink)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name || item.title || 'Untitled'}</p>
                {item.description && (
                  <p className="text-sm text-[var(--color-text-muted)] truncate">{item.description}</p>
                )}
              </div>
              {pdfUrl && (
                <div className="flex gap-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                    title="View"
                  >
                    <ExternalLink size={18} className="text-[var(--color-brand-pink)]" />
                  </a>
                  <a
                    href={pdfUrl}
                    download
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                    title="Download"
                  >
                    <Download size={18} className="text-[var(--color-brand-pink)]" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
