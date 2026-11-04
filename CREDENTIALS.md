# Credentials Policy

**No real credentials are stored in this repository. Never commit any.**

| Where | What goes there |
| :--- | :--- |
| `.env.local` (gitignored) | Your local development secrets |
| Hosting provider env settings (Vercel / Fly / Render / Docker `env_file`) | Production secrets |
| GitHub → Settings → Secrets and variables → Actions | CI-only secrets (if ever needed) |

## Accounts

- **Production:** all accounts are real Supabase Auth users created through `/signup`. There are **no default
  passwords**. To make someone a super admin, run in the Supabase SQL editor:
  `update public.profiles set is_super_admin = true where email = 'you@yourdomain.com';`
- **Local development only:** two sandbox accounts (`admin@chatify.ai`, `user@chatify.ai`) exist in memory.
  Their passwords come from `DEV_ADMIN_PASSWORD` / `DEV_USER_PASSWORD` in `.env.local`. If unset, a random
  password is generated on every start, so nobody can log in with a guessable default. The sandbox store
  is hard-disabled when `NODE_ENV=production`.

## If a secret leaks

Rotate it at the provider immediately (Supabase → Settings → API, Groq console, Google AI Studio, Upstash console,
Resend dashboard), update it in your host's env settings, and redeploy. Removing it from git history is **not**
enough on its own.
