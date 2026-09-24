
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MoodboardForm from './moodboard-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BrandMoodboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: brand, error } = await supabase
        .from('brand_projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !brand) {
        redirect('/dashboard')
    }

    return <MoodboardForm brand={brand} />
}
