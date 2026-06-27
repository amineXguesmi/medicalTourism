# API Strategy

## Primary API

Use REST with OpenAPI for the MVP. REST maps cleanly to mobile and web clients, is easy to document, and gives us generated client contracts for Flutter and TypeScript.

## Real-Time Channels

Use WebSockets only where they are clearly needed:

- secure messaging updates,
- video consultation presence,
- notification delivery hints.

All sensitive reads still go through authenticated API access checks.

## Contract Rules

- Backend DTOs are the source of truth.
- Generate OpenAPI from backend decorators.
- Generate TypeScript client types for `apps/web`.
- Generate Dart API models later for `apps/mobile`.
- Never expose internal database models directly.
- Include correlation IDs on every request.
- Version breaking API changes.

## Initial Route Groups

```text
/auth
/users
/patients
/procedures
/clinics
/search
/cost-estimates
/documents
/ai-summaries
/quote-requests
/quotes
/bookings
/conversations
/video-consultations
/payments
/medications
/post-op
/consents
/audit
/admin
/support
/compliance
```

