import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  CalendarIcon,
  ChevronDownIcon,
  SearchIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast, useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Position {
  positionId: string;
  symbol: string;
  isolated: boolean;
  positionSide: string;
  openTime: number;
  updateTime: number;
  avgPrice: string;
  avgClosePrice: string;
  realisedProfit: string;
  unrealizedProfit: string;
  pnlRatio: string;
  netProfit: string;
  positionAmt: string;
  closePositionAmt: string;
  leverage: number;
  closeAllPositions: boolean;
  positionCommission: string;
  totalFunding: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [symbol, setSymbol] = useState('All');
  const [positionSide, setPositionSide] = useState('All');
  const [leverage, setLeverage] = useState('All');
  const [side, setSide] = useState('All');
  const [features, setFeatures] = useState('All');
  const [type, setType] = useState('All');
  const [marginSource, setMarginSource] = useState('All');
  const [margin, setMargin] = useState('All');
  const [filteredData, setFilteredData] = useState<Position[]>([]);

  // Query for fetching position history
  const { data: positionHistory = [], isLoading } = useQuery({
    queryKey: ['position-history'],
    queryFn: async () => {
      try {
        if (!user?.email) return [];
        const BASE_URL = import.meta.env.VITE_API_URL;

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Debug logs
        console.log('Session data:', session);
        console.log('Session error:', sessionError);

        if (!session || sessionError) {
          console.error('No active session or session error:', sessionError);
          throw new Error(sessionError?.message || "No active session");
        }

        const buildApiUrl = (path: string): string => {
          // Remove any leading slashes from the path to prevent double slashes
          const cleanPath = path.replace(/^\/+/, '');
          const BASE_URL = import.meta.env.VITE_API_URL || '';
          
          if (BASE_URL.startsWith('http')) {
            // If base URL is a full URL, ensure it ends with exactly one slash
            const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
            return `${base}/${cleanPath}`;
          }
          
          // For relative URLs, ensure BASE_URL starts with exactly one slash
          const base = BASE_URL.startsWith('/') ? BASE_URL : `/${BASE_URL}`;
          const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
          return `${window.location.origin}${cleanBase}/${cleanPath}`;
        }

        const url = buildApiUrl(`/api/positions?email=${encodeURIComponent(user.email)}`);
        const headers = {
          "accept": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        };

        console.log('Making request to:', url);
        console.log('With headers:', headers);

        const response = await fetch(url, {
          method: "POST",
          headers,
          credentials: 'include',
          body: JSON.stringify({ symbols: ["BTC-USDT", "ETH-USDT", "SOL-USDT"] }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          console.error('Failed to fetch positions:', errorMessage);
          throw new Error(errorMessage);
        }
        const data = await response.json();
        console.log('Positions data:', data);
        return data;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch positions';
        throw new Error(errorMessage);
      }
    },
    enabled: !!user?.email,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Filter positions based on selected criteria
  useEffect(() => {
    let filtered = [...positionHistory];

    if (symbol !== 'All') {
      filtered = filtered.filter(position => position.symbol === symbol);
    }

    if (positionSide !== 'All') {
      filtered = filtered.filter(position => position.positionSide === positionSide);
    }

    if (leverage !== 'All') {
      filtered = filtered.filter(position => position.leverage === parseInt(leverage));
    }

    if (startDate) {
      filtered = filtered.filter(position => position.openTime >= startDate.getTime());
    }

    if (endDate) {
      filtered = filtered.filter(position => position.openTime <= endDate.getTime());
    }

    setFilteredData(filtered);
  }, [JSON.stringify(positionHistory), symbol, positionSide, leverage, startDate?.getTime(), endDate?.getTime()]);

  const formatDate = (timestamp: number) => {
    if (isNaN(timestamp) || typeof timestamp !== 'number') {
      return 'Invalid Date'; // Or handle as appropriate
    }
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };

  const getSymbols = (): string[] => {
    const symbols = new Set<string>(positionHistory.map((position: { symbol: string; }) => position.symbol));
    return ['All', ...Array.from(symbols)];
  };

  const getLeverages = (): string[] => {
    const leverages = new Set<string>(positionHistory.map((position: Position) => position.leverage.toString()));
    return ['All', ...Array.from(leverages)];
  };


  // Handle date changes with validation
  const handleStartDateChange = (date: Date | undefined) => {
    if (date && endDate && date > endDate) {
      toast({
        title: "Invalid date range",
        description: "Start date cannot be after end date",
        variant: "destructive"
      });
      return;
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date && startDate && date < startDate) {
      toast({
        title: "Invalid date range",
        description: "End date cannot be before start date",
        variant: "destructive"
      });
      return;
    }
    setEndDate(date);
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

          {isLoading ? (
            <Card className="p-6">
              <div className="flex items-center justify-center h-64">
                <p>Loading position history...</p>
              </div>
            </Card>
          ) : filteredData.length === 0 ? (
            <Card className="p-6">
              <div className="flex items-center justify-center h-64">
                <p>No positions found</p>
              </div>
            </Card>
          ) : (
            <div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2 items-center">
                  <div className="text-sm text-gray-500">Time</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 gap-1 px-2 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}</span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 gap-1 px-2 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}</span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateChange}
                        disabled={date => {
                          // Disable dates that are before the start date
                          return startDate ? date < startDate : false
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-sm text-gray-500">Symbol:</div>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSymbols().map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="text-sm text-gray-500">Side:</div>
                  <Select value={positionSide} onValueChange={setPositionSide}>
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="LONG">LONG</SelectItem>
                      <SelectItem value="SHORT">SHORT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="text-sm text-gray-500">Leverage:</div>
                  <Select value={leverage} onValueChange={setLeverage}>
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      {getLeverages().map(l => <SelectItem key={l} value={l}>{l}x</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Trading History Table */}
              <div className="bg-white rounded-lg shadow overflow-x-auto p-4 md:p-6">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-50 text-gray-600 text-left">
                      <th className="py-3 px-4 font-medium">Filled Time</th>
                      <th className="py-3 px-4 font-medium">Futures Direction</th>
                      <th className="py-3 px-4 font-medium">Filled</th>
                      <th className="py-3 px-4 font-medium">Filled Price</th>
                      <th className="py-3 px-4 font-medium">Realised P&L ($)</th>
                      <th className="py-3 px-4 font-medium">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row) => {
                        // Parse the date parts
                        const dateParts = formatDate(row.updateTime).split(' ');
                        const date = dateParts[0];
                        const time = dateParts[1];

                        // Determine PnL color - green for positive, red for negative
                        const isPnlPositive = parseFloat(row.realisedProfit) >= 0;
                        const pnlColor = isPnlPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';

                        return (
                          <tr key={row.positionId} className="border-t border-gray-100">
                            <td className="py-3 px-4">
                              <div>{date}</div>
                              <div className="text-sm text-gray-500">{time}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-1 h-8 bg-blue-500 mr-2 rounded-sm"></div>
                                <div>
                                  <div>{row.symbol}</div>
                                  <div className={`text-sm text-gray-500 ${row.positionSide === 'LONG' ? 'text-green-600' : 'text-red-600'}`}>Closed {row.positionSide} {row.leverage}X</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{row.positionAmt} {row.symbol.split("-")[0]}</td>
                            <td className="py-3 px-4">{parseFloat(row.avgPrice).toFixed(3)}</td>
                            <td className="py-3 px-4">
                              <div>{parseFloat(row.realisedProfit).toFixed(3)} {row.symbol.split("-")[1]}</div>
                              {/* PnL percentage is not available in Position interface */}
                              <div className={`text-xs px-2 py-0.5 rounded-sm inline-block ${pnlColor}`}>
                                {(parseFloat(row.realisedProfit) / parseFloat(row.positionAmt)).toFixed(2) + '%'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-neutral-500">${Math.abs(parseFloat(row.positionCommission)).toFixed(3)} {row.symbol.split("-")[1]}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 px-4 text-center text-gray-500">
                          No trading history found for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
