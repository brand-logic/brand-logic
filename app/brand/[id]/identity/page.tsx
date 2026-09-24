
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import IdentityForm from './identity-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BrandIdentityPage({ params }: { params: Promise<{ id: string }> }) {
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

    return <IdentityForm brand={brand} />
}
