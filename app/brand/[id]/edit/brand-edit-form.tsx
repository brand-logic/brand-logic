
'use client'

import { useActionState, useState } from 'react'
import { updateBrandDetails } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const industries = [
    "Technology", "Fashion", "Food & Beverage", "Health & Wellness", "Finance",
    "Education", "Entertainment", "Real Estate", "Non-Profit", "Creative Services",
    "Consulting", "E-commerce", "Other"
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

export default function BrandEditStep1({ brand }: { brand: any }) {
    const initialState = { message: '', errors: {} }
    const [state, formAction, isPending] = useActionState(updateBrandDetails, initialState)
    const [brandType, setBrandType] = useState<string>(brand.brand_type || 'Product/Consumer')

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-[36px] font-display font-medium text-[#1A1A1A] mb-3">Brand Details</h1>
                <p className="text-[15px] text-[#6B6762] max-w-lg leading-relaxed">Let&apos;s start with the basics of your brand.</p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={brand.id} />

                {/* Brand Type */}
                <div className="space-y-4">
                    <SectionLabel
                        label="Brand Type"
                        tooltip="Choose the type that best describes your brand. This helps us tailor the experience."
                    />
                    <input type="hidden" name="brandType" value={brandType} />
                    <div className="flex flex-wrap gap-4">
                        <div
                            onClick={() => setBrandType('Product/Consumer')}
                            className={`flex flex-col items-center justify-center w-full max-w-[196px] aspect-square rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
                                brandType === 'Product/Consumer'
                                    ? 'border-[#1A1A1A] bg-[#E9E8E3] opacity-100 shadow-sm ring-1 ring-[#1A1A1A]'
                                    : 'border-[#7E7D7A] bg-warm-input opacity-50 hover:opacity-100 hover:border-[#1A1A1A] hover:bg-[#F5F4F0]'
                            }`}
                        >
                            <div className="relative h-10 w-10 mb-3 flex-shrink-0">
                                <Image
                                    src="/Branding/Product-Icon.svg"
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xs font-bold text-[#1A1A1A] text-center leading-tight">Product/Consumer</span>
                            <span className="text-xs text-[#666666] text-center mt-1">For businesses</span>
                        </div>

                        <div
                            onClick={() => setBrandType('Personal/Creator')}
                            className={`flex flex-col items-center justify-center w-full max-w-[196px] aspect-square rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
                                brandType === 'Personal/Creator'
                                    ? 'border-[#1A1A1A] bg-[#E9E8E3] opacity-100 shadow-sm ring-1 ring-[#1A1A1A]'
                                    : 'border-[#7E7D7A] bg-warm-input opacity-50 hover:opacity-100 hover:border-[#1A1A1A] hover:bg-[#F5F4F0]'
                            }`}
                        >
                            <div className="relative h-10 w-10 mb-3 flex-shrink-0">
                                <Image
                                    src="/Branding/Personal-Icon.svg"
                                    alt=""
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xs font-bold text-[#1A1A1A] text-center leading-tight">Personal/Creator</span>
                            <span className="text-xs text-[#666666] text-center mt-1">For individuals</span>
                        </div>
                    </div>
                    {state?.errors?.brandType && (
                        <p className="text-sm text-red-600">{state.errors.brandType[0]}</p>
                    )}
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                    <SectionLabel
                        label="Brand Name"
                        tooltip="The name people will know your brand by. Keep it memorable."
                    />
                    <Input
                        id="brandName"
                        name="brandName"
                        defaultValue={brand.brand_name}
                        placeholder="What do you call this brand?"
                        maxLength={50}
                        required
                        className="bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:bg-white focus:border-warm-sidebar-text focus:ring-0 h-[52px] rounded-full px-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                    />
                    {state?.errors?.brandName && (
                        <p className="text-sm text-red-600">{state.errors.brandName[0]}</p>
                    )}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                    <SectionLabel
                        label="Industry"
                        tooltip="Select the industry your brand operates in. This influences color and style recommendations."
                    />
                    <Select name="industry" defaultValue={brand.industry} required>
                        <SelectTrigger className="w-full bg-warm-input border-transparent text-warm-sidebar-text h-[52px] rounded-full px-6 focus:bg-white focus:ring-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                            <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#D0CDC7] rounded-xl">
                            {industries.map((ind) => (
                                <SelectItem key={ind} value={ind} className="focus:bg-warm-input rounded-xl">{ind}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {state?.errors?.industry && (
                        <p className="text-sm text-red-600">{state.errors.industry[0]}</p>
                    )}
                </div>

                {/* Brand Description */}
                <div className="space-y-2">
                    <SectionLabel
                        label="Brand Description"
                        tooltip="A brief summary of what your brand does and what makes it unique."
                    />
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={brand.description}
                        placeholder="In one or two sentences, describe what you're building."
                        className="min-h-[120px] bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:bg-white focus:border-warm-sidebar-text focus:ring-0 resize-none rounded-[24px] px-6 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                        maxLength={300}
                        required
                    />
                    <div className="text-xs text-[#636464] text-right">Max 300 characters</div>
                    {state?.errors?.description && (
                        <p className="text-sm text-red-600">{state.errors.description[0]}</p>
                    )}
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                    <SectionLabel
                        label="Target Audience"
                        tooltip="Describe who your ideal customer or follower is. Be as specific as you can."
                    />
                    <Textarea
                        id="targetAudience"
                        name="targetAudience"
                        defaultValue={brand.target_audience}
                        placeholder="Who is this brand really for?"
                        className="min-h-[120px] bg-warm-input border-transparent text-warm-sidebar-text placeholder:text-warm-body focus:bg-white focus:border-warm-sidebar-text focus:ring-0 resize-none rounded-[24px] px-6 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                        maxLength={300}
                        required
                    />
                    <div className="text-xs text-[#636464] text-right">Max 300 characters</div>
                    {state?.errors?.targetAudience && (
                        <p className="text-sm text-red-600">{state.errors.targetAudience[0]}</p>
                    )}
                </div>

                {state?.message && (
                    <div className="text-sm font-medium text-red-600 p-3 bg-red-50 rounded-xl border border-red-200">
                        {state.message}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#D0CDC7]">
                    <Button variant="ghost" asChild className="bg-[#DBDAD8] text-warm-sidebar-text hover:bg-[#CFCFCF] rounded-full h-12 px-8 border-0">
                        <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-8 font-medium"
                    >
                        {isPending ? 'Saving...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
