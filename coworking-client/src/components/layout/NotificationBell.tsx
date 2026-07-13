import { useEffect, useRef, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import type { Notification } from '../../types'
import {
  getNotifications, getUnreadCount,
  markRead, markAllRead, deleteNotification
} from '../../api/notifications'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { cn } from '../../lib/utils'

const typeDot = {
  info:    'bg-blue-400',
  success: 'bg-green-400',
  warning: 'bg-amber-400',
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread,        setUnread]        = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load unread count
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getUnreadCount()
        setUnread(data.count)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleOpen = async () => {
    setOpen(!open)
    if (!open) {
      try {
        const { data } = await getNotifications()
        setNotifications(data)
      } catch {}
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await markRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnread(0)
    } catch {}
  }

  const handleDelete = async (id: number, wasUnread: boolean) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell size={18}/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4
            bg-red-500 text-white text-[10px] font-bold rounded-full
            flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-gray-900 border
          border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">

          {/* Title */}
          <div className="flex items-center justify-between px-4 py-3
            border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Сповіщення
              {unread > 0 && (
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  ({unread} непрочитаних)
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                  flex items-center gap-1 transition-colors"
              >
                <Check size={11}/> Всі прочитані
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                <Bell size={24} className="mx-auto mb-2 opacity-30 dark:opacity-20"/>
                <p className="text-sm text-gray-400 dark:text-gray-500">Немає сповіщень</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800',
                    'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group',
                    !n.isRead && 'bg-blue-50/40 dark:bg-blue-900/10'
                  )}
                >
                  {/* Type point */}
                  <div className="pt-1.5 shrink-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      n.isRead ? 'bg-gray-200 dark:bg-gray-700' : typeDot[n.type]
                    )}/>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                  >
                    <p className={cn(
                      'text-xs leading-snug',
                      n.isRead
                        ? 'text-gray-500 dark:text-gray-500'
                        : 'text-gray-900 dark:text-gray-100 font-medium'
                    )}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                      {format(new Date(n.createdAt), 'dd MMM, HH:mm', { locale: uk })}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleDelete(n.id, !n.isRead)}
                    className="shrink-0 p-1 rounded text-gray-300 dark:text-gray-600
                      hover:text-red-400 dark:hover:text-red-400 opacity-0 group-hover:opacity-100
                      transition-all"
                  >
                    <X size={12}/>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}