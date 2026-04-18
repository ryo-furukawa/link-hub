import { useQuery } from '@tanstack/react-query'
import type { Source } from '../types/pages'

async function fetchSources(pageId: string): Promise<Source[]> {
  const res = await fetch(`/api/pages/${pageId}/sources`)
  if (!res.ok) throw new Error('failed to fetch sources')
  return res.json()
}

export function useSourceList(pageId: string) {
  return useQuery({
    queryKey: ['sources', pageId],
    queryFn: () => fetchSources(pageId),
    enabled: !!pageId,
  })
}
