import { useQuery } from '@tanstack/react-query'
import type { Section } from '../types/pages'

async function fetchSections(pageId: string): Promise<Section[]> {
  const res = await fetch(`/api/pages/${pageId}/sections`)
  if (!res.ok) throw new Error('failed to fetch sections')
  return res.json()
}

export function useSectionList(pageId: string) {
  return useQuery({
    queryKey: ['sections', pageId],
    queryFn: () => fetchSections(pageId),
    enabled: !!pageId,
  })
}
