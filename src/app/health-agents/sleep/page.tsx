"use client";

import * as React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

// Sample conversation data
const sampleMessages = [
  {
    id: "1",
    role: "agent",
    content: "Hello! I'm your Sleep Analyzer assistant. I can help you understand your sleep patterns and provide recommendations for better sleep. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

export default function SleepAgentPage() {
  const [messages, setMessages] = React.useState(sampleMessages);
  const [newMessage, setNewMessage] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentResponse = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "I'm analyzing your sleep patterns based on the data you've shared. It appears your sleep quality could be improved. Would you like some recommendations for better sleep hygiene?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-2">
            <Icons.moon className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-semibold">Sleep Analyzer</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Icons.fileText className="h-4 w-4" />
          View Sleep Data
        </Button>
      </div>
      
      <Card className="mt-6 border-none shadow-sm">
        <CardHeader>
          <CardTitle>Sleep Analysis Conversation</CardTitle>
          <CardDescription>
            Chat with your AI sleep assistant to analyze and improve your sleep patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[600px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "agent" && (
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/agent-sleep.jpg" />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">SA</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" 
                          ? "bg-blue-600 text-white" 
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-1 text-xs opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 ml-2">
                        <AvatarImage src="/avatars/user.jpg" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message about sleep concerns..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="self-end"
                  onClick={handleSendMessage}
                >
                  <Icons.arrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
} 