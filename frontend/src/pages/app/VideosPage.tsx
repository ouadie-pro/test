import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Loader2, MoreHorizontal, Play, Search, Trash2, Download, Share2, Sparkles, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { Select } from '../../components/ui/select';
import { videosApi, VideoDoc } from '../../services/endpoints';
import { absoluteUrl, timeAgo, cn } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';

const FILTERS: { id: 'all' | VideoDoc['status']; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'processing', label: 'Processing' },
  { id: 'failed', label: 'Failed' },
];

export function VideosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<typeof FILTERS[number]['id']>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'most-viewed'>('newest');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { videos } = await videosApi.list({ status: status === 'all' ? undefined : status, sort });
      setVideos(videos);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load videos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sort]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return videos;
    return videos.filter(
      (v) => v.title.toLowerCase().includes(term) || v.prompt.toLowerCase().includes(term)
    );
  }, [videos, q]);

  const remove = async (id: string) => {
    try {
      await videosApi.remove(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
      toast({ variant: 'success', title: 'Video deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete video' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Videos</h1>
          <p className="text-sm text-muted-foreground">Every clip you've generated with VisionFlow.</p>
        </div>
        <Button onClick={() => navigate('/app')} variant="default">
          <Sparkles className="h-4 w-4" /> New video
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your videos…"
              className="h-9 pl-9"
            />
          </div>
          <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-9 w-44"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="most-viewed">Most viewed</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="vf-card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Film className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold">No videos yet</div>
            <p className="text-sm text-muted-foreground">Generate your first video to see it here.</p>
          </div>
          <Button onClick={() => navigate('/app')}>
            <Sparkles className="h-4 w-4" /> Create your first video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard key={v._id} video={v} onDelete={() => remove(v._id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({ video, onDelete }: { video: VideoDoc; onDelete: () => void }) {
  const navigate = useNavigate();
  const thumb = absoluteUrl(video.thumbnailUrl || video.firstFrame);
  const statusBadge = (() => {
    if (video.status === 'completed')
      return <Badge variant="success">Completed</Badge>;
    if (video.status === 'failed')
      return <Badge variant="destructive">Failed</Badge>;
    if (video.status === 'cancelled')
      return <Badge variant="warning">Cancelled</Badge>;
    return <Badge variant="default">Processing</Badge>;
  })();

  const onCopy = () => {
    const url = absoluteUrl(video.videoUrl);
    if (url) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <div className="vf-card group overflow-hidden">
      <Link
        to={`/app/videos/${video._id}`}
        className="relative block aspect-video w-full overflow-hidden bg-muted"
      >
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Film className="h-6 w-6" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-foreground shadow">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
        <div className="absolute left-2 top-2">{statusBadge}</div>
        {video.status === 'processing' && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur">
            <Loader2 className="h-3 w-3 animate-spin" /> {video.progress}%
          </div>
        )}
        {video.status === 'completed' && (
          <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            {video.duration}s · {video.resolution}
          </div>
        )}
      </Link>

      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{video.title || 'Untitled video'}</div>
            <div className="truncate text-xs text-muted-foreground">
              {video.model} · {video.aspectRatio} · {timeAgo(video.createdAt)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/app/videos/${video._id}`)}>
                <Play className="h-4 w-4" /> Open
              </DropdownMenuItem>
              {video.videoUrl && (
                <DropdownMenuItem asChild>
                  <a href={absoluteUrl(video.videoUrl)} download target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onCopy}>
                <Share2 className="h-4 w-4" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
