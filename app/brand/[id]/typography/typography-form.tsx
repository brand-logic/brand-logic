
'use client'

import { useActionState, useState } from 'react'
import { updateBrandTypography } from './actions'
import { FontPairing } from '@/data/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function TypographyForm({
    brand,
    options,
}: {
    brand: any,
    options: any[]
}) {
    const initialState = { message: '', errors: {} }
    const [state, formAction, isPending] = useActionState(updateBrandTypography, initialState)
    const savedPairing = brand.typography_pairing
    const [selectedPairing, setSelectedPairing] = useState<FontPairing | null>(savedPairing || null)

    const handleSelect = (pairing: FontPairing) => {
        setSelectedPairing(pairing)
    }

    const loadFont = (fontName: string) => {
        return <link key={fontName} rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`} />
    }

    const getFormattedValues = (values: string[]) => {
        if (!values) return []
        return values
            .flatMap(val => (typeof val === 'string' ? val.split(/[;,]/) : val))
            .map(v => (typeof v === 'string' ? v.trim() : v))
            .filter(Boolean)
    }

    const PairingCard = ({ pairing, isRecommended = false }: { pairing: FontPairing, isRecommended?: boolean }) => (
        <div
            className={`
                relative rounded-xl p-6 cursor-pointer transition-all duration-300 group
                ${selectedPairing?.id === pairing.id
                    ? 'ring-1 ring-black bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                    : 'border border-warm-sidebar-text/10 bg-warm-input hover:border-warm-sidebar-text/30'}
            `}
            onClick={() => handleSelect(pairing)}
        >

            {pairing.googleFont && (
                <>
                    {loadFont(pairing.primaryFont)}
                    {loadFont(pairing.secondaryFont)}
                </>
            )}

            <div className="space-y-5">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-[#1D1D1D]" style={{ fontFamily: pairing.primaryFont }}>
                        Aa
                    </h3>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#1D1D1D]" style={{ fontFamily: pairing.primaryFont }}>{pairing.primaryFont}</span>
                        <span className="text-sm text-[#636464]" style={{ fontFamily: pairing.secondaryFont }}>+ {pairing.secondaryFont}</span>
                    </div>
                </div>

                <div className="p-4 bg-warm-input rounded-xl space-y-3">
                    <h4 className="text-xl text-[#1D1D1D]" style={{ fontFamily: pairing.primaryFont }}>
                        {brand.brand_name || pairing.previewText}
                    </h4>
                    <p className="text-sm text-[#636464] leading-relaxed" style={{ fontFamily: pairing.secondaryFont }}>
                        {brand.description ? (brand.description.length > 80 ? brand.description.substring(0, 80) + '...' : brand.description) : 'The quick brown fox jumps over the lazy dog.'}
                    </p>
                </div>

                <p className="text-xs text-[#636464] line-clamp-2">
                    {pairing.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 max-w-full overflow-hidden">
                    {getFormattedValues(pairing.coreValues).map((val, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-[#666666] bg-[#F2F2F2] px-3 py-1 rounded-full whitespace-nowrap">
                            {val}
                        </span>
                    ))}
                </div>
            </div>

            {selectedPairing?.id === pairing.id && (
                <div className="absolute top-4 right-4 bg-[#1D1D1D] text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                </div>
            )}
        </div>
    )

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl text-[#1D1D1D] mb-2">Typography Selection</h1>
                <p className="text-[#636464]">Choose fonts that match your brand&apos;s personality.</p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={brand.id} />
                <input type="hidden" name="typographyPairing" value={JSON.stringify(selectedPairing)} />

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {options.map((pairing) => (
                            <PairingCard key={pairing.id} pairing={pairing} />
                        ))}
                    </div>
                </div>

                {state?.message && (
                    <div className="text-sm font-medium text-red-600 p-3 bg-red-50 rounded-xl border border-red-200">
                        {state.message}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#D0CDC7]">
                    <Button variant="ghost" asChild className="bg-[#DBDAD8] text-warm-sidebar-text hover:bg-[#CFCFCF] rounded-full h-12 px-8 border-0">
                        <Link href={`/brand/${brand.id}/moodboard`}>Back</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || !selectedPairing}
                        className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-8 font-medium"
                    >
                        {isPending ? 'Saving...' : 'Review & Generate'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
