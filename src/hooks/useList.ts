import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import type { PaginatedResponse } from "@/types"

interface UseListOptions {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export function useList<T>(resource: string, options: UseListOptions = {}) {
  return useQuery({
    queryKey: [resource, options],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options.page) params.append("page", String(options.page))
      if (options.pageSize) params.append("pageSize", String(options.pageSize))
      if (options.search) params.append("search", options.search)
      if (options.sortBy) params.append("sortBy", options.sortBy)
      if (options.sortOrder) params.append("sortOrder", options.sortOrder)

      const response = await api.get<PaginatedResponse<T>>(`/${resource}?${params}`)
      return response.data
    },
  })
}
