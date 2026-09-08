import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type Resolution = '480p' | '720p' | '1080p';
export type Duration = 5 | 10 | 15;
export type NumberOfVideos = 1 | 2 | 4;
export type MotionStrength = 'low' | 'medium' | 'high';
export type CameraMovement =
  | 'static'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'orbit'
  | 'dolly-in'
  | 'dolly-out';
export type Model = 'VisionFlow Motion' | 'VisionFlow Cinematic' | 'VisionFlow Fast';

export interface GeneratorState {
  firstFrame: string;
  lastFrame: string;
  prompt: string;
  model: Model;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: Duration;
  numberOfVideos: NumberOfVideos;
  motionStrength: MotionStrength;
  cameraMovement: CameraMovement;
  set: (patch: Partial<GeneratorState>) => void;
  reset: () => void;
}

const initial: Omit<GeneratorState, 'set' | 'reset'> = {
  firstFrame: '',
  lastFrame: '',
  prompt: '',
  model: 'VisionFlow Motion',
  aspectRatio: '16:9',
  resolution: '720p',
  duration: 5,
  numberOfVideos: 1,
  motionStrength: 'medium',
  cameraMovement: 'static',
};

export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set) => ({
      ...initial,
      set: (patch) => set(patch),
      reset: () => set(initial),
    }),
    { name: 'visionflow-generator' }
  )
);
