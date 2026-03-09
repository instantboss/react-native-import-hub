import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sun, Cloud, Moon, Sparkles, ListChecks } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { fetchDailyContent31, resolveImageUrl, type DailyContent } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DailyContentDetailPage() {
  useUser(); // ensure authenticated
  const { date } = useParams<{ date: string }>();
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (!date) return;
    fetchDailyContent31()
      .then((items) => {
        const match = items.find((item) => (item.date || item.content_date) === date);
        if (match) setContent(match);
        else setError('No content found for this date.');
      })
      .catch(() => setError('Failed to load content.'))
      .finally(() => setLoading(false));
  }, [date]);

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch {
      // fallback
    }
  }, []);

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
        <Link to="/daily-content" className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-pink)] hover:underline mb-4">
          <ArrowLeft size={16} /> Back to Calendar
        </Link>
        <div className="text-center py-12 text-[var(--color-text-muted)]">{error || 'Content not found.'}</div>
      </div>
    );
  }

  const images = [content.image_1, content.image_2, content.image_3].filter(Boolean);

  const posts = [
    { label: 'Morning', icon: Sun, text: content.morning_post, places: content.morning_places_text, color: '#F59E0B' },
    { label: 'Afternoon', icon: Cloud, text: content.afternoon_post, places: content.afternoon_places_text, color: '#3B82F6' },
    { label: 'Evening', icon: Moon, text: content.evening_post, places: content.evening_places_text, color: '#8B5CF6' },
  ];

  return (
    <div className="py-4">
      <Link to="/daily-content" className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-pink)] hover:underline mb-4">
        <ArrowLeft size={16} /> Back to Calendar
      </Link>

      <PageHeader title={formatDateDisplay(date || '')} />

      {/* Holiday */}
      {content.holiday && (
        <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-[var(--color-brand-pink-light)] border border-[var(--color-card-border)]">
          <Sparkles size={18} className="text-[var(--color-brand-pink)] shrink-0" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{content.holiday}</span>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4 mb-6">
        {posts.map(({ label, icon: Icon, text, places, color }) => {
          if (!text) return null;
          return (
            <div key={label} className="p-4 rounded-xl border border-[var(--color-border-light)] bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</h3>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">{text}</p>
              {places && (
                <p className="mt-2 text-xs text-[var(--color-text-muted)] italic">{places}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Hashtags */}
      {content.hashtags && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Hashtags</h3>
            <button
              onClick={() => copyToClipboard(content.hashtags!, 'hashtags')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink-light)] transition"
            >
              {copiedField === 'hashtags' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-secondary)] rounded-lg p-3 break-words">
            {content.hashtags}
          </p>
        </div>
      )}

      {/* Caption */}
      {content.caption && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Caption</h3>
            <button
              onClick={() => copyToClipboard(content.caption!, 'caption')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--color-brand-pink)] hover:bg-[var(--color-brand-pink-light)] transition"
            >
              {copiedField === 'caption' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-secondary)] rounded-lg p-3 whitespace-pre-line">
            {content.caption}
          </p>
        </div>
      )}

      {/* Extra Tasks */}
      {content.extra_tasks && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks size={14} className="text-[var(--color-text-muted)]" />
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Extra Tasks</h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-secondary)] rounded-lg p-3 whitespace-pre-line">
            {content.extra_tasks}
          </p>
        </div>
      )}

      {/* Engagement Images */}
      {images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Engagement Images</h3>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => {
              const url = resolveImageUrl(img as any);
              if (!url) return null;
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border-light)] hover:shadow-md transition-shadow"
                >
                  <img src={url} alt={`Engagement ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
