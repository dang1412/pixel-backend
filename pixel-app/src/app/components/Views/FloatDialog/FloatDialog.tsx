import React, { PropsWithChildren } from 'react'

import './FloatDialog.css'

interface Props {
  top: number
  left: number
  hidden?: boolean
}

export const FloatDialog: React.FC<PropsWithChildren<Props>> = ({ top, left, hidden = false, children }) => {
  return (
    <span className='float-dialog select-none' style={{ top, left }} hidden={hidden}>{children}</span>
  )
}
