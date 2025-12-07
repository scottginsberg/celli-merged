# User-Specific Sculpture Generator (GSE-01)

A production-ready blueprint for adding the **Generative Specimen Engine** to the Loomworks ecosystem. The system ingests quiz-derived classifications, deterministically generates a branded voxel sculpture, and outputs three shareable artifacts while syncing with The Grift Shop lifecycle experience.

## Goals
- Deterministic, user-specific sculptures derived from quiz signals and anomaly patterns.
- Output assets that match Domestic Product aesthetics (creme \#F6F0E6, carbon black, red \#D7342A; Space Grotesk + mono system text).
- Automatic linkage to the Lanyard Profile Card, Grift Shop royalties (0.006%), and market lifecycle map.
- Export-ready captures (PNG, 9:16 / 1:1 / 4:5 / 2:1) with QR links back to the gallery.

## Input Contract
- **Primary:** classification, user pattern score (%), behavioral anomalies, role deviations, derived sub-class traits.
- **Secondary:** time of day, device type, pulse inputs (random aesthetic seeds), optional initials (2–3 chars for engraving).
- **Deterministic seed:** `hash(user_id + classification + timestamp + anomaly_profile)` drives geometry, massing, color tone, voids, and pulse-influenced randomness.

## Data Model (new tables)
| Table | Key Fields | Notes |
| --- | --- | --- |
| `users` | `id (pk)`, `handle`, `created_at` | Already present; referenced by specimens. |
| `specimens` | `id (pk)`, `user_id (fk)`, `classification`, `anomaly_profile`, `pattern_score`, `role_deviation`, `subclass_traits (jsonb)`, `seed_hash`, `title`, `default_title`, `created_at`, `submitted_to_grift_shop_at`, `royalty_rate` (default 0.00006), `device_type`, `time_of_day` | Stores the deterministic seed and the user-selected title. |
| `specimen_assets` | `id (pk)`, `specimen_id (fk)`, `type` (`lanyard_card`, `business_card`, `capture`), `url`, `format`, `aspect_ratio`, `generated_at`, `thumbnail_url` | Holds generated assets and variants. |
| `specimen_events` | `id (pk)`, `specimen_id (fk)`, `event_type`, `label`, `description`, `value_delta`, `royalty_delta`, `occurred_at`, `metadata (jsonb)` | Drives dotted-line lifecycle nodes and micro-popups. |

## API Surface
- `POST /gse/generate`
  - Body: quiz payload + user_id + optional initials.
  - Side effects: computes deterministic seed, persists `specimens` row, queues render job, returns specimen id + default title `Specimen-[classification code]-[hash5]` and orbit-able preview URL.
- `POST /gse/capture`
  - Body: `specimen_id`, desired aspect ratios, framing hints.
  - Generates the three asset variants, stores in `specimen_assets`, returns signed URLs.
- `GET /grift/events?specimen_id=`
  - Returns ordered lifecycle events for dotted-line map with copy and value deltas.
- `POST /grift/royalties`
  - Body: `specimen_id`, `event_type`, `value_delta`.
  - Computes 0.006% royalty, records in `specimen_events`, returns updated royalty totals.

## Sculpture Generation Pipeline
1. **Seed resolution**: hash inputs and clamp to RNG seed; ensure repeatability per user + classification + anomaly profile.
2. **Grammar selection**: pick voxel/rod/plane/void primitives based on classification + anomalies; anomalies introduce negative space pockets or rods.
3. **Form assembly**: procedural placement in Three.js scene graph with bounding box limits for shareable thumbnails; embed pulse inputs into noise offsets.
4. **Palette application**: constrain to creme base, carbon black structural planes, red accents for stamps/engraving.
5. **Engraving**: optional initials etched on a face; store engraving position in metadata for captures.
6. **Lighting + camera**: hero rig (30° tilt, 45° orbit), key light + soft shadow; neutral background.
7. **Capture orchestration**: reusable SSR/static capture service to snapshot the three presets; fallback to client-side capture if SSR unavailable.

## Shareable Artifacts
- **Lanyard Profile Card (PNG, 9:16)**: creme badge, black type, red “CONFIRMED” stamp, classification + title, sculpture thumbnail, QR to gallery.
- **Minimalist Business Card (PNG, 1:1 + 4:5)**: centered thumbnail, title, subtitle “A GENERATIVE SPECIMEN OF LOOMWORKS”, royalty note 0.006%, optional back-of-card with classification, user ID, specimen number.
- **Sculpture View Capture (PNG, 2:1)**: hero angle, key light + soft shadow, title + classification subtitled, “VIEW IN GALLERY” CTA.

## Rendering + Determinism
- Use Three.js with OrbitControls; lock seed into noise/placement functions.
- Store deterministic parameters alongside `specimens` for replays and re-renders.
- Capture presets described as scene configs (`camera`, `lights`, `background`, `label overlays`), versioned for reproducibility.

## Grift Shop Lifecycle & UI Hooks
- Lifecycle nodes seeded with defaults: Gallery Intake, eBay Incident, Auction House, AI Dataset Extraction, Cultural Artifact Drift, Bootleg Market.
- Each `specimen_events` entry includes micro-copy; UI shows dotted-line journey with hover/tap micro-descriptions and animated pop-ups on load (terminal-green flash, value deltas, royalty earned).
- Market events can be simulated on timers or triggered by content hooks; royalties emitted at 0.006% of value deltas.

## Engineering Notes
- **Security**: validate engraving initials (A–Z, 0–9, max 3 chars); sanitize user titles (≤ 40 chars). Signed asset URLs for shareable cards.
- **Performance**: cache seed-to-geometry outputs; reuse renderer for multi-capture batches; background queue for SSR captures.
- **Testing**: golden-image snapshots for card layouts; deterministic seed regression tests; contract tests for `/gse/*` and `/grift/*` endpoints.
- **Observability**: log seed hashes, capture durations, and royalty calculations; emit telemetry for lifecycle UI interactions.

## Delivery Checklist
- [ ] Generator module producing deterministic scene graph and engraving metadata.
- [ ] Capture presets for 9:16, 1:1, 4:5, 2:1 with overlays.
- [ ] REST endpoints wired to DB + queue.
- [ ] Grift Shop dotted-line component consuming `specimen_events`.
- [ ] Royalty calculator at 0.006% with cumulative ledger.
- [ ] QA: seed repeatability, capture dimensions, asset branding audit (palette/typography), lifecycle animation timing.
