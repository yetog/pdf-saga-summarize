
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  public send(type: string, payload: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const message: WebSocketMessage = { type, payload };
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
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
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
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
    this.scheduleReconnect();
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= APP_CONFIG.wsMaxReconnectAttempts) {
      console.log('Max reconnect attempts reached, giving up');
      toast.error('Failed to connect to real-time updates. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${APP_CONFIG.wsReconnectInterval}ms`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${APP_CONFIG.wsMaxReconnectAttempts})`);
      this.connect();
    }, APP_CONFIG.wsReconnectInterval);
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();
