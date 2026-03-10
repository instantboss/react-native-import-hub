import { useState, useEffect } from 'react';
import { fetchGroups, type ContentItem } from '@/lib/api';
import { Users, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
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
  if (!groups.length) return <EmptyState icon={<Users size={40} />} message="No groups available" />;

  const handlePress = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="py-4">
      <PageHeader title="Groups" subtitle="Connect with the Small Shop Social community" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => handlePress(group.link || '')}
            className="flex flex-col items-center p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
          >
            <div className="w-20 h-20 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center mb-3">
              <Users size={40} className="text-[var(--color-brand-pink)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)] text-center leading-tight mb-2">
              {group.name || group.title || 'Group'}
            </p>
            {(group.link || group.url) && (
              <div className="flex items-center gap-1">
                <ExternalLink size={14} className="text-[var(--color-brand-pink)]" />
                <span className="text-xs text-[var(--color-text-secondary)]">Open Group</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
