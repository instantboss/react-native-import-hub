import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

interface AppHeaderProps {
  showBack?: boolean;
  unreadCount?: number;
}

export default function AppHeader({ showBack, unreadCount = 0 }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 header-gradient">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 pt-3 pb-4">
        {/* Left: back button or spacer */}
        <div className="w-9 h-9 flex items-center justify-center">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-[#777] hover:text-[var(--color-brand-pink)] transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          )}
        </div>

        {/* Center: Logo */}
        <button
          onClick={() => location.pathname !== '/' && navigate('/')}
          className="py-1"
        >
          <img
            src="/logo.png"
            alt="Small Shop Social"
            className="h-[50px] w-auto object-contain"
          />
        </button>

        {/* Right: notification bell */}
        <div className="w-9 h-9 flex items-center justify-center">
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-[#777] hover:text-[var(--color-brand-pink)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--color-brand-pink)] border-[1.5px] border-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
