import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { getCategoryTile } from '@/config/categoryImages'
import { useRemoveCategoryImage, useUpdateCategoryImageAlt, useUploadCategoryImage } from '@/features/admin/queries'
import { showToast } from '@/features/toast/store'
import { compressImage, IMAGE_ACCEPT, MAX_IMAGE_BYTES, validateImageFile } from '@/lib/imageCompress'
import type { Category } from '@/types/catalog'

/** One tile photo per category. Without an upload the bundled photo (or tint) is shown. */
export function CategoryImageField({ category }: { category: Category }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [altDraft, setAltDraft] = useState<string | null>(null)
  const upload = useUploadCategoryImage()
  const remove = useRemoveCategoryImage()
  const updateAlt = useUpdateCategoryImageAlt()

  const tile = getCategoryTile(category.slug, category)
  const hasUpload = Boolean(category.imagePath)
  const busy = upload.isPending || remove.isPending

  async function handleFile(file: File | undefined) {
    if (!file) return
    const problem = validateImageFile(file)
    if (problem) {
      showToast({ tone: 'error', title: problem })
      return
    }
    try {
      const blob = await compressImage(file)
      if (blob.size > MAX_IMAGE_BYTES) throw new Error('Image is still larger than 5 MB after compression.')
      await upload.mutateAsync({
        categoryId: category.id,
        slug: category.slug,
        file: blob,
        altText: category.imageAlt ?? tile.photo?.alt ?? category.name,
        previousPath: category.imagePath,
      })
      showToast({ title: `${category.name} image updated` })
    } catch (err) {
      showToast({ tone: 'error', title: err instanceof Error ? err.message : 'Upload failed' })
    }
  }

  function handleRemove() {
    if (!category.imagePath) return
    if (!confirm('Remove the uploaded image? The default photo will be shown instead.')) return
    remove.mutate(
      { categoryId: category.id, path: category.imagePath },
      { onError: (err) => showToast({ tone: 'error', title: err.message }) },
    )
  }

  function commitAlt() {
    if (altDraft === null) return
    const next = altDraft.trim().slice(0, 200) || null
    setAltDraft(null)
    if (next === category.imageAlt) return
    updateAlt.mutate(
      { categoryId: category.id, altText: next },
      { onError: (err) => showToast({ tone: 'error', title: err.message }) },
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className={`aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md sm:w-48 ${tile.fallbackTint}`}>
        {tile.photo ? <img src={tile.photo.src} srcSet={tile.photo.srcSet} sizes="192px" alt="" className="size-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-xs text-content-muted">
          {hasUpload ? 'Showing your uploaded photo.' : 'Showing the default photo. Upload one to replace it.'}
        </p>
        {hasUpload ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-800">Alt text</span>
            <input
              value={altDraft ?? category.imageAlt ?? ''}
              onChange={(e) => setAltDraft(e.target.value)}
              onBlur={commitAlt}
              maxLength={200}
              className="h-9 w-full rounded-sm border border-border-subtle px-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-pill border border-border-strong px-3.5 py-1.5 text-sm font-semibold text-ink-800 hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            {hasUpload ? 'Replace image' : 'Upload image'}
          </button>
          {hasUpload ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-semibold text-danger hover:bg-danger-surface disabled:opacity-50"
            >
              <Trash2 className="size-4" /> Use default
            </button>
          ) : null}
        </div>
        <p className="text-xs text-content-muted">JPG, PNG or WebP · max 5 MB · landscape 4:3 works best</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
