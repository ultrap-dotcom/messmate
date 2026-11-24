# MessMate

Your food. Your choice. Every day. A discovery platform for nearby messes and their daily menus (not a delivery app).

This is the exact design and behaviour of the MessMate prototype, split into normal files. It is a static site: no build step and no runtime dependencies.

## Folder structure

```
messmate-site/
├── index.html          Entry page. Loads fonts, CSS and scripts in order.
├── css/styles.css      Whole design system: tokens, light/dark theme, components.
├── js/
│   ├── data.js         MOCK DATA + `api` object + freshness logic. Replace this with a backend.
│   ├── ui.js           Helpers, navbar, footer, mess card, Home page.
│   ├── explore.js      Explore (search + filters), Today's Menu, About, Mess details.
│   ├── owner.js        Demo login, dashboard shell, Mess Admin (owner) dashboard.
│   └── admin-router.js Platform Admin panel and the hash router (#home, #explore, #mess/ID ...).
├── package.json        Scripts for local dev (`npm run dev`).
├── vercel.json         Vercel settings (static site, security headers).
└── .gitignore
```

Scripts are plain (non-module) files and must load in the order shown in `index.html`.

## Run locally in VS Code

1. Install Node.js (LTS) from nodejs.org and VS Code.
2. Open the `messmate-site` folder in VS Code (File > Open Folder).
3. Open the terminal (Ctrl+`) and run `npm run dev`. Open http://localhost:3000.
   Alternative with no Node: install the "Live Server" extension, right-click `index.html`, choose "Open with Live Server".
4. Edit any file and refresh the browser.

## Deploy to Vercel

1. Push the folder to a GitHub repository.
2. On vercel.com choose Add New > Project, import the repo.
3. Framework Preset: Other. Build command: leave empty. Output directory: leave empty (root).
4. Deploy. Add your domain under Project > Settings > Domains and set the DNS records Vercel shows.
Or with the CLI: `npx vercel` then `npx vercel --prod`.

## Roles (unchanged)

- **Public student**: browse and search, no account.
- **Mess Admin (owner)**: `#owner`. Can edit only their own mess (`state.session.mess`): profile, prices, today's menu, weekly menu, preview.
- **Platform Admin**: `#admin`. Approves/rejects messes, edits/removes listings, manages owners, sees platform stats.

The two roles are separate sessions and routes. Opening `#owner` or `#admin` without the matching demo session redirects to `#login`.

## What is mock or simulated today

| Feature | Current state |
|---|---|
| Mess listings, menus, prices, owners | Hard-coded arrays in `js/data.js`. |
| All edits (profile, menu, weekly menu, approvals, removals, owner toggles) | Held in memory only. Lost on reload. Visible to one browser only. |
| Login | Fake. Any password works. The role is chosen from a dropdown. The ownership and role checks run in the browser, so anyone can bypass them. Not secure. |
| "Confirmed today" / freshness | Computed from the `updated` timestamp in the mock data. |
| Listing views, searches, bar chart on dashboards | Sample numbers. |
| Distance | Fixed numbers, not computed from the student's location. |
| Registration of a new mess | No sign-up form exists yet. The "pending" item is sample data. |
| Food images | Emoji on tinted tiles. No photos or uploads. |
| Directions | Real Google Maps link built from the address (works without an API key). |

## What you need before a public launch

1. **Database** (PostgreSQL recommended; Supabase, Neon or Vercel Postgres): tables `users`, `messes` (with owner_id, status, lat/lng, walk-in flag), `meal_prices`, `meal_timings`, `menu_items` (mess, meal, name, veg flag, date), `weekly_menus`, `menu_publications` (published_at, confirmed_at), `audit_log`. Add image storage (Supabase Storage / Cloudflare R2) for photos.
2. **Authentication**: real accounts (Supabase Auth, Clerk, Auth0 or Auth.js) with email verification and password reset. Students stay anonymous.
3. **Authorization on the server**: roles `owner` and `platform_admin` stored on the user. Every write checks that an owner edits only their own mess. With Supabase, enforce this using Row Level Security policies; otherwise do it in API routes. Never rely on browser checks.
4. **API**: replace each function in the `api` object in `data.js` (list, get, plus write calls for owner and admin actions) with `fetch` calls to Vercel Serverless Functions or Supabase. The screens already call `api` and `messes` in one place, but the owner/admin screens currently mutate the arrays directly, so those writes need to be routed through new `api.*` functions.
5. **Server-side time**: set `updated` and `confirmed` timestamps on the server when an owner publishes, so freshness labels cannot be faked.
6. **Search**: for a handful of messes the current filtering is fine. For many, move dish/area search and distance sorting to the database (Postgres full text search, PostGIS or lat/lng with the browser Geolocation API).
7. **Mess registration and approval flow**: public sign-up form, email notifications to admin and owner on approval.
8. **Safety and compliance**: rate limiting, input validation, HTTPS (Vercel provides it), privacy policy and terms, error logging (Sentry), analytics, backups.
9. **Real numbers for dashboards**: store listing views and searches.
10. **Optional**: Google Maps/Places for address autocomplete and distance, photo moderation.

## Notes

- Fonts load from Google Fonts. Everything else is local.
- The hash router (`#explore`, `#mess/annapurna`) needs no server rewrites, so deep links work on any static host. Moving to path URLs later would need a framework such as Next.js.
