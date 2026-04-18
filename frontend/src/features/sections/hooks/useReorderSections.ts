import { useMutation, useQueryClient } from '@tanstack/react-query'

async function reorderSections(input: { pageId: string; sectionIds: string[] }): Promise<void> {
  const res = await fetch(`/api/pages/${input.pageId}/sections/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_ids: input.sectionIds }),
  })
  if (!res.ok) throw new Error('failed to reorder sections')
}

export function useReorderSections(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderSections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', pageId] })
    },
  })
}
