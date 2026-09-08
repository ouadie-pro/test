import { Link, Outlet } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
          <div className="vf-gradient-bg grid h-9 w-9 place-items-center rounded-xl text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-base">VisionFlow AI</span>
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} VisionFlow AI — Cinematic image-to-video generation.
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted/40 lg:block">
        <div className="absolute inset-0 vf-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 self-end rounded-full border bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
            <Star className="h-3 w-3 text-amber-500" />
            Trusted by 12,000+ creators
          </div>

          <div className="space-y-6">
            <div className="vf-card max-w-md p-6">
              <p className="text-lg font-medium leading-relaxed">
                "VisionFlow turned a single product shot into a 10-second cinematic ad in under a
                minute. It's the fastest creative tool in our stack."
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white">
                  AK
                </div>
                <div>
                  <div className="text-sm font-semibold">Aria Kim</div>
                  <div className="text-xs text-muted-foreground">Creative Director, Northwind</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=70',
                'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=70',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70',
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=70',
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=70',
                'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=70',
              ].map((src) => (
                <div key={src} className="aspect-square overflow-hidden rounded-xl border bg-muted">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
