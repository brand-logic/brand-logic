
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        const msg = error.message === 'Invalid login credentials'
            ? 'Incorrect email or password. Check your credentials, confirm your email, or sign up if you are new.'
            : (error.message || 'Authentication error. Please try again.')
        return redirect(`/login?message=${encodeURIComponent(msg)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const origin = (await headers()).get('origin')
    const supabase = await createClient()
    console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    if (!username || username.trim() === '') {
        return redirect(`/signup?message=${encodeURIComponent('Username is required')}`)
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                username,
            }
        },
    })

    if (error) {
        console.error('Signup error:', error)
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`)
    }

    return redirect('/signup?message=Check email to continue sign in process')
}
