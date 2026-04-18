import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Page } from '../../../types/pages'

type CreatePageInput = {
  title: string
  description: string
}

async function createPage(input: CreatePageInput): Promise<Page> {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('failed to create page')
  return res.json()
}

export function useCreatePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })
}
