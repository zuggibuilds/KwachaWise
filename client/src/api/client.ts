import { ApiError, type ApiErrorShape } from '../lib/types';

function getDefaultApiBase(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:4000/api';
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = window.location.hostname;
  return `${protocol}//${host}:4000/api`;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? getDefaultApiBase();
const TOKEN_KEY = 'kwachawise_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let payload: ApiErrorShape | null = null;
    try {
      payload = (await response.json()) as ApiErrorShape;
    } catch {
      payload = null;
    }

    throw new ApiError(payload?.error?.message ?? 'Request failed', payload?.error?.code ?? 'REQUEST_FAILED', payload?.error?.details);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  return handleResponse<T>(response);
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function apiDelete(path: string): Promise<void> {
  await apiRequest<void>(path, { method: 'DELETE' });
}
