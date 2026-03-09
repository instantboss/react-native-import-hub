import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLessonDetail, resolveImageUrl, type Lesson } from '@/lib/api';
import { BookOpen } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchLessonDetail(Number(id))
      .then(setLesson)
      .catch(() => setError('Failed to load lesson.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!lesson) return <EmptyState icon={<BookOpen size={40} />} message="Lesson not found." />;

  const videoUrl = lesson.video?.url || lesson.video_url || '';
  const thumb = resolveImageUrl(lesson.thumbnail);

  return (
    <div className="py-6 max-w-3xl mx-auto">
      {/* Video player */}
      {videoUrl && (
        <div className="rounded-xl overflow-hidden bg-black mb-5">
          {videoUrl.includes('youtube') || videoUrl.includes('vimeo') || videoUrl.includes('iframe') ? (
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                title={lesson.title}
              />
            </div>
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video"
              poster={thumb || undefined}
              preload="metadata"
            />
          )}
        </div>
      )}

      {/* Fallback thumbnail if no video */}
      {!videoUrl && thumb && (
        <img src={thumb} alt="" className="w-full rounded-xl mb-5 object-cover max-h-80" />
      )}

      <h2 className="text-xl font-bold mb-2">{lesson.title}</h2>
      {lesson.duration && (
        <p className="text-sm text-[var(--color-text-muted)] mb-3">{lesson.duration}</p>
      )}
      {lesson.description && (
        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{lesson.description}</p>
      )}
    </div>
  );
}
