
'use client'

import { useActionState } from 'react'
import { generateBrandIdentity } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function getCompleteness(brand: any) {
    const missing: string[] = []

    if (!brand.brand_name?.trim()) missing.push('Brand Name')
    if (!brand.industry?.trim()) missing.push('Industry')
    if (!brand.description?.trim()) missing.push('Brand Description')
    if (!brand.target_audience?.trim()) missing.push('Target Audience')
    if (!brand.mission_statement?.trim()) missing.push('Mission Statement')
    if (!brand.vision_statement?.trim()) missing.push('Vision Statement')
    if (!brand.brand_presence?.trim()) missing.push('Brand Presence')
    
    if (!brand.core_values || brand.core_values.length < 3) {
        missing.push('Core Values (select at least 3)')
    }
    
    if (!brand.brand_tone) {
        missing.push('Brand Tone')
    }
    
    if (!brand.moodboard_images || brand.moodboard_images.length < 6) {
        missing.push(`Moodboard Images (upload at least 6, currently: ${brand.moodboard_images?.length || 0})`)
    }
    
    if (!brand.brand_colors || brand.brand_colors.length === 0) {
        missing.push('Color Palette')
    }
    
    if (!brand.typography_pairing) {
        missing.push('Typography Pairing')
    }

    const totalFields = 12
    const score = Math.round(((totalFields - missing.length) / totalFields) * 100)

    return { score, missing, isComplete: missing.length === 0 }
}

export default function ReviewForm({ brand }: { brand: any }) {
    const initialState = { message: '', error: false }
    const [state, formAction, isPending] = useActionState(generateBrandIdentity, initialState)
    const { score, missing, isComplete } = getCompleteness(brand)

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl text-[#1D1D1D] mb-2">Review & Generate</h1>
                <p className="text-[#636464]">Review your inputs and generate your brand guidelines.</p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={brand.id} />

                <div className="space-y-6">
                    {/* 1. Identity */}
                    <div className="">
                        <BrandIdentitySection brand={brand} score={score} missing={missing} />
                    </div>

                    {/* 2. Moodboard & Colors */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-warm-sidebar-text/10 pb-3">
                            <h3 className="text-sm font-semibold text-[#1D1D1D]">2. Visual Inspiration</h3>
                            <Link href={`/brand/${brand.id}/moodboard`} className="text-xs text-[#1D1D1D] hover:text-gold font-medium">Edit</Link>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {brand.moodboard_images?.map((img: string, i: number) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#D0CDC7]">
                                    <Image src={img} alt="Moodboard" fill className="object-cover" />
                                </div>
                            ))}
                        </div>

                        <ColorPsychologySection colors={brand.brand_colors} />
                    </div>

                    {/* 3. Typography */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-warm-sidebar-text/10 pb-3">
                            <h3 className="text-sm font-semibold text-[#1D1D1D]">3. Typography</h3>
                            <Link href={`/brand/${brand.id}/typography`} className="text-xs text-[#1D1D1D] hover:text-gold font-medium">Edit</Link>
                        </div>

                        {brand.typography_pairing ? (
                            <div className="p-6 border border-[#D0CDC7] rounded-xl bg-warm-input">
                                <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${Array.from(new Set([brand.typography_pairing.primaryFont, brand.typography_pairing.secondaryFont])).map(f => `family=${f.replace(/ /g, '+')}`).join('&')}&display=swap`} />
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    .font-review-primary { font-family: '${brand.typography_pairing.primaryFont}', sans-serif; }
                                    .font-review-secondary { font-family: '${brand.typography_pairing.secondaryFont}', sans-serif; }
                                `}} />

                                <h4 className="text-3xl font-bold font-review-primary text-[#1D1D1D]">
                                    {brand.typography_pairing.primaryFont}
                                </h4>
                                <p className="text-lg mt-2 font-review-secondary text-[#636464]">
                                    + {brand.typography_pairing.secondaryFont}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-[#636464]">No typography selected</p>
                        )}
                    </div>
                </div>

                {state?.message && (
                    <div className={`p-4 rounded-xl text-sm font-medium border ${state.error ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        {state.message}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#D0CDC7]">
                    <Button variant="ghost" asChild className="bg-[#DBDAD8] text-warm-sidebar-text hover:bg-[#CFCFCF] rounded-full h-12 px-8 border-0">
                        <Link href={`/brand/${brand.id}/typography`}>Back</Link>
                    </Button>
                    <div className="flex flex-col items-end gap-2">
                        {brand.is_generated ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-[#636464]">
                                    Brand summary has already been generated.
                                </span>
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-10 font-semibold"
                                >
                                    <Link href={`/brand/${brand.id}`}>
                                        View Brand Summary
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                {!isComplete && (
                                    <p className="text-xs text-orange-600 font-semibold">
                                        Please fill out all questionnaire sections and upload at least 6 moodboard images before generating.
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-10 font-semibold"
                                    disabled={isPending || !isComplete}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating Brand Guidelines...
                                        </>
                                    ) : (
                                        'Generate Identity'
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}

function BrandIdentitySection({ brand, score, missing }: { brand: any; score: number; missing: string[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-warm-sidebar-text/10 pb-3">
                <h3 className="text-sm font-semibold text-[#1D1D1D]">1. Brand Identity</h3>
                <div className="flex items-center gap-3">
                    <Link href={`/brand/${brand.id}/edit`} className="text-xs text-[#1D1D1D] hover:text-gold font-medium mr-2">Edit</Link>
                    <div className="text-right">
                        <span className="text-[10px] text-[#636464] uppercase font-semibold tracking-wider">Completeness</span>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="h-1.5 w-24 bg-warm-input rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${score}%` }} />
                            </div>
                            <span className="font-mono text-xs text-green-600">{score}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-3">
                    <div className="p-4 bg-green-50/30 rounded-lg border border-green-200/50">
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                            ✓ Completed
                        </h4>
                        <ul className="space-y-1 text-green-600 text-xs list-disc pl-4">
                            {brand.brand_name?.trim() && <li>Brand Name Defined</li>}
                            {brand.industry?.trim() && <li>Industry Selected</li>}
                            {brand.description?.trim() && <li>Brand Story/Description</li>}
                            {brand.target_audience?.trim() && <li>Target Audience Defined</li>}
                            {brand.mission_statement?.trim() && <li>Mission Statement Defined</li>}
                            {brand.vision_statement?.trim() && <li>Vision Statement Defined</li>}
                            {brand.brand_presence?.trim() && <li>Brand Presence Defined</li>}
                            {brand.core_values?.length >= 3 && <li>Core Values ({brand.core_values.length})</li>}
                            {brand.brand_tone && <li>Brand Tone Configured</li>}
                            {brand.moodboard_images?.length >= 6 && <li>Moodboard Images ({brand.moodboard_images.length})</li>}
                            {brand.brand_colors?.length > 0 && <li>Color Palette Extracted</li>}
                            {brand.typography_pairing && <li>Typography Selected</li>}
                        </ul>
                    </div>
                    {missing.length > 0 && (
                        <div className="p-4 bg-orange-50/30 rounded-lg border border-orange-200/50">
                            <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                                ! Missing
                            </h4>
                            <ul className="space-y-1 text-orange-600 text-xs list-disc pl-4">
                                {missing.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-[#636464] text-xs uppercase tracking-wider">Name</span>
                        <p className="mt-1 text-[#1D1D1D] font-medium">{brand.brand_name}</p>
                    </div>
                    <div>
                        <span className="text-[#636464] text-xs uppercase tracking-wider">Industry</span>
                        <Badge variant="secondary" className="mt-1 block w-fit bg-warm-input text-warm-sidebar-text hover:bg-warm-input">{brand.industry}</Badge>
                    </div>
                    <div className="md:col-span-2">
                        <span className="text-[#636464] text-xs uppercase tracking-wider">Core Values</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {brand.core_values?.map((val: string, i: number) => (
                                <Badge key={i} variant="outline" className="border-transparent text-warm-sidebar-text bg-warm-input">{val}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-3 pt-2">
                        <span className="text-[#636464] text-xs uppercase tracking-wider">Brand Tone</span>
                        <div className="grid grid-cols-1 gap-3 bg-warm-input p-4 rounded-xl">
                            {[
                                { left: 'Conversational', right: 'Authoritative', val: brand.brand_tone?.conversational_authoritative ?? brand.brand_tone?.conversational ?? 50 },
                                { left: 'Calm', right: 'Energetic', val: brand.brand_tone?.calm_energetic ?? brand.brand_tone?.energetic ?? 50 },
                                { left: 'Traditional', right: 'Innovative', val: brand.brand_tone?.traditional_innovative ?? brand.brand_tone?.innovative ?? 50 },
                                { left: 'Playful', right: 'Serious', val: brand.brand_tone?.playful_serious ?? 50 }
                            ].map((tone, i) => (
                                <div key={i} className="flex items-center text-xs text-[#636464]">
                                    <span className="w-24 text-right">{tone.left}</span>
                                    <div className="mx-3 flex-1 h-1 bg-[#D0CDC7] rounded-full relative">
                                        <div
                                            className="absolute top-0 h-3 w-3 bg-[#1D1D1D] rounded-full transform -translate-x-1/2 -translate-y-1"
                                            style={{ left: `${tone.val}%` }}
                                        />
                                    </div>
                                    <span className="w-24">{tone.right}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ColorPsychologySection({ colors }: { colors: { hex: string }[] }) {
    if (!colors || colors.length === 0) return null

    const families = colors.map(c => {
        const hex = c.hex.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)

        if (r > 200 && g > 200 && b > 200) return { name: 'Neutral (Light)', desc: 'Clean, Minimal, Pure', bg: 'bg-gray-50 text-gray-700 border-gray-200' }
        if (r < 50 && g < 50 && b < 50) return { name: 'Neutral (Dark)', desc: 'Sophisticated, Serious, Strong', bg: 'bg-gray-100 text-gray-800 border-gray-200' }
        if (r > g + 50 && r > b + 50) return { name: 'Red/Warm', desc: 'Passion, Energy, Urgency', bg: 'bg-red-50 text-red-700 border-red-200' }
        if (g > r + 30 && g > b + 30) return { name: 'Green/Natural', desc: 'Growth, Health, Balance', bg: 'bg-green-50 text-green-700 border-green-200' }
        if (b > r + 30 && b > g + 30) return { name: 'Blue/Cool', desc: 'Trust, Calm, Stability', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
        if (r > 200 && g > 200 && b < 100) return { name: 'Yellow', desc: 'Optimism, Happiness, Caution', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
        return { name: 'Multi-Tonal', desc: 'Complex, Unique', bg: 'bg-gray-50 text-gray-700 border-gray-200' }
    })

    const uniqueFamilies = Array.from(new Set(families.map(f => f.name))).map(name => {
        return families.find(f => f.name === name)
    }).filter(Boolean) as any[]

    return (
        <div className="mt-4 space-y-4">
            <span className="text-[#636464] text-xs uppercase tracking-wider">Color Psychology</span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="grid grid-cols-5 gap-3">
                        {colors.map((color, i) => (
                            <div key={i} className="space-y-1">
                                <div className="w-full aspect-square rounded-full border border-[#D0CDC7]" style={{ backgroundColor: color.hex }} />
                                <p className="text-[10px] font-mono text-center text-[#636464]">{color.hex}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {uniqueFamilies.map((fam, i) => (
                        <div key={i} className={`p-3 rounded-lg text-xs flex items-center justify-between border ${fam.bg}`}>
                            <span className="font-bold">{fam.name}</span>
                            <span>{fam.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
