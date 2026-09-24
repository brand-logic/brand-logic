'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, X, ExternalLink, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PdfDownloadButton from '@/components/pdf-download-button'
import { CANVAS } from '@/lib/brand-summary-tokens'
import { resolveHeroColors, contrastRatio } from '@/lib/color-contrast'
import type { PaletteColor } from '@/lib/color-contrast'

import HeroBar from './hero-bar'
import FoundationRow from './foundation-row'
import BrandPillars from './brand-pillars'
import TypographyBlock from './typography-block'
import VisualDirectionAndThemes from './visual-direction'
import SummaryFooter from './summary-footer'

import { uploadBrandLogo, deleteBrandLogo, uploadMoodboardSlot, uploadCustomFontFile } from '@/app/brand/[id]/storage-actions'
import { saveBrandSummaryEdits } from '@/app/brand/[id]/edit-actions'

interface BrandSummaryViewProps {
  brand: any
  username: string
  isOwner: boolean
  curatedFonts: {
    primaryFonts: string[]
    secondaryFonts: string[]
  }
}

export default function BrandSummaryView({
  brand,
  username,
  isOwner,
  curatedFonts,
}: BrandSummaryViewProps) {
  // Read exclusively from current_data (with fallback to ai_summary or brand attributes)
  const initialSource = brand.current_data && Object.keys(brand.current_data).length > 0
    ? brand.current_data
    : (brand.ai_summary || {})

  const [currentData, setCurrentData] = useState<any>(() => {
    return {
      brand_name: initialSource.brand_name || brand.brand_name || '',
      logo_url: initialSource.logo_url || null,
      taglines: initialSource.taglines || {},
      positioning_statement: initialSource.positioning_statement || '',
      mission_statement: initialSource.mission_statement || brand.mission_statement || '',
      vision_statement: initialSource.vision_statement || brand.vision_statement || '',
      brand_persona: initialSource.brand_persona || {},
      brand_voice_summary: initialSource.brand_voice_summary || '',
      tone_examples: initialSource.tone_examples || [],
      core_values: initialSource.core_values || (brand.core_values || []).map((v: string) => ({ value: v, descriptor: '' })),
      messaging_pillars: initialSource.messaging_pillars || [],
      social_caption: initialSource.social_caption || '',
      visual_guardrails: initialSource.visual_guardrails || {},
      typography_examples: initialSource.typography_examples || {},
      image_analysis: initialSource.image_analysis || {},
      colors: (initialSource.colors && initialSource.colors.length > 0)
        ? initialSource.colors
        : (brand.brand_colors || []),
      moodboard_images: initialSource.moodboard_images || brand.moodboard_images || [],
      primary_font: initialSource.primary_font || brand.typography_pairing?.primaryFont || 'Inter',
      secondary_font: initialSource.secondary_font || brand.typography_pairing?.secondaryFont || 'Inter',
      custom_font: initialSource.custom_font || null,
      voice_sliders: initialSource.voice_sliders || brand.brand_tone || {},
    }
  })

  const [savedSnapshot, setSavedSnapshot] = useState<any>(currentData)
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [copiedLink, setCopiedLink] = useState(false)

  // ── Contrast Accessibility Validation ───────────────────────────────────────
  const palette: PaletteColor[] = currentData.colors || []
  const primaryColor = palette.find(c => c.role?.toUpperCase() === 'PRIMARY')?.hex
  const accentColor = palette.find(c => c.role?.toUpperCase() === 'ACCENT')?.hex

  let contrastError: string | null = null
  if (primaryColor && accentColor) {
    const ratio = contrastRatio(primaryColor, accentColor)
    if (ratio < 4.5) {
      contrastError = "This color combination doesn't meet accessibility contrast. Try a darker/lighter shade."
    }
  }

  // Resolve hero colors
  const heroColors = resolveHeroColors(palette.length > 0 ? palette : [
    { hex: '#1A1A1A', role: 'PRIMARY' }
  ])

  // Resolve accent color for CTA
  const accentHex = palette.find(c => c.role?.toUpperCase() === 'ACCENT')?.hex
    || palette.find(c => c.role?.toUpperCase() === 'SECONDARY')?.hex
    || '#D4AF37'

  // ── Fonts ──────────────────────────────────────────────────────────────────
  const primaryFont: string = currentData.primary_font || 'Inter'
  const secondaryFont: string = currentData.secondary_font || 'Inter'
  const customFont = currentData.custom_font

  const fontFamilies = [...new Set([primaryFont, secondaryFont])]
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontFamilies
    .map(f => `family=${f.replace(/ /g, '+')}`)
    .join('&')}&display=swap`

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEnterEditMode = () => {
    setSavedSnapshot(JSON.parse(JSON.stringify(currentData)))
    setIsEditing(true)
  }

  const handleCancelEditMode = () => {
    setCurrentData(JSON.parse(JSON.stringify(savedSnapshot)))
    setIsEditing(false)
  }

  const handleSaveEdits = () => {
    if (contrastError) {
      toast.error(contrastError)
      return
    }

    startTransition(async () => {
      try {
        const res = await saveBrandSummaryEdits(brand.id, currentData)
        if (res.error) {
          toast.error(res.error)
          return
        }
        setSavedSnapshot(JSON.parse(JSON.stringify(currentData)))
        setIsEditing(false)
        toast.success('Brand summary saved successfully! Changes are live.')
      } catch (err: any) {
        toast.error(err.message || 'Failed to save edits')
      }
    })
  }

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/${username}/${brand.slug}`
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    toast.success('Public brand link copied to clipboard!')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Upload Logo
  const handleLogoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { publicUrl } = await uploadBrandLogo(brand.id, formData)
    setCurrentData((prev: any) => ({ ...prev, logo_url: publicUrl }))
    toast.success('Logo uploaded!')
  }

  const handleLogoDelete = async () => {
    await deleteBrandLogo(brand.id)
    setCurrentData((prev: any) => ({ ...prev, logo_url: null }))
    toast.success('Logo removed')
  }

  // Moodboard Upload
  const handleMoodboardSlotUpload = async (slotIndex: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { publicUrl } = await uploadMoodboardSlot(brand.id, slotIndex, formData)
    setCurrentData((prev: any) => {
      const updatedImages = [...(prev.moodboard_images || [])]
      updatedImages[slotIndex] = publicUrl
      return { ...prev, moodboard_images: updatedImages }
    })
    toast.success(`Slot ${slotIndex + 1} image updated!`)
  }

  // Custom Font Upload
  const handleCustomFontUpload = async (file: File, target: 'primary' | 'secondary') => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await uploadCustomFontFile(brand.id, file.name.replace(/\.[^/.]+$/, ''), formData)
    setCurrentData((prev: any) => ({
      ...prev,
      custom_font: res,
      [target === 'primary' ? 'primary_font' : 'secondary_font']: res.family,
    }))
    toast.success(`Custom font "${res.family}" uploaded and applied!`)
  }

  return (
    <>
      {/* Google Fonts Preconnect & Stylesheet */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={googleFontsUrl} />

      {/* Custom Font @font-face if uploaded */}
      {customFont && (
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: '${customFont.family}';
            src: url('${customFont.url}') format('${customFont.format || 'woff2'}');
            font-display: swap;
          }
        `}} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-brand-primary: '${primaryFont}', 'Inter', system-ui, sans-serif;
          --font-brand-secondary: '${secondaryFont}', system-ui, sans-serif;
        }

        /* ─── Responsive collapses ─── */
        @media (max-width: 1023px) {
          .hero-bar-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            text-align: left !important;
          }
          .foundation-row-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .brand-pillars-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .typography-color-inner,
          .visual-direction-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }

        @media (max-width: 767px) {
          #hero-bar {
            padding: 40px 24px !important;
          }
          .visual-principles-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ─── Print / PDF export ─── */
        @media print {
          .brand-summary-sticky-nav { display: none !important; }
          body { background: ${CANVAS.bg} !important; }
          #brand-guidelines {
            max-width: 1440px !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: ${CANVAS.bg} !important;
          }
          .brand-summary-content {
            background-color: ${CANVAS.bg} !important;
          }
        }

        body.pdf-export .brand-summary-sticky-nav { display: none !important; }
        body.pdf-export #brand-guidelines {
          max-width: 1440px !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: ${CANVAS.bg} !important;
        }
        body.pdf-export .brand-summary-content {
          background-color: ${CANVAS.bg} !important;
        }
      `}} />

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: CANVAS.bg,
        }}
      >
        {/* ── Sticky Action Bar (Rendered only for Owner, Acceptance Criteria 2 & 3) ── */}
        {isOwner && (
          <nav
            className="brand-summary-sticky-nav"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 50,
              padding: '12px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(245, 243, 238, 0.92)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link
                href="/dashboard"
                style={{
                  color: CANVAS.fgMuted,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
                aria-label="Back to dashboard"
              >
                <ArrowLeft style={{ width: 18, height: 18 }} />
              </Link>
              <div>
                <h1
                  style={{
                    fontFamily: `var(--font-favorit), system-ui, sans-serif`,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: CANVAS.fgDefault,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {currentData.brand_name || brand.brand_name}
                </h1>
                <p
                  style={{
                    fontFamily: `var(--font-favorit), system-ui, sans-serif`,
                    fontSize: 10,
                    color: CANVAS.fgMuted,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    margin: '2px 0 0 0',
                  }}
                >
                  {isEditing ? 'Editing Brand Summary' : 'Brand Summary'}
                </p>
              </div>
            </div>

            {/* Sticky Bar Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Copy Public URL */}
              <button
                type="button"
                onClick={handleCopyPublicLink}
                style={{
                  fontFamily: `var(--font-favorit), system-ui, sans-serif`,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: '#4A4A4A',
                  background: 'transparent',
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: 9999,
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
                title="Copy shareable public link"
              >
                {copiedLink ? <Check style={{ width: 13, height: 13, color: '#16A34A' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                <span>{copiedLink ? 'Copied!' : `/${username}/${brand.slug}`}</span>
              </button>

              {/* Edit Mode Toggle / Save Actions */}
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancelEditMode}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs font-medium text-[#666] hover:bg-black/5"
                    disabled={isPending}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdits}
                    size="sm"
                    disabled={isPending || !!contrastError}
                    className="bg-[#111111] hover:bg-[#1D1D1D] text-white rounded-full px-5 text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEnterEditMode}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs font-medium gap-1.5 border-black/20 hover:bg-black/5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit Brand
                  </Button>
                  <PdfDownloadButton brandName={currentData.brand_name || brand.brand_name} />
                </>
              )}
            </div>
          </nav>
        )}

        {/* ── Document: all 6 sections captured by PDF button ── */}
        <div
          id="brand-guidelines"
          style={{
            maxWidth: 1440,
            margin: '0 auto',
            backgroundColor: CANVAS.bg,
          }}
        >
          {/* Section 1 — Hero Bar */}
          <HeroBar
            brandName={currentData.brand_name || brand.brand_name || ''}
            tagline1={currentData.taglines?.tagline_1 || ''}
            tagline2={currentData.taglines?.tagline_2}
            positioningStatement={currentData.positioning_statement || ''}
            heroColors={heroColors}
            primaryFont={primaryFont}
            secondaryFont={secondaryFont}
            logoUrl={currentData.logo_url}
            isEditing={isEditing}
            onUpdateTagline1={(val) =>
              setCurrentData((prev: any) => ({
                ...prev,
                taglines: { ...(prev.taglines || {}), tagline_1: val },
              }))
            }
            onUpdateTagline2={(val) =>
              setCurrentData((prev: any) => ({
                ...prev,
                taglines: { ...(prev.taglines || {}), tagline_2: val },
              }))
            }
            onUpdatePositioning={(val) =>
              setCurrentData((prev: any) => ({
                ...prev,
                positioning_statement: val,
              }))
            }
            onLogoUpload={handleLogoUpload}
            onLogoDelete={handleLogoDelete}
          />

          {/* Sections 2-6: inner content padding */}
          <div
            style={{
              padding: '0 80px',
              backgroundColor: CANVAS.bg,
            }}
            className="brand-summary-content"
          >
            {/* Section 2 — Foundation Row */}
            <FoundationRow
              missionStatement={currentData.mission_statement || ''}
              visionStatement={currentData.vision_statement || ''}
              brandPersona={currentData.brand_persona || {}}
              voiceSliders={currentData.voice_sliders || {}}
              toneExamples={currentData.tone_examples || []}
              brandVoiceSummary={currentData.brand_voice_summary || undefined}
              coreValues={currentData.core_values || []}
              messagingPillars={currentData.messaging_pillars || []}
              socialCaption={currentData.social_caption || ''}
              primaryFont={primaryFont}
              secondaryFont={secondaryFont}
              isEditing={isEditing}
              onUpdateMission={(val) => setCurrentData((prev: any) => ({ ...prev, mission_statement: val }))}
              onUpdateVision={(val) => setCurrentData((prev: any) => ({ ...prev, vision_statement: val }))}
              onUpdatePersonaName={(val) =>
                setCurrentData((prev: any) => ({
                  ...prev,
                  brand_persona: { ...(prev.brand_persona || {}), persona_name: val },
                }))
              }
              onUpdatePersonaDesc={(val) =>
                setCurrentData((prev: any) => ({
                  ...prev,
                  brand_persona: { ...(prev.brand_persona || {}), persona_description: val },
                }))
              }
              onUpdatePersonaKeywords={(val) =>
                setCurrentData((prev: any) => ({
                  ...prev,
                  brand_persona: { ...(prev.brand_persona || {}), persona_keywords: val },
                }))
              }
              onUpdateVoiceSummary={(val) => setCurrentData((prev: any) => ({ ...prev, brand_voice_summary: val }))}
              onUpdateToneExample={(idx, field, val) =>
                setCurrentData((prev: any) => {
                  const arr = [...(prev.tone_examples || [])]
                  arr[idx] = { ...arr[idx], [field]: val }
                  return { ...prev, tone_examples: arr }
                })
              }
              onUpdateCoreValue={(idx, field, val) =>
                setCurrentData((prev: any) => {
                  const arr = [...(prev.core_values || [])]
                  arr[idx] = { ...arr[idx], [field]: val }
                  return { ...prev, core_values: arr }
                })
              }
              onUpdateSocialCaption={(val) => setCurrentData((prev: any) => ({ ...prev, social_caption: val }))}
            />

            {/* Section 3 — Brand Pillars */}
            <BrandPillars
              pillars={currentData.messaging_pillars || []}
              primaryFont={primaryFont}
              isEditing={isEditing}
              onUpdatePillar={(idx, field, val) =>
                setCurrentData((prev: any) => {
                  const arr = [...(prev.messaging_pillars || [])]
                  arr[idx] = { ...arr[idx], [field]: val }
                  return { ...prev, messaging_pillars: arr }
                })
              }
            />

            {/* Section 4 — Typography + Color Palette */}
            <TypographyBlock
              primaryFont={primaryFont}
              secondaryFont={secondaryFont}
              typographyExamples={currentData.typography_examples || {}}
              colors={palette}
              accentHex={accentHex}
              isEditing={isEditing}
              availablePrimaryFonts={curatedFonts.primaryFonts}
              availableSecondaryFonts={curatedFonts.secondaryFonts}
              contrastError={contrastError}
              onUpdatePrimaryFont={(f) => setCurrentData((prev: any) => ({ ...prev, primary_font: f }))}
              onUpdateSecondaryFont={(f) => setCurrentData((prev: any) => ({ ...prev, secondary_font: f }))}
              onUploadCustomFont={handleCustomFontUpload}
              onUpdateTypographyExamples={(examples) =>
                setCurrentData((prev: any) => ({ ...prev, typography_examples: examples }))
              }
              onUpdateColor={(idx, updatedColor) =>
                setCurrentData((prev: any) => {
                  const arr = [...(prev.colors || [])]
                  arr[idx] = updatedColor
                  return { ...prev, colors: arr }
                })
              }
            />

            {/* Section 5 — Visual Direction + Themes + Moodboard */}
            <VisualDirectionAndThemes
              visualGuardrails={currentData.visual_guardrails || {}}
              imageAnalysis={currentData.image_analysis || {}}
              moodboardImages={currentData.moodboard_images || []}
              brandName={currentData.brand_name || brand.brand_name || ''}
              primaryFont={primaryFont}
              secondaryFont={secondaryFont}
              isEditing={isEditing}
              onUpdateVisualNorthStar={(val) =>
                setCurrentData((prev: any) => ({
                  ...prev,
                  visual_guardrails: { ...(prev.visual_guardrails || {}), visual_north_star: val },
                }))
              }
              onUpdateVisualPrinciple={(idx, field, val) =>
                setCurrentData((prev: any) => {
                  const vg = { ...(prev.visual_guardrails || {}) }
                  const arr = [...(vg.visual_principles || [])]
                  while (arr.length <= idx) arr.push({ title: '', description: '' })
                  arr[idx] = { ...arr[idx], [field]: val }
                  vg.visual_principles = arr
                  return { ...prev, visual_guardrails: vg }
                })
              }
              onUpdatePhotography={(field, val) =>
                setCurrentData((prev: any) => {
                  const vg = { ...(prev.visual_guardrails || {}) }
                  const photo = { ...(vg.photography || {}), [field]: val }
                  vg.photography = photo
                  return { ...prev, visual_guardrails: vg }
                })
              }
              onUpdateGraphics={(field, val) =>
                setCurrentData((prev: any) => {
                  const vg = { ...(prev.visual_guardrails || {}) }
                  const graphics = { ...(vg.graphics || {}), [field]: val }
                  vg.graphics = graphics
                  return { ...prev, visual_guardrails: vg }
                })
              }
              onUploadMoodboardSlot={handleMoodboardSlotUpload}
            />

            {/* Section 6 — Footer */}
            <SummaryFooter />
          </div>
        </div>
      </div>
    </>
  )
}
