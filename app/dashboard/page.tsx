import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { DeleteProjectButton } from './delete-project-button'
import { BrandCardActions } from './brand-card-actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type BrandProject = {
    id: string
    brand_name: string
    brand_type: string | null
    industry: string | null
    status: string
    created_at: string
    updated_at: string
    slug?: string | null
    is_published?: boolean
    is_generated?: boolean
    // Step completion indicators
    mission_statement: string | null
    core_values: string[] | null
    moodboard_images: string[] | null
    typography_pairing: any | null
    ai_summary: any | null
}

/**
 * Determine which wizard step the user should resume from based on
 * what data has already been saved.
 */
function getResumeUrl(project: BrandProject): string {
    const id = project.id
    if (!project.mission_statement) return `/brand/${id}/edit`
    if (!project.core_values || project.core_values.length === 0) return `/brand/${id}/identity`
    if (!project.moodboard_images || project.moodboard_images.length === 0) return `/brand/${id}/moodboard`
    if (!project.typography_pairing) return `/brand/${id}/typography`
    if (!project.ai_summary && !project.is_generated) return `/brand/${id}/review`
    return `/brand/${id}`
}

function getStepLabel(project: BrandProject): { label: string; step: number } {
    if (!project.mission_statement) return { label: 'Brand Basics', step: 1 }
    if (!project.core_values || project.core_values.length === 0) return { label: 'Brand Identity', step: 2 }
    if (!project.moodboard_images || project.moodboard_images.length === 0) return { label: 'Moodboard', step: 3 }
    if (!project.typography_pairing) return { label: 'Typography', step: 4 }
    if (!project.ai_summary && !project.is_generated) return { label: 'Review & Generate', step: 5 }
    return { label: 'Completed', step: 5 }
}

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: projects } = await supabase
        .from('brand_projects')
        .select('id, brand_name, brand_type, industry, status, created_at, updated_at, mission_statement, core_values, moodboard_images, typography_pairing, ai_summary, slug, is_published, is_generated')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    const allProjects: BrandProject[] = projects || []

    return (
        <div className="flex flex-col pb-32">
            {/* User Profile Info section */}
            <div className="flex flex-col items-center justify-center pt-8 pb-16">
                <Avatar className="h-[100px] w-[100px] mb-4 border-0">
                    {user.user_metadata?.avatar_url && <AvatarImage src={user.user_metadata.avatar_url} alt="Avatar" className="object-cover" />}
                    <AvatarFallback className="bg-gradient-to-br from-[#FF9D6C] to-[#D34D30] text-transparent" />
                </Avatar>
                <h1 className="text-[32px] font-display text-[#1C1C1C] font-normal tracking-tight mb-2">
                    {user.user_metadata?.username || 'username'}
                </h1>
                {user.user_metadata?.bio ? (
                    <p className="text-[13px] font-medium text-[#4A4A4A] mb-1 max-w-sm text-center whitespace-pre-wrap">
                        {user.user_metadata.bio}
                    </p>
                ) : (
                    <Link href="?editProfile=true" className="text-[13px] font-medium text-[#737373] hover:text-black transition-colors mb-1">
                        Add a bio...
                    </Link>
                )}
                <p className="text-[13px] text-[#A6A6A6]">
                    {user.email}
                </p>
                <Button asChild className="mt-6 bg-[#E6E5E0] hover:bg-[#D6D5D0] text-[#1C1C1C] rounded-full h-[40px] px-8 text-sm font-medium border-0 transition-colors">
                    <Link href="?editProfile=true">Edit Profile</Link>
                </Button>
            </div>

            {/* Grid of brand projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 px-4 md:px-0">
                {allProjects.map((project) => {
                    const resumeUrl = getResumeUrl(project)
                    const displayName = project.brand_name?.trim() || 'Untitled'
                    const images = project.moodboard_images || []
                    
                    return (
                        <div key={project.id} className="flex flex-col gap-3 group">
                            {/* Card with 3 images */}
                            <Link href={resumeUrl} className="relative aspect-square w-full rounded-3xl bg-[#E6E5E0] overflow-hidden flex items-stretch gap-1.5 p-1.5 hover:ring-2 hover:ring-black/5 transition-all">
                                {images.length >= 3 ? (
                                    <>
                                        <div className="flex flex-col gap-1.5 w-1/2">
                                            <div className="relative w-full h-1/2 rounded-2xl overflow-hidden bg-[#D9D8D3]">
                                                <img src={images[0]} className="absolute inset-0 object-cover w-full h-full" alt="" />
                                            </div>
                                            <div className="relative w-full h-1/2 rounded-2xl overflow-hidden bg-[#D9D8D3]">
                                                <img src={images[1]} className="absolute inset-0 object-cover w-full h-full" alt="" />
                                            </div>
                                        </div>
                                        <div className="w-1/2 relative rounded-2xl overflow-hidden bg-[#D9D8D3]">
                                            <img src={images[2]} className="absolute inset-0 object-cover w-full h-full" alt="" />
                                        </div>
                                    </>
                                ) : images.length > 0 ? (
                                    <div className="w-full relative rounded-2xl overflow-hidden bg-[#D9D8D3]">
                                        <img src={images[0]} className="absolute inset-0 object-cover w-full h-full" alt="" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black/20 text-sm font-medium">
                                        No images
                                    </div>
                                )}
                            </Link>

                            <div className="flex items-start justify-between px-1">
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-bold tracking-[0.08em] uppercase text-[#1C1C1C]">{displayName}</span>
                                    <Link href={resumeUrl} className="text-xs text-[#A6A6A6] hover:text-[#1C1C1C] mt-0.5">
                                        View Brand Identity
                                    </Link>
                                </div>
                                <div className="text-[#A6A6A6] hover:text-[#D34D30] transition-colors -mt-1 -mr-2">
                                    <DeleteProjectButton projectId={project.id} brandName={displayName} />
                                </div>
                            </div>

                            <div className="px-1">
                                <BrandCardActions
                                    projectId={project.id}
                                    slug={project.slug}
                                    isPublished={project.is_published ?? true}
                                    username={user.user_metadata?.username || 'user'}
                                    isGenerated={project.is_generated ?? false}
                                />
                            </div>
                        </div>
                    )
                })}

                {/* Blank Chip for New Brand */}
                <Link href="/brand/new" className="flex flex-col gap-3 group">
                    <div className="relative aspect-square w-full rounded-3xl bg-[#E6E5E0] flex items-center justify-center border-[1.5px] border-dashed border-[#CFCFCD] hover:border-[#1A1A1A] hover:bg-[#DEDCD4] transition-all">
                        <Plus className="h-10 w-10 text-[#A6A6A6] group-hover:text-[#1A1A1A] transition-colors" strokeWidth={1} />
                    </div>
                    <div className="px-1 text-sm font-medium text-[#1C1C1C]">Build a New Brand</div>
                </Link>
            </div>
        </div>
    )
}
