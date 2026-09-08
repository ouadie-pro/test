import { Bell, Search, Sparkles, CreditCard } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useSearch } from '../../hooks/useSearch';

const titles: Record<string, string> = {
  '/app': 'New Task',
  '/app/videos': 'My Videos',
  '/app/assets': 'Assets',
  '/app/templates': 'Templates',
  '/app/scheduled': 'Scheduled',
  '/app/api': 'API Keys',
  '/app/settings': 'Settings',
  '/app/help': 'Help & Support',
  '/app/search': 'Search',
};

export function Header() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [, openSearch] = useSearch();

  let title = titles[location.pathname];
  if (!title) {
    if (location.pathname.startsWith('/app/videos/')) title = 'Video';
    else if (location.pathname.startsWith('/app/templates/')) title = 'Template';
    else title = 'VisionFlow';
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <div className="vf-gradient-bg grid h-8 w-8 place-items-center rounded-lg text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">VisionFlow</span>
      </div>

      <h1 className="hidden text-lg font-semibold tracking-tight md:block">{title}</h1>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos, assets, templates…"
            className="h-9 w-72 cursor-pointer pl-9 pr-12"
            readOnly
            onClick={() => openSearch()}
            onFocus={() => openSearch()}
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </span>
        </div>

        <Button size="icon" variant="ghost" className="md:hidden" onClick={() => openSearch()}>
          <Search className="h-5 w-5" />
        </Button>

        <button
          onClick={() => navigate('/pricing')}
          className="hidden items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted md:inline-flex"
        >
          <CreditCard className="h-3.5 w-3.5 text-primary" />
          <span>{user?.credits ?? 0} credits</span>
          <Badge variant="default" className="ml-1 hidden capitalize lg:inline-flex">
            {user?.plan || 'free'}
          </Badge>
        </button>

        <button
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-semibold md:hidden"
        >
          <CreditCard className="h-3.5 w-3.5 text-primary" />
          {user?.credits ?? 0}
        </button>

        <button
          className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <button
          onClick={() => navigate('/app/settings')}
          className="rounded-full"
          aria-label="Account"
        >
          <Avatar name={user?.name} src={user?.avatar} size={36} />
        </button>
      </div>
    </header>
  );
}
