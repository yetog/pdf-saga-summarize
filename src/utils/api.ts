import { toast } from "sonner";
import { API } from "@/config";
import { getWebSocketService } from "./websocket";

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
  const wsService = getWebSocketService();
  wsService.connect();
};
