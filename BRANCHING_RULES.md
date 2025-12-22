# Branching Rules

- `main` is production-ready and always deployable.
- `dev` is the integration branch for upcoming features.
- No direct commits to `main`.
- All work flows through PRs into `dev`, then PRs into `main`.
- Rebase only when necessary; prefer merge commits from PRs.
- Small, focused PRs are preferred (single domain slice per branch).
- Feature branches must start from `dev` and follow the naming conventions in `PROJECT_BOARD.md`.
- Coordinate cross-cutting changes (schema, shared types) with branch owners before merging.
