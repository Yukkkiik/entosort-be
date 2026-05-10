const { WebSocketServer } = require('ws');

let wss = null;

/**
 * Initialize WebSocket server on a separate port
 * Dashboard connects here for real-time updates
 */
const initWebSocket = (port) => {
  wss = new WebSocketServer({ port: Number(port) });

  wss.on('listening', () => {
    console.log(`🔌 WebSocket server running on port ${port}`);
  });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`🟢 WebSocket client connected: ${ip}`);

    ws.send(JSON.stringify({ type: 'connected', message: 'BSF WebSocket server ready' }));

    ws.on('close', () => {
      console.log(`🔴 WebSocket client disconnected: ${ip}`);
    });

    ws.on('error', (err) => {
      console.error('❌ WebSocket client error:', err.message);
    });
  });

  wss.on('error', (err) => {
    console.error('❌ WebSocket server error:', err.message);
  });
};

/**
 * Broadcast a message to all connected WebSocket clients
 */
const broadcast = (data) => {
  if (!wss) return;

  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN === 1
      client.send(message);
    }
  });
};

/**
 * Send to specific client (future use)
 */
const sendToClient = (ws, data) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
};

module.exports = { initWebSocket, broadcast, sendToClient };
