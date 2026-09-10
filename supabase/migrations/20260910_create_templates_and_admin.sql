-- Migration: Create templates and admin_users tables
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create templates table
create table if not exists public.templates (
    id serial primary key,
    slug text unique not null,
    name text not null,
    image_url text not null,
    boxes jsonb not null default '[]'::jsonb,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create admin_users table to verify admin permissions
create table if not exists public.admin_users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.templates enable row level security;
alter table public.admin_users enable row level security;

-- 4. RLS Policies for templates:
-- Everyone (public) can view active templates
drop policy if exists "Public can view active templates" on public.templates;
create policy "Public can view active templates"
    on public.templates for select
    using (is_active = true or auth.uid() in (select id from public.admin_users));

-- Only authenticated admins can insert/update/delete templates
drop policy if exists "Admins can insert templates" on public.templates;
create policy "Admins can insert templates"
    on public.templates for insert
    with check (auth.uid() in (select id from public.admin_users));

drop policy if exists "Admins can update templates" on public.templates;
create policy "Admins can update templates"
    on public.templates for update
    using (auth.uid() in (select id from public.admin_users));

drop policy if exists "Admins can delete templates" on public.templates;
create policy "Admins can delete templates"
    on public.templates for delete
    using (auth.uid() in (select id from public.admin_users));

-- 5. RLS Policies for admin_users:
drop policy if exists "Admins can view admin list" on public.admin_users;
create policy "Admins can view admin list"
    on public.admin_users for select
    using (auth.uid() = id);

-- 6. Storage bucket for template images
insert into storage.buckets (id, name, public)
values ('template-images', 'template-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view template images" on storage.objects;
create policy "Public can view template images"
    on storage.objects for select
    using (bucket_id = 'template-images');

drop policy if exists "Admins can upload template images" on storage.objects;
create policy "Admins can upload template images"
    on storage.objects for insert
    with check (bucket_id = 'template-images' and auth.uid() in (select id from public.admin_users));
