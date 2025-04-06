
import { WebSocketMessage, WebSocketServiceInterface } from './types';

type Subscription = {
  event: string;
  callback: (data: any) => void;
};

type ConnectionSubscription = (isConnected: boolean) => void;

/**
 * Mock WebSocket service for development/preview without a real backend
 */
class MockWebSocketService implements WebSocketServiceInterface {
  private isConnected = false;
  private subscriptions: Subscription[] = [];
  private connectionSubscriptions: ConnectionSubscription[] = [];

  connect(): void {
    // Do nothing in mock mode
    console.log('[MockWS] Connection not needed in mock mode');
  }

  // Special method for mock connection simulation
  mockConnect(): void {
    console.log('[MockWS] Simulating connection');
    this.isConnected = true;
    this.notifyConnectionSubscribers();
  }

  disconnect(): void {
    this.isConnected = false;
    this.notifyConnectionSubscribers();
  }

  send(event: string, data: any): boolean {
    console.log(`[MockWS] Sending event: ${event}`, data);
    // Simulate echoing the event back for testing
    setTimeout(() => {
      this.mockReceiveEvent(event, data);
    }, 500);
    return true; // Return true to indicate success
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    const subscription = { event, callback };
    this.subscriptions.push(subscription);

    return () => {
      this.subscriptions = this.subscriptions.filter(sub => sub !== subscription);
    };
  }

  subscribeToConnection(callback: (isConnected: boolean) => void): () => void {
    this.connectionSubscriptions.push(callback);
    // Immediately notify the new subscriber
    callback(this.isConnected);

    return () => {
      this.connectionSubscriptions = this.connectionSubscriptions.filter(sub => sub !== callback);
    };
  }

  // Add the isSocketConnected method to match the interface
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Mock receiving an event
  private mockReceiveEvent(event: string, data: any): void {
    if (event === 'request_summary') {
      // Simulate progress updates
      this.simulateProgressUpdates(data.id);
    }

    // Find and call all callbacks for this event
    this.subscriptions
      .filter(sub => sub.event === event)
      .forEach(sub => sub.callback(data));
  }

  // Simulate progress updates for summary generation
  private simulateProgressUpdates(fileId: string): void {
    const progressSteps = [10, 30, 50, 70, 90, 100];
    
    progressSteps.forEach((progress, index) => {
      setTimeout(() => {
        // Notify progress subscribers
        this.subscriptions
          .filter(sub => sub.event === 'summary_progress')
          .forEach(sub => sub.callback({ fileId, progress }));
        
        // When complete, notify completion subscribers
        if (progress === 100) {
          setTimeout(() => {
            const mockSummary = `This document provides a comprehensive analysis of modern user interface design principles, with a particular focus on minimalist approaches. The author argues that successful UI design balances aesthetic considerations with functional requirements.

Key points identified include:

1. The importance of whitespace in creating visual hierarchy and improving readability.
2. How typography choices significantly impact user perception and information retention.
3. The role of consistent visual language in building intuitive navigation systems.
4. Why color psychology should inform palette selection for different application types.

The research demonstrates that users complete tasks 20% faster when interacting with interfaces that follow these minimalist principles. Additionally, user satisfaction scores were 35% higher for applications that prioritized simplicity and clarity in their design.

The document concludes with practical recommendations for implementing these findings, suggesting that designers should start with essential functionality and carefully evaluate each additional element before inclusion.`;

            this.subscriptions
              .filter(sub => sub.event === 'summary_ready')
              .forEach(sub => sub.callback({ 
                fileId, 
                status: 'completed', 
                summary: mockSummary 
              }));
          }, 500);
        }
      }, (index + 1) * 500);
    });
  }

  private notifyConnectionSubscribers(): void {
    this.connectionSubscriptions.forEach(callback => callback(this.isConnected));
  }
}

// Export a singleton instance
export const mockWebSocketService = new MockWebSocketService();
