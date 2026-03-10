import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLessonDetail, resolveImageUrl, type Lesson } from '@/lib/api';
import { BookOpen } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState } from './TemplatesPage';

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const long = url.match(/[?&]v=([^?&]+)/);
  if (long) return long[1];
  const embed = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embed) return embed[1];
  return null;
}

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

  const youtubeId = lesson.youtube_url ? getYouTubeVideoId(lesson.youtube_url) : null;
  const videoUrl = lesson.video?.url || lesson.video_url || '';
  const thumb = resolveImageUrl(lesson.image) || resolveImageUrl(lesson.thumbnail);
  const title = lesson.name || lesson.title || 'Lesson';
  const mentorName = lesson._mentor?.name;

  return (
    <div className="py-6 max-w-3xl mx-auto">
      {/* YouTube embed */}
      {youtubeId ? (
        <div className="rounded-xl overflow-hidden bg-black mb-5 aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            title={title}
          />
        </div>
      ) : videoUrl ? (
        <div className="rounded-xl overflow-hidden bg-black mb-5">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
            poster={thumb || undefined}
            preload="metadata"
          />
        </div>
      ) : thumb ? (
        <img src={thumb} alt="" className="w-full rounded-xl mb-5 object-cover max-h-80" />
      ) : null}

      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {mentorName && (
        <p className="text-sm text-[var(--color-brand-pink)] font-medium mb-2">By {mentorName}</p>
      )}
      {lesson.duration && (
        <p className="text-sm text-[var(--color-text-muted)] mb-3">{lesson.duration}</p>
      )}
      {lesson.description && (
        <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{lesson.description}</p>
      )}
    </div>
  );
}
