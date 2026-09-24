/**
 * Brand Summary design tokens — from §3 and §4 of the spec.
 * All non-user colors (the chrome) live here.
 * User-derived colors (palette) are resolved at runtime via color-contrast.ts.
 */

// ─── App chrome colors (§4) ──────────────────────────────────────────────────

export const CANVAS = {
  bg: '#F5F3EE',         // bone — document background
  fgDefault: '#2A2825',  // near-black — primary text
  fgMuted: '#6B6459',    // stone — labels, captions
  borderSubtle: '#D4CFC4', // warm gray — dividers, slider tracks
  bgPlaceholder: '#E8E3D6', // moodboard fallback
  fgOnDark: '#FFFFFF',
} as const

// ─── Type scale (§3) ────────────────────────────────────────────────────────

export const TYPE = {
  // Hero
  heroBrand: { size: 96, weight: 400, lineHeight: 1.0, letterSpacing: '-0.02em' },
  heroTagline: { size: 28, weight: 400, lineHeight: 1.3, letterSpacing: '0' },
  heroOneliner: { size: 14, weight: 400, lineHeight: 1.5, letterSpacing: '0' },

  // Display
  displayLg: { size: 72, weight: 400, lineHeight: 1.05, letterSpacing: '-0.01em' },
  displayMd: { size: 44, weight: 400, lineHeight: 1.1, letterSpacing: '0' },  // Type application h1
  displaySm: { size: 34, weight: 400, lineHeight: 1.15, letterSpacing: '0' }, // Persona name

  // Headings
  headingLg: { size: 28, weight: 400, lineHeight: 1.15, letterSpacing: '0' }, // Pillar title
  headingMd: { size: 22, weight: 400, lineHeight: 1.2, letterSpacing: '0' },  // Tone name

  // Body
  bodyMd: { size: 14, weight: 400, lineHeight: 1.6, letterSpacing: '0' },
  bodySm: { size: 13, weight: 400, lineHeight: 1.55, letterSpacing: '0' },
  bodyXs: { size: 12, weight: 400, lineHeight: 1.5, letterSpacing: '0' },

  // Labels
  eyebrow: { size: 11, weight: 600, lineHeight: 1.2, letterSpacing: '0.14em' },
  eyebrowHero: { size: 11, weight: 500, lineHeight: 1.2, letterSpacing: '0.18em' },
  caption: { size: 11, weight: 500, lineHeight: 1.45, letterSpacing: '0' },
  micro: { size: 10, weight: 600, lineHeight: 1.2, letterSpacing: '0.18em' },
  microFooter: { size: 10, weight: 600, lineHeight: 1.2, letterSpacing: '0.24em' },
} as const

// ─── Spacing (8px base unit multiples) ──────────────────────────────────────

export const SPACE = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
  '6xl': 120,
} as const

// ─── Section padding constants ────────────────────────────────────────────────

export const SECTION = {
  heroHeight: 280,
  heroPaddingV: 64,
  heroPaddingH: 120,
  sectionPaddingTop: 80,
  sectionPaddingBottom: 64,
  colGap: 64,
  swatchHeight: 100,
  swatchAspect: '1.8 / 1',
} as const

// ─── Brand name auto-scale ────────────────────────────────────────────────────

export function getBrandNameFontSize(name: string): number {
  if (name.length > 14) return 48
  if (name.length > 10) return 64
  if (name.length > 7) return 80
  return 96
}
