This is a modern [Next.js](https://nextjs.org) application with a dedicated Python microservice for media processing.

## Getting Started

The platform consists of two main services that should be run concurrently during development:

1. **The Next.js Frontend/Backend**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Runs the main application on [http://localhost:3000](http://localhost:3000).

2. **The Python Media Processor (Microservice)**
The Academic Intelligence Studio uses a local Python backend to extract and chunk YouTube videos and PDFs.
```bash
pnpm run dev:python
# or manually:
cd services/media-processor && uv run uvicorn main:app --reload --port 8000
```
Runs the media extraction service on `http://localhost:8000`.

## Architecture Note
This project relies on Supabase for the database, authentication, and backend server actions. Ensure you have the `012_academic_intelligence_studio.sql` migration and preceding schemas applied to your database instance before accessing the `/admin` OS.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
