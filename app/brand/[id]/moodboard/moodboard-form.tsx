
'use client'

import { useActionState, useState, useEffect, useCallback, useRef } from 'react'
import { updateBrandMoodboard } from './actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Upload, Palette, Info, Loader2 } from 'lucide-react'
// @ts-ignore
import ColorThief from 'colorthief'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

function SectionLabel({ label, tooltip, icon }: { label: string; tooltip: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center gap-1.5">
            {icon}
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

const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
}).join('')

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

/** Euclidean distance between two RGB colors */
function colorDistance(a: number[], b: number[]): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

/**
 * Pick the N most distinct dominant colors from a flat list of RGB triples.
 * Uses greedy max-min distance selection to ensure variety.
 */
function pickDistinctColors(allRgb: number[][], count: number): number[][] {
    if (allRgb.length <= count) return allRgb

    const picked: number[][] = [allRgb[0]]
    const remaining = allRgb.slice(1)

    while (picked.length < count && remaining.length > 0) {
        let bestIdx = 0
        let bestMinDist = -1

        for (let i = 0; i < remaining.length; i++) {
            const minDist = Math.min(...picked.map(p => colorDistance(p, remaining[i])))
            if (minDist > bestMinDist) {
                bestMinDist = minDist
                bestIdx = i
            }
        }

        picked.push(remaining.splice(bestIdx, 1)[0])
    }

    return picked
}

const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image()
        img.src = base64Str
        img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height)
                    height = maxHeight
                }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height)
                resolve(canvas.toDataURL('image/jpeg', quality))
            } else {
                resolve(base64Str)
            }
        }
        img.onerror = () => {
            resolve(base64Str)
        }
    })
}

export default function MoodboardForm({ brand }: { brand: any }) {
    const initialState = { message: '', errors: {} }
    const [state, formAction, isPending] = useActionState(updateBrandMoodboard, initialState)

    const [images, setImages] = useState<string[]>(brand.moodboard_images || [])
    const [colors, setColors] = useState<{ hex: string }[]>(brand.brand_colors || [])
    const [isExtracting, setIsExtracting] = useState(false)
    const customColorsRef = useRef<{ hex: string }[]>([])
    const isInitialMount = useRef(true)

    // ── Regenerate palette from ALL images ──
    const regeneratePalette = useCallback(async (imageList: string[]) => {
        if (imageList.length === 0) {
            setColors(customColorsRef.current)
            return
        }

        setIsExtracting(true)

        try {
            // @ts-ignore
            const colorThief = new ColorThief()
            const allDominant: number[][] = []

            const promises = imageList.map(src =>
                new Promise<number[][]>((resolve) => {
                    const img = document.createElement('img')
                    img.crossOrigin = 'Anonymous'
                    img.src = src
                    img.onload = () => {
                        try {
                            // Downscale the image computationally for the canvas extraction to speed it up
                            const maxDim = 300;
                            const scale = Math.min(1, maxDim / img.width, maxDim / img.height);
                            img.width = Math.max(10, img.width * scale);
                            img.height = Math.max(10, img.height * scale);

                            // 6-color palette (first is dominant). quality=50 skips more pixels for 5x+ faster extraction
                            const palette: number[][] = colorThief.getPalette(img, 6, 50)
                            resolve(palette)
                        } catch (err) {
                            console.warn("Palette extraction failed", err)
                            resolve([])
                        }
                    }
                    img.onerror = () => resolve([])
                })
            )

            const results = await Promise.all(promises)
            results.forEach(rgbList => allDominant.push(...rgbList))

            if (allDominant.length === 0) {
                setIsExtracting(false)
                return
            }

            // Pick the 6 most distinct dominant colors
            const maxSlots = 6 - customColorsRef.current.length
            const distinct = pickDistinctColors(allDominant, Math.max(maxSlots, 1))
            const extracted = distinct.map(rgb => ({ hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }))

            // Merge extracted + custom, deduplicate
            const merged = [...extracted, ...customColorsRef.current]
            const unique = Array.from(new Set(merged.map(c => c.hex.toLowerCase())))
                .map(hex => ({ hex }))
                .slice(0, 8)

            setColors(unique)
        } catch (e) {
            console.error('Palette extraction error', e)
        } finally {
            setIsExtracting(false)
        }
    }, [])

    // Trigger palette recalculation whenever images change (skip initial mount if we have saved colors)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            // Only regenerate on mount if there are images but no saved colors
            if (images.length > 0 && (!brand.brand_colors || brand.brand_colors.length === 0)) {
                regeneratePalette(images)
            }
            return
        }
        regeneratePalette(images)
    }, [images, regeneratePalette, brand.brand_colors])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            const readers = files.map(file =>
                new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = async (event) => {
                        const base64 = event.target?.result as string
                        const compressed = await compressImage(base64)
                        resolve(compressed)
                    }
                    reader.readAsDataURL(file)
                })
            )
            Promise.all(readers).then(newUrls => {
                setImages(prev => [...prev, ...newUrls])
            })
        }
    }

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx))
    }

    const updateColor = (index: number, newHex: string) => {
        setColors(prev => prev.map((c, i) => i === index ? { hex: newHex } : c))
    }

    const removeColor = (hexToRemove: string) => {
        customColorsRef.current = customColorsRef.current.filter(c => c.hex !== hexToRemove)
        setColors(prev => prev.filter(c => c.hex !== hexToRemove))
    }

    const addCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value
        customColorsRef.current = [...customColorsRef.current, { hex }]
        setColors(prev => [...prev, { hex }])
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl text-[#1D1D1D] mb-2">Visual Moodboard</h1>
                <p className="text-[#636464]">Upload images that inspire you to generate a color palette.</p>
            </div>

            <form action={formAction} className="space-y-8">
                <input type="hidden" name="id" value={brand.id} />
                <input type="hidden" name="colors" value={JSON.stringify(colors)} />
                <input type="hidden" name="images" value={JSON.stringify(images)} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="space-y-4">
                        <SectionLabel label="Inspiration Images" tooltip="Upload images that capture the feel, mood, and aesthetic you want for your brand." />
                        <div className="relative group">
                            <label
                                className="border border-dashed border-warm-sidebar-text/10 rounded-xl p-8 flex flex-col items-center justify-center text-[#636464] hover:bg-warm-input hover:border-warm-sidebar-text/30 transition-all cursor-pointer min-h-[200px] bg-warm-input/50"
                            >
                                <Upload className="h-10 w-10 mb-4 text-[#636464] group-hover:text-[#1D1D1D] transition-colors" />
                                <p className="text-sm font-medium text-[#1D1D1D]">Click to upload images</p>
                                <p className="text-xs text-[#636464] mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                            </label>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#D0CDC7] group transition-shadow">
                                    <Image src={img} alt="Inspiration" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            className="text-white hover:text-red-400 hover:bg-white/10"
                                            onClick={() => removeImage(idx)}
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Color Palette */}
                    <div className="space-y-4">
                        <SectionLabel
                            label="Generated Palette"
                            tooltip="Colors are auto-extracted from your uploaded images. Click any swatch to fine-tune."
                        />
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-[#636464]">Colors extracted automatically. Click to edit.</p>
                            {isExtracting && (
                                <Loader2 className="h-3.5 w-3.5 text-[#636464] animate-spin" />
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {colors.map((color, idx) => {
                                const rgb = hexToRgb(color.hex);
                                return (
                                    <Popover key={idx}>
                                        <PopoverTrigger asChild>
                                            <div className="group relative flex items-center gap-2 p-3 border border-warm-sidebar-text/10 rounded-xl bg-warm-input transition-all cursor-pointer">
                                                <div
                                                    className="h-10 w-10 rounded-full border border-[#D0CDC7] shrink-0 transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: color.hex }}
                                                />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <p className="text-xs font-mono uppercase truncate text-[#1D1D1D]">{color.hex}</p>
                                                    <p className="text-[10px] text-[#636464] truncate">
                                                        R{rgb.r} G{rgb.g} B{rgb.b}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeColor(color.hex);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-4 space-y-4 bg-warm-input border-warm-sidebar-text/10 rounded-xl">
                                            <div className="space-y-2">
                                                <h4 className="font-medium leading-none text-[#1D1D1D]">Edit Color</h4>
                                                <p className="text-sm text-[#636464]">Adjust RGB values.</p>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-[#636464]">
                                                        <span>Red</span>
                                                        <span>{rgb.r}</span>
                                                    </div>
                                                    <Slider
                                                        value={[rgb.r]}
                                                        max={255}
                                                        step={1}
                                                        onValueChange={(val) => updateColor(idx, rgbToHex(val[0], rgb.g, rgb.b))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-[#636464]">
                                                        <span>Green</span>
                                                        <span>{rgb.g}</span>
                                                    </div>
                                                    <Slider
                                                        value={[rgb.g]}
                                                        max={255}
                                                        step={1}
                                                        onValueChange={(val) => updateColor(idx, rgbToHex(rgb.r, val[0], rgb.b))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-[#636464]">
                                                        <span>Blue</span>
                                                        <span>{rgb.b}</span>
                                                    </div>
                                                    <Slider
                                                        value={[rgb.b]}
                                                        max={255}
                                                        step={1}
                                                        onValueChange={(val) => updateColor(idx, rgbToHex(rgb.r, rgb.g, val[0]))}
                                                    />
                                                </div>
                                                <div className="pt-2 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded border border-black/10" style={{ backgroundColor: color.hex }} />
                                                        <Input
                                                            value={color.hex}
                                                            onChange={(e) => updateColor(idx, e.target.value)}
                                                            className="h-8 text-xs font-mono bg-warm-input border-transparent text-warm-sidebar-text"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            })}

                            {/* Add Color Button */}
                            <div className="flex items-center justify-center p-3 border border-dashed border-[#D0CDC7] rounded-xl bg-white/50 h-[68px] relative hover:border-[#1A1A1A]/30 transition-all">
                                <Input
                                    type="color"
                                    className="w-full h-full opacity-0 absolute cursor-pointer"
                                    onChange={addCustomColor}
                                />
                                <Plus className="h-5 w-5 text-[#636464]" />
                            </div>
                        </div>

                        {state?.errors?.colors && (
                            <p className="text-sm text-red-600 mt-2">{state.errors.colors[0]}</p>
                        )}
                    </div>
                </div>

                {state?.message && (
                    <div className="text-sm font-medium text-red-600 p-3 bg-red-50 rounded-xl border border-red-200">
                        {state.message}
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-[#D0CDC7]">
                    <Button variant="ghost" asChild className="bg-[#DBDAD8] text-warm-sidebar-text hover:bg-[#CFCFCF] rounded-full h-12 px-8 border-0">
                        <Link href={`/brand/${brand.id}/identity`}>Back</Link>
                    </Button>
                    <div className="flex flex-col items-end gap-2">
                        {images.length < 6 && (
                            <p className="text-xs text-orange-600 font-semibold">
                                Please upload at least {6 - images.length} more image{6 - images.length > 1 ? 's' : ''} (minimum 6 required).
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending || colors.length === 0 || images.length < 6}
                            className="bg-[#111111] hover:bg-[#1D1D1D] text-white border-0 rounded-full h-12 px-8 font-medium"
                        >
                            {isPending ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
