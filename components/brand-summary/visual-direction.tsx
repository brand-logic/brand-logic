'use client'

import React from 'react'
import { CANVAS } from '@/lib/brand-summary-tokens'
import SectionRule from './section-rule'
import MoodboardGrid from './moodboard-grid'
import EditableText from './editable-text'

interface VisualPrinciple {
  title: string
  description: string
}

interface VisualGuardrails {
  visual_north_star?: string
  visual_principles?: VisualPrinciple[]
  photography?: { lighting?: string; composition?: string; subject?: string }
  graphics?: { shapes_patterns?: string; icons?: string }
}

interface ImageAnalysis {
  visual_style_1?: { title?: string; description?: string }
  visual_style_2?: { title?: string; description?: string }
  visual_style_3?: { title?: string; description?: string }
  visual_styles?: { title?: string; description?: string }[]
}

interface VisualDirectionAndThemesProps {
  visualGuardrails: VisualGuardrails
  imageAnalysis: ImageAnalysis
  moodboardImages: string[]
  brandName: string
  primaryFont: string
  secondaryFont: string
  isEditing?: boolean
  onUpdateVisualNorthStar?: (val: string) => void
  onUpdateVisualPrinciple?: (index: number, field: keyof VisualPrinciple, val: string) => void
  onUpdatePhotography?: (field: 'lighting' | 'composition' | 'subject', val: string) => void
  onUpdateGraphics?: (field: 'shapes_patterns' | 'icons', val: string) => void
  onUploadMoodboardSlot?: (slotIndex: number, file: File) => Promise<void>
}

function SubLabel({ children, secondaryStack }: { children: React.ReactNode; secondaryStack: string }) {
  return (
    <p
      style={{
        fontFamily: secondaryStack,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: CANVAS.fgMuted,
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  )
}

export default function VisualDirectionAndThemes({
  visualGuardrails,
  imageAnalysis,
  moodboardImages,
  brandName,
  primaryFont,
  secondaryFont,
  isEditing = false,
  onUpdateVisualNorthStar,
  onUpdateVisualPrinciple,
  onUpdatePhotography,
  onUpdateGraphics,
  onUploadMoodboardSlot,
}: VisualDirectionAndThemesProps) {
  const primaryStack = `'${primaryFont}', 'Inter', system-ui, sans-serif`
  const secondaryStack = `var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)`

  // Resolve visual principles: prefer visual_guardrails.visual_principles, fallback to image_analysis
  const visualPrinciples: VisualPrinciple[] = (() => {
    if (visualGuardrails?.visual_principles?.length) return visualGuardrails.visual_principles
    if (imageAnalysis?.visual_styles?.length) return imageAnalysis.visual_styles as VisualPrinciple[]
    const arr: VisualPrinciple[] = []
    if (imageAnalysis?.visual_style_1?.title) arr.push(imageAnalysis.visual_style_1 as VisualPrinciple)
    if (imageAnalysis?.visual_style_2?.title) arr.push(imageAnalysis.visual_style_2 as VisualPrinciple)
    if (imageAnalysis?.visual_style_3?.title) arr.push(imageAnalysis.visual_style_3 as VisualPrinciple)
    // Always provide 3 default slots if empty in edit mode
    while (arr.length < 3) {
      arr.push({ title: '', description: '' })
    }
    return arr
  })()

  const photo = visualGuardrails?.photography || {}
  const graphics = visualGuardrails?.graphics || {}

  return (
    <section
      style={{
        backgroundColor: CANVAS.bg,
        paddingTop: 64,
        paddingBottom: 80,
      }}
    >
      <SectionRule />
      <div style={{ paddingTop: 64 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
          }}
          className="visual-direction-grid"
        >
          {/* ── LEFT: Visual Principles + Moodboard ── */}
          <div>
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
              VISUAL DIRECTION
            </p>

            {/* Visual North Star */}
            {(visualGuardrails?.visual_north_star || isEditing) && (
              <div style={{ marginBottom: 32 }}>
                <EditableText
                  value={visualGuardrails?.visual_north_star || ''}
                  onChange={onUpdateVisualNorthStar}
                  isEditing={isEditing}
                  multiline
                  style={{
                    fontFamily: secondaryStack,
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: CANVAS.fgDefault,
                    margin: 0,
                  }}
                  placeholder="Visual North Star statement..."
                />
              </div>
            )}

            {/* 3 Visual Principles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                marginBottom: 40,
              }}
              className="visual-principles-grid"
            >
              {visualPrinciples.slice(0, 3).map((vp, i) => (
                <div key={i}>
                  <EditableText
                    value={vp.title || ''}
                    onChange={(val) => onUpdateVisualPrinciple?.(i, 'title', val)}
                    isEditing={isEditing}
                    style={{
                      fontFamily: primaryStack,
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      color: CANVAS.fgDefault,
                      marginBottom: 8,
                    }}
                    placeholder={`Theme ${i + 1}...`}
                  />
                  <EditableText
                    value={vp.description || ''}
                    onChange={(val) => onUpdateVisualPrinciple?.(i, 'description', val)}
                    isEditing={isEditing}
                    multiline
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: CANVAS.fgDefault,
                      margin: 0,
                    }}
                    placeholder="Theme description..."
                  />
                </div>
              ))}
            </div>

            {/* Moodboard Grid (6 slots) */}
            <SubLabel secondaryStack={secondaryStack}>MOODBOARD (6 ASSETS)</SubLabel>
            <MoodboardGrid
              images={moodboardImages}
              brandName={brandName}
              isEditing={isEditing}
              onUploadSlot={onUploadMoodboardSlot}
            />
          </div>

          {/* ── RIGHT: Visual Guardrails (Photography & Graphics) ── */}
          <div>
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
              VISUAL GUARDRAILS
            </p>

            {/* Photography sub-section */}
            <div style={{ marginBottom: 40 }}>
              <SubLabel secondaryStack={secondaryStack}>PHOTOGRAPHY</SubLabel>

              {/* Lighting */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: secondaryStack, fontSize: 12, fontWeight: 700, color: CANVAS.fgDefault, marginBottom: 6 }}>
                  LIGHTING
                </p>
                <EditableText
                  value={photo.lighting || ''}
                  onChange={(val) => onUpdatePhotography?.('lighting', val)}
                  isEditing={isEditing}
                  multiline
                  style={{ fontFamily: secondaryStack, fontSize: 13, lineHeight: 1.55, color: CANVAS.fgDefault }}
                  placeholder="Lighting direction..."
                />
              </div>

              {/* Composition */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: secondaryStack, fontSize: 12, fontWeight: 700, color: CANVAS.fgDefault, marginBottom: 6 }}>
                  COMPOSITION
                </p>
                <EditableText
                  value={photo.composition || ''}
                  onChange={(val) => onUpdatePhotography?.('composition', val)}
                  isEditing={isEditing}
                  multiline
                  style={{ fontFamily: secondaryStack, fontSize: 13, lineHeight: 1.55, color: CANVAS.fgDefault }}
                  placeholder="Composition direction..."
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: secondaryStack, fontSize: 12, fontWeight: 700, color: CANVAS.fgDefault, marginBottom: 6 }}>
                  SUBJECT &amp; CASTING
                </p>
                <EditableText
                  value={photo.subject || ''}
                  onChange={(val) => onUpdatePhotography?.('subject', val)}
                  isEditing={isEditing}
                  multiline
                  style={{ fontFamily: secondaryStack, fontSize: 13, lineHeight: 1.55, color: CANVAS.fgDefault }}
                  placeholder="Subject and casting direction..."
                />
              </div>
            </div>

            {/* Graphics sub-section */}
            <div>
              <SubLabel secondaryStack={secondaryStack}>GRAPHICS &amp; ICONS</SubLabel>

              {/* Shapes & Patterns */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: secondaryStack, fontSize: 12, fontWeight: 700, color: CANVAS.fgDefault, marginBottom: 6 }}>
                  SHAPES &amp; PATTERNS
                </p>
                <EditableText
                  value={graphics.shapes_patterns || ''}
                  onChange={(val) => onUpdateGraphics?.('shapes_patterns', val)}
                  isEditing={isEditing}
                  multiline
                  style={{ fontFamily: secondaryStack, fontSize: 13, lineHeight: 1.55, color: CANVAS.fgDefault }}
                  placeholder="Shapes and patterns guidelines..."
                />
              </div>

              {/* Iconography */}
              <div>
                <p style={{ fontFamily: secondaryStack, fontSize: 12, fontWeight: 700, color: CANVAS.fgDefault, marginBottom: 6 }}>
                  ICONOGRAPHY
                </p>
                <EditableText
                  value={graphics.icons || ''}
                  onChange={(val) => onUpdateGraphics?.('icons', val)}
                  isEditing={isEditing}
                  multiline
                  style={{ fontFamily: secondaryStack, fontSize: 13, lineHeight: 1.55, color: CANVAS.fgDefault }}
                  placeholder="Iconography style..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
