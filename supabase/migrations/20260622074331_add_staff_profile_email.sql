alter table public.staff_profiles
add column if not exists email text;

update public.staff_profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.user_id = auth_user.id
  and profile.email is null;

alter table public.staff_profiles
alter column email set not null;

create unique index if not exists staff_profiles_email_key
on public.staff_profiles (lower(email));
