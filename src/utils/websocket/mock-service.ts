
/**
 * Mock WebSocket service implementation for development
 */
import { BaseWebSocketService } from './base-service';

export class MockWebSocketService extends BaseWebSocketService {
  constructor() {
    super();
    this.isConnected = true;
  }
  
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
}

// Export a singleton mock instance
export const mockWebSocketService = new MockWebSocketService();
