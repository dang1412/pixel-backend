import { useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { loadingState } from '@/libs/states'

interface UseLoadingHook {
  loading: number
  updateLoading: (d: number) => void
}

export function useLoading(): UseLoadingHook {
  const [loading, setLoading] = useRecoilState(loadingState)

  const updateLoading = useCallback((d: number) => {
    setLoading(l => l + d)
  }, [])

  return { loading, updateLoading }
}
