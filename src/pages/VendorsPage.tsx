import { ShoppingBag, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const VENDORS_URL = 'https://wholesalelist.instantbossclub.com/';

export default function VendorsPage() {
  return (
    <div className="py-4">
      <PageHeader title="Vendors" />

      <div className="flex flex-col items-center text-center py-12">
        <div className="w-24 h-24 rounded-full bg-[var(--color-brand-pink-light)] flex items-center justify-center mb-4">
          <ShoppingBag size={48} className="text-[var(--color-brand-pink)]" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Vendors List</h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs mb-6">
          Access our curated list of wholesale vendors and suppliers.
        </p>
        <a
          href={VENDORS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-brand-pink)] text-white font-semibold hover:opacity-90 transition"
        >
          <ExternalLink size={18} />
          Open Vendors List
        </a>
      </div>
    </div>
  );
}
