# Mobile App

Flutter patient application.

## Responsibility

- Patient onboarding and consent.
- Procedure search and clinic comparison.
- Document upload and AI summary review.
- Quote requests and patient-clinic messaging.
- Booking status, medication reminders and post-op journal.
- Privacy settings, export and deletion request entry points.

## Folder Architecture

```text
lib/
  app/                 App bootstrap, router and dependency setup
  core/
    api/               REST client and generated API bindings
    auth/              Token/session handling
    config/            Environment configuration
    errors/            Error mapping and user-safe failures
    routing/           Route definitions and guards
    security/          Secure display, redaction helpers
    storage/           Secure local storage adapters
  features/
    auth/
    onboarding/
    procedures/
    clinics/
    comparison/
    cost_calculator/
    documents/
    ai_summary/
    quotes/
    messaging/
    video_consultation/
    bookings/
    medication/
    post_op/
    privacy/
  shared/
    theme/
    widgets/
test/
```

Each feature should use `data`, `domain`, `application` and `presentation` subfolders once implementation starts.

