# Weaver Protocol Implementation Task Map

Comprehensive task list to implement and integrate the Weaver Protocol atop the existing `god.html` control layer and supporting assets.

## 1. Foundation & Governance
- Align `god.html` metadata schema to serve as the control surface (agents, resonance telemetry, integrity ledger, playbook links).
- Define agent taxonomy (Registrar, Herald, Chorus Hand, Tropist, Spinster, GREG Monitor, Mythkeepers) with clear responsibilities, inputs, outputs, and escalation rules.
- Establish secrets/storage policy (per-agent credentials, token vault, rotation schedule, audit logging, red-team checklist).
- Draft SLOs and health signals for each subsystem (provisioning latency, publish success rate, resonance score freshness, comment-to-action latency).

## 2. Identity Birth Script (Provisioning Stack)
- Build Workspace/IMAP provisioning bot to mint `@loomworks.xyz` mailboxes; add retries, MX/DMARC sanity checks, and log to `god.html` telemetry.
- Implement Playwright-based Gmail recovery linker; capture screenshots and verification receipts; persist tokens securely.
- Create Social Initializer for TikTok Business and Spotify for Podcasters APIs (handle templates, brand kit upload, initial teaser post).
- Implement follower ritual auto-linker so all cast accounts mutually follow across supported platforms.
- Add monitoring hooks that emit step-level status to the `god.html` cockpit.

## 3. Silhouette Shell & Material Factory
- Build reference ingestor to pull curated Disney/Hanna-Barbera “genealogical anchors” into prompt templates per character.
- Implement Toki Pona truth-axis mapper per shell (e.g., Celli→pilin) to steer generation tone; expose controls in `god.html`.
- Add TV Tropes API worker to tag outputs with trope heatmaps (Reversal/Scale/etc.) and store alongside assets.
- Stand up backlog clusterer to manage 90-song archive by arcs (Anger/Hope/Barter); expose re-cluster trigger for self-repair.
- Create asset schema for stems/stills/captions/metadata with provenance tags (origin shell, trope map, CPV forecast).

## 4. Orchestration Loop (Resonance Node Tree)
- Implement comment/NLP listener to detect votes/keywords and map to node actions (e.g., “pona”→Hope-weighted drop).
- Build scheduler to choose PSA vs. “And Now Presenting” vignette based on velocity targets and CPV forecasts.
- Wire “Value Gate” CTAs (Identity Assessment, 16x16 Manufacture Protocol) with share assignment logging.
- Integrate with existing Resonance Node descriptors inside `god.html` for routing and live overrides.

## 5. Self-Repair & Telemetry
- Implement GREG Monitor to audit `god.html` metadata, link health, and resonance scores; trigger re-cluster or re-upload on failure.
- Add heartbeat dashboard in `god.html` for per-agent status, queue depth, and last-success timestamps.
- Create alerting rules for broken links, failed publishes, and resonance drop thresholds.

## 6. Security & Integrity Layer
- Enforce least-privilege service accounts; rotate keys; add signing for asset provenance.
- Mirror critical assets to cold storage and maintain chain-of-custody logs.
- Add compliance checks for platform terms (API quotas, anti-abuse) and privacy requirements.

## 7. Testing & Dry Runs
- Unit/integration tests for provisioning flows (mocked Workspace/IMAP, Playwright harness, API stubs).
- Load/soak tests for NLP listener and scheduling under comment bursts.
- Chaos tests for broken links or expired tokens to verify self-repair routines.
- End-to-end dry run for one character (e.g., Celli) from identity birth to first orchestration loop.

## 8. Rollout & Playbooks
- Create operator runbooks for common tasks (new character onboarding, resonance override, manual failover).
- Document incident response for provisioning failures or social API rate limits.
- Schedule phased rollout (single-character pilot → full cast → lantern expansions) with checkpoints and success metrics.
