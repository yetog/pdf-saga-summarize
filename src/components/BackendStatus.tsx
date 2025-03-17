
import React from 'react';
import { AlertCircle, CheckCircle, Loader2, Radio } from 'lucide-react';

interface BackendStatusProps {
  status: 'online' | 'offline' | 'checking';
  wsConnected?: boolean;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ status, wsConnected }) => {
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
    <div className="flex flex-col space-y-1">
      <div className="flex items-center text-xs text-primary mb-1">
        <CheckCircle className="h-3 w-3 mr-1" />
        <span>Connected to backend API</span>
      </div>
      
      {wsConnected !== undefined && (
        <div className={`flex items-center text-xs ${wsConnected ? 'text-green-500' : 'text-amber-500'} mb-4`}>
          <Radio className={`h-3 w-3 mr-1 ${wsConnected ? '' : 'animate-pulse'}`} />
          <span>{wsConnected ? 'Real-time updates active' : 'Real-time updates connecting...'}</span>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
