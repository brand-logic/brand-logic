
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ReviewForm from './review-form'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
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

    return (
        <ReviewForm brand={brand} />
    )
}
