# Jyovix Marketing — Client Panel (Mobile)

A production-ready **Angular 20 + Ionic 8** mobile app, scaffolded from the
`marketos-client-panel.html` prototype. UI only — no backend / API calls are
wired in. All data lives in `MockDataService` as Angular signals so you can
swap it for real HTTP calls later without touching a single template.

Built with Capacitor so it ships to iOS and Android from the same codebase,
plus runs as a normal responsive web app during development.

## Features

- **8 full screens**: Dashboard, Brand Brief, Calendar, Approvals, Campaigns,
  Leads, Reports, Settings — matching the prototype's information and flows.
- **Dark & light themes**, toggleable from any page header or Settings, with
  a `system` option that follows the device. Preference persists to
  `localStorage`. Built on CSS custom properties (`--mk-*`) mapped onto
  Ionic's own `--ion-*` tokens, so native Ionic components theme automatically.
- **Motion system** (`src/global.scss`): staggered card entrances, animated
  KPI count-up, shimmer skeleton loaders, pulse-glow badges, an animated
  theme-toggle icon, smooth progress-bar fills, pull-to-refresh, and Ionic's
  native page-transition / modal / toast animations.
- **Standalone components everywhere** (no NgModules), lazy-loaded routes,
  Angular signals for state, the new `@if` / `@for` control-flow syntax.
- A reusable **shared component kit**: KPI card, score pill, status tag,
  empty state, section header, theme toggle.

## Project structure

```
src/
├─ app/
│  ├─ app.component.ts        Root shell — side menu + router outlet
│  ├─ app.config.ts           Standalone bootstrap providers
│  ├─ app.routes.ts           Lazy-loaded route table
│  ├─ core/
│  │  ├─ models/              Shared TypeScript interfaces
│  │  └─ services/            ThemeService · ToastService · MockDataService
│  ├─ shared/components/      KPI card, score pill, tag, empty state, etc.
│  └─ features/               One folder per screen (page + template + styles)
├─ theme/variables.scss       Light + dark design tokens
├─ global.scss                Typography, primitives, motion system
└─ environments/               dev / prod environment stubs
```

Path aliases are set up in `tsconfig.json`: `@core/*`, `@shared/*`, `@app/*`,
`@env/*`.

## Getting started

```bash
npm install
npm start          # ng serve -o — runs in the browser at http://localhost:4200
```

### Build

```bash
npm run build       # production build → ./www
```

### Run on a device / simulator (Capacitor)

```bash
npx cap add ios          # first time only
npx cap add android       # first time only

npm run cap:ios           # build + sync + open Xcode
npm run cap:android       # build + sync + open Android Studio
```

## Wiring up real data later

Every screen reads from `MockDataService` (`src/app/core/services/mock-data.service.ts`)
via signals — `data.kpis()`, `data.leads()`, `data.approvals()`, etc. — and
calls its mutation methods (`decide()`, `toggleCampaign()`, `connectAccount()`…)
instead of touching component state directly. To go live:

1. Replace the seeded `signal([...])` values with calls into a new
   `ApiService` (e.g. via `httpResource()` or `toSignal(http.get(...))`).
2. Keep the same method names/signatures on `MockDataService` (or extract an
   interface) so no template changes are required.
3. Add `provideHttpClient()` to `app.config.ts`.

## Notes

- App icon / favicon are simple generated placeholders in `src/assets/icon/`
  — swap them for real brand assets before shipping.
- `capacitor.config.ts` sets the app id to `com.jyovix.marketos` — change
  this before your first native build.
- Linting uses `@angular-eslint`; run `npm run lint`.
