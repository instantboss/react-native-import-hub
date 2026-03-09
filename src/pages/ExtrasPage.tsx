import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, FileText, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchExtraGraphics, fetchExtraVideos, fetchExtraPdfs, resolveImageUrl, type ExtraGraphic, type ExtraVideo, type ExtraPdf } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner } from './TemplatesPage';

const MAX_PREVIEW = 10;

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [children]);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft size={18} />
        </button>
      )}
      <div ref={ref} className="flex gap-3 overflow-x-auto scrollbar-hide px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
      {canScrollRight && (
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

function ViewAllCard({ onClick, icon: Icon, count }: { onClick: () => void; icon: typeof Image; count: number }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-[180px] h-[180px] rounded-xl bg-[var(--color-brand-pink-light)] border border-[var(--color-brand-pink)] flex flex-col items-center justify-center gap-2"
    >
      <Icon size={28} className="text-[var(--color-brand-pink)]" />
      <span className="text-sm font-semibold text-[var(--color-brand-pink)]">View All</span>
      <span className="text-xs text-[var(--color-text-secondary)]">{count} items</span>
      <ArrowRight size={18} className="text-[var(--color-brand-pink)]" />
    </button>
  );
}

export default function ExtrasPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [graphics, setGraphics] = useState<ExtraGraphic[]>([]);
  const [videos, setVideos] = useState<ExtraVideo[]>([]);
  const [pdfs, setPdfs] = useState<ExtraPdf[]>([]);

  useEffect(() => {
    Promise.all([
      fetchExtraGraphics().then(setGraphics),
      fetchExtraVideos().then(setVideos),
      fetchExtraPdfs().then(setPdfs),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const previewGraphics = graphics.slice(0, MAX_PREVIEW);
  const previewVideos = videos.slice(0, MAX_PREVIEW);
  const previewPdfs = pdfs.slice(0, MAX_PREVIEW);

  return (
    <div className="py-4">
      <PageHeader title="Extras" subtitle="Bonus graphics, videos, and PDFs" />

      {/* Graphics Section */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <Image size={20} className="text-[var(--color-brand-pink)]" />
          <h3 className="text-lg font-semibold">Graphics</h3>
        </div>
        {previewGraphics.length > 0 ? (
          <HorizontalScroll>
            {previewGraphics.map((item) => {
              const url = resolveImageUrl(item.image);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate('/extras/graphics')}
                  className="shrink-0 w-[180px] h-[180px] rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]"
                >
                  {url ? (
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </button>
              );
            })}
            {graphics.length > MAX_PREVIEW && (
              <ViewAllCard onClick={() => navigate('/extras/graphics')} icon={Image} count={graphics.length} />
            )}
          </HorizontalScroll>
        ) : (
          <div className="rounded-xl bg-[var(--color-bg-secondary)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
            No graphics available
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <Video size={20} className="text-[var(--color-brand-pink)]" />
          <h3 className="text-lg font-semibold">Videos</h3>
        </div>
        {previewVideos.length > 0 ? (
          <HorizontalScroll>
            {previewVideos.map((item) => {
              const thumb = resolveImageUrl(item.image) || (item as any).screenshot?.url || '';
              return (
                <button
                  key={item.id}
                  onClick={() => navigate('/extras/videos')}
                  className="shrink-0 w-[180px] h-[180px] rounded-xl overflow-hidden border border-[var(--color-border-light)] bg-[var(--color-bg-secondary)]"
                >
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </button>
              );
            })}
            {videos.length > MAX_PREVIEW && (
              <ViewAllCard onClick={() => navigate('/extras/videos')} icon={Video} count={videos.length} />
            )}
          </HorizontalScroll>
        ) : (
          <div className="rounded-xl bg-[var(--color-bg-secondary)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
            No videos available
          </div>
        )}
      </div>

      {/* PDFs Section */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={20} className="text-[var(--color-brand-pink)]" />
          <h3 className="text-lg font-semibold">PDFs</h3>
        </div>
        {previewPdfs.length > 0 ? (
          <HorizontalScroll>
            {previewPdfs.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate('/extras/pdfs')}
                className="shrink-0 w-[180px] h-[180px] rounded-xl border border-[var(--color-border-light)] bg-white flex flex-col items-center justify-center gap-2 p-3"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-brand-pink-light)] flex items-center justify-center">
                  <FileText size={28} className="text-[var(--color-brand-pink)]" />
                </div>
                <p className="text-xs font-medium text-center line-clamp-2">{item.name || item.title || 'PDF'}</p>
              </button>
            ))}
            {pdfs.length > MAX_PREVIEW && (
              <ViewAllCard onClick={() => navigate('/extras/pdfs')} icon={FileText} count={pdfs.length} />
            )}
          </HorizontalScroll>
        ) : (
          <div className="rounded-xl bg-[var(--color-bg-secondary)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
            No PDFs available
          </div>
        )}
      </div>
    </div>
  );
}
