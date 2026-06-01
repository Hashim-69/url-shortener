# URL Shortener

A full-stack URL shortener with analytics, authentication, and API key management built with TypeScript, Express, React, and SQLite.

![Stack](https://img.shields.io/badge/stack-Express%20%7C%20React%20%7C%20SQLite%20%7C%20TypeScript-blue)

## Features

- **Link Shortening** — Create short links with auto-generated or custom slugs
- **Click Analytics** — Track clicks over time, referrer sources, and device types
- **QR Codes** — Auto-generated QR codes for every shortened link
- **Link Expiry** — Set expiration dates for time-sensitive links
- **User Authentication** — JWT-based register/login system
- **API Key Access** — Programmatic access with auto-generated API keys
- **Rate Limiting** — Protection against abuse (100 req/min per IP, 1000 req/min with API key)
- **Analytics Dashboard** — Interactive charts powered by Chart.js

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + TypeScript + Express |
| Database | SQLite (via better-sqlite3) |
| Frontend | React + Vite + Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| Auth | JWT + bcrypt |
| QR | qrcode |

## Prerequisites

- Node.js 18+ and npm

## Quick Start

```bash
# Clone and enter
git clone https://github.com/Hashim-69/url-shortener.git
cd url-shortener

# Install all dependencies
npm run setup

# Start development (server on :3001, client on :5173)
npm run dev
```

The Vite dev server proxies `/api` requests to Express, so open `http://localhost:5173` in your browser.

## Project Structure

```
url-shortener/
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── config.ts        # Environment config
│   │   ├── db/             # Database setup + schema
│   │   ├── routes/         # Auth, links, redirect, analytics
│   │   ├── middleware/      # JWT auth + rate limiting
│   │   └── services/       # Business logic
│   ├── package.json
│   └── tsconfig.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, CreateLink, LinkDetail
│   │   ├── components/     # Navbar, ProtectedRoute
│   │   └── api/            # Axios client with JWT interceptor
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json            # Root scripts (concurrently)
└── README.md
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (name, email, password) |
| POST | `/api/auth/login` | Login, returns JWT + API key |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/auth/keys` | View API key |
| POST | `/api/auth/keys/regenerate` | Regenerate API key |

### Links

All `links` endpoints require `Authorization: Bearer <token>` or `Authorization: Bearer <api_key>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/links` | Create short link |
| GET | `/api/links` | List all user's links |
| GET | `/api/links/:id` | Get link details |
| PUT | `/api/links/:id` | Update link |
| DELETE | `/api/links/:id` | Delete link |
| POST | `/api/links/:id/qr` | Generate QR code |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links/:id/analytics` | Get click stats |

### Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:shortCode` | Redirect to original URL |

### API Key Authentication

Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3001/api/links
```

## Deployment

### Build for production

```bash
npm run build
```

This compiles the server TypeScript and builds the React client. Run with:

```bash
npm start
```

### Deploy to Render

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Build Command**: `npm run setup && npm run build`
4. Set **Start Command**: `npm start`
5. Add environment variable in Render dashboard (or let the server auto-generate one)

### Deploy to Railway

1. Create a new project on Railway
2. Connect your GitHub repo
3. Railway auto-detects the Node.js project
4. Set start command: `npm start`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | auto-generated | Secret for signing JWT tokens |
| `DATABASE_PATH` | `./data/url-shortener.db` | SQLite database file path |

The server auto-generates a `.env` file with a secure `JWT_SECRET` on first run if none exists.

## License

MIT
