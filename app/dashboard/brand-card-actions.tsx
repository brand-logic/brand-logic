'use client'

import React, { useState, useTransition } from 'react'
import { Globe, EyeOff, Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { toggleBrandPublish } from './actions'

interface BrandCardActionsProps {
  projectId: string
  slug?: string | null
  isPublished?: boolean
  username: string
  isGenerated?: boolean
}

export function BrandCardActions({
  projectId,
  slug,
  isPublished = true,
  username,
  isGenerated = false,
}: BrandCardActionsProps) {
  const [published, setPublished] = useState(isPublished)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Only show public link and publish controls if brand has been generated and has a slug
  if (!isGenerated && !slug) {
    return null
  }

  const publicPath = `/${username}/${slug || ''}`

  const handleTogglePublish = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const nextState = !published
    setPublished(nextState)

    startTransition(async () => {
      try {
        await toggleBrandPublish(projectId, nextState)
        toast.success(nextState ? 'Brand is now publicly visible' : 'Brand is now private')
      } catch (err: any) {
        setPublished(!nextState)
        toast.error(err.message || 'Failed to update publish state')
      }
    })
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const fullUrl = `${window.location.origin}${publicPath}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success('Public URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between pt-2 border-t border-black/5 mt-2">
      {/* Public URL Link & Copy */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#737373]">
        <a
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="hover:text-black hover:underline flex items-center gap-1"
          title="Open public page"
        >
          <span>{publicPath}</span>
          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-1 hover:text-black hover:bg-black/5 rounded transition-colors"
          title="Copy public link"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {/* Publish/Unpublish Toggle */}
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPending}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase transition-colors ${
          published
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={published ? 'Click to make private' : 'Click to publish'}
      >
        {published ? <Globe className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
        <span>{published ? 'Live' : 'Private'}</span>
      </button>
    </div>
  )
}
