
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, ChevronDown, PlayCircle, Mail } from 'lucide-react'
import { EditProfileModal } from '@/components/edit-profile-modal'
import { Suspense } from 'react'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    const initialData = {
        email: user.email || '',
        username: user.user_metadata?.username || '',
        bio: user.user_metadata?.bio || '',
        links: user.user_metadata?.links || '',
        avatarUrl: user.user_metadata?.avatar_url || null,
    }

    return (
        <div className="min-h-screen bg-[#F0EFEA]">
            <header className="sticky top-0 z-50 w-full">
                <div className="flex h-[104px] items-center px-6 md:px-10 w-full">
                    <Link href="/" className="mr-6 flex items-center gap-2.5">
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
                    </Link>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="flex items-center gap-2 pl-3 pr-8 h-[50px] rounded-full bg-[#E8E5DF] hover:bg-[#DEDCD4] text-[#1A1A1A] border-0"
                                    >
                                        <Avatar className="h-8 w-8 border-0">
                                            {user.user_metadata?.avatar_url && <AvatarImage src={user.user_metadata.avatar_url} alt="Avatar" className="object-cover" />}
                                            <AvatarFallback className="bg-gradient-to-br from-[#FF9D6C] to-[#D34D30] text-transparent" />
                                        </Avatar>
                                        <span className="text-sm font-medium ml-1">{user.user_metadata?.username || user.email}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[320px] p-4 rounded-[28px] bg-[#E8E7E2] border-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)]" align="end" sideOffset={12}>
                                    <div className="flex flex-col items-center p-6 pb-4">
                                        <Avatar className="h-[72px] w-[72px] mb-4">
                                            {user.user_metadata?.avatar_url && <AvatarImage src={user.user_metadata.avatar_url} alt="Avatar" className="object-cover" />}
                                            <AvatarFallback className="bg-gradient-to-br from-[#FF9D6C] to-[#D34D30] text-transparent" />
                                        </Avatar>
                                        <p className="text-[22px] text-[#1C1C1C] font-serif tracking-tight">{user.user_metadata?.full_name || user.user_metadata?.username || 'Username'}</p>
                                        <p className="text-[13px] text-[#A6A6A6] mt-0.5">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="px-2 pb-2 flex flex-col gap-1">
                                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 text-[14px] font-medium text-[#4A4A4A] focus:bg-black/5 focus:text-[#1C1C1C] transition-colors">
                                            <Link href="?editProfile=true">
                                                Edit Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 px-4 text-[14px] font-medium text-[#4A4A4A] focus:bg-black/5 focus:text-[#1C1C1C] transition-colors">
                                            <Link href="#">
                                                Contact us
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl p-0 focus:bg-transparent">
                                            <form action={signOut} className="w-full">
                                                <button className="flex w-full items-center py-3 px-4 text-[14px] font-medium text-[#4A4A4A] hover:bg-black/5 hover:text-[#1C1C1C] transition-colors rounded-xl text-left">
                                                    Logout
                                                </button>
                                            </form>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="flex w-full flex-col p-6 md:p-10 max-w-[1600px] mx-auto">
                {children}
            </main>
            <Suspense fallback={null}>
                <EditProfileModal initialData={initialData} />
            </Suspense>
        </div>
    )
}
