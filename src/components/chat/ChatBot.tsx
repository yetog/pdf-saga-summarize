
import React, { useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface ChatBotProps {
  summary: string | null;
  fileName: string;
}

const ChatBot = ({ summary, fileName }: ChatBotProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    sendMessage(content, summary || "No summary available");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar side="right" variant="floating">
        <SidebarHeader className="border-b flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">PDF Assistant</span>
          </div>
          <SidebarTrigger className="ml-auto">
            <X className="h-5 w-5" />
          </SidebarTrigger>
        </SidebarHeader>
        <SidebarContent className="flex flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                <div>
                  <p className="mb-2">Ask me anything about</p>
                  <p className="font-medium">{fileName}</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || !summary} 
            placeholder={!summary ? "Upload a PDF first..." : "Ask about the document..."}
          />
          {messages.length > 0 && (
            <div className="p-4 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearMessages} 
                className="w-full"
              >
                Clear chat
              </Button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      
      <div className="fixed bottom-4 right-4 z-10 md:hidden">
        <SidebarTrigger asChild>
          <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SidebarTrigger>
      </div>
    </SidebarProvider>
  );
};

export default ChatBot;
