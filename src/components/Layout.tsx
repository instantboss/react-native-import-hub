import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, User, LayoutGrid } from 'lucide-react';
import { useNav } from '@/contexts/NavContext';
import { useUser } from '@/contexts/UserContext';
import AppHeader from './AppHeader';
import NavModal from './NavModal';

const navTabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/daily-content', icon: Calendar, label: 'Calendar' },
  { to: '/profile', icon: User, label: 'Profile' },
] as const;

export default function Layout({ children }: { children: ReactNode }) {
  const { isMenuOpen, toggleMenu, closeMenu } = useNav();
  const { unreadCount } = useUser();
  const location = useLocation();

  // Determine if we need a back button (not on root pages)
  const isNestedPage = location.pathname.split('/').filter(Boolean).length > 1;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <AppHeader showBack={isNestedPage} unreadCount={unreadCount} />

      {/* Main content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-16 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border-light)]">
        <div className="max-w-5xl mx-auto flex items-center justify-around h-16">
          {navTabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors ${
                  isActive ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Grid menu button */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors ${
              isMenuOpen ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-text-muted)]'
            }`}
            aria-label="Menu"
          >
            <LayoutGrid size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Nav modal overlay */}
      {isMenuOpen && <NavModal onClose={closeMenu} />}
    </div>
  );
}
