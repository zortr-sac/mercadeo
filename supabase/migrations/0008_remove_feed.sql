-- Remove the Feed module (posts) — NetScale no longer uses it.
drop function if exists public.increment_post_reaction(uuid, integer);
drop table if exists public.posts cascade;
drop type if exists public.post_type;
-- Note: enum value 'post_created' in public.activity_kind is left orphaned
-- (Postgres cannot drop enum values without recreating the type); it is harmless.
