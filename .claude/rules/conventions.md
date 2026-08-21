# Coding Conventions

Design conventions that require judgment — things linters can't enforce.

## Universal

- ALWAYS prefer simplicity — implement only what's requested, no speculative features
- ALWAYS match existing patterns in the codebase before inventing new ones
- Use early returns to reduce nesting
- Small functions (<40 lines) and small files (<500 lines)
- Name things for the domain, not the implementation
- Prefer composition over inheritance
- One concept per file — if a file does two unrelated things, split it

## Project-Specific

- ALWAYS use double quotes for string literals, never single quotes
- Domain modules (`src/domain/`) contain only pure functions and constants — no framework/UI code
- Pages (`src/pages/`) hold minimal business logic — delegate to `src/domain/` instead of reimplementing logic inline
- Use the exported message creator functions (e.g. `playerNameChanged()`) rather than constructing message objects directly
- Always check `Option.isSome()` before accessing `.value` on Effect `Option` types
- State updates are immutable — use spread operator to build new state objects, never mutate in place
- Model app state with `S.Struct` (Effect Schema) for compile-time and runtime safety
