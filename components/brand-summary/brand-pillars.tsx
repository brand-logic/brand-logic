'use client'

import React from 'react'
import { CANVAS } from '@/lib/brand-summary-tokens'
import SectionRule from './section-rule'
import EditableText from './editable-text'

interface Pillar {
  title: string
  description: string
}

interface BrandPillarsProps {
  pillars: Pillar[]
  primaryFont: string
  isEditing?: boolean
  onUpdatePillar?: (index: number, field: keyof Pillar, val: string) => void
}

export default function BrandPillars({
  pillars,
  primaryFont,
  isEditing = false,
  onUpdatePillar,
}: BrandPillarsProps) {
  if (!pillars || pillars.length === 0) return null

  const primaryFontStack = `'${primaryFont}', 'Inter', system-ui, sans-serif`
  const secondaryFontStack = `var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)`

  return (
    <section
      style={{
        backgroundColor: CANVAS.bg,
        paddingTop: 64,
        paddingBottom: 64,
      }}
    >
      <SectionRule />

      <div style={{ paddingTop: 64 }}>
        {/* Section label */}
        <p
          style={{
            fontFamily: secondaryFontStack,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: CANVAS.fgMuted,
            marginBottom: 40,
          }}
        >
          BRAND PILLARS
        </p>

        {/* 3-column pillar grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 64,
          }}
          className="brand-pillars-grid"
        >
          {pillars.slice(0, 3).map((pillar, i) => (
            <div key={i}>
              {/* Pillar title */}
              <EditableText
                value={pillar.title || ''}
                onChange={(val) => onUpdatePillar?.(i, 'title', val)}
                isEditing={isEditing}
                style={{
                  fontFamily: primaryFontStack,
                  fontSize: 28,
                  fontWeight: 400,
                  lineHeight: 1.15,
                  color: CANVAS.fgDefault,
                  marginBottom: 16,
                }}
                placeholder="Pillar Title..."
              />
              {/* Pillar body */}
              <div style={{ marginTop: 8 }}>
                <EditableText
                  value={pillar.description || ''}
                  onChange={(val) => onUpdatePillar?.(i, 'description', val)}
                  isEditing={isEditing}
                  multiline
                  style={{
                    fontFamily: secondaryFontStack,
                    fontSize: 14,
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: CANVAS.fgDefault,
                  }}
                  placeholder="Pillar description..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
