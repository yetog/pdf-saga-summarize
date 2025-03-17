
/**
 * Real WebSocket service implementation for connecting to actual backend
 */
import { toast } from "sonner";
import { API, APP_CONFIG } from "@/config";
import { WebSocketMessage } from './types';
import { BaseWebSocketService } from './base-service';

export class WebSocketService extends BaseWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private reconnectInterval: number = APP_CONFIG.wsReconnectInterval;
  private maxReconnectAttempts: number = APP_CONFIG.wsMaxReconnectAttempts;
  private heartbeatInterval: number | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  constructor() {
    super();
    this.connect();
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = new WebSocket(API.wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.isConnected = false;
    this.notifyConnectionHandlers(false);
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(type: string, payload: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected, queueing message', { type, payload });
      this.queueMessage(type, payload);
      return false;
    }

    try {
      const message: WebSocketMessage = { type, payload };
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.queueMessage(type, payload);
      return false;
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyConnectionHandlers(true);
    this.startHeartbeat();
    this.processQueue();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Respond to heartbeat pings
      if (message.type === 'ping') {
        this.send('pong', { timestamp: Date.now() });
        return;
      }
      
      // Call all handlers for this message type
      if (this.messageHandlers.has(message.type)) {
        this.messageHandlers.get(message.type)?.forEach(handler => {
          try {
            handler(message.payload);
          } catch (error) {
            console.error(`Error in message handler for type ${message.type}:`, error);
          }
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.isConnected = false;
    this.notifyConnectionHandlers(false);
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.isConnected = false;
    this.notifyConnectionHandlers(false);
    this.stopHeartbeat();
    this.scheduleReconnect();
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, giving up');
      toast.error('Failed to connect to real-time updates. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    
    // Calculate backoff time with jitter to prevent thundering herd
    const backoffTime = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );
    const jitter = Math.random() * 0.3 * backoffTime;
    const reconnectTime = backoffTime + jitter;
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${Math.round(reconnectTime)}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, reconnectTime);
  }

  /**
   * Start sending heartbeat messages to keep the connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop the heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();

