
-- Create a table for public profiles provided by Supabase Auth
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security!
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for Brand Projects
create table if not exists brand_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Basic Info
  brand_name text not null,
  brand_type text, -- 'Product/Consumer' or 'Personal/Creator'
  industry text,
  description text,
  target_audience text,
  
  -- Brand Identity
  mission_statement text,
  vision_statement text,
  brand_presence text,
  core_values text[], -- Array of strings
  brand_tone jsonb, -- { conversational_authoritative: 50, calm_energetic: 50, traditional_innovative: 50 }
  
  -- Visuals
  moodboard_images text[], -- Array of URLs
  brand_colors jsonb, -- Array of objects { hex: '#...', name: '...', role: '...' }
  typography_pairing jsonb, -- { primary: '...', secondary: '...' }
  
  -- AI Outputs & Live Editable State
  ai_summary jsonb, -- The initial generated brand summary structure
  generated_data jsonb not null default '{}'::jsonb, -- Immutable initial AI generation
  current_data jsonb not null default '{}'::jsonb, -- Active editable data rendered on the page
  is_generated boolean not null default false, -- Once true, generation is permanently locked
  slug text not null, -- URL slug, unique per user
  is_published boolean not null default true, -- Controls public page availability
  custom_domain text, -- Nullable placeholder for future custom domain support
  
  status text default 'draft' -- 'draft', 'generating', 'completed'
);

-- Per-user unique slug constraint
alter table brand_projects add constraint brand_projects_user_id_slug_key unique (user_id, slug);

-- Set up RLS for brand_projects
alter table brand_projects enable row level security;

create policy "Anyone can view published projects or owners view own"
  on brand_projects for select
  using ( is_published = true or auth.uid() = user_id );

create policy "Users can insert their own projects."
  on brand_projects for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own projects."
  on brand_projects for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own projects."
  on brand_projects for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger checks
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
