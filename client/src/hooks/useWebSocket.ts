import { useEffect, useState, useCallback } from 'react';
import { webSocketClient } from '@/lib/websocket';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await webSocketClient.connect();
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnectionError(error instanceof Error ? error.message : 'Connection failed');
        setIsConnected(false);
      }
    };

    // Connect on mount
    connectWebSocket();

    // Check connection status periodically
    const interval = setInterval(() => {
      const connected = webSocketClient.isConnected();
      if (connected !== isConnected) {
        setIsConnected(connected);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      webSocketClient.disconnect();
    };
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (webSocketClient.isConnected()) {
      webSocketClient.send(data);
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    connectionError,
    sendMessage
  };
}