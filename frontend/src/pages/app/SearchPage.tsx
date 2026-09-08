import { Search } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

export function SearchPage() {
  const [, openSearch] = useSearch();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <div className="vf-card flex flex-col items-center gap-3 p-12 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Search VisionFlow</h1>
        <p className="text-sm text-muted-foreground">Find videos, assets, and templates across your workspace.</p>
        <button
          onClick={() => openSearch()}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Search className="h-4 w-4" /> Open search <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
      </div>
    </div>
  );
}
