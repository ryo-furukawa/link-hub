import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Source } from '../../../types/pages'

type CreateSourceInput = {
  pageId: string
  type: 'link' | 'note'
  url?: string
  title: string
  memo?: string
  content?: string
  section_id?: string
}

async function createSource(input: CreateSourceInput): Promise<Source> {
  const { pageId, ...body } = input
  const res = await fetch(`/api/pages/${pageId}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('failed to create source')
  return res.json()
}

export function useCreateSource(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', pageId] })
    },
  })
}
