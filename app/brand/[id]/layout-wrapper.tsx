"use client"
import { usePathname } from 'next/navigation'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isGuidelines = pathname.includes('/guidelines')

    if (isGuidelines) {
        return (
            <div className="w-full h-full min-h-screen">
                {children}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {children}
        </div>
    )
}
