import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { ProductImagePlaceholder } from '@/components/product/ProductImagePlaceholder'
import type { AdminProductImage } from '@/features/admin/api'
import {
  useDeleteProductImage,
  useReorderProductImages,
  useSetPrimaryImage,
  useUpdateImageAlt,
  useUploadProductImage,
} from '@/features/admin/queries'
import { showToast } from '@/features/toast/store'
import { compressImage, IMAGE_ACCEPT, MAX_IMAGE_BYTES, validateImageFile } from '@/lib/imageCompress'
import { productImageUrl } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 10

const ICON_BUTTON =
  'rounded-pill bg-card/90 p-1.5 text-ink-700 shadow-card transition-colors hover:text-primary disabled:opacity-40'

export function ProductImageManager({
  productId,
  productName,
  categorySlug,
  images,
}: {
  productId: string
  productName: string
  categorySlug: string
  images: AdminProductImage[]
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({})

  const upload = useUploadProductImage(productId)
  const remove = useDeleteProductImage(productId)
  const setPrimary = useSetPrimaryImage(productId)
  const reorder = useReorderProductImages(productId)
  const updateAlt = useUpdateImageAlt(productId)

  const busy = uploading > 0 || remove.isPending || reorder.isPending || setPrimary.isPending

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (!files.length) return

    const room = MAX_IMAGES - images.length
    if (files.length > room) {
      showToast({ tone: 'error', title: `A product can have at most ${MAX_IMAGES} images.` })
      return
    }

    const valid: File[] = []
    for (const file of files) {
      const problem = validateImageFile(file)
      if (problem) showToast({ tone: 'error', title: problem })
      else valid.push(file)
    }

    setUploading(valid.length)
    let nextSort = images.reduce((max, img) => Math.max(max, img.sortOrder), -1) + 1
    let hasPrimary = images.some((img) => img.isPrimary)
    for (const file of valid) {
      try {
        const blob = await compressImage(file)
        if (blob.size > MAX_IMAGE_BYTES) throw new Error(`${file.name}: still larger than 5 MB after compression.`)
        await upload.mutateAsync({
          categorySlug,
          file: blob,
          sortOrder: nextSort++,
          isPrimary: !hasPrimary,
          altText: productName,
        })
        hasPrimary = true
      } catch (err) {
        showToast({ tone: 'error', title: err instanceof Error ? err.message : `Could not upload ${file.name}` })
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  function move(index: number, direction: -1 | 1) {
    const ids = images.map((img) => img.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target] as string, ids[index] as string]
    reorder.mutate(ids, { onError: (err) => showToast({ tone: 'error', title: err.message }) })
  }

  function handleDelete(image: AdminProductImage) {
    if (!confirm('Delete this image?')) return
    remove.mutate(image, { onError: (err) => showToast({ tone: 'error', title: err.message }) })
  }

  function commitAlt(image: AdminProductImage) {
    const draft = altDrafts[image.id]
    if (draft === undefined) return
    const next = draft.trim().slice(0, 200) || null
    if (next !== image.altText) {
      updateAlt.mutate(
        { imageId: image.id, altText: next },
        { onError: (err) => showToast({ tone: 'error', title: err.message }) },
      )
    }
    setAltDrafts(({ [image.id]: _removed, ...rest }) => rest)
  }

  return (
    <div>
      {images.length === 0 && uploading === 0 ? (
        <div className="mb-4 flex items-center gap-4 rounded-md border border-border-subtle p-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-sm">
            <ProductImagePlaceholder size="sm" />
          </div>
          <p className="text-sm text-content-muted">
            No images yet. Customers see the branded placeholder until you add one.
          </p>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {images.map((image, index) => {
          const url = productImageUrl(image.storagePath, { width: 240 })
          return (
            <li key={image.id} className="flex gap-3 rounded-md border border-border-subtle p-2.5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-sm bg-surface-sunken">
                {url ? <img src={url} alt="" className="size-full object-cover" /> : null}
                {image.isPrimary ? (
                  <span className="absolute top-1 left-1 rounded-pill bg-primary px-2 py-0.5 text-[0.625rem] font-bold text-on-primary">
                    Primary
                  </span>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <label className="block">
                  <span className="sr-only">Alt text for image {index + 1}</span>
                  <input
                    value={altDrafts[image.id] ?? image.altText ?? ''}
                    onChange={(e) => setAltDrafts((prev) => ({ ...prev, [image.id]: e.target.value }))}
                    onBlur={() => commitAlt(image)}
                    maxLength={200}
                    placeholder="Alt text (describe the photo)"
                    className="h-9 w-full rounded-sm border border-border-subtle px-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className={ICON_BUTTON}
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label="Move earlier"
                    title="Move earlier"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className={ICON_BUTTON}
                    onClick={() => move(index, 1)}
                    disabled={busy || index === images.length - 1}
                    aria-label="Move later"
                    title="Move later"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className={cn(ICON_BUTTON, image.isPrimary && 'text-primary')}
                    onClick={() => setPrimary.mutate(image.id)}
                    disabled={busy || image.isPrimary}
                    aria-label="Set as primary image"
                    title="Set as primary"
                  >
                    <Star className={cn('size-3.5', image.isPrimary && 'fill-current')} />
                  </button>
                  <button
                    type="button"
                    className={cn(ICON_BUTTON, 'hover:text-danger')}
                    onClick={() => handleDelete(image)}
                    disabled={busy}
                    aria-label="Delete image"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy || images.length >= MAX_IMAGES}
          className="inline-flex items-center gap-2 rounded-pill border-2 border-dashed border-border-strong px-4 py-2 text-sm font-semibold text-ink-700 hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {uploading > 0 ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {uploading > 0 ? `Uploading ${uploading}…` : 'Add images'}
        </button>
        <p className="text-xs text-content-muted">
          JPG, PNG or WebP · max 5 MB each · up to {MAX_IMAGES} · resized to 2000px automatically
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
