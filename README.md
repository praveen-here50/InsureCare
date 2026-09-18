# InsureCare

> Rural and affordable healthcare & health-insurance platform.

**Status:** Scaffolding phase — empty module directories exist; no application code has been written.

---

## Purpose

InsureCare aims to bridge the gap between rural patients, healthcare providers, insurance carriers, and government health schemes through a unified digital platform. The core goals are:

- **Patients** — discover hospitals, manage insurance enrollment, track claims, and access tele-consultation.
- **Hospitals** — register services, submit claims, reconcile payments, and manage patient admissions digitally.
- **Insurers & Schemes** — onboard beneficiary lists, adjudicate claims, disburse payments, and generate program analytics.

---

## High-Level Architecture (Planned)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│     AI       │
│ (Next.js)    │◀────│ (Spring Boot)│◀────│ (Python)     │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  PostgreSQL  │
                     └──────────────┘
```

- **Frontend** — Next.js SPA serving patients, hospital staff, and insurer dashboards.
- **Backend** — Spring Boot REST API handling auth, business workflows, and data persistence.
- **AI** — Python-based risk scoring, fraud detection, claim anomaly detection, and NLP for unstructured medical records.
- **Infrastructure** — Docker Compose for local dev; Helm charts / Terraform for production deployment.

---

## Repository Structure

```
InsureCare/
├── frontend/         # Next.js / Node.js application (planned)
├── backend/          # Java / Spring Boot application (planned)
├── ai/               # Python / ML components (planned)
├── infrastructure/   # Docker, Kubernetes, Terraform configs (planned)
├── docs/             # Architecture decisions, API specs, design docs
├── .gitignore        # Polyglot gitignore for the monorepo
├── docker-compose.yml     # Multi-service local development setup
└── README.md
```

All `frontend/`, `backend/`, `ai/`, and `infrastructure/` directories are currently **empty** — they represent the intended module boundaries and will be populated as each component is implemented.

---

## Technology Direction

| Layer       | Stack (planned)     | Rationale                                   |
|-------------|---------------------|---------------------------------------------|
| Frontend    | Next.js, TypeScript | SSR + SPA; strong ecosystem for healthcare UIs |
| Backend     | Java 21+, Spring Boot 3.x, JPA / Hibernate | Mature, transaction-safe, audit-logging built-in |
| Database    | PostgreSQL          | Relational integrity for claims & financial data |
| AI / ML     | Python 3.14, scikit-learn / PyTorch | Rich ML ecosystem for risk & anomaly models |
| Container   | Docker, Docker Compose | Consistent local dev; path to K8s deployment |
| CI          | GitHub Actions      | Lint, type-check, test, build per component |

Exact versions and dependencies will be pinned as each module is scaffolded.

---

## Development Principles

1. **Zero-defect:** Root-cause-driven fixes; test-first for new features.
2. **Minimal & modular:** Keep the codebase lean; extract shared logic early.
3. **Type-safe:** TypeScript on the frontend, strict typing on the backend, typed Python where feasible.
4. **CI-gated:** Every push runs linting, type-checking, and tests before merge.
5. **Documented:** Architecture Decision Records (ADRs) in `docs/` for significant choices.

---

## Getting Started (Future)

Once the first service is scaffolded:

```bash
# Clone the repo
git clone https://github.com/your-org/insurecare.git

# Start all services
cd InsureCare
docker compose up -d
```

Individual service setup instructions (e.g., `npm install` for the frontend, Maven/Gradle for the backend) will be documented in each module directory.

---

## License

Proprietary — internal use. License to be determined.