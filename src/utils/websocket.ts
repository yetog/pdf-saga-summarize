
import { toast } from "sonner";
import { API, APP_CONFIG } from "@/config";

type MessageHandler = (data: any) => void;
type ConnectionChangeHandler = (isConnected: boolean) => void;

export interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionChangeHandler> = new Set();
  private isConnected = false;

  constructor() {
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
   * Subscribe to a specific message type
   */
  public subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)?.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
      if (this.messageHandlers.get(type)?.size === 0) {
        this.messageHandlers.delete(type);
      }
    };
  }

  /**
   * Subscribe to connection state changes
   */
  public subscribeToConnection(handler: ConnectionChangeHandler): () => void {
    this.connectionHandlers.add(handler);
    
    // Immediately notify with current state
    handler(this.isConnected);
    
    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Check if the WebSocket is connected
   */
  public isSocketConnected(): boolean {
    return this.isConnected;
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

  /**
   * Notify all connection handlers of a state change
   */
  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService();

// Fallback mock WebSocket implementation when the backend is not available
export class MockWebSocketService {
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionChangeHandler> = new Set();
  
  public connect(): void {
    // Simulate successful connection after a delay
    setTimeout(() => {
      this.notifyConnectionHandlers(true);
    }, 500);
  }
  
  public disconnect(): void {
    this.notifyConnectionHandlers(false);
  }
  
  public send(type: string, payload: any): boolean {
    console.log('Mock WebSocket send:', { type, payload });
    
    // Simulate processing and response for summarization requests
    if (type === 'request_summary') {
      setTimeout(() => {
        this.handleMockSummaryResponse(payload.id);
      }, 3000);
    }
    
    return true;
  }
  
  public subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)?.add(handler);
    
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
      if (this.messageHandlers.get(type)?.size === 0) {
        this.messageHandlers.delete(type);
      }
    };
  }
  
  public subscribeToConnection(handler: ConnectionChangeHandler): () => void {
    this.connectionHandlers.add(handler);
    
    // Immediately notify with current state (always connected in mock mode)
    handler(true);
    
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }
  
  public isSocketConnected(): boolean {
    return true;
  }
  
  private handleMockSummaryResponse(fileId: string): void {
    // Generate a mock summary response
    const mockSummary = `This document provides a comprehensive analysis of modern user interface design principles, with a particular focus on minimalist approaches. The author argues that successful UI design balances aesthetic considerations with functional requirements.

Key points identified include:

1. The importance of whitespace in creating visual hierarchy and improving readability.
2. How typography choices significantly impact user perception and information retention.
3. The role of consistent visual language in building intuitive navigation systems.
4. Why color psychology should inform palette selection for different application types.

The research demonstrates that users complete tasks 20% faster when interacting with interfaces that follow these minimalist principles. Additionally, user satisfaction scores were 35% higher for applications that prioritized simplicity and clarity in their design.

The document concludes with practical recommendations for implementing these findings, suggesting that designers should start with essential functionality and carefully evaluate each additional element before inclusion.`;
    
    // Notify handlers of the mock summary response
    if (this.messageHandlers.has('summary_ready')) {
      this.messageHandlers.get('summary_ready')?.forEach(handler => {
        handler({
          fileId,
          summary: mockSummary,
          status: 'completed'
        });
      });
    }
  }
  
  private notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in mock connection handler:', error);
      }
    });
  }
}

// Export a singleton mock instance
export const mockWebSocketService = new MockWebSocketService();

// Export a factory function to get the appropriate WebSocket service
export const getWebSocketService = () => {
  return API.useMockApi ? mockWebSocketService : websocketService;
};
