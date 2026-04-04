import { useQuery } from '@tanstack/react-query'
import { client } from '@/core/api-client'

interface UseAPIRequestProps {
  url: string
  params?: Record<string, unknown>
}

export function useAPIRequest<T>({ url, params }: UseAPIRequestProps) {
  const { data, isLoading, isError, error, refetch } = useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => {
      const response = await client.get(url, { params })
      return response.data
    },
    retryDelay: 5 * 1000,
    staleTime: 60 * 5 * 1000,
  })

  return {
    actions: {
      refetch,
    },
    state: {
      data,
      isLoading,
      isError,
      error,
    },
  }
}
