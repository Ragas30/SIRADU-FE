import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export function useUpdate<T>(resource: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: T) => {
      const response = await api.put(`/${resource}/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
      queryClient.invalidateQueries({ queryKey: [resource, id] })
    },
  })
}
