'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { contrastRatio } from '@/lib/color-contrast'

export async function saveBrandSummaryEdits(brandId: string, updatedCurrentData: any) {
    if (!brandId) {
        return { error: 'Brand ID is required' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: brand, error: fetchError } = await supabase
        .from('brand_projects')
        .select('id, user_id, slug')
        .eq('id', brandId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !brand) {
        return { error: 'Brand not found or unauthorized' }
    }

    // Accessibility Contrast Guard Check (Section 3.3)
    const palette = updatedCurrentData.colors || []
    const primary = palette.find((c: any) => c.role?.toUpperCase() === 'PRIMARY')?.hex
    const accent = palette.find((c: any) => c.role?.toUpperCase() === 'ACCENT')?.hex

    if (primary && accent) {
        const ratio = contrastRatio(primary, accent)
        // If primary and accent contrast is severely insufficient (< 4.5:1)
        if (ratio < 4.5) {
            return {
                error: "This color combination doesn't meet accessibility contrast. Try a darker/lighter shade."
            }
        }
    }

    // Update current_data
    const { error: updateError } = await supabase
        .from('brand_projects')
        .update({
            current_data: updatedCurrentData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', brandId)
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Failed to update brand current_data:', updateError)
        return { error: updateError.message || 'Failed to save edits' }
    }

    revalidatePath(`/brand/${brandId}`)
    revalidatePath(`/brand/${brandId}/guidelines`)
    revalidatePath('/dashboard')

    return { success: true }
}
