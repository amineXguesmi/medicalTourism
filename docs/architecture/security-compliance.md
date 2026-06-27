# Security and Compliance Baseline

## Non-Negotiable MVP Controls

- MFA for clinic, admin, support and DPO roles.
- Granular consent for document upload, AI analysis, clinic sharing and medication follow-up.
- Role-based access control with purpose checks for sensitive data.
- Append-only audit logs for document access, admin access, consent changes, AI processing and payments.
- Encryption in transit and at rest.
- Object storage encryption with managed keys.
- No card data stored by the platform.
- No patient medical data used for marketing.
- No AI training on patient documents by default.

## Health Data Handling

Health data is special category data under GDPR/UK GDPR. Engineering work must preserve:

- data minimisation,
- explicit and revocable consent where used,
- retention limits,
- export and correction flows,
- deletion or deletion-request handling,
- breach and incident workflow,
- vendor processing records,
- international transfer checks.

## AI Safety Controls

- Show AI limitations before summary generation.
- Log prompt version, model/provider, input document references and output version.
- Include source citations for clinical facts.
- Surface uncertainty, contradictions and unreadable sections.
- Require patient review before sharing.
- Keep medical decisions with qualified professionals.

## Operational Controls

- Separate development, staging and production.
- Use anonymised or synthetic medical data outside production.
- Require justified support access to documents.
- Block mass document download by default.
- Add security tests before handling real patient documents.

