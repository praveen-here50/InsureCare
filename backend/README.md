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
| `SEED_DATA` | `true` | Load `seed.json` into an empty database, and create the demo sign-in accounts when there are none |
| `DEMO_PASSWORD` | `insurecare` | Password of every demo account |
| `SESSION_COOKIE_SECURE` | `false` | Send the session cookie over HTTPS only; set `true` when the portals are served over HTTPS |
| `PORT` | `8080` | HTTP port |
| `VERIFIER_URL` | `http://localhost:8000` | Document verifier (`verifier/`): OCR and the AI-image model. Blank turns those checks off; the other checks still run |
| `GROQ_API_KEY` | (blank) | Turns on Ask InsureCare, the patient assistant (free key from console.groq.com). Blank leaves it off (the endpoint answers 503) |
| `ASSISTANT_MODEL` | `openai/gpt-oss-120b` | Model the assistant uses (must be one your Groq key lists at `/openai/v1/models`) |
| `ASSISTANT_URL` | `https://api.groq.com/openai/v1` | Any OpenAI-compatible chat API (Groq, a local Ollama at `http://localhost:11434/v1`, ...) |

To start over with fresh demo data, drop and recreate the `insurecare` database.

## Sign-in

Everyone signs in: patients with their member ID, hospital desk staff and insurer claims officers with their work email. Sessions live on the server (8 hours); the browser only holds the `INSURECARE_SESSION` cookie, which is `HttpOnly` and `SameSite=Lax`. Passwords are stored as BCrypt hashes in the `account` table.

Each account sees only its own data, checked on every request (`auth/SecurityConfig`):

| Account | Can reach |
|---|---|
| Patient | `/api/members/{their member}/**` and their own vault files |
| Hospital staff | `/api/hospitals/{their hospital}/**` and files uploaded for their hospital's admissions |
| Insurer claims officer | `/api/insurer/**` and hospital files that are part of one of this insurer's claims |

Anything else is refused (`401` signed out, `403` wrong account; a file that isn't yours is `404`, so file numbers can't be probed). The live-updates socket needs a signed-in session too. There are no CSRF tokens: the SameSite cookie isn't sent with another site's POST, PATCH or DELETE.

With `SEED_DATA`, the first start creates demo accounts, all with `DEMO_PASSWORD`: every member (e.g. `IC-7842`, Priya Raman), `rukmini.rajan@adyarcommunity.example` (Adyar Community admissions desk) and `arun.prakash@careplus.example` (CarePlus claims officer).

## How live updates work

Every change runs in a transaction that publishes a `Change` event. After the commit, `LiveUpdates` pushes `{topic, message, at}` to every browser connected to `ws://localhost:8080/live`. Each portal shows the message as a toast and re-reads its page data, so a decision made in one portal appears in the others within a moment.

## Document checks

When the hospital uploads a file for a claim document, `checks/CheckRunner` examines it in the background and stores a grade (**Passed**, **Needs review** or **High risk**), a 0-100 risk score and the findings behind it. The insurer sees them on the claim; the hospital only sees that its file was checked. Everything runs on this machine with free, open-source tools: no document leaves it.

| Check | How |
|---|---|
| Made with AI | IPTC "trained algorithmic media" in content credentials (C2PA) or XMP, AI tool names in metadata, Stable Diffusion settings; for photos and scans, an AI-image classifier (`haywoodsloan/ai-image-detector-deploy`, Apache-2.0) in the verifier |
| Edited | Design tools (Photoshop, Canva, GIMP...) or PDF editors in the metadata, PDF revisions saved after the original, modified long after it was created, error level analysis on JPEGs |
| Copied | The identical file (SHA-256), or the same page (256-bit perceptual hash) with nearly the same wording (85%+ word overlap), uploaded for another patient |
| Content | Text from the PDF or OCR (Tesseract, English + Tamil) compared with the claim: patient name, member or policy number, hospital name, dates against the admission and today, bill total against the estimate |

These are warning signs, not proof: the claims officer opens the file and decides. Checks interrupted by a restart resume on startup, and "Check again" re-runs them (for example after the verifier was down).

The verifier (`verifier/`, Python) is its own container because OCR and the image model need their own libraries. Its first `docker compose build` downloads about 2 GB (PyTorch for CPU and the 780 MB model) and takes several minutes; after that it starts offline.

## API

| Method | Path | Used by |
|---|---|---|
| POST | `/api/auth/login` `{username, password}` | Sign in; sets the session cookie and returns who signed in |
| GET | `/api/auth/me` | Who is signed in: name, portal (`patient`, `hospital`, `insurer`) and their member or hospital; `401` when nobody is |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/hospitals/{id}/workspace` | Hospital portal: wards, beds, services, patients |
| PATCH | `/api/hospitals/{id}/beds/{label}` `{status}` | Change a bed: `available`, `reserved`, `occupied` |
| PATCH | `/api/hospitals/{id}/patients/{member}/documents/{position}` `{status}` | Verify a patient document |
| POST | `/api/hospitals/{id}/patients/{member}/share` | Send verified documents to the insurer; opens a claim if none is open |
| GET | `/api/insurer` | Insurer portal: network hospitals, policyholders, claims |
| POST | `/api/insurer/claims/{id}/decision` `{action, note?, amount?}` | `approve`, `query`, `reject`, `settle` |
| GET | `/api/members/{member}/portal` | Patient portal: claims, policies, schemes, hospitals, documents |
| POST | `/api/members/{member}/assistant` `{messages: [{role, text}]}` | Ask InsureCare: answers the last question from the member's live records (policies, claims, schemes, hospital stays, medical history, document text), streamed as plain text while it is written; the last line may be `Source: <record>`. Errors before the first word come back as problem JSON |
| POST | `/api/members/{member}/documents` (multipart `file`, `name`, `category`) | Upload to the document vault (PDF/JPG/PNG, 10 MB max) |
| DELETE | `/api/members/{member}/documents/{docId}` | Remove a document |
| GET | `/api/documents/{docId}/file` | Download a stored file |
| POST | `/api/hospitals/{id}/patients/{member}/documents/{position}/file` (multipart `file`) | Upload the file for a hospital document (PDF/JPG/PNG, 10 MB max); its checks start in the background |
| GET | `/api/document-files/{documentId}` | Open an uploaded hospital document |
| POST | `/api/document-files/{documentId}/recheck` | Run the document checks again |

Errors are returned as RFC 7807 problem details. Two people changing the same claim at once get `409 Conflict` (optimistic locking).

## Not built yet

- **Accounts are only created as demo data.** There is no sign-up, password change or reset yet, and no limit on wrong password attempts.
- One insurer per deployment (`insurecare.insurer-name`).
