"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";

const featuredAgents = [
  {
    id: "sleep",
    name: "Sleep Analyzer",
    description: "AI-powered sleep pattern analysis and recommendations",
    icon: <Icons.moon className="h-5 w-5 text-indigo-500" />,
    category: "Wellness",
    isPopular: true,
    route: "/health-agents/sleep",
  },
  {
    id: "eastern",
    name: "Eastern Medicine",
    description: "Traditional healing insights based on ancient practices",
    icon: <Icons.leaf className="h-5 w-5 text-emerald-500" />,
    category: "Alternative",
    isNew: true,
    route: "/health-agents/eastern",
  },
  {
    id: "nutrition",
    name: "Nutrition Coach",
    description: "Personalized diet plans and nutritional guidance",
    icon: <Icons.apple className="h-5 w-5 text-red-500" />,
    category: "Wellness",
    isPopular: true,
    route: "/health-agents/nutrition",
  },
  {
    id: "medication",
    name: "Medication Manager",
    description: "Track medications, get reminders, and check interactions",
    icon: <Icons.pill className="h-5 w-5 text-blue-500" />,
    category: "Medical",
    route: "/health-agents/medication",
  },
];

const allAgents = [
  ...featuredAgents,
  {
    id: "heart",
    name: "Heart Health",
    description: "Monitor cardiovascular metrics and receive personalized advice",
    icon: <Icons.heartPulse className="h-5 w-5 text-red-500" />,
    category: "Medical",
    route: "/health-agents/heart",
  },
  {
    id: "stress",
    name: "Stress Management",
    description: "Techniques and exercises to reduce stress and anxiety",
    icon: <Icons.activity className="h-5 w-5 text-orange-500" />,
    category: "Mental Health",
    route: "/health-agents/stress",
  },
  {
    id: "fitness",
    name: "Fitness Trainer",
    description: "Custom workout plans based on your health data and goals",
    icon: <Icons.activity className="h-5 w-5 text-blue-500" />,
    category: "Wellness",
    route: "/health-agents/fitness",
  },
  {
    id: "symptom",
    name: "Symptom Checker",
    description: "Analyze symptoms and get preliminary insights",
    icon: <Icons.stethoscope className="h-5 w-5 text-purple-500" />,
    category: "Medical",
    isPopular: true,
    route: "/health-agents/symptom",
  },
  {
    id: "mental",
    name: "Mental Wellness",
    description: "Support for mental health concerns and daily mindfulness",
    icon: <Icons.sparkles className="h-5 w-5 text-indigo-500" />,
    category: "Mental Health",
    route: "/health-agents/mental",
  },
  {
    id: "lab",
    name: "Lab Results Interpreter",
    description: "Understand your lab test results in plain language",
    icon: <Icons.fileText className="h-5 w-5 text-emerald-500" />,
    category: "Medical",
    route: "/health-agents/lab",
  },
];

const categories = [
  { id: "all", name: "All Agents" },
  { id: "medical", name: "Medical" },
  { id: "wellness", name: "Wellness" },
  { id: "mental-health", name: "Mental Health" },
  { id: "alternative", name: "Alternative" },
];

export default function HealthAgentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const router = useRouter();
  
  const filteredAgents = allAgents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
                           agent.category.toLowerCase() === selectedCategory.replace("-", " ");
    return matchesSearch && matchesCategory;
  });

  const handleAgentClick = (route: string) => {
    router.push(route);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Health Agents</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <Icons.plus className="h-4 w-4" />
          Request New Agent
        </Button>
      </div>
      
      <Tabs defaultValue="featured" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="all">All Agents</TabsTrigger>
        </TabsList>
        
        {/* Featured Agents Tab */}
        <TabsContent value="featured" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredAgents.map((agent) => (
              <Card 
                key={agent.id} 
                className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleAgentClick(agent.route)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
                        {agent.icon}
                      </div>
                      <div className="flex gap-2">
                        {agent.isNew && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">
                            New
                          </Badge>
                        )}
                        {agent.isPopular && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{agent.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-grow">
                      {agent.description}
                    </p>
                    <div className="mt-auto">
                      <Link href={agent.route} className="w-full">
                        <Button className="w-full">
                          Start Conversation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* All Agents Tab */}
        <TabsContent value="all" className="mt-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Icons.search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search agents..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {filteredAgents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAgents.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAgentClick(agent.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
                            {agent.icon}
                          </div>
                          <div className="flex gap-2">
                            {agent.isNew && (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">
                                New
                              </Badge>
                            )}
                            {agent.isPopular && (
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="font-medium text-lg mb-2">{agent.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-grow">
                          {agent.description}
                        </p>
                        <div className="mt-auto flex gap-2">
                          <Link href={`${agent.route}/about`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" className="w-full">
                              Learn More
                            </Button>
                          </Link>
                          <Link href={agent.route} className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Button className="w-full">
                              Start
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Icons.search className="h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No agents found</h3>
                <p className="text-zinc-500 text-center max-w-md">
                  We couldn't find any health agents matching your search criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
} 