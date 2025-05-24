import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

type StrategyViewType = "all" | "deployed" | "marketplace";

interface Strategy {
    _id: string;
    name: string;
    type: string;
    leverage: string;
    margin: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

export default function Strategies() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [viewType, setViewType] = useState<StrategyViewType>("all");
    const [deployedStrategyNames, setDeployedStrategyNames] = useState<string[]>(() => {
        // Initialize from localStorage if available
        const cached = localStorage.getItem(`deployed_strategies_${user?.email}`);
        return cached ? JSON.parse(cached) : [];
    });

    // Handle strategy activation/deactivation
    const handleStrategyToggle = async (strategyName: string) => {
        if (!user?.email) {
            console.error('No user email found, cannot toggle strategy');
            toast({
                title: "Authentication Required",
                description: "Please log in to activate strategies.",
                variant: "destructive"
            });
            return;
        }

        // Check if broker is added by checking sessionStorage
        const brokerName = sessionStorage.getItem("broker_name");

        if (!brokerName) {
            toast({
                title: "Broker Required",
                description: "Please add your Broker first before activating strategies.",
                variant: "destructive"
            });
            return;
        }

        try {
            const baseUrl = import.meta.env.VITE_API_URL || "http://13.235.231.163:8000";
            // Create URL with query parameters for the API
            const url = new URL('/api/add-strategy', baseUrl);

            // Add the query parameters
            url.searchParams.append('email', user.email);
            url.searchParams.append('strategy_name', strategyName);

            console.log('Sending request to:', url.toString());

            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Strategy toggle result:', result);

            // Immediately update the deployedStrategyNames state
            if (deployedStrategyNames.includes(strategyName)) {
                // If it was already deployed, remove it
                const updatedNames = deployedStrategyNames.filter(name => name !== strategyName);
                setDeployedStrategyNames(updatedNames);

                // Update localStorage
                if (user?.email) {
                    localStorage.setItem(`deployed_strategies_${user.email}`, JSON.stringify(updatedNames));
                }

                // Show success message for deactivation
                toast({
                    title: "Strategy Deactivated",
                    description: `Successfully removed strategy: ${strategyName}`,
                    variant: "default"
                });
            } else {
                // If it wasn't deployed, add it
                const updatedNames = [...deployedStrategyNames, strategyName];
                setDeployedStrategyNames(updatedNames);

                // Update localStorage
                if (user?.email) {
                    localStorage.setItem(`deployed_strategies_${user.email}`, JSON.stringify(updatedNames));
                }

                // Show success message for activation
                toast({
                    title: "Strategy Activated",
                    description: `Successfully added strategy: ${strategyName}`,
                    variant: "default"
                });
            }

            // Refetch both queries to update the UI
            query.refetch();
            deployedStrategiesQuery.refetch();

        } catch (error) {
            console.error('Error toggling strategy:', error);
            toast({
                title: "Activation Failed",
                description: error instanceof Error ? error.message : "Failed to activate strategy. Please try again.",
                variant: "destructive"
            });
        }
    };

    // Fetch strategies based on view type
    const queryOptions = {
        queryKey: [
            viewType === "deployed" ? "deployed-strategies" : "strategies",
            user?.email
        ] as const,
        queryFn: async (): Promise<Array<Strategy>> => {
            console.log('Fetching strategies with viewType:', viewType);

            if (viewType === "deployed") {
                if (!user?.email) {
                    console.log('No user email found, skipping deployed strategies fetch');
                    return [];
                }

                try {
                    // First check if we have a valid API URL
                    const baseUrl = import.meta.env.VITE_API_URL || "http://13.235.231.163:8000";
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

                    return deployedStrategies.map((strategy: Strategy) => ({
                        ...strategy,
                        isDeployed: true
                    }));
                } catch (err) {
                    console.error('Error in deployed strategies fetch:', err);
                    throw err;
                }
            } else {
                try {
                    const baseurl = import.meta.env.VITE_API_URL || "http://13.235.231.163:8000";
                    const url = new URL('/api/strategies', baseurl);
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
    const query = useQuery<Array<Strategy>, Error>(queryOptions);

    // Query to get deployed strategies to check which strategies are already deployed
    const deployedStrategiesQuery = useQuery<Array<Strategy>, Error>({
        queryKey: ['deployed-strategies-check', user?.email] as const,
        queryFn: async (): Promise<Array<Strategy>> => {
            if (!user?.email) {
                return [];
            }

            try {
                const baseUrl = import.meta.env.VITE_API_URL || "http://13.235.231.163:8000";
                const url = new URL('/api/deployed-strategies', baseUrl);
                url.searchParams.append('email', user.email);

                const response = await fetch(url.toString(), {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch deployed strategies: ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (err) {
                console.error('Error fetching deployed strategies for check:', err);
                return [];
            }
        },
        enabled: !!user?.email
    });

    useEffect(() => {
        if (query.error) {
            console.error('Query error:', query.error);
        }
        console.log('Query settled - data:', query.data, 'error:', query.error);
    }, [query.data, query.error]);

    // Update the list of deployed strategy names whenever deployedStrategiesQuery data changes
    useEffect(() => {
        if (deployedStrategiesQuery.data) {
            const names = deployedStrategiesQuery.data.map(strategy => strategy.name);
            setDeployedStrategyNames(names);

            // Save to localStorage for persistence across reloads
            if (user?.email) {
                localStorage.setItem(`deployed_strategies_${user.email}`, JSON.stringify(names));
            }

            console.log('Deployed strategy names:', names);
        }
    }, [deployedStrategiesQuery.data, user?.email]);

    // Get the raw data from the query
    const { data: rawStrategies, isLoading, error } = query;

    // Filter strategies based on the view type
    const strategies = React.useMemo(() => {
        if (!rawStrategies || !Array.isArray(rawStrategies)) return [];

        if (viewType === "deployed") {
            // For deployed view, show only deployed strategies
            return rawStrategies.filter((strategy: Strategy) =>
                deployedStrategyNames.includes(strategy.name)
            );
        } else if (viewType === "all") {
            // For all view, show all strategies except deployed ones
            return rawStrategies.filter((strategy: Strategy) =>
                !deployedStrategyNames.includes(strategy.name)
            );
        } else {
            // For marketplace view, also exclude deployed strategies
            return rawStrategies.filter((strategy: Strategy) =>
                !deployedStrategyNames.includes(strategy.name)
            );
        }
    }, [rawStrategies, viewType, deployedStrategyNames]);

    console.log('Current state:', {
        rawStrategies,
        filteredStrategies: strategies,
        isLoading,
        error,
        viewType,
        userEmail: user?.email,
        deployedStrategyNames
    });

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
                                className={viewType === "all" ? "text-white" : "text-neutral-700 m-2"}
                            >
                                All Strategies
                            </Button>
                            <Button
                                variant={viewType === "deployed" ? "secondary" : "ghost"}
                                onClick={() => setViewType("deployed")}
                                className={viewType === "deployed" ? "text-white" : "text-neutral-700 m-2"}
                            >
                                Deployed Strategies
                            </Button>
                            <Button
                                variant={viewType === "marketplace" ? "secondary" : "ghost"}
                                onClick={() => setViewType("marketplace")}
                                className={viewType === "marketplace" ? "text-white" : "text-neutral-700 m-2"}
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
                                strategies.map((strategy, index: number) => (
                                    // <Card key={strategy._id} className="overflow-hidden border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                    //   <CardContent className="p-5">
                                    //     <div className="flex justify-between items-start mb-2">
                                    //       <h3 className="text-lg font-semibold">{strategy.name}</h3>
                                    //       <span className={`text-xs px-2 py-1 rounded-full ${strategy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    //         {strategy.is_active ? 'Active' : 'Inactive'}
                                    //       </span>
                                    //     </div>

                                    //     <div className="grid grid-cols-2 gap-3 mb-4">
                                    //       <div>
                                    //         <div className="text-xs text-neutral-500">Type:</div>
                                    //         <div className="text-sm font-medium">{strategy.type}</div>
                                    //       </div>
                                    //       <div>
                                    //         <div className="text-xs text-neutral-500">Leverage:</div>
                                    //         <div className="text-sm font-medium">{strategy.leverage}</div>
                                    //       </div>
                                    //       <div>
                                    //         <div className="text-xs text-neutral-500">Margin:</div>
                                    //         <div className="text-sm font-medium">${strategy.margin}</div>
                                    //       </div>
                                    //       <div>
                                    //         <div className="text-xs text-neutral-500">Created:</div>
                                    //         <div className="text-sm font-medium">{formatDate(strategy.created_at)}</div>
                                    //       </div>
                                    //     </div>

                                    //     <div className="h-28 mb-4">
                                    //       <ResponsiveContainer width="100%" height="100%">
                                    //         <AreaChart data={mockChartData}>
                                    //           <defs>
                                    //             <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    //               <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    //               <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    //             </linearGradient>
                                    //           </defs>
                                    //           <Area
                                    //             type="monotone"
                                    //             dataKey="value"
                                    //             stroke="hsl(var(--primary))"
                                    //             fillOpacity={1}
                                    //             fill={`url(#gradient-${index})`}
                                    //           />
                                    //           <XAxis dataKey="month" hide={true} />
                                    //           <YAxis hide={true} domain={['dataMin - 10000', 'dataMax + 10000']} />
                                    //           <Tooltip />
                                    //         </AreaChart>
                                    //       </ResponsiveContainer>
                                    //     </div>

                                    //     <div className="flex gap-2">
                                    //       <Button variant="outline" className="flex-1">
                                    //         View Details
                                    //       </Button>
                                    //       <Button
                                    //         variant="default"
                                    //         className="flex-1"
                                    //         onClick={() => handleStrategyToggle(strategy.name)}
                                    //       >
                                    //         {deployedStrategyNames.includes(strategy.name) ? 'Deactivate' : 'Activate'}
                                    //       </Button>
                                    //     </div>
                                    //   </CardContent>
                                    // </Card>
                                    <Card key={strategy._id} className="rounded-3xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-0">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-lg font-bold text-gray-900">{strategy.name}</div>
                                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                    +{strategy.growth || '12.4'}%
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-700 mb-3">
                                                A fast-paced Ethereum scalping strategy designed to capture quick, short-term profits. It uses precise indicators and smart execution to exploit small market movements, multiplying capital rapidly through disciplined, high-frequency trades.
                                            </p>

                                            {/* Win Rate */}
                                            <div className="text-sm font-semibold text-gray-800 mb-1 flex justify-between">
                                                <span>Win Rate</span>
                                                <span>{strategy.win_rate || '67.19'}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
                                                <div
                                                    className="h-2 bg-green-500 rounded-full"
                                                    style={{ width: `${strategy.win_rate || 67.19}%` }}
                                                />
                                            </div>

                                            {/* Meta info */}
                                            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-4">
                                                <div>
                                                    <div className="text-gray-500">Start Date:</div>
                                                    <div className="font-semibold">{strategy.start_date || '10/05/2025'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500">Total Trades:</div>
                                                    <div className="font-semibold">{strategy.total_trades || '968'}</div>
                                                </div>
                                            </div>

                                            {/* Button */}
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded-xl">
                                                View Positions
                                            </Button>
                                        </CardContent>
                                    </Card>

                                ))
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
