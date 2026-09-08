import { useEffect, useState } from 'react';
import { Code2, Copy, Plus, Trash2, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../../components/ui/dialog';
import { usersApi } from '../../services/endpoints';
import { useToast } from '../../components/ui/toast';
import { timeAgo } from '../../lib/utils';

interface ApiKey {
  key: string;
  label: string;
  createdAt: string;
}

export function ApiKeysPage() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { apiKeys } = await usersApi.listApiKeys();
      setKeys(apiKeys);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to load API keys' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async () => {
    if (!label.trim()) return;
    setCreating(true);
    try {
      const { apiKey } = await usersApi.createApiKey(label.trim());
      setKeys((prev) => [...prev, apiKey]);
      setLabel('');
      setOpen(false);
      toast({ variant: 'success', title: 'API key created', description: 'Store it securely — you won’t be able to see it again.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed to create key', description: e?.message });
    } finally {
      setCreating(false);
    }
  };

  const onRevoke = async (k: string) => {
    try {
      await usersApi.revokeApiKey(k);
      setKeys((prev) => prev.filter((x) => x.key !== k));
      toast({ variant: 'success', title: 'API key revoked' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to revoke key' });
    }
  };

  const onCopy = (k: string) => {
    navigator.clipboard.writeText(k).catch(() => {});
    toast({ variant: 'success', title: 'Copied to clipboard' });
  };

  const mask = (k: string) => `${k.slice(0, 8)}${'•'.repeat(Math.max(8, k.length - 12))}${k.slice(-4)}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Authenticate your backend against the VisionFlow REST API.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Create API key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new API key</DialogTitle>
              <DialogDescription>
                Choose a label so you can identify this key later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Production server"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onCreate} disabled={!label.trim() || creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="vf-card overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Code2 className="h-3.5 w-3.5" /> Existing keys
        </div>
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="vf-skeleton h-12 w-full" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
            <AlertCircle className="h-6 w-6" />
            <div>No API keys yet</div>
          </div>
        ) : (
          <ul>
            {keys.map((k) => {
              const visible = !!reveal[k.key];
              return (
                <li key={k.key} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{k.label}</div>
                    <code className="mt-0.5 block break-all text-xs text-muted-foreground">
                      {visible ? k.key : mask(k.key)}
                    </code>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Created {timeAgo(k.createdAt)}</div>
                  </div>
                  <button
                    onClick={() => setReveal((p) => ({ ...p, [k.key]: !p[k.key] }))}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Reveal"
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => onCopy(k.key)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Copy"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRevoke(k.key)}
                    className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                    aria-label="Revoke"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-5 vf-card p-5 text-sm">
        <div className="font-semibold">Using your key</div>
        <p className="mt-1 text-muted-foreground">Pass it as a bearer token to any endpoint:</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border bg-muted/30 p-3 text-xs">
{`curl -H "Authorization: Bearer vfk_..." \\
  https://api.visionflow.ai/v1/videos`}
        </pre>
      </div>
    </div>
  );
}
