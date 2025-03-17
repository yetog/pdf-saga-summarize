
/**
 * Base WebSocket service implementation
 */
import { MessageHandler, ConnectionChangeHandler, WebSocketServiceInterface, QueuedMessage } from './types';

export abstract class BaseWebSocketService implements WebSocketServiceInterface {
  protected messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  protected connectionHandlers: Set<ConnectionChangeHandler> = new Set();
  protected isConnected = false;
  protected messageQueue: QueuedMessage[] = [];
  protected readonly QUEUE_STORAGE_KEY = 'websocket_message_queue';
  protected readonly MAX_RETRY_ATTEMPTS = 5;

  constructor() {
    this.loadQueueFromStorage();
  }

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
    const previousState = this.isConnected;
    this.isConnected = isConnected;

    // If connection was restored, attempt to process the queue
    if (!previousState && isConnected) {
      this.processQueue();
    }

    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  /**
   * Add a message to the queue
   */
  protected queueMessage(type: string, payload: any): string {
    const id = this.generateMessageId();
    const queuedMessage: QueuedMessage = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      attempts: 0
    };

    this.messageQueue.push(queuedMessage);
    this.saveQueueToStorage();
    
    return id;
  }

  /**
   * Process the message queue when connection is restored
   */
  protected processQueue(): void {
    if (!this.isConnected || this.messageQueue.length === 0) {
      return;
    }

    console.log(`Processing WebSocket message queue (${this.messageQueue.length} items)`);
    
    // Create a copy of the queue to iterate through
    const currentQueue = [...this.messageQueue];
    this.messageQueue = [];
    
    currentQueue.forEach(message => {
      if (message.attempts >= this.MAX_RETRY_ATTEMPTS) {
        console.warn(`Message ${message.id} exceeded max retry attempts, dropping`);
        return;
      }
      
      message.attempts++;
      const success = this.send(message.type, message.payload);
      
      if (!success) {
        this.messageQueue.push(message);
      }
    });
    
    this.saveQueueToStorage();
  }

  /**
   * Generate a unique ID for queued messages
   */
  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Save the message queue to local storage
   */
  protected saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Error saving WebSocket queue to storage:', error);
    }
  }

  /**
   * Load the message queue from local storage
   */
  protected loadQueueFromStorage(): void {
    try {
      const storedQueue = localStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.messageQueue = JSON.parse(storedQueue);
        console.log(`Loaded ${this.messageQueue.length} queued WebSocket messages from storage`);
      }
    } catch (error) {
      console.error('Error loading WebSocket queue from storage:', error);
      this.messageQueue = [];
    }
  }

  /**
   * Clear the message queue
   */
  protected clearQueue(): void {
    this.messageQueue = [];
    this.saveQueueToStorage();
  }
}

