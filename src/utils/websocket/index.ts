
/**
 * WebSocket service exports
 */
import { API } from "@/config";
import { WebSocketServiceInterface, MockWebSocketServiceInterface } from './types';
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

// Get mock service with full interface including mockConnect
export const getMockWebSocketService = (): MockWebSocketServiceInterface => {
  return mockWebSocketService as MockWebSocketServiceInterface;
};

// Re-export the individual instances for direct use if needed
export { websocketService, mockWebSocketService };
