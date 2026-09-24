'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProject } from './actions'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DeleteProjectButton({ projectId, brandName }: { projectId: string; brandName: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteProject(projectId)
            toast.success(`Project "${brandName}" deleted`)
        } catch (error) {
            toast.error('Failed to delete project')
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-brand-gray hover:text-red-600 hover:bg-red-50 -mr-2"
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete project</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className="text-[24px] font-display font-medium tracking-tight text-[#1A1A1A]">
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-[#666666] leading-relaxed">
                        This action cannot be undone. This will permanently delete the brand project
                        <span className="font-bold text-[#1A1A1A]"> "{brandName}" </span>
                        and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
