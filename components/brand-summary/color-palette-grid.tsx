'use client'

import React from 'react'
import { CANVAS } from '@/lib/brand-summary-tokens'
import { textOnSwatch, contrastRatio } from '@/lib/color-contrast'
import type { PaletteColor } from '@/lib/color-contrast'
import EditableText from './editable-text'
import { AlertCircle } from 'lucide-react'

interface ColorPaletteGridProps {
  colors: PaletteColor[]
  secondaryFont: string
  isEditing?: boolean
  onUpdateColor?: (index: number, updatedColor: PaletteColor) => void
  contrastError?: string | null
}

export default function ColorPaletteGrid({
  colors,
  secondaryFont,
  isEditing = false,
  onUpdateColor,
  contrastError,
}: ColorPaletteGridProps) {
  // Always render up to 6 cells
  const cells = Array.from({ length: 6 }, (_, i) => colors[i] ?? null)
  const secondaryStack = `var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)`

  const handleHexChange = (index: number, rawHex: string) => {
    let clean = rawHex.trim()
    if (!clean.startsWith('#')) clean = `#${clean}`
    const existing = colors[index] || { hex: clean, role: 'NEUTRAL' }
    onUpdateColor?.(index, { ...existing, hex: clean })
  }

  return (
    <div>
      {/* Section label */}
      <p
        style={{
          fontFamily: secondaryStack,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          color: CANVAS.fgMuted,
          marginBottom: 32,
        }}
      >
        COLOR PALETTE
      </p>

      {/* 2×3 swatch grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 16,
          rowGap: 24,
        }}
      >
        {cells.map((color, i) =>
          color ? (
            <div key={i}>
              {/* Swatch block */}
              <div
                style={{
                  backgroundColor: color.hex || '#E0E0E0',
                  aspectRatio: '1.8 / 1',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* Role label inside swatch top-left (fixed role) */}
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontFamily: secondaryStack,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase' as const,
                    color: textOnSwatch(color.hex || '#FFFFFF'),
                    lineHeight: 1.2,
                  }}
                >
                  {color.role || ''}
                </span>

                {/* In Edit Mode: native color picker input positioned in bottom-right */}
                {isEditing && (
                  <label
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      background: 'rgba(255,255,255,0.85)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    <span>Pick</span>
                    <input
                      type="color"
                      value={color.hex?.startsWith('#') && color.hex.length === 7 ? color.hex : '#1A1A1A'}
                      onChange={(e) => handleHexChange(i, e.target.value)}
                      style={{
                        opacity: 0,
                        position: 'absolute',
                        width: 1,
                        height: 1,
                        pointerEvents: 'none',
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Color metadata below swatch */}
              <div style={{ marginTop: 12 }}>
                {/* Color name */}
                {isEditing ? (
                  <EditableText
                    value={color.name || color.role || ''}
                    onChange={(val) => onUpdateColor?.(i, { ...color, name: val })}
                    isEditing={isEditing}
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase' as const,
                      color: CANVAS.fgDefault,
                      margin: 0,
                    }}
                    placeholder="Color Name..."
                  />
                ) : (
                  <p
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase' as const,
                      color: CANVAS.fgDefault,
                      margin: 0,
                    }}
                  >
                    {color.name || color.role || ''}
                  </p>
                )}

                {/* Hex code */}
                {isEditing ? (
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: secondaryStack, fontSize: 11, fontWeight: 600, color: CANVAS.fgDefault }}>
                      HEX:
                    </span>
                    <input
                      type="text"
                      value={color.hex || ''}
                      onChange={(e) => handleHexChange(i, e.target.value)}
                      maxLength={7}
                      style={{
                        fontFamily: secondaryStack,
                        fontSize: 11,
                        fontWeight: 500,
                        color: CANVAS.fgDefault,
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: 3,
                        padding: '1px 4px',
                        width: 76,
                        textTransform: 'uppercase',
                      }}
                    />
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      fontWeight: 500,
                      color: CANVAS.fgDefault,
                      margin: '4px 0 0 0',
                    }}
                  >
                    HEX: {(color.hex || '').toUpperCase()}
                  </p>
                )}

                {/* Usage rules */}
                {isEditing ? (
                  <div style={{ marginTop: 6 }}>
                    <EditableText
                      value={color.usage_rules || ''}
                      onChange={(val) => onUpdateColor?.(i, { ...color, usage_rules: val })}
                      isEditing={isEditing}
                      multiline
                      style={{
                        fontFamily: secondaryStack,
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: CANVAS.fgMuted,
                        margin: 0,
                      }}
                      placeholder="Usage rules..."
                    />
                  </div>
                ) : (
                  color.usage_rules && (
                    <p
                      style={{
                        fontFamily: secondaryStack,
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: CANVAS.fgMuted,
                        margin: '6px 0 0 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: 'hidden',
                      }}
                    >
                      USE CASE: {color.usage_rules}
                    </p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      {/* Contrast Warning Banner if Primary & Accent fail WCAG 4.5:1 */}
      {isEditing && contrastError && (
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <AlertCircle style={{ width: 18, height: 18, color: '#DC2626', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#991B1B' }}>
              Accessibility Contrast Warning
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#B91C1C', lineHeight: 1.4 }}>
              {contrastError}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
