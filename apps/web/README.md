# Web App

Next.js application for the public website, clinic portal and admin back-office.

## Responsibility

- Public procedure and clinic search.
- Public clinic/procedure content with disclaimers.
- Patient web workspace where useful.
- Clinic request dashboard and quote workflow.
- Admin verification, moderation, audit and DPO tools.

## Folder Architecture

```text
src/
  app/
    (public)/          Public pages
    (auth)/            Login, MFA and recovery
    (patient)/         Patient web area
    (clinic)/          Clinic portal
    (admin)/           Admin/support/DPO portal
  components/          Shared UI components
  features/
    auth/
    procedures/
    clinics/
    comparison/
    documents/
    quotes/
    messaging/
    payments/
    admin/
    compliance/
  lib/
    api/               Generated API client and fetch wrappers
    auth/              Session helpers and guards
    config/            Environment parsing
    security/          Redaction, headers and safe rendering helpers
  styles/
tests/
```

Web must not bypass backend permission checks. Server components can improve performance, but all sensitive data still needs backend authorization and audit.

