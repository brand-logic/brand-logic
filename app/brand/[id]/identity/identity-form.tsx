
'use client'

import { useActionState, useState } from 'react'
import { updateBrandIdentity } from './actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import Link from 'next/link'

const coreValuesList = [
    "Innovation", "Trust", "Quality", "Sustainability", "Creativity",
    "Excellence", "Integrity", "Community", "Growth", "Simplicity",
    "Authenticity", "Empowerment", "Diversity", "Passion", "Transparency"
]

function SectionLabel({ label, tooltip }: { label: string; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-sm font-semibold text-[#1D1D1D]">{label}</Label>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button type="button" className="text-[#636464] hover:text-[#1D1D1D] transition-colors">
                        <Info className="h-3.5 w-3.5" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">{tooltip}</TooltipContent>
            </Tooltip>
        </div>
    )
}

export default function IdentityForm({ brand }: { brand: any }) {
    const initialState = { message: '', errors: {} }
    const [state, formAction, isPending] = useActionState(updateBrandIdentity, initialState)

    const [selectedValues, setSelectedValues] = useState<string[]>(brand.core_values || [])
    const [tones, setTones] = useState({
        conversational_authoritative: brand.brand_tone?.conversational_authoritative ?? brand.brand_tone?.conversational ?? 50,
        calm_energetic: brand.brand_tone?.calm_energetic ?? brand.brand_tone?.energetic ?? 50,
        traditional_innovative: brand.brand_tone?.traditional_innovative ?? brand.brand_tone?.innovative ?? 50,
        playful_serious: brand.brand_tone?.playful_serious ?? 50
    })

    const handleValueToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            setSelectedValues(selectedValues.filter(v => v !== value))
        } else {
            if (selectedValues.length < 5) {
                setSelectedValues([...selectedValues, value])
            }
        }
    }

    const handleToneChange = (name: string, value: number) => {
        setTones(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl text-[#1D1D1D] mb-2">Brand Identity</h1>
                <p className="text-[#636464]">Define the soul of your brand.</p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={brand.id} />
                {selectedValues.map(val => (
                    <input key={val} type="hidden" name="coreValues" value={val} />
                ))}
                <input type="hidden" name="toneConversational" value={tones.conversational_authoritative} />
                <input type="hidden" name="toneEnergetic" value={tones.calm_energetic} />
                <input type="hidden" name="toneInnovative" value={tones.traditional_innovative} />
                <input type="hidden" name="tonePlayful" value={tones.playful_serious} />

                <div className="space-y-6">
                    <div className="space-y-2">
                        <SectionLabel
                            label="Mission Statement"
                            tooltip="Explain why your brand exists and what impact you want to have on the world."
                        />
                        <Textarea
                            name="missionStatement"
                            defaultValue={brand.mission_statement}
                            placeholder="What is your brand's core purpose?"
                            className="min-h-[100px] bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:border-warm-sidebar-text focus:ring-warm-sidebar-text/10 resize-none rounded-xl px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                            maxLength={500}
                            required
                        />
                        {state?.errors?.missionStatement && (
                            <p className="text-sm text-red-600">{state.errors.missionStatement[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <SectionLabel
                            label="Vision Statement"
                            tooltip="Describe the future your brand is helping to create. Think 5-10 years ahead."
                        />
                        <Textarea
                            name="visionStatement"
                            defaultValue={brand.vision_statement}
                            placeholder="Where do you see your brand in 5 years?"
                            className="min-h-[100px] bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:border-warm-sidebar-text focus:ring-warm-sidebar-text/10 resize-none rounded-xl px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                            maxLength={500}
                            required
                        />
                        {state?.errors?.visionStatement && (
                            <p className="text-sm text-red-600">{state.errors.visionStatement[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <SectionLabel
                            label="Brand Presence"
                            tooltip="Describe how your brand should feel when people interact with it. Is it bold, professional, or friendly?"
                        />
                        <Textarea
                            name="brandPresence"
                            defaultValue={brand.brand_presence}
                            placeholder="Describe how your brand carries itself."
                            className="min-h-[100px] bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:border-warm-sidebar-text focus:ring-warm-sidebar-text/10 resize-none rounded-xl px-4 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                            maxLength={500}
                            required
                        />
                        {state?.errors?.brandPresence && (
                            <p className="text-sm text-red-600">{state.errors.brandPresence[0]}</p>
                        )}
                    </div>
                </div>

                {/* Core Values */}
                <div className="space-y-4">
                    <SectionLabel
                        label="Core Values"
                        tooltip="Select at least 3 values that best represent your brand's principles."
                    />
                    <div className="flex flex-wrap gap-2">
                        {coreValuesList.map(value => (
                            <div key={value} className="relative">
                                <Label
                                    htmlFor={`value-${value}`}
                                    onClick={() => handleValueToggle(value)}
                                    className={`
                                        cursor-pointer rounded-full px-4 py-2.5 text-sm font-medium transition-all border
                                        ${selectedValues.includes(value)
                                            ? 'bg-warm-input text-warm-sidebar-text border-warm-sidebar-text'
                                            : 'bg-warm-input text-warm-sidebar-text border-transparent hover:border-warm-sidebar-text/30'}
                                    `}
                                >
                                    {value}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {state?.errors?.coreValues && (
                        <p className="text-sm text-red-600">{state.errors.coreValues[0]}</p>
                    )}
                </div>

                {/* Brand Tone */}
                <div className="space-y-6">
                    <div>
                        <SectionLabel
                            label="Brand Tone"
                            tooltip="Use the sliders to set where your brand sits on each spectrum."
                        />
                    </div>
                    <div className="space-y-6 bg-warm-input p-6 rounded-xl border-0">
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-semibold text-[#636464] uppercase tracking-wider">
                                <span>Conversational</span>
                                <span>Authoritative</span>
                            </div>
                            <Slider
                                value={[tones.conversational_authoritative]}
                                onValueChange={(v) => handleToneChange('conversational_authoritative', v[0])}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-semibold text-[#636464] uppercase tracking-wider">
                                <span>Calm</span>
                                <span>Energetic</span>
                            </div>
                            <Slider
                                value={[tones.calm_energetic]}
                                onValueChange={(v) => handleToneChange('calm_energetic', v[0])}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-semibold text-[#636464] uppercase tracking-wider">
                                <span>Traditional</span>
                                <span>Innovative</span>
                            </div>
                            <Slider
                                value={[tones.traditional_innovative]}
                                onValueChange={(v) => handleToneChange('traditional_innovative', v[0])}
                                max={100}
                                step={1}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-semibold text-[#636464] uppercase tracking-wider">
                                <span>Playful</span>
                                <span>Serious</span>
                            </div>
                            <Slider
                                value={[tones.playful_serious]}
                                onValueChange={(v) => handleToneChange('playful_serious', v[0])}
                                max={100}
                                step={1}
                            />
                        </div>
                    </div>
                </div>

                {state?.message && (
                    <div className="text-sm font-medium text-red-600 p-3 bg-red-50 rounded-xl border border-red-200">
                        {state.message}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#D0CDC7]">
                    <Button variant="ghost" asChild className="bg-[#DBDAD8] text-warm-sidebar-text hover:bg-[#CFCFCF] rounded-full h-12 px-8 border-0">
                        <Link href={`/brand/${brand.id}/edit`}>Back</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || selectedValues.length < 3}
                        className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-8 font-medium"
                    >
                        {isPending ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
