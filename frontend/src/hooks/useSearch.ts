import { useCallback, useEffect, useState } from 'react';

let _openSearch: () => void = () => {};
let _listeners: Array<(open: boolean) => void> = [];

export function useSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (next: boolean) => setOpen(next);
    _listeners.push(handler);
    return () => {
      _listeners = _listeners.filter((l) => l !== handler);
    };
  }, []);

  const openSearch = useCallback(() => {
    _listeners.forEach((l) => l(true));
  }, []);

  const closeSearch = useCallback(() => {
    _listeners.forEach((l) => l(false));
  }, []);

  useEffect(() => {
    _openSearch = openSearch;
  }, [openSearch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        _openSearch();
      } else if (e.key === 'Escape' && open) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeSearch]);

  return [open, openSearch, closeSearch] as const;
}
