# CET Prep Deployment Guide

This document outlines the end-to-end setup, development, and production deployment process for the CET Prep application.

## 1. Local Setup & Development

### Prerequisites
- Node.js (v20+)
- pnpm (v9+)
- A Supabase project

### Installation
1. Clone the repository: `git clone ...`
2. Install dependencies: `pnpm install`
3. Copy the environment variables template:
   ```bash
   cp .env.local.example .env.local
   ```
4. Fill in your local `.env.local` with your Supabase URL and Anon Key.
5. Start the development server: `pnpm dev`

## 2. Testing & Validation

Before deploying or submitting a PR, always validate the codebase locally:
- **Type Checking:** `pnpm type-check`
- **Linting:** `pnpm lint`
- **Build Verification:** `pnpm build`

All three commands run automatically in our CI/CD GitHub Actions pipeline on every Pull Request.

## 3. Environment Variables

The application requires the following environment variables to function:
- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for Supabase.

*Note: Never place service role keys or database passwords in the `.env.local` or Vercel environment configurations for the Next.js frontend.*

## 4. Production Deployment (Vercel)

The application is heavily optimized for Vercel.

1. **Connect Repository:** Import the GitHub repository into your Vercel account.
2. **Framework Preset:** Vercel will automatically detect `Next.js`.
3. **Build Command:** Vercel defaults (`next build`) are correct.
4. **Environment Variables:** Add your production Supabase keys to the Vercel project settings.
5. **Deploy:** Click Deploy.

### Updating Production
Merging a Pull Request from `develop` into `main` will automatically trigger a production deployment on Vercel. 

### Rollback Process
If a critical bug reaches production:
1. Open the Vercel Dashboard for the project.
2. Navigate to the **Deployments** tab.
3. Locate the previous stable deployment.
4. Click the three dots (...) and select **Promote to Production** or **Instant Rollback**.
5. Revert the broken commit in GitHub on the `main` branch to sync the git history.
