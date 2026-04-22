alter table articles add column if not exists deleted_at timestamptz;

create index if not exists articles_published_active_idx
on articles (published_at desc)
where deleted_at is null;

create index if not exists articles_slug_active_idx
on articles (slug)
where deleted_at is null;

alter table articles enable row level security;

drop policy if exists "public read" on articles;
drop policy if exists "auth write" on articles;
drop policy if exists "public read active articles" on articles;
drop policy if exists "authenticated insert active articles" on articles;
drop policy if exists "authenticated update active articles" on articles;

create policy "public read active articles"
on articles
for select
to public
using (deleted_at is null);

create policy "authenticated insert active articles"
on articles
for insert
to authenticated
with check (deleted_at is null);

create policy "authenticated update active articles"
on articles
for update
to authenticated
using (deleted_at is null)
with check (deleted_at is null);

drop policy if exists "public read article images" on storage.objects;
drop policy if exists "authenticated upload article images" on storage.objects;
drop policy if exists "authenticated update article images" on storage.objects;
drop policy if exists "authenticated delete article images" on storage.objects;

create policy "public read article images"
on storage.objects
for select
to public
using (bucket_id = 'article-images');

create policy "authenticated upload article images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'article-images');

-- Soft delete an article manually in SQL Editor:
-- update articles set deleted_at = now() where id = 'ARTICLE_ID';

-- Restore an article manually in SQL Editor:
-- update articles set deleted_at = null where id = 'ARTICLE_ID';
