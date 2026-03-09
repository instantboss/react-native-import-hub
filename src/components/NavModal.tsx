import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useNav } from '@/contexts/NavContext';
import { useUser } from '@/contexts/UserContext';
import { resolveImageUrl, type NavItem } from '@/lib/api';

// Map nav item IDs to internal routes
const NAV_ROUTES: Record<number, string> = {
  1: '/daily-content',
  2: '/mentors',
  3: '/vendors',
  4: '/lessons',
  5: '/templates',
  6: '/news',
  7: '/extras',
  9: '/shopping-list',
  10: '/presets',
  11: '/product-names',
  13: '/old-dash',
  14: '/printables',
  16: '/images',
  17: '/buy-guides',
  18: '/ai',
  19: '/groups',
};

function shouldShowItem(item: NavItem, isTrial: boolean, isPaid: boolean, isAdmin: boolean): boolean {
  // Admins see everything
  if (isAdmin) return true;
  // Trial users see items marked for trial
  if (isTrial) return !!item.show_trial;
  // Paid users see items marked for basic (paid) or trial
  if (isPaid) return !!item.show_basic || !!item.show_trial;
  // Fallback: show if marked for trial (most permissive public items)
  return !!item.show_trial;
}

interface NavModalProps {
  onClose: () => void;
}

export default function NavModal({ onClose }: NavModalProps) {
  const { navItems } = useNav();
  const { isTrial, isPaid, isAdmin } = useUser();
  const navigate = useNavigate();

  const visibleItems = navItems
    .filter((item) => shouldShowItem(item, isTrial, isPaid, isAdmin) && NAV_ROUTES[item.id])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const handleItemClick = (item: NavItem) => {
    const route = NAV_ROUTES[item.id];
    if (route) {
      navigate(route);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-y-auto shadow-xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-light)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-4">
          {visibleItems.map((item) => {
            const imageUrl = resolveImageUrl(item.image);
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-brand-pink-light)] transition-colors text-center"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-pink-light)] flex items-center justify-center text-[var(--color-brand-pink)] text-lg font-bold">
                    {item.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-[var(--color-text-primary)] leading-tight">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
