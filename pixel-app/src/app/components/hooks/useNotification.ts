import { useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { INotification, NotificationType, notificationState } from '@/libs/states'

interface UseNotificationHook {
  notifications: INotification[]
  notify: (type: NotificationType, key: string, content: string, timeout?: number) => void
}

function remove(notifications: INotification[], key: string): INotification[] {
  const ind = notifications.findIndex(n => n.key === key)
  notifications.splice(ind, 1)

  return notifications
}

export function useNotification(): UseNotificationHook {
  const [notifications, setNotifications] = useRecoilState(notificationState)

  const notify = useCallback((type: NotificationType, key: string, content: string, timeout = 5000) => {
    setNotifications(notifications => [...notifications, { type, key, content }])
    setTimeout(() => {
      setNotifications(notifications => remove([...notifications], key))
    }, timeout)
  }, [])

  return { notifications, notify }
}
