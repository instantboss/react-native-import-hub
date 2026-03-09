import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, Palette, ShoppingBag, FileText, HelpCircle, Megaphone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchCurrentAnnouncement, fetchDailyContentToday, type DailyContent } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

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

export default function HomePage() {
  const { user } = useUser();
  const [announcement, setAnnouncement] = useState<{ message?: string; active?: boolean } | null>(null);
  const [todayContent, setTodayContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);

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
      <PageHeader
        title={`Welcome${user?.first_name ? `, ${user.first_name}` : ''}!`}
        subtitle="Here's what's happening today"
      />

      {/* Announcement banner */}
      {announcement?.active && announcement.message && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-brand-pink-light)] border border-[var(--color-card-border)] flex items-start gap-3">
          <Megaphone size={20} className="text-[var(--color-brand-pink)] mt-0.5 shrink-0" />
          <p className="text-sm text-[var(--color-text-secondary)]">{announcement.message}</p>
        </div>
      )}

      {/* Today's content preview */}
      {loading ? (
        <div className="mb-6 p-6 rounded-xl bg-[var(--color-bg-secondary)] animate-pulse h-40" />
      ) : todayContent ? (
        <Link to={`/daily-content/${todayContent.date || todayContent.content_date}`} className="block mb-6">
          <div className="p-5 rounded-xl border border-[var(--color-card-border)] bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Today's Content</h2>
              <span className="text-xs font-medium text-[var(--color-brand-pink)] bg-[var(--color-brand-pink-light)] px-2.5 py-1 rounded-full">
                {todayContent.date || todayContent.content_date}
              </span>
            </div>

            {todayContent.holiday && (
              <p className="text-sm font-medium text-[var(--color-brand-pink)] mb-3">{todayContent.holiday}</p>
            )}

            <div className="space-y-2">
              {todayContent.morning_post && (
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase w-20 shrink-0 pt-0.5">Morning</span>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{todayContent.morning_post}</p>
                </div>
              )}
              {todayContent.afternoon_post && (
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase w-20 shrink-0 pt-0.5">Afternoon</span>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{todayContent.afternoon_post}</p>
                </div>
              )}
              {todayContent.evening_post && (
                <div className="flex gap-2">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase w-20 shrink-0 pt-0.5">Evening</span>
                  <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{todayContent.evening_post}</p>
                </div>
              )}
            </div>
          </div>
        </Link>
      ) : null}

      {/* Quick links grid */}
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Quick Links</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md hover:border-[var(--color-card-border)] transition-all"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
