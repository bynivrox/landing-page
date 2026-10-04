# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Nivrox marketing site. **This repository is public**: never add secrets, internal specs, customer data, private URLs or code from the private repositories. It is one of three repositories in the `bynivrox` organization:

| Repository | Visibility | What |
|---|---|---|
| `bynivrox/topology-manager` | private | The product: API, web app, Go agent, E2E suite, specs (local `docs/`) |
| `bynivrox/management-center` | private | Vendor tool; serves the hosted-plan prices at `GET /api/public/pricing` |
| `bynivrox/landing-page` | public | This repository |

Clone them side by side (repository names as folder names). The product's `aspire run` then starts this site on :3200.

## Commands

Requires Node 24 with pnpm.

```sh
pnpm dev | pnpm typecheck | pnpm lint | pnpm build | pnpm test   # vitest, src/**/*.test.ts
```

This is Next.js 16. Read `node_modules/next/dist/docs/` before using Next APIs.

## Tests that read the product

`plans.test.ts` (plans vs `LicensePlans`) and `integrations.test.ts` (claims vs node registry, generators, agent adapters) read the private product repository through `src/lib/product-source.ts`: a `topology-manager` checkout next to this one, or `NIVROX_PRODUCT_DIR`. Without it they are skipped (as on a public CI runner), so run them locally before changing plans or integrations.

## How it is built

- A separate static Next.js 16 app (Tailwind 4, `motion`), built to the landing page spec and the product positioning (both in the product repository's local `docs/`, which are never published). No database, no auth. `APP_URL` (Sign in; the product's Aspire passes the web endpoint) and `CONTACT_URL` (Contact sales) come from the environment; nothing invents URLs, customers or statistics. Demo data is labelled "example data", and unbuilt capabilities are marked (drift detection: "in development").
- Design tokens live only in `src/app/globals.css` (`--brand`, `--brand-deep`, `--sky`, `--surface`, `--border`, semantic `--success/--warning/--error`, ...). Pages are dark where they start (hero) and end (closing card) and light in between: `.theme-light` / `.theme-dark` redefine the same tokens, so every component works on both. Sections carry `data-theme`, and the framed navigation (`Navigation.tsx`) takes the palette of the section beneath it and shows scroll progress. Fonts are Space Grotesk and JetBrains Mono (as nivrox.be). The logo is the official wordmark in `public/brand/nivrox-logo.svg` (`Logo` in `primitives.tsx`; inverted on light); never recreate it as text.
- **Motion language**: headlines resolve letter by letter out of a blur (`BlurText`, accessible name = plain text); the hero is swept by brand-blue light that dissolves into the light page (`.fade-to-light`, `.haze-from-hero`, eased stops so there is no edge); isometric illustrations are SVG built from `lib/iso.ts` (tested projection helpers): the hero scene (`HeroTopology`: the reference topology as wireframe-glass machines on a dot floor, rising in turn, with a packet running the WireGuard tunnel until the Checkmk container answers; deliberately Nivrox-specific, not a generic slab), and line drawings that draw themselves in view (`IsoIllustrations`). Everything respects `prefers-reduced-motion` (`MotionConfig reducedMotion="user"` in the layout).
- Pinned, scroll-driven sections: Workflow (Discover → Verify) and Simulation (packet + layer-by-layer trace, replayable, with a "Firewall blocks" scenario).
- Never build a review copy into a folder that is not gitignored: Tailwind scans every non-ignored file and breaks on compiled output. Use `NEXT_DIST_DIR=.next-e2e`.
- `src/lib/generated.ts` holds real generator output for the reference topology, and the simulation copy matches the simulator's wording; regenerate rather than hand-edit when generators change.
- **Pricing page** (`app/pricing`): Community is self-hosted and free; Professional, Business and Enterprise are hosted by Nivrox (Nivrox cloud); only Enterprise is "Contact sales". Tiers, limits and features in `lib/plans.ts` mirror `LicensePlans`, and `plans.test.ts` reads the product's `License.cs` to fail when they drift (see Tests below). Prices come from the management center repository (`lib/pricing-source.ts`: `MANAGEMENT_URL`, cached `PRICING_REVALIDATE` seconds, default 60; defaults when unreachable). A USD/EUR switch (`components/pricing/currency.tsx`, remembered in localStorage, EUR for European time zones) applies to cards and comparison. Plan cards share grid rows (`grid-rows-subgrid`) so buttons line up. Links: `SIGNUP_URL` (hosted plans; also "Start your free trial", one month of Business, in the navigation, hero and closing card), `SELF_HOST_URL` (Community), `CONTACT_URL` (Enterprise). Unbuilt features (GitOps, high availability) are marked.
- **Integrations page** (`app/integrations`): what each integration does today (Model / Simulate / Generate / Deploy / Discover, built or partial with a note) and what is planned (from init.md and the positioning). Data in `lib/integrations.ts`; `integrations.test.ts` fails when a claim outruns the product (resource types in the node registry, generator classes, agent adapters). Update it when an integration ships.
- Navigation and footer live in the root layout; section links are absolute (`/#workflow`) so they work from every page.
- **E2E**: lives in the product repository (`tests/E2E/specs/landing-page.spec.ts`), which builds this site on :3399 with live prices from the E2E management center when both are checked out next to it; the vendor spec changes a price in the management center and checks the pricing page.
