import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Page } from '../types/pages'

type UpdatePageInput = {
  id: string
  title: string
  description: string
}

async function updatePage({ id, title, description }: UpdatePageInput): Promise<Page> {
  const res = await fetch(`/api/pages/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  })
  if (!res.ok) throw new Error('failed to update page')
  return res.json()
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })
}
