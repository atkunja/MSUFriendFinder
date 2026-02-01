-- ==============================================
-- MSU Friend Finder - Feature Expansion Migration
-- Run this in your Supabase SQL Editor
-- ==============================================

-- =====================
-- 1. PROFILE ENHANCEMENTS
-- =====================

-- Add new profile fields
alter table public.profiles add column if not exists dorm text;
alter table public.profiles add column if not exists dorm_room text;
alter table public.profiles add column if not exists latitude double precision;
alter table public.profiles add column if not exists longitude double precision;
alter table public.profiles add column if not exists location_updated_at timestamptz;
alter table public.profiles add column if not exists location_sharing boolean default false;

-- =====================
-- 2. CLASSES SYSTEM
-- =====================

-- Classes table (course catalog)
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique,  -- e.g., "CSE 231"
  course_name text not null,          -- e.g., "Intro to Programming"
  department text,
  created_at timestamptz default now()
);

-- User classes (enrollment)
create table if not exists public.user_classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  semester text not null,  -- e.g., "Spring 2026"
  section text,            -- e.g., "001"
  created_at timestamptz default now(),
  unique(user_id, class_id, semester)
);

create index if not exists idx_user_classes_user on public.user_classes(user_id);
create index if not exists idx_user_classes_class on public.user_classes(class_id);

-- RLS for classes
alter table public.classes enable row level security;
alter table public.user_classes enable row level security;

drop policy if exists "Anyone can view classes" on public.classes;
create policy "Anyone can view classes" on public.classes for select using (true);

drop policy if exists "Authenticated can insert classes" on public.classes;
create policy "Authenticated can insert classes" on public.classes for insert to authenticated with check (true);

drop policy if exists "Users can view all enrollments" on public.user_classes;
create policy "Users can view all enrollments" on public.user_classes for select using (true);

drop policy if exists "Users manage own enrollments" on public.user_classes;
create policy "Users manage own enrollments" on public.user_classes
  for all using (auth.uid() = user_id);

-- =====================
-- 3. EVENTS SYSTEM
-- =====================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  latitude double precision,
  longitude double precision,
  start_time timestamptz not null,
  end_time timestamptz,
  event_type text not null check (event_type in ('campus', 'social', 'academic', 'sports', 'club')),
  is_public boolean default true,
  max_attendees int,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Event attendees
create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested', 'maybe')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

create index if not exists idx_events_start on public.events(start_time);
create index if not exists idx_events_creator on public.events(creator_id);
create index if not exists idx_event_attendees_event on public.event_attendees(event_id);

-- RLS for events
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;

drop policy if exists "Anyone can view public events" on public.events;
create policy "Anyone can view public events" on public.events
  for select using (is_public = true or creator_id = auth.uid());

drop policy if exists "Users can create events" on public.events;
create policy "Users can create events" on public.events
  for insert to authenticated with check (auth.uid() = creator_id);

drop policy if exists "Creators can update own events" on public.events;
create policy "Creators can update own events" on public.events
  for update using (auth.uid() = creator_id);

drop policy if exists "Creators can delete own events" on public.events;
create policy "Creators can delete own events" on public.events
  for delete using (auth.uid() = creator_id);

drop policy if exists "Anyone can view attendees" on public.event_attendees;
create policy "Anyone can view attendees" on public.event_attendees for select using (true);

drop policy if exists "Users manage own attendance" on public.event_attendees;
create policy "Users manage own attendance" on public.event_attendees
  for all using (auth.uid() = user_id);

-- =====================
-- 4. SPONTANEOUS POSTS ("I'm at X")
-- =====================

create table if not exists public.spontaneous_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  location_name text,
  latitude double precision,
  longitude double precision,
  expires_at timestamptz not null,  -- Posts expire (e.g., after 4 hours)
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_spontaneous_active on public.spontaneous_posts(is_active, expires_at);
create index if not exists idx_spontaneous_user on public.spontaneous_posts(user_id);

-- RLS for spontaneous posts
alter table public.spontaneous_posts enable row level security;

drop policy if exists "Friends can see posts" on public.spontaneous_posts;
create policy "Friends can see posts" on public.spontaneous_posts
  for select using (
    is_active = true
    and expires_at > now()
    and (
      user_id = auth.uid()
      or exists (
        select 1 from friendships
        where (user_a = auth.uid() and user_b = user_id)
           or (user_b = auth.uid() and user_a = user_id)
      )
    )
  );

drop policy if exists "Users create own posts" on public.spontaneous_posts;
create policy "Users create own posts" on public.spontaneous_posts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users manage own posts" on public.spontaneous_posts;
create policy "Users manage own posts" on public.spontaneous_posts
  for update using (auth.uid() = user_id);

drop policy if exists "Users delete own posts" on public.spontaneous_posts;
create policy "Users delete own posts" on public.spontaneous_posts
  for delete using (auth.uid() = user_id);

-- =====================
-- 5. GROUP CHATS
-- =====================

-- Add group chat support to conversations
alter table public.conversations add column if not exists is_group boolean default false;
alter table public.conversations add column if not exists group_name text;
alter table public.conversations add column if not exists group_avatar_url text;
alter table public.conversations add column if not exists created_by uuid references public.profiles(id);

-- Group members table (for groups with more than 2 people)
create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  unique(conversation_id, user_id)
);

create index if not exists idx_conv_members_conv on public.conversation_members(conversation_id);
create index if not exists idx_conv_members_user on public.conversation_members(user_id);

-- RLS for conversation members
alter table public.conversation_members enable row level security;

drop policy if exists "Members can view their groups" on public.conversation_members;
create policy "Members can view their groups" on public.conversation_members
  for select using (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
      and cm.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can add members" on public.conversation_members;
create policy "Admins can add members" on public.conversation_members
  for insert to authenticated with check (
    exists (
      select 1 from conversation_members cm
      where cm.conversation_id = conversation_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
    )
    or not exists (select 1 from conversation_members where conversation_id = conversation_members.conversation_id)
  );

-- Update conversations policy for groups
drop policy if exists "Users see own conversations" on public.conversations;
create policy "Users see own conversations" on public.conversations
  for select using (
    auth.uid() in (participant_a, participant_b)
    or exists (
      select 1 from conversation_members
      where conversation_id = id and user_id = auth.uid()
    )
  );

-- Function to create group chat
create or replace function create_group_chat(
  p_name text,
  p_member_ids uuid[]
)
returns uuid language plpgsql security definer as $$
declare
  v_conv_id uuid;
begin
  -- Create conversation
  insert into conversations (is_group, group_name, created_by, participant_a, participant_b)
  values (true, p_name, auth.uid(), auth.uid(), auth.uid())
  returning id into v_conv_id;

  -- Add creator as admin
  insert into conversation_members (conversation_id, user_id, role)
  values (v_conv_id, auth.uid(), 'admin');

  -- Add other members
  insert into conversation_members (conversation_id, user_id, role)
  select v_conv_id, unnest(p_member_ids), 'member'
  where unnest(p_member_ids) != auth.uid();

  return v_conv_id;
end; $$;

grant execute on function create_group_chat(text, uuid[]) to authenticated;

-- =====================
-- 6. REVIEWS SYSTEM
-- =====================

-- Locations (buildings, food places, etc.)
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_type text not null check (location_type in ('building', 'dining', 'library', 'gym', 'dorm', 'other')),
  address text,
  latitude double precision,
  longitude double precision,
  image_url text,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, location_id)
);

create index if not exists idx_reviews_location on public.reviews(location_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- RLS for reviews
alter table public.locations enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Anyone can view locations" on public.locations;
create policy "Anyone can view locations" on public.locations for select using (true);

drop policy if exists "Authenticated can add locations" on public.locations;
create policy "Authenticated can add locations" on public.locations
  for insert to authenticated with check (true);

drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews" on public.reviews for select using (true);

drop policy if exists "Users manage own reviews" on public.reviews;
create policy "Users manage own reviews" on public.reviews
  for all using (auth.uid() = user_id);

-- =====================
-- 7. CLASS GROUP CHATS
-- =====================

-- Link classes to group conversations
alter table public.conversations add column if not exists class_id uuid references public.classes(id);

-- Function to get or create class group chat
create or replace function get_or_create_class_chat(p_class_id uuid, p_semester text)
returns uuid language plpgsql security definer as $$
declare
  v_conv_id uuid;
  v_class_name text;
begin
  -- Check if user is enrolled in this class
  if not exists (
    select 1 from user_classes
    where user_id = auth.uid()
    and class_id = p_class_id
    and semester = p_semester
  ) then
    raise exception 'Not enrolled in this class';
  end if;

  -- Find existing class chat
  select id into v_conv_id from conversations
  where class_id = p_class_id and is_group = true;

  -- Create if not exists
  if v_conv_id is null then
    select course_code || ' - ' || course_name into v_class_name
    from classes where id = p_class_id;

    insert into conversations (is_group, group_name, class_id, created_by, participant_a, participant_b)
    values (true, v_class_name || ' (' || p_semester || ')', p_class_id, auth.uid(), auth.uid(), auth.uid())
    returning id into v_conv_id;
  end if;

  -- Add user as member if not already
  insert into conversation_members (conversation_id, user_id, role)
  values (v_conv_id, auth.uid(), 'member')
  on conflict (conversation_id, user_id) do nothing;

  return v_conv_id;
end; $$;

grant execute on function get_or_create_class_chat(uuid, text) to authenticated;

-- =====================
-- 8. ENABLE REALTIME
-- =====================

alter publication supabase_realtime add table spontaneous_posts;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table conversation_members;

-- =====================
-- 9. SEED SOME MSU LOCATIONS
-- =====================

insert into public.locations (name, location_type, address) values
  ('Spartan Stadium', 'other', '325 W Shaw Ln, East Lansing, MI'),
  ('The Union', 'building', '49 Abbot Rd, East Lansing, MI'),
  ('Main Library', 'library', '366 W Circle Dr, East Lansing, MI'),
  ('Brody Hall', 'dining', '241 W Brody Rd, East Lansing, MI'),
  ('The Vista at Shaw', 'dining', '135 E Shaw Ln, East Lansing, MI'),
  ('IM West', 'gym', '939 Birch Rd, East Lansing, MI'),
  ('IM East', 'gym', '308 W Circle Dr, East Lansing, MI'),
  ('Engineering Building', 'building', '428 S Shaw Ln, East Lansing, MI'),
  ('Natural Science Building', 'building', '288 Farm Ln, East Lansing, MI'),
  ('Wells Hall', 'building', '619 Red Cedar Rd, East Lansing, MI'),
  ('Akers Hall', 'dorm', '932 Birch Rd, East Lansing, MI'),
  ('Holmes Hall', 'dorm', '531 Birch Rd, East Lansing, MI'),
  ('McDonel Hall', 'dorm', '817 E Shaw Ln, East Lansing, MI'),
  ('Rather Hall', 'dorm', '754 E Shaw Ln, East Lansing, MI'),
  ('Hubbard Hall', 'dorm', '552 Birch Rd, East Lansing, MI')
on conflict do nothing;
