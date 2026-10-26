# InsureCare enterprise UI

A responsive frontend prototype for three insurance operations workspaces: members, hospitals and insurers. It includes dashboards, policy and claim records, hospital directories, document flows, search, notifications and responsive route navigation.

## Run locally

Requirements: Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Choose a member area from the home page; hospital and insurer workspaces are linked in the footer. Use the profile menu to switch between workspaces. On desktop, the sidebar toggle collapses navigation. On small screens, use the menu button or bottom navigation.

## Notes

This is a frontend-only demonstration. Records are sample data and actions do not connect to insurance, hospital or identity systems. Medical photography is loaded from Unsplash and needs a network connection. Replace it with approved, licensed brand photography before commercial release. No external claims, payments, or policy updates are submitted.

