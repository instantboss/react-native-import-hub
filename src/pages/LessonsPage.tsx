import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLessons, resolveImageUrl, type Lesson } from '@/lib/api';
import { BookOpen, Image, Clock, Search, XCircle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons()
      .then(setLessons)
      .catch(() => setError('Failed to load lessons.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const q = searchQuery.toLowerCase();
    return lessons.filter(
      (l) =>
        (l.title || '').toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q)
    );
  }, [lessons, searchQuery]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!lessons.length) return <EmptyState icon={<BookOpen size={40} />} message="No lessons available yet." />;

  return (
    <div className="py-4">
      <PageHeader title="Lessons" subtitle="Learn strategies to grow your boutique business" />

      {/* Search bar */}
      <div className="mb-4">
        <div className="flex items-center rounded-3xl border border-[var(--color-border-light)] bg-white/70 backdrop-blur-sm px-3">
          <Search size={20} className="text-[var(--color-text-muted)] mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons..."
            className="flex-1 py-3.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1">
              <XCircle size={20} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <EmptyState icon={<BookOpen size={40} />} message={searchQuery ? 'No matching lessons' : 'No lessons available yet.'} />
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson) => {
            const thumb = resolveImageUrl(lesson.thumbnail);
            return (
              <button
                key={lesson.id}
                onClick={() => navigate(`/lessons/${lesson.id}`)}
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow text-left"
              >
                <div className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-[var(--color-bg-secondary)]">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={24} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lesson.title}</p>
                  {lesson.description && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-1 mt-0.5">{lesson.description}</p>
                  )}
                  {lesson.duration && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-text-muted)]">
                      <Clock size={12} />
                      <span>{lesson.duration}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
