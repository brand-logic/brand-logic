
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { generateBrandIdentityAI } from '@/utils/gemini'
import { getUniqueUserSlug } from '@/lib/slug'

export type GenerationState = {
    message?: string
    error?: boolean
}

export async function generateBrandIdentity(
    prevState: GenerationState,
    formData: FormData
) {
    const id = formData.get('id') as string

    if (!id) {
        return { message: 'Brand ID is missing', error: true }
    }

    const supabase = await createClient()

    // 1. Fetch Brand Data
    const { data: brand, error: fetchError } = await supabase
        .from('brand_projects')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !brand) {
        return { message: 'Failed to fetch brand data', error: true }
    }

    // Gate: Generation runs exactly once per brand
    if (brand.is_generated) {
        redirect(`/brand/${id}`)
    }

    // 2. Validate completeness
    const missing: string[] = []
    if (!brand.brand_name?.trim()) missing.push('Brand Name')
    if (!brand.industry?.trim()) missing.push('Industry')
    if (!brand.description?.trim()) missing.push('Brand Description')
    if (!brand.target_audience?.trim()) missing.push('Target Audience')
    if (!brand.mission_statement?.trim()) missing.push('Mission Statement')
    if (!brand.vision_statement?.trim()) missing.push('Vision Statement')
    if (!brand.brand_presence?.trim()) missing.push('Brand Presence')
    
    if (!brand.core_values || brand.core_values.length < 3) {
        missing.push('Core Values (minimum 3)')
    }
    if (!brand.brand_tone) {
        missing.push('Brand Tone')
    }
    if (!brand.moodboard_images || brand.moodboard_images.length < 6) {
        missing.push('Moodboard Images (minimum 6)')
    }
    if (!brand.brand_colors || brand.brand_colors.length === 0) {
        missing.push('Color Palette')
    }
    if (!brand.typography_pairing) {
        missing.push('Typography Selection')
    }

    if (missing.length > 0) {
        return {
            message: `Please complete all sections before generating. Missing: ${missing.join(', ')}`,
            error: true
        }
    }

    // 3. Call AI Generation
    let aiSummary
    try {
        await supabase
            .from('brand_projects')
            .update({ status: 'generating' })
            .eq('id', id)

        aiSummary = await generateBrandIdentityAI(brand)

    } catch (error) {
        console.error('AI Generation Failed:', error)
        await supabase
            .from('brand_projects')
            .update({ status: 'draft' })
            .eq('id', id)

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { message: `AI Generation Failed: ${errorMessage}`, error: true }
    }

    // 4. Construct complete generated payload (immutable initial baseline + live current_data)
    const fullGeneratedData = {
        brand_name: brand.brand_name,
        brand_type: brand.brand_type,
        industry: brand.industry,
        taglines: aiSummary.taglines || {},
        positioning_statement: aiSummary.positioning_statement || '',
        mission_statement: aiSummary.mission_statement || brand.mission_statement || '',
        vision_statement: aiSummary.vision_statement || brand.vision_statement || '',
        brand_presence: brand.brand_presence || '',
        brand_persona: aiSummary.brand_persona || {},
        brand_voice_summary: aiSummary.brand_voice_summary || '',
        tone_examples: aiSummary.tone_examples || [],
        core_values: aiSummary.core_values || (brand.core_values || []).map((v: string) => ({ value: v, descriptor: '' })),
        messaging_pillars: aiSummary.messaging_pillars || [],
        social_caption: aiSummary.social_caption || '',
        visual_guardrails: aiSummary.visual_guardrails || {},
        typography_examples: aiSummary.typography_examples || {},
        image_analysis: aiSummary.image_analysis || {},
        colors: (aiSummary.colors && aiSummary.colors.length > 0)
            ? aiSummary.colors
            : (brand.brand_colors || []),
        moodboard_images: brand.moodboard_images || [],
        primary_font: brand.typography_pairing?.primaryFont || 'Inter',
        secondary_font: brand.typography_pairing?.secondaryFont || 'Inter',
        voice_sliders: brand.brand_tone || {},
        logo_url: null,
    }

    // Ensure slug
    let slug = brand.slug
    if (!slug) {
        slug = await getUniqueUserSlug(supabase, brand.user_id, brand.brand_name, brand.id)
    }

    // 5. Save Results to both generated_data and current_data
    const { error: saveError } = await supabase
        .from('brand_projects')
        .update({
            ai_summary: aiSummary,
            generated_data: fullGeneratedData,
            current_data: fullGeneratedData,
            is_generated: true,
            slug: slug,
            is_published: true,
            status: 'completed',
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (saveError) {
        return { message: 'Failed to save brand identity', error: true }
    }

    // 6. Redirect to primary live Brand Summary deliverable
    redirect(`/brand/${id}`)
}
