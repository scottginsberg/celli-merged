export const REFERRER_LANDING_PAGES = [
  {
    name: 'FauxNewsPortal',
    icon: '📰',
    description: 'Spoofed news referral splash screen with layered glitch overlays.',
    tags: ['landing', 'referrer', 'overlay'],
    components: [
      { name: 'headline', type: 'string', path: 'landing.fauxNewsPortal.headline' },
      { name: 'ctaText', type: 'string', path: 'landing.fauxNewsPortal.cta' },
      { name: 'backgroundLayer', type: 'css', path: 'landing.fauxNewsPortal.layers.background' },
      { name: 'glitchCycle', type: 'timeline', path: 'landing.fauxNewsPortal.timeline.glitch' }
    ],
    scripts: [
      'src/styles/referrer-overlay.css',
      'src/scripts/scenes/components/ReferrerLandingPages.js'
    ],
    previewId: 'fauxNewsPortal'
  },
  {
    name: 'SocialReferralInterstitial',
    icon: '🔗',
    description: 'Interstitial faux social network landing with timed card reveals.',
    tags: ['landing', 'ui', 'referrer'],
    components: [
      { name: 'platform', type: 'string', path: 'landing.socialReferral.platform' },
      { name: 'cardCount', type: 'number', path: 'landing.socialReferral.cards.count' },
      { name: 'autoAdvance', type: 'number', path: 'landing.socialReferral.cards.autoAdvance' },
      { name: 'ctaLink', type: 'string', path: 'landing.socialReferral.cta.href' }
    ],
    scripts: ['src/styles/referrer-overlay.css'],
    previewId: 'socialReferral'
  }
];

export default REFERRER_LANDING_PAGES;
