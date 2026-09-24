'use client'

import React, { useRef, useState } from 'react'
import { CANVAS } from '@/lib/brand-summary-tokens'
import SectionRule from './section-rule'
import ColorPaletteGrid from './color-palette-grid'
import EditableText from './editable-text'
import type { PaletteColor } from '@/lib/color-contrast'
import { Upload, Loader2 } from 'lucide-react'

interface TypographyExamples {
  h1_hero?: string
  body_lead?: string
  cta_options?: string[]
}

interface TypographyAndColorProps {
  primaryFont: string
  secondaryFont: string
  typographyExamples: TypographyExamples
  colors: PaletteColor[]
  accentHex: string
  isEditing?: boolean
  availablePrimaryFonts?: string[]
  availableSecondaryFonts?: string[]
  contrastError?: string | null
  onUpdatePrimaryFont?: (font: string) => void
  onUpdateSecondaryFont?: (font: string) => void
  onUploadCustomFont?: (file: File, target: 'primary' | 'secondary') => Promise<void>
  onUpdateTypographyExamples?: (examples: TypographyExamples) => void
  onUpdateColor?: (index: number, updatedColor: PaletteColor) => void
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const alpha = 'abcdefghijklmnopqrstuvwxyz'
const digits = '1234567890'

function AlphabetBlock({ fontStack, color }: { fontStack: string; color: string }) {
  const style: React.CSSProperties = {
    fontFamily: fontStack,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
    color,
    display: 'block',
  }
  return (
    <div>
      <span style={style}>{ALPHA}</span>
      <span style={style}>{alpha}</span>
      <span style={style}>{digits}</span>
    </div>
  )
}

export default function TypographyBlock({
  primaryFont,
  secondaryFont,
  typographyExamples,
  colors,
  accentHex,
  isEditing = false,
  availablePrimaryFonts = [],
  availableSecondaryFonts = [],
  contrastError,
  onUpdatePrimaryFont,
  onUpdateSecondaryFont,
  onUploadCustomFont,
  onUpdateTypographyExamples,
  onUpdateColor,
}: TypographyAndColorProps) {
  const primaryStack = `'${primaryFont}', 'Inter', system-ui, sans-serif`
  const secondaryStack = `'${secondaryFont}', system-ui, sans-serif`

  const ctaLabel = typographyExamples.cta_options?.[0] || 'Get Started'

  const customFontInputRef = useRef<HTMLInputElement>(null)
  const [fontTarget, setFontTarget] = useState<'primary' | 'secondary'>('primary')
  const [isUploadingFont, setIsUploadingFont] = useState(false)

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadCustomFont) return
    try {
      setIsUploadingFont(true)
      await onUploadCustomFont(file, fontTarget)
    } catch (err: any) {
      console.error('Custom font upload failed:', err)
      alert(err.message || 'Failed to upload custom font')
    } finally {
      setIsUploadingFont(false)
      if (customFontInputRef.current) customFontInputRef.current.value = ''
    }
  }

  // Ensure current fonts are included in the dropdown options
  const primaryOptions = Array.from(new Set([primaryFont, ...availablePrimaryFonts])).filter(Boolean)
  const secondaryOptions = Array.from(new Set([secondaryFont, ...availableSecondaryFonts])).filter(Boolean)

  return (
    <section
      style={{
        backgroundColor: CANVAS.bg,
        paddingTop: 64,
        paddingBottom: 80,
      }}
    >
      <SectionRule />
      <div
        style={{ paddingTop: 64 }}
        className="typography-color-grid"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '5fr 7fr',
            gap: 64,
          }}
          className="typography-color-inner"
        >
          {/* ── LEFT: Typography ── */}
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
              TYPOGRAPHY
            </p>

            {/* HEADINGS sub-label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p
                style={{
                  fontFamily: secondaryStack,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: CANVAS.fgMuted,
                  margin: 0,
                }}
              >
                HEADINGS
              </p>

              {isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={primaryFont}
                    onChange={(e) => onUpdatePrimaryFont?.(e.target.value)}
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(0,0,0,0.2)',
                      background: '#FFF',
                      cursor: 'pointer',
                    }}
                  >
                    {primaryOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFontTarget('primary')
                      customFontInputRef.current?.click()
                    }}
                    style={{
                      fontSize: 10,
                      padding: '3px 6px',
                      background: 'rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Upload Custom Font (.ttf, .otf, .woff2)"
                  >
                    <Upload style={{ width: 10, height: 10 }} />
                    Upload
                  </button>
                </div>
              )}
            </div>

            {/* Primary font display + alphabet */}
            <div style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: primaryStack,
                  fontSize: 72,
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: '-0.01em',
                  color: CANVAS.fgDefault,
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {primaryFont}
              </h2>
              <div style={{ marginTop: 12 }}>
                <AlphabetBlock fontStack={primaryStack} color={CANVAS.fgDefault} />
              </div>
            </div>

            {/* BODY & CTA sub-label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p
                style={{
                  fontFamily: secondaryStack,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  color: CANVAS.fgMuted,
                  margin: 0,
                }}
              >
                BODY &amp; CTA
              </p>

              {isEditing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={secondaryFont}
                    onChange={(e) => onUpdateSecondaryFont?.(e.target.value)}
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(0,0,0,0.2)',
                      background: '#FFF',
                      cursor: 'pointer',
                    }}
                  >
                    {secondaryOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFontTarget('secondary')
                      customFontInputRef.current?.click()
                    }}
                    style={{
                      fontSize: 10,
                      padding: '3px 6px',
                      background: 'rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Upload Custom Font (.ttf, .otf, .woff2)"
                  >
                    <Upload style={{ width: 10, height: 10 }} />
                    Upload
                  </button>
                </div>
              )}
            </div>

            {/* Hidden font file input */}
            <input
              ref={customFontInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              style={{ display: 'none' }}
              onChange={handleCustomFontUpload}
            />

            {/* Secondary font display + alphabet */}
            <div style={{ marginBottom: 40 }}>
              <h3
                style={{
                  fontFamily: secondaryStack,
                  fontSize: 44,
                  fontWeight: 400,
                  lineHeight: 1.05,
                  color: CANVAS.fgDefault,
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {secondaryFont}
              </h3>
              <div style={{ marginTop: 12 }}>
                <AlphabetBlock fontStack={secondaryStack} color={CANVAS.fgDefault} />
              </div>
            </div>

            {/* TYPE APPLICATION sub-label */}
            <p
              style={{
                fontFamily: secondaryStack,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: CANVAS.fgMuted,
                marginBottom: 24,
              }}
            >
              TYPE APPLICATION
            </p>

            {/* H1 Hero headline */}
            {(typographyExamples.h1_hero || isEditing) && (
              <div style={{ marginBottom: 24, maxWidth: 320 }}>
                <EditableText
                  value={typographyExamples.h1_hero || ''}
                  onChange={(val) =>
                    onUpdateTypographyExamples?.({
                      ...typographyExamples,
                      h1_hero: val,
                    })
                  }
                  isEditing={isEditing}
                  multiline
                  style={{
                    fontFamily: primaryStack,
                    fontSize: 44,
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: CANVAS.fgDefault,
                    margin: 0,
                  }}
                  placeholder="Hero headline sample..."
                />
              </div>
            )}

            {/* CTA button */}
            <div style={{ marginBottom: 24 }}>
              {isEditing ? (
                <div style={{ display: 'inline-block' }}>
                  <EditableText
                    value={ctaLabel}
                    onChange={(val) =>
                      onUpdateTypographyExamples?.({
                        ...typographyExamples,
                        cta_options: [val],
                      })
                    }
                    isEditing={isEditing}
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase' as const,
                      color: CANVAS.fgDefault,
                      backgroundColor: accentHex,
                      padding: '14px 22px',
                      borderRadius: 9999,
                      display: 'inline-block',
                      lineHeight: 1,
                    }}
                    placeholder="CTA Button Text..."
                  />
                </div>
              ) : (
                <span
                  style={{
                    fontFamily: secondaryStack,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    color: CANVAS.fgDefault,
                    backgroundColor: accentHex,
                    padding: '14px 22px',
                    borderRadius: 9999,
                    display: 'inline-block',
                    lineHeight: 1,
                  }}
                >
                  {ctaLabel}
                </span>
              )}
            </div>

            {/* Body lead */}
            {(typographyExamples.body_lead || isEditing) && (
              <div style={{ marginTop: 8 }}>
                <EditableText
                  value={typographyExamples.body_lead || ''}
                  onChange={(val) =>
                    onUpdateTypographyExamples?.({
                      ...typographyExamples,
                      body_lead: val,
                    })
                  }
                  isEditing={isEditing}
                  multiline
                  style={{
                    fontFamily: secondaryStack,
                    fontSize: 13,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: CANVAS.fgDefault,
                    margin: 0,
                  }}
                  placeholder="Body lead paragraph sample..."
                />
              </div>
            )}
          </div>

          {/* ── RIGHT: Color Palette ── */}
          <div>
            <ColorPaletteGrid
              colors={colors}
              secondaryFont={secondaryFont}
              isEditing={isEditing}
              onUpdateColor={onUpdateColor}
              contrastError={contrastError}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
