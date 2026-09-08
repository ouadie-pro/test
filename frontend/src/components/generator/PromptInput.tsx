import { useState } from 'react';
import { Sparkles, X, Wand2, BookOpen, RefreshCw } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const ENHANCEMENTS = [
  'cinematic lighting, soft bokeh, slow motion, shallow depth of field',
  'handheld camera feel, film grain, warm tones, 4K, photorealistic',
  'epic orchestral mood, volumetric light, golden hour, anamorphic lens',
  'studio lighting, clean backdrop, premium commercial look, sharp focus',
];

const SUGGESTIONS = [
  'The camera slowly pushes in while the subject turns and smiles, golden hour light, cinematic.',
  'Drone shot pulling back from a tropical coastline, turquoise water, warm sunset, smooth motion.',
  'Slow dolly forward through a misty forest, sun rays cutting through the fog, leaves drifting.',
  'Smooth 360° orbit around a hero product on a clean pedestal, soft studio reflections.',
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}

export function PromptInput({ value, onChange, maxLength = 1000 }: Props) {
  const [busy, setBusy] = useState(false);

  const enhance = async () => {
    setBusy(true);
    // Simulated enhancement delay; in a real app this would call an
    // /api/ai/enhance endpoint.
    await new Promise((r) => setTimeout(r, 700));
    const addition = ENHANCEMENTS[Math.floor(Math.random() * ENHANCEMENTS.length)];
    onChange(value.trim() ? `${value.trim()}, ${addition}` : addition);
    setBusy(false);
  };

  return (
    <div className="vf-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Describe how you want your image to move</div>
          <div className="text-xs text-muted-foreground">
            Be specific about motion, camera, and lighting for the best results.
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Prompt manual
        </button>
      </div>

      <div className="mt-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Example: The camera slowly moves forward while the character gently turns toward the camera, cinematic lighting, realistic motion."
          rows={4}
          className="min-h-[110px] resize-none"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {value.length} / {maxLength} characters
          </span>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="soft" onClick={enhance} disabled={busy}>
          {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Enhance prompt
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Try:</span>
          {SUGGESTIONS.slice(0, 2).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onChange(s)}
              className={cn(
                'rounded-full border bg-muted/30 px-2.5 py-0.5 transition-colors hover:bg-muted'
              )}
            >
              {s.length > 32 ? s.slice(0, 32) + '…' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
