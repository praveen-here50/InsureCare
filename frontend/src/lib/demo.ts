// Demo site (unless NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false): the sign-in page lists the demo accounts, and upload forms
// warn that anyone can open the site, so no real documents should go in.
export const DEMO_SITE = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS !== "false";
