
/**
 * Base WebSocket service implementation
 */
import { MessageHandler, ConnectionChangeHandler, WebSocketServiceInterface } from './types';

export abstract class BaseWebSocketService implements WebSocketServiceInterface {
  protected messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  protected connectionHandlers: Set<ConnectionChangeHandler> = new Set();
  protected isConnected = false;

  public abstract connect(): void;
  public abstract disconnect(): void;
  public abstract send(type: string, payload: any): boolean;
  
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
   * Notify all connection handlers of a state change
   */
  protected notifyConnectionHandlers(isConnected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }
}
