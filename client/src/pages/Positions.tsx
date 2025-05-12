import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function Positions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exchangeFilter, setExchangeFilter] = useState("all");
  
  // Fetch positions
  const { data: positions, isLoading } = useQuery({
    queryKey: ["/api/positions"],
  });
  
  // Filter positions based on search query and exchange filter
  const filteredPositions = React.useMemo(() => {
    if (!Array.isArray(positions)) return [];
    
    return positions.filter((position: any) => {
      const matchesSearch = 
        !searchQuery || 
        position.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        position.exchange.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesExchange = 
        exchangeFilter === "all" || 
        position.exchange.toLowerCase() === exchangeFilter.toLowerCase();
      
      return matchesSearch && matchesExchange;
    });
  }, [positions, searchQuery, exchangeFilter]);
  
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Positions</h1>
          </div>
          
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto">
                <Select value={exchangeFilter} onValueChange={setExchangeFilter}>
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
              
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full sm:w-64 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-5 h-5 text-neutral-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-8 text-center">Loading positions...</div>
            ) : filteredPositions.length === 0 ? (
              <div className="p-8 text-center">No positions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Contract</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Exchange</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Value</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Entry price</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Mark price</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Unrealised P&L (%)</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Realised P&L (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredPositions.map((position: any) => (
                      <tr key={position.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-full w-1 bg-primary rounded-r mr-2"></div>
                            <div>
                              <div className="font-medium">{position.symbol}</div>
                              <div className="text-xs text-neutral-500">
                                {position.isIsolated ? "Isolated" : "Cross"} {position.leverage}x
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                            {position.exchange}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{position.value.toFixed(2)} USDT</td>
                        <td className="px-6 py-4 font-medium">{position.entryPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium">{position.markPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{position.unrealizedPnl.toFixed(2)} USDT</div>
                          <div className={`text-xs font-medium ${position.unrealizedPnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {position.unrealizedPnlPercentage >= 0 ? '+' : ''}{position.unrealizedPnlPercentage.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{position.realizedPnl.toFixed(2)} USDT</div>
                          <div className={`text-xs font-medium ${position.realizedPnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {position.realizedPnlPercentage >= 0 ? '+' : ''}{position.realizedPnlPercentage.toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
