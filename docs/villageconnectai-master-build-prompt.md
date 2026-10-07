# VillageConnectAI — Master Build Prompt

Use this as the product and implementation brief for VillageConnectAI. Build the product in small, usable stages. Do not attempt every long-term module in one release, and do not add features only to make the application larger.

## Role

Act as a senior product designer, security-minded full-stack engineer, and practical rural product partner. Extend the existing VillageConnectAI project rather than creating a competing second app. Before changing infrastructure, inspect the current app and preserve working features and data.

## Product mission

Build **digital infrastructure for villages** that helps residents get practical things done: find local help, earn and sell, understand useful public information, and coordinate safely with their own and nearby villages.

This is not a generic social network and not simply an online marketplace. Every feature must solve a real village task. Prioritize usefulness, trust, low-bandwidth access, simple language, and clear next steps over engagement metrics.

## Think from the resident's daily life

Design around these real jobs:

- A resident needs an electrician, plumber, mechanic, transport, farm labor, a tutor, or a nearby shop.
- A farmer needs a tractor or harvester, seasonal workers, seeds or fertilizer, a nearby produce buyer, or a safe explanation of a government scheme.
- A family needs timely water, electricity, road, health-camp, or emergency information.
- A local worker or small business needs nearby customers and a trustworthy way to describe their service.
- A seller needs to list local produce or goods and let interested people contact them.
- A resident who types slowly or is unfamiliar with apps needs obvious choices, short labels, large controls, and a path that works on a weak connection.

For each workflow, answer: “What does this person need to do next, and what information do they need to do it safely?” Do not add likes, followers, endless scrolling, public popularity scores, in-app payments, delivery logistics, or complex chat unless a specific resident job requires them.

## Product scope and sequence

Treat these as the destination, not as a demand to ship every module at once.

### First useful release

1. **Village and identity foundation:** resident sign-in, profile, home village, and clear switching between the home village and read-only browsing of nearby villages.
2. **Local directory:** searchable services and workers, with practical categories such as home repair, mechanics, transport, labor, tutoring, shops, farm equipment, farm labor, inputs, and produce buyers.
3. **Useful village information:** local updates and notices with source, village, date, and clear status.
4. **Safe publishing:** village-scoped creation permissions, reports, moderation, and the community-confirmation flow described below.
5. **Simple contact:** phone, WhatsApp, or an external provider link only when the listing owner has supplied and verified it. Do not invent provider names, phone numbers, addresses, eligibility, prices, or availability.

### Next, when the core is reliable

- A modest local marketplace for produce and goods: title, category, price, description, village, seller, contact, expiry, and report action. Start with discovery and direct contact; do not build checkout or delivery operations without evidence they are needed.
- Local business and worker profiles, service availability, and a straightforward update flow.
- Events, lost-and-found, and non-emergency public notices if residents need them.
- Nearby-village browsing with the active village always visible.

### Later, only with trusted data and appropriate setup

- AI assistance for resource search, agriculture, translations, and government-scheme information.
- Voice input and voice-friendly answers.
- Map and place search integrations.

Keep unconfigured integrations out of the critical path. Show a useful search or manual village-selection alternative when a map or AI provider is unavailable.

## People, villages, and permissions

Support these roles without exposing privileged controls to residents:

- **Resident:** browse directory and public information, save listings, submit updates and listings within their home-village permissions, report harmful or incorrect content, and verify eligible updates.
- **Local provider/seller:** maintain their own service or product details, subject to village rules and moderation.
- **Moderator:** review reports, handle suspicious content, and use documented exceptions.
- **Administrator:** manage villages, categories, moderator roles, emergency publishers, and audit records.

Every account has one `home_village_id`. A resident may temporarily choose another village to browse, but that does not change their home village or grant permission to publish there. Enforce creation scope in trusted server/database logic, never only in the UI. An administrator exception must be explicit, limited, and audited.

Village selection must work without a map: searchable names and a manually confirmed village are essential. If configured, maps may improve discovery, but they must not block onboarding or core tasks.

## Community updates and verification

New ordinary community updates begin as `pending`. A normal post becomes `live` only after five unique, eligible residents verify it. The server/database—not the client—must enforce the transition and calculate the count.

### Eligibility and integrity

- A verifier must be signed in, have a verified phone number, and be eligible for the post's village under the active village policy.
- Authors cannot verify their own posts.
- Enforce one verification per `(update_id, user_id)` with a database unique constraint.
- Verify eligibility and current status inside a transaction or secure database function. Do not trust a client-supplied count, status, user ID, or village ID.
- Rate-limit submissions and verification attempts. Detect unusual bursts and repeated coordinated behavior; flag for review rather than silently counting suspicious activity.
- Keep an audit trail for status transitions, moderation, and administrative overrides.
- Tell users what “community-confirmed” means. Five votes indicate local confirmation, not official fact-checking or a guarantee of truth.

### Small-village rule

Do not blindly lower the normal five-person threshold until a single person can publish a claim. Make the policy explicit and configurable. If a village cannot supply five eligible independent voters, keep the post pending for moderator review; any reduced quorum must still require multiple independent residents plus moderator approval and must be labeled as moderator-reviewed. No user may override the rule from the client.

### Emergencies

Do not make urgent emergency information wait for five community votes. Provide a separate path for designated trusted emergency publishers or moderators to issue an immediate, clearly attributed alert with village scope, time, source, and expiry. Ordinary users may report or corroborate it; corrections and closures must be visible. Do not present an unverified resident claim as an official emergency instruction.

## Local services and listings

Make listings practical, locally scoped, and easy to contact. A service may include:

- Provider/business name and service category
- Short description in plain language
- Home village or service area
- Contact method, only when verified and supplied by the provider
- Availability, relevant timing, and optional price range when known
- Languages, accessibility, and service constraints when supplied
- Owner, creation/update time, moderation state, and report state

Provide filters and search that support everyday words such as “tractor tomorrow,” “ride to clinic,” “water pump repair,” “harvest workers,” and “sell tomatoes.” Keep structured categories alongside text search. Do not imply a listing is nearby, open, verified, or available unless the data supports that statement.

## Marketplace boundaries

The marketplace is a local discovery and contact tool, not a social feed. Sellers own their listings and can update or expire them. Buyers can search, filter, view the seller's village, and contact the seller. Include reporting and moderation. Do not invent transactions, escrow, delivery, payments, or buyer-protection guarantees.

## Government and AI safety

Never fabricate government schemes, eligibility, deadlines, official procedures, legal requirements, medical guidance, or financial claims.

- Government answers must retrieve from official or otherwise verified sources and show source title, issuing organization, link, and retrieval/update date.
- Clearly separate official information from community tips or model-generated summaries.
- If the system cannot find an authoritative source, say that it cannot verify the answer and point the resident to an official contact or source.
- Do not state eligibility as certain without the resident's relevant location and current official criteria.
- Farming advice must be cautious, location/season-aware where possible, and sourced. Do not invent pesticide, fertilizer, dosage, or safety instructions.
- Keep all model calls on the server. Validate inputs, minimize personal data sent to providers, apply appropriate rate limits, and never expose secret keys in client code.
- AI must not perform high-impact actions such as publishing posts, changing account permissions, or submitting applications without the resident's explicit review and confirmation.
- If no AI provider is configured or authorized, use ordinary directory search and say that AI assistance is unavailable. Do not pretend keyword matching is generative AI.

## Language, voice, and accessibility

Design for Telugu, Hindi, and English from the start:

- Put visible text in translation dictionaries, not scattered hard-coded strings.
- Preserve village names and user-entered listing text; do not silently overwrite it with machine translation.
- Show the original and translated content distinctly when translation is added.
- Provide simple language selection and remember it on the device/profile as appropriate.
- Add voice input only when it works reliably on supported devices and languages. Always retain a clear text-entry alternative.

Design for older smartphones, low vision, first-time smartphone users, and low digital literacy. Use readable text, strong contrast, clear labels, semantic controls, keyboard/screen-reader support, and touch targets of at least 44 CSS pixels. Prefer plain wording and icons with labels; do not rely on color alone.

## Low-bandwidth and offline behavior

- Keep initial page weight small. Lazy-load nonessential images and maps; compress uploaded images and validate file type/size.
- Use pagination or incremental loading for directories and updates. Debounce search and avoid duplicate requests.
- Cache public directory and village information with a visible “last updated” time; show stale data as stale.
- Provide explicit offline, retry, empty, loading, and success states. Never make a failed request look like “no listings.”
- Allow safe drafts where practical, but confirm votes, publication, contact changes, and other mutations with the server. Make retries idempotent to avoid duplicate posts or votes.
- Provide a list/manual-search fallback if Maps is slow or unavailable.

## Security and privacy

- Use supported phone OTP authentication; never implement local password handling or roll custom JWT/session auth.
- Protect profiles, village membership, posts, verification records, listings, uploads, AI requests, moderation actions, and administrative data.
- Enforce authorization in database policies and/or trusted server middleware for every read and write. Never trust frontend-only roles.
- Validate all inputs and uploaded files; rate-limit OTP, posting, verification, reporting, and AI endpoints.
- Store images in managed object storage with least-privilege access policies; keep only object paths and metadata in the database.
- Record privileged actions and moderation decisions in an audit log.
- Do not expose service-role keys or other secrets in source files, logs, browser bundles, or chat.
- Minimize collection and retention of phone/location data. Explain how location is used; do not publish precise home coordinates by default.

## Backend and data architecture

The supplied architecture brief requests Supabase PostgreSQL, Supabase Auth, Storage, Edge Functions, RLS, phone OTP, and Google Maps APIs. The existing Replit MVP currently uses Replit-managed PostgreSQL, and no Supabase integration is connected. Before changing providers, inspect existing data, confirm the chosen backend with the owner, verify the integration/setup path, and propose a migration plan. Do not delete or silently move the current database. Keep secrets in the workspace secrets flow, never in chat.

Keep the schema focused. Likely entities include:

- `profiles` and `villages`
- Village membership/eligibility data needed to enforce home-village scope
- `updates` and `verifications`, with the unique `(update_id, user_id)` constraint
- `services` and `products`/market listings
- `reports`, moderator roles, and audit records where required for the actual workflows
- Saved items and AI conversation data only when the implemented feature needs them

Use migrations, foreign keys, constraints, indexes for village/category/status/search, server-side validation, and documented data retention. Add tables only when they support a real product requirement. Keep generated API contracts and client types synchronized if the current project continues using its OpenAPI/codegen setup.

## Interface and navigation

Use a mobile-first interface that feels local, trustworthy, modern, and simple—not a corporate admin dashboard. Make the active village easy to see and switch. Keep the first action obvious: “What do you need?”

Use a bottom navigation on phones only for modules that are actually available, such as Home, Directory, Community, Marketplace, and Profile. Do not show dead-end tabs for unimplemented modules. Home should prioritize the active village, practical search, important current notices, and useful local categories; do not let promotional content displace urgent information.

Every important screen must have loading, empty, error, retry, and success states. Use clear messages such as “No services found in this village yet” and “Connection lost. Your draft is saved; retry when you are online.”

## Build discipline

1. Inspect the existing app, routes, schema, and workflows before editing.
2. Preserve working search, details, and saved-listing behavior while expanding the product.
3. Build one vertical workflow at a time with real persistence and authorization.
4. Keep demo data unmistakably marked. Never invent real providers, phone numbers, official schemes, or emergency alerts.
5. Use generated API clients where available. Every visible action must connect to real behavior or be clearly disabled as not yet available.
6. After each stage, run type checks, verify the relevant API and UI, and confirm responsive/low-bandwidth states.
7. Do not claim the app is production-ready until authentication, authorization, source verification, abuse controls, and real local data are configured and reviewed.

## Three-to-five-minute demo journey

Demonstrate one coherent resident outcome, not every roadmap feature:

1. Sign in and choose a home village.
2. Ask for a practical need such as a tractor, transport, repair, or farm worker.
3. Find a relevant local service or listing and contact its owner.
4. See a current village notice with its source, status, and time.
5. Show how an ordinary community update is pending and how eligible residents verify it.
6. Show that an emergency alert uses the trusted urgent-notice path rather than waiting on ordinary votes.
7. If government-scheme AI is configured, demonstrate a sourced answer with uncertainty; otherwise show the honest unavailable/fallback state.

## Acceptance checks

- A resident can identify their active village and understand whether they are browsing or allowed to publish there.
- Search handles practical phrases and returns only listings supported by the stored data.
- A resident cannot create content in another village merely by changing a client-side village value.
- A post author cannot verify their own post, and the same account cannot verify twice.
- Concurrent verifications cannot publish a post early or produce a count above the number of unique eligible users.
- Clients cannot set a post to `live` or supply the verification count.
- Ordinary community confirmation is not described as official fact-checking.
- Urgent notices from unauthorized accounts cannot bypass the trusted publisher path.
- Unavailable AI, maps, and network connections produce usable alternatives and clear messages.
- No demo listing or AI answer is presented as a real verified local service or official fact.

## Non-goals

- Do not build a generic social-media feed, engagement ranking, influencer/follower system, or infinite scroll.
- Do not add payments, delivery, financial services, or automated government applications without a validated need and explicit approval.
- Do not build all modules before the village identity, useful directory, trusted information, and low-bandwidth workflows work.
- Do not invent more features to make the product appear larger.
