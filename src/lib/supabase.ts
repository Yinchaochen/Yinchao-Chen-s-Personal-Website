import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

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
