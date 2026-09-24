
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import TypographyForm from './typography-form'
import { getFontPairings } from '@/utils/airtable'

export default async function BrandTypographyPage({ params }: { params: Promise<{ id: string }> }) {
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

    // 0. Fetch Font Pairings from Airtable
    const typographyOptions = await getFontPairings()

    // 1. Get Brand Core Values
    const brandValues: string[] = brand.core_values || []

    // 2. Score pairings based on overlap
    const scoredPairings = typographyOptions.map(option => {
        const matchCount = option.coreValues.filter(val =>
            brandValues.some(bv => bv.toLowerCase() === val.toLowerCase())
        ).length

        return { ...option, score: matchCount }
    })

    // 3. Sort by score (descending)
    scoredPairings.sort((a, b) => b.score - a.score)

    // 4. Take top 9 recommended (strict limit)
    const recommended = scoredPairings.slice(0, 9)

    return (
        <TypographyForm brand={brand} options={recommended} />
    )
}
