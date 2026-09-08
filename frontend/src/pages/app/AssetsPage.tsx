import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Search,
  Image as ImageIcon,
  Video as VideoIcon,
  Star,
  Trash2,
  Folder,
  Clock,
  Heart,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { assetsApi, AssetDoc } from '../../services/endpoints';
import { absoluteUrl, formatBytes, timeAgo, cn } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';
import { useGeneratorStore } from '../../store/generatorStore';

const FOLDERS = [
  { id: 'all', label: 'All', icon: Folder },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Heart },
] as const;

export function AssetsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const gen = useGeneratorStore();
  const [assets, setAssets] = useState<AssetDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'all' | 'image' | 'video'>('all');
  const [folder, setFolder] = useState<typeof FOLDERS[number]['id']>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { assets } = await assetsApi.list({
        type,
        q: q || undefined,
        folder: folder === 'all' ? undefined : folder,
      });
      setAssets(assets);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load assets' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, folder]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) {
        await assetsApi.upload(f);
      }
      toast({ variant: 'success', title: 'Uploaded', description: `${files.length} file(s) added.` });
      await load();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: e?.message });
    } finally {
      setUploading(false);
    }
  };

  const onUseInGenerator = (a: AssetDoc) => {
    if (a.type !== 'image') {
      toast({
        variant: 'warning',
        title: 'Only images can be used as frames',
        description: 'Pick an image to use as a starting frame.',
      });
      return;
    }
    gen.set({ firstFrame: absoluteUrl(a.url) });
    toast({ variant: 'success', title: 'Added to generator', description: 'First frame updated.' });
    navigate('/app');
  };

  const onFavorite = async (id: string) => {
    try {
      const { asset } = await assetsApi.toggleFavorite(id);
      setAssets((prev) => prev.map((a) => (a._id === id ? asset : a)));
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update favorite' });
    }
  };

  const onDelete = async (id: string) => {
    try {
      await assetsApi.remove(id);
      setAssets((prev) => prev.filter((a) => a._id !== id));
      toast({ variant: 'success', title: 'Asset deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete' });
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return assets;
    return assets.filter((a) => a.filename.toLowerCase().includes(term));
  }, [assets, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Your uploaded images and generated videos, ready to reuse.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={(e) => onUpload(e.target.files)}
            className="hidden"
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
            placeholder="Search assets…"
            className="h-9 pl-9"
          />
        </div>

        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={folder} onValueChange={(v) => setFolder(v as any)}>
          <TabsList>
            {FOLDERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                <f.icon className="mr-1 h-3.5 w-3.5" />
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="md:hidden"
        >
          <option value="all">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="vf-card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-base font-semibold">No assets yet</div>
            <p className="text-sm text-muted-foreground">Upload images or videos to get started.</p>
          </div>
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload your first asset
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((a) => (
            <AssetCard
              key={a._id}
              asset={a}
              onFavorite={() => onFavorite(a._id)}
              onDelete={() => onDelete(a._id)}
              onUse={() => onUseInGenerator(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  onFavorite,
  onDelete,
  onUse,
}: {
  asset: AssetDoc;
  onFavorite: () => void;
  onDelete: () => void;
  onUse: () => void;
}) {
  const url = absoluteUrl(asset.url);
  return (
    <div className="group vf-card overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {asset.type === 'image' ? (
          <img src={url} alt={asset.filename} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <video src={url} className="h-full w-full object-cover" muted />
        )}
        <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onFavorite}
            className={cn(
              'grid h-8 w-8 place-items-center rounded-full bg-white/90 text-foreground backdrop-blur hover:bg-white',
              asset.isFavorite && 'text-amber-500'
            )}
            aria-label="Favorite"
          >
            <Star className={cn('h-4 w-4', asset.isFavorite && 'fill-current')} />
          </button>
          <div className="flex gap-1">
            {asset.type === 'image' && (
              <button
                onClick={onUse}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-foreground backdrop-blur hover:bg-white"
                aria-label="Use in generator"
                title="Use in generator"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-destructive backdrop-blur hover:bg-white"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="absolute right-2 top-2">
          <span className="rounded-md border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
            {asset.type === 'image' ? (
              <ImageIcon className="inline h-3 w-3" />
            ) : (
              <VideoIcon className="inline h-3 w-3" />
            )}{' '}
            {asset.type}
          </span>
        </div>
      </div>
      <div className="space-y-0.5 p-2.5">
        <div className="truncate text-xs font-semibold">{asset.filename}</div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{formatBytes(asset.size)}</span>
          <span>{timeAgo(asset.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
