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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const conversations = [
  {
    id: "1",
    doctor: "Dr. Smith",
    specialty: "Cardiologist",
    lastMessage: "Your blood pressure readings look stable. Continue with your current medication regimen and monitor for any changes.",
    time: "2h ago",
    avatar: "/avatars/doctor-1.jpg",
    unread: false,
    messages: [
      {
        id: "1-1",
        sender: "user",
        content: "Hello Dr. Smith, I've been monitoring my blood pressure as you suggested. The readings have been around 130/85 consistently.",
        time: "2 days ago",
      },
      {
        id: "1-2",
        sender: "doctor",
        content: "That's good to hear. How are you feeling overall? Any dizziness or headaches?",
        time: "2 days ago",
      },
      {
        id: "1-3",
        sender: "user",
        content: "I've been feeling fine. No dizziness or headaches. I've also been taking my medication regularly.",
        time: "1 day ago",
      },
      {
        id: "1-4",
        sender: "doctor",
        content: "Your blood pressure readings look stable. Continue with your current medication regimen and monitor for any changes. Let's schedule a follow-up in a month.",
        time: "2h ago",
      },
    ],
  },
  {
    id: "2", 
    doctor: "Dr. Chen",
    specialty: "Nutritionist",
    lastMessage: "Remember to take your medication consistently and maintain your exercise routine. Let's schedule a follow-up in two weeks.",
    time: "1d ago",
    avatar: "/avatars/doctor-2.jpg",
    unread: true,
    messages: [
      {
        id: "2-1",
        sender: "user",
        content: "Hi Dr. Chen, I've been following the diet plan you recommended, but I'm finding it difficult to maintain during weekends.",
        time: "3 days ago",
      },
      {
        id: "2-2",
        sender: "doctor",
        content: "I understand that weekends can be challenging. Have you tried meal prepping on Fridays to help you stay on track?",
        time: "3 days ago",
      },
      {
        id: "2-3",
        sender: "user",
        content: "That's a good idea. I'll try that this weekend. Also, I've been taking my supplements regularly.",
        time: "2 days ago",
      },
      {
        id: "2-4",
        sender: "doctor",
        content: "Remember to take your medication consistently and maintain your exercise routine. Let's schedule a follow-up in two weeks.",
        time: "1d ago",
      },
    ],
  },
  {
    id: "3", 
    doctor: "Dr. Johnson",
    specialty: "Endocrinologist",
    lastMessage: "Your latest lab results show improvement. Keep up the good work with your dietary changes.",
    time: "3d ago",
    avatar: "/avatars/doctor-3.jpg",
    unread: false,
    messages: [
      {
        id: "3-1",
        sender: "doctor",
        content: "I've received your latest lab results, and I'm pleased to see improvement in your glucose levels.",
        time: "5 days ago",
      },
      {
        id: "3-2",
        sender: "user",
        content: "That's great news! I've been really careful with my diet and exercise.",
        time: "5 days ago",
      },
      {
        id: "3-3",
        sender: "doctor",
        content: "Your latest lab results show improvement. Keep up the good work with your dietary changes.",
        time: "3d ago",
      },
    ],
  },
];

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = React.useState(conversations[0]);
  const [newMessage, setNewMessage] = React.useState("");
  const [showNewConsultation, setShowNewConsultation] = React.useState(false);
  const [symptoms, setSymptoms] = React.useState("");
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    // In a real app, you would send this message to your backend
    // For now, we'll just clear the input
    setNewMessage("");
  };

  const handleStartConsultation = () => {
    if (symptoms.trim() === "") return;
    
    // In a real app, you would send this to your backend to start a new consultation
    // For now, we'll just reset the form and hide it
    setSymptoms("");
    setShowNewConsultation(false);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Conversations</h1>
        <Button 
          className="gap-2"
          onClick={() => setShowNewConsultation(!showNewConsultation)}
        >
          <Icons.messageSquare className="h-4 w-4" />
          New Consultation
        </Button>
      </div>

      {showNewConsultation ? (
        <Card className="mt-6 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Start a New Consultation</CardTitle>
            <CardDescription>
              Describe your symptoms or health concerns in detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Describe your symptoms, when they started, severity, and any relevant medical history..."
                className="min-h-[150px]"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewConsultation(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleStartConsultation}>
                  Start Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="border-none shadow-sm md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Your medical consultations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div 
                      key={conv.id} 
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedConversation.id === conv.id 
                          ? "bg-blue-50 dark:bg-blue-900/20" 
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.avatar} />
                          <AvatarFallback>{conv.doctor[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium">{conv.doctor}</p>
                              {conv.unread && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-blue-600"></span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500">{conv.time}</span>
                          </div>
                          <p className="text-xs text-zinc-500">{conv.specialty}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation Detail */}
          <Card className="border-none shadow-sm md:col-span-2">
            <CardHeader className="flex flex-row items-center space-x-4 pb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>{selectedConversation.doctor[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{selectedConversation.doctor}</CardTitle>
                <CardDescription>{selectedConversation.specialty}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === "user" 
                              ? "bg-blue-600 text-white" 
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="mt-1 text-xs opacity-70 text-right">{message.time}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Icons.arrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
} 