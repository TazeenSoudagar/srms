import React, { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'schedule_created' | 'schedule_updated' | 'schedule_cancelled' | 'schedule_completed';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { echo, isConnected } = useWebSocket();
  const { user } = useAuth();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (!echo || !isConnected || !user) {
      return;
    }

    // Listen to private user channel
    const userChannel = echo.private(`user.${user.id}`);

    userChannel
      .listen('.schedule.created', (event: any) => {
        addNotification({
          type: 'schedule_created',
          title: 'New Schedule Created',
          message: event.message,
          data: event.schedule,
        });
      })
      .listen('.schedule.updated', (event: any) => {
        addNotification({
          type: 'schedule_updated',
          title: 'Schedule Updated',
          message: event.message,
          data: event.schedule,
        });
      });

    // Listen to public schedules channel
    const schedulesChannel = echo.channel('schedules');

    schedulesChannel
      .listen('.schedule.created', (event: any) => {
        // Only show notification if it's not for the current user
        if (event.schedule.customer_id !== user.id && event.schedule.engineer_id !== user.id) {
          addNotification({
            type: 'schedule_created',
            title: 'New Schedule',
            message: event.message,
            data: event.schedule,
          });
        }
      })
      .listen('.schedule.updated', (event: any) => {
        // Only show notification if it's not for the current user
        if (event.schedule.customer_id !== user.id && event.schedule.engineer_id !== user.id) {
          addNotification({
            type: 'schedule_updated',
            title: 'Schedule Update',
            message: event.message,
            data: event.schedule,
          });
        }
      });

    return () => {
      echo.leave(`user.${user.id}`);
      echo.leave('schedules');
    };
  }, [echo, isConnected, user, addNotification]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
