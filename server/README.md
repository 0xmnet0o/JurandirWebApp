# PedeAí — Server

Node/Express/TypeScript backend for the PedeAí ordering platform.

## Setup

```bash
cd server
npm install
cp .env.example .env   # fill in values
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot-reload (tsx watch) |
| `npm test` | Run all tests (unit + integration) |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run lint` | ESLint |

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default 3333) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |

## Endpoints

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Current user profile |

### Public (no auth)
| Method | Path | Description |
|---|---|---|
| GET | `/api/establishments` | List active establishments |
| GET | `/api/establishments/:id` | Get one establishment |
| GET | `/api/establishments/:id/menu` | Public menu |
| POST | `/api/establishments/:id/orders` | Place order |

### Owner (Bearer required)
| Method | Path | Description |
|---|---|---|
| PATCH | `/api/me/establishment` | Upsert own establishment |
| GET | `/api/me/establishment/menu` | Own menu items |
| POST | `/api/me/establishment/menu` | Add menu item |
| PATCH | `/api/me/establishment/menu/:id` | Update menu item |
| DELETE | `/api/me/establishment/menu/:id` | Delete menu item |
| GET | `/api/orders` | List own orders (filter: `?status=`) |
| PATCH | `/api/orders/:id` | Update order status |
| POST | `/api/orders/:id/splits/:position/pay` | Mark split as paid |

### Admin (Bearer + role=admin required)
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/establishments` | List all establishments |
| PATCH | `/api/admin/establishments/:id` | Update fee_pct or status |
| GET | `/api/admin/stats` | GMV, fee revenue, order count |

## Security

- All DB access uses the Supabase **service-role key** — RLS policies deny anon/authenticated requests directly; the API is the only entry point.
- **Never commit `.env`** — it contains the service-role key.
- JWTs are validated server-side via `getUserFromToken` before any protected route runs.
