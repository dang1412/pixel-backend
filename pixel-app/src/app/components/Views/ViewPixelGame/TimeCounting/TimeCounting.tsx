import React, { useEffect, useState } from 'react'

interface Props {
  interval: number
  onTimeEnd: () => void
}

export const TimeCounting: React.FC<Props> = (props) => {
  const { interval, onTimeEnd } = props
  const [time, setTime] = useState(interval)

  // init interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(cur => cur > 0 ? cur - 1 : interval)
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [interval])

  // onTimeEnd
  useEffect(() => {
    if (time === 0) {
      onTimeEnd()
    }
  }, [time, onTimeEnd])

  return (
    <span style={{width: 30, display: 'inline-block', textAlign: 'center'}}>
      {time}
    </span>
  )
}
