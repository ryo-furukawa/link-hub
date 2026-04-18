import { useQuery } from '@tanstack/react-query'
import type { Page } from '../../../types/pages'

async function fetchPages(): Promise<Page[]> {
  const res = await fetch('/api/pages')
  if (!res.ok) throw new Error('failed to fetch pages')
  return res.json()
}

export function usePageList() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
  })
}
