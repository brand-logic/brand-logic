
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const Step1Schema = z.object({
    brandName: z.string().min(1, 'Brand name is required').max(50, 'Brand name must be 50 characters or less'),
    brandType: z.enum(['Product/Consumer', 'Personal/Creator']),
    industry: z.string().min(1, 'Industry is required'),
    description: z.string().min(1, 'Description is required').max(300, 'Description must be 300 characters or less'),
    targetAudience: z.string().min(1, 'Target audience is required').max(300, 'Target audience must be 300 characters or less'),
})

export type State = {
    errors?: {
        brandName?: string[]
        brandType?: string[]
        industry?: string[]
        description?: string[]
        targetAudience?: string[]
    }
    message?: string | null
}

export async function createBrandProject(prevState: State | undefined, formData: FormData) {
    const validatedFields = Step1Schema.safeParse({
        brandName: formData.get('brandName'),
        brandType: formData.get('brandType'),
        industry: formData.get('industry'),
        description: formData.get('description'),
        targetAudience: formData.get('targetAudience'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Brand.',
        }
    }

    const { brandName, brandType, industry, description, targetAudience } = validatedFields.data
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            message: 'User not authenticated',
        }
    }

    let projectId = null

    try {
        const { data, error } = await supabase
            .from('brand_projects')
            .insert({
                user_id: user.id,
                brand_name: brandName,
                brand_type: brandType,
                industry: industry,
                description: description,
                target_audience: targetAudience,
                status: 'draft',
            })
            .select('id')
            .single()

        if (error) {
            console.error('Database Error:', error)
            return {
                message: `Database Error: ${error.message}`,
            }
        }

        projectId = data.id

    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to Create Brand.',
        }
    }

    redirect(`/brand/${projectId}/identity`)
}

const UpdateStep1Schema = Step1Schema.extend({
    id: z.string().uuid(),
})

export async function updateBrandDetails(prevState: State | undefined, formData: FormData) {
    const validatedFields = UpdateStep1Schema.safeParse({
        id: formData.get('id'),
        brandName: formData.get('brandName'),
        brandType: formData.get('brandType'),
        industry: formData.get('industry'),
        description: formData.get('description'),
        targetAudience: formData.get('targetAudience'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Brand.',
        }
    }

    const { id, brandName, brandType, industry, description, targetAudience } = validatedFields.data
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            message: 'User not authenticated',
        }
    }

    try {
        const { error } = await supabase
            .from('brand_projects')
            .update({
                brand_name: brandName,
                brand_type: brandType,
                industry: industry,
                description: description,
                target_audience: targetAudience,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Database Error:', error)
            return {
                message: `Database Error: ${error.message}`,
            }
        }

    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to Update Brand.',
        }
    }

    revalidatePath(`/brand/${id}`, 'layout')
    redirect(`/brand/${id}/identity`)
}
