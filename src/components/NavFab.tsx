import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, X } from 'lucide-react';
import { useNav } from '@/contexts/NavContext';
import { useUser } from '@/contexts/UserContext';
import { type NavItem } from '@/lib/api';

// Map Xano nav item IDs to internal routes (matches RN app exactly)
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

// Fallback name-based routing (matches RN app)
const NAME_ROUTES: Record<string, string> = {
  'Support': '/support',
  'Help': '/support',
  'FAQs': '/faqs',
};

// Helper to get icon URL from various formats (matches RN getIconUrl)
function getIconUrl(icon: NavItem['icon']): string | null {
  if (!icon) return null;
  if (typeof icon === 'string') return icon;
  if (typeof icon === 'object' && icon.url) return icon.url;
  return null;
}

function shouldShowItem(item: NavItem, isTrial: boolean, isBasic: boolean, isPaid: boolean, isAdmin: boolean): boolean {
  if (isAdmin || isPaid) return true;
  if (isBasic && item.show_basic) return true;
  if (isTrial && item.show_trial) return true;
  if (!isTrial && !isBasic && !isPaid) return !!item.show_trial;
  return false;
}

export default function NavFab() {
  const { navItems, isMenuOpen, toggleMenu, closeMenu } = useNav();
  const { isTrial, isPaid, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // isBasic = base_member and not trial (matches RN)
  const isBasic = isPaid;

  const visibleItems = navItems
    .filter((item) => shouldShowItem(item, isTrial, isBasic, isPaid, isAdmin))
    .sort((a, b) => (a.order ?? a.sort_order ?? 0) - (b.order ?? b.sort_order ?? 0));

  const handleItemClick = (item: NavItem) => {
    closeMenu();

    // Try ID-based route first
    const routeById = NAV_ROUTES[item.id];
    if (routeById) {
      navigate(routeById);
      return;
    }

    // Fall back to name-based route
    const routeByName = NAME_ROUTES[item.name];
    if (routeByName) {
      navigate(routeByName);
      return;
    }

    // External link
    if (item.link && item.link.startsWith('http')) {
      window.open(item.link, '_blank');
    }
  };

  const isActive = (item: NavItem) => {
    const route = NAV_ROUTES[item.id] || NAME_ROUTES[item.name];
    return route ? location.pathname.startsWith(route) : false;
  };

  return (
    <div className="fixed bottom-3 right-5 z-50 flex flex-col items-end">
      {/* Backdrop when open */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeMenu} />
      )}

      {/* Grid popup */}
      <div
        className={`mb-3 transition-all duration-200 origin-bottom-right z-50 ${
          isMenuOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none translate-y-2'
        }`}
      >
        <div className="w-[320px] rounded-2xl border-[1.5px] border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="nav-blur p-3">
            {visibleItems.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-[var(--color-text-muted)]">
                No menu items
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {visibleItems.map((item) => {
                  const iconUrl = getIconUrl(item.icon);
                  const active = isActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`flex flex-col items-center py-2.5 px-1.5 rounded-[10px] border transition-colors ${
                        active
                          ? 'bg-white border-[var(--color-brand-pink)] border-2'
                          : 'bg-white/35 border-white/80 hover:bg-white/60'
                      }`}
                    >
                      {iconUrl ? (
                        <img src={iconUrl} alt="" className="w-7 h-7 object-contain mb-1" />
                      ) : (
                        <div className="w-7 h-7 rounded-md bg-[var(--color-bg-secondary)] flex items-center justify-center mb-1">
                          <Grid size={16} className="text-[var(--color-text-secondary)]" />
                        </div>
                      )}
                      <span className={`text-[12px] font-medium text-center leading-[14px] tracking-tight ${
                        active ? 'text-[var(--color-brand-pink)] font-semibold' : 'text-[var(--color-text-primary)]'
                      }`}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={toggleMenu}
        className="relative z-50 w-11 h-11 rounded-full bg-[var(--color-brand-pink)] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:opacity-90 transition"
        aria-label="Menu"
      >
        {isMenuOpen ? <X size={20} /> : <Grid size={20} />}
      </button>
    </div>
  );
}
