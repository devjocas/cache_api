// WEBSOCKET API 
// -EVENTO open
// Using onevent property
socket.onopen = function (event) {
  console.log('Connected to server');
  console.log('Protocol:', socket.protocol);
  console.log('Extensions:', socket.extensions);

  // Connection is ready, safe to send
  socket.send('Hello, server!');
};

// Using addEventListener (allows multiple handlers)
socket.addEventListener('open', function (event) {
  console.log('WebSocket ready state:', socket.readyState); // Will be 1 (OPEN)
});

// Evento message

socket.onmessage = function (event) {
  // Check data type
  if (typeof event.data === 'string') {
    // Text message
    console.log('Text message:', event.data);

    // Parse JSON if expected
    try {
      const json = JSON.parse(event.data);
      processMessage(json);
    } catch (e) {
      processText(event.data);
    }
  } else if (event.data instanceof ArrayBuffer) {
    // Binary message (when binaryType = 'arraybuffer')
    const view = new DataView(event.data);
    console.log('Binary message, first byte:', view.getUint8(0));
  } else if (event.data instanceof Blob) {
    // Binary message (when binaryType = 'blob')
    event.data.arrayBuffer().then((buffer) => {
      processArrayBuffer(buffer);
    });
  }
};

// Evento error

socket.onerror = function (event) {
  console.error('WebSocket error observed');
  // The error event doesn't contain details about what went wrong
  // Check readyState and wait for close event for more information
};

// Errors typically result in connection closure
socket.addEventListener('error', function (event) {
  console.log('Connection will close due to error');
});

//Evento close
socket.onclose = function (event) {
  console.log('Connection closed');
  console.log('Code:', event.code);
  console.log('Reason:', event.reason);
  console.log('Was clean?', event.wasClean);

  // Handle different close scenarios
  if (event.code === 1000) {
    console.log('Normal closure');
  } else if (event.code === 1006) {
    console.log('Abnormal closure, no close frame');
  } else if (event.code >= 4000 && event.code <= 4999) {
    console.log('Application-specific close code:', event.code);
  }

  // Implement reconnection logic if needed
  if (!event.wasClean) {
    setTimeout(() => reconnect(), 5000);
  }
};

//Padrões de Uso Prático -Estratégia de Reconexão

class ReconnectingWebSocket {
  constructor(url, protocols = []) {
    this.url = url;
    this.protocols = protocols;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = null; // Infinite
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = (event) => {
      console.log('Connected');
      this.reconnectDelay = 1000; // Reset delay on successful connection
      this.reconnectAttempts = 0;
      this.onopen?.(event);
    };

    this.ws.onmessage = (event) => {
      this.onmessage?.(event);
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error');
      this.onerror?.(event);
    };

    this.ws.onclose = (event) => {
      console.log(`Connection closed: ${event.code} - ${event.reason}`);
      this.onclose?.(event);

      // Attempt reconnection for abnormal closures
      if (!event.wasClean && this.shouldReconnect()) {
        setTimeout(() => {
          console.log(
            `Reconnecting... (attempt ${this.reconnectAttempts + 1})`
          );
          this.reconnectAttempts++;
          this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.maxReconnectDelay
          );
          this.connect();
        }, this.reconnectDelay);
      }
    };
  }

  shouldReconnect() {
    return (
      this.maxReconnectAttempts === null ||
      this.reconnectAttempts < this.maxReconnectAttempts
    );
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn('WebSocket not open. Current state:', this.ws.readyState);
    }
  }

  close(code = 1000, reason = '') {
    this.maxReconnectAttempts = 0; // Prevent reconnection
    this.ws.close(code, reason);
  }
}

// Usage
const socket = new ReconnectingWebSocket('wss://echo.websocket.org');
socket.onmessage = (event) => console.log('Received:', event.data);

//Padrão de Batimentos Cardíacos/Pingue-Pongue-Mantenha as conexões vivas e detecte conexões obsoletas

class HeartbeatWebSocket {
  constructor(url) {
    this.url = url;
    this.pingInterval = 30000; // 30 seconds
    this.pongTimeout = 10000; // 10 seconds to respond
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected, starting heartbeat');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      // Reset heartbeat on any message
      this.startHeartbeat();

      // Check for pong response
      if (event.data === 'pong') {
        console.log('Received pong');
        return;
      }

      // Handle regular messages
      this.onmessage?.(event);
    };

    this.ws.onclose = () => {
      console.log('Connection closed');
      this.stopHeartbeat();
    };
  }

  startHeartbeat() {
    this.stopHeartbeat();

    this.pingTimer = setTimeout(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        console.log('Sending ping');
        this.ws.send('ping');

        // Expect pong within timeout
        this.pongTimer = setTimeout(() => {
          console.warn('Pong timeout, closing connection');
          this.ws.close(4000, 'Ping timeout');
        }, this.pongTimeout);
      }
    }, this.pingInterval);
  }

  stopHeartbeat() {
    clearTimeout(this.pingTimer);
    clearTimeout(this.pongTimer);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      this.startHeartbeat(); // Reset heartbeat on send
    }
  }

  close() {
    this.stopHeartbeat();
    this.ws.close();
  }
}

//Melhores Práticas de Manejo de Erroa
class RobustWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
      messageQueueSize: 100,
      ...options,
    };

    this.messageQueue = [];
    this.isReconnecting = false;
    this.connectionAttempts = 0;

    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = (event) => {
      console.log('Connection established');
      this.connectionAttempts = 0;
      this.isReconnecting = false;

      // Flush queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.send(message);
      }

      this.onopen?.(event);
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        // Attempt to parse JSON messages
        if (
          typeof event.data === 'string' &&
          (event.data.startsWith('{') || event.data.startsWith('['))
        ) {
          const parsed = JSON.parse(event.data);
          this.onmessage?.({ ...event, parsedData: parsed });
        } else {
          this.onmessage?.(event);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        this.onerror?.({ type: 'message_processing', error, data: event.data });
      }
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error occurred');
      this.onerror?.(event);
    };

    this.ws.onclose = (event) => {
      console.log(`Connection closed: ${event.code} - ${event.reason}`);
      this.stopHeartbeat();

      // Determine if we should reconnect
      if (this.shouldReconnect(event)) {
        this.scheduleReconnect();
      } else {
        this.onclose?.(event);
      }
    };
  }

  shouldReconnect(closeEvent) {
    // Don't reconnect for normal closure
    if (closeEvent.code === 1000) return false;

    // Don't reconnect if max attempts reached
    if (this.connectionAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return false;
    }

    // Don't reconnect for certain error codes
    const noReconnectCodes = [
      1002, 1003, 1005, 1006, 1007, 1008, 1009, 1010, 1011,
    ];
    if (noReconnectCodes.includes(closeEvent.code)) {
      console.error(`Not reconnecting due to close code: ${closeEvent.code}`);
      return false;
    }

    return true;
  }

  scheduleReconnect() {
    if (this.isReconnecting) return;

    this.isReconnecting = true;
    this.connectionAttempts++;

    const delay =
      this.options.reconnectInterval * Math.pow(2, this.connectionAttempts - 1);
    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.connectionAttempts})`
    );

    setTimeout(() => {
      this.isReconnecting = false;
      this.connect();
    }, delay);
  }

  send(data) {
    // Convert objects to JSON
    const message = typeof data === 'object' ? JSON.stringify(data) : data;

    if (this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(message);
        return true;
      } catch (error) {
        console.error('Send failed:', error);
        this.queueMessage(message);
        return false;
      }
    } else {
      // Queue message if not connected
      this.queueMessage(message);
      return false;
    }
  }

  queueMessage(message) {
    if (this.messageQueue.length >= this.options.messageQueueSize) {
      console.warn('Message queue full, dropping oldest message');
      this.messageQueue.shift();
    }
    this.messageQueue.push(message);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }

  close(code = 1000, reason = 'Normal closure') {
    this.stopHeartbeat();
    this.messageQueue = [];
    this.options.maxReconnectAttempts = 0; // Prevent reconnection
    this.ws.close(code, reason);
  }

  getState() {
    return {
      readyState: this.ws?.readyState,
      isReconnecting: this.isReconnecting,
      queuedMessages: this.messageQueue.length,
      connectionAttempts: this.connectionAttempts,
    };
  }
}

// Usage
const socket = new RobustWebSocket('wss://echo.websocket.org', {
  maxReconnectAttempts: 10,
  reconnectInterval: 2000,
  heartbeatInterval: 45000,
});

socket.onmessage = (event) => {
  if (event.parsedData) {
    console.log('Received JSON:', event.parsedData);
  } else {
    console.log('Received:', event.data);
  }
};

socket.onerror = (error) => {
  console.error('Socket error:', error);
};

//Casos de Uso Comuns--aplicativos de chats

class ChatWebSocket {
  constructor(url, username) {
    this.username = username;
    this.ws = new WebSocket(url);
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.onopen = () => {
      this.send({
        type: 'join',
        username: this.username,
        timestamp: Date.now(),
      });
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'chat':
        this.onChatMessage?.(message);
        break;
      case 'user_joined':
        this.onUserJoined?.(message);
        break;
      case 'user_left':
        this.onUserLeft?.(message);
        break;
      case 'typing':
        this.onTyping?.(message);
        break;
    }
  }

  sendChat(text) {
    this.send({
      type: 'chat',
      text,
      username: this.username,
      timestamp: Date.now(),
    });
  }

  sendTyping() {
    this.send({
      type: 'typing',
      username: this.username,
    });
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

//Jogos e Colaboração em Tempo Real
class GameWebSocket {
  constructor(url, playerId) {
    this.playerId = playerId;
    this.ws = new WebSocket(url);
    this.latency = 0;
    this.setupHandlers();
  }

  setupHandlers() {
    this.ws.onopen = () => {
      // Join game
      this.send({
        type: 'join',
        playerId: this.playerId,
      });

      // Start latency monitoring
      this.measureLatency();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle ping response for latency measurement
      if (message.type === 'pong') {
        this.latency = Date.now() - message.timestamp;
        return;
      }

      // Handle game events
      this.handleGameEvent(message);
    };
  }

  handleGameEvent(event) {
    switch (event.type) {
      case 'player_move':
        this.onPlayerMove?.(event);
        break;
      case 'game_state':
        this.onGameState?.(event);
        break;
      case 'player_action':
        this.onPlayerAction?.(event);
        break;
    }
  }

  sendMove(x, y) {
    this.send({
      type: 'move',
      playerId: this.playerId,
      x,
      y,
      timestamp: Date.now(),
    });
  }

  sendAction(action, data) {
    this.send({
      type: 'action',
      playerId: this.playerId,
      action,
      data,
      timestamp: Date.now(),
    });
  }

  measureLatency() {
    setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          timestamp: Date.now(),
        });
      }
    }, 5000);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  getLatency() {
    return this.latency;
  }
}

//Gerenciamento de Buffers
class BufferedWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.maxBufferSize = options.maxBufferSize || 1024 * 1024; // 1MB default
    this.flushInterval = options.flushInterval || 100; // 100ms default
    this.buffer = [];
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => this.startFlushing();
    this.ws.onclose = () => this.stopFlushing();
  }

  send(data) {
    // Check WebSocket buffer
    if (this.ws.bufferedAmount > this.maxBufferSize) {
      console.warn('WebSocket buffer full, dropping message');
      return false;
    }

    // Add to internal buffer
    this.buffer.push(data);

    // Flush immediately if buffer is large
    if (JSON.stringify(this.buffer).length > this.maxBufferSize / 2) {
      this.flush();
    }

    return true;
  }

  flush() {
    if (this.buffer.length === 0) return;
    if (this.ws.readyState !== WebSocket.OPEN) return;

    // Send batched message
    this.ws.send(
      JSON.stringify({
        type: 'batch',
        messages: this.buffer,
        timestamp: Date.now(),
      })
    );

    this.buffer = [];
  }

  startFlushing() {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  stopFlushing() {
    clearInterval(this.flushTimer);
  }
}
//Agrupamento de Conexões
class WebSocketPool {
  constructor(url, poolSize = 3) {
    this.url = url;
    this.poolSize = poolSize;
    this.connections = [];
    this.currentIndex = 0;

    this.initialize();
  }

  initialize() {
    for (let i = 0; i < this.poolSize; i++) {
      const ws = new WebSocket(this.url);
      ws.onopen = () => console.log(`Pool connection ${i} ready`);
      this.connections.push(ws);
    }
  }

  getConnection() {
    // Round-robin selection
    const connection = this.connections[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
    return connection;
  }

  send(data) {
    const ws = this.getConnection();
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      return true;
    }
    return false;
  }

  broadcast(data) {
    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  close() {
    this.connections.forEach((ws) => ws.close());
  }
}

//