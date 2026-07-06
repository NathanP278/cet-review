# Supabase Setup for UPCAT Prep

1. **Create a Supabase Project**
   Go to [supabase.com](https://supabase.com) and create a new project.

2. **Run Migrations & Seed**
   Go to the Supabase SQL Editor in your dashboard and copy-paste the contents of:
   - `migrations/001_initial_schema.sql`
   - `seed.sql`

3. **Configure Environment Variables**
   Copy `.env.local.example` to `.env.local` in the project root and fill in the values from your Supabase Project Settings (API).
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Do not expose to the client)
