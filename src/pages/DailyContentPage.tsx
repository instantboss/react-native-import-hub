import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchDailyContent31, type DailyContent } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getContentDate(item: DailyContent): string {
  return item.date || item.content_date || '';
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

function formatMonth(year: number, month: number): string {
  return new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DailyContentPage() {
  useUser(); // ensure authenticated
  const [content, setContent] = useState<DailyContent[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayKey = toDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    fetchDailyContent31()
      .then((items) => setContent(items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Map date strings to content
  const contentMap = useMemo(() => {
    const map = new Map<string, DailyContent>();
    for (const item of content) {
      const d = getContentDate(item);
      if (d) map.set(d, item);
    }
    return map;
  }, [content]);

  // Calendar grid for current view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { day: number; dateKey: string; content: DailyContent | null }[] = [];

    // Empty padding cells
    for (let i = 0; i < startPad; i++) {
      days.push({ day: 0, dateKey: '', content: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey, content: contentMap.get(dateKey) || null });
    }

    return days;
  }, [viewYear, viewMonth, contentMap]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="py-4">
      <PageHeader title="Daily Content" subtitle="Your content calendar" />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition" aria-label="Previous month">
          <ChevronLeft size={20} className="text-[var(--color-text-secondary)]" />
        </button>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          {formatMonth(viewYear, viewMonth)}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition" aria-label="Next month">
          <ChevronRight size={20} className="text-[var(--color-text-secondary)]" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-[var(--color-bg-secondary)] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, i) => {
              if (cell.day === 0) return <div key={i} />;

              const isToday = cell.dateKey === todayKey;
              const hasContent = !!cell.content;

              const inner = (
                <div
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all ${
                    isToday
                      ? 'bg-[var(--color-brand-pink)] text-white shadow-md'
                      : hasContent
                        ? 'bg-[var(--color-brand-pink-light)] border border-[var(--color-card-border)] hover:shadow-sm'
                        : 'bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isToday ? '' : hasContent ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                    {cell.day}
                  </span>
                  {cell.content?.holiday && (
                    <span className={`text-[8px] leading-tight text-center line-clamp-2 mt-0.5 ${isToday ? 'text-white/80' : 'text-[var(--color-brand-pink)]'}`}>
                      {cell.content.holiday}
                    </span>
                  )}
                </div>
              );

              return hasContent ? (
                <Link key={i} to={`/daily-content/${cell.dateKey}`}>{inner}</Link>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>
        </>
      )}

      {/* Content list below calendar */}
      {!loading && content.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Recent Days</h3>
          {content
            .filter((item) => {
              const d = getContentDate(item);
              if (!d) return false;
              const parsed = parseDate(d);
              return parsed && parsed.getMonth() === viewMonth && parsed.getFullYear() === viewYear;
            })
            .sort((a, b) => getContentDate(a).localeCompare(getContentDate(b)))
            .map((item) => {
              const dateStr = getContentDate(item);
              const parsed = parseDate(dateStr);
              const dayNum = parsed?.getDate() || 0;
              const isToday = dateStr === todayKey;

              return (
                <Link
                  key={item.id}
                  to={`/daily-content/${dateStr}`}
                  className={`block p-3 rounded-xl border transition-all hover:shadow-sm ${
                    isToday ? 'border-[var(--color-brand-pink)] bg-[var(--color-brand-pink-light)]' : 'border-[var(--color-border-light)] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isToday ? 'bg-[var(--color-brand-pink)] text-white' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                    }`}>
                      <span className="text-sm font-bold">{dayNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.holiday && (
                        <p className="text-xs font-medium text-[var(--color-brand-pink)] truncate">{item.holiday}</p>
                      )}
                      <p className="text-xs text-[var(--color-text-muted)] truncate">
                        {[item.morning_post, item.afternoon_post, item.evening_post].filter(Boolean).length} posts
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
