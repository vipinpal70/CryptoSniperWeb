import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
import StrategyCard from "@/components/StrategyCard";

type StrategyViewType = "all" | "deployed" | "marketplace";

export default function Strategies() {
  const { user } = useAuth();
  const [viewType, setViewType] = useState<StrategyViewType>("all");
  
  // Fetch strategies based on view type
  const queryOptions = {
    queryKey: [viewType === "deployed" ? "deployed-strategies" : "strategies", user?.email] as const,
    queryFn: async (): Promise<Array<Record<string, any>>> => {
      console.log('Fetching strategies with viewType:', viewType);
      
      if (viewType === "deployed") {
        if (!user?.email) {
          console.log('No user email found, skipping deployed strategies fetch');
          return [];
        }
        
        try {
          // First check if we have a valid API URL
          const baseUrl = "http://localhost:8000";
          if (!baseUrl) {
            throw new Error('API base URL is not configured');
          }
          
          const url = new URL('/api/deployed-strategies', baseUrl);
          url.searchParams.append('email', user.email);
          console.log('Fetching deployed strategies from:', url.toString());
          
          const response = await fetch(url.toString(), {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include' // Include cookies if needed
          });
          
          console.log('Deployed strategies response status:', response.status);
          
          // Check content type before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 200)); // Log first 200 chars
            throw new Error(`Expected JSON response but got ${contentType}`);
          }
          
          const deployedStrategies = await response.json();
          
          if (!Array.isArray(deployedStrategies)) {
            console.error('Expected array but got:', deployedStrategies);
            throw new Error('Invalid response format: expected array of strategies');
          }
          
          console.log('Fetched deployed strategies:', deployedStrategies);
          
          // Format the deployed strategies to match the expected format
          return deployedStrategies.map((strategyName: string, index: number) => ({
            id: `deployed-${index}`,
            name: strategyName,
            config: {
              instruments: [{ name: strategyName.split('_').pop() || 'N/A' }],
              startTime: '09:15',
              endTime: '15:30',
              segmentType: 'CRYPTO',
              strategyType: strategyName.split('_')[0] || 'Strategy'
            },
            isDeployed: true
          }));
        } catch (err) {
          console.error('Error in deployed strategies fetch:', err);
          throw err;
        }
      } else {
        try {
          const url = new URL('/api/strategies', "http://localhost:8000");
          console.log('Fetching all strategies from:', url.toString());
          
          const response = await fetch(url.toString());
          console.log('All strategies response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('All strategies error:', errorText);
            throw new Error('Failed to fetch strategies');
          }
          
          const data = await response.json();
          console.log('Fetched all strategies:', data);
          return data;
        } catch (err) {
          console.error('Error in all strategies fetch:', err);
          throw err;
        }
      }
    },
    enabled: viewType !== "marketplace" && (viewType !== "deployed" || !!user?.email)
  };

  // Add event listeners separately
  const query = useQuery<Array<Record<string, any>>, Error>(queryOptions);
  
  useEffect(() => {
    if (query.error) {
      console.error('Query error:', query.error);
    }
    console.log('Query settled - data:', query.data, 'error:', query.error);
  }, [query.data, query.error]);
  
  const { data: strategies, isLoading, error } = query;

  console.log('Current state:', { 
    strategies, 
    isLoading, 
    error, 
    viewType, 
    userEmail: user?.email 
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
  
  // Format strategy name for display
  const formatStrategyName = (name: string) => {
    return name
      .split('_')
      .map(word => {
        if (word === 'SPT') return 'Spot';
        if (word === 'EMA') return 'EMA';
        if (word === 'CROSS') return 'Crossover';
        if (word === 'FRAC') return 'Fractal';
        if (word.endsWith('USDT')) return word.replace('USDT', '');
        return word;
      })
      .join(' ');
  };
  
  // Get strategy type from name
  const getStrategyType = (name: string) => {
    if (name.startsWith('EMA_CROSS')) return 'EMA Crossover';
    if (name.startsWith('FRAC_SPT')) return 'Fractal Spot';
    return 'Strategy';
  };
  
  // Get instrument from strategy name
  const getInstrument = (name: string) => {
    const parts = name.split('_');
    const symbol = parts[parts.length - 1];
    if (symbol.endsWith('USDT')) {
      return symbol.replace('USDT', '/USDT');
    }
    return symbol;
  };
  
  // Render error message if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 md:ml-64 p-6">
          <Header />
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Failed to load strategies. {error.message}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => query.refetch()}
                    className="text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:underline transition duration-150 ease-in-out"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Strategies</h1>
              {isLoading && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              )}
            </div>
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
            <div className="text-center py-12">Loading {viewType === 'deployed' ? 'deployed ' : ''}strategies...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(strategies) && strategies.length > 0 ? (
                strategies.map((strategy: any, index: number) => {
                  const displayName = formatStrategyName(strategy.name);
                  const strategyType = getStrategyType(strategy.name);
                  const instrument = getInstrument(strategy.name);
                  
                  return (
                    <Card key={strategy.id} className="overflow-hidden border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{displayName}</h3>
                          {strategy.isDeployed && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Deployed
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <div className="text-xs text-neutral-500">Strategy Type:</div>
                            <div className="text-sm font-medium">{strategyType}</div>
                          </div>
                          <div>
                            <div className="text-xs text-neutral-500">Instrument:</div>
                            <div className="text-sm font-medium">{instrument}</div>
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
                              <XAxis dataKey="month" hide={true} />
                              <YAxis hide={true} domain={['dataMin - 10000', 'dataMax + 10000']} />
                              <Tooltip />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <Button 
                          variant={strategy.isDeployed ? "default" : "outline"}
                          className="w-full"
                        >
                          {strategy.isDeployed ? 'View Details' : 'Deploy'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-neutral-500">
                    {viewType === "deployed" 
                      ? "No deployed strategies found. Deploy a strategy from the 'All Strategies' tab to get started." 
                      : "No strategies available"}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
