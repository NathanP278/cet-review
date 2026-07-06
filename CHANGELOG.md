# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite integration (Vitest) configured.
- GitHub Actions CI/CD Pipeline.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, and `DEPLOYMENT.md` community files.

## [0.1.0] - 2026-07-06

### Added
- Initial MVP Launch.
- Spaced Repetition (SM-2) Algorithm implementation for Flashcards.
- Complete Mock Exam testing suite.
- Supabase Authentication and Database configurations.
- Analytics dashboard and weakest-topic identification tracking.

### Changed
- Converted Client Components in dashboard to Server Components for Vercel Edge Optimization.
- Refactored `proxy.ts` to enforce authentication synchronization natively in Next.js 16.

### Optimized
- Memoized high-frequency interactive grid logic to eliminate UI layout shifts.
- Implemented Batched SQL Upserts reducing HTTP overhead by 90% during flashcard review flows.
