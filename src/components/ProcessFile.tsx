
import React from 'react';
import Button from '@/components/Button';
import FileUpload from '@/components/FileUpload';
import FeatureHighlights from '@/components/FeatureHighlights';

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
  return (
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
          onFileSelect={onFileSelect}
          className="mb-6"
        />
        
        {file && (
          <div className="flex justify-center animate-fade-in">
            <Button
              onClick={onProcessFile}
              isLoading={isProcessing}
              size="lg"
              className="mt-4"
            >
              {isProcessing ? 'Processing...' : 'Generate Summary'}
            </Button>
            
            {isProcessing && progress > 0 && (
              <div className="w-full max-w-md mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  {progress < 100 
                    ? `Processing: ${progress}% complete` 
                    : 'Finalizing summary...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <FeatureHighlights />
    </div>
  );
};

export default ProcessFile;
