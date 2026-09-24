import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import BrandSummaryView from '@/components/brand-summary/brand-summary-view'
import { getCuratedFontsForBrand } from '@/utils/airtable'
import Link from 'next/link'

export default async function PublicBrandPage({
  params,
}: {
  params: Promise<{ username: string; brandSlug: string }>
}) {
  const { username, brandSlug } = await params
  const supabase = await createClient()

  // 1. Resolve owner profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // 2. Resolve brand project by owner ID and slug
  const { data: brand, error: brandError } = await supabase
    .from('brand_projects')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', brandSlug)
    .single()

  if (brandError || !brand) {
    notFound()
  }

  // 3. Check viewer authentication / ownership
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwner = !!(user && user.id === brand.user_id)

  // 4. Check publish state
  if (!brand.is_published && !isOwner) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          This Brand is Not Public
        </h1>
        <p className="text-sm text-[#666] max-w-sm mb-6">
          The owner has made this brand summary private.
        </p>
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:underline"
        >
          Return to Brand Logic &rarr;
        </Link>
      </div>
    )
  }

  // 5. Fetch curated fonts from Airtable
  const curatedFonts = await getCuratedFontsForBrand(brand.core_values || [])

  return (
    <BrandSummaryView
      brand={brand}
      username={profile.username || username}
      isOwner={isOwner}
      curatedFonts={curatedFonts}
    />
  )
}
