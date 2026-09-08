import { useAuthStore } from '../store/authStore';

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

type FetchOptions = RequestInit & { json?: unknown; raw?: boolean };

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;
  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export async function api<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { json, raw, headers, ...rest } = opts;
  const token = useAuthStore.getState().token;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (rest.body instanceof FormData) {
    body = rest.body;
  } else if (rest.body) {
    body = rest.body as BodyInit;
  }

  const res = await fetch(`${BASE}${path}`, { ...rest, headers: finalHeaders, body });

  if (res.status === 401 && useAuthStore.getState().token) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.replace('/login');
    }
  }

  if (!res.ok) {
    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(data.error || res.statusText || 'Request failed', res.status, data.code, data);
  }

  if (raw) return (res as unknown) as T;
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const apiGet = <T = any>(p: string) => api<T>(p);
export const apiPost = <T = any>(p: string, json?: unknown) => api<T>(p, { method: 'POST', json });
export const apiPatch = <T = any>(p: string, json?: unknown) => api<T>(p, { method: 'PATCH', json });
export const apiDelete = <T = any>(p: string) => api<T>(p, { method: 'DELETE' });
export const apiUpload = <T = any>(p: string, file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return api<T>(p, { method: 'POST', body: fd });
};
