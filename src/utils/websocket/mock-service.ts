
/**
 * Mock WebSocket service implementation for development
 */
import { BaseWebSocketService } from './base-service';
import { toast } from "sonner";

export class MockWebSocketService extends BaseWebSocketService {
  private mockConnected = true;
  private mockConnectionTimeout: number | null = null;

  constructor() {
    super();
    this.isConnected = true;
    
    // Process any queued messages immediately
    setTimeout(() => {
      this.processQueue();
    }, 500);
  }
  
  public connect(): void {
    // Simulate successful connection after a delay
    if (!this.mockConnected) {
      console.log('Mock WebSocket reconnecting...');
      this.mockConnectionTimeout = window.setTimeout(() => {
        this.mockConnected = true;
        this.notifyConnectionHandlers(true);
        toast.success('WebSocket connection restored');
        this.processQueue();
      }, 2000);
    } else {
      this.notifyConnectionHandlers(true);
    }
  }
  
  public disconnect(): void {
    if (this.mockConnectionTimeout) {
      clearTimeout(this.mockConnectionTimeout);
      this.mockConnectionTimeout = null;
    }
    
    this.mockConnected = false;
    this.notifyConnectionHandlers(false);
  }
  
  public send(type: string, payload: any): boolean {
    console.log('Mock WebSocket send:', { type, payload });
    
    if (!this.mockConnected) {
      console.log('Mock WebSocket not connected, queueing message');
      this.queueMessage(type, payload);
      return false;
    }
    
    // Simulate processing and response for summarization requests
    if (type === 'request_summary') {
      setTimeout(() => {
        this.handleMockSummaryResponse(payload.id);
      }, 3000);
    } else if (type === 'heartbeat') {
      // Respond to heartbeats immediately
      setTimeout(() => {
        if (this.messageHandlers.has('pong')) {
          this.messageHandlers.get('pong')?.forEach(handler => {
            handler({ timestamp: Date.now() });
          });
        }
      }, 50);
    }
    
    // Occasionally simulate network issues for testing the queue
    if (Math.random() < 0.1) {
      console.log('Simulating temporary WebSocket disconnection for testing');
      this.mockConnected = false;
      this.notifyConnectionHandlers(false);
      toast.error('WebSocket connection lost (simulated)');
      
      // Reconnect after a few seconds
      this.mockConnectionTimeout = window.setTimeout(() => {
        this.mockConnected = true;
        this.notifyConnectionHandlers(true);
        toast.success('WebSocket connection restored');
        this.processQueue();
      }, 5000);
      
      return false;
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

