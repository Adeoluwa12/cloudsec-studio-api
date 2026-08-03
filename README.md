# CloudSec.studio API

## Setup

1. `npm install`
2. Copy `.env.example` to `.env`, fill in real values.
3. Register OAuth apps:
   - **Google**: console.cloud.google.com → APIs & Services → Credentials → OAuth client ID
     (Web application) → Authorized redirect URI: `http://localhost:4001/api/auth/google/callback`
   - **GitHub**: github.com/settings/developers → New OAuth App → Authorization
     callback URL: `http://localhost:4001/api/auth/github/callback`
4. `npm run dev`

## Auth flow

Frontend links to `GET /api/auth/google` or `/api/auth/github` (full page
redirect, not fetch). Provider redirects back to our callback route, which
creates/finds the user, issues a JWT, and redirects to
`${CLIENT_URL}/auth/callback?token=...`. The frontend grabs that token from
the URL and stores it (see client `app/auth/callback`).

First user to sign in with `ADMIN_EMAIL` gets `role: "admin"` automatically.

## Endpoints

- `GET /api/posts`, `GET /api/posts/:slug` — published content
- `GET /api/posts/:postId/quiz`, `GET /api/posts/:postId/lab` — sanitized (no answers)
- `GET /api/interview-questions` — interview prep bank
- `POST /api/quiz/:postId/submit` — auth required, grades and updates progress
- `POST /api/lab/:postId/run` — auth required, validates a terminal command against the lab script
- `GET /api/dashboard` — auth required, user's badges + progress
- `GET/POST/PUT/DELETE /api/admin/{posts,quizzes,labs,interview-questions}` — admin CRUD
- `GET /api/admin/analytics` — user/post counts, avg quiz score, lab completions
