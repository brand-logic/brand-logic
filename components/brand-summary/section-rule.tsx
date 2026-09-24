import { CANVAS } from '@/lib/brand-summary-tokens'

/** Horizontal rule used between sections per spec */
export default function SectionRule() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${CANVAS.borderSubtle}`,
        width: '100%',
        margin: 0,
      }}
    />
  )
}
