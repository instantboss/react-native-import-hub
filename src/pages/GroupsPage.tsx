import { useState, useEffect } from 'react';
import { fetchGroups, resolveImageUrl, type ContentItem } from '@/lib/api';
import { Users, Image, ExternalLink } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function GroupsPage() {
  const [groups, setGroups] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(() => setError('Failed to load groups.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!groups.length) return <EmptyState icon={<Users size={40} />} message="No groups available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Groups</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {groups.map((group) => {
          const imgUrl = resolveImageUrl(group.image) || group.image_url || '';
          return (
            <a
              key={group.id}
              href={group.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow block"
            >
              <div className="aspect-video bg-[var(--color-bg-secondary)] overflow-hidden">
                {imgUrl ? (
                  <img src={imgUrl} alt={group.name || ''} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">{group.name || group.title || 'Group'}</p>
                {group.link && <ExternalLink size={14} className="shrink-0 text-[var(--color-brand-pink)]" />}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
