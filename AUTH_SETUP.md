# Google Auth Setup (Supabase)

This app uses Supabase OAuth for Google (Gmail). Configuration is done in the Supabase dashboard.

## Steps
1) Create OAuth credentials in Google Cloud Console
   - Type: OAuth Client ID (Web)
   - Authorized redirect URIs:
     - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback` (local dev)

2) Supabase Dashboard → Authentication → Providers → Google
   - Enable Google
   - Paste Client ID and Client Secret

3) Supabase Dashboard → Authentication → URL Configuration
   - Site URL: `NEXT_PUBLIC_SITE_URL`
   - Additional Redirect URLs:
     - `NEXT_PUBLIC_SITE_URL/callback`
     - `http://localhost:3000/callback`

4) App env
   - Ensure `.env.local` includes:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL`

## Notes
- The app uses `/callback` for OAuth return. It creates a couple membership on first login.
- For production, update the redirect URLs to your Vercel domains.
