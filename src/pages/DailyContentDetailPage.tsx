import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchDailyContent31, fetchUserImagesForDate, resolveImageUrl, type DailyContent, type UserGeneratedImage } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { Lightbox } from './TemplatesPage';

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-1.5 w-full px-3.5 py-2.5 rounded-[20px] bg-[var(--color-brand-pink-light)] text-[var(--color-brand-pink)] text-[13px] font-semibold hover:opacity-80 transition mt-2.5"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
      {children}
    </h3>
  );
}

export default function DailyContentDetailPage() {
  const { user, isPaid } = useUser();
  const { date } = useParams<{ date: string }>();
  const [content, setContent] = useState<DailyContent | null>(null);
  const [userImages, setUserImages] = useState<UserGeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; index: number } | null>(null);

  useEffect(() => {
    if (!date) return;
    fetchDailyContent31()
      .then(async (items) => {
        const match = items.find((item) => (item.date || item.content_date) === date);
        if (match) {
          setContent(match);
          // Fetch user's composited images for this date
          if (isPaid && user?.id) {
            try {
              const imgs = await fetchUserImagesForDate(user.id, date);
              setUserImages(imgs);
            } catch { /* fallback to engagement images */ }
          }
        } else {
          setError('No content found for this date.');
        }
      })
      .catch(() => setError('Failed to load content.'))
      .finally(() => setLoading(false));
  }, [date, isPaid, user?.id]);

  if (loading) {
    return (
      <div className="py-4">
        <PageHeader title="Loading..." />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="py-4">
        <PageHeader title="Daily Content" />
        <div className="text-center py-12 text-[var(--color-text-muted)]">{error || 'Content not found.'}</div>
      </div>
    );
  }

  // Get images — paid users see composited images, trial sees engagement images
  const getImages = (): string[] => {
    if (isPaid && userImages.length > 0) {
      return userImages.map((img) => img.image).filter(Boolean);
    }
    if (content.engagement_images && content.engagement_images.length > 0) {
      return content.engagement_images.map((img) => {
        if (typeof img === 'string') return img;
        return resolveImageUrl(img);
      }).filter(Boolean) as string[];
    }
    const imgs: string[] = [];
    if (content.image_1?.url) imgs.push(resolveImageUrl(content.image_1));
    if (content.image_2?.url) imgs.push(resolveImageUrl(content.image_2));
    if (content.image_3?.url) imgs.push(resolveImageUrl(content.image_3));
    return imgs.filter(Boolean);
  };

  const images = getImages();

  return (
    <div className="py-4">
      {/* Title Section - matches RN */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Daily Content</h2>
        {date && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{formatDateDisplay(date)}</p>
        )}
      </div>

      {/* Holiday banner */}
      {content.holiday && (
        <div className="mb-5 py-2.5 px-3.5 rounded-[10px] bg-[var(--color-brand-pink-light)]">
          <p className="text-[13px] font-semibold uppercase text-[var(--color-text-secondary)] tracking-wide text-center mb-1">
            Today's Holiday
          </p>
          <p className="text-[17px] font-medium text-[var(--color-text-primary)] text-center tracking-tight">
            {content.holiday}
          </p>
        </div>
      )}

      {/* Images - horizontal scroll, edge-to-edge */}
      {images.length > 0 && (
        <div className="mb-6 -mx-4">
          <div className="px-4 mb-2">
            <SectionHeading>Images</SectionHeading>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage({ url, index: i + 1 })}
                className="w-[60%] sm:w-[calc((100%-24px)/3)] shrink-0 rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hashtags */}
      {content.hashtags && (
        <div className="mb-6">
          <SectionHeading>Hashtags</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px] break-words">{content.hashtags}</p>
          </div>
          <CopyButton text={content.hashtags} label="Copy hashtags" />
        </div>
      )}

      {/* Caption */}
      {content.caption && (
        <div className="mb-6">
          <SectionHeading>Caption</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px] whitespace-pre-line">{content.caption}</p>
          </div>
          <CopyButton text={content.caption} label="Copy caption" />
        </div>
      )}

      {/* Morning Post */}
      {content.morning_post && (
        <div className="mb-6">
          <SectionHeading>Morning Post</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{content.morning_post}</p>
            {content.morning_places_text && (
              <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{content.morning_places_text}</p>
            )}
          </div>
          <CopyButton text={content.morning_post} label="Copy morning post" />
        </div>
      )}

      {/* Afternoon Post */}
      {content.afternoon_post && (
        <div className="mb-6">
          <SectionHeading>Afternoon Post</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{content.afternoon_post}</p>
            {content.afternoon_places_text && (
              <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{content.afternoon_places_text}</p>
            )}
          </div>
          <CopyButton text={content.afternoon_post} label="Copy afternoon post" />
        </div>
      )}

      {/* Evening Post */}
      {content.evening_post && (
        <div className="mb-6">
          <SectionHeading>Evening Post</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{content.evening_post}</p>
            {content.evening_places_text && (
              <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{content.evening_places_text}</p>
            )}
          </div>
          <CopyButton text={content.evening_post} label="Copy evening post" />
        </div>
      )}

      {/* Extra Tasks */}
      {content.extra_tasks && (
        <div className="mb-6">
          <SectionHeading>Extra Tasks</SectionHeading>
          <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
            <p className="text-sm text-[var(--color-text-primary)] leading-[22px] whitespace-pre-line">{content.extra_tasks}</p>
          </div>
          <CopyButton text={content.extra_tasks} label="Copy extra tasks" />
        </div>
      )}

      {selectedImage && (
        <Lightbox
          src={selectedImage.url}
          onClose={() => setSelectedImage(null)}
          title={`${date ? formatDateDisplay(date) : 'Daily'} - Image ${selectedImage.index}`}
          downloadLabel={`daily-image-${date}-${selectedImage.index}.jpg`}
        />
      )}
    </div>
  );
}
