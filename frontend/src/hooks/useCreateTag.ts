import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tag } from '../types/pages'

async function createTag(name: string): Promise<Tag> {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('failed to create tag')
  return res.json()
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}
