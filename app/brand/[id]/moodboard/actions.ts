
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const Step3Schema = z.object({
    id: z.string().uuid(),
    colors: z.string().min(1, 'At least one color is required'), // JSON stringified array
    images: z.string().optional(), // JSON stringified array
})

export type Step3State = {
    errors?: {
        colors?: string[]
        _form?: string[]
    }
    message?: string | null
}

export async function updateBrandMoodboard(prevState: Step3State, formData: FormData) {
    const validatedFields = Step3Schema.safeParse({
        id: formData.get('id'),
        colors: formData.get('colors'),
        images: formData.get('images'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation Error. Please check your inputs.',
        }
    }

    const { id, colors, images } = validatedFields.data

    // Parse colors from JSON string
    let parsedColors = []
    let parsedImages = []
    try {
        parsedColors = JSON.parse(colors)
        if (images) {
            parsedImages = JSON.parse(images)
        }
    } catch (e) {
        return { message: 'Invalid data format' }
    }

    if (parsedImages.length < 6) {
        return {
            message: 'A minimum of six moodboard images is required to proceed.',
        }
    }

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
                brand_colors: parsedColors,
                moodboard_images: parsedImages,
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

    redirect(`/brand/${id}/typography`)
}
