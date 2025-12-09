const modules = [
  {
    name: 'Tone Kernel',
    color: 'var(--red)',
    description: 'Cadence, punctuation norms, gravitational pull for language.'
  },
  {
    name: 'Character Grammars',
    color: 'var(--yellow)',
    description: 'Semantic signatures, emotional palettes, contradiction tolerances.'
  },
  {
    name: 'Semiotic Radial Map',
    color: 'var(--blue)',
    description: 'Motifs, objects, rituals, and their symbolic wiring.'
  },
  {
    name: 'Canon Validator',
    color: 'var(--red)',
    description: 'Continuity checks, tone breaches, lore harmonization prompts.'
  },
  {
    name: 'Suggestion Engine',
    color: 'var(--yellow)',
    description: 'In-tone expansions and platform variants — never plot overrides.'
  },
  {
    name: 'Export Layer',
    color: 'var(--blue)',
    description: 'TikTok captions, IG alt-text, memos, in-world posters, onboarding.'
  }
];

const scenarios = {
  default: {
    title: 'Default: Loomworks Pulse',
    text: 'A clean lattice showing how authorship intent flows through each layer without losing tone.'
  },
  glitch: {
    title: 'Glitch Tolerant',
    text: 'Validator highlights contradictions and routes them through harmonization nodes.'
  },
  live: {
    title: 'Live Drop',
    text: 'Platform exporter lights up — social, site, and memo formats spool simultaneously.'
  }
};

const opsModules = [
  {
    name: 'Narrative CRM Dashboard',
    hue: 'var(--red)',
    summary: 'Profiles, health indicators, emotional + relational states tracked across platforms.',
    bullets: [
      'Emotional and relational states with world dependencies.',
      'Symbolic ownerships and restricted topics.',
      'Last touch + next appearance plus sentiment pulse.'
    ]
  },
  {
    name: 'Feed Scheduler',
    hue: 'var(--yellow)',
    summary: 'Drag-and-drop timeline with tone validation, cadence warnings, and overexposure checks.',
    bullets: [
      'Multi-platform previews before posting.',
      'Character overexposure + symbolic density alerts.',
      'Non-linear order hardened by tone checks.'
    ]
  },
  {
    name: 'Post Template Engine',
    hue: 'var(--blue)',
    summary: 'Templates for POV micro-scenes, diegetic memos, teasers, fragments, and motif visuals.',
    bullets: [
      'Tone-locked stubs for quick iteration.',
      'Motif-aware scaffolds prevent drift.',
      'Export-ready snippets per platform.'
    ]
  },
  {
    name: 'Analytics & Heatmapping',
    hue: 'var(--red)',
    summary: 'Engagement quality, sentiment by character, motif resonance, and comprehension signals.',
    bullets: [
      'Shareability vs comprehension tracking.',
      'Segment reactions (horror fans, surrealists, art kids).',
      'Symbol heatmap and resonance trends.'
    ]
  },
  {
    name: 'Narrative Experimentation',
    hue: 'var(--yellow)',
    summary: 'Run tone, platform, and motif experiments without breaking canon.',
    bullets: [
      'A/B tone variants (softer vs bureaucratic Dime).',
      'Platform toggles (reel-first, story-first, text-heavy).',
      'Motif reassignment tests with guardrails.'
    ]
  },
  {
    name: 'Roadmap to v0.3',
    hue: 'var(--blue)',
    summary: 'Forecasting, influence mapping, integrity scoring, and dramaturg personalization.',
    bullets: [
      'Emotional arc forecasting + arc integrity scores.',
      'Dynamic narrative heatmaps + influence graphs.',
      'AI dramaturg personalization + dialogue simulation.'
    ]
  }
];

const nodePositions = [
  { id: 'tone', top: '40px', left: '32px', color: 'var(--red)', title: 'Tone Kernel', meta: 'Linguistic DNA', body: 'Edge-weighted cadence, forbidden metaphors, humor cadence.' },
  { id: 'grammars', top: '70px', left: '360px', color: 'var(--yellow)', title: 'Character Grammars', meta: 'Voice mesh', body: 'Semantic signatures for Dime, Penny, Celli, and emergent citizens.' },
  { id: 'map', top: '230px', left: '70px', color: 'var(--blue)', title: 'Semiotic Radial Map', meta: 'Symbol topology', body: 'Gestures, rituals, objects, and their mythic gravity.' },
  { id: 'validator', top: '230px', left: '420px', color: 'var(--red)', title: 'Canon Validator', meta: 'Integrity shield', body: 'Detects drift, proposes harmonizations, preserves voice.' },
  { id: 'suggest', top: '380px', left: '220px', color: 'var(--yellow)', title: 'Suggestion Engine', meta: 'Generative dramaturgy', body: 'Offers in-tone expansions; never hijacks plot.' },
  { id: 'export', top: '380px', left: '520px', color: 'var(--blue)', title: 'Export Layer', meta: 'Platform-native', body: 'Outputs site copy, social stingers, journal pages, memos.' }
];

function renderModules() {
  const container = document.querySelector('.module-grid');
  modules.forEach((mod) => {
    const div = document.createElement('div');
    div.className = 'module';
    div.innerHTML = `
      <h4>${mod.name}</h4>
      <div class="meta">${mod.description}</div>
    `;
    div.style.borderColor = mod.color;
    div.style.boxShadow = `0 16px 40px ${mod.color}33`;
    container.appendChild(div);
  });
}

function renderNodes() {
  const map = document.querySelector('.node-map');
  const connectorLayer = document.createElement('div');
  connectorLayer.className = 'connector-layer';
  map.appendChild(connectorLayer);

  nodePositions.forEach((node) => {
    const el = document.createElement('div');
    el.className = 'node';
    el.style.top = node.top;
    el.style.left = node.left;
    el.innerHTML = `
      <div class="tag"><span class="dot" style="background:${node.color}"></span>${node.title}</div>
      <div class="meta">${node.meta}</div>
      <div>${node.body}</div>
    `;
    map.appendChild(el);
  });

  const connectors = [
    { top: 92, left: 210, width: 160, height: 48 },
    { top: 150, left: 180, width: 70, height: 130 },
    { top: 150, left: 330, width: 180, height: 120 },
    { top: 270, left: 250, width: 90, height: 120 },
    { top: 300, left: 430, width: 120, height: 120 }
  ];

  connectors.forEach((c) => {
    const conn = document.createElement('div');
    conn.className = 'connector';
    conn.style.top = `${c.top}px`;
    conn.style.left = `${c.left}px`;
    conn.style.width = `${c.width}px`;
    conn.style.height = `${c.height}px`;
    conn.style.borderColor = 'rgba(12,12,15,0.3)';
    connectorLayer.appendChild(conn);
  });
}

function renderLegend() {
  const legend = document.querySelector('.legend');
  const items = [
    { label: 'Red — Tone & Validation', color: 'var(--red)' },
    { label: 'Yellow — Character & Suggestion', color: 'var(--yellow)' },
    { label: 'Blue — Semiotics & Exports', color: 'var(--blue)' },
    { label: 'Shadowed wires — material, not skeuomorphic', color: 'rgba(12,12,15,0.16)' }
  ];

  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="swatch" style="background:${item.color}"></div>
      <div>${item.label}</div>
    `;
    legend.appendChild(div);
  });
}

function renderOpsGrid() {
  const grid = document.querySelector('.ops-grid');
  if (!grid) return;

  opsModules.forEach((op) => {
    const card = document.createElement('div');
    card.className = 'op-card';
    card.style.borderColor = op.hue;
    card.innerHTML = `
      <div class="tag"><span class="dot" style="background:${op.hue}"></span>${op.name}</div>
      <p>${op.summary}</p>
      <ul>${op.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
    `;
    grid.appendChild(card);
  });
}

function wireScenarioToggles() {
  const text = document.querySelector('.scenario-copy');
  const title = document.querySelector('.scenario-title');
  document.querySelectorAll('input[name="scenario"]').forEach((input) => {
    input.addEventListener('change', () => {
      const active = scenarios[input.value];
      title.textContent = active.title;
      text.textContent = active.text;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderModules();
  renderNodes();
  renderLegend();
  renderOpsGrid();
  wireScenarioToggles();
});
