# Chatify

An AI chatbot for small businesses. You add your website link, prices, or common questions. The chatbot answers
customers on your website and saves the contact details of people who want to book.

## What's inside

| Part | Tool |
| --- | --- |
| Website and dashboard | Next.js 15 (React) |
| Database and login | Supabase |
| AI answers | Google Gemini, with Groq as a backup |
| Rate limits and cache | Upstash Redis |
| Emails | Resend |
| Payments (optional) | Stripe |

## Run it on your computer

You need [Node.js](https://nodejs.org) version 20 or newer.

1. Install the packages:
   ```bash
   npm install
   ```
2. Copy the example settings file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
   The minimum is the three Supabase values and `GEMINI_API_KEY` or `GROQ_API_KEY`.
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000.

`.env.local` is ignored by git. Never commit real keys.

## Set up the database

In the Supabase dashboard, open **SQL Editor** and run each file in `supabase/migrations/`, oldest first.

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app for development |
| `npm run build` | Make a production build |
| `npm start` | Run the production build |
| `npm test` | Run the tests |
| `npm run typecheck` | Check for TypeScript errors |
| `npm run test:load` | Simple load test (start the app first) |

## Put it online

The easiest way is [Vercel](https://vercel.com): import this GitHub repo, add the same keys from `.env.local`
under **Environment Variables**, and deploy. A `Dockerfile` is included for other hosts.

Before going live, read [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md). It lists the
one-time setup steps and what security protections are in place.

## Folder guide

```
app/            pages and API routes
  dashboard/    the logged-in dashboard
  api/          server endpoints
components/     shared UI pieces
lib/            server logic (AI, security, database helpers)
supabase/       database migrations
public/widget.js  the chat bubble script customers put on their site
tests/          unit and load tests
```
