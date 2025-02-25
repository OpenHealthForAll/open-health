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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const dataSources = [
  {
    id: "apple-health",
    name: "Apple Health",
    status: "connected",
    lastSync: "Today, 10:23 AM",
    icon: <Icons.apple className="h-5 w-5 text-zinc-700" />,
    metrics: ["Steps", "Heart Rate", "Sleep", "Activity"],
  },
  {
    id: "fitbit",
    name: "Fitbit",
    status: "connected",
    lastSync: "Yesterday, 8:45 PM",
    icon: <Icons.activity className="h-5 w-5 text-blue-500" />,
    metrics: ["Steps", "Sleep Quality", "Exercise"],
  },
  {
    id: "google-fit",
    name: "Google Fit",
    status: "disconnected",
    icon: <Icons.google className="h-5 w-5 text-red-500" />,
    metrics: ["Activity", "Steps", "Heart Points"],
  },
  {
    id: "hospital",
    name: "Memorial Hospital",
    status: "pending",
    icon: <Icons.building2 className="h-5 w-5 text-emerald-500" />,
    metrics: ["Lab Results", "Prescriptions", "Visits"],
  },
];

const insights = [
  {
    id: "1",
    title: "Sleep Pattern Analysis",
    description: "Your sleep quality has improved by 15% over the last month.",
    date: "2 days ago",
    icon: <Icons.moon className="h-5 w-5 text-indigo-500" />,
  },
  {
    id: "2",
    title: "Activity Recommendation",
    description: "Based on your heart rate data, we recommend increasing moderate exercise by 10 minutes daily.",
    date: "1 week ago",
    icon: <Icons.heartPulse className="h-5 w-5 text-red-500" />,
  },
  {
    id: "3",
    title: "Medication Reminder",
    description: "Your prescription refill for Lisinopril is due in 5 days.",
    date: "3 days ago",
    icon: <Icons.pill className="h-5 w-5 text-blue-500" />,
  },
];

const dataCategories = [
  {
    id: "symptoms",
    name: "Symptoms",
    icon: <Icons.stethoscope className="h-5 w-5 text-red-500" />,
    description: "Record new symptoms or health concerns",
  },
  {
    id: "measurements",
    name: "Measurements",
    icon: <Icons.ruler className="h-5 w-5 text-blue-500" />,
    description: "Add weight, blood pressure, glucose readings",
  },
  {
    id: "documents",
    name: "Documents",
    icon: <Icons.fileText className="h-5 w-5 text-emerald-500" />,
    description: "Upload medical records, lab results, prescriptions",
  },
  {
    id: "personal",
    name: "Personal Info",
    icon: <Icons.user className="h-5 w-5 text-purple-500" />,
    description: "Update allergies, conditions, medications",
  },
];

export default function HealthDataPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Health Data</h1>
        <Button className="gap-2">
          <Icons.plus className="h-4 w-4" />
          Connect New Source
        </Button>
      </div>

      <Tabs defaultValue="sources" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="add">Add Data</TabsTrigger>
        </TabsList>
        
        {/* Data Sources Tab */}
        <TabsContent value="sources" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {dataSources.map((source) => (
              <Card key={source.id} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2">
                      {source.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      {source.status === "connected" && (
                        <CardDescription>{source.lastSync}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={
                      source.status === "connected" 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300" 
                        : source.status === "pending" 
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  >
                    {source.status === "connected" ? "Connected" : source.status === "pending" ? "Pending" : "Disconnected"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {source.status === "connected" ? (
                    <>
                      <div className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">Synced metrics:</div>
                      <div className="flex flex-wrap gap-2">
                        {source.metrics.map((metric) => (
                          <Badge key={metric} variant="outline" className="bg-transparent">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </div>
                    </>
                  ) : source.status === "pending" ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Icons.clock className="mb-2 h-8 w-8 text-amber-500" />
                      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Request sent. Waiting for approval from provider.
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Check Status
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Button className="mt-2">
                        Connect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-none shadow-sm border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3 mb-4">
                  <Icons.plus className="h-6 w-6 text-zinc-500" />
                </div>
                <h3 className="font-medium mb-2">Add More Sources</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4">
                  Connect with hospitals, wearables, and health apps
                </p>
                <Button variant="outline">
                  Browse Sources
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Health Insights</CardTitle>
              <CardDescription>
                Personalized insights based on your health data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id} 
                      className="flex gap-4 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2 h-fit">
                        {insight.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{insight.title}</h3>
                          <span className="text-xs text-zinc-500">{insight.date}</span>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add Data Tab */}
        <TabsContent value="add" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {dataCategories.map((category) => (
              <Card 
                key={category.id} 
                className="border-none shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{category.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      {category.description}
                    </p>
                    <Button variant="ghost" size="sm" className="gap-1">
                      Add {category.name}
                      <Icons.arrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
} 