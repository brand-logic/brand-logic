
'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const TASKS = [
    { id: 'pdf', label: 'Save and share this PDF - Keep this as your source of truth' },
    { id: 'social', label: 'Create your first branded asset - Apply your colors/fonts to a post' },
    { id: 'palette', label: 'Apply your color palette - Use hex codes in your design tools' },
    { id: 'voice', label: 'Use your brand voice examples in social - Practice your tone' },
    { id: 'oh', label: 'Book a 15-min Brand Logic OH - Get personalized guidance' },
]

export default function NextSteps({ brandId }: { brandId: string }) {
    const [checked, setChecked] = useState<Record<string, boolean>>({})

    // Load state from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(`brand_progress_${brandId}`)
        if (saved) {
            setChecked(JSON.parse(saved))
        }
    }, [brandId])

    const handleCheck = (id: string, isChecked: boolean) => {
        const newState = { ...checked, [id]: isChecked }
        setChecked(newState)
        localStorage.setItem(`brand_progress_${brandId}`, JSON.stringify(newState))
    }

    const completedCount = Object.values(checked).filter(Boolean).length

    return (
        <div className="bg-card border rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-heading">Your Launch Checklist</h3>
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    {completedCount} of {TASKS.length} completed
                </span>
            </div>

            <div className="space-y-4">
                {TASKS.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                            id={task.id}
                            checked={checked[task.id] || false}
                            onCheckedChange={(c) => handleCheck(task.id, c as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor={task.id}
                                className={`text-sm font-medium leading-normal cursor-pointer ${checked[task.id] ? 'line-through text-muted-foreground' : ''}`}
                            >
                                {task.label}
                            </Label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
