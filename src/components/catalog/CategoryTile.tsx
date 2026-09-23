import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryTile } from '@/config/categoryImages'
import { getCategoryVisual } from '@/lib/categoryVisuals'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

const SIZES = '(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw'

/** Max tilt (deg) and parallax depth (px) at full pointer deflection. */
const MAX_TILT = 5
const IMAGE_DEPTH = 10
const LABEL_DEPTH = 6

export function CategoryTile({ category }: { category: Category }) {
  const tile = getCategoryTile(category.slug)
  const visual = getCategoryVisual(category.slug)
  const [imageFailed, setImageFailed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Pointer position normalized to [-1, 1] around the tile center.
  const px = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 })
  const py = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 })

  const rotateY = useTransform(px, [-1, 1], [-MAX_TILT, MAX_TILT])
  const rotateX = useTransform(py, [1, -1], [-MAX_TILT, MAX_TILT])
  const imageX = useTransform(px, [-1, 1], [-IMAGE_DEPTH, IMAGE_DEPTH])
  const imageY = useTransform(py, [1, -1], [-IMAGE_DEPTH, IMAGE_DEPTH])
  const labelX = useTransform(px, [-1, 1], [-LABEL_DEPTH, LABEL_DEPTH])
  const labelY = useTransform(py, [1, -1], [-LABEL_DEPTH, LABEL_DEPTH])
  const glareX = useTransform(px, [-1, 1], [-60, 60])
  const glareY = useTransform(py, [-1, 1], [-60, 60])
  const glare = useMotionTemplate`radial-gradient(160px circle at calc(50% + ${glareX}px) calc(50% + ${glareY}px), rgb(255 255 255 / 0.16), transparent 65%)`

  function handleMove(event: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set(((event.clientX - rect.left) / rect.width) * 2 - 1)
    py.set(((event.clientY - rect.top) / rect.height) * 2 - 1)
  }

  function handleLeave() {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div style={{ perspective: 700 }} className="focus-within:rounded-card">
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="group relative block"
      >
        <Link
          to={`/category/${category.slug}`}
          className="block aspect-square overflow-hidden rounded-card border border-sand-200 bg-white shadow-card focus-visible:outline-offset-4"
        >
          {tile.photo && !imageFailed ? (
            <motion.img
              src={tile.photo.src}
              srcSet={tile.photo.srcSet}
              sizes={SIZES}
              alt={tile.photo.alt}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              style={{ x: imageX, y: imageY, scale: 1.08 }}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br', tile.fallbackGradient)}>
              <visual.icon className="size-10 text-white/25" />
            </div>
          )}

          {/* Moving glare that follows the pointer. */}
          <motion.div aria-hidden style={{ background: glare }} className="absolute inset-0" />

          {/* Scrim keeps the label legible over any photo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-sand-950/85 via-sand-950/10 to-transparent" />

          <motion.span
            style={{ x: labelX, y: labelY, translateZ: 24 }}
            className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3"
          >
            <span className="line-clamp-2 text-xs leading-tight font-bold text-white sm:text-sm">
              {category.name}
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
              <svg viewBox="0 0 16 16" fill="none" className="size-3 text-white" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.span>
        </Link>
      </motion.div>
    </motion.div>
  )
}
