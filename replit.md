# VillageConnectAI

Digital infrastructure for rural communities, helping residents discover support, livelihoods, trusted local information, and nearby village connections.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/resources.ts` — community resource directory schema
- `artifacts/api-server/src/routes/resources.ts` — resource search and matching API
- `artifacts/village-connect-ai/src/` — resident-facing web app

## Architecture decisions

- Resource matching currently ranks directory entries using listing text, categories, and tags; no hosted LLM is configured.
- Saved listings are kept in the resident's browser and do not require an account.

## Product

- Long-term scope: local services, workers, farmers, businesses, a local marketplace, community information, emergency announcements, government-scheme information, AI-powered assistance, and connections between nearby villages.
- Product boundary: this is practical village infrastructure, not a generic social-media app or a standalone marketplace.
- Prioritize everyday jobs: find electricians, plumbers, mechanics, transport, labor, tutors, shops; find farm equipment, labor, seeds, buyers, and scheme information; share useful village notices. Do not add engagement features or commerce complexity without a clear resident need.
- Current MVP: residents can browse and search resources, filter by category and location, view listing details, get keyword/category/tag matches, and save listings in their browser.
- Matching is deterministic directory ranking; no AI model is connected yet.
- The current directory contains sample listings only. Replace them with verified providers and contact details before sharing the app as a live local service directory.
- Community updates should default to pending and become live only after five unique eligible users verify them. Authors cannot verify their own posts or vote twice; eligibility, counts, and status changes must be enforced by the backend/database.
- Residents may browse other villages, but creating updates, services, and marketplace listings is limited to their home village unless an administrator grants an exception.
- AI must not invent government schemes, eligibility, official procedures, legal requirements, medical advice, or financial claims. Government information should rely on verified official sources and clearly state uncertainty.
- Plan for Telugu, Hindi, and English, older smartphones, low digital literacy, slow or intermittent connections, and accessible controls.
- The supplied implementation brief specifies Supabase Postgres/Auth/Storage/Edge Functions, phone OTP, and Google Maps APIs. The current MVP still uses Replit's managed PostgreSQL; any provider change needs to be decided before migration.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
