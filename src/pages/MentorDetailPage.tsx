import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMentorDetail, resolveImageUrl, type Mentor } from '@/lib/api';
import { User, Globe, ExternalLink } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchMentorDetail(Number(id))
      .then(setMentor)
      .catch(() => setError('Failed to load mentor.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!mentor) return <EmptyState icon={<User size={40} />} message="Mentor not found." />;

  const photo = resolveImageUrl(mentor.image);

  return (
    <div className="py-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-[var(--color-bg-secondary)] mb-4">
          {photo ? (
            <img src={photo} alt={mentor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={48} className="text-[var(--color-text-muted)]" />
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold">{mentor.name}</h2>
        {mentor.title && (
          <p className="text-[var(--color-text-muted)] mt-1">{mentor.title}</p>
        )}
      </div>

      {mentor.bio && (
        <div className="mb-6">
          <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{mentor.bio}</p>
        </div>
      )}

      {(mentor.website || mentor.instagram) && (
        <div className="space-y-2">
          {mentor.website && (
            <a
              href={mentor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <Globe size={18} className="text-[var(--color-brand-pink)]" />
              <span className="flex-1 text-sm truncate">{mentor.website}</span>
              <ExternalLink size={14} className="text-[var(--color-text-muted)]" />
            </a>
          )}
          {mentor.instagram && (
            <a
              href={mentor.instagram.startsWith('http') ? mentor.instagram : `https://instagram.com/${mentor.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-light)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <span className="text-[var(--color-brand-pink)] text-lg font-bold">@</span>
              <span className="flex-1 text-sm truncate">Instagram</span>
              <ExternalLink size={14} className="text-[var(--color-text-muted)]" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
