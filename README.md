# MedTour AI Platform

Medical tourism marketplace and AI-assisted medical document workflow, based on the project requirements in [docs/product/cahier-des-charges.md](docs/product/cahier-des-charges.md).

## MVP Direction

The MVP should stay controlled and compliance-first:

- Patient mobile app in Flutter.
- Website and portals in Next.js: public search, clinic portal, admin back-office.
- Backend API in TypeScript with NestJS, designed as a modular monolith.
- PostgreSQL as the primary database.
- Redis for queues, reminders, rate limits and short-lived workflow state.
- S3-compatible encrypted object storage for medical documents.
- AI/OCR pipeline isolated behind backend jobs, with source citations, consent, validation and audit logs.
- Node packages use `npm` workspaces because `npm` is available in the local environment.

## Repository Layout

```text
apps/
  mobile/       Flutter patient app
  web/          Next.js website, clinic portal and admin portal
  backend/      NestJS API, jobs and domain modules
packages/
  api-contracts/ Shared OpenAPI/types generated from backend contracts
  shared-types/  Cross-app TypeScript types that are not domain secrets
  config/        Shared linting, formatting and environment helpers
  ui-tokens/     Design tokens shared between web and mobile
docs/
  product/       Requirements, MVP scope and backlog
  architecture/  Technical architecture and module boundaries
  decisions/     Architecture Decision Records
  compliance/    GDPR, audit, consent and clinical safety notes
  operations/    Environments and deployment notes
infra/
  docker/        Local development services
  terraform/     Cloud infrastructure later
  kubernetes/    Deployment manifests later
```

## Root Workspace Files

This repository is an `npm` workspace monorepo. The source apps still live under `apps/`, but the root files are intentional:

- `package.json`: workspace definition and shared commands.
- `package-lock.json`: shared dependency lockfile for backend, web and packages.
- `node_modules/`: local install output only; ignored by git.
- `.env`: local secrets/config only; ignored by git.
- `.env.example`: committed template for local setup.

## Quick Start

Run commands from the repository root unless a step says otherwise:

```powershell
cd C:\Users\semah\OneDrive\Bureau\amine\medicalTourism
```

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

```powershell
Copy-Item .env.example .env
```

Default local services:

```text
Backend API: http://localhost:3001/api/v1
Swagger docs: http://localhost:3001/api/docs
PostgreSQL: localhost:55432
Redis: localhost:6379
MinIO: http://localhost:9001
```

### 3. Start Local Database Services

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres redis minio
```

### 4. Prepare Backend Database

```powershell
npm run prisma:generate
npm exec --workspace=@medtour/backend -- prisma migrate deploy
npm run prisma:seed --workspace=@medtour/backend
```

Seeded demo accounts use this password:

```text
ChangeMeMvp2026!
```

Useful demo users:

```text
patient.demo@medtour.local
clinic.demo@medtour.local
admin@medtour.local
```

### 5. Run Backend

Development mode:

```powershell
npm run dev:backend
```

Production-style local mode:

```powershell
npm run build:backend
npm run start --workspace=@medtour/backend
```

Health check:

```powershell
Invoke-RestMethod http://localhost:3001/api/v1/health
```

### 6. Run Mobile App

From another terminal:

```powershell
cd apps/mobile
flutter run
```

For an Android emulator, the app defaults to `http://10.0.2.2:3001/api/v1`.

For Windows desktop builds, run:

```powershell
flutter run --dart-define=MEDTOUR_API_BASE_URL=http://localhost:3001/api/v1
```

Use the mobile app flow:

1. Tap `Login`.
2. Tap `Use demo patient`.
3. Select clinic offers.
4. Tap `Quote`.
5. Accept anti-bypass terms.
6. Submit the quote request.

Note: live mobile API calls are currently intended for Android/desktop. Flutter web falls back to sample marketplace data until a browser transport is added.

## Validation

Backend:

```powershell
npm run build:backend
npm test --workspace=@medtour/backend
```

Mobile:

```powershell
cd apps/mobile
dart format lib test
flutter analyze
flutter test
```

## What Not To Push

The `.gitignore` excludes local/generated files such as:

- `node_modules/`
- `.env`
- `.runtime/`
- backend `dist/`
- Flutter `.dart_tool/` and `build/`
- platform build caches

Commit the root `package-lock.json` and the Flutter app `apps/mobile/pubspec.lock` so installs are reproducible.

## Key Architecture Docs

- [MVP scope](docs/product/mvp-scope.md)
- [MVP backlog](docs/product/backlog-mvp.md)
- [System overview](docs/architecture/overview.md)
- [Backend foundation](docs/architecture/backend-foundation.md)
- [Repository structure](docs/architecture/repository-structure.md)
- [Marketplace API](docs/architecture/marketplace-api.md)
- [Quote requests API](docs/architecture/quote-requests-api.md)
- [Mobile design system](docs/architecture/mobile-design-system.md)
- [Domain modules](docs/architecture/domain-modules.md)
- [Data model](docs/architecture/data-model.md)
- [Security and compliance](docs/architecture/security-compliance.md)
- [API strategy](docs/architecture/api-strategy.md)
- [ADR 0001 - stack](docs/decisions/ADR-0001-stack.md)

## Build Order

1. Backend foundations: auth, roles, consent, audit, users, patient profile.
2. Product catalogue and verified clinic publishing.
3. Search, comparison and total-cost estimation.
4. Document vault, OCR pipeline and AI summary review.
5. Quote requests, masked messaging and video consultation.
6. Deposit payment and booking workflow.
7. Medication tracking, reminders and post-op journal.
8. Admin and DPO controls across every sensitive action.

The project should not ship real medical-data functionality until consent, audit logging, access control and encryption decisions are implemented end to end.
