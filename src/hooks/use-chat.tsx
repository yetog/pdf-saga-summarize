
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatState, ChatModelConfig, DEFAULT_MODEL_CONFIG } from '@/utils/chat/types';
import { API, APP_CONFIG, IONOS_CONFIG } from '@/config';
import { toast } from 'sonner';

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

  // Function to call the Ionos AI Model Hub API
  const callIonosAI = async (messages: { role: string; content: string }[], context: string) => {
    // Base URL for the Ionos AI Model Hub API
    const url = `${IONOS_CONFIG.baseUrl}/chat/completions`;
    
    // Prepare system message with PDF context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant for answering questions about PDF documents. 
      Use the following document information as context for answering questions:
      ${context}`
    };
    
    // Full messages array including system message
    const fullMessages = [
      systemMessage,
      ...messages
    ];
    
    // Request body
    const body = JSON.stringify({
      model: IONOS_CONFIG.chatModelId,
      messages: fullMessages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: config.streamResponse,
    });
    
    // Headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${IONOS_CONFIG.apiKey}`,
    };
    
    // Make the request
    if (config.streamResponse) {
      // For streaming responses
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body reader could not be created');
      
      return { reader, response };
    } else {
      // For non-streaming responses
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    }
  };

  // Process Ionos AI streaming response
  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>, assistantMessageId: string) => {
    const decoder = new TextDecoder();
    let accumulatedResponse = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Process the chunk - in real Ionos API, you would need to parse the SSE data
        // This is a simplified version
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            // Skip the [DONE] message
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              
              if (content) {
                accumulatedResponse += content;
                
                // Update the message content
                setState(prevState => {
                  const updatedMessages = [...prevState.messages];
                  const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
                  
                  if (assistantMessageIndex !== -1) {
                    updatedMessages[assistantMessageIndex] = {
                      ...updatedMessages[assistantMessageIndex],
                      content: accumulatedResponse,
                    };
                  }
                  
                  return {
                    ...prevState,
                    messages: updatedMessages,
                  };
                });
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading stream:', error);
      throw error;
    } finally {
      // Update the message as complete
      setState(prevState => {
        const updatedMessages = [...prevState.messages];
        const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);
        
        if (assistantMessageIndex !== -1) {
          updatedMessages[assistantMessageIndex] = {
            ...updatedMessages[assistantMessageIndex],
            status: 'complete',
            isStreaming: false,
          };
        }
        
        return {
          ...prevState,
          messages: updatedMessages,
          isLoading: false,
          isTyping: false,
        };
      });
    }
    
    return accumulatedResponse;
  };

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
      // If API keys are configured and we're not using mock API, call Ionos AI
      if (APP_CONFIG.apiKeysConfigured && !API.useMockApi) {
        const messageHistory = state.messages.map(m => ({
          role: m.role,
          content: m.content
        }));
        
        // Add the new user message
        messageHistory.push({
          role: 'user',
          content
        });
        
        if (config.streamResponse) {
          const { reader } = await callIonosAI(messageHistory, context);
          await processStream(reader, assistantMessage.id);
        } else {
          const response = await callIonosAI(messageHistory, context);
          
          setState(prevState => {
            const updatedMessages = [...prevState.messages];
            const assistantMessageIndex = updatedMessages.length - 1;
            
            updatedMessages[assistantMessageIndex] = {
              ...updatedMessages[assistantMessageIndex],
              content: response,
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
        // Use mock API as fallback
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
      
      toast.error(`Error: ${errorMessage}`);
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
