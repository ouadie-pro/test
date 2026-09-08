import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Image as ImageIcon,
  Film,
  FolderOpen,
  LayoutTemplate,
  CalendarClock,
  Code2,
  Settings,
  LifeBuoy,
  Search,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuthStore } from '../../store/authStore';

const nav = [
  { to: '/app', label: 'New Task', icon: Plus, exact: true },
  { to: '/app/search', label: 'Search', icon: Search },
  { to: '/app/videos', label: 'My Videos', icon: Film },
  { to: '/app/assets', label: 'Assets', icon: FolderOpen },
  { to: '/app/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/app/scheduled', label: 'Scheduled', icon: CalendarClock },
  { to: '/app/api', label: 'API', icon: Code2 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/help', label: 'Help & Support', icon: LifeBuoy },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSearch: () => void;
}

export function Sidebar({ collapsed, onToggle, onOpenSearch }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card/50 backdrop-blur transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[244px]'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <div
          className="vf-gradient-bg grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm"
          aria-label="VisionFlow AI"
        >
          <Sparkles className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">VisionFlow AI</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Image → Video
            </span>
          </div>
        )}
      </div>

      <div className={cn('px-3 pb-3', collapsed && 'px-2')}>
        <Button
          onClick={onOpenSearch}
          variant="outline"
          className={cn('w-full justify-start text-muted-foreground', collapsed && 'justify-center px-0')}
          size={collapsed ? 'icon' : 'default'}
        >
          <Search className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="ml-1 text-sm">Search…</span>
              <span className="ml-auto rounded-md border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </span>
            </>
          )}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-0'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted',
                collapsed && 'justify-center'
              )}
            >
              <Avatar name={user?.name} src={user?.avatar} size={36} />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{user?.name || 'Guest'}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span>{user?.credits ?? 0} credits</span>
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <div className="px-2 pb-2 text-sm font-medium">{user?.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/pricing')}>
              <CreditCard className="h-4 w-4" /> Upgrade plan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={onToggle}
          className={cn(
            'mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            collapsed && 'justify-center'
          )}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
