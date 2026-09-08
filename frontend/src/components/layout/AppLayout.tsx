import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SearchModal } from './SearchModal';
import { useSearch } from '../../hooks/useSearch';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, openSearch, closeSearch] = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-collapse on smaller screens
    const onResize = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex h-full min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onOpenSearch={() => openSearch()}
        />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onOpenSearch={() => {
                setMobileOpen(false);
                openSearch();
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="md:hidden">
          <div className="flex h-14 items-center gap-2 border-b bg-background px-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="vf-gradient-bg grid h-7 w-7 place-items-center rounded-lg text-white">
              <span className="text-xs font-bold">V</span>
            </div>
            <span className="text-sm font-semibold">VisionFlow</span>
          </div>
        </div>

        <div className="hidden md:block">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <SearchModal open={searchOpen} onClose={() => closeSearch()} navigate={navigate} />
    </div>
  );
}
