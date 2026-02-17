import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Declare Pusher on window for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

interface WebSocketContextType {
  echo: Echo<any> | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [echo, setEcho] = useState<Echo<any> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    const echoInstance = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    setEcho(echoInstance);
    setIsConnected(true);

    return () => {
      echoInstance.disconnect();
      setIsConnected(false);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ echo, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
