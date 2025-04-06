
/**
 * WebSocket service types
 */

export type MessageHandler = (data: any) => void;
export type ConnectionChangeHandler = (isConnected: boolean) => void;

export interface WebSocketMessage {
  type: string;
  payload: any;
}

export interface QueuedMessage extends WebSocketMessage {
  id: string;
  timestamp: number;
  attempts: number;
}

export interface WebSocketServiceInterface {
  connect(): void;
  disconnect(): void;
  send(type: string, payload: any): boolean;
  subscribe(type: string, handler: MessageHandler): () => void;
  subscribeToConnection(handler: ConnectionChangeHandler): () => void;
  isSocketConnected(): boolean;
}

// Extended interface that includes mockConnect for the mock service
export interface MockWebSocketServiceInterface extends WebSocketServiceInterface {
  mockConnect(): void;
}
