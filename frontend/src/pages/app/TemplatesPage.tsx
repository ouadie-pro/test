import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Sparkles, Search, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { templatesApi, TemplateDoc } from '../../services/endpoints';
import { useGeneratorStore } from '../../store/generatorStore';
import { useToast } from '../../components/ui/toast';

const CATEGORIES = [
  'All',
  'Cinematic',
  'Product Ads',
  'Social Media',
  'Anime',
  'Realistic',
  'Fashion',
  'Travel',
  'Nature',
  'Character Animation',
];

export function TemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const gen = useGeneratorStore();
  const [templates, setTemplates] = useState<TemplateDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { templates } = await templatesApi.list(category === 'All' ? undefined : category);
        setTemplates(templates);
      } catch {
        toast({ variant: 'destructive', title: 'Failed to load templates' });
      } finally {
        setLoading(false);
      }
    })();
  }, [category, toast]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
    );
  }, [templates, q]);

  const useTemplate = (t: TemplateDoc) => {
    gen.set({
      prompt: t.prompt,
      model: t.settings.model,
      aspectRatio: t.settings.aspectRatio,
      resolution: t.settings.resolution,
      duration: t.settings.duration,
      motionStrength: t.settings.motionStrength,
      cameraMovement: t.settings.cameraMovement,
    });
    toast({ variant: 'success', title: 'Template applied', description: 'Settings have been filled in.' });
    navigate('/app');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Start from a curated preset — every template is a one-click setup.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates…" className="h-9 pl-9" />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="flex max-w-full flex-wrap">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="vf-card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="text-base font-semibold">No templates match your filters</div>
            <p className="text-sm text-muted-foreground">Try a different category or search term.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div key={t._id} className="vf-card group overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={t.preview}
                  alt={t.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/0 to-transparent p-3">
                  <Badge variant="default" className="bg-white/90 text-foreground">
                    {t.category}
                  </Badge>
                  {t.featured && <Badge variant="success">Featured</Badge>}
                </div>
              </div>
              <div className="space-y-2 p-4">
                <div className="text-base font-semibold">{t.title}</div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{t.settings.model}</Badge>
                  <Badge variant="secondary">{t.settings.aspectRatio}</Badge>
                  <Badge variant="secondary">{t.settings.resolution}</Badge>
                  <Badge variant="secondary">{t.settings.duration}s</Badge>
                </div>
                <Button onClick={() => useTemplate(t)} className="mt-2 w-full" size="sm">
                  <Sparkles className="h-4 w-4" /> Use template <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
