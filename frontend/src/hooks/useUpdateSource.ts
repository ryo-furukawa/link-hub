import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Source } from '../types/pages'

type UpdateSourceInput = {
  id: string
  pageId: string
  title: string
  url?: string
  memo?: string
  content?: string
  section_id?: string
}

async function updateSource(input: UpdateSourceInput): Promise<Source> {
  const { id, pageId: _, ...body } = input
  const res = await fetch(`/api/sources/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('failed to update source')
  return res.json()
}

export function useUpdateSource(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', pageId] })
    },
  })
}
