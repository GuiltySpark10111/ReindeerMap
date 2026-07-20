create table waypoints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  device_id text not null,        -- anonymous device fingerprint (no login required for v1)
  lat float8 not null,
  lng float8 not null,
  type text not null default 'general',
  name text not null,
  notes text,
  depth_ft float4,
  depth_m float4,
  species text[],
  source text default 'manual',
  trip_date date,
  image_url text,
  layer_id text default 'personal'
);

-- v1: open read/write via anon key, scoped to device_id at the application
-- layer only (useWaypoints.js filters/sets device_id on every call).
-- A session-variable-based policy (current_setting('app.device_id')) can't
-- be enforced from the browser anon client without a custom RPC/session
-- setter, so real per-device isolation is deferred to v2 (Supabase Auth).
alter table waypoints enable row level security;
create policy "anon read/write v1" on waypoints
  for all using (true) with check (true);
