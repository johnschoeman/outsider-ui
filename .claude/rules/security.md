# Security

Constraints for production code. These are non-negotiable.

## Data Handling

- NEVER log PII, credentials, tokens, or API keys
- NEVER commit secrets to git — use environment variables
- NEVER hardcode connection strings, passwords, or keys
- Validate all user input at system boundaries
- Sanitize output to prevent XSS

## Project-Specific

- Player-submitted input (names, secret words) is rendered directly into the DOM via Foldkit views — ensure it is never interpolated into raw HTML strings
- Local storage only persists the player name — do not add sensitive data to local storage
