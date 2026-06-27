# ADR 0001 - MVP Stack

Date: 2026-06-25

## Status

Accepted for MVP foundation.

## Context

The platform handles sensitive health data, clinic workflows, payments, AI document processing, audit logs and EU/UK compliance obligations. The first version should be secure, understandable and fast to iterate. Premature microservices would add operational risk before the product boundaries are proven.

## Decision

- Mobile: Flutter.
- Website and portals: Next.js using the App Router.
- Backend: TypeScript with NestJS as a modular monolith.
- Database: PostgreSQL.
- ORM/migrations: Prisma, with raw SQL where security, reporting or performance require it.
- Queue/cache: Redis.
- Object storage: S3-compatible encrypted storage.
- API style: REST plus generated OpenAPI contracts.
- AI/OCR: isolated backend job pipeline; Python worker can be added later if AI processing becomes too specialized for Node.

## Why This Fits

- Flutter gives one mobile codebase for iOS and Android.
- Next.js is strong for public pages, authenticated portals and server-rendered web workflows.
- NestJS provides a structured TypeScript backend with modules, guards, validation, OpenAPI support, queues and WebSocket support.
- PostgreSQL is a strong relational fit for consent, audit, payments, workflow state and reporting.
- Prisma improves developer speed and type safety while still allowing raw SQL for critical paths.

## Consequences

- The team can share TypeScript models between web, backend and contracts.
- Backend modules must be kept strict to avoid a large tangled application.
- AI-heavy work may later move to a Python worker without changing the public API.
- Compliance controls must be built into the core modules from the beginning.

## References

- NestJS documentation: https://docs.nestjs.com/
- Next.js App Router documentation: https://nextjs.org/docs/app
- Flutter architecture guide: https://docs.flutter.dev/app-architecture
- PostgreSQL row-level security documentation: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Prisma ORM documentation: https://www.prisma.io/docs/orm

