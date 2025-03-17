
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
  // Add your Ionos AI models here
];

// Default model configuration
export const DEFAULT_MODEL_CONFIG: ChatModelConfig = {
  modelId: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  streamResponse: true,
};
