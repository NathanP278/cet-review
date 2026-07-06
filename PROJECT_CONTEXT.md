# Project Context — UPCAT Prep

## Project Summary

A Next.js + Supabase UPCAT exam prep platform powered by the SM-2 Spaced Repetition algorithm. Targets Filipino senior high school students.

## Architecture Overview

- **Frontend**: Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui.
- **Backend/DB**: Supabase (PostgreSQL, Auth, PostgREST).
- **Deployment**: Vercel.

## Folder Structure

- `/app`: Next.js App Router pages and layouts.
- `/components/ui`: Reusable dumb/presentational components (shadcn/ui style).
- `/components/domain`: Domain-specific components (e.g., Flashcard, ReadinessRing).
- `/lib`: Utilities, Supabase client setup, SM-2 engine.
- `/types`: TypeScript interfaces (including Supabase DB types).

## Coding Conventions

- Strictly typed TypeScript.
- Prettier for formatting (2 spaces, double quotes for JSX, printWidth 100).
- Tailwind v4 for styling.

## Milestones

- [x] **M0**: Project Scaffolding & Foundation
- [ ] **M1**: Database Schema & Supabase Setup
- [ ] **M2**: Authentication
- [ ] **M3**: Shell Layout, Navigation & Design System
- [ ] **M4**: Question Bank & Subject/Topic Pages
- [ ] **M5**: SM-2 Spaced Repetition Engine
- [ ] **M6**: Daily Review Session (Flashcard Flow)
- [ ] **M7**: Practice Quizzes
- [ ] **M8**: Dashboard
- [ ] **M9**: Mock Exam Engine
- [ ] **M10**: Analytics Dashboard
- [ ] **M11**: Settings Page
- [ ] **M12**: Landing Page
- [ ] **M13**: Polish, Accessibility & Performance
