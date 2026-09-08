import { apiGet, apiPatch, apiPost, apiDelete, apiUpload } from './api';
import type {
  AspectRatio,
  CameraMovement,
  Duration,
  Model,
  MotionStrength,
  NumberOfVideos,
  Resolution,
} from '../store/generatorStore';

export interface VideoDoc {
  _id: string;
  userId: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  firstFrame: string;
  lastFrame?: string;
  model: Model;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: Duration;
  numberOfVideos: NumberOfVideos;
  motionStrength: MotionStrength;
  cameraMovement: CameraMovement;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  videoUrl: string;
  thumbnailUrl: string;
  errorMessage?: string;
  creditsUsed: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDoc {
  _id: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface TemplateDoc {
  _id: string;
  title: string;
  description: string;
  category: string;
  preview: string;
  prompt: string;
  settings: {
    model: Model;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    duration: Duration;
    motionStrength: MotionStrength;
    cameraMovement: CameraMovement;
  };
  featured: boolean;
}

export interface Plan {
  id: 'free' | 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  credits: number;
  resolution: string;
  features: string[];
  highlighted?: boolean;
}

// ----- Auth -----
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiPost<{ user: any; token: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiPost<{ user: any; token: string }>('/auth/login', data),
  me: () => apiGet<{ user: any }>('/auth/me'),
  forgotPassword: (email: string) => apiPost('/auth/forgot-password', { email }),
};

// ----- Videos -----
export interface GenerateParams {
  prompt: string;
  firstFrame: string;
  lastFrame?: string;
  model?: Model;
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  duration?: Duration;
  numberOfVideos?: NumberOfVideos;
  motionStrength?: MotionStrength;
  cameraMovement?: CameraMovement;
  title?: string;
}

export const videosApi = {
  generate: (params: GenerateParams) =>
    apiPost<{ video: VideoDoc; creditsRemaining: number }>('/videos/generate', params),
  list: (params: { status?: string; sort?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.sort) q.set('sort', params.sort);
    return apiGet<{ videos: VideoDoc[] }>(`/videos?${q.toString()}`);
  },
  get: (id: string) => apiGet<{ video: VideoDoc }>(`/videos/${id}`),
  remove: (id: string) => apiDelete<{ ok: true }>(`/videos/${id}`),
  cancel: (id: string) => apiPost<{ video: VideoDoc; creditsRemaining: number }>(`/videos/${id}/cancel`),
  retry: (id: string) => apiPost<{ video: VideoDoc; creditsRemaining: number }>(`/videos/${id}/retry`),
};

// ----- Assets -----
export const assetsApi = {
  upload: (file: File) => apiUpload<{ asset: AssetDoc }>('/assets/upload', file),
  list: (params: { type?: string; q?: string; folder?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.type && params.type !== 'all') q.set('type', params.type);
    if (params.q) q.set('q', params.q);
    if (params.folder) q.set('folder', params.folder);
    return apiGet<{ assets: AssetDoc[] }>(`/assets?${q.toString()}`);
  },
  toggleFavorite: (id: string) => apiPost<{ asset: AssetDoc }>(`/assets/${id}/favorite`),
  remove: (id: string) => apiDelete<{ ok: true }>(`/assets/${id}`),
};

// ----- Templates -----
export const templatesApi = {
  list: (category?: string) => {
    const q = category && category !== 'all' ? `?category=${category}` : '';
    return apiGet<{ templates: TemplateDoc[] }>(`/templates${q}`);
  },
  get: (id: string) => apiGet<{ template: TemplateDoc }>(`/templates/${id}`),
};

// ----- Credits -----
export const creditsApi = {
  get: () => apiGet<{ credits: number; plan: string }>('/credits'),
  plans: () => apiGet<{ plans: Plan[] }>('/credits/plans'),
  upgrade: (plan: string) => apiPost<{ user: any; plan: Plan }>('/credits/upgrade', { plan }),
};

// ----- Users -----
export const usersApi = {
  updateProfile: (data: { name?: string; avatar?: string }) =>
    apiPatch<{ user: any }>('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost<{ ok: true }>('/users/me/password', data),
  listApiKeys: () =>
    apiGet<{ apiKeys: { key: string; label: string; createdAt: string }[] }>('/users/me/api-keys'),
  createApiKey: (label: string) =>
    apiPost<{ apiKey: { key: string; label: string; createdAt: string } }>(
      '/users/me/api-keys',
      { label }
    ),
  revokeApiKey: (key: string) => apiDelete<{ ok: true }>(`/users/me/api-keys/${key}`),
};
