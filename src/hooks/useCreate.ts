import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export function useCreate<T>(resource: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: T) => {
      const response = await api.post(`/${resource}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resource] })
    },
  })
}
