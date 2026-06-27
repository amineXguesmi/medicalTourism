# Marketplace API

The first marketplace API layer is public read-only data for procedure discovery, verified clinic browsing and comparison-ready clinic offers. It intentionally excludes patient-specific data, quote requests and medical documents.

## Public Endpoints

```text
GET /api/v1/procedures
GET /api/v1/procedures/specialties
GET /api/v1/procedures/:slug

GET /api/v1/clinics
GET /api/v1/clinics/:id
GET /api/v1/clinics/:id/procedures

GET /api/v1/search/offers
GET /api/v1/search/compare
```

## Search Examples

```text
GET /api/v1/search/offers?procedureSlug=dental-implant&countryCode=ES&sort=total_asc
GET /api/v1/search/offers?q=dental&maxPriceCents=200000
GET /api/v1/search/compare?offerIds=<offer-id-1>,<offer-id-2>
```

## Response Principles

- Only verified and published clinics are exposed.
- Prices include currency and included/excluded items.
- Total cost is marked as an estimate.
- Travel estimates are transparent: flight, hotel and transfer are separate.
- Comparison is limited to four offers to match the MVP requirement.

## Mobile UX Usage

The mobile app should use these APIs for:

- procedure search home,
- clinic results,
- clinic comparison,
- total cost preview,
- document requirements checklist before quote request.

Patient-specific quote request and document sharing must use protected APIs in later modules.

