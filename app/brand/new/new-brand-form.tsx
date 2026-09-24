'use client'

import { useActionState } from 'react'
import { createBrand } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function NewBrandForm() {
    const initialState = { error: '' }
    const [state, formAction, isPending] = useActionState(createBrand, initialState)

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/Branding/web-bg.png"
                    alt=""
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0" />
            </div>

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl p-10"
                style={{
                    background: 'rgba(30, 30, 30, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Back Button */}
                <Link href="/dashboard" className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>

                {/* Logo */}
                <div className="flex items-center justify-center mb-6 mt-2">
                    <Image src="/Branding/BrandLogicIcon-UltraBlur.png" alt="Brand Logic" width={125} height={125} />
                </div>

                <h1 className="text-3xl text-white text-center mb-2" style={{ fontFamily: 'var(--font-gt-super), Georgia, serif' }}>
                    Name your Brand
                </h1>
                <p className="text-center text-white/50 text-sm mb-8">
                    Let&apos;s start by giving your new brand a name.
                </p>

                <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="brandName" className="text-white/70 text-sm pl-5">Brand Name</Label>
                        <Input
                            id="brandName"
                            name="brandName"
                            type="text"
                            placeholder="e.g. Stripe, Apple, Nike"
                            required
                            className="bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/30 rounded-full h-14 px-6"
                        />
                    </div>

                    {state?.error && (
                        <div className="text-sm font-medium text-red-400 bg-red-900/20 p-3 rounded-full border border-red-500/20 px-6">
                            {state.error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-14 bg-white/25 text-white hover:bg-white/35 rounded-full font-medium text-base transition-all border border-white/10 mt-2 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating Brand...
                            </>
                        ) : (
                            'Build your brand'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
