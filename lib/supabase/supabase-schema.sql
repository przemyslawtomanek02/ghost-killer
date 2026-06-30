-- Wydmuszka — schemat bazy
-- Wklej w Supabase: SQL Editor → New query → Run

-- Tabela analiz (każda analiza = jeden wiersz, służy do liczenia limitu freemium)
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verdict text,
  score int,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_month_idx
  on public.analyses (user_id, created_at);

-- Row Level Security: użytkownik widzi i tworzy tylko swoje analizy
alter table public.analyses enable row level security;

create policy "wlasne_analizy_select"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "wlasne_analizy_insert"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- (Później dla Stripe) profil z statusem subskrypcji
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_pro boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "wlasny_profil_select"
  on public.profiles for select
  using (auth.uid() = id);

-- Automatyczne tworzenie profilu przy rejestracji
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
