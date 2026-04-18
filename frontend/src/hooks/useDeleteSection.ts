import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteSection(id: string): Promise<void> {
  const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('failed to delete section')
}

export function useDeleteSection(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', pageId] })
    },
  })
}
