import { type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import AppHeader from './AppHeader';
import NavFab from './NavFab';

export default function Layout({ children }: { children: ReactNode }) {
  const { unreadCount, user, logoUrl } = useUser();
  const location = useLocation();

  const isNestedPage = location.pathname.split('/').filter(Boolean).length > 1;

  // Use logo (business image) like RN app
  const profileImg = logoUrl || '';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <AppHeader showBack={isNestedPage} unreadCount={unreadCount} />

      {/* Main content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-20 pb-24">
        {children}
      </main>

      {/* Floating bottom navigation - pill shape */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-3 pointer-events-none">
        {/* Gradient fade */}
        <div className="absolute inset-x-0 -top-10 bottom-0 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <nav className="relative pointer-events-auto rounded-full border-[1.5px] border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <div className="nav-blur rounded-full flex items-center justify-center py-2 px-3 gap-1">
            {/* Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-2 text-xs font-medium tracking-tight ${
                  isActive ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-text-primary)]'
                }`
              }
            >
              <Home size={22} />
              <span className="mt-1">Home</span>
            </NavLink>

            {/* Calendar */}
            <NavLink
              to="/daily-content"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-2 text-xs font-medium tracking-tight ${
                  isActive ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-text-primary)]'
                }`
              }
            >
              <Calendar size={22} />
              <span className="mt-1">Calendar</span>
            </NavLink>

            {/* Profile with user logo (matches RN FloatingNav) */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-2 text-xs font-medium tracking-tight ${
                  isActive ? 'text-[var(--color-brand-pink)]' : 'text-[var(--color-text-primary)]'
                }`
              }
            >
              <div className="w-6 h-6 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-light)] overflow-hidden">
                {profileImg ? (
                  <img src={profileImg} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">
                    {(user?.first_name?.[0] || '?').toUpperCase()}
                  </div>
                )}
              </div>
              <span className="mt-1">Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* FAB + Grid nav */}
      <NavFab />
    </div>
  );
}
