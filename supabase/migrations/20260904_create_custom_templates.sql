-- Migration: Create custom_templates table in Supabase
-- Run this in your Supabase SQL Editor if you want database sync for custom templates

create table if not exists public.custom_templates (
    id text primary key,
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    image_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.custom_templates enable row level security;

-- Policy: Users can view their own templates, and public templates
create policy "Users can view own templates"
    on public.custom_templates
    for select
    using (auth.uid() = user_id or user_id is null);

-- Policy: Authenticated users can insert their own templates
create policy "Users can insert own templates"
    on public.custom_templates
    for insert
    with check (auth.uid() = user_id or auth.uid() is null);

-- Policy: Users can delete their own templates
create policy "Users can delete own templates"
    on public.custom_templates
    for delete
    using (auth.uid() = user_id);
