
import { toast } from "sonner";

// Base API URL - should be configured based on environment
const API_BASE_URL = "http://localhost:8000"; // Change this to your FastAPI server URL

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

    const response = await fetch(`${API_BASE_URL}/upload/`, {
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
 * Get a summary for a PDF file
 */
export const getSummary = async (pdfName: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summarize/?pdf_name=${encodeURIComponent(pdfName)}`, {
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
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};
