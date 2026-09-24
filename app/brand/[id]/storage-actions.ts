'use server'

import { createClient } from '@/utils/supabase/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Upload or replace the Brand Logo in Supabase Storage.
 * Path: brands/{brand_id}/logo.{ext}
 */
export async function uploadBrandLogo(brandId: string, formData: FormData) {
    const file = formData.get('file') as File | null
    if (!file) throw new Error('No file provided')

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Logo must be less than 5MB')
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const allowed = ['png', 'svg', 'jpg', 'jpeg']
    if (!allowed.includes(ext)) {
        throw new Error('Accepted formats for logo are PNG, SVG, JPG')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: brand } = await supabase
        .from('brand_projects')
        .select('id, user_id')
        .eq('id', brandId)
        .eq('user_id', user.id)
        .single()

    if (!brand) throw new Error('Brand not found or unauthorized')

    // Clean up any old logo files to avoid orphaned files
    const { data: existingFiles } = await supabase.storage
        .from('brands')
        .list(`${brandId}`, { search: 'logo' })

    if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles
            .filter(f => f.name.startsWith('logo.'))
            .map(f => `${brandId}/${f.name}`)
        if (filesToRemove.length > 0) {
            await supabase.storage.from('brands').remove(filesToRemove)
        }
    }

    // Upload new logo
    const filePath = `${brandId}/logo.${ext}`
    const { error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Failed to upload logo: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
        .from('brands')
        .getPublicUrl(filePath)

    return { publicUrl }
}

/**
 * Delete brand logo
 */
export async function deleteBrandLogo(brandId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: existingFiles } = await supabase.storage
        .from('brands')
        .list(`${brandId}`, { search: 'logo' })

    if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles
            .filter(f => f.name.startsWith('logo.'))
            .map(f => `${brandId}/${f.name}`)
        if (filesToRemove.length > 0) {
            await supabase.storage.from('brands').remove(filesToRemove)
        }
    }

    return { success: true }
}

/**
 * Upload or replace a specific moodboard image slot (0 to 5).
 * Path: brands/{brand_id}/moodboard/{slot_index}.{ext}
 */
export async function uploadMoodboardSlot(
    brandId: string,
    slotIndex: number,
    formData: FormData
) {
    if (slotIndex < 0 || slotIndex >= 6) {
        throw new Error('Slot index must be between 0 and 5')
    }

    const file = formData.get('file') as File | null
    if (!file) throw new Error('No file provided')

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Image must be less than 5MB')
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowed.includes(ext)) {
        throw new Error('Accepted formats for moodboard images are JPG, PNG, WebP')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Verify ownership
    const { data: brand } = await supabase
        .from('brand_projects')
        .select('id, user_id')
        .eq('id', brandId)
        .eq('user_id', user.id)
        .single()

    if (!brand) throw new Error('Brand not found or unauthorized')

    // Delete previous image at this slot
    const { data: existingFiles } = await supabase.storage
        .from('brands')
        .list(`${brandId}/moodboard`, { search: `${slotIndex}.` })

    if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles
            .filter(f => f.name.startsWith(`${slotIndex}.`))
            .map(f => `${brandId}/moodboard/${f.name}`)
        if (filesToRemove.length > 0) {
            await supabase.storage.from('brands').remove(filesToRemove)
        }
    }

    // Upload new image
    const filePath = `${brandId}/moodboard/${slotIndex}.${ext}`
    const { error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        })

    if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
        .from('brands')
        .getPublicUrl(filePath)

    // Append timestamp query parameter to bust browser cache on replacement
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

    return { publicUrl: cacheBustedUrl }
}

/**
 * Upload a custom font file (.ttf, .otf, .woff, .woff2)
 * Path: brands/{brand_id}/fonts/{clean_family}.{ext}
 */
export async function uploadCustomFontFile(
    brandId: string,
    fontFamily: string,
    formData: FormData
) {
    const file = formData.get('file') as File | null
    if (!file) throw new Error('No font file provided')

    if (file.size > MAX_FILE_SIZE) {
        throw new Error('Font file must be less than 5MB')
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'woff2'
    const allowed = ['ttf', 'otf', 'woff', 'woff2']
    if (!allowed.includes(ext)) {
        throw new Error('Accepted formats for font files are TTF, OTF, WOFF, WOFF2')
    }

    const cleanFamily = (fontFamily || file.name.replace(/\.[^/.]+$/, ''))
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '_')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const filePath = `${brandId}/fonts/${cleanFamily}.${ext}`
    const { error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filePath, file, {
            cacheControl: '31536000',
            upsert: true,
        })

    if (uploadError) {
        throw new Error(`Failed to upload font: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
        .from('brands')
        .getPublicUrl(filePath)

    return {
        family: cleanFamily,
        url: publicUrl,
        format: ext === 'ttf' ? 'truetype' : ext === 'otf' ? 'opentype' : ext,
    }
}
