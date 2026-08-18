# ISL Platform — Backend

Express + PostgreSQL (Prisma) + Socket.io backend for the Sign⇄Voice
communication platform: auth, profiles, contacts/friend requests, and
WebRTC call signaling.

## 1. Local setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` — a free Postgres instance works great from
  [Supabase](https://supabase.com), [Neon](https://neon.tech), or
  [Railway](https://railway.app). Copy their connection string in.
- `JWT_SECRET` — generate with `openssl rand -base64 32`.

Then create the database tables:

```bash
npm run prisma:migrate
```

Run the server:

```bash
npm run dev
```

API + signaling now live at `http://localhost:4000`.

## 2. API overview

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/signup` | POST | — | Create account |
| `/api/auth/login` | POST | — | Get JWT |
| `/api/auth/me` | GET | ✅ | Current user |
| `/api/profile` | GET/PATCH | ✅ | View/edit own profile (phone, bio, etc.) |
| `/api/profile/:id` | GET | ✅ | View another user's public profile |
| `/api/contacts/search?q=` | GET | ✅ | Find users to add |
| `/api/contacts/request` | POST | ✅ | Send friend request |
| `/api/contacts/requests` | GET | ✅ | Incoming pending requests |
| `/api/contacts/requests/:id/respond` | POST | ✅ | Accept/decline |
| `/api/contacts` | GET | ✅ | List accepted friends |
| `/api/calls` | POST | ✅ | Start a call/translation session, get `roomId` |
| `/api/calls/:id/end` | POST | ✅ | End a session |
| `/api/calls/history` | GET | ✅ | Past sessions |

Protected routes need `Authorization: Bearer <token>`.

## 3. WebRTC signaling (Socket.io events)

Client connects to the same server via Socket.io, then:

1. `join-room` `{ roomId, userId }` — roomId = the `id` returned from `POST /api/calls`
2. `webrtc-offer` / `webrtc-answer` / `ice-candidate` — standard WebRTC handshake, relayed to the other peer
3. `translation-result` `{ roomId, text, mode }` — push recognized sign/speech text to the other participant's screen live
4. `leave-room`

The server never touches video/audio itself — after signaling, the two
browsers connect directly (peer-to-peer). For users on strict
corporate/mobile networks you'll eventually want a TURN server (e.g. via
[Twilio](https://www.twilio.com/stun-turn) or
[metered.ca](https://www.metered.ca/tools/openrelay/)) — free STUN alone
covers most cases for now.

## 4. Deploying

- **Railway / Render**: point at this `server/` folder, set the env vars
  from `.env.example`, add a Postgres add-on, done.
- Run `npm run prisma:migrate` once against production `DATABASE_URL`
  (or use `prisma migrate deploy` in your deploy pipeline).

## 5. Where the AI plugs in later

The `mode` field on a call session (`sign-to-sign`, `sign-to-voice`,
`voice-to-sign`) plus `sourceLang`/`targetLang` (`ISL`/`ASL`/`BSL`) is
already modeled. When the gesture-recognition model is ready, its output
gets emitted through the existing `translation-result` socket event —
no schema changes needed.
