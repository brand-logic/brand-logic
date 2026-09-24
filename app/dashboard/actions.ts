'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProject(projectId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('brand_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}

export async function toggleBrandPublish(projectId: string, isPublished: boolean) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('brand_projects')
        .update({
            is_published: isPublished,
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
    revalidatePath(`/brand/${projectId}`)
    return { success: true }
}

export async function updateProfileData(data: { username: string; bio: string; links: string }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase.auth.updateUser({
        data: {
            username: data.username,
            bio: data.bio,
            links: data.links
        }
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard')
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file provided')
    }

    if (file.size > 3 * 1024 * 1024) {
        throw new Error('File limit is 3MB')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

    const { error: updateError } = await supabase.auth.updateUser({
        data: {
            avatar_url: publicUrl
        }
    })

    if (updateError) {
        throw new Error(updateError.message)
    }

    revalidatePath('/dashboard')
    return publicUrl
}
