
import React, { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  className,
  accept = '.pdf',
  maxSize = 10 // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    // Check file type
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return false;
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    return true;
  }, [maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        onFileSelect(droppedFile);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      }
    }
  }, [onFileSelect, validateFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center flex flex-col items-center justify-center min-h-[240px]",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-accent/30",
            className
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input 
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="w-16 h-16 mb-4 rounded-full bg-accent flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-primary/70" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {isDragging ? 'Drop your file here' : 'Upload your PDF'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Drag and drop your PDF file here, or click to browse your files
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border p-4 flex items-center justify-between animate-scale-in">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveFile}
            className="text-muted-foreground hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
