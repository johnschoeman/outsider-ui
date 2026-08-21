# Testing Standards

This project has no automated test suite (no test runner in `package.json`). Verification relies on type checking and linting.

## Verification

After code changes, run:

```bash
pnpm typecheck   # Type check
pnpm lint        # Lint
pnpm format      # Format check
```

## Project-Specific

- If a test framework is added later, uncomment and fill in test-specific principles here
- For UI/frontend changes, run `pnpm dev` and manually exercise the change in the browser — there is no automated coverage to catch regressions
