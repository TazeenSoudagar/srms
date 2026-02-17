import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { cn } from '../../utils/cn';

export const NotificationToast: React.FC = () => {
  const { notifications, markAsRead, clearNotification } = useNotifications();

  // Auto-mark as read after 3 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        setTimeout(() => {
          markAsRead(notification.id);
        }, 3000);
      }
    });
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule_created':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'schedule_updated':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'schedule_cancelled':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'schedule_completed':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'schedule_created':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'schedule_updated':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'schedule_cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'schedule_completed':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.slice(0, 3).map((notification, index) => (
        <div
          key={notification.id}
          className={cn(
            'transform transition-all duration-300 ease-out',
            'animate-in slide-in-from-top-2 fade-in',
            notification.read && 'opacity-70'
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={cn(
              'rounded-lg border-2 shadow-lg p-4 backdrop-blur-sm',
              getColors(notification.type)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-1">{notification.title}</p>
                <p className="text-sm opacity-90">{notification.message}</p>
              </div>
              <button
                onClick={() => clearNotification(notification.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
