import { Calendar, Download, ExternalLink } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getCurrentMonthYear() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  const monthStr = String(month + 1).padStart(2, '0');
  return { month, year, monthStr, label: `${MONTHS[month]} ${year}` };
}

export default function OldDashPage() {
  const { year, monthStr, label } = getCurrentMonthYear();
  const baseUrl = 'https://images.instantbossclub.com/calendars';
  const pdfUrl = `${baseUrl}/${year}-${monthStr}.pdf`;
  const zipUrl = `${baseUrl}/${year}-${monthStr}-engagement.zip`;

  return (
    <div className="py-6 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center mb-3">
          <Calendar size={24} className="text-[var(--color-brand-pink)]" />
        </div>
        <h2 className="text-xl font-bold">Monthly Content</h2>
        <p className="text-2xl font-bold text-[var(--color-brand-pink)] mt-1">{label}</p>
      </div>

      <div className="space-y-4">
        {/* Content Calendar PDF */}
        <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5">
          <h3 className="font-semibold mb-1">Content Calendar</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Your monthly content calendar with daily posts, hashtags, and captions.
          </p>
          <div className="flex gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[var(--color-brand-pink)] text-[var(--color-brand-pink)] font-medium hover:bg-[var(--color-brand-pink-light)] transition-colors text-sm"
            >
              <ExternalLink size={16} />
              View PDF
            </a>
            <a
              href={pdfUrl}
              download
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-brand-pink)] text-white font-medium hover:opacity-90 transition-opacity text-sm"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        </div>

        {/* Engagement Images ZIP */}
        <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5">
          <h3 className="font-semibold mb-1">Engagement Images</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            All engagement images for this month in one download.
          </p>
          <a
            href={zipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[var(--color-brand-pink)] text-white font-medium hover:opacity-90 transition-opacity text-sm"
          >
            <Download size={16} />
            Download ZIP
          </a>
        </div>
      </div>
    </div>
  );
}
