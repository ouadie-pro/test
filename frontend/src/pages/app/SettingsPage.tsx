import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { usersApi } from '../../services/endpoints';
import { ApiError } from '../../services/api';
import { Loader2, Save, Lock, Bell, User, CreditCard, Code2, ShieldCheck } from 'lucide-react';

export function SettingsPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, security, and notifications.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="profile"><User className="mr-1 h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="account"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Account</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-1 h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1 h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="api"><Code2 className="mr-1 h-3.5 w-3.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-1 h-3.5 w-3.5" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab user={user} onSave={(u: any) => setUser(u)} toast={toast} />
        </TabsContent>
        <TabsContent value="account"><AccountTab user={user} /></TabsContent>
        <TabsContent value="security"><SecurityTab toast={toast} /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab toast={toast} /></TabsContent>
        <TabsContent value="api">
          <div className="vf-card p-5">
            <div className="text-sm font-semibold">API keys live in their own page</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Visit the API Keys page from the sidebar to manage your tokens.
            </p>
            <Button asChild className="mt-3">
              <a href="/app/api">Open API Keys</a>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="billing">
          <div className="vf-card p-5">
            <div className="text-sm font-semibold">Current plan: <span className="capitalize">{user?.plan || 'free'}</span></div>
            <p className="mt-1 text-sm text-muted-foreground">
              You have <strong>{user?.credits ?? 0}</strong> credits remaining.
            </p>
            <Button asChild className="mt-3">
              <a href="/pricing">Manage plan</a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab({ user, onSave, toast }: any) {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user: u } = await usersApi.updateProfile({ name, avatar });
      onSave(u);
      toast({ variant: 'success', title: 'Profile updated' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update';
      toast({ variant: 'destructive', title: 'Update failed', description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="vf-card mt-4 space-y-4 p-5">
      <div className="flex items-center gap-4">
        <Avatar name={name} src={avatar} size={64} />
        <div>
          <div className="text-sm font-semibold">Profile photo</div>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP up to 5MB.</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="avatar">Avatar URL</Label>
        <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={user?.email || ''} readOnly disabled />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
      </Button>
    </form>
  );
}

function AccountTab({ user }: any) {
  return (
    <div className="vf-card mt-4 space-y-2 p-5 text-sm">
      <Row label="User ID" value={user?._id || ''} />
      <Row label="Email" value={user?.email || ''} />
      <Row label="Plan" value={user?.plan || 'free'} />
      <Row label="Credits" value={String(user?.credits ?? 0)} />
      <Row label="Joined" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SecurityTab({ toast }: any) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await usersApi.changePassword({ currentPassword: current, newPassword: next });
      toast({ variant: 'success', title: 'Password updated' });
      setCurrent('');
      setNext('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update password';
      toast({ variant: 'destructive', title: 'Update failed', description: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="vf-card mt-4 space-y-4 p-5">
      <div className="space-y-1.5">
        <Label htmlFor="cur">Current password</Label>
        <Input id="cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="next">New password</Label>
        <Input id="next" type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={6} required />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
      </Button>
    </form>
  );
}

function NotificationsTab({ toast }: any) {
  const [email, setEmail] = useState(true);
  const [product, setProduct] = useState(true);
  return (
    <div className="vf-card mt-4 space-y-4 p-5">
      <ToggleRow
        title="Generation complete"
        desc="Receive an email when a video finishes rendering."
        value={email}
        onChange={setEmail}
        onSave={async () => toast({ variant: 'success', title: 'Preferences saved' })}
      />
      <ToggleRow
        title="Product updates"
        desc="Be the first to know about new models and features."
        value={product}
        onChange={setProduct}
        onSave={async () => toast({ variant: 'success', title: 'Preferences saved' })}
      />
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  value,
  onChange,
  onSave,
}: {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onSave: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' +
            (value ? 'bg-primary' : 'bg-muted')
          }
          aria-pressed={value}
        >
          <span
            className={
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ' +
              (value ? 'translate-x-5' : 'translate-x-1')
            }
          />
        </button>
        <Button size="sm" variant="ghost" onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}
