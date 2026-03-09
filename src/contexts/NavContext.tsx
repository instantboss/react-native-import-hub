import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchNavContent, type NavItem } from '@/lib/api';

interface NavContextValue {
  navItems: NavItem[];
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetchNavContent((updated) => setNavItems(updated))
      .then((items) => setNavItems(items))
      .catch(console.error);
  }, []);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <NavContext.Provider value={{ navItems, isMenuOpen, toggleMenu, closeMenu }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
