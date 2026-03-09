import { type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface ContentGateProps {
  children: ReactNode;
  freeCount?: number;
}

export default function ContentGate({ children, freeCount }: ContentGateProps) {
  const { isTrial } = useUser();

  if (!isTrial) {
    return <>{children}</>;
  }

  // If freeCount is set, we render children but the parent should limit items shown
  // The gate banner appears after the free items
  return (
    <>
      {freeCount !== undefined && children}
      <div className="my-6 rounded-2xl bg-[var(--color-brand-pink-light)] border border-[var(--color-card-border)] p-6 text-center">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Upgrade to unlock all content
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Get full access to templates, printables, lessons, and more with a paid membership.
        </p>
        <a
          href="https://instantbossclub.com/sss"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-brand-pink)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Upgrade Now
          <ExternalLink size={16} />
        </a>
      </div>
      {freeCount === undefined && null}
    </>
  );
}
