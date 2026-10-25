# Finance Tracker

A Nuxt 4 household finance tracker (budget, pension, mortgages) backed by Postgres via Drizzle ORM. See [claude.md](claude.md) for the full architecture and build plan.

## Local Development Setup

### Prerequisites

- Node.js (version matching `package.json`'s `@types/node`, currently Node 22+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the local Postgres database)

### 1. Install dependencies

```bash
npm install
```

### 2. Start the local Postgres database

The repo's [docker-compose.yml](docker-compose.yml) defines a single `postgres:16-alpine` service. You don't need to create anything new — just start it:

```bash
docker compose up -d
```

This creates a container named `finance-tracker-postgres-1` (or similar) listening on `localhost:5432`, with a named volume (`postgres-data`) that persists data across `docker compose down`/`up` cycles. Credentials and database name come from the `environment:` block in `docker-compose.yml` (`postgres` / `postgres` / `finance_tracker`).

Check it's running:

```bash
docker compose ps
```

### 3. Configure environment variables

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

- `DATABASE_URL` should already match the Docker Compose service as-is: `postgres://postgres:postgres@localhost:5432/finance_tracker`
- `NUXT_SESSION_PASSWORD` needs a random string of 32+ characters (e.g. `openssl rand -hex 32`)
- The `SEED_*` and `HOUSEHOLD_*` values are only read once by the seed script (step 5) — fill them in with real household/account details, then they're safe to leave or remove afterwards

`.env` is gitignored and never committed — on a new machine you always recreate it from `.env.example`.

### 4. Apply database migrations

The schema migration is already generated and checked into `server/database/migrations/`. Apply it to your fresh container:

```bash
npm run db:migrate
```

(`npm run db:generate` is only needed after changing `server/database/schema/*.ts` to produce a *new* migration — not needed for a fresh setup.)

### 5. Seed the household + accounts

```bash
npm run db:seed
```

This creates the household and both user accounts (using the `SEED_*`/`HOUSEHOLD_*` values from `.env`) so you can log in at `/login`.

### 6. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### Useful commands

| Command | Purpose |
| --- | --- |
| `docker compose up -d` | Start the local Postgres container |
| `docker compose down` | Stop the container (keeps data in the volume) |
| `docker compose down -v` | Stop the container **and delete the volume** — full reset, re-run migrate + seed afterwards |
| `npm run db:studio` | Open Drizzle Studio to browse/edit data in the browser |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:generate` | Generate a new migration from schema changes |

## Production

```bash
npm run build    # build for production
npm run preview  # locally preview the production build
```

See [claude.md](claude.md#azure-deployment) for the Azure Container Apps deployment plan.
