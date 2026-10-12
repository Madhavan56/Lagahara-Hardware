/**
 * Client-side image checks and downscaling for admin uploads, using only the
 * browser canvas (no dependency). The bucket also enforces type and a 5 MB
 * cap server-side; these checks just fail fast with a friendlier message.
 */

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(',')

const MAX_DIMENSION = 2000
const QUALITY = 0.85

export function validateImageFile(file: File): string | null {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return `${file.name}: only JPG, PNG and WebP images are allowed.`
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: larger than 5 MB.`
  }
  return null
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY))
}

/**
 * Downscales to at most 2000px on the long edge and re-encodes as WebP
 * (JPEG where the browser can't encode WebP). PNGs with transparency keep
 * their alpha since WebP supports it. Returns the original file whenever
 * re-encoding wouldn't make it smaller.
 */
export async function compressImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let blob = await canvasToBlob(canvas, 'image/webp')
  // Browsers that can't encode WebP silently fall back to PNG.
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg')
  }
  if (!blob || blob.size >= file.size) return file
  return blob
}
