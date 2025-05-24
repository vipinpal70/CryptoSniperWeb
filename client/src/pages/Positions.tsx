import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import Lowheader from "@/components/Lowheader";
import { table } from "console";

interface PositionRowProps {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  leverage: number;
  liquidationPrice: number;
}

// Define PositionRow component before it's used
function PositionRow({ symbol, side, size, entryPrice, markPrice, pnl, pnlPercent, leverage, liquidationPrice }: PositionRowProps) {
  const isProfit = parseFloat(pnl) >= 0;
  const pnlClass = isProfit ? 'text-green-500' : 'text-red-500';
  const pnlBgClass = isProfit ? 'bg-green-50' : 'bg-red-50';
  const sideClass = side === 'LONG' ? 'text-green-500' : 'text-red-500';

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="w-1 h-8 bg-blue-500 mr-2 rounded-sm"></div>
        <div className="font-medium">{symbol}</div>
        <div className="text-xs text-gray-500">Isolated {leverage}x</div>
      </td>
      <td className="py-4 px-4">
        <div className={`flex items-center ${sideClass}`}>
          <div className={`w-4 h-4 rounded-full mr-2 ${side === 'LONG' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{side}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div>{size} {symbol.split('-')[1] || 'USDT'}</div>
      </td>
      <td className="py-4 px-4">
        <div>{parseFloat(entryPrice).toFixed(2)}</div>
      </td>
      <td className="py-4 px-4">
        <div>{parseFloat(markPrice).toFixed(2)}</div>
        {liquidationPrice && (
          <div className="text-xs text-gray-500">Liq: {liquidationPrice.toFixed(2)}</div>
        )}
      </td>
      <td className="py-4 px-4">
        <div className={pnlClass}>
          {isProfit ? '+' : ''}{parseFloat(pnl).toFixed(4)} {symbol.split('-')[1] || 'USDT'}
        </div>
        <div className={`text-xs ${pnlClass} ${pnlBgClass} rounded px-2 py-0.5 inline-block mt-1`}>
          {isProfit ? '+' : ''}{(parseFloat(pnlPercent) * 100).toFixed(2)}%
        </div>
      </td>
      <td className="py-4 px-4">
        <div className={pnlClass}>
          {isProfit ? '+' : ''}{parseFloat(pnl).toFixed(4)} {symbol.split('-')[1] || 'USDT'}
        </div>
        <div className={`text-xs ${pnlClass} ${pnlBgClass} rounded px-2 py-0.5 inline-block mt-1`}>
          {isProfit ? '+' : ''}{(parseFloat(pnlPercent) * 100).toFixed(2)}%
        </div>
      </td>
    </tr>
  );
}


function PositionRow_1({ position }: { position: any }) {
  // Safely check if unrealizedProfit is positive
  const unrealizedProfit = parseFloat(position.unrealizedProfit || '0');
  const isUnrealisedPositive = unrealizedProfit >= 0;

  // For realized profit, assume 0 if not available
  const realizedProfit = parseFloat(position.realizedProfit || '0');
  const isRealisedPositive = realizedProfit >= 0;

  // Set colors based on profit/loss
  const unrealisedColor = isUnrealisedPositive ? 'text-green-600' : 'text-red-600';
  const realisedColor = isRealisedPositive ? 'text-green-600' : 'text-red-600';
  const unrealisedBgColor = isUnrealisedPositive ? 'bg-green-50' : 'bg-red-50';
  const realisedBgColor = isRealisedPositive ? 'bg-green-50' : 'bg-red-50';

  // Format the values for display
  const formattedUnrealizedProfit = `${isUnrealisedPositive ? '+' : ''}${unrealizedProfit.toFixed(4)} USDT`;
  const formattedRealizedProfit = `${isRealisedPositive ? '+' : ''}${realizedProfit.toFixed(4)} USDT`;

  // Calculate percentage if possible, otherwise use a default
  const pnlRatio = parseFloat(position.pnlRatio || '0') * 100;
  const formattedPnlRatio = `${isUnrealisedPositive ? '+' : ''}${pnlRatio.toFixed(2)}%`;

  return (
    <tr key={position.positionId} className="border-t border-gray-100">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className="w-1 h-8 bg-blue-500 mr-2 rounded-sm"></div>
          <div>
            <div>{position.symbol}</div>
            <div className="text-sm text-gray-500">Isolated {position.leverage}x</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className="flex flex-col">
            <span className="font-medium text-gray-700">{position.positionSide}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">{position.positionAmt} {position.symbol.split('USDT')[0]}</td>
      <td className="py-3 px-4">{position.avgPrice}</td>
      <td className="py-3 px-4">{position.markPrice}</td>
      <td className="py-3 px-4">
        <div className="">{formattedUnrealizedProfit}</div> {/* {unrealisedColor} */}
        <div className={`text-xs px-2 py-0.5 rounded-sm inline-block ${unrealisedBgColor} ${unrealisedColor}`}>
          {formattedPnlRatio}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="">{formattedRealizedProfit}</div> {/* {realisedColor} */}
        <div className={`text-xs px-2 py-0.5 rounded-sm inline-block ${realisedBgColor} ${realisedColor}`}>
          {isRealisedPositive ? '+0.00%' : '-0.00%'}
        </div>
      </td>
    </tr>
  );
}


export default function Positions() {
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  const fetchPositions = async () => {
    if (!user?.email) return [];
    const BASE_URL = import.meta.env.VITE_API_URL;

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session || sessionError) {
      console.error('No active session or session error:', sessionError);
      throw new Error(sessionError?.message || "No active session");
    }

    function buildApiUrl(path: string): string {
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

    const url = buildApiUrl(`/api/live-positions?email=${encodeURIComponent(user.email)}`);
    const headers = {
      "accept": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to fetch positions");
    }

    return response.json();
  };

  const { data: positions = [], isLoading, error } = useQuery({
    queryKey: ["positions", user?.email],
    queryFn: fetchPositions,
    enabled: !!user?.email,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale to ensure refetching
  });

  // Set up polling when there are positions
  useEffect(() => {
    if (positions && positions.length > 0) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Set up new interval
      pollingIntervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ["positions", user?.email] });
      }, 2000);
    } else if (pollingIntervalRef.current) {
      // Clear interval when there are no positions
      clearInterval(pollingIntervalRef.current);
    }

    // Cleanup interval on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [positions, user?.email, queryClient]);

  const filteredPositions = React.useMemo(() => {
    return Array.isArray(positions) ? positions : [];
  }, [positions]);



  const [selectedExchange, setSelectedExchange] = useState<string>("BingX");
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />
        <Lowheader />

        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Positions</h1>
          </div>

          <div className="flex justify-between mb-6">
            <div className="w-64">
              <Select value={selectedExchange} onValueChange={setSelectedExchange} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="All Exchanges" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Exchanges">All Exchanges</SelectItem>
                  <SelectItem value="Bybit">Bybit</SelectItem>
                  <SelectItem value="Binance">Binance</SelectItem>
                  <SelectItem value="BingX">BingX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-96">
              {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              /> */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 text-gray-600 text-left">
                  <th className="py-3 px-4 font-medium">Contract</th>
                  <th className="py-3 px-4 font-medium">Position</th>
                  <th className="py-3 px-4 font-medium">Value</th>
                  <th className="py-3 px-4 font-medium">Entry price</th>
                  <th className="py-3 px-4 font-medium">Mark price</th>
                  <th className="py-3 px-4 font-medium">Unrealised P&L (%)</th>
                  <th className="py-3 px-4 font-medium">Realised P&L (%)</th>
                </tr>
              </thead>
              <tbody>

                {Array.isArray(positions) && positions.length > 0 ? (
                  positions.map((pos: any) => (
                    <PositionRow_1
                      position={pos}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 px-4 text-center">
                      No open positions found
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
