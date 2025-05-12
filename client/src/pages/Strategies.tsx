import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

type StrategyViewType = "all" | "deployed" | "marketplace";

export default function Strategies() {
  const [viewType, setViewType] = useState<StrategyViewType>("all");
  
  // Fetch strategies based on view type
  const { data: strategies, isLoading } = useQuery({
    queryKey: [viewType === "deployed" ? "/api/strategies/deployed" : "/api/strategies"],
    enabled: viewType !== "marketplace", // Don't fetch for marketplace
  });
  
  // Mock data for charts
  const mockChartData = [
    { month: "Apr", value: 0 },
    { month: "May", value: 35000 },
    { month: "Jun", value: 25000 },
    { month: "Jul", value: 60000 },
    { month: "Aug", value: 40000 },
    { month: "Sep", value: 45000 },
    { month: "Oct", value: 50000 },
    { month: "Nov", value: 35000 },
    { month: "Dec", value: 55000 },
    { month: "Jan", value: 45000 },
    { month: "Feb", value: 52000 },
    { month: "Mar", value: 48000 },
    { month: "Apr", value: 55000 },
  ];
  
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Strategies</h1>
          </div>
          
          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm bg-neutral-100 p-1" role="group">
              <Button
                variant={viewType === "all" ? "secondary" : "ghost"}
                onClick={() => setViewType("all")}
                className={viewType === "all" ? "text-white" : "text-neutral-700"}
              >
                All Strategies
              </Button>
              <Button
                variant={viewType === "deployed" ? "secondary" : "ghost"}
                onClick={() => setViewType("deployed")}
                className={viewType === "deployed" ? "text-white" : "text-neutral-700"}
              >
                Deployed Strategies
              </Button>
              <Button
                variant={viewType === "marketplace" ? "secondary" : "ghost"}
                onClick={() => setViewType("marketplace")}
                className={viewType === "marketplace" ? "text-white" : "text-neutral-700"}
              >
                Marketplace
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">Loading strategies...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Render strategies based on view type */}
              {viewType !== "deployed" ? (
                // All strategies or marketplace view
                Array.isArray(strategies) && strategies.map((strategy: any, index: number) => (
                  <Card key={strategy.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold mb-3">{strategy.name}</h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <div className="text-xs text-neutral-500">Max DD:</div>
                          <div className="text-sm font-medium text-red-500">{strategy.maxDrawdown || 0}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">Margin:</div>
                          <div className="text-sm font-medium text-green-500">$ {strategy.margin || 0}</div>
                        </div>
                      </div>
                      
                      <div className="h-28 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockChartData}>
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="hsl(var(--primary))" 
                              fillOpacity={1} 
                              fill={`url(#gradient-${index})`} 
                            />
                            {index === 1 && (
                              <>
                                <ReferenceLine 
                                  x="Mar" 
                                  stroke="hsl(var(--primary))" 
                                  strokeDasharray="3 3" 
                                />
                                <Tooltip />
                              </>
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <Button 
                        variant={strategy.isDeployed ? "default" : "outline"}
                        className="w-full"
                      >
                        Deploy
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Deployed strategies view
                Array.isArray(strategies) && strategies.map((strategy: any) => (
                  <Card key={strategy.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold mb-5">{strategy.name}</h3>
                      
                      {strategy.config?.instruments && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {strategy.config.instruments.map((instrument: { name: string }, i: number) => (
                            <div key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-800">
                              {instrument.name}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        {strategy.config?.startTime && (
                          <div>
                            <div className="font-medium mb-1">Start Time:</div>
                            <div className="text-green-600">{strategy.config.startTime}</div>
                          </div>
                        )}
                        
                        {strategy.config?.endTime && (
                          <div>
                            <div className="font-medium mb-1">End Time:</div>
                            <div className="text-red-500">{strategy.config.endTime}</div>
                          </div>
                        )}
                        
                        {strategy.config?.segmentType && (
                          <div>
                            <div className="font-medium mb-1">Segment Type:</div>
                            <div>{strategy.config.segmentType}</div>
                          </div>
                        )}
                        
                        {strategy.config?.strategyType && (
                          <div>
                            <div className="font-medium mb-1">Strategy Type:</div>
                            <div>{strategy.config.strategyType}</div>
                          </div>
                        )}
                      </div>
                      
                      <Button variant="default" className="w-full">
                        View Report
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
