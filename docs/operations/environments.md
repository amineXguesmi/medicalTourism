# Environments

## Local

Purpose: developer productivity with fake or synthetic data only.

- Local PostgreSQL.
- Local Redis.
- Local S3-compatible storage such as MinIO.
- Mock payment provider.
- Mock video provider.
- AI provider disabled or using synthetic documents.

## Staging

Purpose: production-like testing without real patient files unless explicitly approved.

- Managed PostgreSQL.
- Managed Redis.
- Encrypted object storage.
- PSP sandbox.
- Video provider sandbox.
- Synthetic or anonymised medical documents.
- Security headers and audit logs enabled.

## Production

Purpose: real clinic and patient workflows.

- Separate cloud account/project.
- Encrypted managed database and object storage.
- Key management service.
- Backups and restore tests.
- Monitoring, alerting and incident workflow.
- DPO export and deletion request tools.
- Vendor contracts and data processing agreements in place.

