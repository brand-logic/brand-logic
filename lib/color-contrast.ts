/**
 * Color contrast utilities for Brand Summary template.
 * Implements WCAG relative luminance and contrast ratio calculations,
 * plus the hero bar color resolution logic from the spec (§6).
 */

export type PaletteColor = {
  hex: string
  role: string
  name?: string
  usage_rules?: string
  psychology?: string
}

// ─── Core calculations ──────────────────────────────────────────────────────

function linearize(channel: number): number {
  const s = channel / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim()
  if (clean.length !== 6) return null
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ]
}

export function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(linearize)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1)
  const l2 = luminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Returns true if the color is light enough that dark text reads better on it */
export function isLightColor(hex: string): boolean {
  return luminance(hex) > 0.179
}

/** Auto-picks white or near-black for text placed on top of a swatch */
export function textOnSwatch(hex: string): string {
  return isLightColor(hex) ? '#2A2825' : '#FFFFFF'
}

// ─── Hero bar resolution (§6) ────────────────────────────────────────────────

export type HeroColors = {
  bg: string
  eyebrow: string // accent / highlight — must pass 4.5:1 on bg
  bodyColor: string // text — must pass 7:1 on bg (AAA)
}

export function resolveHeroColors(palette: PaletteColor[]): HeroColors {
  const primary = palette.find(c => c.role?.toUpperCase() === 'PRIMARY')
  const accent = palette.find(c => c.role?.toUpperCase() === 'ACCENT')
  const neutralLight = palette
    .filter(c => {
      const r = c.role?.toUpperCase()
      return r === 'NEUTRAL' || r === 'BACKGROUND'
    })
    .sort((a, b) => luminance(b.hex) - luminance(a.hex))[0]

  // Background: primary, or darkest fallback
  let bg = primary?.hex ?? '#1A1A1A'

  // Eyebrow: accent, must be ≥4.5:1 on bg
  let eyebrow = accent?.hex ?? '#E8E3D6'
  if (contrastRatio(eyebrow, bg) < 4.5) {
    eyebrow = neutralLight?.hex ?? '#E8E3D6'
  }
  if (contrastRatio(eyebrow, bg) < 4.5) {
    eyebrow = '#FFFFFF'
  }

  // Body text: white if ≥7:1 contrast, else off-white bone
  const bodyColor = contrastRatio('#FFFFFF', bg) >= 7 ? '#FFFFFF' : '#F5F3EE'

  return { bg, eyebrow, bodyColor }
}
