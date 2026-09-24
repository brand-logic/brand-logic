
import Link from 'next/link'
import { signup } from '../login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

export default async function SignupPage(props: {
    searchParams: Promise<{ message: string }>
}) {
    const searchParams = await props.searchParams
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

            {/* Glassmorphism Card — darker */}
            <div className="relative z-10 w-full max-w-md rounded-2xl p-10"
                style={{
                    background: 'rgba(30, 30, 30, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center justify-center mb-6">
                    <Image src="/Branding/BrandLogicIcon-UltraBlur.png" alt="Brand Logic" width={125} height={125} />
                </div>

                <h1 className="text-3xl text-white text-center mb-2" style={{ fontFamily: 'var(--font-gt-super), Georgia, serif' }}>
                    Welcome to Brand Logic
                </h1>
                <p className="text-center text-white/50 text-sm mb-8">
                    Start by creating an account
                </p>

                <form className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-white/70 text-sm pl-5">Username</Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            required
                            className="bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/30 rounded-full h-14 px-6"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/70 text-sm pl-5">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Your email address"
                            required
                            className="bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/30 rounded-full h-14 px-6"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/70 text-sm pl-5">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            required
                            className="bg-white/8 border-white/10 text-white placeholder:text-white/30 focus:border-gold focus:ring-gold/30 rounded-full h-14 px-6"
                        />
                    </div>

                    {searchParams.message && (
                        <div className="text-sm font-medium text-red-400 bg-red-900/20 p-3 rounded-full border border-red-500/20 px-6">
                            {searchParams.message}
                        </div>
                    )}

                    <Button
                        formAction={signup}
                        className="w-full h-14 bg-white/25 text-white hover:bg-white/35 rounded-full font-medium text-base transition-all border border-white/10 mt-2"
                    >
                        Continue
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-white/40">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white hover:text-gold transition-colors underline underline-offset-4">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/8 text-center">
                    <p className="text-xs text-white/25">
                        By continuing, you agree to our{' '}
                        <Link href="#" className="underline hover:text-white/40">Terms</Link> and{' '}
                        <Link href="#" className="underline hover:text-white/40">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}
