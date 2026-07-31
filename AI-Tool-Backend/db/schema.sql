-- ScaleOn backend — schema for tables referenced in code.
--
-- Every table/column here was inferred directly from actual repository,
-- service, and worker code (grep for `.table(...)`, PostgREST embed
-- syntax, and Pydantic schema field lists) — nothing invented.
--
-- Run this in the Supabase SQL editor. Safe to run once; re-running will
-- error on the CREATE TABLE statements (by design — no IF NOT EXISTS, so
-- you don't accidentally think a schema change applied when it silently
-- no-op'd against an already-existing table with different columns).
--
-- IMPORTANT — two tables here were NOT in Memory.md/Architecture.md's
-- "5 missing tables" list, found only by reading the actual repository
-- code:
--   1. `users` (app/repositories/user.py — BaseRepository("users", UserResponse))
--   2. `roles`, `permissions`, `role_permissions` (app/repositories/rbac.py —
--      the nested PostgREST embed query "roles(role_permissions(permissions(code)))"
--      requires all three to exist, not just user_roles)

-- =====================================================================
-- users
-- Source: app/repositories/user.py (UserRepository extends
-- BaseRepository(client, "users", UserResponse))
-- Columns: app/schemas/user.py::UserResponse
-- =====================================================================
create table users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);
-- FK to auth.users(id): Supabase Auth already manages the canonical user
-- record; this assumes `users` is a public-schema profile mirror keyed to
-- it (standard Supabase pattern). Flagging this assumption explicitly —
-- confirm it matches your intent before running.

-- =====================================================================
-- user_settings
-- Source: app/repositories/user.py::get_settings / update_settings
-- Columns: app/schemas/user.py::UserSettingsResponse
-- =====================================================================
create table user_settings (
    user_id uuid primary key references users(id) on delete cascade,
    timezone text not null default 'UTC',
    language text not null default 'en',
    notification_preferences jsonb not null default '{}'::jsonb
);

-- =====================================================================
-- brand_voices
-- Source: app/repositories/ai.py (table_name = "brand_voices")
-- Columns: app/schemas/ai.py::BrandVoiceBase/BrandVoiceResponse
-- =====================================================================
create table brand_voices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
    description text not null,
    sample_text text,
    created_at timestamptz not null default now()
);

-- =====================================================================
-- scheduled_posts
-- Source: app/repositories/scheduler.py (table_name = "scheduled_posts"),
-- app/workers/scheduler.py::publish_post_task
-- Columns: create_scheduled_post()/update_status() field usage, plus the
-- Instagram-specific fields read via post_data.get(...) in
-- workers/scheduler.py (access_token, page_access_token, ig_user_id,
-- media_url, media_type) — nullable since they only apply to Instagram
-- posts.
-- =====================================================================
create table scheduled_posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    platform text not null,
    draft text not null,
    scheduled_time timestamptz not null,
    status text not null default 'scheduled',
    attempts int not null default 0,
    last_error text,
    -- Instagram-specific, read in app/workers/scheduler.py's Instagram branch
    access_token text,
    page_access_token text,
    ig_user_id text,
    media_url text,
    media_type text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_scheduled_posts_user_id on scheduled_posts(user_id);
create index idx_scheduled_posts_scheduled_time on scheduled_posts(scheduled_time);

-- =====================================================================
-- audit_logs
-- Source: app/repositories/audit.py::AuditLogCreate / write_log()
-- =====================================================================
create table audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete set null,
    action text not null,
    ip_address text,
    user_agent text,
    payload jsonb,
    created_at timestamptz not null default now()
);

-- =====================================================================
-- roles / permissions / role_permissions / user_roles
-- Source: app/repositories/rbac.py::get_user_permissions() — the embed
-- query "roles(role_permissions(permissions(code)))" requires all four
-- tables to exist with this exact join shape for PostgREST to resolve it.
-- Columns for roles/permissions: app/schemas/rbac.py::RoleResponse /
-- PermissionResponse (id, name/code, description).
-- =====================================================================
create table roles (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text
);

create table permissions (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    description text
);

create table role_permissions (
    role_id uuid not null references roles(id) on delete cascade,
    permission_id uuid not null references permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

create table user_roles (
    user_id uuid not null references users(id) on delete cascade,
    role_id uuid not null references roles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, role_id)
);

-- =====================================================================
-- Row Level Security
-- Enabling RLS is standard practice for any Supabase table reachable via
-- the anon/service-role split this app uses, but the actual POLICIES
-- (who can read/write what) depend on product decisions not visible from
-- the repository code alone -- NOT invented here per rules.md #8. The
-- backend currently uses the service-role key exclusively (bypasses RLS
-- entirely, per app/api/deps.py), so nothing breaks by leaving policies
-- undefined for now -- but before any client-side/anon-key access to
-- these tables is added, policies need to be written deliberately.
-- =====================================================================
alter table users enable row level security;
alter table user_settings enable row level security;
alter table brand_voices enable row level security;
alter table scheduled_posts enable row level security;
alter table audit_logs enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;

-- =====================================================================
-- Backend role grants
-- Required so the backend can use the service_role key to access tables.
--
-- Why this is needed: Supabase's dashboard-driven table creation
-- normally comes with default grants to anon/authenticated/service_role
-- already applied. Running raw CREATE TABLE statements directly in the
-- SQL editor (as this file does) skips that -- confirmed necessary via
-- direct testing: without these grants, service_role could still see
-- these tables existed but every read/write from the backend failed.
-- =====================================================================
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO service_role;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT
ON SEQUENCES TO service_role;

GRANT USAGE ON SCHEMA public TO authenticated;



