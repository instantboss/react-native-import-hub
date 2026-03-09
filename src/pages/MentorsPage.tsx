import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from 'lucide-react';
import { fetchMentorsNav, type MentorNavItem } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner } from './TemplatesPage';

// Map mentor nav item names to routes (matches RN routeMap)
const routeMap: Record<string, string> = {
  'Ask a Mentor': '/mentors/ask',
  'Mentor Podcasts': '/mentors/podcasts',
  'Live Q & As': '/mentors/live-qa',
  'Mentors Toolbox': '/mentors/toolbox',
  'Extras': '/mentors/extras',
};

// Default nav items in case API fails
const defaultNavItems: MentorNavItem[] = [
  { id: 1, name: 'Ask a Mentor', icon: null, sort_order: 1 },
  { id: 2, name: 'Mentor Podcasts', icon: null, sort_order: 2 },
  { id: 3, name: 'Live Q & As', icon: null, sort_order: 3 },
  { id: 4, name: 'Mentors Toolbox', icon: null, sort_order: 4 },
  { id: 5, name: 'Extras', icon: null, sort_order: 5 },
];

function getIconUrl(icon: MentorNavItem['icon']): string | null {
  if (!icon) return null;
  if (typeof icon === 'string' && icon.startsWith('http')) return icon;
  if (typeof icon === 'object' && icon.url) return icon.url;
  return null;
}

export default function MentorsPage() {
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState<MentorNavItem[]>(defaultNavItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorsNav()
      .then((items) => {
        if (items.length > 0) setNavItems(items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNavPress = (item: MentorNavItem) => {
    const route = routeMap[item.name] || '/mentors/list';
    navigate(route);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="py-4">
      <PageHeader title="Mentors Lounge" />

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {navItems.map((item) => {
          const iconUrl = getIconUrl(item.icon);
          return (
            <button
              key={item.id}
              onClick={() => handleNavPress(item)}
              className="flex flex-col items-center py-4 px-2 rounded-xl border border-[var(--color-border-light)] bg-white hover:shadow-md transition-shadow"
            >
              {iconUrl ? (
                <img src={iconUrl} alt="" className="w-11 h-11 object-contain mb-2" />
              ) : (
                <div className="w-11 h-11 rounded-[10px] bg-[var(--color-bg-secondary)] flex items-center justify-center mb-2">
                  <Grid size={28} className="text-[var(--color-text-secondary)]" />
                </div>
              )}
              <span className="text-xs font-medium text-[var(--color-text-primary)] text-center leading-[14px]">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
