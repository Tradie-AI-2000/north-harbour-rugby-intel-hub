import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, XCircle, Send, Activity } from 'lucide-react';

export default function WebSocketTest() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{id: number, type: string, content: string, timestamp: string}>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Use dynamic URL construction to avoid hardcoded IP addresses
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log('Connecting to WebSocket at:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        addMessage('system', 'Connected to WebSocket server', 'success');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          addMessage('received', JSON.stringify(data, null, 2), 'info');
        } catch (error) {
          console.error('Error parsing message:', error);
          addMessage('received', event.data, 'info');
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        addMessage('system', `Connection closed: ${event.code} ${event.reason}`, 'warning');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
        addMessage('system', 'Connection error occurred', 'error');
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      addMessage('system', 'Failed to create WebSocket connection', 'error');
    }
  };

  const addMessage = (type: string, content: string, level: string) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
      level
    };
    setMessages(prev => [...prev.slice(-19), newMessage]); // Keep last 20 messages
    setMessageCount(prev => prev + 1);
  };

  const sendMessage = () => {
    if (socket && isConnected && messageInput.trim()) {
      const message = {
        type: 'test',
        content: messageInput,
        timestamp: new Date().toISOString()
      };
      
      socket.send(JSON.stringify(message));
      addMessage('sent', messageInput, 'info');
      setMessageInput('');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    } else if (connectionError) {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Error: {connectionError}</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800"><Activity className="w-3 h-3 mr-1" />Connecting...</Badge>;
    }
  };

  const getMessageIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warning': return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default: return <Activity className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WebSocket Connection Test</span>
            {getConnectionStatus()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={connectWebSocket} 
                disabled={isConnected}
                className="flex-1"
              >
                {isConnected ? 'Connected' : 'Connect'}
              </Button>
              <Button 
                onClick={disconnect} 
                disabled={!isConnected}
                variant="outline"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>WebSocket URL:</strong> {window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//{window.location.host}/ws</p>
              <p><strong>Messages:</strong> {messageCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Enter message to send..."
              disabled={!isConnected}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!isConnected || !messageInput.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded text-sm">
                  {getMessageIcon(msg.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <span className="font-medium">{msg.type}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-xs font-mono">{msg.content}</pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}