import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Section } from '../../../types/pages'

type UpdateSectionInput = {
  id: string
  pageId: string
  name: string
}

async function updateSection(input: UpdateSectionInput): Promise<Section> {
  const res = await fetch(`/api/sections/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: input.name }),
  })
  if (!res.ok) throw new Error('failed to update section')
  return res.json()
}

export function useUpdateSection(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', pageId] })
    },
  })
}
