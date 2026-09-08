import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, CreditCard, Loader2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { creditsApi, Plan } from '../services/endpoints';
import { useToast } from '../components/ui/toast';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

export function PricingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { plans } = await creditsApi.plans();
        setPlans(plans);
      } catch {
        toast({ variant: 'destructive', title: 'Failed to load plans' });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const onChoose = async (id: string) => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (id === 'free') {
      navigate('/app');
      return;
    }
    setUpgrading(id);
    try {
      const { user: u, plan } = await creditsApi.upgrade(id);
      setUser(u);
      toast({ variant: 'success', title: 'Plan upgraded', description: `You're on the ${plan.name} plan.` });
      navigate('/app');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upgrade failed', description: e?.message });
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="vf-gradient-bg grid h-8 w-8 place-items-center rounded-lg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">VisionFlow AI</span>
          </a>
          <Button asChild variant="ghost" size="sm">
            <a href={user ? '/app' : '/login'}>{user ? 'Open dashboard' : 'Sign in'}</a>
          </Button>
        </div>
      </header>

      <section className="container py-12 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3 w-3 text-amber-500" /> Simple, credit-based pricing
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Plans for every team</h1>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade as you create. Cancel anytime.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="vf-skeleton h-96" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {plans.map((p) => {
              const isCurrent = user?.plan === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'vf-card relative flex flex-col p-6',
                    p.highlighted && 'border-primary shadow-lg shadow-primary/10'
                  )}
                >
                  {p.highlighted && (
                    <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most popular
                    </Badge>
                  )}
                  <div className="text-sm font-semibold capitalize">{p.name}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${p.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {p.credits.toLocaleString()} credits · {p.resolution} max
                  </div>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Button
                      className="w-full"
                      variant={p.highlighted ? 'default' : 'outline'}
                      onClick={() => onChoose(p.id)}
                      disabled={!!upgrading || isCurrent}
                    >
                      {upgrading === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isCurrent ? (
                        'Current plan'
                      ) : p.id === 'free' ? (
                        'Get started'
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" /> Upgrade
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Need something custom? <a className="text-primary hover:underline" href="mailto:hello@visionflow.ai">Contact sales</a> for an Enterprise quote.
        </p>
      </section>
    </div>
  );
}
