# Quote Requests API

The quote request layer turns selected marketplace offers into authenticated patient requests.

## Endpoints

```text
POST /api/v1/quote-requests
GET /api/v1/quote-requests/mine
GET /api/v1/quote-requests/:id
```

All endpoints require a patient bearer token.

## Create Quote Requests

```json
{
  "offerIds": ["<clinic-procedure-offer-id>"],
  "antiBypassTermsAccepted": true,
  "patientMessage": "I can travel in August."
}
```

Rules:

- One quote request is created per selected offer.
- A patient can submit up to four selected offers in one request.
- Offers must belong to verified and published clinics.
- Anti-bypass terms are mandatory before submission.
- A patient profile is created automatically if the user does not have one yet.
- Optional patient messages are stored in the quote request conversation trail.
- Submission is audited with clinic, procedure and anti-bypass metadata.
