"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Pencil, Lock } from 'lucide-react'
import { useState, useRef, useEffect, useTransition } from 'react'
import { updateProfileData, uploadAvatar } from '@/app/dashboard/actions'

interface EditProfileModalProps {
    initialData: {
        email: string
        username: string
        bio: string
        links: string
        avatarUrl: string | null
    }
}

export function EditProfileModal({ initialData }: EditProfileModalProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const isOpen = searchParams.get('editProfile') === 'true'

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            router.push('/dashboard', { scroll: false })
        }
    }

    const [name, setName] = useState(initialData.username || '')
    const [links, setLinks] = useState(initialData.links || '')
    const [bio, setBio] = useState(initialData.bio || '')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl)

    const [isPending, startTransition] = useTransition()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Debounced save
    useEffect(() => {
        if (!isOpen) return
        const timer = setTimeout(() => {
            startTransition(async () => {
                try {
                    await updateProfileData({ username: name, bio, links })
                } catch (err) {
                    console.error('Failed to save profile', err)
                }
            })
        }, 1000)

        return () => clearTimeout(timer)
    }, [name, links, bio, isOpen])

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Check for file size less than 3 MB
            if (file.size > 3 * 1024 * 1024) {
                alert('File size must be less than 3 MB')
                return
            }
            // Optimistic preview
            const url = URL.createObjectURL(file)
            setAvatarUrl(url)

            const formData = new FormData()
            formData.append('file', file)
            
            startTransition(async () => {
                try {
                    const uploadedUrl = await uploadAvatar(formData)
                    setAvatarUrl(uploadedUrl)
                } catch (err) {
                    console.error('Failed to upload avatar', err)
                    alert('Failed to upload image')
                }
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[460px] p-8 rounded-[24px] bg-[#E8E7E2] border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] gap-6" showCloseButton={true}>
                <DialogTitle className="text-2xl font-display text-[#1C1C1C] font-normal pl-1 flex items-center justify-between">
                    Edit Profile
                    {isPending && <span className="text-[12px] font-sans text-[#A6A6A6] mr-6">Saving...</span>}
                </DialogTitle>
                
                <div className="flex flex-col gap-4 mt-2">
                    {/* Name & Avatar */}
                    <div className="relative group flex items-center justify-between p-4 rounded-2xl border border-[#D1D0C9] bg-transparent focus-within:bg-black/5 hover:bg-black/5 transition-colors cursor-text">
                        <div className="flex flex-col gap-1 w-full mr-4">
                            <span className="text-[11px] text-[#A6A6A6] uppercase tracking-wider font-semibold font-sans">Name</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-[14px] text-[#1C1C1C] font-medium font-sans bg-transparent outline-none w-full"
                            />
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <Pencil className="h-4 w-4 text-[#A6A6A6]" />
                            <div 
                                onClick={handleAvatarClick}
                                className="h-10 w-10 rounded-full cursor-pointer overflow-hidden border border-black/10"
                                title="Upload Profile Picture (Max 3MB)"
                            >
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-[#D34D30] to-[#A33D26]"></div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {/* Email (Locked) */}
                    <div className="relative flex items-center justify-between p-4 rounded-2xl border border-[#D1D0C9] bg-transparent hover:bg-black/5 transition-colors cursor-not-allowed opacity-80">
                        <div className="flex flex-col gap-1 w-full">
                            <span className="text-[11px] text-[#A6A6A6] uppercase tracking-wider font-semibold font-sans">Email</span>
                            <input
                                type="email"
                                value={initialData.email}
                                disabled
                                className="text-[14px] text-[#1C1C1C] font-medium font-sans bg-transparent outline-none w-full cursor-not-allowed"
                            />
                        </div>
                        <Lock className="h-4 w-4 text-[#A6A6A6]" />
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-1 p-4 rounded-2xl border border-[#D1D0C9] bg-transparent focus-within:bg-black/5 hover:bg-black/5 transition-colors cursor-text">
                        <span className="text-[11px] text-[#A6A6A6] uppercase tracking-wider font-semibold font-sans">Links</span>
                        <input
                            type="text"
                            value={links}
                            onChange={(e) => setLinks(e.target.value)}
                            className="text-[14px] text-[#1C1C1C] font-medium font-sans bg-transparent outline-none w-full"
                        />
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1 p-4 rounded-2xl border border-[#D1D0C9] bg-transparent focus-within:bg-black/5 hover:bg-black/5 transition-colors cursor-text">
                        <span className="text-[11px] text-[#A6A6A6] uppercase tracking-wider font-semibold font-sans">Bio</span>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={2}
                            className="text-[14px] text-[#1C1C1C] font-medium font-sans bg-transparent outline-none w-full resize-none"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
