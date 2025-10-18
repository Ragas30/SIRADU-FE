import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export function useDelete(resource: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/${resource}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}
