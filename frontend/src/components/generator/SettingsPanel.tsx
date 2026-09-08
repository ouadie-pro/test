import {
  Camera,
  Gauge,
  Layers,
  Maximize2,
  MonitorPlay,
  Ratio,
  Timer,
  Wand2,
} from 'lucide-react';
import { Segmented } from '../ui/segmented';
import { Label } from '../ui/label';
import type {
  AspectRatio,
  CameraMovement,
  Duration,
  Model,
  MotionStrength,
  NumberOfVideos,
  Resolution,
} from '../../store/generatorStore';
import { cn } from '../../lib/utils';

interface Props {
  model: Model;
  setModel: (v: Model) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (v: Resolution) => void;
  duration: Duration;
  setDuration: (v: Duration) => void;
  numberOfVideos: NumberOfVideos;
  setNumberOfVideos: (v: NumberOfVideos) => void;
  motionStrength: MotionStrength;
  setMotionStrength: (v: MotionStrength) => void;
  cameraMovement: CameraMovement;
  setCameraMovement: (v: CameraMovement) => void;
}

const MODELS: { value: Model; label: string; description: string }[] = [
  { value: 'VisionFlow Motion', label: 'Motion', description: 'Balanced motion and quality.' },
  { value: 'VisionFlow Cinematic', label: 'Cinematic', description: 'Premium, high-fidelity results.' },
  { value: 'VisionFlow Fast', label: 'Fast', description: 'Lower latency, draft quality.' },
];

const ASPECTS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3'];
const RESOLUTIONS: Resolution[] = ['480p', '720p', '1080p'];
const DURATIONS: Duration[] = [5, 10, 15];
const NUMS: NumberOfVideos[] = [1, 2, 4];

const CAMERAS: { value: CameraMovement; label: string; icon: React.ReactNode }[] = [
  { value: 'static', label: 'Static', icon: <Maximize2 className="h-3.5 w-3.5" /> },
  { value: 'zoom-in', label: 'Zoom In', icon: <Maximize2 className="h-3.5 w-3.5" /> },
  { value: 'zoom-out', label: 'Zoom Out', icon: <Maximize2 className="h-3.5 w-3.5" /> },
  { value: 'pan-left', label: 'Pan L', icon: <Camera className="h-3.5 w-3.5" /> },
  { value: 'pan-right', label: 'Pan R', icon: <Camera className="h-3.5 w-3.5" /> },
  { value: 'orbit', label: 'Orbit', icon: <Camera className="h-3.5 w-3.5" /> },
  { value: 'dolly-in', label: 'Dolly In', icon: <Camera className="h-3.5 w-3.5" /> },
  { value: 'dolly-out', label: 'Dolly Out', icon: <Camera className="h-3.5 w-3.5" /> },
];

const MOTIONS: { value: MotionStrength; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function SettingsPanel(props: Props) {
  return (
    <div className="vf-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Wand2 className="h-4 w-4 text-primary" />
        <div className="text-sm font-semibold">Video settings</div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Model
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {MODELS.map((m) => {
              const active = props.model === m.value;
              return (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => props.setModel(m.value)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                >
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                    {m.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Ratio className="h-3.5 w-3.5" /> Aspect ratio
          </Label>
          <Segmented
            value={props.aspectRatio}
            onChange={props.setAspectRatio}
            options={ASPECTS.map((a) => ({ value: a, label: a }))}
            className="w-full [&>div]:w-full"
          />
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <MonitorPlay className="h-3.5 w-3.5" /> Resolution
          </Label>
          <Segmented
            value={props.resolution}
            onChange={props.setResolution}
            options={RESOLUTIONS.map((r) => ({ value: r, label: r }))}
            className="w-full [&>div]:w-full"
          />
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5" /> Duration
          </Label>
          <Segmented
            value={props.duration}
            onChange={props.setDuration}
            options={DURATIONS.map((d) => ({ value: d, label: `${d}s` }))}
            className="w-full [&>div]:w-full"
          />
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Number of videos
          </Label>
          <Segmented
            value={props.numberOfVideos}
            onChange={props.setNumberOfVideos}
            options={NUMS.map((n) => ({ value: n, label: String(n) }))}
            className="w-full [&>div]:w-full"
          />
        </div>

        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" /> Motion strength
          </Label>
          <Segmented
            value={props.motionStrength}
            onChange={props.setMotionStrength}
            options={MOTIONS.map((m) => ({ value: m.value, label: m.label }))}
            className="w-full [&>div]:w-full"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" /> Camera movement
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8">
            {CAMERAS.map((c) => {
              const active = props.cameraMovement === c.value;
              return (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => props.setCameraMovement(c.value)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  {c.icon}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
