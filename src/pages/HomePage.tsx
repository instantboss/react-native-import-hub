import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, Palette, ShoppingBag, FileText, HelpCircle, Megaphone, Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchCurrentAnnouncement, fetchDailyContentToday, resolveImageUrl, type DailyContent } from '@/lib/api';

const quickLinks = [
  { to: '/daily-content', icon: Calendar, label: 'Daily Content', color: '#F963C0' },
  { to: '/mentors', icon: Users, label: 'Mentors', color: '#8B5CF6' },
  { to: '/lessons', icon: BookOpen, label: 'Lessons', color: '#3B82F6' },
  { to: '/extras', icon: Palette, label: 'Extras', color: '#F59E0B' },
  { to: '/extras/templates', icon: FileText, label: 'Templates', color: '#10B981' },
  { to: '/extras/buy-guides', icon: ShoppingBag, label: 'Buy Guides', color: '#EF4444' },
  { to: '/extras/printables', icon: FileText, label: 'Printables', color: '#6366F1' },
  { to: '/support', icon: HelpCircle, label: 'Support', color: '#6B7280' },
] as const;

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
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-[20px] bg-[var(--color-brand-pink-light)] text-[var(--color-brand-pink)] text-[13px] font-semibold hover:opacity-80 transition"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

export default function HomePage() {
  const { user } = useUser();
  const [announcement, setAnnouncement] = useState<{ message?: string; active?: boolean } | null>(null);
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

  return (
    <div className="py-4">
      {/* Welcome section */}
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">
          Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{formattedDate}</p>
      </div>

      {/* Announcement banner */}
      {announcement?.active && announcement.message && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-brand-pink-light)] border border-[var(--color-card-border)] flex items-start gap-3">
          <Megaphone size={20} className="text-[var(--color-brand-pink)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-text-secondary)]">{announcement.message}</p>
        </div>
      )}

      {/* Today's content */}
      {loading ? (
        <div className="mb-6 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse h-48" />
      ) : todayContent ? (
        <div className="mb-6">
          {/* Holiday banner */}
          {todayContent.holiday && (
            <div className="mb-4 py-2.5 px-4 rounded-[14px] bg-[var(--color-brand-pink-light)]">
              <p className="text-[13px] font-semibold uppercase text-[var(--color-text-secondary)] tracking-wide mb-0.5">
                Today's Holiday
              </p>
              <p className="text-[17px] font-bold text-[var(--color-text-primary)]">
                {todayContent.holiday}
              </p>
            </div>
          )}

          {/* Content card */}
          <Link to={`/daily-content/${todayContent.date || todayContent.content_date}`} className="block">
            <div className="rounded-xl bg-[var(--color-bg-secondary)] p-3.5">
              {/* Posts */}
              <div className="space-y-4">
                {todayContent.morning_post && (
                  <div>
                    <p className="text-[13px] font-semibold uppercase text-[var(--color-text-muted)] tracking-wide mb-1">
                      Morning Post
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">
                      {todayContent.morning_post}
                    </p>
                    <div className="mt-2">
                      <CopyButton text={todayContent.morning_post} label="Copy" />
                    </div>
                  </div>
                )}
                {todayContent.afternoon_post && (
                  <div>
                    <p className="text-[13px] font-semibold uppercase text-[var(--color-text-muted)] tracking-wide mb-1">
                      Afternoon Post
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">
                      {todayContent.afternoon_post}
                    </p>
                    <div className="mt-2">
                      <CopyButton text={todayContent.afternoon_post} label="Copy" />
                    </div>
                  </div>
                )}
                {todayContent.evening_post && (
                  <div>
                    <p className="text-[13px] font-semibold uppercase text-[var(--color-text-muted)] tracking-wide mb-1">
                      Evening Post
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)] leading-[22px]">
                      {todayContent.evening_post}
                    </p>
                    <div className="mt-2">
                      <CopyButton text={todayContent.evening_post} label="Copy" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Engagement images horizontal scroll */}
          {todayContent.engagement_images && todayContent.engagement_images.length > 0 && (
            <div className="mt-4">
              <p className="text-[13px] font-semibold uppercase text-[var(--color-text-muted)] tracking-wide mb-2">
                Today's Images
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                {todayContent.engagement_images.map((img, i) => {
                  const url = typeof img === 'string' ? img : resolveImageUrl(img);
                  if (!url) return null;
                  return (
                    <img
                      key={i}
                      src={url}
                      alt={`Engagement ${i + 1}`}
                      className="w-[60%] sm:w-[calc((100%-48px)/3)] shrink-0 rounded-xl object-cover aspect-square"
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Quick links grid */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold uppercase text-[var(--color-text-muted)] tracking-wide mb-3">
          Quick Links
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md hover:border-[var(--color-card-border)] transition-all"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
