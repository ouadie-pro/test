import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  RefreshCw,
  Edit3,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { videosApi, VideoDoc } from '../../services/endpoints';
import { absoluteUrl, timeAgo } from '../../lib/utils';
import { useToast } from '../../components/ui/toast';
import { useAuthStore } from '../../store/authStore';
import { useGeneratorStore } from '../../store/generatorStore';

export function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const gen = useGeneratorStore();
  const [video, setVideo] = useState<VideoDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (showLoading = true) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const { video } = await videosApi.get(id);
      setVideo(video);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load video');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll while processing
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (!video) return;
    const inProgress = video.status === 'queued' || video.status === 'processing';
    if (inProgress) {
      pollRef.current = window.setInterval(() => load(false), 1500);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.status]);

  if (loading && !video) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="vf-skeleton mb-6 h-8 w-48" />
        <div className="vf-skeleton mb-4 aspect-video w-full rounded-2xl" />
        <div className="vf-skeleton h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <div className="vf-card p-8">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <div className="text-base font-semibold">We couldn't load this video</div>
          <div className="mt-1 text-sm text-muted-foreground">{error || 'Video not found'}</div>
          <Button className="mt-4" onClick={() => navigate('/app/videos')}>
            Back to My Videos
          </Button>
        </div>
      </div>
    );
  }

  const inProgress = video.status === 'queued' || video.status === 'processing';
  const completed = video.status === 'completed';
  const failed = video.status === 'failed';
  const cancelled = video.status === 'cancelled';

  const onRetry = async () => {
    try {
      const { video: v } = await videosApi.retry(video._id);
      setVideo(v);
      toast({ variant: 'success', title: 'Retrying…' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Retry failed', description: e?.message });
    }
  };

  const onCancel = async () => {
    try {
      const { video: v, creditsRemaining } = await videosApi.cancel(video._id);
      setVideo(v);
      if (user) setUser({ ...user, credits: creditsRemaining });
      toast({ variant: 'default', title: 'Generation cancelled' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Cancel failed', description: e?.message });
    }
  };

  const onDelete = async () => {
    try {
      await videosApi.remove(video._id);
      toast({ variant: 'success', title: 'Video deleted' });
      navigate('/app/videos');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: e?.message });
    }
  };

  const onEditPrompt = () => {
    gen.set({
      firstFrame: video.firstFrame,
      lastFrame: video.lastFrame || '',
      prompt: video.prompt,
      model: video.model,
      aspectRatio: video.aspectRatio,
      resolution: video.resolution,
      duration: video.duration,
      numberOfVideos: video.numberOfVideos,
      motionStrength: video.motionStrength,
      cameraMovement: video.cameraMovement,
    });
    navigate('/app');
  };

  const onCreateVariation = () => {
    gen.set({
      firstFrame: video.firstFrame,
      lastFrame: video.lastFrame || '',
      prompt: video.prompt,
      model: video.model,
      aspectRatio: video.aspectRatio,
      resolution: video.resolution,
      duration: video.duration,
      motionStrength: video.motionStrength,
      cameraMovement: video.cameraMovement,
    });
    navigate('/app');
  };

  const onCopyLink = () => {
    if (video.videoUrl) {
      navigator.clipboard.writeText(absoluteUrl(video.videoUrl)).catch(() => {});
      toast({ variant: 'success', title: 'Link copied' });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="vf-card overflow-hidden">
            {inProgress && (
              <div className="aspect-video w-full bg-muted">
                <div className="relative h-full w-full">
                  {video.firstFrame && (
                    <img
                      src={absoluteUrl(video.firstFrame)}
                      alt=""
                      className="h-full w-full object-cover opacity-70"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 to-transparent text-center text-white">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                    <div className="text-lg font-semibold">Creating your video…</div>
                    <div className="mt-1 text-xs opacity-80">This may take a few minutes.</div>
                    <div className="mt-6 w-72">
                      <Progress value={video.progress} />
                      <div className="mt-1 text-xs opacity-80">{video.progress}%</div>
                    </div>
                    <div className="mt-6 grid grid-cols-4 gap-2 text-[10px] uppercase tracking-widest opacity-80">
                      {['Queued', 'Processing', 'Finalizing', 'Complete'].map((s, i) => {
                        const stage = Math.floor(video.progress / 25);
                        return (
                          <div
                            key={s}
                            className={
                              i <= stage ? 'text-white' : 'text-white/40'
                            }
                          >
                            {s}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {failed && (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-destructive/5 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="text-base font-semibold">Generation failed</div>
                <div className="max-w-md text-sm text-muted-foreground">
                  {video.errorMessage || 'Something went wrong while creating your video.'}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button onClick={onRetry}>
                    <RefreshCw className="h-4 w-4" /> Retry
                  </Button>
                  <Button variant="outline" onClick={onEditPrompt}>
                    <Edit3 className="h-4 w-4" /> Edit prompt
                  </Button>
                </div>
              </div>
            )}

            {cancelled && (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-muted text-center">
                <X className="h-10 w-10 text-muted-foreground" />
                <div className="text-base font-semibold">Generation cancelled</div>
                <div className="text-sm text-muted-foreground">Credits have been refunded.</div>
                <div className="mt-2 flex gap-2">
                  <Button onClick={onRetry}>
                    <RefreshCw className="h-4 w-4" /> Try again
                  </Button>
                </div>
              </div>
            )}

            {completed && video.videoUrl && (
              <VideoPlayer src={absoluteUrl(video.videoUrl)} poster={absoluteUrl(video.thumbnailUrl || video.firstFrame)} />
            )}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="vf-card p-5">
            <div className="mb-3 flex items-center gap-2">
              {completed ? (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
              ) : failed ? (
                <Badge variant="destructive">Failed</Badge>
              ) : cancelled ? (
                <Badge variant="warning">Cancelled</Badge>
              ) : (
                <Badge variant="default">
                  <Loader2 className="h-3 w-3 animate-spin" /> {video.status}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">· {timeAgo(video.createdAt)}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{video.title || 'Untitled video'}</h1>
            <p className="mt-1 line-clamp-4 text-sm text-muted-foreground">{video.prompt}</p>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Model</dt>
                <dd className="mt-0.5 font-medium">{video.model}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Aspect / Resolution</dt>
                <dd className="mt-0.5 font-medium">{video.aspectRatio} · {video.resolution}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="mt-0.5 font-medium">{video.duration}s × {video.numberOfVideos}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Credits used</dt>
                <dd className="mt-0.5 font-medium">{video.creditsUsed}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Motion</dt>
                <dd className="mt-0.5 font-medium capitalize">{video.motionStrength}</dd>
              </div>
              <div className="rounded-lg border bg-muted/30 p-2.5">
                <dt className="text-muted-foreground">Camera</dt>
                <dd className="mt-0.5 font-medium capitalize">{video.cameraMovement.replace('-', ' ')}</dd>
              </div>
            </dl>
          </div>

          <div className="vf-card p-5">
            <div className="text-sm font-semibold">Actions</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="default"
                disabled={!completed}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = absoluteUrl(video.videoUrl);
                  a.download = '';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
              <Button variant="outline" disabled={!completed} onClick={onCopyLink}>
                <Copy className="h-4 w-4" /> Copy link
              </Button>
              <Button variant="outline" onClick={onEditPrompt}>
                <Edit3 className="h-4 w-4" /> Edit prompt
              </Button>
              <Button variant="outline" onClick={onCreateVariation}>
                <Sparkles className="h-4 w-4" /> Variation
              </Button>
              {inProgress ? (
                <Button variant="outline" onClick={onCancel} className="col-span-2">
                  <X className="h-4 w-4" /> Cancel generation
                </Button>
              ) : (
                <>
                  {(failed || cancelled) && (
                    <Button onClick={onRetry} className="col-span-2">
                      <RefreshCw className="h-4 w-4" /> Retry
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                className="col-span-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" /> Delete video
              </Button>
            </div>
          </div>

          {video.firstFrame && (
            <div className="vf-card p-3">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">Input frames</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-lg border bg-muted">
                  <img src={absoluteUrl(video.firstFrame)} alt="First frame" className="h-full w-full object-cover" />
                </div>
                {video.lastFrame && (
                  <div className="overflow-hidden rounded-lg border bg-muted">
                    <img src={absoluteUrl(video.lastFrame)} alt="Last frame" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  return (
    <div className="relative aspect-video w-full bg-black">
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="h-full w-full"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={() => {
          if (ref.current?.paused) ref.current.play();
          else ref.current?.pause();
        }}
        controls={false}
        playsInline
      />
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
        <button
          onClick={() => {
            if (ref.current?.paused) ref.current.play();
            else ref.current?.pause();
          }}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
          aria-label="Play / pause"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
        <button
          onClick={() => {
            if (ref.current) {
              ref.current.muted = !ref.current.muted;
              setMuted(ref.current.muted);
            }
          }}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
          aria-label="Mute"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <div className="ml-auto" />
        <button
          onClick={() => ref.current?.requestFullscreen()}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
          aria-label="Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
