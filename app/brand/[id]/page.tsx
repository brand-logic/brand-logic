import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BrandSummaryView from '@/components/brand-summary/brand-summary-view'
import { getCuratedFontsForBrand } from '@/utils/airtable'

export default async function BrandSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch brand project
  const { data: brand, error } = await supabase
    .from('brand_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !brand) {
    notFound()
  }

  // If brand is not generated yet, send owner back to wizard
  if (!brand.is_generated && !brand.ai_summary) {
    redirect(`/brand/${id}/review`)
  }

  const isOwner = !!(user && user.id === brand.user_id)

  // If not owner, check publish status
  if (!isOwner && !brand.is_published) {
    notFound()
  }

  // Get username for public link
  let username = user?.user_metadata?.username || ''
  if (!username) {
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', brand.user_id)
      .single()
    username = ownerProfile?.username || 'brand'
  }

  // Fetch curated fonts from Airtable
  const curatedFonts = await getCuratedFontsForBrand(brand.core_values || [])

  return (
    <BrandSummaryView
      brand={brand}
      username={username}
      isOwner={isOwner}
      curatedFonts={curatedFonts}
    />
  )
}
