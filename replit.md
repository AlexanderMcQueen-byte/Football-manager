# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is an **eFootball Tournament Manager** web app for organizing friendly match tournaments.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, React Query, wouter

## Application Features

- **League tournaments**: Double round-robin fixture generation, standings table with points/GD/GF/form
- **Knockout tournaments**: 8-player bracket (QF/SF/F), 4-player (SF/F), or 2-player (F)
- **Players**: Global player roster management
- **Match results**: Score entry that auto-updates standings
- **Standings**: Points (W=3,D=1,L=0), GD, GF, form badges (last 5)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── efootball-manager/  # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `players` — global player pool
- `tournaments` — league or knockout tournaments
- `tournament_players` — which players are in each tournament
- `fixtures` — auto-generated match fixtures (includes knockoutPhase for bracket)

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — run the API dev server
- `pnpm --filter @workspace/efootball-manager run dev` — run the frontend
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client
