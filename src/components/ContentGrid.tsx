import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ContentGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: { mobile?: number; tablet?: number; desktop?: number };
  loading?: boolean;
  emptyMessage?: string;
}

// Map column counts to Tailwind grid classes
const colClasses: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export default function ContentGrid<T>({
  items,
  renderItem,
  columns,
  loading,
  emptyMessage = 'No items found.',
}: ContentGridProps<T>) {
  const mobile = columns?.mobile ?? 2;
  const tablet = columns?.tablet ?? 3;
  const desktop = columns?.desktop ?? 4;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[var(--color-brand-pink)]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-[var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  const gridClass = `grid gap-3 ${colClasses[mobile]} md:${colClasses[tablet]} lg:${colClasses[desktop]}`;

  return (
    <div className={gridClass}>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
