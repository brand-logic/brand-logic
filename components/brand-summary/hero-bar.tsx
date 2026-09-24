'use client'

import React, { useRef, useState } from 'react'
import { getBrandNameFontSize } from '@/lib/brand-summary-tokens'
import type { HeroColors } from '@/lib/color-contrast'
import EditableText from './editable-text'
import { Upload, X, Loader2 } from 'lucide-react'

interface HeroBarProps {
  brandName: string
  tagline1: string
  tagline2?: string
  positioningStatement: string
  heroColors: HeroColors
  primaryFont: string
  secondaryFont: string
  logoUrl?: string | null
  isEditing?: boolean
  onUpdateTagline1?: (val: string) => void
  onUpdateTagline2?: (val: string) => void
  onUpdatePositioning?: (val: string) => void
  onLogoUpload?: (file: File) => Promise<void>
  onLogoDelete?: () => Promise<void>
}

export default function HeroBar({
  brandName,
  tagline1,
  tagline2,
  positioningStatement,
  heroColors,
  primaryFont,
  secondaryFont,
  logoUrl,
  isEditing = false,
  onUpdateTagline1,
  onUpdateTagline2,
  onUpdatePositioning,
  onLogoUpload,
  onLogoDelete,
}: HeroBarProps) {
  const brandNameSize = getBrandNameFontSize(brandName || '')
  const primaryStack = `'${primaryFont}', 'Inter', system-ui, sans-serif`
  const secondaryStack = `var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)`

  const logoInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onLogoUpload) return
    try {
      setIsUploadingLogo(true)
      await onLogoUpload(file)
    } catch (err: any) {
      console.error('Logo upload failed:', err)
      alert(err.message || 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const eyebrowStyle: React.CSSProperties = {
    fontFamily: primaryStack,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: heroColors.eyebrow,
    margin: 0,
    lineHeight: 1.2,
  }

  return (
    <header
      id="hero-bar"
      style={{
        backgroundColor: heroColors.bg,
        width: '100%',
        minHeight: 280,
        padding: '64px 80px',
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 24,
          alignItems: 'flex-start',
        }}
        className="hero-bar-grid"
      >
        {/* Column 1 — Logo + Brand Name */}
        <div>
          {/* Logo Display / Upload Slot */}
          {logoUrl ? (
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${brandName} logo`}
                style={{
                  maxHeight: 48,
                  maxWidth: 160,
                  objectFit: 'contain',
                }}
              />
              {isEditing && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: heroColors.bodyColor,
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    {isUploadingLogo ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Replace'}
                  </button>
                  {onLogoDelete && (
                    <button
                      type="button"
                      onClick={onLogoDelete}
                      style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: heroColors.bodyColor,
                        padding: '3px 6px',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      title="Remove Logo"
                    >
                      <X style={{ width: 10, height: 10 }} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : isEditing ? (
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                  color: heroColors.eyebrow,
                  fontSize: 11,
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload style={{ width: 12, height: 12 }} />}
                + Upload Logo (Max 48px)
              </button>
            </div>
          ) : null}

          {/* Hidden File Input for Logo */}
          <input
            ref={logoInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg"
            style={{ display: 'none' }}
            onChange={handleLogoFileChange}
          />

          <p style={eyebrowStyle}>BRAND NAME</p>
          <div style={{ height: 16 }} />
          <h1
            style={{
              fontFamily: primaryStack,
              fontSize: brandNameSize,
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              color: heroColors.bodyColor,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {brandName || ''}
          </h1>
        </div>

        {/* Column 2 — Tagline */}
        <div style={{ textAlign: 'center' }}>
          <p style={eyebrowStyle}>TAGLINE</p>
          <div style={{ height: 16 }} />
          <div>
            <EditableText
              value={tagline1}
              onChange={onUpdateTagline1}
              isEditing={isEditing}
              style={{
                fontFamily: primaryStack,
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.3,
                color: heroColors.bodyColor,
                margin: 0,
                textAlign: 'center',
              }}
              placeholder="Primary tagline..."
            />
            {(tagline2 || isEditing) && (
              <div style={{ marginTop: 6 }}>
                <EditableText
                  value={tagline2 || ''}
                  onChange={onUpdateTagline2}
                  isEditing={isEditing}
                  style={{
                    fontFamily: primaryStack,
                    fontSize: 28,
                    fontWeight: 400,
                    lineHeight: 1.3,
                    color: heroColors.bodyColor,
                    margin: 0,
                    textAlign: 'center',
                  }}
                  placeholder="+ Secondary tagline (optional)..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Column 3 — One-Liner */}
        <div style={{ textAlign: 'right' }}>
          <p style={eyebrowStyle}>ONE-LINER</p>
          <div style={{ height: 16 }} />
          <div style={{ maxWidth: 280, marginLeft: 'auto' }}>
            <EditableText
              value={positioningStatement}
              onChange={onUpdatePositioning}
              isEditing={isEditing}
              multiline
              style={{
                fontFamily: secondaryStack,
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.5,
                color: heroColors.bodyColor,
                margin: 0,
                textAlign: 'right',
              }}
              placeholder="Brand positioning statement..."
            />
          </div>
        </div>
      </div>
    </header>
  )
}
