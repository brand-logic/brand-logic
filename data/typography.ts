
export type FontPairing = {
    id: string
    primaryFont: string
    secondaryFont: string
    primaryFontFile?: string // Path to local file in public/fonts if needed
    secondaryFontFile?: string
    googleFont: boolean // If true, load from Google Fonts
    coreValues: string[] // Maps to Step 2 selections
    description: string
    previewText: string
}

export const TYPOGRAPHY_OPTIONS: FontPairing[] = [
    // Modern / Innovative / Bold
    {
        id: 'pairing-01',
        primaryFont: 'Inter',
        secondaryFont: 'Inter',
        googleFont: true,
        coreValues: ['Innovation', 'Modern', 'Minimalist', 'Efficient', 'Tech-forward'],
        description: 'Clean, modern, and highly legible. Perfect for tech and SaaS brands.',
        previewText: 'The future is now.'
    },
    {
        id: 'pairing-02',
        primaryFont: 'Oswald',
        secondaryFont: 'Lato',
        googleFont: true,
        coreValues: ['Bold', 'Strong', 'Energetic', 'Industrial', 'Assertive'],
        description: 'Strong headlines with readable body text. Impactful and confident.',
        previewText: 'STAND OUT.'
    },

    // Traditional / Trustworthy / Elegant
    {
        id: 'pairing-03',
        primaryFont: 'Playfair Display',
        secondaryFont: 'Source Sans 3',
        googleFont: true,
        coreValues: ['Traditional', 'Elegant', 'Luxury', 'Trustworthy', 'Sophisticated'],
        description: 'High-contrast serif headers for elegance, paired with a functional sans-serif.',
        previewText: 'Timeless Elegance.'
    },
    {
        id: 'pairing-04',
        primaryFont: 'Merriweather',
        secondaryFont: 'Open Sans',
        googleFont: true,
        coreValues: ['Reliable', 'Classic', 'Literature', 'Warm', 'Trust'],
        description: 'Classic serif that is highly readable on screens.',
        previewText: 'Reliable and clear.'
    },

    // Creative / Artistic / Friendly
    {
        id: 'pairing-05',
        primaryFont: 'Pacifico',
        secondaryFont: 'Quicksand',
        googleFont: true,
        coreValues: ['Creative', 'Friendly', 'Playful', 'Artistic', 'Approachable'],
        description: 'Brush script for personality, paired with a rounded sans-serif.',
        previewText: 'Creative Vibes.'
    },
    {
        id: 'pairing-06',
        primaryFont: 'Abril Fatface',
        secondaryFont: 'Poppins',
        googleFont: true,
        coreValues: ['Creative', 'Bold', 'Fashion', 'Display', 'Unique'],
        description: 'Heavy display serif for fashion and lifestyle brands.',
        previewText: 'Bold Statements.'
    },

    // Nature / Organic / Calm
    {
        id: 'pairing-07',
        primaryFont: 'Nunito',
        secondaryFont: 'Nunito Sans',
        googleFont: true,
        coreValues: ['Organic', 'Calm', 'Nature', 'Wellness', 'Soft'],
        description: 'Rounded terminals give a soft, approachable, and organic feel.',
        previewText: 'Naturally Soft.'
    },
    {
        id: 'pairing-08',
        primaryFont: 'Lora',
        secondaryFont: 'Mulish',
        googleFont: true,
        coreValues: ['Sustainable', 'Nature', 'Balanced', 'Thoughtful'],
        description: 'Contemporary serif with a balanced sans-serif.',
        previewText: 'Sustainable Future.'
    }
]
