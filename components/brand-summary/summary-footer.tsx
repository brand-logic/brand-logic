import { CANVAS } from '@/lib/brand-summary-tokens'

export default function SummaryFooter() {
  return (
    <footer
      style={{
        paddingTop: 80,
        paddingBottom: 40,
        textAlign: 'center',
        backgroundColor: CANVAS.bg,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-brand-secondary, var(--font-favorit), system-ui, sans-serif)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: CANVAS.fgMuted,
        }}
      >
        POWERED BY BRAND LOGIC
      </p>
    </footer>
  )
}
