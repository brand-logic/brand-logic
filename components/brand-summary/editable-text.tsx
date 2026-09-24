'use client'

import React, { useRef, useEffect } from 'react'

interface EditableTextProps {
    value: string
    onChange?: (value: string) => void
    isEditing?: boolean
    multiline?: boolean
    placeholder?: string
    style?: React.CSSProperties
    className?: string
    maxLength?: number
    tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
}

export default function EditableText({
    value,
    onChange,
    isEditing = false,
    multiline = false,
    placeholder = 'Click to edit...',
    style,
    className = '',
    maxLength,
    tag: Tag = 'p',
}: EditableTextProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-adjust textarea height to content
    useEffect(() => {
        if (isEditing && multiline && textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value, isEditing, multiline])

    if (!isEditing) {
        return (
            <Tag style={style} className={className}>
                {value || placeholder}
            </Tag>
        )
    }

    const editBaseStyle: React.CSSProperties = {
        ...style,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        outline: 'none',
        borderRadius: 4,
        padding: '2px 6px',
        margin: '-2px -6px',
        border: '1px dashed rgba(0, 0, 0, 0.25)',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, background-color 0.2s',
    }

    if (multiline) {
        return (
            <textarea
                ref={textareaRef}
                value={value ?? ''}
                onChange={(e) => {
                    onChange?.(e.target.value)
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto'
                        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                    }
                }}
                maxLength={maxLength}
                placeholder={placeholder}
                rows={1}
                style={{
                    ...editBaseStyle,
                    resize: 'none',
                    overflow: 'hidden',
                    display: 'block',
                }}
                className={`focus:border-black focus:bg-white/80 ${className}`}
            />
        )
    }

    return (
        <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            maxLength={maxLength}
            placeholder={placeholder}
            style={editBaseStyle}
            className={`focus:border-black focus:bg-white/80 ${className}`}
        />
    )
}
