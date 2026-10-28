<div align="center">

<img src="./frontend/public/slice-storm-logo.png" alt="Slice Storm logo" width="120" />

# Slice Storm

### A fast-paced, full-stack fruit-slicing arcade game

Slice fruit, avoid bombs, build combos, and compete for the highest score.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js" alt="Node.js 20 or newer" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
</p>

<p>
  <a href="https://slice-storm-project-1.onrender.com/api/health">
    <img src="https://img.shields.io/badge/API-health_check-39ff14?style=for-the-badge" alt="API health check" />
  </a>
</p>

</div>

---

## Contents

- [Overview](#overview)
- [Key features](#key-features)
- [Technology stack](#technology-stack)
- [Application flow](#application-flow)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Gameplay rules](#gameplay-rules)
- [API overview](#api-overview)
- [Data model](#data-model)
- [Project structure](#project-structure)
- [Security and validation](#security-and-validation)
- [Deployment](#deployment)
- [Testing and quality checks](#testing-and-quality-checks)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Overview

Slice Storm is a responsive browser arcade game built as a full-stack
application. Players can create an account, play a touch-friendly fruit-slicing
game, save completed runs, review personal statistics, and compare scores on a
public leaderboard.

The application separates the interactive game client from a REST API. The
frontend is built with Next.js and React, while the backend uses Express and
MongoDB to manage authentication, game sessions, player statistics, and
leaderboard data.

## Key features

### Gameplay

- Canvas-based fruit-slicing gameplay with mouse, touch, and pointer input.
- Seven fruit types with different point values.
- Bomb hazards and missed-fruit penalties.
- Three lives per Classic run.
- Difficulty progression through faster spawns, increased fruit counts, and
  changing bomb probability.
- Multi-slice bonuses, combo milestones, sound effects, and music controls.

### Player experience

- Account registration, login, logout, and session restoration.
- Mobile-first responsive layouts for the landing page, game, dashboard, and
  leaderboard.
- Personal dashboard with highest score, total games, fruit count, best combo,
  average score, and recent runs.
- Public leaderboard with pagination.
- Authenticated player's current leaderboard rank.

### Engineering features

- JWT authentication using an HTTP-only cookie with a bearer-token fallback for
  browsers that restrict cross-site cookies.
- MongoDB persistence through Mongoose models.
- Zod request validation and structured API errors.
- Server-side ownership and game-result integrity checks.
- Helmet security headers, credential-aware CORS, and rate limiting.
- Production deployment configuration for Render.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, JavaScript |
| UI and gameplay | CSS, HTML Canvas, Pointer Events |
| Backend | Node.js 20+, Express 5, ES modules |
| Database | MongoDB, Mongoose 8 |
| Authentication | JWT, HTTP-only cookies, bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Render configuration in `render.yaml` |

## Application flow

### 1. Player authentication

1. A player registers or logs in from the Next.js frontend.
2. The API validates the input and verifies the password hash.
3. The server creates a signed JWT and sets the authentication cookie.
4. The response also includes a token fallback for mobile browsers that do not
   retain cross-site cookies.
5. The frontend restores the current session through `GET /api/auth/me`.

### 2. Starting a game

1. The authenticated player opens the Play screen.
2. The frontend requests a new game session from the API.
3. The API creates an active session owned by the current user.
4. The game canvas starts the local physics, collision, scoring, and audio
   systems.

### 3. Completing a game

1. The player finishes the run by losing all lives or completing the run.
2. The frontend submits the result with the server-issued session ID.
3. The API verifies session ownership, status, duration, and numeric ranges.
4. The completed game is stored and the user's aggregate statistics are
   updated.
5. The frontend refreshes the player state and displays the result.

### 4. Dashboard and leaderboard

1. Dashboard requests are authenticated with the session cookie or bearer
   token.
2. The API returns player statistics and recent game history.
3. Public leaderboard results can be browsed without signing in.
4. The authenticated rank endpoint returns the current player's position.

## Architecture

```text
┌─────────────────────┐      HTTPS/JSON       ┌────────────────────────┐
│  Next.js Frontend   │ ────────────────────▶ │  Express REST API      │
│                     │ ◀──────────────────── │                        │
│  Pages and UI       │                       │  Routes                │
│  Auth provider      │                       │  Controllers           │
│  API client         │                       │  Auth middleware        │
│  Game canvas        │                       │  Validation             │
└──────────┬──────────┘                       └───────────┬────────────┘
           │                                              │
           │ Cookie / bearer token                         │ Mongoose
           │                                              │
           │                                      ┌─────────▼──────────┐
           └────────────────────────────────────▶│ MongoDB            │
                                                  │ Users and games    │
                                                  └────────────────────┘
```

The frontend owns rendering and real-time gameplay interaction. The backend
owns authentication, game-session ownership, persistence, statistics, and
leaderboard queries. This separation keeps the game responsive while keeping
player data and protected operations behind the API.

## Screenshots

### Landing page

![Slice Storm landing page](./docs/screenshots/landing.png)

### Registration

![Slice Storm registration page](./docs/screenshots/register.png)

### Play menu

![Slice Storm play menu](./docs/screenshots/play-menu.png)

### Gameplay

![Slice Storm gameplay](./docs/screenshots/gameplay.png)

### Dashboard

![Slice Storm dashboard](./docs/screenshots/dashboard.png)

### Leaderboard

![Slice Storm leaderboard](./docs/screenshots/leaderboard.png)

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB Atlas or a local MongoDB instance

### 1. Clone the repository

```powershell
git clone https://github.com/prathameshpimpale07-byte/Slice-Storm-Project.git
cd "Slice-Storm-Project"
```

### 2. Install backend dependencies

```powershell
cd backend
npm install
```

Create `backend/.env`:

```dotenv
PORT=5000
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<a random secret with at least 32 characters>
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend:

```powershell
npm run dev
```

The API is available at `http://localhost:5000`.

### 3. Install and run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start Next.js:

```powershell
npm run dev
```

Open `http://localhost:3000`.

### Production frontend build

```powershell
cd frontend
npm run build
npm start
```

## Environment variables

Never commit real credentials, tokens, cookies, database URLs, or production
environment files. Use safe local values only.

| Variable | Service | Required | Description |
| --- | --- | --- | --- |
| `PORT` | Backend | No | API port; defaults to `5000` |
| `MONGODB_URI` | Backend | Yes | MongoDB connection string |
| `JWT_SECRET` | Backend | Yes | JWT secret; minimum 32 characters |
| `FRONTEND_URL` | Backend | No | Allowed frontend origin for credentialed CORS |
| `NODE_ENV` | Backend | No | `development`, `test`, or `production` |
| `NEXT_PUBLIC_API_URL` | Frontend | No | Backend base URL |

The backend validates required environment variables at startup. This makes
configuration errors visible instead of silently falling back to unsafe
defaults.

## Gameplay rules

1. A Classic run starts with three lives.
2. Slice fruit by dragging across it with a mouse or touch pointer.
3. Missing fruit costs one life.
4. Hitting a bomb costs one life.
5. The run ends when all lives are lost.
6. Completed results are saved to the authenticated player's history.
7. Difficulty increases as the run progresses.

### Fruit scoring

| Fruit | Points |
| --- | ---: |
| Apple | 10 |
| Orange | 12 |
| Kiwi | 14 |
| Banana | 15 |
| Strawberry | 18 |
| Watermelon | 20 |
| Pineapple | 25 |

Each fruit contributes its base value. A multi-slice adds
`5 × (number of fruits - 1)` bonus points. Combo feedback appears at ×3, ×5,
and ×10.

## API overview

All endpoints return JSON. Protected endpoints accept the authentication cookie
or an `Authorization: Bearer <token>` header. Invalid or missing credentials
return `401 Unauthorized`.

### Health and authentication

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API and database status |
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Authenticate a player |
| `POST` | `/api/auth/logout` | Public | Clear the session |
| `GET` | `/api/auth/me` | Optional | Return the current player |

Registration passwords must contain 8–128 characters. Authentication attempts
are rate-limited to 20 requests per 15 minutes.

### Games

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/games/start` | Required | Start an active game session |
| `POST` | `/api/games/complete` | Required | Validate and save a result |
| `GET` | `/api/games/history` | Required | Return recent player games |

Example completion payload:

```json
{
  "sessionId": "server-generated-session-id",
  "score": 250,
  "fruitsSliced": 18,
  "bombsHit": 1,
  "maxCombo": 6,
  "accuracy": 82.5,
  "durationSeconds": 45
}
```

### Leaderboard

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/leaderboard` | Public | Paginated global leaderboard |
| `GET` | `/api/leaderboard/me` | Required | Current player's rank |

Leaderboard pages support `page` and `limit` query parameters. Limits are
capped at 50 records per request.

## Data model

### User

Stores identity and aggregate player statistics:

- `name`, `email`, and `passwordHash`
- `highestScore`
- `totalGames`
- `totalFruitsSliced`
- `bestCombo`

### Game

Stores an owned game session and its completed result:

- `user` reference and unique `sessionId`
- `mode` and `status`
- `score`, `fruitsSliced`, `bombsHit`, and `maxCombo`
- `accuracy` and `durationSeconds`
- Creation and completion timestamps

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── app.js             Express app, middleware, and environment config
│   │   ├── server.js          Database connection and HTTP startup
│   │   ├── config/            MongoDB connection setup
│   │   ├── controllers/       Auth, game, and leaderboard handlers
│   │   ├── middleware/        Authentication and request middleware
│   │   ├── models/            User and Game schemas
│   │   ├── routes/            REST API route definitions
│   │   └── services/          Password hashing and JWT helpers
│   ├── GAME-VALIDATION.md     Game-result integrity notes
│   └── package.json
├── frontend/
│   ├── public/                 Logo and static assets
│   ├── src/
│   │   ├── app/                Next.js pages and layouts
│   │   ├── components/         Shared UI, auth, and game components
│   │   ├── game/               Physics, collision, scoring, and audio
│   │   └── lib/                API client utilities
│   ├── .env.example
│   └── package.json
├── docs/screenshots/           Product screenshots
├── render.yaml                 Render deployment configuration
└── README.md
```

## Security and validation

- Passwords are hashed with bcryptjs and are never returned in API responses.
- JWTs are signed with a server-only secret and expire after seven days.
- Authentication cookies are `HttpOnly`, `Secure` in production, and scoped to
  the application path.
- Credential-aware CORS restricts browser access to the configured frontend.
- Helmet adds standard security headers.
- Global and authentication-specific rate limits reduce abuse.
- Zod validates request bodies and query parameters.
- Game completion verifies ownership, active status, duration, score range,
  fruit rate, bomb rate, and combo range.

These checks provide basic integrity protection. Because gameplay runs in the
browser, they are not a replacement for server-authoritative anti-cheat
systems.

## Deployment

The repository includes a Render service definition in `render.yaml`.

### Backend on Render

Configure these environment variables in the Render dashboard:

```text
NODE_ENV=production
MONGODB_URI=<production MongoDB connection string>
JWT_SECRET=<production secret with at least 32 characters>
FRONTEND_URL=<deployed frontend URL>
```

Render installs dependencies from `backend/package.json` and starts the service
with `npm start`.

### Frontend deployment

Deploy the `frontend` directory to a Next.js-compatible host and configure:

```text
NEXT_PUBLIC_API_URL=<deployed backend URL>
```

Use HTTPS URLs in production. The backend `FRONTEND_URL` must exactly match the
frontend origin and must not include a trailing slash.

## Testing and quality checks

Run the frontend lint and production build:

```powershell
cd frontend
npm run lint
npm run build
```

Run backend syntax checks and start the API after configuring the environment:

```powershell
cd backend
node --check src/app.js
npm start
```

Then verify the service health:

```text
GET http://localhost:5000/api/health
```

## Known limitations

- Classic mode is currently the only available game mode.
- Score integrity checks are range-based; the client still reports gameplay
  results.
- A player can appear in multiple leaderboard rows through multiple completed
  games.
- Audio behavior depends on browser autoplay and audio-context policies.
- MongoDB is required for authentication, saved games, dashboard history, and
  rankings.

## Roadmap

- Add additional game modes and configurable difficulty.
- Introduce server-authoritative event validation for stronger anti-cheat
  protection.
- Add automated backend integration tests and frontend gameplay tests.
- Add player profile customization and achievement badges.
- Add observability for API performance, errors, and database health.

## Contributing

1. Create a focused branch from `main`.
2. Keep changes scoped to one feature or fix.
3. Follow the existing project structure and naming conventions.
4. Run lint, build, and relevant backend checks before opening a pull request.
5. Include a clear description of behavior changes and validation performed.

## License

This project is maintained as an educational and portfolio application. Add a
formal license before redistributing it as open-source software.

---

<div align="center">

Built with fruit, physics, and a little competitive energy.

</div>
