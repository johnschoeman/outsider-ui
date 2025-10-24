# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Outsider UI" - a web-based multiplayer social deduction game built with Foldkit (a functional UI framework) and Effect-TS. The game involves players trying to identify the "Outsider" who doesn't know the secret word.

## Key Technologies

- **Vite**: Build tool and dev server
- **Effect-TS**: Functional programming library used for schemas, pattern matching, and Option types
- **Foldkit**: Functional UI framework with Effect-TS integration for component rendering and state management
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type safety throughout the codebase

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Code formatting
pnpm format
```

## Architecture

### State Management Pattern

The app follows the Elm Architecture (Model-View-Update) pattern:

- **Model**: `AppModel` in `src/app.ts` contains the entire application state
- **Messages**: Discriminated union types for all possible actions
- **Update**: Pure function that transforms state based on messages
- **View**: Pure function that renders HTML based on current state

### Core Application Structure

**Main App (`src/app.ts`)**:

- Central state management with `AppModel` containing current page state
- Message handling with exhaustive pattern matching using Effect's `Match` module
- Local storage integration for player name persistence
- State transitions between Landing → Lobby → Game

**Runtime (`src/main.ts`)**:

- Foldkit Runtime setup with Model/View/Update pattern
- Browser integration (currently no-op for URL handling)

**Domain Models (`src/domain/`)**:

Modules designed to contain domain business logic.
Domain models should only contain pure functions and constants.

- `game.ts`: Core game logic, phases, and state transitions
- `player.ts`: Player entity with roles (Master/Outsider/Commoner)
- `lobby.ts`: Lobby management and ID generation
- `timer.ts`: Game phase timing utilities

**Pages (`src/pages/`)**:

Each page is a main screen that users interact with.
Pages should contain a minimum of business logic, instead importing from the domain modules.

- Each page has its own model, view, and update functions
- Landing: Player name input, lobby creation/joining
- Lobby: Player list, game start controls
- Game: Multi-phase gameplay with role-based UI

### Game Flow

1. **Landing**: Enter name, create/join lobby
2. **Lobby**: Wait for players, start game
3. **Game Phases**:
   - Phase 1: Role Assignment: Random Master/Outsider/Commoner assignment
   - Phase 2: Word Creation: Master creates secret word
   - Phase 3: Share Secret Word: 30s timer to show word to Outsider
   - Phase 4: Player Guessing: 5min guessing phase
   - Phase 5: Voting: 5min voting to identify Outsider
   - Phase 6: Results: Show winner and reset

### Schema & Type Safety

- Extensive use of Effect Schema for runtime type validation
- All models defined with `S.Struct` for compile-time and runtime safety
- Option types used throughout to handle nullable/optional values
- Branded types with `ts()` helper for message creation

### State Structure Notes

- App state contains current page and page-specific models
- Option types wrap nullable references (currentPlayerId, lobbyPage, etc.)
- Game state includes phase timers, player roles, and voting state
- Local storage automatically persists player name

## Important Patterns

**Message Creation**: Use the exported message creator functions (e.g., `playerNameChanged()`) rather than directly constructing messages.

**Option Handling**: Always check `Option.isSome()` before accessing `.value` on Option types.

**State Updates**: All state updates are immutable - use spread operator to create new state objects.

**Validation**: Form validation happens in update functions with error states in the models.

## Style Guide

Use double quotes for all string literals:

```
const myVar = "A String"

// Title
h1(
  [Class("text-3xl font-bold text-gray-800 mb-6 text-center")],
  ["How to Play Outsider"],
)
```
