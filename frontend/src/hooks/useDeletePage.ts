import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('failed to delete page')
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
    },
  })
}
