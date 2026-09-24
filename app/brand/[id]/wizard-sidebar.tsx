
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check } from 'lucide-react'

const wizardSteps = [
    { number: 1, title: 'Brand Details', path: 'edit' },
    { number: 2, title: 'Brand Identity', path: 'identity' },
    { number: 3, title: 'Visual Inspiration', path: 'moodboard' },
    { number: 4, title: 'Typography', path: 'typography' },
    { number: 5, title: 'Review & Generate', path: 'review' },
]

function getActiveStepFromPath(pathname: string): number {
    if (pathname.includes('/edit')) return 1
    if (pathname.includes('/identity')) return 2
    if (pathname.includes('/moodboard')) return 3
    if (pathname.includes('/typography')) return 4
    if (pathname.includes('/review')) return 5
    if (pathname.includes('/guidelines')) return 6
    return 1
}

export default function WizardSidebar({ id, brandName }: { id: string; brandName: string }) {
    const pathname = usePathname()
    const currentStep = getActiveStepFromPath(pathname)

    return (
        <aside className="fixed left-0 top-0 h-screen w-[260px] bg-warm-sidebar text-warm-sidebar-text flex flex-col z-40 border-r-[0.5px] border-warm-sidebar-text/10">
            {/* Logo */}
            <div className="p-6 border-b-[0.5px] border-warm-sidebar-text/10">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <ArrowLeft className="h-4 w-4 text-warm-sidebar-text/40 group-hover:text-warm-sidebar-text transition-colors" />
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/Branding/BrandLogicIcon-UltraBlur.png"
                            alt="Brand Logic Logo"
                            width={27}
                            height={27}
                            className="rounded-full"
                        />
                        <span 
                            style={{
                                fontFamily: "var(--font-favorit), system-ui, sans-serif",
                                fontSize: "17px",
                                fontWeight: 700,
                                letterSpacing: "0.04em",
                                color: "#1A1A1A",
                            }}
                        >
                            BRAND LOGIC
                        </span>
                    </div>
                </Link>
            </div>

            {/* Brand Name */}
            <div className="px-6 py-4 border-b-[0.5px] border-warm-sidebar-text/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-warm-sidebar-text/40 mb-1">Brand</p>
                <h2 className="text-sm font-medium text-warm-sidebar-text truncate">{brandName || 'Untitled'}</h2>
            </div>

            {/* Steps */}
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-1">
                    {wizardSteps.map((step) => {
                        const isActive = step.number === currentStep
                        const isCompleted = step.number < currentStep

                        return (
                            <li key={step.number}>
                                <Link
                                    href={`/brand/${id}/${step.path}`}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all
                                        ${isActive
                                            ? 'bg-warm-sidebar-text/5 text-warm-sidebar-text font-semibold'
                                            : isCompleted
                                                ? 'text-warm-sidebar-text/60 hover:bg-warm-sidebar-text/5 hover:text-warm-sidebar-text/80'
                                                : 'text-warm-sidebar-text/30 hover:bg-warm-sidebar-text/5 hover:text-warm-sidebar-text/50'
                                        }
                                    `}
                                >
                                    {/* Step Indicator */}
                                    <div className={`
                                        flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium shrink-0 transition-all
                                        ${isActive
                                            ? 'bg-warm-headline text-white'
                                            : isCompleted
                                                ? 'bg-warm-sidebar-text/10 text-warm-sidebar-text'
                                                : 'border border-warm-sidebar-text/20 text-warm-sidebar-text/30'
                                        }
                                    `}>
                                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                                    </div>
                                    <span className="truncate">{step.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Progress Footer */}
            <div className="p-6 border-t-[0.5px] border-warm-sidebar-text/10">
                <div className="flex items-center justify-between text-xs text-warm-sidebar-text/40 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((currentStep - 1) / wizardSteps.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-warm-sidebar-text/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-warm-headline rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / wizardSteps.length) * 100}%` }}
                    />
                </div>
            </div>
        </aside>
    )
}
