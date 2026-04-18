import { useMutation, useQueryClient } from '@tanstack/react-query'

async function detachTag(input: { pageId: string; tagId: string }): Promise<void> {
  const res = await fetch(`/api/pages/${input.pageId}/tags/${input.tagId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('failed to detach tag')
}

export function useDetachTag(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: detachTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-tags', pageId] })
    },
  })
}
