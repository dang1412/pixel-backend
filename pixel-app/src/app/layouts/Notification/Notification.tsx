import React from 'react'

import { useNotification } from '@/components/hooks/useNotification'
import { NotificationType } from '@/libs/states'

const typeToColorMap: Map<NotificationType, string> = new Map([
  [NotificationType.Error, 'red'],
  [NotificationType.Success, 'green'],
  [NotificationType.Info, 'blue'],
])

function getClassName(type: NotificationType): string {
  const color = typeToColorMap.get(type) || 'indigo'

  return `w-96 max-w-full mb-4 rounded-lg bg-${color}-100 px-6 py-5 text-base text-${color}-800`
}

interface Props {}

export const Notification: React.FC<Props> = (props) => {
  const { notifications } = useNotification()

  return (
    <div className="fixed bottom-4 right-4">
      {notifications.map(n => (
        <div
          key={n.key}
          className={getClassName(n.type)}
          role="alert">
          {n.content}
        </div>
      ))}
      {/* <div
        className="w-96 max-w-full mb-4 rounded-lg bg-red-100 px-6 py-5 text-base text-red-800"
        role="alert">
        Test
      </div> */}
      {/* <div
        className="w-96 max-w-full mb-4 rounded-lg bg-blue-100 px-6 py-5 text-base text-blue-800"
        role="alert">
        Test
      </div> */}
      {/* <div
        className="w-96 max-w-full mb-4 rounded-lg bg-green-100 px-6 py-5 text-base text-green-800"
        role="alert">
        Test
      </div> */}
    </div>
  )
}
