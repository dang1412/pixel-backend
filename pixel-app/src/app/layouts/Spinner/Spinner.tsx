import React from 'react'

import { useLoading } from '@/components/hooks'

interface Props {}

export const Spinner: React.FC<Props> = (props) => {
  const { loading } = useLoading()

  return (
    <div className='w-full flex items-center justify-center'>
      {loading > 0 && <div
        className="fixed z-50 top-12 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
          >Loading...</span>
      </div>}
    </div>
  )
}
