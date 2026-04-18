import { useQuery } from '@tanstack/react-query'
import type { Tag } from '../../../types/pages'

async function fetchPageTags(pageId: string): Promise<Tag[]> {
  const res = await fetch(`/api/pages/${pageId}/tags`)
  if (!res.ok) throw new Error('failed to fetch page tags')
  return res.json()
}

export function usePageTagList(pageId: string) {
  return useQuery({
    queryKey: ['page-tags', pageId],
    queryFn: () => fetchPageTags(pageId),
    enabled: !!pageId,
  })
}
