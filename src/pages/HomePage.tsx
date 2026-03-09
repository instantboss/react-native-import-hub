import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import {
  fetchCurrentAnnouncement,
  fetchDailyContentToday,
  resolveImageUrl,
  type DailyContent,
  type Announcement,
} from '@/lib/api';

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

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isPaid } = useUser();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [todayContent, setTodayContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchCurrentAnnouncement(),
      fetchDailyContentToday(),
    ]).then(([ann, content]) => {
      if (!mounted) return;
      setAnnouncement(ann);
      setTodayContent(content);
    }).catch(console.error)
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Get engagement images
  const getImages = () => {
    if (!todayContent) return [];
    // Try engagement_images first, then fall back to image_1/2/3
    if (todayContent.engagement_images && todayContent.engagement_images.length > 0) {
      return todayContent.engagement_images.map((img) => {
        if (typeof img === 'string') return img;
        return resolveImageUrl(img);
      }).filter(Boolean);
    }
    const images: string[] = [];
    if (todayContent.image_1?.url) images.push(resolveImageUrl(todayContent.image_1));
    if (todayContent.image_2?.url) images.push(resolveImageUrl(todayContent.image_2));
    if (todayContent.image_3?.url) images.push(resolveImageUrl(todayContent.image_3));
    return images.filter(Boolean);
  };

  const images = getImages();
  const hasContent = !!todayContent;

  return (
    <div className="py-4">
      {/* Welcome section - centered like RN */}
      <div className="text-center pt-2 pb-4">
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{formattedDate}</p>
      </div>

      {/* Upgrade banner for trial users */}
      {!isPaid && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-[var(--color-brand-pink)] to-[#D946EF] text-white text-center">
          <p className="font-semibold mb-2">Upgrade to unlock all premium features</p>
          <a
            href="https://instantbossclub.com/sss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 rounded-full bg-white text-[var(--color-brand-pink)] font-semibold text-sm hover:opacity-90 transition"
          >
            Upgrade Now
          </a>
        </div>
      )}

      {/* Holiday banner */}
      {isPaid && todayContent?.holiday && (
        <div className="mb-5 py-2.5 px-3.5 rounded-[10px] bg-[var(--color-brand-pink-light)]">
          <p className="text-[13px] font-semibold uppercase text-[var(--color-text-secondary)] tracking-wide text-center mb-1">
            Today's Holiday
          </p>
          <p className="text-[17px] font-medium text-[var(--color-text-primary)] text-center tracking-tight">
            {todayContent.holiday}
          </p>
        </div>
      )}

      {/* Announcement banner - matches RN rich format */}
      {announcement && (announcement.active !== false) && (announcement.heading || announcement.message) && (
        <div className="mb-4 rounded-xl p-4 bg-cover bg-center text-center overflow-hidden" style={{
          backgroundImage: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
        }}>
          {announcement.label && (
            <span className="inline-block px-3 py-1 rounded-xl bg-white/85 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-primary)] mb-2">
              {announcement.label}
            </span>
          )}
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
            {announcement.heading || announcement.message}
          </h3>
          {announcement.description && (
            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-5 mb-3">
              {announcement.description}
            </p>
          )}
          {announcement.button_text && announcement.button_link && (
            <button
              onClick={() => {
                if (announcement.button_link!.startsWith('/')) {
                  navigate(announcement.button_link!);
                } else if (announcement.button_link!.startsWith('http')) {
                  window.open(announcement.button_link!, '_blank');
                }
              }}
              className="px-5 py-2.5 rounded-[20px] bg-[var(--color-brand-pink)] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              {announcement.button_text}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mb-6 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse h-48" />
      ) : hasContent ? (
        <>
          {/* Today's Images - horizontal scroll, edge-to-edge */}
          {images.length > 0 && (
            <div className="mb-6 -mx-4">
              <div className="px-4 mb-2">
                <SectionHeading>Today's Images</SectionHeading>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={url as string}
                    alt={`Image ${i + 1}`}
                    className="w-[60%] sm:w-[calc((100%-24px)/3)] shrink-0 rounded-xl object-cover aspect-square"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {todayContent?.hashtags && (
            <div className="mb-6">
              <SectionHeading>Hashtags</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.hashtags}</p>
              </div>
              <CopyButton text={todayContent.hashtags} label="Copy hashtags" />
            </div>
          )}

          {/* Caption */}
          {todayContent?.caption && (
            <div className="mb-6">
              <SectionHeading>Caption</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.caption}</p>
              </div>
              <CopyButton text={todayContent.caption} label="Copy caption" />
            </div>
          )}

          {/* Morning Post */}
          {todayContent?.morning_post && (
            <div className="mb-6">
              <SectionHeading>Morning Post</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.morning_post}</p>
                {todayContent.morning_places_text && (
                  <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{todayContent.morning_places_text}</p>
                )}
              </div>
              <CopyButton text={todayContent.morning_post} label="Copy morning post" />
            </div>
          )}

          {/* Afternoon Post */}
          {todayContent?.afternoon_post && (
            <div className="mb-6">
              <SectionHeading>Afternoon Post</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.afternoon_post}</p>
                {todayContent.afternoon_places_text && (
                  <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{todayContent.afternoon_places_text}</p>
                )}
              </div>
              <CopyButton text={todayContent.afternoon_post} label="Copy afternoon post" />
            </div>
          )}

          {/* Evening Post */}
          {todayContent?.evening_post && (
            <div className="mb-6">
              <SectionHeading>Evening Post</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.evening_post}</p>
                {todayContent.evening_places_text && (
                  <p className="text-[13px] text-[var(--color-brand-pink)] font-medium mt-2">{todayContent.evening_places_text}</p>
                )}
              </div>
              <CopyButton text={todayContent.evening_post} label="Copy evening post" />
            </div>
          )}

          {/* Extra Tasks */}
          {todayContent?.extra_tasks && (
            <div className="mb-6">
              <SectionHeading>Extra Tasks</SectionHeading>
              <div className="bg-[var(--color-bg-secondary)] p-3.5 rounded-xl">
                <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">{todayContent.extra_tasks}</p>
              </div>
              <CopyButton text={todayContent.extra_tasks} label="Copy extra tasks" />
            </div>
          )}

          {/* See Full Content Calendar button - matches RN */}
          <button
            onClick={() => navigate('/daily-content')}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-[var(--color-brand-pink)] text-white font-semibold text-base hover:opacity-90 transition mt-2 mb-6"
          >
            See Full Content Calendar
            <ChevronRight size={18} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-text-muted)]">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-base text-[var(--color-text-secondary)]">No content available for today</p>
        </div>
      )}
    </div>
  );
}
