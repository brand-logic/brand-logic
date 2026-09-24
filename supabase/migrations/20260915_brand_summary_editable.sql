-- Migration: 20260915_brand_summary_editable.sql
-- Add editable brand summary columns to brand_projects

alter table public.brand_projects
  add column if not exists generated_data jsonb default '{}'::jsonb,
  add column if not exists current_data jsonb default '{}'::jsonb,
  add column if not exists is_generated boolean not null default false,
  add column if not exists slug text,
  add column if not exists is_published boolean not null default true,
  add column if not exists custom_domain text;

-- Backfill existing rows
update public.brand_projects
set
  slug = coalesce(
    slug,
    lower(regexp_replace(regexp_replace(brand_name, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
  ),
  generated_data = case 
    when generated_data is null or generated_data = '{}'::jsonb then coalesce(ai_summary, '{}'::jsonb)
    else generated_data
  end,
  current_data = case 
    when current_data is null or current_data = '{}'::jsonb then coalesce(ai_summary, '{}'::jsonb)
    else current_data
  end,
  is_generated = case
    when ai_summary is not null and ai_summary != '{}'::jsonb then true
    else is_generated
  end
where slug is null or generated_data = '{}'::jsonb;

-- Handle any duplicate slugs per user by appending row numbering
with numbered as (
  select id, user_id, slug,
         row_number() over (partition by user_id, slug order by created_at asc) as rn
  from public.brand_projects
)
update public.brand_projects bp
set slug = numbered.slug || '-' || numbered.rn
from numbered
where bp.id = numbered.id and numbered.rn > 1;

-- Ensure slug is not null
alter table public.brand_projects
  alter column slug set not null;

-- Add unique constraint on (user_id, slug)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'brand_projects_user_id_slug_key'
  ) then
    alter table public.brand_projects add constraint brand_projects_user_id_slug_key unique (user_id, slug);
  end if;
end $$;

-- Update RLS policies on brand_projects
drop policy if exists "Users can view their own projects." on public.brand_projects;
drop policy if exists "Anyone can view published projects." on public.brand_projects;
drop policy if exists "Anyone can view published projects or owners view own" on public.brand_projects;

-- New SELECT policy: Public can view if published; owners can view their own
create policy "Anyone can view published projects or owners view own"
  on public.brand_projects for select
  using ( is_published = true or auth.uid() = user_id );

-- Storage bucket setup for brand assets ('brands')
insert into storage.buckets (id, name, public)
values ('brands', 'brands', true)
on conflict (id) do update set public = true;

-- Storage RLS policies for 'brands' bucket
drop policy if exists "Public Access to Brands Bucket" on storage.objects;
drop policy if exists "Authenticated users can upload to brands bucket" on storage.objects;
drop policy if exists "Users can update their own brand files" on storage.objects;
drop policy if exists "Users can delete their own brand files" on storage.objects;

create policy "Public Access to Brands Bucket"
  on storage.objects for select
  using ( bucket_id = 'brands' );

create policy "Authenticated users can upload to brands bucket"
  on storage.objects for insert
  with check ( bucket_id = 'brands' and auth.role() = 'authenticated' );

create policy "Users can update their own brand files"
  on storage.objects for update
  using ( bucket_id = 'brands' and auth.role() = 'authenticated' );

create policy "Users can delete their own brand files"
  on storage.objects for delete
  using ( bucket_id = 'brands' and auth.role() = 'authenticated' );
