# Tech Stack

## Language

TypeScript 5.9

## Framework

Foldkit 0.13 (functional UI framework, Elm-style Model/View/Update) + Effect-TS 3.19

## Key Libraries

| Library | Purpose | Notes |
|---------|---------|-------|
| `effect` | Schemas, pattern matching, `Option` types | Extensive use of `S.Struct` for runtime + compile-time type safety |
| `foldkit` | Component rendering, state management, Runtime setup | Elm Architecture: Model, Messages, Update, View |
| `@effect/platform` | HTTP requests | Used for lobby/healthcheck requests |
| `@tailwindcss/vite` / `tailwindcss` | Styling | Utility-first CSS, Tailwind v4 Vite plugin |
| `@foldkit/vite-plugin` | Vite integration for Foldkit | |

## Build & Dev

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm typecheck` | Type check (`tsc --noEmit`) |
| `pnpm lint` | Lint (`eslint .`) |
| `pnpm format` | Format (`prettier -w src`) |
| `pnpm validate` | Run typecheck + lint + format check together |

## Testing

No test framework configured. Verification relies on `pnpm typecheck` and `pnpm lint`. See [[../rules/testing.md]].

## Database / Storage

None. Player name persistence uses browser `localStorage` only.
