import { useMutation, useQueryClient } from '@tanstack/react-query'

type ReorderInput = {
  pageId: string
  sourceIds: string[]
}

async function reorderSources(input: ReorderInput): Promise<void> {
  const res = await fetch(`/api/pages/${input.pageId}/sources/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_ids: input.sourceIds }),
  })
  if (!res.ok) throw new Error('failed to reorder sources')
}

export function useReorderSources(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reorderSources,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', pageId] })
    },
  })
}
