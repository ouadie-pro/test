import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { templatesApi, TemplateDoc } from '../../services/endpoints';
import { useGeneratorStore } from '../../store/generatorStore';
import { useToast } from '../../components/ui/toast';
import { Skeleton } from '../../components/ui/skeleton';

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const gen = useGeneratorStore();
  const [tpl, setTpl] = useState<TemplateDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { template } = await templatesApi.get(id);
        setTpl(template);
      } catch {
        toast({ variant: 'destructive', title: 'Template not found' });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="aspect-[16/9] w-full" />
      </div>
    );
  }

  if (!tpl) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="vf-card p-8">Template not found.</div>
        <Button className="mt-4" onClick={() => navigate('/app/templates')}>
          Back to templates
        </Button>
      </div>
    );
  }

  const onUse = () => {
    gen.set({
      prompt: tpl.prompt,
      model: tpl.settings.model,
      aspectRatio: tpl.settings.aspectRatio,
      resolution: tpl.settings.resolution,
      duration: tpl.settings.duration,
      motionStrength: tpl.settings.motionStrength,
      cameraMovement: tpl.settings.cameraMovement,
    });
    toast({ variant: 'success', title: 'Template applied' });
    navigate('/app');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="vf-card overflow-hidden">
            <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
              <img src={tpl.preview} alt={tpl.title} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <div className="vf-card p-5">
            <Badge variant="default" className="mb-2 w-fit">{tpl.category}</Badge>
            <h1 className="text-2xl font-bold tracking-tight">{tpl.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{tpl.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="text-muted-foreground">Model</div>
                <div className="mt-0.5 font-medium">{tpl.settings.model}</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="text-muted-foreground">Aspect / Resolution</div>
                <div className="mt-0.5 font-medium">{tpl.settings.aspectRatio} · {tpl.settings.resolution}</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="text-muted-foreground">Duration</div>
                <div className="mt-0.5 font-medium">{tpl.settings.duration}s</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <div className="text-muted-foreground">Camera</div>
                <div className="mt-0.5 font-medium capitalize">{tpl.settings.cameraMovement.replace('-', ' ')}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-muted-foreground">Prompt</div>
              <p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm">{tpl.prompt}</p>
            </div>

            <Button onClick={onUse} className="mt-4 w-full" size="lg">
              <Sparkles className="h-4 w-4" /> Use template <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
