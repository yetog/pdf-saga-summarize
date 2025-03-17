
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SummaryView from '@/components/SummaryView';
import { uploadPDF, getSummary, checkBackendHealth, requestSummary, subscribeToConnectionStatus, initializeWebSocket } from '@/utils/api';
import { toast } from 'sonner';
import BackendStatus from '@/components/BackendStatus';
import { API } from '@/config';
import ProcessFile from '@/components/ProcessFile';
import Footer from '@/components/Footer';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'upload' | 'summary'>('upload');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [wsConnected, setWsConnected] = useState<boolean | undefined>(undefined);
  
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
      const isOnline = await checkBackendHealth();
      setBackendStatus(isOnline ? 'online' : 'offline');
    };
    
    checkStatus();
    // Periodically check backend status
    const intervalId = setInterval(checkStatus, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset summary when a new file is selected
    if (summary) {
      setSummary(null);
      setViewMode('upload');
    }
  };
  
  const handleProcessFile = async () => {
    if (!file) return;
    
    if (backendStatus === 'offline') {
      toast.error('Backend service is offline. Please try again later.');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProgress(0);
      
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
        // Fallback to synchronous method
        const result = await getSummary(id);
        setSummary(result);
        setViewMode('summary');
        toast.success('Summary generated successfully');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process PDF');
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
    </div>
  );
};

export default Index;
