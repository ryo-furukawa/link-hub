import { useQuery } from '@tanstack/react-query'
import type { Tag } from '../types/pages'

async function fetchTags(): Promise<Tag[]> {
  const res = await fetch('/api/tags')
  if (!res.ok) throw new Error('failed to fetch tags')
  return res.json()
}

export function useTagList() {
  return useQuery({ queryKey: ['tags'], queryFn: fetchTags })
}
