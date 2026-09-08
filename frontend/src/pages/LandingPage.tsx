import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  ImageIcon,
  Film,
  ArrowRight,
  Star,
  CheckCircle2,
  Play,
  Zap,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/authStore';

const SAMPLE_FRAMES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=70',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=70',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900&q=70',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=70',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=70',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=70',
];

export function LandingPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="vf-gradient-bg grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold tracking-tight">VisionFlow AI</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to="/app">
                  Open dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 vf-grid-bg opacity-50" />
        <div className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[500px] max-w-3xl rounded-full bg-primary/20 blur-3xl" />
        <div className="container flex flex-col items-center py-20 text-center md:py-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Star className="h-3 w-3 text-amber-500" />
            New: VisionFlow Cinematic v2 is here
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Create stunning videos with{' '}
            <span className="vf-gradient-text">AI</span>
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
            Turn your images into cinematic videos in seconds. Upload a frame, describe the
            motion, and watch your idea come to life.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="xl">
              <Link to={user ? '/app' : '/register'}>
                <Wand2 className="h-4 w-4" /> Start creating
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            500 free credits. No credit card required.
          </p>
        </div>

        <div className="container pb-16">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {SAMPLE_FRAMES.map((src, i) => (
              <div
                key={src}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border bg-muted shadow-sm transition-transform hover:-translate-y-1"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Play className="h-3 w-3" /> Watch preview
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="border-t bg-muted/20 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to ship</h2>
            <p className="mt-3 text-muted-foreground">
              A complete creative toolkit for image-to-video generation, designed for speed and quality.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: <ImageIcon className="h-5 w-5" />,
                title: 'Single & two-frame motion',
                desc: 'Generate from one image, or animate a transition between a first and last frame.',
              },
              {
                icon: <Wand2 className="h-5 w-5" />,
                title: 'Prompt enhancement',
                desc: 'Our models understand camera, motion, and lighting — so a few words go a long way.',
              },
              {
                icon: <Film className="h-5 w-5" />,
                title: 'Multi-model pipeline',
                desc: 'Choose between Motion, Cinematic, or Fast models per generation.',
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: 'Real-time progress',
                desc: 'Watch your video render with live progress and instant download when ready.',
              },
              {
                icon: <Layers className="h-5 w-5" />,
                title: 'Asset library',
                desc: 'Re-use uploaded frames and reference shots across every project.',
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: 'Secure by default',
                desc: 'JWT auth, encrypted storage, and a clean API key system for builders.',
              },
            ].map((f) => (
              <div key={f.title} className="vf-card p-6">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <div className="text-base font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">From idea to video in 4 steps</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              { n: 1, title: 'Upload image', desc: 'Drop a single frame or add a first + last frame.' },
              { n: 2, title: 'Describe motion', desc: 'Tell the model how the camera and subject should move.' },
              { n: 3, title: 'Pick a model', desc: 'Choose Motion, Cinematic, or Fast — and resolution.' },
              { n: 4, title: 'Generate', desc: 'Watch live progress and download when ready.' },
            ].map((s) => (
              <div key={s.n} className="vf-card p-6">
                <div className="text-3xl font-bold vf-gradient-text">0{s.n}</div>
                <div className="mt-2 text-sm font-semibold">{s.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-t bg-muted/20 py-20">
        <div className="container max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Frequently asked</h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: 'Do I need a credit card to start?',
                a: 'No. The free plan includes 500 credits to try every model and resolution.',
              },
              {
                q: 'How long does a generation take?',
                a: 'Most clips finish in 6–12 seconds. Cinematic 1080p clips can take a little longer.',
              },
              {
                q: 'Can I bring my own model?',
                a: 'Yes. The provider layer in the backend is pluggable — see the README for connecting a real API.',
              },
              {
                q: 'Is there an API?',
                a: 'Every account has scoped API keys. Visit Settings → API Keys to create one.',
              },
            ].map((f) => (
              <details key={f.q} className="vf-card p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="text-sm font-semibold">{f.q}</span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> VisionFlow AI © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
