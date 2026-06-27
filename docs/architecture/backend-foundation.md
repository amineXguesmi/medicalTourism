# Backend Foundation

## Implemented First

The backend now starts with the modules that every regulated workflow depends on:

- `health`: confirms the API is alive.
- `auth`: patient registration and login token issuing.
- `users`: user creation and private lookup for authentication.
- `consents`: grant, list and revoke consent records.
- `audit`: append audit events for account, login and consent actions.
- `JwtAuthGuard`: protects routes by default with bearer tokens.
- `RolesGuard`: enforces role metadata where routes require it.
- `CurrentUser`: exposes the authenticated actor to controllers.
- User/consent ownership checks: patients can access their own resources; admin, support and DPO can access user resources for platform duties.

## Next Backend Layer

Before building documents, AI summaries, payments or messaging, add:

- MFA flow for clinic/admin/support/DPO roles.
- Request metadata capture for audit logs: IP hash, user agent and correlation ID.
- Integration tests around registration, login, consent revocation and audit creation.
- Rate limiting for auth endpoints.
- Password reset and email verification.
- Clinic/admin invitation flow.

## Why This Order Matters

The cahier des charges makes consent, auditability and health-data access control central product requirements. Document upload or AI summarization should not exist before the platform can prove who acted, why they acted and which consent allowed it.
