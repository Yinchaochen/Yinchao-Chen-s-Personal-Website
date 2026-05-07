/*
 * One-shot migration: for every existing scrapbook image, generate a
 * compressed thumbnail in storage and write its URL back to the row's
 * images JSON as `thumb_url`. Idempotent — images already carrying a
 * thumb_url are skipped.
 *
 * Run from project root with:
 *   node --env-file=.env.local scripts/compress-existing-images.mjs
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'article-images';
const THUMB_MAX_WIDTH = 800;
const THUMB_QUALITY = 78;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/* Storage path is everything after `/<bucket>/` in the public URL. */
function pathFromPublicUrl(url) {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) throw new Error(`URL not in bucket ${BUCKET}: ${url}`);
  return url.slice(idx + marker.length).split('?')[0];
}

function thumbPathFor(originalPath) {
  const dot = originalPath.lastIndexOf('.');
  const base = dot === -1 ? originalPath : originalPath.slice(0, dot);
  return `${base}.thumb.jpg`;
}

async function compressOne(image) {
  if (image.thumb_url) return image; // already done

  const origPath = pathFromPublicUrl(image.url);
  const thumbPath = thumbPathFor(origPath);

  const res = await fetch(image.url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${image.url}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const compressed = await sharp(buf)
    .rotate() // honor EXIF orientation
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
    .toBuffer();

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(thumbPath, compressed, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(thumbPath);

  console.log(
    `  ✓ ${origPath} → ${thumbPath} (${(buf.length / 1024).toFixed(0)}KB → ${(compressed.length / 1024).toFixed(0)}KB)`,
  );

  return { ...image, thumb_url: publicUrl };
}

async function main() {
  const { data: entries, error } = await supabase
    .from('scrapbook_entries')
    .select('id, images')
    .is('deleted_at', null);
  if (error) throw error;

  console.log(`Found ${entries.length} entries.\n`);

  for (const entry of entries) {
    const needsWork = entry.images.some(img => !img.thumb_url);
    if (!needsWork) {
      console.log(`Entry ${entry.id}: already migrated, skipping.`);
      continue;
    }
    console.log(`Entry ${entry.id}: ${entry.images.length} image(s)`);

    const updated = [];
    for (const img of entry.images) {
      updated.push(await compressOne(img));
    }

    const { error: updErr } = await supabase
      .from('scrapbook_entries')
      .update({ images: updated })
      .eq('id', entry.id);
    if (updErr) throw updErr;
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('\nFAILED:', err);
  process.exit(1);
});
