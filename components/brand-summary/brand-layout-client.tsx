'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import WizardSidebar from '@/app/brand/[id]/wizard-sidebar'

interface BrandLayoutClientProps {
  id: string
  brandName: string
  children: React.ReactNode
}

export default function BrandLayoutClient({
  id,
  brandName,
  children,
}: BrandLayoutClientProps) {
  const pathname = usePathname()

  // Summary page is /brand/[id] or /brand/[id]/guidelines
  const isSummaryPage =
    !pathname.includes('/edit') &&
    !pathname.includes('/identity') &&
    !pathname.includes('/moodboard') &&
    !pathname.includes('/typography') &&
    !pathname.includes('/review')

  if (isSummaryPage) {
    // Deliverable mode: full-width canvas, sticky nav with back arrow, no sidebar
    return <div className="w-full min-h-screen bg-[#F0EFEA]">{children}</div>
  }

  // Wizard mode: 5-step sidebar on left, content on right
  return (
    <div className="flex min-h-screen bg-warm-bg">
      <WizardSidebar id={id} brandName={brandName} />
      <main className="ml-[260px] flex-1 min-h-screen bg-[#F0EFEA]">
        <div className="max-w-4xl mx-auto px-8 py-12">{children}</div>
      </main>
    </div>
  )
}
