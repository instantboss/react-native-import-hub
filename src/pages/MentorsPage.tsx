import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMentors, resolveImageUrl, type Mentor } from '@/lib/api';
import { Users, User } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors()
      .then(setMentors)
      .catch(() => setError('Failed to load mentors.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!mentors.length) return <EmptyState icon={<Users size={40} />} message="No mentors available yet." />;

  return (
    <div className="py-6">
      <h2 className="text-xl font-bold mb-4">Mentors</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mentors.map((mentor) => {
          const photo = resolveImageUrl(mentor.image);
          return (
            <button
              key={mentor.id}
              onClick={() => navigate(`/mentors/${mentor.id}`)}
              className="rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow text-center p-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-[var(--color-bg-secondary)] mb-3">
                {photo ? (
                  <img src={photo} alt={mentor.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={32} className="text-[var(--color-text-muted)]" />
                  </div>
                )}
              </div>
              <p className="font-medium text-sm truncate">{mentor.name}</p>
              {mentor.title && (
                <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{mentor.title}</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
