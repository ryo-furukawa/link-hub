import { useMutation, useQueryClient } from '@tanstack/react-query'

async function attachTag(input: { pageId: string; tagId: string }): Promise<void> {
  const res = await fetch(`/api/pages/${input.pageId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag_id: input.tagId }),
  })
  if (!res.ok) throw new Error('failed to attach tag')
}

export function useAttachTag(pageId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: attachTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-tags', pageId] })
    },
  })
}
