import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"

export function useDetail<T>(resource: string, id: string | undefined) {
  return useQuery({
    queryKey: [resource, id],
    queryFn: async () => {
      const response = await api.get<T>(`/${resource}/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}
