import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

interface AppHeaderProps {
  showBack?: boolean;
  unreadCount?: number;
}

export default function AppHeader({ showBack, unreadCount = 0 }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--color-border-light)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-4">
        {/* Left: back button or spacer */}
        <div className="w-10 flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-[var(--color-text-primary)] hover:text-[var(--color-brand-pink)] transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
          )}
        </div>

        {/* Center: title */}
        <h1 className="text-base font-semibold text-[var(--color-text-primary)] tracking-tight">
          Small Shop Social
        </h1>

        {/* Right: notification bell */}
        <div className="w-10 flex items-center justify-end">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-1 text-[var(--color-text-primary)] hover:text-[var(--color-brand-pink)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[var(--color-brand-pink)] text-white text-[10px] font-bold leading-none px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
