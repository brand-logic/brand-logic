'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

export default function PdfDownloadButton({ brandName }: { brandName: string }) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        setIsGenerating(true)
        const toastId = toast.loading('Generating PDF... This may take a moment.')
        try {
            const element = document.getElementById('brand-guidelines')
            if (!element) throw new Error('Guidelines container not found')

            // 1. Capture the element as a PNG data URL using html-to-image
            // It relies on native browser SVG rendering which natively supports oklab/Tailwind v4
            const dataUrl = await toPng(element, {
                quality: 1.0,
                pixelRatio: 2, // Higher scale for better quality
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            })

            // 2. Initialize PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [element.scrollWidth, element.scrollHeight] 
            })

            // 3. Add image to PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // 4. Save
            pdf.save(`${brandName.replace(/\s+/g, '_')}_Brand_Guidelines.pdf`)
            toast.success('PDF downloaded successfully!', { id: toastId })

        } catch (error: any) {
            console.error('PDF Generation failed:', error)
            toast.error(`PDF failed: ${error.message || 'Check console.'}`, { id: toastId })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button onClick={handleDownload} disabled={isGenerating} variant="outline" className="gap-2 shrink-0">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
        </Button>
    )
}
