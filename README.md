# Omaha Concrete Lift — OmahaConcreteLift.com

**Omaha Concrete Lift is an independent referral and lead-generation website.**
It is **not** a contractor and does not perform concrete leveling, mudjacking,
or polyjacking work itself. The site connects Omaha-metro homeowners with
independent, local concrete leveling contractors by collecting a short quote
request form and (in a real deployment) routing that lead to contractors who
serve the requester's area. See `/referral-disclosure`, `/about`, and
`/how-it-works` on the running site for the full disclosure language.

## Tech stack

- Node.js 20+ / Express (server-rendered HTML, no frontend framework/build step)
- SQLite via `better-sqlite3` for durable lead storage
- Plain CSS (`public/css/main.css`) and vanilla JS (`public/js/main.js`) — no
  external JS dependencies or CDN scripts beyond an optional Google Fonts
  (`Inter`) stylesheet link.

## Running locally

```bash
npm install
npm start
```

The server listens on `http://localhost:3000` by default (binds to `0.0.0.0`).
Override the port with the `PORT` environment variable, e.g.:

```bash
PORT=3010 npm start
```

## Environment variables

| Variable         | Default              | Purpose                                                             |
|------------------|-----------------------|----------------------------------------------------------------------|
| `PORT`           | `3000`                | Port the HTTP server listens on (Coolify convention).                |
| `LEADS_DB_PATH`  | `./data/leads.db`     | Filesystem path to the SQLite database file used to store leads.     |

## How leads are captured, stored, and logged

- The full quote form lives on `/contact`; condensed variants (or CTA anchors
  pointing at the same form) appear on each service page.
- `POST /api/quote` validates required fields server-side (`name`, `phone`,
  `email`, `service_type`, `zip_or_city`, and `consent === true`).
- A hidden **honeypot** field (`website`) traps automated submissions: if it's
  filled in, the endpoint returns a normal-looking `200 { ok: true }` response
  and **silently discards** the submission — nothing is stored, no error is
  shown.
- Genuinely valid submissions are inserted into a SQLite database at the path
  given by `LEADS_DB_PATH` (defaults to `./data/leads.db`), using
  `better-sqlite3`. Each row stores: `id`, `created_at`, `name`, `phone`,
  `email`, `service_type`, `zip_or_city`, `description`,
  `preferred_contact_method`, `consent_text_version`, `consent_timestamp`,
  `source_ip`, `user_agent`.
- A basic in-memory, per-IP rate limiter (~5 requests/minute/IP) protects the
  endpoint since no CAPTCHA service is configured.
- On every successful insert, the server logs a single line to stdout:
  `NEW LEAD: id=<id> service_type="<type>" zip_or_city="<zip_or_city>"` — this
  intentionally **omits full phone numbers and email addresses** so raw PII
  doesn't end up in Coolify's application logs.

### Persistence on Coolify

Because this runs as a container, **the SQLite file must live on a mounted
volume** or it will be lost on redeploy/restart. In the Coolify UI, add a
persistent volume mount for this service at:

```
/app/data
```

(This matches the `LEADS_DB_PATH=/app/data/leads.db` default baked into the
Dockerfile's `ENV`.) If you need a different path, set `LEADS_DB_PATH`
accordingly and mount the volume at that directory instead.

## Docker

Build and run the container manually to verify it works exactly as it will
in Coolify:

```bash
docker build -t omaha-concrete-lift .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e LEADS_DB_PATH=/app/data/leads.db \
  -v "$(pwd)/data:/app/data" \
  omaha-concrete-lift
```

Then visit `http://localhost:3000`.

For local-only convenience there's also a `docker-compose.yml` (not required
by Coolify, which builds directly from the `Dockerfile`):

```bash
docker compose up --build
```

## Project structure

```
server.js                 Express app: routes, /api/quote, sitemap/robots, 404
src/lib/layout.js          Shared HTML layout (header/nav/footer/mobile CTA bar)
src/lib/pageBuilder.js     Hero/body-section/FAQ-accordion/CTA-band renderers
src/lib/quoteForm.js       Quote form markup (full + condensed variants)
src/lib/schema.js          JSON-LD schema builders (WebSite/Organization/FAQPage/
                           BreadcrumbList/WebPage/AboutPage/ContactPage/ItemList)
src/lib/links.js           Rewrites content-JSON internal links to real routes
src/lib/db.js              better-sqlite3 setup + lead insert/count helpers
src/lib/rateLimiter.js     In-memory per-IP rate limiter
src/lib/content.js         Loads content/site-content.json
content/site-content.json  All page copy (verbatim source of truth)
public/css/main.css        Full design system (tokens, components, a11y)
public/js/main.js          Hamburger menu, FAQ accordion, form validation/submit
data/                      SQLite database directory (gitignored; mount volume here)
```

## Content source of truth

All page copy (`h1`, `hero_subhead`, `body_sections`, CTAs, SEO metadata, the
quote form field spec, and the JSON-LD schema plan) is defined in
`content/site-content.json` and rendered verbatim by the server — no page
copy is duplicated or hand-edited into the templates.

## Schema.org / SEO notes

- `WebSite` + `Organization` on the homepage.
- `FAQPage` (with exact Q&A text) on `/faq`.
- `BreadcrumbList` on every subpage.
- `WebPage` / `AboutPage` / `ContactPage` on legal/about/contact pages.
- **Never** `LocalBusiness`, `GeneralContractor`, `AggregateRating`, or
  `Review` schema anywhere — this is a referral site, not a contractor, and
  has no first-party reviews of its own work.
