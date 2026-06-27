# Data Model

## Primary Storage Choices

- PostgreSQL stores transactional records, metadata, consent state and audit metadata.
- Encrypted object storage stores documents, original OCR artifacts and generated summary files.
- Redis stores queues, reminder schedules, rate-limit counters and temporary tokens.

## Core Entities

| Entity | Notes |
|---|---|
| `User` | Login identity, roles, MFA, account status |
| `PatientProfile` | Patient preferences and high-level medical profile |
| `Clinic` | Verified provider profile, publishing status, country |
| `Doctor` | Professional identity and right-to-practise verification |
| `Procedure` | Catalogue entry, specialty, disclaimers and optional medical codes |
| `ClinicProcedure` | Clinic-specific price, availability and included/excluded items |
| `MedicalDocument` | File metadata, storage pointer, OCR status and classification |
| `DocumentShare` | Explicit clinic access grant tied to consent and purpose |
| `MedicalSummary` | AI output, citations, validation status and version |
| `QuoteRequest` | Patient request to one clinic for one procedure |
| `Quote` | Clinic offer, validity, conditions, included/excluded items |
| `Booking` | Accepted quote, payment status and planned treatment dates |
| `Conversation` | Secure patient-clinic messaging workspace |
| `Message` | Masked body, sender, moderation metadata and timestamps |
| `VideoConsultation` | Controlled video link and attendance state |
| `MedicationPlan` | Medication, dose, frequency, duration and instructions |
| `MedicationLog` | Taken, missed, postponed or side-effect records |
| `PostOpProtocol` | Clinic-defined recovery follow-up plan |
| `PostOpEntry` | Patient journal entry, symptoms, photos and alerts |
| `Consent` | Granular consent, purpose, legal basis, grant/revoke timestamps |
| `AuditLog` | Actor, action, resource, purpose, reason and request metadata |
| `Payment` | Provider transaction reference, amount, commission and receipt |

## Sensitive Data Rules

- Never store raw medical document text in general-purpose logs.
- Store document content outside the relational database.
- Store OCR text and AI summaries as sensitive health data.
- Encrypt data in transit and at rest.
- Use purpose-bound access checks for every document and summary read.
- Make audit logs append-only from the application perspective.

## Search Strategy

For MVP, use PostgreSQL indexes and full-text search for procedures and clinics. Add a dedicated search engine later only if ranking, multilingual search, typo tolerance or analytics require it.

