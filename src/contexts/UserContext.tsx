import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchUserProfile, getNotificationCount, resolveImageUrl, type UserProfile } from '@/lib/api';
import { getAuthToken, saveAuthToken, saveUserData, removeAuthToken, removeUserData, isAuthenticated } from '@/lib/auth';
import { clearAllCache } from '@/lib/cache';

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  unreadCount: number;
  logoUrl: string | null;
  isTrial: boolean;
  isPaid: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  login: (token: string, user: { id: number; email: string; first_name: string; last_name: string }) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isTrial = !!user?.trial_member || !!user?.free_member;
  const isPaid = !!user?.base_member && !isTrial;
  const isAdmin = !!user?.admin || !!user?.super_admin;
  const logoUrl = resolveImageUrl(user?.logo) || null;

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await fetchUserProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { unread_count } = await getNotificationCount();
      setUnreadCount(unread_count);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback((token: string, userData: { id: number; email: string; first_name: string; last_name: string }) => {
    saveAuthToken(token);
    saveUserData({
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
    });
    // Fetch full profile after login
    refreshProfile();
    refreshUnreadCount();
  }, [refreshProfile, refreshUnreadCount]);

  const logout = useCallback(() => {
    removeAuthToken();
    removeUserData();
    clearAllCache();
    setUser(null);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      Promise.all([refreshProfile(), refreshUnreadCount()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile, refreshUnreadCount]);

  // Poll unread count every 60s while authenticated
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  // Suppress unused variable warning — getAuthToken is used indirectly via isAuthenticated
  void getAuthToken;

  return (
    <UserContext.Provider value={{ user, loading, unreadCount, logoUrl, isTrial, isPaid, isAdmin, refreshProfile, refreshUnreadCount, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
