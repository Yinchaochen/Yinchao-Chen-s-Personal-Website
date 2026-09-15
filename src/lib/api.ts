const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8787';
const TOKEN_KEY = 'blog-admin-token';

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  cover_image: string | null;
  published_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ScrapbookImage {
  url: string;
  thumb_url?: string;
  rotate: number;
}

export interface ScrapbookEntry {
  id: string;
  created_at: string;
  updated_at: string;
  caption: string;
  images: ScrapbookImage[];
  deleted_at: string | null;
}

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function hasSession() {
  return getToken() !== null;
}

export function signOut() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function signIn(password: string) {
  const { token } = await request<{ token: string }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  window.localStorage.setItem(TOKEN_KEY, token);
}

export const getArticles = () => request<Article[]>('/api/articles');
export const getArticleBySlug = (slug: string) => request<Article>(`/api/articles/slug/${encodeURIComponent(slug)}`);
export const getArticleById = (id: string) => request<Article>(`/api/articles/${id}`);
export const createArticle = (data: { slug: string; title: string; content: string }) =>
  request<Article>('/api/articles', { method: 'POST', body: JSON.stringify(data) });
export const updateArticle = (id: string, data: { title: string; content: string }) =>
  request<Article>(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const listScrapbook = (offset: number, limit: number) =>
  request<ScrapbookEntry[]>(`/api/scrapbook?offset=${offset}&limit=${limit}`);
export const createScrapbook = (data: { caption: string; images: ScrapbookImage[] }) =>
  request<ScrapbookEntry>('/api/scrapbook', { method: 'POST', body: JSON.stringify(data) });
export const updateScrapbook = (id: string, data: { caption: string; images: ScrapbookImage[] }) =>
  request<ScrapbookEntry>(`/api/scrapbook/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteScrapbook = (id: string) =>
  request<{ ok: boolean }>(`/api/scrapbook/${id}`, { method: 'DELETE' });

export async function uploadImage(file: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append('filename', filename);
  form.append('file', file);
  const { url } = await request<{ url: string }>('/api/upload', { method: 'POST', body: form });
  return url;
}
