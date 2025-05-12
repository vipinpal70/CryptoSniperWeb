import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function History() {
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedAsset, setSelectedAsset] = useState("all");
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date | undefined>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // 7 days ago
  const [selectedDateTo, setSelectedDateTo] = useState<Date | undefined>(new Date());
  
  // Fetch portfolio history
  const { data: portfolioHistory, isLoading } = useQuery({
    queryKey: ["/api/portfolio/history"],
  });

  // Format data for charts
  const chartData = React.useMemo(() => {
    if (!Array.isArray(portfolioHistory)) return [];
    
    return portfolioHistory.map((snapshot: any) => ({
      date: format(new Date(snapshot.timestamp), "MMM dd"),
      value: snapshot.totalValue,
      btcValue: snapshot.btcValue ? snapshot.btcValue * 30000 : 0, // Approximate conversion for visualization
    })).reverse();
  }, [portfolioHistory]);

  // Mock transactions data for the history view
  // NOTE: In a real app, this would come from an API call
  const recentTransactions = [
    { id: 1, type: "BUY", symbol: "BTC", amount: 0.05, price: 30000, time: "2023-05-15T10:30:00Z", exchange: "Bybit" },
    { id: 2, type: "SELL", symbol: "ETH", amount: 1.2, price: 2200, time: "2023-05-14T15:45:00Z", exchange: "Binance" },
    { id: 3, type: "BUY", symbol: "SOL", amount: 10, price: 120, time: "2023-05-12T08:20:00Z", exchange: "Bybit" },
    { id: 4, type: "SELL", symbol: "BTC", amount: 0.02, price: 31000, time: "2023-05-10T11:15:00Z", exchange: "Bybit" },
    { id: 5, type: "BUY", symbol: "ETH", amount: 0.5, price: 2150, time: "2023-05-08T09:30:00Z", exchange: "Binance" },
  ];

  // Handle time range selection
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    
    const now = new Date();
    let fromDate;
    
    switch (range) {
      case "24h":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7days":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1year":
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    setSelectedDateFrom(fromDate);
    setSelectedDateTo(now);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "MMM dd, yyyy");
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">History</h1>
            <p className="text-neutral-500">Track your trading performance and portfolio history over time</p>
          </div>
          
          <Tabs defaultValue="performance" className="mb-6">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Portfolio Performance</h2>
                    <p className="text-neutral-500 text-sm">Track your portfolio value over time</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant={timeRange === "24h" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTimeRangeChange("24h")}
                      >
                        24H
                      </Button>
                      <Button 
                        variant={timeRange === "7days" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTimeRangeChange("7days")}
                      >
                        7D
                      </Button>
                      <Button 
                        variant={timeRange === "30days" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTimeRangeChange("30days")}
                      >
                        30D
                      </Button>
                      <Button 
                        variant={timeRange === "90days" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTimeRangeChange("90days")}
                      >
                        90D
                      </Button>
                      <Button 
                        variant={timeRange === "1year" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleTimeRangeChange("1year")}
                      >
                        1Y
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(selectedDateFrom)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateFrom}
                            onSelect={setSelectedDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <span className="text-neutral-500">to</span>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-[130px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(selectedDateTo)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDateTo}
                            onSelect={setSelectedDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
                  <div className="w-full lg:w-auto">
                    <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Assets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                        <SelectItem value="sol">Solana (SOL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4 min-w-[160px]">
                      <p className="text-sm text-neutral-500 mb-1">Total Value</p>
                      <p className="text-xl font-semibold">${isLoading ? "Loading..." : portfolioHistory?.[0]?.totalValue.toFixed(2) || "0.00"}</p>
                    </div>
                    
                    <div className="bg-white border border-neutral-200 rounded-lg p-4 min-w-[160px]">
                      <p className="text-sm text-neutral-500 mb-1">Total ROI</p>
                      <p className="text-xl font-semibold text-green-500">+3.94%</p>
                    </div>
                    
                    <div className="bg-white border border-neutral-200 rounded-lg p-4 min-w-[160px]">
                      <p className="text-sm text-neutral-500 mb-1">BTC Value</p>
                      <p className="text-xl font-semibold">{isLoading ? "Loading..." : portfolioHistory?.[0]?.btcValue.toFixed(6) || "0.00"} BTC</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">Loading chart data...</div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} 
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">No chart data available</div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profit/Loss By Asset</h2>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="USD Value" 
                        stroke="hsl(var(--primary))" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="btcValue" 
                        name="BTC Value (in USD)" 
                        stroke="hsl(var(--destructive))" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recent Transactions</h2>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Exchanges" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exchanges</SelectItem>
                      <SelectItem value="bybit">Bybit</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Type</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Symbol</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Amount</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Price</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Value</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Exchange</th>
                        <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                              tx.type === "BUY" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {tx.type}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">{tx.symbol}</td>
                          <td className="px-6 py-4">{tx.amount}</td>
                          <td className="px-6 py-4">${tx.price.toFixed(2)}</td>
                          <td className="px-6 py-4 font-medium">${(tx.amount * tx.price).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                              {tx.exchange}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-neutral-500">
                            {format(new Date(tx.time), "MMM dd, yyyy HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {recentTransactions.length === 0 && (
                  <div className="p-8 text-center text-neutral-500">
                    No transaction history found
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
