-- Visuals Reimagined private proofing portal.
-- Run this in a new Supabase project before inviting clients.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'client');
create type public.gallery_workflow as enum ('preview_available', 'awaiting_selection', 'editing', 'awaiting_payment', 'ready', 'archived');
create type public.payment_state as enum ('not_requested', 'awaiting_payment', 'paid', 'refunded');
create type public.review_state as enum ('unreviewed', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.profile_role not null default 'client',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  description text,
  session_info text,
  cover_image_path text,
  workflow_status public.gallery_workflow not null default 'preview_available',
  payment_status public.payment_state not null default 'not_requested',
  amount_due numeric(12,2) check (amount_due is null or amount_due >= 0),
  amount_paid numeric(12,2) check (amount_paid is null or amount_paid >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  payment_reference text,
  payment_url text check (payment_url is null or payment_url ~ '^https://'),
  payment_confirmed_at timestamptz,
  payment_notes text,
  downloads_enabled boolean not null default false,
  comments_enabled boolean not null default true,
  selections_enabled boolean not null default true,
  selections_locked boolean not null default false,
  selection_deadline timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_members (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(gallery_id, user_id)
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  preview_path text not null,
  final_path text,
  filename text not null,
  original_filename text not null,
  title text,
  description text,
  alt_text text not null default 'Private gallery photograph',
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  sort_order integer not null default 0,
  is_downloadable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gallery_images_gallery_sort_idx on public.gallery_images(gallery_id, sort_order);

create table public.image_selections (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  image_id uuid not null references public.gallery_images(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.review_state not null default 'unreviewed',
  is_favourite boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(image_id, user_id)
);

create table public.image_comments (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  image_id uuid not null references public.gallery_images(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text not null check (char_length(btrim(comment)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_activity (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  image_id uuid references public.gallery_images(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint no_secret_metadata check (not (metadata ?| array['token','access_token','refresh_token','otp','password','service_role_key']))
);
create index gallery_activity_gallery_created_idx on public.gallery_activity(gallery_id, created_at desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger galleries_touch before update on public.galleries for each row execute function public.touch_updated_at();
create trigger gallery_images_touch before update on public.gallery_images for each row execute function public.touch_updated_at();
create trigger comments_touch before update on public.image_comments for each row execute function public.touch_updated_at();

-- Security-definer helpers avoid recursive policies and expose only boolean answers.
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin' and is_active)
$$;
create or replace function public.is_gallery_member(target_gallery uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from gallery_members gm join profiles p on p.id = gm.user_id
    where gm.gallery_id = target_gallery and gm.user_id = auth.uid() and p.is_active
  )
$$;

alter table public.profiles enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_members enable row level security;
alter table public.gallery_images enable row level security;
alter table public.image_selections enable row level security;
alter table public.image_comments enable row level security;
alter table public.gallery_activity enable row level security;

-- Profiles: clients see only themselves; admins manage all profiles.
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Galleries: membership is required for clients; only admins change gallery/payment settings.
create policy galleries_member_read on public.galleries for select using (public.is_gallery_member(id) or public.is_admin());
create policy galleries_admin_all on public.galleries for all using (public.is_admin()) with check (public.is_admin());

-- Membership assignments are visible to the assigned user; only admins mutate assignments.
create policy members_self_read on public.gallery_members for select using (user_id = auth.uid() or public.is_admin());
create policy members_admin_all on public.gallery_members for all using (public.is_admin()) with check (public.is_admin());

-- Images can be read only through an assigned gallery; clients cannot edit paths or upload records.
create policy images_member_read on public.gallery_images for select using (public.is_gallery_member(gallery_id) or public.is_admin());
create policy images_admin_all on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

-- Clients manage only their own selections while the gallery permits changes and is not expired.
create policy selections_member_read on public.image_selections for select using (public.is_gallery_member(gallery_id) and user_id = auth.uid() or public.is_admin());
create policy selections_own_insert on public.image_selections for insert with check (
  user_id = auth.uid() and public.is_gallery_member(gallery_id) and exists(
    select 1 from public.galleries g where g.id = gallery_id and g.selections_enabled and not g.selections_locked and (g.expires_at is null or g.expires_at > now())
  )
);
create policy selections_own_update on public.image_selections for update using (user_id = auth.uid()) with check (
  user_id = auth.uid() and public.is_gallery_member(gallery_id) and exists(
    select 1 from public.galleries g where g.id = gallery_id and g.selections_enabled and not g.selections_locked and (g.expires_at is null or g.expires_at > now())
  )
);
create policy selections_admin_all on public.image_selections for all using (public.is_admin()) with check (public.is_admin());

-- Comments are readable in assigned galleries; clients create/edit/delete only their own comments.
create policy comments_member_read on public.image_comments for select using (public.is_gallery_member(gallery_id) or public.is_admin());
create policy comments_own_insert on public.image_comments for insert with check (
  user_id = auth.uid() and public.is_gallery_member(gallery_id) and exists(
    select 1 from public.galleries g where g.id = gallery_id and g.comments_enabled and (g.expires_at is null or g.expires_at > now())
  )
);
create policy comments_own_update on public.image_comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy comments_own_delete on public.image_comments for delete using (user_id = auth.uid());
create policy comments_admin_all on public.image_comments for all using (public.is_admin()) with check (public.is_admin());

-- Activity is client-readable for assigned galleries; writes use trusted server actions or admins.
create policy activity_member_read on public.gallery_activity for select using (public.is_gallery_member(gallery_id) or public.is_admin());
create policy activity_admin_all on public.gallery_activity for all using (public.is_admin()) with check (public.is_admin());

-- Both buckets are private. Preview paths begin with gallery UUID. Finals have no client storage policy;
-- final delivery always passes through a server route that re-checks membership, payment and expiry.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery-previews', 'gallery-previews', false, 15728640, array['image/jpeg','image/png','image/webp']),
  ('gallery-finals', 'gallery-finals', false, 52428800, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;

create policy preview_member_read on storage.objects for select using (
  bucket_id = 'gallery-previews' and public.is_gallery_member(((storage.foldername(name))[1])::uuid)
);
create policy storage_admin_all on storage.objects for all using (
  bucket_id in ('gallery-previews','gallery-finals') and public.is_admin()
) with check (bucket_id in ('gallery-previews','gallery-finals') and public.is_admin());

-- Service-role requests bypass RLS but must still perform explicit checks in application code.
comment on function public.is_admin is 'Returns role state without exposing profile data or causing recursive RLS.';
comment on policy preview_member_read on storage.objects is 'Allows only assigned clients to request short-lived preview signatures; bucket remains private.';
