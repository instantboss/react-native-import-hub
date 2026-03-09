import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { fetchMentors, resolveImageUrl, type Mentor } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorListPage() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMentors()
      .then(setMentors)
      .catch(() => setError('Failed to load mentors.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!mentors.length) return <EmptyState icon={<User size={40} />} message="No mentors available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Mentors" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mentors.map((mentor) => {
          const photo = resolveImageUrl(mentor.image);
          return (
            <button
              key={mentor.id}
              onClick={() => navigate(`/mentors/${mentor.id}`)}
              className="flex flex-col items-center p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
                {photo ? (
                  <img src={photo} alt={mentor.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] text-center leading-tight">{mentor.name}</p>
              {mentor.title && (
                <p className="text-xs text-[var(--color-text-muted)] text-center mt-1 line-clamp-2">{mentor.title}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
