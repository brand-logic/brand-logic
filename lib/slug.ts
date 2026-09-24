import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Converts a brand name to a URL-friendly slug.
 * Example: "Acme & Co.!" -> "acme-co"
 */
export function slugify(text: string): string {
    if (!text || !text.trim()) return 'brand'
    
    const slug = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with -
        .replace(/^-+|-+$/g, '')         // remove leading/trailing -
    
    return slug || 'brand'
}

/**
 * Generates a per-user unique slug.
 * If user already has a brand with slug "acme", returns "acme-2", "acme-3", etc.
 */
export async function getUniqueUserSlug(
    supabase: SupabaseClient,
    userId: string,
    rawName: string,
    currentProjectId?: string
): Promise<string> {
    const baseSlug = slugify(rawName)

    let query = supabase
        .from('brand_projects')
        .select('id, slug')
        .eq('user_id', userId)
        .ilike('slug', `${baseSlug}%`)

    if (currentProjectId) {
        query = query.neq('id', currentProjectId)
    }

    const { data: existingProjects, error } = await query

    if (error || !existingProjects || existingProjects.length === 0) {
        return baseSlug
    }

    const existingSlugs = new Set(existingProjects.map(p => p.slug?.toLowerCase()))

    if (!existingSlugs.has(baseSlug.toLowerCase())) {
        return baseSlug
    }

    // Find next available suffix (-2, -3, etc.)
    let counter = 2
    while (existingSlugs.has(`${baseSlug}-${counter}`.toLowerCase())) {
        counter++
    }

    return `${baseSlug}-${counter}`
}
