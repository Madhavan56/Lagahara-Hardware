import { useState } from 'react'
import { productImageUrl } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/catalog'

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')

  const active = images[activeIndex]
  const activeUrl = active ? productImageUrl(active.storagePath) : null

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setZoomOrigin(`${x}% ${y}%`)
  }

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-card border border-sand-200 bg-sand-100"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={active?.altText ?? productName}
            className={cn(
              'size-full object-cover transition-transform duration-200 ease-out',
              zoomed && 'scale-[2]',
            )}
            style={{ transformOrigin: zoomOrigin }}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sand-400">No image</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const thumbUrl = productImageUrl(image.storagePath)
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                  index === activeIndex ? 'border-brand-700' : 'border-transparent hover:border-sand-300',
                )}
              >
                {thumbUrl ? (
                  <img src={thumbUrl} alt="" className="size-full object-cover" />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
