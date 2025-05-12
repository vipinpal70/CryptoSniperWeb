import React from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { BarChart3, Zap } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  // Fetch portfolio data
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ["/api/portfolio"],
    staleTime: 60000, // 1 minute
  });
  
  const mockChartData = [
    { date: "Jan", btc: 0, usd: -5 },
    { date: "Feb", btc: 2, usd: -3 },
    { date: "Mar", btc: -2, usd: -7 },
    { date: "Apr", btc: 5, usd: 3 },
    { date: "May", btc: 3, usd: 0 },
    { date: "Jun", btc: 7, usd: 5 },
    { date: "Jul", btc: 4, usd: 2 },
  ];
  
  // Extract asset data from portfolio
  const assetData = portfolioData?.assets ? 
    Object.entries(portfolioData.assets).map(([symbol, data]: [string, any]) => ({
      symbol,
      percentage: data.percentage,
      value: data.value
    })) : [];
  
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Hi, {user?.name || "there"}!</h1>
            <p className="text-neutral-500">Hey, Trade Smarter, Execute Faster- Powering your Crypto Strategies!</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center space-x-3 mb-3 md:mb-0">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="8" fill="#0055FF" fillOpacity="0.1"/>
                  <path d="M13 32L19 20L24 26L35 15" stroke="#0055FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 25L19 13L24 19L35 8" stroke="#0055FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-semibold">BingX</span>
              </div>
              <div className="bg-neutral-100 px-3 py-1 rounded text-sm font-mono">5766104980</div>
            </div>
            
            <div className="flex space-x-3">
              <div className="flex items-center space-x-1.5 bg-blue-50 text-neutral-800 px-3 py-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Broker Performance</div>
                  <div className="font-semibold">$0.00</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5 bg-primary text-white px-3 py-2 rounded-lg">
                <Zap className="w-5 h-5" />
                <div>
                  <div className="text-xs">Run All</div>
                  <div className="flex items-center">
                    <span className="mr-2">Off</span>
                    <div className="relative inline-block w-8 h-4 rounded-full bg-blue-800">
                      <input type="checkbox" className="sr-only" id="toggle-run-all" defaultChecked />
                      <span className="block absolute left-4 top-1 w-2 h-2 rounded-full bg-white transition-transform duration-200 ease-in-out"></span>
                    </div>
                    <span className="ml-2">On</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Overview Card */}
            <Card className="col-span-1 lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Total Value</h2>
                </div>
                
                <div>
                  <div className="text-3xl font-semibold">
                    {isLoadingPortfolio ? "Loading..." : `${portfolioData?.totalValue?.toFixed(2) || "0.00"} `}
                    <span className="text-sm font-normal text-neutral-500">USD</span>
                  </div>
                  <div className="text-sm text-neutral-500">
                    ≈{isLoadingPortfolio ? "Loading..." : `${portfolioData?.btcValue || "0.00"} BTC`}
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="font-medium">Cumulative ROI</h3>
                    </div>
                    <div className="text-lg font-semibold text-green-500">+3.94%</div>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <Button variant="default" size="sm" className="text-xs h-7 px-2.5 rounded-full">7 days</Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 rounded-full">30 days</Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 rounded-full">Custom</Button>
                    
                    <div className="ml-auto flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-medium">BTC</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-neutral-100">
                        <span className="text-xs font-medium text-neutral-600">USD</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Chart */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={mockChartData}
                        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="btc"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="usd"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* P&L Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Total P&L</h2>
                  <div className="text-2xl font-semibold text-primary">$ 0.00</div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium flex items-center mb-4">
                      Assets Distribution
                    </h3>
                    
                    <div className="h-2 bg-neutral-100 rounded-full mb-4 flex overflow-hidden">
                      {assetData.map((asset, index) => (
                        <div 
                          key={asset.symbol}
                          className={`h-full ${
                            index % 6 === 0 ? "bg-red-400" :
                            index % 6 === 1 ? "bg-purple-400" :
                            index % 6 === 2 ? "bg-pink-400" :
                            index % 6 === 3 ? "bg-green-400" :
                            index % 6 === 4 ? "bg-yellow-400" :
                            "bg-blue-400"
                          }`} 
                          style={{ width: `${asset.percentage}%` }}
                        ></div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {assetData.map((asset, index) => (
                        <div key={asset.symbol} className="flex items-center p-2 rounded bg-neutral-50">
                          <div 
                            className={`w-2 h-2 rounded-full mr-2 ${
                              index % 6 === 0 ? "bg-red-400" :
                              index % 6 === 1 ? "bg-purple-400" :
                              index % 6 === 2 ? "bg-pink-400" :
                              index % 6 === 3 ? "bg-green-400" :
                              index % 6 === 4 ? "bg-yellow-400" :
                              "bg-blue-400"
                            }`}
                          ></div>
                          <div className="mr-auto">{asset.symbol}</div>
                          <div className="text-neutral-500">{asset.percentage}% • {asset.value.toFixed(2)} USD</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
