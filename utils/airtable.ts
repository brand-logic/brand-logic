
import { FontPairing } from '@/data/typography'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_PAT = process.env.AIRTABLE_PAT
const TABLE_ID = 'tblq0oewpSpTmcj1i' // "Font Pairings"

export async function getFontPairings(): Promise<FontPairing[]> {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
        console.error('Airtable credentials missing')
        return []
    }

    try {
        const response = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_ID}?cellFormat=string&timeZone=America/New_York&userLocale=en-US`,
            {
                headers: {
                    Authorization: `Bearer ${AIRTABLE_PAT}`,
                },
                next: { revalidate: 3600 },
            }
        )

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.statusText}`)
        }

        const data = await response.json()

        // Map Airtable records to FontPairing type
        // @ts-ignore
        return data.records.map((record: any) => {
            const fields = record.fields

            // Handle Core Values (string split or array)
            let coreValues: string[] = []
            if (Array.isArray(fields['Core Values'])) {
                coreValues = fields['Core Values']
                    .flatMap((v: any) => (typeof v === 'string' ? v.split(/[;,]/) : v))
                    .map((v: string) => (typeof v === 'string' ? v.trim() : v))
                    .filter(Boolean)
            } else if (typeof fields['Core Values'] === 'string') {
                coreValues = fields['Core Values'].split(/[;,]/).map((v: string) => v.trim()).filter(Boolean)
            }

            // Handle Fonts (string or array)
            // With cellFormat=string, linked records return the primary field value as a string
            const primaryFontRaw = fields['Headline Font']
            const primaryFont = typeof primaryFontRaw === 'string' ? primaryFontRaw : (Array.isArray(primaryFontRaw) ? primaryFontRaw[0] : 'Inter')

            const secondaryFontRaw = fields['Body Font']
            const secondaryFont = typeof secondaryFontRaw === 'string' ? secondaryFontRaw : (Array.isArray(secondaryFontRaw) ? secondaryFontRaw[0] : 'Inter')

            return {
                id: record.id,
                primaryFont: primaryFont || 'Inter',
                secondaryFont: secondaryFont || 'Inter',
                googleFont: true,
                coreValues: coreValues,
                description: fields['Wizard Rule Notes'] || fields['Pair Name'] || 'A curated font pairing.',
                previewText: 'The quick brown fox jumps over the lazy dog.',
            }
        })
    } catch (error) {
        console.error('Failed to fetch from Airtable:', error)
        return []
    }
}

/**
 * Reusable helper returning curated, scoped fonts from the Airtable font set.
 * Used by both Wizard Step 4 and Edit Mode font pickers.
 */
export async function getCuratedFontsForBrand(coreValues: string[] = []): Promise<{
    pairings: FontPairing[]
    primaryFonts: string[]
    secondaryFonts: string[]
}> {
    const allPairings = await getFontPairings()
    if (!allPairings || allPairings.length === 0) {
        return {
            pairings: [],
            primaryFonts: ['Inter'],
            secondaryFonts: ['Inter'],
        }
    }

    let recommended = allPairings
    if (coreValues && coreValues.length > 0) {
        const scored = allPairings.map(option => {
            const matchCount = option.coreValues.filter(val =>
                coreValues.some(bv => bv.toLowerCase() === val.toLowerCase())
            ).length
            return { ...option, score: matchCount }
        })
        scored.sort((a, b) => b.score - a.score)
        recommended = scored.slice(0, 9)
    }

    const primaryFonts = Array.from(new Set(recommended.map(p => p.primaryFont).filter(Boolean)))
    const secondaryFonts = Array.from(new Set(recommended.map(p => p.secondaryFont).filter(Boolean)))

    return {
        pairings: recommended,
        primaryFonts,
        secondaryFonts,
    }
}

