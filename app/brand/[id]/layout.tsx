import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BrandLayoutClient from '@/components/brand-summary/brand-layout-client'

export default async function BrandLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: brand } = await supabase
        .from('brand_projects')
        .select('brand_name')
        .eq('id', id)
        .single()

    return (
        <BrandLayoutClient id={id} brandName={brand?.brand_name || ''}>
            {children}
        </BrandLayoutClient>
    )
}
