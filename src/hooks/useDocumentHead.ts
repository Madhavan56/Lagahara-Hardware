import { useEffect } from 'react'

/** Sets document title/description and an optional JSON-LD block for the current page. */
export function useDocumentHead({
  title,
  description,
  jsonLd,
}: {
  title: string
  description?: string
  jsonLd?: Record<string, unknown>
}) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    let descriptionTag: HTMLMetaElement | null = null
    let previousDescription: string | null = null
    if (description) {
      descriptionTag = document.querySelector('meta[name="description"]')
      if (descriptionTag) {
        previousDescription = descriptionTag.content
        descriptionTag.content = description
      }
    }

    let scriptTag: HTMLScriptElement | null = null
    if (jsonLd) {
      scriptTag = document.createElement('script')
      scriptTag.type = 'application/ld+json'
      scriptTag.text = JSON.stringify(jsonLd)
      document.head.appendChild(scriptTag)
    }

    return () => {
      document.title = previousTitle
      if (descriptionTag && previousDescription !== null) {
        descriptionTag.content = previousDescription
      }
      if (scriptTag) {
        scriptTag.remove()
      }
    }
  }, [title, description, jsonLd])
}
