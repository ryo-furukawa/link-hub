import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Section } from '../types/pages'

type CreateSectionInput = {
  pageId: string
  name: string
}

async function createSection(input: CreateSectionInput): Promise<Section> {
  const res = await fetch(`/api/pages/${input.pageId}/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: input.name }),
  })
  if (!res.ok) throw new Error('failed to create section')
  return res.json()
}

export function useCreateSection(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', pageId] })
    },
  })
}
