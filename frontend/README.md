# InsureCare portals

Next.js 16 app with the patient, hospital and insurer portals and the sign-in page. It talks to the backend (`../backend`): the browser calls this site's `/api`, which Next.js forwards to the backend, so the sign-in cookie stays first-party.

## Run locally

Requirements: Node.js 20.9 or newer, and the backend running (see the main README).

```bash
cp .env.example .env.local
npm install
npm run dev                       # http://localhost:3000
npm run dev -- --hostname 0.0.0.0 # also reachable from a phone on the same Wi-Fi
```

## Where things are

| Path | What |
|---|---|
| `src/app/login` | Sign-in page |
| `src/app/patient`, `hospital`, `insurer` | The three portals; each layout requires the right kind of account |
| `src/proxy.ts` | Sends signed-out visitors to the sign-in page |
| `src/lib/session.ts`, `server-api.ts` | Who is signed in; backend reads as the visitor (server components) |
| `src/lib/i18n.ts`, `src/locales/ta.json` | Tamil translations (see `src/locales/README.md`) |
| `src/app/*/notes.ts` | Notifications worked out from each account's live data |

## Notes

Records are demo data. Photos are loaded from Unsplash and need a network connection; replace them with licensed photography before a public launch.
