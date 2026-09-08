import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, CreditCard, AlertTriangle, ArrowRight, ImagePlus } from 'lucide-react';
import { ImageDropzone } from '../../components/generator/ImageDropzone';
import { PromptInput } from '../../components/generator/PromptInput';
import { SettingsPanel } from '../../components/generator/SettingsPanel';
import { Button } from '../../components/ui/button';
import { useGeneratorStore } from '../../store/generatorStore';
import { useAuthStore } from '../../store/authStore';
import { estimateCredits } from '../../lib/credits';
import { videosApi } from '../../services/endpoints';
import { ApiError } from '../../services/api';
import { useToast } from '../../components/ui/toast';

const SAMPLE_FIRST = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=70';

export function GeneratorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const g = useGeneratorStore();
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const credits = useMemo(
    () =>
      estimateCredits({
        resolution: g.resolution,
        duration: g.duration,
        model: g.model,
        numberOfVideos: g.numberOfVideos,
      }),
    [g.resolution, g.duration, g.model, g.numberOfVideos]
  );

  const enoughCredits = (user?.credits ?? 0) >= credits;
  const canSubmit =
    !!g.firstFrame && g.prompt.trim().length >= 3 && enoughCredits && !submitting;

  const onGenerate = async () => {
    setTouched(true);
    if (!g.firstFrame) {
      toast({ variant: 'warning', title: 'Add a first frame', description: 'Upload an image to start.' });
      return;
    }
    if (g.prompt.trim().length < 3) {
      toast({ variant: 'warning', title: 'Add a prompt', description: 'Describe how your image should move.' });
      return;
    }
    if (!enoughCredits) {
      toast({
        variant: 'destructive',
        title: "You don't have enough credits",
        description: `This generation needs ${credits} credits but you have ${user?.credits ?? 0}.`,
      });
      return;
    }
    setSubmitting(true);
    try {
      const { video, creditsRemaining } = await videosApi.generate({
        prompt: g.prompt,
        firstFrame: g.firstFrame,
        lastFrame: g.lastFrame || undefined,
        model: g.model,
        aspectRatio: g.aspectRatio,
        resolution: g.resolution,
        duration: g.duration,
        numberOfVideos: g.numberOfVideos,
        motionStrength: g.motionStrength,
        cameraMovement: g.cameraMovement,
        title: g.prompt.slice(0, 60),
      });
      if (user) setUser({ ...user, credits: creditsRemaining });
      toast({
        variant: 'success',
        title: 'Generation started',
        description: 'We are creating your video. Redirecting…',
      });
      navigate(`/app/videos/${video._id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'INSUFFICIENT_CREDITS') {
          toast({
            variant: 'destructive',
            title: "You don't have enough credits",
            description: 'Upgrade your plan to continue.',
          });
        } else {
          toast({ variant: 'destructive', title: 'Generation failed', description: err.message });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation failed',
          description: 'Please try again in a moment.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!g.firstFrame && !touched) {
      // Show the page with an empty state — no auto-sample to keep things honest.
    }
  }, [g.firstFrame, touched]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-1">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" /> Image to video
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Create stunning videos with AI
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Turn your images into cinematic videos in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="vf-card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Upload your frames</div>
              <div className="text-xs text-muted-foreground">
                {g.lastFrame
                  ? 'Animating a transition between your first and last frame.'
                  : 'A single image generates a full motion clip.'}
              </div>
            </div>
            {g.firstFrame && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  g.set({ firstFrame: SAMPLE_FIRST });
                }}
              >
                <ImagePlus className="h-3.5 w-3.5" /> Use sample image
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ImageDropzone
              label="First Frame"
              hint="Required"
              value={g.firstFrame}
              onChange={(v) => g.set({ firstFrame: v })}
            />
            <ImageDropzone
              label="Last Frame (Optional)"
              hint="Create a transition"
              optional
              value={g.lastFrame}
              onChange={(v) => g.set({ lastFrame: v })}
            />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="vf-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Generation summary</div>
                <div className="text-xs text-muted-foreground">Review before generating</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold vf-gradient-text">{credits}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  credits
                </div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Model</dt>
                <dd className="mt-0.5 font-medium">{g.model}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Aspect</dt>
                <dd className="mt-0.5 font-medium">{g.aspectRatio}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Resolution</dt>
                <dd className="mt-0.5 font-medium">{g.resolution}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="mt-0.5 font-medium">{g.duration}s × {g.numberOfVideos}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Motion</dt>
                <dd className="mt-0.5 font-medium capitalize">{g.motionStrength}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Camera</dt>
                <dd className="mt-0.5 font-medium capitalize">{g.cameraMovement.replace('-', ' ')}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Credits remaining:</span>
              <span className="font-semibold">{user?.credits ?? 0}</span>
            </div>

            {!enoughCredits && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">You don't have enough credits.</div>
                  <div className="mt-0.5">You need {credits - (user?.credits ?? 0)} more credits.</div>
                  <Button
                    size="sm"
                    variant="soft"
                    className="mt-2"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade plan <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <Button
              size="xl"
              className="mt-5 w-full"
              onClick={onGenerate}
              disabled={!canSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Video
                </>
              )}
            </Button>
            <div className="mt-2 text-center text-[11px] text-muted-foreground">
              Estimated cost {credits} credits · No charge on failure
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <PromptInput value={g.prompt} onChange={(v) => g.set({ prompt: v })} />
      </div>

      <div className="mt-5">
        <SettingsPanel
          model={g.model}
          setModel={(v) => g.set({ model: v })}
          aspectRatio={g.aspectRatio}
          setAspectRatio={(v) => g.set({ aspectRatio: v })}
          resolution={g.resolution}
          setResolution={(v) => g.set({ resolution: v })}
          duration={g.duration}
          setDuration={(v) => g.set({ duration: v })}
          numberOfVideos={g.numberOfVideos}
          setNumberOfVideos={(v) => g.set({ numberOfVideos: v })}
          motionStrength={g.motionStrength}
          setMotionStrength={(v) => g.set({ motionStrength: v })}
          cameraMovement={g.cameraMovement}
          setCameraMovement={(v) => g.set({ cameraMovement: v })}
        />
      </div>
    </div>
  );
}
