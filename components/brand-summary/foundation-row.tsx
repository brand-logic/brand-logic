'use client'

import React from 'react'
import { CANVAS } from '@/lib/brand-summary-tokens'
import EditableText from './editable-text'

interface CoreValueDescriptor {
  value: string
  descriptor: string
}

interface MessagingPillar {
  title: string
  description: string
}

interface ToneExample {
  tone_name: string
  tone_description: string
  example_1: string
  example_2?: string
}

interface BrandPersona {
  persona_name?: string
  persona_description?: string
  persona_keywords?: string[]
}

interface VoiceSliders {
  conversational_authoritative?: number
  conversational?: number
  calm_energetic?: number
  energetic?: number
  traditional_innovative?: number
  innovative?: number
  playful_serious?: number
}

interface FoundationRowProps {
  // Col 1
  missionStatement: string
  visionStatement: string
  brandPersona: BrandPersona
  // Col 2
  voiceSliders: VoiceSliders
  toneExamples: ToneExample[]
  brandVoiceSummary?: string
  // Col 3
  coreValues: CoreValueDescriptor[]
  messagingPillars: MessagingPillar[]
  socialCaption: string
  // Fonts
  primaryFont: string
  secondaryFont: string
  // Edit mode
  isEditing?: boolean
  onUpdateMission?: (val: string) => void
  onUpdateVision?: (val: string) => void
  onUpdatePersonaName?: (val: string) => void
  onUpdatePersonaDesc?: (val: string) => void
  onUpdatePersonaKeywords?: (val: string[]) => void
  onUpdateVoiceSummary?: (val: string) => void
  onUpdateToneExample?: (index: number, field: keyof ToneExample, val: string) => void
  onUpdateCoreValue?: (index: number, field: keyof CoreValueDescriptor, val: string) => void
  onUpdateSocialCaption?: (val: string) => void
}

function SectionLabel({ children, secondaryStack }: { children: React.ReactNode; secondaryStack: string }) {
  return (
    <p
      style={{
        fontFamily: secondaryStack,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: CANVAS.fgMuted,
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  )
}

/** Normalize slider values: DB stores 0-100, spec uses 1-10 → normalize to 0-100% */
function sliderPct(val?: number): number {
  if (val === undefined || val === null) return 50
  if (val <= 10) return (val / 10) * 100
  return val
}

export default function FoundationRow({
  missionStatement,
  visionStatement,
  brandPersona,
  voiceSliders,
  toneExamples,
  brandVoiceSummary,
  coreValues,
  messagingPillars,
  socialCaption,
  primaryFont,
  secondaryFont,
  isEditing = false,
  onUpdateMission,
  onUpdateVision,
  onUpdatePersonaName,
  onUpdatePersonaDesc,
  onUpdatePersonaKeywords,
  onUpdateVoiceSummary,
  onUpdateToneExample,
  onUpdateCoreValue,
  onUpdateSocialCaption,
}: FoundationRowProps) {
  const primaryStack = `'${primaryFont}', 'Inter', system-ui, sans-serif`
  const secondaryStack = `var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)`

  const sliderRows = [
    {
      left: 'Conversational',
      right: 'Authoritative',
      pct: sliderPct(voiceSliders.conversational_authoritative ?? voiceSliders.conversational),
    },
    {
      left: 'Calm',
      right: 'Energetic',
      pct: sliderPct(voiceSliders.calm_energetic ?? voiceSliders.energetic),
    },
    {
      left: 'Traditional',
      right: 'Innovative',
      pct: sliderPct(voiceSliders.traditional_innovative ?? voiceSliders.innovative),
    },
    {
      left: 'Playful',
      right: 'Serious',
      pct: sliderPct(voiceSliders.playful_serious),
    },
  ]

  const bodyStyle: React.CSSProperties = {
    fontFamily: secondaryStack,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.6,
    color: CANVAS.fgDefault,
    margin: 0,
  }

  const bodySmStyle: React.CSSProperties = {
    fontFamily: secondaryStack,
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.55,
    color: CANVAS.fgDefault,
    margin: 0,
  }

  return (
    <section
      style={{
        backgroundColor: CANVAS.bg,
        paddingTop: 80,
        paddingBottom: 64,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 64,
        }}
        className="foundation-row-grid"
      >
        {/* ══ COLUMN 1 — Mission, Vision, Persona ══ */}
        <div>
          <SectionLabel secondaryStack={secondaryStack}>MISSION</SectionLabel>
          <EditableText
            value={missionStatement}
            onChange={onUpdateMission}
            isEditing={isEditing}
            multiline
            style={bodyStyle}
            placeholder="Brand mission statement..."
          />

          <div style={{ height: 48 }} />

          <SectionLabel secondaryStack={secondaryStack}>VISION</SectionLabel>
          <EditableText
            value={visionStatement}
            onChange={onUpdateVision}
            isEditing={isEditing}
            multiline
            style={bodyStyle}
            placeholder="Brand vision statement..."
          />

          {/* Brand Persona sub-block */}
          {(brandPersona?.persona_name || brandPersona?.persona_description || isEditing) && (
            <div style={{ marginTop: 48 }}>
              <SectionLabel secondaryStack={secondaryStack}>BRAND PERSONA</SectionLabel>

              {/* Persona name */}
              <EditableText
                value={brandPersona?.persona_name || ''}
                onChange={onUpdatePersonaName}
                isEditing={isEditing}
                style={{
                  fontFamily: primaryStack,
                  fontSize: 34,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: CANVAS.fgDefault,
                  marginBottom: 16,
                }}
                placeholder="Persona Archetype Name..."
              />

              {/* Persona description */}
              <div style={{ marginTop: 12, marginBottom: 20 }}>
                <EditableText
                  value={brandPersona?.persona_description || ''}
                  onChange={onUpdatePersonaDesc}
                  isEditing={isEditing}
                  multiline
                  style={bodySmStyle}
                  placeholder="Persona description..."
                />
              </div>

              {/* Keywords */}
              <SectionLabel secondaryStack={secondaryStack}>KEYWORDS</SectionLabel>
              {isEditing ? (
                <div>
                  <EditableText
                    value={(brandPersona?.persona_keywords || []).join(', ')}
                    onChange={(val) => {
                      const kws = val.split(',').map((s) => s.trim()).filter(Boolean)
                      onUpdatePersonaKeywords?.(kws)
                    }}
                    isEditing={isEditing}
                    style={bodySmStyle}
                    placeholder="Enter keywords separated by commas..."
                  />
                  <p style={{ fontSize: 10, color: CANVAS.fgMuted, marginTop: 4 }}>
                    Separate keywords with commas
                  </p>
                </div>
              ) : brandPersona?.persona_keywords?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {brandPersona.persona_keywords.map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: secondaryStack,
                        fontSize: 12,
                        fontWeight: 500,
                        color: CANVAS.fgDefault,
                        border: `1px solid ${CANVAS.fgDefault}`,
                        borderRadius: 9999,
                        padding: '6px 14px',
                        display: 'inline-block',
                        lineHeight: 1,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ══ COLUMN 2 — Brand Voice ══ */}
        <div>
          <SectionLabel secondaryStack={secondaryStack}>BRAND VOICE</SectionLabel>

          {/* Voice summary sentence */}
          {(brandVoiceSummary || isEditing) && (
            <div style={{ marginBottom: 32 }}>
              <EditableText
                value={brandVoiceSummary || ''}
                onChange={onUpdateVoiceSummary}
                isEditing={isEditing}
                multiline
                style={bodyStyle}
                placeholder="Brand voice summary sentence..."
              />
            </div>
          )}

          {/* Sliders (fixed representation of generated tone) */}
          <div style={{ marginBottom: 40 }}>
            {sliderRows.map((row, i) => (
              <div key={i} style={{ marginBottom: i < sliderRows.length - 1 ? 20 : 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      fontWeight: 500,
                      color: CANVAS.fgDefault,
                    }}
                  >
                    {row.left}
                  </span>
                  <span
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 11,
                      fontWeight: 500,
                      color: CANVAS.fgDefault,
                    }}
                  >
                    {row.right}
                  </span>
                </div>
                {/* Track */}
                <div
                  style={{
                    width: '100%',
                    height: 2,
                    backgroundColor: CANVAS.borderSubtle,
                    borderRadius: 1,
                    position: 'relative',
                  }}
                  role="presentation"
                  aria-valuenow={Math.round(row.pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {/* Thumb */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      left: `${row.pct}%`,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: CANVAS.fgDefault,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Tone examples */}
          <div>
            {(toneExamples || []).slice(0, 3).map((tone, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 28 : 0 }}>
                {/* Tone name */}
                <EditableText
                  value={tone.tone_name || ''}
                  onChange={(val) => onUpdateToneExample?.(i, 'tone_name', val)}
                  isEditing={isEditing}
                  style={{
                    fontFamily: primaryStack,
                    fontSize: 22,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: CANVAS.fgDefault,
                    marginBottom: 8,
                  }}
                  placeholder="Tone Name..."
                />

                {/* Description */}
                <div style={{ marginTop: 4, marginBottom: 10 }}>
                  <EditableText
                    value={tone.tone_description || ''}
                    onChange={(val) => onUpdateToneExample?.(i, 'tone_description', val)}
                    isEditing={isEditing}
                    multiline
                    style={bodySmStyle}
                    placeholder="Tone description..."
                  />
                </div>

                {/* Example */}
                <div>
                  <EditableText
                    value={tone.example_1 || ''}
                    onChange={(val) => onUpdateToneExample?.(i, 'example_1', val)}
                    isEditing={isEditing}
                    multiline
                    style={{
                      fontFamily: secondaryStack,
                      fontSize: 13,
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                      color: CANVAS.fgMuted,
                    }}
                    placeholder="Example phrase..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ COLUMN 3 — Values + Messaging + Social Caption ══ */}
        <div>
          <SectionLabel secondaryStack={secondaryStack}>BRAND VALUES</SectionLabel>

          <div style={{ marginBottom: 40 }}>
            {(coreValues || []).map((val, i) => (
              <div key={i} style={{ marginBottom: i < coreValues.length - 1 ? 18 : 0 }}>
                {/* Value name */}
                <EditableText
                  value={val.value || ''}
                  onChange={(v) => onUpdateCoreValue?.(i, 'value', v)}
                  isEditing={isEditing}
                  style={{
                    fontFamily: secondaryStack,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    color: CANVAS.fgDefault,
                    marginBottom: 6,
                  }}
                  placeholder="VALUE NAME..."
                />
                {/* Descriptor */}
                <EditableText
                  value={val.descriptor || ''}
                  onChange={(v) => onUpdateCoreValue?.(i, 'descriptor', v)}
                  isEditing={isEditing}
                  multiline
                  style={bodySmStyle}
                  placeholder="One sentence explanation..."
                />
              </div>
            ))}
          </div>

          {/* Messaging pillars summary in Col 3 */}
          {messagingPillars?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionLabel secondaryStack={secondaryStack}>MESSAGING</SectionLabel>
              {messagingPillars.slice(0, 3).map((pillar, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: secondaryStack,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: CANVAS.fgDefault,
                    marginBottom: i < messagingPillars.length - 1 ? 14 : 0,
                  }}
                >
                  <strong style={{ fontWeight: 700 }}>{pillar.title}</strong>
                  {pillar.description ? `: ${pillar.description}` : ''}
                </p>
              ))}
            </div>
          )}

          {/* Social caption */}
          {(socialCaption || isEditing) && (
            <div>
              <SectionLabel secondaryStack={secondaryStack}>SOCIAL CAPTION</SectionLabel>
              <EditableText
                value={socialCaption || ''}
                onChange={onUpdateSocialCaption}
                isEditing={isEditing}
                multiline
                style={{
                  fontFamily: secondaryStack,
                  fontSize: 13,
                  fontStyle: 'italic',
                  lineHeight: 1.55,
                  color: CANVAS.fgDefault,
                }}
                placeholder="Sample social caption..."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
