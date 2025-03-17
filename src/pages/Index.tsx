
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SummaryView from '@/components/SummaryView';
import { uploadPDF, getSummary, checkBackendHealth, requestSummary, subscribeToConnectionStatus, initializeWebSocket } from '@/utils/api';
import { toast } from 'sonner';
import BackendStatus from '@/components/BackendStatus';
import { API } from '@/config';
import ProcessFile from '@/components/ProcessFile';
import Footer from '@/components/Footer';
import ChatBot from '@/components/chat/ChatBot';

const Index = () => {
  // File handling state
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'upload' | 'summary'>('upload');
  
  // Backend connection state
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [wsConnected, setWsConnected] = useState<boolean | undefined>(undefined);
  
  // Error handling state
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Initialize WebSocket on component mount
  useEffect(() => {
    initializeWebSocket();
    
    // Subscribe to WebSocket connection status
    const unsubscribe = subscribeToConnectionStatus((isConnected) => {
      setWsConnected(isConnected);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Check backend health periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const isOnline = await checkBackendHealth();
        setBackendStatus(isOnline ? 'online' : 'offline');
      } catch (error) {
        setBackendStatus('offline');
        console.error('Failed to check backend status:', error);
      }
    };
    
    checkStatus();
    // Periodically check backend status
    const intervalId = setInterval(checkStatus, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError(null);
    
    // Reset summary when a new file is selected
    if (summary) {
      setSummary(null);
      setViewMode('upload');
    }
  };
  
  const handleProcessFile = async () => {
    if (!file) return;
    
    if (backendStatus === 'offline' && !API.useMockApi) {
      toast.error('Backend service is offline. Please try again later.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setUploadError(null);
      
      // Upload the file
      const { id } = await uploadPDF(file);
      toast.success('PDF uploaded successfully');
      
      // Get the summary with real-time updates if WebSocket is connected
      if (wsConnected && !API.useMockApi) {
        await requestSummary(
          id, 
          (progressValue) => {
            setProgress(progressValue);
          },
          (result) => {
            setSummary(result);
            setIsProcessing(false);
            setViewMode('summary');
            toast.success('Summary generated successfully');
          }
        );
      } else {
        // Fallback to synchronous method or mock API
        const result = await getSummary(id);
        setSummary(result);
        setViewMode('summary');
        setIsProcessing(false);
        toast.success('Summary generated successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error processing file:', error);
      toast.error(`Failed to process PDF: ${errorMessage}`);
      setUploadError(errorMessage);
      setIsProcessing(false);
    }
  };
  
  const handleBack = () => {
    setViewMode('upload');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <BackendStatus status={backendStatus} wsConnected={wsConnected} />
        
        {viewMode === 'upload' ? (
          <ProcessFile
            file={file}
            onFileSelect={handleFileSelect}
            onProcessFile={handleProcessFile}
            isProcessing={isProcessing}
            progress={progress}
            backendStatus={backendStatus}
          />
        ) : (
          <SummaryView
            summary={summary || ''}
            fileName={file?.name || 'document.pdf'}
            onBack={handleBack}
          />
        )}
      </main>
      
      <Footer />
      
      {/* Add the ChatBot component if we have a file and summary */}
      {file && summary && (
        <ChatBot 
          summary={summary} 
          fileName={file.name}
        />
      )}
    </div>
  );
};

export default Index;
