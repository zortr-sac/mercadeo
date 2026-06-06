-- Reversal of 0009_seed_academy_blocks: the platform no longer ships base/global
-- Academia content. Every business owns and fully edits its own courses; content
-- varies per business and new businesses start with an empty Academia.
--
-- Remove any global (business_id null) courses. Their modules, lessons and any
-- lesson_progress rows cascade away via FOREIGN KEY ... ON DELETE CASCADE.
delete from public.courses where business_id is null;
