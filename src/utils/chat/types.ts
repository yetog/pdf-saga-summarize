
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'pending' | 'complete' | 'error';
  isStreaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping?: boolean;
}

export interface ChatModelConfig {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  streamResponse?: boolean;
}

// Add API model options that will be available to users
export const AVAILABLE_MODELS = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 (70B)', provider: 'Meta' },
  { id: '0b6c4a15-bb8d-4092-82b0-f357b77c59fd', name: 'IONOS Chat Model', provider: 'IONOS' },
];

// Default model configuration
export const DEFAULT_MODEL_CONFIG: ChatModelConfig = {
  modelId: '0b6c4a15-bb8d-4092-82b0-f357b77c59fd', // Use IONOS model as default
  temperature: 0.7,
  maxTokens: 2048,
  streamResponse: true,
};
