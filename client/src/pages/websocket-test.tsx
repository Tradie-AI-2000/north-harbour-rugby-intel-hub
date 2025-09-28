import WebSocketTest from '@/components/websocket-test';

export default function WebSocketTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WebSocket Connection Test</h1>
          <p className="text-gray-600">
            Test the WebSocket connection to verify it's connecting to the Replit server instead of the database IP address.
          </p>
        </div>
        
        <WebSocketTest />
      </div>
    </div>
  );
}