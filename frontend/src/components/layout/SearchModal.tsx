import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';
import { assetsApi, templatesApi, videosApi, VideoDoc, AssetDoc, TemplateDoc } from '../../services/endpoints';
import { Search, Film, Image as ImageIcon, LayoutTemplate, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  navigate: (to: string) => void;
}

type Hit =
  | { type: 'video'; id: string; title: string; subtitle: string; thumb: string; data: VideoDoc }
  | { type: 'asset'; id: string; title: string; subtitle: string; thumb: string; data: AssetDoc }
  | { type: 'template'; id: string; title: string; subtitle: string; thumb: string; data: TemplateDoc };

export function SearchModal({ open, onClose, navigate }: Props) {
  const [q, setQ] = useState('');
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [assets, setAssets] = useState<AssetDoc[]>([]);
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setActiveIndex(0);
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [v, a, t] = await Promise.all([
          videosApi.list({ sort: 'newest' }),
          assetsApi.list(),
          templatesApi.list(),
        ]);
        if (cancelled) return;
        setVideos(v.videos);
        setAssets(a.assets);
        setTemplates(t.templates);
      } catch {
        // ignore — search modal should never block the app
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const hits: Hit[] = useMemo(() => {
    const term = q.trim().toLowerCase();
    const matches = (s: string) => !term || s.toLowerCase().includes(term);
    const v: Hit[] = videos
      .filter((x) => matches(x.title) || matches(x.prompt))
      .slice(0, 6)
      .map((x) => ({
        type: 'video',
        id: x._id,
        title: x.title || 'Untitled video',
        subtitle: `${x.status} • ${x.resolution} • ${x.aspectRatio}`,
        thumb: x.thumbnailUrl || x.firstFrame,
        data: x,
      }));
    const a: Hit[] = assets
      .filter((x) => matches(x.filename))
      .slice(0, 6)
      .map((x) => ({
        type: 'asset',
        id: x._id,
        title: x.filename,
        subtitle: x.type,
        thumb: x.url,
        data: x,
      }));
    const t: Hit[] = templates
      .filter((x) => matches(x.title) || matches(x.description) || matches(x.category))
      .slice(0, 6)
      .map((x) => ({
        type: 'template',
        id: x._id,
        title: x.title,
        subtitle: x.category,
        thumb: x.preview,
        data: x,
      }));
    return [...v, ...a, ...t];
  }, [q, videos, assets, templates]);

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  const go = (hit?: Hit) => {
    if (!hit) return;
    if (hit.type === 'video') navigate(`/app/videos/${hit.id}`);
    if (hit.type === 'asset') navigate(`/app/assets`);
    if (hit.type === 'template') navigate(`/app/templates/${hit.id}`);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(hits.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(hits[activeIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl gap-0 p-0 sm:rounded-2xl">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search videos, assets, templates…"
            className="h-9 flex-1 border-0 px-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {hits.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <Sparkles className="h-6 w-6" />
              <div>No results found</div>
              <div className="text-xs">Try searching for a video, asset, or template name.</div>
            </div>
          )}

          {hits.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {hits.map((hit, idx) => {
                const Icon =
                  hit.type === 'video' ? Film : hit.type === 'asset' ? ImageIcon : LayoutTemplate;
                return (
                  <li key={`${hit.type}-${hit.id}`}>
                    <button
                      type="button"
                      onClick={() => go(hit)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                        idx === activeIndex ? 'bg-muted' : 'hover:bg-muted/60'
                      )}
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                        {hit.thumb ? (
                          <img
                            src={hit.thumb}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{hit.title}</span>
                          <span className="rounded-md border bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {hit.type}
                          </span>
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{hit.subtitle}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="rounded border bg-background px-1.5 py-0.5">↑↓</span>
            <span>Navigate</span>
            <span className="rounded border bg-background px-1.5 py-0.5">↵</span>
            <span>Open</span>
            <span className="rounded border bg-background px-1.5 py-0.5">esc</span>
            <span>Close</span>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <Sparkles className="h-3 w-3" />
            <span>VisionFlow Search</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
