import type { Duration, Model, NumberOfVideos, Resolution } from '../store/generatorStore';

export function estimateCredits(opts: {
  resolution?: Resolution;
  duration?: Duration;
  model?: Model;
  numberOfVideos?: NumberOfVideos;
}) {
  const resolution = opts.resolution || '720p';
  const duration = opts.duration || 5;
  const model = opts.model || 'VisionFlow Motion';
  const numberOfVideos = opts.numberOfVideos || 1;
  let base = 40;
  if (resolution === '480p') base = 30;
  else if (resolution === '720p') base = 60;
  else if (resolution === '1080p') base = 120;
  const durationFactor = duration / 5;
  let modelFactor = 1;
  if (model === 'VisionFlow Cinematic') modelFactor = 1.5;
  else if (model === 'VisionFlow Fast') modelFactor = 0.6;
  return Math.ceil(base * durationFactor * modelFactor * numberOfVideos);
}
