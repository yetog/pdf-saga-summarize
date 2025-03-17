
/**
 * WebSocket service exports
 */
import { API } from "@/config";
import { WebSocketServiceInterface } from './types';
import { websocketService } from './real-service';
import { mockWebSocketService } from './mock-service';

// Re-export types for external use
export * from './types';

/**
 * Factory function to get the appropriate WebSocket service
 */
export const getWebSocketService = (): WebSocketServiceInterface => {
  return API.useMockApi ? mockWebSocketService : websocketService;
};

// Re-export the individual instances for direct use if needed
export { websocketService, mockWebSocketService };
