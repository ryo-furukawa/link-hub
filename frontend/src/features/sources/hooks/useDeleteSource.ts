import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteSource(id: string): Promise<void> {
  const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('failed to delete source')
}

export function useDeleteSource(pageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', pageId] })
    },
  })
}
