OMAHA CONCRETE LIFT — BUILD & DEPLOYMENT STATUS
Generated: 2026-09-14 (America/Chicago)
Live site: https://omahaconcretelift.com/  (and https://www.omahaconcretelift.com/)

================================================================
1. WHAT THIS SITE IS
================================================================
OmahaConcreteLift.com is an independent, transparent referral / lead-generation
website for Omaha, NE concrete leveling (concrete lifting, mudjacking,
polyjacking, driveway / sidewalk / patio / garage-slab leveling). It is NOT a
contractor. It does not claim a contractor license, does not display or
invent customer reviews/testimonials, does not fabricate a business street
address, and does not operate or claim a Google Business Profile. Every page
carries an explicit "we are a referral service, not a contractor" disclosure,
reinforced independently on /about, /how-it-works, and the standalone
/referral-disclosure page. This is enforced structurally: the JSON-LD schema
on every page is restricted to WebSite / Organization / FAQPage /
BreadcrumbList / WebPage — LocalBusiness, GeneralContractor, AggregateRating,
and Review schema are explicitly banned in code (src/lib/schema.js) and were
verified absent site-wide by direct grep and live HTML fetch.

================================================================
2. SOURCE / REPO
================================================================
GitHub repo:      https://github.com/twoolley23/omaha-concrete-lift
Visibility:        public
Default branch:    main
Latest commit:      9eada71229321511a9783867a3be22ff9337790a
                     "Add curl to Docker image for Coolify container healthcheck"
Prior commit:        e6047a30374a54f1d278dac66a095a9a34df98be
                     "Initial OmahaConcreteLift.com site: pages, quote form, SEO/schema, Dockerfile"
Local working copy: /home/hermes/work/omaha-concrete-lift (on this host)
Content source of truth (also committed into repo at content/site-content.json):
                     /home/hermes/omaha_concrete_lift_content.json

Stack: Node.js 20 + Express, server-rendered HTML (no build step, no
front-end framework), better-sqlite3 for lead storage, vanilla CSS
(public/css/main.css) and vanilla JS (public/js/main.js, <3KB, no
dependencies). Dockerfile is node:20-alpine + curl (curl added specifically
so Coolify's container healthcheck can pass), runs as a non-root `appuser`.

================================================================
3. DEPLOYMENT (COOLIFY)
================================================================
Coolify instance:   https://coolify.pipelinearchitect.systems
Server:              "localhost" (uuid fxv2fstlgpn6vy4ow9kdfitn) — the same
                     Coolify host already used for other twoolley23 apps
                     (public IP 46.202.176.242)
Project:             "Omaha Concrete Lift" (project uuid ia3pxh1u5a422te2odpkkrlg)
Environment:         production (uuid s9krchtyul46zeoz3cu5fexn)
Application:         omaha-concrete-lift (app uuid uvfp5858ptg3slfa2knzezl8)
Build pack:          dockerfile (repo's own Dockerfile, not a buildpack)
Exposed port:        3000 (container) — app reads PORT env var, defaults 3000
Domains configured:  https://omahaconcretelift.com, https://www.omahaconcretelift.com
Force HTTPS:         enabled
Health check:        GET / on port 3000, HTTP method GET, expects 200
Current app status (at verification time): running:healthy
Persistent volume:   named Docker volume
                     "uvfp5858ptg3slfa2knzezl8-omaha-concrete-lift-leads-data"
                     mounted at /app/data inside the container (storage uuid
                     u72ngpa75qaf0690w7s47ifi). This is what makes lead
                     capture durable across redeploys/restarts — the SQLite
                     file at /app/data/leads.db lives on this named volume,
                     not in the container's writable layer.
Auto-deploy:         enabled (is_auto_deploy_enabled=true) — a future push to
                     main will redeploy automatically via Coolify's git polling
                     /webhook, no separate action needed for future changes.

Deployment history relevant to this build:
  - First deploy (commit e6047a3) FAILED health check only because the
    node:20-alpine base image had no curl/wget binary for Coolify's
    container-internal healthcheck to use (app itself was already up and
    serving on port 3000 in the container logs). Fixed by adding
    `RUN apk add --no-cache curl` to the Dockerfile (commit 9eada71).
  - Second deploy (commit 9eada71) → status: finished, container
    running:healthy.
  - A subsequent manual restart (deployment y13o49v40lc7e4b605894b0k) was
    triggered specifically to verify restart-safety; the app returned to
    running:healthy and a lead submitted AFTER the restart was accepted and
    logged normally, confirming the container and its attached volume come
    back up correctly after a restart.

================================================================
4. DNS / CLOUDFLARE
================================================================
Registrar:           Namecheap (domain omahaconcretelift.com, already owned
                     by the account; WhoisGuard on)
Nameservers:          changed from Namecheap default
                     (dns1/dns2.registrar-servers.com) to Cloudflare's
                     elly.ns.cloudflare.com / remy.ns.cloudflare.com
                     — this is a registrar-level, approval-gated operation
                     per orchestrator/INTEGRATION_POLICY.md; proceeded under
                     the owner's explicit pre-authorization for this build
                     and DNS routing.
Cloudflare zone:      omahaconcretelift.com, zone id
                     31810edc7643b15f9ce6cbe457b7d89b, plan: Free,
                     status: active (activation-check run and confirmed
                     "Zone verified!")
DNS records created (both proxied — orange cloud — through Cloudflare):
  A     omahaconcretelift.com      -> 46.202.176.242   (proxied, TTL auto)
  CNAME www.omahaconcretelift.com  -> omahaconcretelift.com (proxied, TTL auto)
Zone settings:
  SSL/TLS mode:        Full (matches how the existing clearofferproperties.com
                     zone on the same account/origin is configured; origin
                     serves Traefik's cert, Cloudflare terminates edge TLS)
  Always Use HTTPS:    on
  Universal SSL:       enabled, Let's Encrypt CA — edge certificate issuance
                     completed during this session (verified live HTTPS
                     response after a short propagation delay)
No paid Cloudflare products were used — Free plan only, no Workers, no
purchased add-ons.

================================================================
5. LIVE VERIFICATION PERFORMED (this session, against production)
================================================================
DNS:
  - dig NS omahaconcretelift.com @1.1.1.1 and @8.8.8.8 both return
    elly.ns.cloudflare.com / remy.ns.cloudflare.com
  - dig A omahaconcretelift.com and www.omahaconcretelift.com both resolve to
    Cloudflare anycast IPs (104.21.x.x / 172.67.x.x)

HTTPS / redirects:
  - http://omahaconcretelift.com/  -> 301 -> https://omahaconcretelift.com/
  - https://omahaconcretelift.com/ -> 200, HTTP/2, served via Cloudflare
    (server: cloudflare header), no self-signed-cert warning to clients
  - https://www.omahaconcretelift.com/ -> 200

Pages (all returned HTTP 200 over HTTPS on the live domain):
  /  /faq  /services/mudjacking  /services/polyjacking
  /services/driveway-leveling  /services/sidewalk-leveling
  /services/patio-leveling  /services/garage-slab-leveling
  /service-areas  /how-it-works  /about  /contact
  /privacy  /terms  /referral-disclosure

404 handling:
  - https://omahaconcretelift.com/this-page-does-not-exist-xyz -> real
    HTTP 404 (not a soft-404), renders the site's friendly 404 page copy.

Metadata / SEO / schema (checked on live HTML):
  - Home page <title> = "Omaha Concrete Lift | Free Concrete Leveling Quotes
    in Omaha, NE"; correct per-page <title>/<meta description> confirmed;
    <link rel="canonical"> present on all sampled pages; viewport meta tag
    present (mobile-first).
  - WebSite + Organization JSON-LD present on home page.
  - FAQPage JSON-LD present on /faq, mirrors the visible Q&A copy.
  - Confirmed ABSENT anywhere on the live site: LocalBusiness,
    GeneralContractor, AggregateRating, Review schema types.
  - /sitemap.xml -> 200, lists every real page with lastmod/changefreq/priority.
  - /robots.txt -> 200, "Allow: /" for all user-agents, references the
    sitemap; no accidental noindex.

Lead capture (tested live against the production endpoint):
  - POST /api/quote with a full valid payload (name, phone, email,
    service_type, zip_or_city, description, consent:true) -> 200 {"ok":true}
    and a "NEW LEAD: id=... service_type=... zip_or_city=..." line appeared
    in the live Coolify application logs (full phone/email deliberately
    NOT logged, per design).
  - POST /api/quote with the honeypot field filled -> 200 {"ok":true}
    (looks identical to a real success to deter bots) but nothing was
    persisted/logged as a real lead.
  - POST /api/quote missing a required field (email) -> HTTP 400
    {"ok":false,"error":"Please enter a valid email address."}
  - Restart-safety: after a manual Coolify container restart, the app came
    back running:healthy and a fresh lead submitted immediately afterward
    was accepted and logged normally — the SQLite file lives on the
    attached persistent Docker volume (/app/data), not the container's
    ephemeral layer, so it survives restarts/redeploys.
  - NOTE: three test/QA leads (clearly test data — names like "QA Test
    Lead", "QA Restart-Check Lead", emails at example.com) were submitted
    to the LIVE production endpoint during this verification pass, in
    addition to one submitted by the build agent during pre-push local
    testing (that one was in a local file, not committed/pushed to
    production). These are harmless placeholder rows and can be deleted by
    the owner at will (see Section 7) — no real homeowner data was
    submitted or exists in this database as of this report.

Rate limiting: verified in local pre-deploy testing (better-sqlite3-backed
in-memory limiter, ~5 req/min/IP) — not re-hammered against production to
avoid degrading the live health check during this verification pass.

================================================================
6. WHERE LEADS GO TODAY (IMPORTANT LIMITATION)
================================================================
There is currently NO email/SMS/webhook/CRM integration wired up to receive
leads in real time. Leads are durably stored in the SQLite database at
/app/data/leads.db (Coolify-mounted persistent volume) and every successful
insert is also written to stdout, which appears in Coolify's live
application logs (Application -> Logs in the Coolify dashboard, or via the
API: GET /api/v1/applications/{uuid}/logs).

This means: nothing is lost, but nobody is automatically notified today.
The owner (or a future task) needs to either:
  (a) periodically check the Coolify application logs / query the SQLite
      file directly, or
  (b) wire up an outbound notification (email via an SMTP credential,
      Telegram via the existing Hermes Telegram integration, or a webhook
      to a CRM) so new leads trigger a real-time alert.
This was flagged rather than silently worked around, per the no-fabrication
rule — no email/SMS credential was invented or assumed.

================================================================
7. HOW TO INSPECT / EXPORT / CLEAR LEADS
================================================================
Via Coolify UI: Application "omaha-concrete-lift" -> Terminal (Coolify
provides a container terminal in its dashboard), then:
  sqlite3 /app/data/leads.db "SELECT * FROM leads ORDER BY created_at DESC;"

Via Coolify API (from this host, using the canonical credential file
/home/hermes/hermes-business-os/orchestrator/secrets/coolify.env):
  GET  /api/v1/applications/uvfp5858ptg3slfa2knzezl8/logs   (recent stdout,
       includes "NEW LEAD: id=..." lines)
There is no direct "run arbitrary SQL" API endpoint exposed by Coolify for
this app; use the container terminal in the Coolify UI, or add a small
authenticated admin route to the app in a future iteration if remote
programmatic export is needed.

To delete the 3-4 QA test rows described in Section 5: open the container
terminal in Coolify and run, e.g.:
  sqlite3 /app/data/leads.db "DELETE FROM leads WHERE email LIKE '%example.com%';"

================================================================
8. ROLLBACK / REDEPLOY
================================================================
Redeploy latest main (e.g. after a future code change is pushed to GitHub):
  curl -s -X POST \
    -H "Authorization: Bearer <COOLIFY_API_TOKEN>" \
    "https://coolify.pipelinearchitect.systems/api/v1/deploy?uuid=uvfp5858ptg3slfa2knzezl8"
  (auto-deploy is also enabled, so a normal `git push origin main` should
  trigger this automatically without the manual call.)

Roll back to the previous known-good commit if a future deploy breaks
something:
  1. In the git repo: `git revert <bad-commit>` or `git checkout
     e6047a3 -- .` then commit/push — OR use Coolify's built-in rollback:
     GET /api/v1/applications/uvfp5858ptg3slfa2knzezl8/rollback-images to
     list previously built images, then POST .../rollback with the desired
     image tag. Coolify keeps prior built images by default.
  2. The persistent volume (/app/data) is NOT affected by rollback/redeploy
     — lead data survives regardless of which app image is running.

Restart only (no code change), e.g. if the app becomes unresponsive:
  curl -s -X POST \
    -H "Authorization: Bearer <COOLIFY_API_TOKEN>" \
    "https://coolify.pipelinearchitect.systems/api/v1/applications/uvfp5858ptg3slfa2knzezl8/restart"

DNS rollback (only if ever needed — NOT recommended, would take the site
down): the domain's original Namecheap-default nameservers were
dns1.registrar-servers.com / dns2.registrar-servers.com. Reverting to those
would remove Cloudflare's proxy/HTTPS and require reconfiguring DNS
directly at Namecheap instead.

Local development (unchanged from README.md in the repo):
  cd omaha-concrete-lift && npm install && npm start   (PORT defaults 3000)
  Docker: docker build -t omaha-concrete-lift . && docker run -p 3000:3000
  -v $(pwd)/data:/app/data omaha-concrete-lift

================================================================
9. KNOWN LIMITATIONS / FOLLOW-UPS FOR THE OWNER
================================================================
  - No real-time lead notification channel is wired up yet (Section 6) —
    highest-priority follow-up if this site is meant to generate live
    business value immediately.
  - No CAPTCHA/third-party anti-spam service is configured (none exists in
    this environment's credential set); protection today is a honeypot
    field plus a simple in-memory per-IP rate limiter. Acceptable for
    launch, but a determined bot could still submit low volumes of junk
    leads — revisit if spam becomes a problem.
  - Hero image is a simple inline SVG placeholder, not a photographed/
    licensed stock photo, to avoid any licensing-cost or attribution risk
    without owner sign-off; swapping in a real (properly licensed, honestly
    captioned) photo is a pure content change, no code change required.
  - Google Fonts (Inter) is loaded from Google's CDN with preconnect, not
    self-hosted — a minor perf/privacy tradeoff that's easy to change later
    if desired (self-host the woff2 instead).
  - Three visually-obvious QA test rows currently sit in the production
    leads database from this session's live verification (see Section 5
    and 7 for how to remove them) — flagging explicitly rather than
    quietly deleting production data without a documented trail.
  - No uptime/alerting monitor (e.g. UptimeRobot-style) is configured for
    the new domain; Coolify's own health check will restart an unhealthy
    container but nothing pages a human if the whole host goes down.

================================================================
10. QUICK REFERENCE — ALL IDENTIFIERS
================================================================
GitHub repo:                twoolley23/omaha-concrete-lift
Latest commit SHA:          9eada71229321511a9783867a3be22ff9337790a
Coolify project uuid:        ia3pxh1u5a422te2odpkkrlg
Coolify environment uuid:    s9krchtyul46zeoz3cu5fexn
Coolify application uuid:    uvfp5858ptg3slfa2knzezl8
Coolify server uuid:         fxv2fstlgpn6vy4ow9kdfitn ("localhost", IP 46.202.176.242)
Coolify storage/volume uuid: u72ngpa75qaf0690w7s47ifi (mount: /app/data)
Cloudflare zone id:           31810edc7643b15f9ce6cbe457b7d89b
Cloudflare account:           b85a2658dfe840d5f9c78c0432115083 (Twoolley@gmail.com's Account)
Production URL:              https://omahaconcretelift.com/
www URL:                      https://www.omahaconcretelift.com/
Lead endpoint:                POST https://omahaconcretelift.com/api/quote
Lead storage path (in container): /app/data/leads.db
