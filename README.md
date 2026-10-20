# Sakalam Overland

A website for **Sakalam Overland** ([@nysakalamoverland](https://www.instagram.com/nysakalamoverland/)), a Filipino-founded community of overlanders and hikers in New York.

> **sa·ka·lam** (adj.), Filipino slang: *malakas* (strong) read backwards. Tough, solid, hard to stop.

## What's inside

| Area | Highlights |
|---|---|
| **Home** | A calm, typographic hero over still topographic contour lines, with a hand-drawn, embossed SAKALAM New York vanity plate bolted to a slowly turning beadlock spare. Also the word origin plus Baybayin script, core values, a trail conditions board |
| **Page headers** | Each inner page has a Three.js relief tile: a floating topographic map rendered with custom shaders, themed per page (event pins, a gold route, campsite markers under stars, a moving convoy) |
| **Events** | Filter by type and open spots, grouped by month. Detail pages have an RSVP form (validation, waitlist, duplicate check), an `.ics` calendar export and directions |
| **Trails** | Status, permits, gear and an interactive **elevation profile chart** (crosshair tooltip, keyboard stepping, table view). The **Rig Matcher** sorts trails by your build and experience |
| **Campsites** | Access level, fees, amenities, directions, and a pack checklist styled as a backpack that saves progress on the device |
| **Community** | Story, rig showcase, a "Trail Tagalog" glossary, merch, a join form and FAQ |
| **Brand** | A living style guide covering palette tokens, type, logo marks, icons and the banig pattern |

### Design system
- **Palette** (from the brand board), with Tagalog token names: `puti` #FFFFFF, `dahon` #61AB73, `gubat` #183B22, `uling` #272928, `itim` #000000, plus `araw` #F6B81A (taken from the logo's sun and used only as an accent).
- **Themes:** Araw (day) and Gabi (night). The toggle is a rig's headlights: switch them on for night mode. Colors are theme-aware roles (`surface`, `ink`, `heading`, `deep`, …) set as CSS variables, and the choice is remembered per browser.
- **Type:** Montserrat Bold for headings, Montserrat SemiBold for sub-headings, Outfit Extra Light for body copy. Small text steps up to Light (300) so it stays readable. Noto Sans Tagalog is used for Baybayin.
- **Heritage motifs:** the eight-rayed sun and three stars, a banig (woven mat) texture, Baybayin script, and Filipino words for values and section names (*Bayanihan, Kapwa, Malasakit, Salu-salo*).
- The section icons and logos are the original Figma/Photoshop assets.

## Stack

- **Client:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Three.js (custom GLSL), hand-built SVG illustration and charts
- **API:** Node.js, Express 5, MongoDB/Mongoose, Zod validation, Helmet, rate limiting
- **Tests:** `node:test` with Supertest
- **Ops:** Docker and docker-compose (web + api + mongo), Netlify config for a static deploy

The API uses MongoDB when `MONGODB_URI` is set. Otherwise it falls back to an in-memory store. The client calls the API, and if none is reachable (for example on Netlify) it uses the bundled data from `shared/data.ts`, and forms run in demo mode. The site works anywhere.

```
client/   React app (src/pages, src/components, src/three, src/lib)
server/   Express API (store.ts = Memory + Mongo stores, app.ts = routes)
shared/   Types and seed content used by both
```

## Run it

```bash
npm install
npm run dev          # API on :4000, site on :5173 (proxied /api)
npm test             # API tests
npm run build        # typecheck + production build
```

With Docker, which runs MongoDB too:

```bash
docker compose up --build    # http://localhost:8080
```

## Adding Instagram photos

Every image slot is a `<Photo name="…">` component. It loads `client/public/photos/{name}.jpg` and draws a brand illustration until that file exists. Drop in JPGs with these names:

| File | Where it shows |
|---|---|
| `trail-convoy.jpg`, `beach-camp.jpg`, `night-camp.jpg`, `rock-crawl.jpg` | Home gallery |
| `crew-group.jpg`, `crew-food.jpg`, `crew-fire.jpg` | Community story |
| `rig-kalabaw.jpg`, `rig-jeepney.jpg`, `rig-tita-taco.jpg`, `rig-bayani.jpg`, `rig-lumpia.jpg`, `rig-adobo.jpg` | Rig showcase |
| `camp-moose-river-roadside.jpg`, `camp-godfrey-bridge.jpg`, `camp-rausch-creek-camp.jpg`, `camp-woodland-valley.jpg`, `camp-smith-point-outer.jpg` | Campsites |
| `merch-trucker-hat.jpg`, `merch-crew-hoodie.jpg`, `merch-trail-tee.jpg`, `merch-custom-hoodie.jpg` | Merch |

## Content note

Events, rigs and member names are **sample content** for the design. Trails and campsites are real places, but conditions, permits and fees are illustrative. Check with land managers before you go.

---

Designed and built by Jessie Yang. UX research (persona: "Caden, the weekend off-roader"), the brand board, the icon set and the type spec drove the information architecture and the features: trustworthy trail intel, rides matched to experience level, and mobile-first event details.
