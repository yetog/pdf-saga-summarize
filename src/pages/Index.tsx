
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import SummaryView from '@/components/SummaryView';
import Button from '@/components/Button';
import { uploadPDF, getSummary, checkBackendHealth } from '@/utils/api';
import { toast } from 'sonner';
import BackendStatus from '@/components/BackendStatus';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'upload' | 'summary'>('upload');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
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
      
      // Upload the file
      const { id } = await uploadPDF(file);
      toast.success('PDF uploaded successfully');
      
      // Get the summary
      const result = await getSummary(id);
      setSummary(result);
      setViewMode('summary');
      
      toast.success('Summary generated successfully');
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process PDF');
    } finally {
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
        <BackendStatus status={backendStatus} />
        
        {viewMode === 'upload' ? (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2 animate-fade-up">
                PDF Summarization
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight animate-fade-up animate-delay-100">
                Transform your documents into concise summaries
              </h1>
              
              <p className="text-lg text-muted-foreground mt-4 animate-fade-up animate-delay-200">
                Upload your PDF and get an AI-powered summary in seconds.
                Save time and extract key insights without reading the entire document.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto w-full pt-4 animate-fade-up animate-delay-300">
              <FileUpload 
                onFileSelect={handleFileSelect}
                className="mb-6"
              />
              
              {file && (
                <div className="flex justify-center animate-fade-in">
                  <Button
                    onClick={handleProcessFile}
                    isLoading={isProcessing}
                    size="lg"
                    className="mt-4"
                  >
                    {isProcessing ? 'Processing...' : 'Generate Summary'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-secondary/50 backdrop-blur-xs rounded-xl p-8 mt-16 animate-fade-up animate-delay-400">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Fast Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Get summaries in seconds regardless of document length.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your documents are handled with enterprise-grade security.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Smart Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts only the most relevant information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SummaryView
            summary={summary || ''}
            fileName={file?.name || 'document.pdf'}
            onBack={handleBack}
          />
        )}
      </main>
      
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PDF Saga. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
