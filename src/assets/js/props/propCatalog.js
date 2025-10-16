export const PROP_CATALOG = [
  {
    id: 'filmCamera',
    name: 'Film Camera',
    icon: '🎥',
    description:
      'Stylized dual-reel film camera inspired by the record button icon, complete with tripod and glowing lens.',
    tags: ['camera', 'cinema', 'hardware'],
    category: 'Cinematic',
    defaultOptions: {
      scale: 1,
    },
  },
  {
    id: 'filmReel',
    name: 'Film Reel',
    icon: '📼',
    description:
      'Layered cinema reel with wound ribbon and reflective metal discs ready for projection booth dressing.',
    tags: ['cinema', 'prop', 'reel'],
    category: 'Cinematic',
    defaultOptions: {
      scale: 1,
    },
  },
  {
    id: 'filmStrip',
    name: 'Film Strip',
    icon: '🎞️',
    description:
      'Connected translucent frames framed by perforated bars, ideal for UI overlays or set dressing.',
    tags: ['cinema', 'ui', 'graphic'],
    category: 'Cinematic',
    defaultOptions: {
      scale: 1.2,
      cellCount: 4,
    },
  },
  {
    id: 'chessPawn',
    name: 'Chess Pawn',
    icon: '♟️',
    description:
      'Polished tabletop pawn with a luminous collar and storybook silhouette ready for board overlays.',
    tags: ['tabletop', 'pawn', 'board'],
    category: 'Tabletop',
    defaultOptions: {
      scale: 1,
    },
  },
  {
    id: 'dice',
    name: 'Dice',
    icon: '🎲',
    description:
      'Beveled six-sided die with inset pips and subtle edge bloom for tactile scene dressing.',
    tags: ['tabletop', 'dice', 'games'],
    category: 'Tabletop',
    defaultOptions: {
      scale: 1,
    },
  },
  {
    id: 'playingCard',
    name: 'Playing Card',
    icon: '🂡',
    description:
      'Rounded-edge playing card with a dual-tone backer and diamond pip detailing.',
    tags: ['tabletop', 'card', 'games'],
    category: 'Tabletop',
    defaultOptions: {
      scale: 1,
    },
  },
];

export function findPropMeta(id) {
  return PROP_CATALOG.find((prop) => prop.id === id) || null;
}
