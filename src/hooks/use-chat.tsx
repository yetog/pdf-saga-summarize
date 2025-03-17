
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatState } from '@/utils/chat/types';

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  onResponse?: (message: ChatMessage) => void;
}

export function useChat({ initialMessages = [], onResponse }: UseChatOptions = {}) {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
  });

  // Mock function - replace with actual API call to Ionos AI model hub
  const sendMessage = useCallback(async (content: string, summary: string) => {
    if (!content.trim()) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Update state with user message and loading state
    setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // This is where you'd integrate with Ionos AI model hub
      // For now, we'll use a mock response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a response based on the summary context
      let responseText = '';
      
      if (content.toLowerCase().includes('summary')) {
        responseText = `Here's what I found in the document: ${summary}`;
      } else if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
        responseText = "Hello! I'm your PDF assistant. You can ask me questions about the document you've uploaded.";
      } else {
        responseText = `Based on the document, I can tell you that it discusses UI design principles including whitespace, typography, visual language, and color psychology. Users complete tasks 20% faster with minimalist interfaces, and satisfaction scores are 35% higher. Is there anything specific you'd like to know about these topics?`;
      }

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
      };

      // Update state with assistant message
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, assistantMessage],
        isLoading: false,
      }));

      if (onResponse) {
        onResponse(assistantMessage);
      }

      return assistantMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: errorMessage,
      }));
      
      console.error('Error sending message:', error);
    }
  }, [onResponse]);

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
    error: state.error,
    sendMessage,
    clearMessages,
  };
}
