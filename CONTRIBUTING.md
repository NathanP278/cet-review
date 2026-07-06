# Contributing to UPCAT Prep

First off, thank you for considering contributing to UPCAT Prep! 

## Branching Strategy

We follow a structured Git flow:
- `main` - Production branch. This branch is strictly locked. Only merge pull requests into this branch when ready for a production Vercel deployment.
- `develop` - The primary active development branch. All feature branches merge here.
- `feature/*` - Create these branches from `develop` for any new features or bug fixes (e.g. `feature/add-math-quiz`).

## Development Workflow

1. Clone the repository and checkout `develop`.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Run `pnpm install`
4. Make your changes and write tests if applicable.
5. Validate your code by running `pnpm type-check` and `pnpm lint`.
6. Push to your fork and submit a Pull Request targeting the `develop` branch.

## Pull Request Requirements

- Pass all CI/CD checks (GitHub Actions will run lint, typecheck, and build).
- Code must follow the established Next.js App Router and Server Component patterns.
- Ensure Supabase queries utilize the batched paradigms where applicable.
