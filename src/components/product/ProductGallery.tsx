import { AnimatePresence, m, useReducedMotion, type PanInfo } from 'framer-motion'
import { useRef, useState } from 'react'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import { productImageUrl } from '@/lib/supabase/client'
import { DURATION, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/catalog'

/** Horizontal drag (px) or flick velocity that counts as a swipe. */
const SWIPE_DISTANCE = 60
const SWIPE_VELOCITY = 400

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const reduce = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  const active = images[activeIndex]
  const activeUrl = active ? productImageUrl(active.storagePath, { width: 1000, quality: 85 }) : null
  const canSwipe = images.length > 1

  function show(index: number) {
    if (index < 0 || index >= images.length || index === activeIndex) return
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  // Zoom origin is written straight to a CSS variable, so moving the mouse
  // never re-renders React.
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    frameRef.current?.style.setProperty('--zoom-origin', `${x}% ${y}%`)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) show(activeIndex + 1)
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) show(activeIndex - 1)
  }

  const slide = reduce ? 0 : 40

  return (
    <div>
      {/* Double-bezel tray around the main photo. */}
      <div className="rounded-[2rem] bg-ink-950/[0.03] p-1.5 ring-1 ring-ink-950/[0.06]">
      <div
        ref={frameRef}
        className="relative aspect-square overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-sunken [@media(hover:hover)]:cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {activeUrl ? (
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.img
              key={active?.id}
              src={activeUrl}
              alt={active?.altText ?? productName}
              draggable={false}
              custom={direction}
              initial={{ opacity: 0, x: direction * slide }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -slide }}
              transition={{ duration: DURATION.base, ease: EASE.expo }}
              drag={canSwipe ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 size-full touch-pan-y object-cover"
            />
          </AnimatePresence>
        ) : (
          <ProductImagePlaceholder size="lg" />
        )}

        {/* Zoom layer: same photo, scaled from the cursor. Pointer devices only. */}
        {activeUrl ? (
          <img
            src={activeUrl}
            alt=""
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 hidden size-full origin-(--zoom-origin) object-cover opacity-0 transition-[transform,opacity] duration-(--duration-base) ease-[var(--ease-out-expo)] [@media(hover:hover)]:block',
              zoomed ? 'scale-[2] opacity-100' : 'scale-100',
            )}
          />
        ) : null}

        {canSwipe ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
            {images.map((image, index) => (
              <span
                key={image.id}
                className={cn(
                  'h-1.5 w-1.5 rounded-pill bg-card/70 transition-transform duration-(--duration-base)',
                  index === activeIndex && 'scale-x-[2.5] bg-card',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
      </div>

      {canSwipe ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const thumbUrl = productImageUrl(image.storagePath, { width: 150 })
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => show(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-sm border-2 transition-[border-color,transform] duration-(--duration-fast) active:scale-95',
                  index === activeIndex ? 'border-iris-700' : 'border-transparent hover:border-border-strong',
                )}
              >
                {thumbUrl ? <img src={thumbUrl} alt="" loading="lazy" className="size-full object-cover" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
