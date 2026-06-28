-- Lock the app's tables to the database owner only.
--
-- This app does NOT use Supabase's auto-generated PostgREST data API — all
-- access goes through the Next.js server via Prisma, which connects as the
-- table owner and bypasses RLS. Enabling RLS with no policies therefore:
--   * blocks the public data API (anon/authenticated keys) from reading or
--     writing these tables (fixes rls_disabled_in_public + sensitive_columns_exposed)
--   * leaves Prisma (owner) access fully working
--
-- Re-run this if the tables are ever dropped and recreated.

ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."GameSave" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SavedCareer" ENABLE ROW LEVEL SECURITY;
