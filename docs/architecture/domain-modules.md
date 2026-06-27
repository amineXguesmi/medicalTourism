# Backend Domain Modules

## Module Map

| Module | Purpose |
|---|---|
| `auth` | Login, sessions, MFA, SSO later |
| `users` | User identity, roles and account lifecycle |
| `patients` | Patient profile, preferences, medical profile metadata |
| `clinics` | Clinic profiles, verification, contracts and publishing |
| `doctors` | Doctor verification and clinic membership |
| `procedures` | Procedure catalogue, specialties and medical disclaimers |
| `search` | Clinic/procedure search, filters and comparisons |
| `cost-estimation` | Procedure, travel, hotel and transfer estimates |
| `documents` | Medical document metadata, storage, sharing and access checks |
| `ai-documents` | OCR, summarization, citations, validation and AI audit |
| `quotes` | Quote requests, additional document requests and quote generation |
| `bookings` | Accepted quotes, schedule and procedure calendar |
| `communications` | Masked messaging and moderation hooks |
| `video-consultations` | Platform-controlled video sessions and access links |
| `payments` | Deposits, booking fees, commission, receipts and refunds |
| `medications` | Medication plans, reminders, adherence and interaction checks |
| `post-op` | Recovery journal, clinic protocol and alerts |
| `consents` | Granular consent ledger and revocation |
| `audit` | Immutable audit trail for sensitive actions |
| `notifications` | Push, email, SMS and in-app notifications |
| `admin` | Back-office workflows and platform operations |
| `support` | Support cases, escalation and justified access |
| `compliance` | DPO exports, retention, deletion requests and incident records |

## Boundary Rules

- `documents` must call `consents` before granting access.
- `ai-documents` must never process a patient file without AI-analysis consent.
- `communications` masks commercial contact data but must preserve safety-critical medical text.
- `payments` must store provider references, not card details.
- `audit` receives append-only events from every sensitive module.
- `admin` can orchestrate workflows but should not own medical or payment business logic.

