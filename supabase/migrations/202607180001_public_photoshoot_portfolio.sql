-- Public Photo Shoots portfolio with admin-only publishing.
create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  alt_text text not null default 'Visuals Reimagined photo shoot',
  storage_path text not null unique,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order bigint not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_images enable row level security;
create policy portfolio_public_read on public.portfolio_images for select using (is_published = true);
create policy portfolio_admin_all on public.portfolio_images for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-public', 'portfolio-public', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy portfolio_storage_admin_all on storage.objects for all
using (bucket_id = 'portfolio-public' and public.is_admin())
with check (bucket_id = 'portfolio-public' and public.is_admin());
