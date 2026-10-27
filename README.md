# InsureCare

> Rural and affordable healthcare & health-insurance platform.

**Status:** Working prototype. Next.js portals (patient, hospital, insurer) backed by a Spring Boot API and PostgreSQL, with live updates. No authentication yet.

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

`frontend/` and `backend/` are implemented; `ai/` and `infrastructure/` are still planned.

---

## Technology Direction

| Layer       | Stack (planned)     | Rationale                                   |
|-------------|---------------------|---------------------------------------------|
| Frontend    | Next.js, TypeScript | SSR + SPA; strong ecosystem for healthcare UIs |
| Backend     | Java 25+, Spring Boot 3.x, JPA / Hibernate | Mature, transaction-safe, audit-logging built-in |
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

## Getting Started

```bash
# 1. Database, document verifier and API (needs Docker; see backend/README.md to run without it)
docker compose up -d

# 2. Portals
cd frontend
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

Open the patient, hospital and insurer portals in separate tabs: a change in one (for example, approving a claim) appears in the others straight away. See [backend/README.md](backend/README.md) for the API and configuration.

---

## License

Proprietary — internal use. License to be determined.