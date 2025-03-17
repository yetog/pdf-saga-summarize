
// Mock PDF processing functions for the frontend when backend is not available
// In a real application, these would interface with a backend

/**
 * Simulates uploading a PDF file to a server (Fallback mock)
 */
export const uploadPDFMock = async (file: File): Promise<{ id: string }> => {
  // Simulate network request
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would send the file to a server
  return { 
    id: `pdf-${Math.random().toString(36).substring(2, 9)}` 
  };
};

/**
 * Simulates getting a summary from a PDF file (Fallback mock)
 */
export const getSummaryMock = async (fileId: string): Promise<string> => {
  // Simulate network request and processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would fetch the summary from a server
  return `This document provides a comprehensive analysis of modern user interface design principles, with a particular focus on minimalist approaches. The author argues that successful UI design balances aesthetic considerations with functional requirements.

Key points identified include:

1. The importance of whitespace in creating visual hierarchy and improving readability.
2. How typography choices significantly impact user perception and information retention.
3. The role of consistent visual language in building intuitive navigation systems.
4. Why color psychology should inform palette selection for different application types.

The research demonstrates that users complete tasks 20% faster when interacting with interfaces that follow these minimalist principles. Additionally, user satisfaction scores were 35% higher for applications that prioritized simplicity and clarity in their design.

The document concludes with practical recommendations for implementing these findings, suggesting that designers should start with essential functionality and carefully evaluate each additional element before inclusion.`;
};

// Note: These functions are now moved to api.ts for real implementation
// The functions are kept here for backwards compatibility and as fallback
export const uploadPDF = uploadPDFMock;
export const getSummary = getSummaryMock;
