# J.A.R.V.I.S

A private household assistant for two: finance (budget, pension, mortgages, statement import), house renovation projects, meal planning and shopping lists, todos, and later energy and smart-home data.

Built with Nuxt 4 layers, Postgres and Drizzle. The app lives in [`src/app`](src/app), with one layer per domain in [`src/app/layers`](src/app/layers). Project knowledge lives in the [wiki](docs/wiki/index.md); agents work by the rules in [AGENTS.md](AGENTS.md).

## Running locally

```bash
cd src/app
cp .env.example .env        # then fill in real values
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```
