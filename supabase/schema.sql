create table if not exists public.profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  legacy_id text not null unique,
  email text not null unique,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  data jsonb not null
);

create table if not exists public.app_records (
  kind text not null check (
    kind in (
      'products',
      'orders',
      'delivery_zones',
      'reviews',
      'settings',
      'contact_messages',
      'email_notifications'
    )
  ),
  id text not null,
  lookup text,
  data jsonb not null,
  primary key (kind, id)
);

create unique index if not exists app_records_kind_lookup_unique
  on public.app_records (kind, lookup)
  where lookup is not null;

create index if not exists app_records_kind_created_at_idx
  on public.app_records (kind, (data ->> 'createdAt'));

alter table public.profiles enable row level security;
alter table public.app_records enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.app_records from anon, authenticated;
grant all on public.profiles to service_role;
grant all on public.app_records to service_role;
