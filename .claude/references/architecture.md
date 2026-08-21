# Architecture

## Overview

Outsider UI is a web-based multiplayer social deduction game. Players try to identify the "Outsider" — the one player who doesn't know the secret word. Built as a single-page app following the Elm Architecture (Model/View/Update), with Effect-TS for schemas and effects.

## Key Components

| Component | Responsibility |
|-----------|---------------|
| `src/main.ts` | Foldkit Runtime setup (Model/View/Update wiring), browser integration |
| `src/app.ts` | Top-level `AppModel`, message dispatch via Effect `Match`, page transitions (Landing → Lobby → Game) |
| `src/domain/` | Pure business logic and constants: `game.ts` (phases/state transitions), `player.ts` (roles), `lobby.ts` (lobby IDs), `timer.ts` (phase timing) |
| `src/pages/` | Per-page model/view/update: Landing (name entry, lobby create/join), Lobby (player list, start controls), Game (multi-phase gameplay) |

## Data Flow

1. `src/main.ts` boots the Foldkit Runtime with the root Model, View, Update
2. User interaction produces a Message (discriminated union), dispatched through `update`
3. `update` pattern-matches the message via Effect `Match` and returns a new immutable `AppModel`
4. `view` re-renders from the new model
5. Local storage syncs player name on relevant state changes
6. Lobby/healthcheck operations go through `@effect/platform` HTTP requests

## Game Flow

1. Landing: enter name, create or join lobby
2. Lobby: wait for players, start game
3. Game phases: Role Assignment → Word Creation → Share Secret Word (30s) → Player Guessing (5min) → Voting (5min) → Results

## External Dependencies

| Dependency | Purpose | Failure Mode |
|-----------|---------|-------------|
| Backend API (via `@effect/platform` HTTP client) | Lobby creation/join, healthcheck | Errors rendered inline (e.g. create-lobby error state) |

## Deployment

Vite build (`pnpm build`) produces static output; no CI/CD pipeline configured in-repo.
