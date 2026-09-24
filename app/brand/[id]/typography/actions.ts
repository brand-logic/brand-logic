
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const Step4Schema = z.object({
    id: z.string().uuid(),
    typographyPairing: z.string().min(1, 'Selection is required'), // JSON string of selected pairing
})

export type Step4State = {
    errors?: {
        typographyPairing?: string[]
        _form?: string[]
    }
    message?: string | null
}

export async function updateBrandTypography(prevState: Step4State, formData: FormData) {
    const validatedFields = Step4Schema.safeParse({
        id: formData.get('id'),
        typographyPairing: formData.get('typographyPairing'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation Error. Please select a typography pairing.',
        }
    }

    const { id, typographyPairing } = validatedFields.data

    let parsedPairing = {}
    try {
        parsedPairing = JSON.parse(typographyPairing)
    } catch (e) {
        return { message: 'Invalid typography data' }
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
                typography_pairing: parsedPairing,
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

    redirect(`/brand/${id}/review`)
}
