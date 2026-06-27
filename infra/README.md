# Infrastructure

Infrastructure starts minimal and local-first.

```text
docker/       Local PostgreSQL, Redis and object storage
terraform/    Cloud resources after provider selection
kubernetes/   Deployment manifests later
scripts/      Operational helpers
```

Production infrastructure should not be finalized until hosting region, data residency, payment provider, video provider and AI provider are legally reviewed.

