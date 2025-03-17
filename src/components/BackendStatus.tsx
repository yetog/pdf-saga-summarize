
import React from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface BackendStatusProps {
  status: 'online' | 'offline' | 'checking';
}

const BackendStatus: React.FC<BackendStatusProps> = ({ status }) => {
  if (status === 'checking') {
    return (
      <div className="flex items-center text-xs text-muted-foreground mb-4 animate-pulse">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        <span>Checking connection...</span>
      </div>
    );
  }
  
  if (status === 'offline') {
    return (
      <div className="flex items-center text-xs text-destructive mb-4">
        <AlertCircle className="h-3 w-3 mr-1" />
        <span>Backend is offline - some features may be unavailable</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-xs text-primary mb-4">
      <CheckCircle className="h-3 w-3 mr-1" />
      <span>Connected to backend</span>
    </div>
  );
};

export default BackendStatus;
