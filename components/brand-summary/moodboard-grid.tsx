'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { CANVAS } from '@/lib/brand-summary-tokens'
import { optimizeImageBeforeUpload } from '@/lib/image-compress'
import { Upload, Loader2 } from 'lucide-react'

interface MoodboardGridProps {
  images: string[] // 6 URLs
  brandName: string
  isEditing?: boolean
  onUploadSlot?: (slotIndex: number, file: File) => Promise<void>
}

export default function MoodboardGrid({
  images,
  brandName,
  isEditing = false,
  onUploadSlot,
}: MoodboardGridProps) {
  // Always render 6 cells; fill missing with placeholder
  const cells = Array.from({ length: 6 }, (_, i) => images[i] ?? null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSlotClick = (index: number) => {
    if (!isEditing || uploadingSlot !== null) return
    setActiveSlot(index)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || activeSlot === null || !onUploadSlot) return

    try {
      setUploadingSlot(activeSlot)
      // Client-side resize/compress to max 2000px longest edge (Section 3.2)
      const optimizedFile = await optimizeImageBeforeUpload(file, 2000)
      await onUploadSlot(activeSlot, optimizedFile)
    } catch (err: any) {
      console.error('Moodboard slot upload failed:', err)
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploadingSlot(null)
      setActiveSlot(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {cells.map((src, i) => (
        <div
          key={i}
          onClick={() => handleSlotClick(i)}
          style={{
            position: 'relative',
            aspectRatio: '1 / 1',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: isEditing ? 'pointer' : 'default',
            backgroundColor: CANVAS.bgPlaceholder,
          }}
          className="group"
          title={isEditing ? `Click to replace image ${i + 1}` : undefined}
        >
          {src ? (
            <Image
              src={src}
              alt={`${brandName} moodboard image ${i + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 50vw, 220px"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CANVAS.fgMuted} strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Edit overlay */}
          {isEditing && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: uploadingSlot === i ? 1 : 0,
                transition: 'opacity 0.2s',
                color: '#FFF',
                gap: 6,
              }}
              className={uploadingSlot === i ? '' : 'group-hover:opacity-100'}
            >
              {uploadingSlot === i ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Optimizing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Replace {i + 1}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
