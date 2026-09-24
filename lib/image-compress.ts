/**
 * Client-side image resize and optimization.
 * Resizes images exceeding maxDimension (default 2000px) on longest edge.
 */
export async function optimizeImageBeforeUpload(
    file: File,
    maxDimension = 2000,
    quality = 0.88
): Promise<File> {
    // SVGs do not need bitmap resizing
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        return file
    }

    return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            let { width, height } = img

            if (width <= maxDimension && height <= maxDimension && file.size < 2 * 1024 * 1024) {
                // Already within dimensions and reasonable size
                return resolve(file)
            }

            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width)
                    width = maxDimension
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height)
                    height = maxDimension
                }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) return resolve(file)

            ctx.drawImage(img, 0, 0, width, height)

            const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'

            canvas.toBlob(
                (blob) => {
                    if (!blob) return resolve(file)
                    const optimizedFile = new File([blob], file.name, {
                        type: outputType,
                        lastModified: Date.now(),
                    })
                    resolve(optimizedFile)
                },
                outputType,
                quality
            )
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            resolve(file) // fallback to original if canvas decoding fails
        }

        img.src = objectUrl
    })
}
