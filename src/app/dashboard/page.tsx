"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
import { AppLayout } from "@/components/layout/AppLayout";

const bloodPressureData = [
  { date: "Jan", systolic: 130, diastolic: 85 },
  { date: "Feb", systolic: 128, diastolic: 83 },
  { date: "Mar", systolic: 132, diastolic: 87 },
  { date: "Apr", systolic: 129, diastolic: 84 },
  { date: "May", systolic: 131, diastolic: 86 },
  { date: "Jun", systolic: 127, diastolic: 82 },
];

const conversations = [
  {
    id: "1",
    doctor: "Dr. Smith",
    preview: "Your blood pressure readings look stable. Continue with your current medication regimen and monitor for any changes.",
    time: "2h ago",
    avatar: "/avatars/doctor-1.jpg",
    route: "/conversations"
  },
  {
    id: "2", 
    doctor: "Dr. Chen",
    preview: "Remember to take your medication consistently and maintain your exercise routine. Let's schedule a follow-up in two weeks.",
    time: "1d ago",
    avatar: "/avatars/doctor-2.jpg",
    route: "/conversations"
  },
  {
    id: "3", 
    doctor: "Dr. Johnson",
    preview: "Your latest lab results show improvement. Keep up the good work with your dietary changes.",
    time: "3d ago",
    avatar: "/avatars/doctor-3.jpg",
    route: "/conversations"
  }
];

const agents = [
  {
    id: "sleep",
    name: "Sleep Analyzer",
    description: "AI-powered sleep pattern analysis",
    icon: <Icons.moon className="h-5 w-5 text-indigo-500" />,
    route: "/health-agents/sleep"
  },
  {
    id: "eastern",
    name: "Eastern Medicine",
    description: "Traditional healing insights",
    icon: <Icons.leaf className="h-5 w-5 text-emerald-500" />,
    isNew: true,
    route: "/health-agents/eastern"
  },
  {
    id: "more",
    name: "More Agents",
    description: "Explore all health assistants",
    icon: <Icons.arrowUpRight className="h-5 w-5 text-blue-500" />,
    route: "/health-agents"
  }
];

export default function Dashboard() {
  const router = useRouter();

  const handleAgentClick = (route: string) => {
    router.push(route);
  };

  const handleConversationClick = (route: string) => {
    router.push(route);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Health Dashboard</h1>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push("/health-data")}>
          <Icons.plus className="h-4 w-4" />
          Add Health Data
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Blood Pressure Card */}
        <Card 
          className="col-span-1 lg:col-span-2 overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => router.push("/health-data")}
        >
          <CardHeader className="bg-white dark:bg-zinc-900 pb-2">
            <CardTitle>Blood Pressure Trends</CardTitle>
            <CardDescription>Your readings over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-zinc-900 pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodPressureData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Systolic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Diastolic"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-zinc-500">Systolic</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-zinc-500">Diastolic</span>
                </div>
              </div>
              <div className="text-sm font-medium">
                Latest: 130/85 mmHg
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversations Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="bg-white dark:bg-zinc-900 pb-2">
            <CardTitle>Doctor Messages</CardTitle>
            <CardDescription>Recent medical consultations</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-zinc-900 p-0">
            <ScrollArea className="h-[350px]">
              <div className="space-y-1 p-4">
                {conversations.map((conv) => (
                  <div 
                    key={conv.id} 
                    className="rounded-lg p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    onClick={() => handleConversationClick(conv.route)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conv.avatar} />
                        <AvatarFallback>{conv.doctor[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{conv.doctor}</p>
                          <span className="text-xs text-zinc-500">{conv.time}</span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                          {conv.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => router.push("/conversations")}
              >
                <Icons.messageSquare className="mr-2 h-4 w-4" />
                Consult About New Symptoms
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Agents Card */}
        <Card className="col-span-1 lg:col-span-3 border-none shadow-sm">
          <CardHeader className="bg-white dark:bg-zinc-900 pb-2">
            <CardTitle>AI Health Assistants</CardTitle>
            <CardDescription>Personalized health insights</CardDescription>
          </CardHeader>
          <CardContent className="bg-white dark:bg-zinc-900 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div 
                  key={agent.id} 
                  className="flex flex-col p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => handleAgentClick(agent.route)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2">
                      {agent.icon}
                    </div>
                    {agent.isNew && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                        New
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{agent.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{agent.description}</p>
                  <Link href={agent.route} className="mt-auto self-start" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      Open
                      <Icons.chevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 