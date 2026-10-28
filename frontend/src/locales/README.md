# src/locales/

Translations for the patient portal and the sign-in page. English is written directly in the code; each other
language is one JSON file that maps the English text to its translation.

- `ta.json`: Tamil.
- Wrap text in `t("...")`: `useT()` in client components, `await getT()` in server components (`lib/i18n.ts`,
  `lib/i18n-server.ts`). Values go in placeholders: `t("Renews {date}", { date })`.
- Text without an entry shows in English, so a missing translation never breaks a page.
- Entries with placeholders also translate text the backend sends already filled in, e.g. `"Approved amount: {amount}."`.
- The language is remembered in the `insurecare-lang` cookie (Settings, or the switch on the sign-in page).
- Hospital and insurer portals, record contents typed by staff, and the assistant stay in English for now.
- Changing an English text in the code changes its key: update the entry here too.
