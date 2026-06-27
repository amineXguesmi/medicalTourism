# Backend API

NestJS backend, initially built as a modular monolith.

## Responsibility

- Authentication, roles and MFA.
- Consent enforcement and audit logging.
- Clinic, doctor, procedure and quote workflows.
- Document vault metadata, storage access and sharing.
- AI/OCR job orchestration.
- Messaging, video consultation and notification flows.
- Payment provider orchestration.
- Admin, support and DPO workflows.

## Folder Architecture

```text
src/
  common/
    auth/
    config/
    database/
    decorators/
    filters/
    guards/
    interceptors/
    logging/
    security/
    validation/
  modules/
    auth/
    users/
    patients/
    clinics/
    doctors/
    procedures/
    search/
    cost-estimation/
    documents/
    ai-documents/
    quotes/
    bookings/
    communications/
    video-consultations/
    payments/
    medications/
    post-op/
    consents/
    audit/
    notifications/
    admin/
    support/
    compliance/
  jobs/
  events/
prisma/
  schema.prisma
  migrations/
test/
```

## First Implementation Rule

Build `auth`, `users`, `consents` and `audit` before any document or AI feature. Otherwise the core product risk is upside down.

