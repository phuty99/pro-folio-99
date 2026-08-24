export default function VoxelCube({
  size = 24,
  colors = ['var(--color-fire-500)', 'var(--color-earth-600)', 'var(--color-earth-800)'],
  className = '',
}: {
  size?: number
  colors?: [string, string, string]
  className?: string
}) {
  const [top, left, right] = colors
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <polygon points="50,0 92,26 50,51 8,26" fill={top} stroke={top} strokeWidth="1" strokeLinejoin="round" />
      <polygon points="8,26 50,51 50,100 8,74" fill={left} stroke={left} strokeWidth="1" strokeLinejoin="round" />
      <polygon points="92,26 50,51 50,100 92,74" fill={right} stroke={right} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}
