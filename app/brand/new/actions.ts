'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUniqueUserSlug } from '@/lib/slug'

export async function createBrand(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const brandName = formData.get('brandName') as string

    if (!brandName || brandName.trim() === '') {
        return { error: 'Brand name is required' }
    }

    let brandId = ''

    try {
        const slug = await getUniqueUserSlug(supabase, user.id, brandName.trim())

        const { data, error } = await supabase
            .from('brand_projects')
            .insert({
                user_id: user.id,
                brand_name: brandName.trim(),
                slug: slug,
                brand_type: 'Product/Consumer',
                industry: '',
                description: '',
                target_audience: '',
                status: 'draft',
                is_generated: false,
                is_published: true,
                generated_data: {},
                current_data: {},
            })
            .select('id')
            .single()

        if (error || !data) {
            console.error('Error creating brand:', error)
            return { error: 'Failed to create brand project' }
        }
        
        brandId = data.id
    } catch (e) {
        console.error('Error creating brand:', e)
        return { error: 'Failed to create brand project' }
    }

    redirect(`/brand/${brandId}/edit`)
}
