# Repository Structure

## Root

```text
.
  apps/
  packages/
  docs/
  infra/
  package.json
  pnpm-workspace.yaml
```

The repository is organized as a monorepo. Node-based apps and packages use `npm` workspaces; Flutter remains in `apps/mobile` with its own Dart tooling.

## Mobile App

```text
apps/mobile/
  lib/
    app/                 App bootstrap, routing shell and dependency setup
    core/                API client, auth, config, errors, storage, security
    features/            Patient-facing feature modules
    shared/              Reusable widgets and theme
  test/
```

Each Flutter feature should use a feature-first structure:

```text
feature_name/
  data/
  domain/
  presentation/
  application/
```

## Web App

```text
apps/web/
  src/
    app/
      (public)/          Public pages and patient-facing web flows
      (auth)/            Login, MFA and account recovery
      (patient)/         Optional patient web workspace
      (clinic)/          Clinic portal
      (admin)/           Admin, support and DPO back-office
    components/          Shared UI components
    features/            Domain-specific UI modules
    lib/                 API client, auth, config and security helpers
    styles/
  tests/
```

## Backend

```text
apps/backend/
  src/
    common/              Cross-cutting auth, guards, validation, logging
    modules/             Domain modules
    jobs/                Queue processors and scheduled tasks
    events/              Internal domain events
  prisma/
    schema.prisma        Initial data model
    migrations/
  test/
```

Backend modules should not import each other casually. Shared behavior goes through explicit services, events or small interfaces.

## Shared Packages

```text
packages/
  api-contracts/         OpenAPI-generated clients and DTO contracts
  shared-types/          Shared non-sensitive TypeScript types
  config/                Shared lint, tsconfig and env helpers
  ui-tokens/             Design tokens for web and mobile parity
```

## Infrastructure

```text
infra/
  docker/                Local PostgreSQL, Redis and object storage
  terraform/             Cloud infrastructure later
  kubernetes/            Runtime manifests later
  scripts/               Operational scripts
```
