import { useNavigate } from 'react-router-dom';
import { Image, Video, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const cards = [
  { to: '/extras/graphics', icon: Image, label: 'Extra Graphics', desc: 'Bonus graphics for your shop' },
  { to: '/extras/videos', icon: Video, label: 'Extra Videos', desc: 'Bonus video content' },
  { to: '/extras/pdfs', icon: FileText, label: 'Extra PDFs', desc: 'Bonus downloadable PDFs' },
] as const;

export default function ExtrasPage() {
  const navigate = useNavigate();

  return (
    <div className="py-4">
      <PageHeader title="Extras" subtitle="Bonus graphics, videos, and PDFs" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ to, icon: Icon, label, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md hover:border-[var(--color-card-border)] transition-all text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center">
              <Icon size={24} className="text-[var(--color-brand-pink)]" />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
