
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryViewProps {
  summary: string;
  fileName: string;
  className?: string;
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  summary,
  fileName,
  className,
  onBack
}) => {
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.replace('.pdf', '')}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Loading skeleton when summary is empty but expected
  if (!summary) {
    return (
      <div className={cn("w-full animate-fade-up", className)}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-40 mt-2" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-4/6 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("w-full animate-fade-up", className)}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'} mb-6`}>
        <div>
          <button 
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back
          </button>
          <h2 className="text-2xl font-medium mt-2">Summary</h2>
          <p className="text-sm text-muted-foreground">
            {fileName}
          </p>
        </div>
        
        <div className={`flex space-x-2 ${isMobile ? 'w-full' : ''}`}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopy}
            className={isMobile ? "flex-1" : ""}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleDownload}
            className={isMobile ? "flex-1" : ""}
          >
            Download
          </Button>
        </div>
      </div>
      
      <div className="bg-background rounded-xl border border-border p-6 mb-6">
        <div className="prose prose-sm max-w-none">
          {summary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
