
import { toast } from "sonner";
import { API } from "@/config";
import { getWebSocketService, getMockWebSocketService } from "./websocket";

// Error handling utility
const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
  toast.error(errorMessage);
  throw error;
};

/**
 * Upload a PDF file to the server
 */
export const uploadPDF = async (file: File): Promise<{ id: string, filename: string }> => {
  try {
    // If using mock API, use the mock function instead
    if (API.useMockApi) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        id: `mock-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API.baseUrl}/upload/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { 
      id: data.filename, // Using filename as ID for now
      filename: data.filename 
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Request a summary for a PDF file and subscribe to updates
 */
export const requestSummary = async (
  pdfName: string, 
  onProgress?: (progress: number) => void,
  onComplete?: (summary: string) => void
): Promise<void> => {
  try {
    // If using mock API, simulate progress and complete with mock data
    if (API.useMockApi) {
      // Simulate processing with progress updates
      if (onProgress) {
        const progressIntervals = [10, 30, 50, 70, 90, 100];
        for (const progress of progressIntervals) {
          await new Promise(resolve => setTimeout(resolve, 500));
          onProgress(progress);
        }
      }
      
      // Simulate completion
      if (onComplete) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockSummary = `This document provides a comprehensive analysis of modern user interface design principles, with a particular focus on minimalist approaches. The author argues that successful UI design balances aesthetic considerations with functional requirements.

Key points identified include:

1. The importance of whitespace in creating visual hierarchy and improving readability.
2. How typography choices significantly impact user perception and information retention.
3. The role of consistent visual language in building intuitive navigation systems.
4. Why color psychology should inform palette selection for different application types.

The research demonstrates that users complete tasks 20% faster when interacting with interfaces that follow these minimalist principles. Additionally, user satisfaction scores were 35% higher for applications that prioritized simplicity and clarity in their design.

The document concludes with practical recommendations for implementing these findings, suggesting that designers should start with essential functionality and carefully evaluate each additional element before inclusion.`;
        onComplete(mockSummary);
      }
      
      return;
    }

    // Real API implementation
    // First, make the HTTP request to initiate the summary
    const response = await fetch(`${API.baseUrl}/summarize/?pdf_name=${encodeURIComponent(pdfName)}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Summarization request failed: ${response.statusText}`);
    }

    // Get WebSocket service
    const wsService = getWebSocketService();
    
    // Send a WebSocket message to request summary
    wsService.send('request_summary', { id: pdfName });
    
    // Subscribe to summary progress updates
    if (onProgress) {
      wsService.subscribe('summary_progress', (data) => {
        if (data.fileId === pdfName) {
          onProgress(data.progress);
        }
      });
    }
    
    // Subscribe to summary completion
    if (onComplete) {
      const unsubscribe = wsService.subscribe('summary_ready', (data) => {
        if (data.fileId === pdfName && data.status === 'completed') {
          onComplete(data.summary);
          unsubscribe(); // Unsubscribe once complete
        }
      });
    }
    
    return;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get a summary for a PDF file synchronously (fallback method)
 */
export const getSummary = async (pdfName: string): Promise<string> => {
  try {
    // If using mock API, return mock data
    if (API.useMockApi) {
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return `This document provides a comprehensive analysis of modern user interface design principles, with a particular focus on minimalist approaches. The author argues that successful UI design balances aesthetic considerations with functional requirements.

Key points identified include:

1. The importance of whitespace in creating visual hierarchy and improving readability.
2. How typography choices significantly impact user perception and information retention.
3. The role of consistent visual language in building intuitive navigation systems.
4. Why color psychology should inform palette selection for different application types.

The research demonstrates that users complete tasks 20% faster when interacting with interfaces that follow these minimalist principles. Additionally, user satisfaction scores were 35% higher for applications that prioritized simplicity and clarity in their design.

The document concludes with practical recommendations for implementing these findings, suggesting that designers should start with essential functionality and carefully evaluate each additional element before inclusion.`;
    }

    const response = await fetch(`${API.baseUrl}/summarize/?pdf_name=${encodeURIComponent(pdfName)}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Summarization failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Check if the backend service is available
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  // If using mock API, return true without making an actual request
  if (API.useMockApi) {
    return true;
  }
  
  try {
    const response = await fetch(`${API.baseUrl}/`);
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

/**
 * Subscribe to WebSocket connection status
 */
export const subscribeToConnectionStatus = (callback: (isConnected: boolean) => void): () => void => {
  const wsService = getWebSocketService();
  return wsService.subscribeToConnection(callback);
};

/**
 * Initialize WebSocket connection
 */
export const initializeWebSocket = (): void => {
  // Only initialize WebSocket if not using mock API
  if (!API.useMockApi) {
    const wsService = getWebSocketService();
    wsService.connect();
  } else {
    // Simulate WebSocket connection for consistency
    setTimeout(() => {
      const mockService = getMockWebSocketService();
      mockService.mockConnect();
    }, 1000);
  }
};
