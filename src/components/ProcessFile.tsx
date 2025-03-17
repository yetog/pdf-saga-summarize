
import React from 'react';
import Button from '@/components/Button';
import FileUpload from '@/components/FileUpload';
import FeatureHighlights from '@/components/FeatureHighlights';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProcessFileProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onProcessFile: () => void;
  isProcessing: boolean;
  progress: number;
  backendStatus: 'online' | 'offline' | 'checking';
}

const ProcessFile: React.FC<ProcessFileProps> = ({
  file,
  onFileSelect,
  onProcessFile,
  isProcessing,
  progress,
  backendStatus
}) => {
  const isMobile = useIsMobile();
  
  const renderProcessingState = () => {
    if (!isProcessing) return null;
    
    return (
      <div className="w-full max-w-md mt-6 animate-fade-up">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing document</span>
            <span>{progress < 100 ? `${progress}%` : 'Finalizing...'}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress < 30 
              ? 'Analyzing document structure...' 
              : progress < 60 
                ? 'Extracting key information...' 
                : progress < 90 
                  ? 'Generating concise summary...' 
                  : 'Polishing final output...'}
          </p>
        </div>
      </div>
    );
  };
  
  const renderBackendOfflineWarning = () => {
    if (backendStatus !== 'offline') return null;
    
    return (
      <Alert variant="destructive" className="mt-6 mx-auto max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Server Unavailable</AlertTitle>
        <AlertDescription>
          Our summarization service is currently offline. The app will use a fallback mode with limited features.
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2 animate-fade-up">
          PDF Summarization
        </div>
        
        <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold tracking-tight animate-fade-up animate-delay-100`}>
          Transform your documents into concise summaries
        </h1>
        
        <p className="text-lg text-muted-foreground mt-4 animate-fade-up animate-delay-200">
          Upload your PDF and get an AI-powered summary in seconds.
          Save time and extract key insights without reading the entire document.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto w-full pt-4 animate-fade-up animate-delay-300">
        <FileUpload 
          onFileSelect={onFileSelect}
          className="mb-6"
        />
        
        {renderBackendOfflineWarning()}
        
        {file && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <svg 
                className="w-5 h-5 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <span className="text-sm">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            
            <Button
              onClick={onProcessFile}
              isLoading={isProcessing}
              size="lg"
              className={isMobile ? "w-full" : ""}
              disabled={isProcessing || backendStatus === 'offline'}
            >
              {isProcessing ? 'Processing...' : 'Generate Summary'}
            </Button>
            
            {renderProcessingState()}
          </div>
        )}
      </div>
      
      <FeatureHighlights />
    </div>
  );
};

export default ProcessFile;
