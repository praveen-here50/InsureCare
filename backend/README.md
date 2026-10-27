# InsureCare backend

Spring Boot 3 (Java 25) REST API on PostgreSQL, with live updates over WebSocket. It serves all three portals from one database: the hospital desk, the insurer's claims team and the patient.

## Run it

You need **Java 25** and **PostgreSQL 16** (or Docker).

```bash
# Option A: Docker runs the database and the API
docker compose up -d                 # from the repository root

# Option B: database in Docker (or a local PostgreSQL), API from source
docker compose up -d postgres
cd backend
./mvnw spring-boot:run               # Windows: mvnw.cmd spring-boot:run
```

The API listens on http://localhost:8080. On first start, Flyway creates the schema (`src/main/resources/db/migration`) and `seed.json` fills the empty database with the demo hospital, insurer and member.

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/insurecare` | JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `insurecare` / `insurecare` | Database login |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Browser origins allowed to call the API and open the socket (comma-separated) |
| `SEED_DATA` | `true` | Load `seed.json` into an empty database |
| `PORT` | `8080` | HTTP port |

To start over with fresh demo data, drop and recreate the `insurecare` database.

## How live updates work

Every change runs in a transaction that publishes a `Change` event. After the commit, `LiveUpdates` pushes `{topic, message, at}` to every browser connected to `ws://localhost:8080/live`. Each portal shows the message as a toast and re-reads its page data, so a decision made in one portal appears in the others within a moment.

## API

| Method | Path | Used by |
|---|---|---|
| GET | `/api/hospitals/{id}/workspace` | Hospital portal: wards, beds, services, patients |
| PATCH | `/api/hospitals/{id}/beds/{label}` `{status}` | Change a bed: `available`, `reserved`, `occupied` |
| PATCH | `/api/hospitals/{id}/patients/{member}/documents/{position}` `{status}` | Verify a patient document |
| POST | `/api/hospitals/{id}/patients/{member}/share` | Send verified documents to the insurer; opens a claim if none is open |
| GET | `/api/insurer` | Insurer portal: network hospitals, policyholders, claims |
| POST | `/api/insurer/claims/{id}/decision` `{action, note?, amount?}` | `approve`, `query`, `reject`, `settle` |
| GET | `/api/members/{member}/portal` | Patient portal: claims, policies, schemes, hospitals, documents |
| POST | `/api/members/{member}/documents` (multipart `file`, `name`, `category`) | Upload to the document vault (PDF/JPG/PNG, 10 MB max) |
| DELETE | `/api/members/{member}/documents/{docId}` | Remove a document |
| GET | `/api/documents/{docId}/file` | Download a stored file |

Errors are returned as RFC 7807 problem details. Two people changing the same claim at once get `409 Conflict` (optimistic locking).

## Not built yet

- **No authentication.** Anyone who can reach the API can read and change data. Add Spring Security with logins for hospital staff, insurer staff and members before any real use.
- One insurer (`insurecare.insurer-name`), one hospital desk and one member are shown by the portals until sign-in decides who is looking.
