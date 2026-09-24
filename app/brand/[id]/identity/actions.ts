
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const Step2Schema = z.object({
    id: z.string().uuid(),
    missionStatement: z.string().min(1, 'Mission statement is required').max(500, 'Max 500 characters'),
    visionStatement: z.string().min(1, 'Vision statement is required').max(500, 'Max 500 characters'),
    brandPresence: z.string().min(1, 'Brand presence is required').max(500, 'Max 500 characters'),
    coreValues: z.array(z.string()).min(3, 'Select at least 3 values').max(5, 'Select at most 5 values'),
    toneConversational: z.coerce.number().min(0).max(100),
    toneEnergetic: z.coerce.number().min(0).max(100),
    toneInnovative: z.coerce.number().min(0).max(100),
    tonePlayful: z.coerce.number().min(0).max(100),
})

export type Step2State = {
    errors?: {
        missionStatement?: string[]
        visionStatement?: string[]
        brandPresence?: string[]
        coreValues?: string[]
        _form?: string[]
    }
    message?: string | null
}

export async function updateBrandIdentity(prevState: Step2State, formData: FormData) {
    // Extract core values from getAll which returns array of values for same key
    const coreValues = formData.getAll('coreValues') as string[]

    const validatedFields = Step2Schema.safeParse({
        id: formData.get('id'),
        missionStatement: formData.get('missionStatement'),
        visionStatement: formData.get('visionStatement'),
        brandPresence: formData.get('brandPresence'),
        coreValues: coreValues,
        toneConversational: formData.get('toneConversational'),
        toneEnergetic: formData.get('toneEnergetic'),
        toneInnovative: formData.get('toneInnovative'),
        tonePlayful: formData.get('tonePlayful'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation Error. Please check your inputs.',
        }
    }

    const {
        id,
        missionStatement,
        visionStatement,
        brandPresence,
        coreValues: validatedCoreValues,
        toneConversational,
        toneEnergetic,
        toneInnovative,
        tonePlayful
    } = validatedFields.data

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
                mission_statement: missionStatement,
                vision_statement: visionStatement,
                brand_presence: brandPresence,
                core_values: validatedCoreValues,
                brand_tone: {
                    conversational_authoritative: toneConversational,
                    calm_energetic: toneEnergetic,
                    traditional_innovative: toneInnovative,
                    playful_serious: tonePlayful,
                },
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id) // RLS redundant but good for safety

        if (error) {
            console.error('Database Error:', error)
            return {
                message: 'Database Error: Failed to Update Brand.',
            }
        }

    } catch (error) {
        console.error('Database Error:', error)
        return {
            message: 'Database Error: Failed to Update Brand.',
        }
    }

    redirect(`/brand/${id}/moodboard`)
}
