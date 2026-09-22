import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/layout/PagePlaceholder'

export default function CategoryPage() {
  const { slug } = useParams()
  return <PagePlaceholder title={slug ?? 'Category'} phase="Phase 3" />
}
