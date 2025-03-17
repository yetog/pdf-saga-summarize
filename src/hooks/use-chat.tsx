
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatState, ChatModelConfig, DEFAULT_MODEL_CONFIG } from '@/utils/chat/types';
import { API, APP_CONFIG } from '@/config';

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  onResponse?: (message: ChatMessage) => void;
  modelConfig?: Partial<ChatModelConfig>;
}

export function useChat({ 
  initialMessages = [], 
  onResponse,
  modelConfig = {}
}: UseChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
    isTyping: false,
  });

  // Combine default config with user options
  const config = {
    ...DEFAULT_MODEL_CONFIG,
    ...modelConfig
  };

  // Clean up any streaming message when unmounting
  useEffect(() => {
    return () => {
      // Cleanup any potential streaming connections
    };
  }, []);

  // Mock function - replace with actual API call to Ionos AI model hub
  const sendMessage = useCallback(async (content: string, context: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Create a placeholder for the assistant's response
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'pending',
      isStreaming: config.streamResponse,
    };

    // Update state with user message and pending assistant message
    setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, userMessage, assistantMessage],
      isLoading: true,
      isTyping: true,
      error: null,
    }));

    try {
      // This is where you'd integrate with Ionos AI model hub
      // For now, we'll use a mock response
      
      if (API.useMockApi || !APP_CONFIG.apiKeysConfigured) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate a streaming response if enabled
        if (config.streamResponse) {
          const responses = generateMockResponse(content, context);
          let accumulatedResponse = '';
          
          for (const chunk of responses) {
            await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
            accumulatedResponse += chunk;
            
            setState(prevState => {
              const updatedMessages = [...prevState.messages];
              const assistantMessageIndex = updatedMessages.length - 1;
              
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: accumulatedResponse,
              };
              
              return {
                ...prevState,
                messages: updatedMessages,
              };
            });
          }
          
          // Mark as complete when done streaming
          setState(prevState => {
            const updatedMessages = [...prevState.messages];
            const assistantMessageIndex = updatedMessages.length - 1;
            
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              status: 'complete',
              isStreaming: false,
            };
            
            return {
              ...prevState,
              messages: updatedMessages,
              isLoading: false,
              isTyping: false,
            };
          });
        } else {
          // Non-streaming response
          const mockResponse = generateMockResponse(content, context).join('');
          
          setState(prevState => {
            const updatedMessages = [...prevState.messages];
            const assistantMessageIndex = updatedMessages.length - 1;
            
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: mockResponse,
              status: 'complete',
              isStreaming: false,
            };
            
            return {
              ...prevState,
              messages: updatedMessages,
              isLoading: false,
              isTyping: false,
            };
          });
        }
      } else {
        // Real API integration would go here
        // const response = await fetch(`${API.baseUrl}/chat`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     model: config.modelId,
        //     messages: [
        //       { role: 'system', content: `You are a helpful PDF assistant. Use the following context to answer questions: ${context}` },
        //       ...state.messages.map(m => ({ role: m.role, content: m.content })),
        //       { role: 'user', content }
        //     ],
        //     temperature: config.temperature,
        //     max_tokens: config.maxTokens,
        //     stream: config.streamResponse,
        //   }),
        // });
        
        // TODO: Handle streaming and non-streaming responses from the actual API
      }

      // Callback with the final response
      if (onResponse) {
        const finalMessage = state.messages[state.messages.length - 1];
        onResponse(finalMessage);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState(prevState => {
        const updatedMessages = [...prevState.messages];
        const assistantMessageIndex = updatedMessages.length - 1;
        
        updatedMessages[assistantMessageIndex] = {
          ...updatedMessages[assistantMessageIndex],
          content: `Error: ${errorMessage}`,
          status: 'error',
          isStreaming: false,
        };
        
        return {
          ...prevState,
          messages: updatedMessages,
          isLoading: false,
          isTyping: false,
          error: errorMessage,
        };
      });
      
      console.error('Error sending message:', error);
    }
  }, [state.messages, config, onResponse]);

  const clearMessages = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      messages: [],
      error: null,
    }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isTyping: state.isTyping,
    error: state.error,
    sendMessage,
    clearMessages,
  };
}

// Mock response generator
function generateMockResponse(query: string, context: string): string[] {
  // Generate responses based on the query
  let baseResponse = '';
  
  if (query.toLowerCase().includes('summary')) {
    baseResponse = `Here's what I found in the document: ${context}`;
  } else if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
    baseResponse = "Hello! I'm your PDF assistant. You can ask me questions about the document you've uploaded.";
  } else {
    baseResponse = `Based on the document, I can tell you that it discusses UI design principles including whitespace, typography, visual language, and color psychology. Users complete tasks 20% faster with minimalist interfaces, and satisfaction scores are 35% higher. Is there anything specific you'd like to know about these topics?`;
  }
  
  // Split the response into chunks to simulate streaming
  const words = baseResponse.split(' ');
  const chunks = [];
  let currentChunk = '';
  
  for (const word of words) {
    currentChunk += (currentChunk ? ' ' : '') + word;
    if (currentChunk.length > 5 && Math.random() > 0.7) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}
