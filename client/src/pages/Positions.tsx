import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Lowheader from "@/components/Lowheader";

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
function PositionRow({
  symbol,
  side,
  size,
  entryPrice,
  markPrice,
  pnl,
  pnlPercent,
  leverage,
  liquidationPrice
}: PositionRowProps) {
  const isProfit = parseFloat(pnl) >= 0;
  const pnlClass = isProfit ? 'text-green-500' : 'text-red-500';
  const pnlBgClass = isProfit ? 'bg-green-50' : 'bg-red-50';
  const sideClass = side === 'LONG' ? 'text-green-500' : 'text-red-500';
  
  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="py-4 px-4">
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

export default function Positions() {
  const { user } = useAuth();

  const { data: positions = [], isLoading, error } = useQuery({
    queryKey: ["positions", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Debug logs
      console.log('Session data:', session);
      console.log('Session error:', sessionError);
      
      if (!session || sessionError) {
        console.error('No active session or session error:', sessionError);
        throw new Error(sessionError?.message || "No active session");
      }

      const url = `http://localhost:8000/api/positions?email=${encodeURIComponent(user.email)}`;
      const headers = {
        "accept": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      };
      
      console.log('Making request to:', url);
      console.log('With headers:', headers);
      
      const response = await fetch(url, {
        method: "POST",
        headers,
      });
      
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch positions");
      }

      return response.json();
    },
    enabled: !!user?.email,
    staleTime: 30000, // Cache for 30 seconds
  });

  const filteredPositions = React.useMemo(() => {
    return Array.isArray(positions) ? positions : [];
  }, [positions]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />
        <Lowheader/>

        <main className="p-2 md:p-4">
          {/* <div className="mb-6">
            <h1 className="text-2xl font-semibold">Positions</h1>
          </div> */}

          <Card className="overflow-hidden">
            {/* <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            </div> */}

            {isLoading ? (
              <div className="p-8 text-center">Loading positions...</div>
            ) : filteredPositions.length === 0 ? (
              <div className="p-8 text-center">No positions found</div>
            ) : (
              <div className="p-6">
                <h1 className="text-xl font-bold mb-6">Positions</h1>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#B3C8FF]">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Contract</th>
                        <th className="text-left py-3 px-4 font-medium">Side</th>
                        <th className="text-left py-3 px-4 font-medium">Value</th>
                        <th className="text-left py-3 px-4 font-medium">Entry price</th>
                        <th className="text-left py-3 px-4 font-medium">Mark price</th>
                        <th className="text-left py-3 px-4 font-medium">Unrealised P&L (%)</th>
                        <th className="text-left py-3 px-4 font-medium">Realised P&L (%)</th>
                      </tr>
                    </thead>
                      <tbody>
                      {Array.isArray(positions) && positions.length > 0 ? (
                        positions.map((pos: any) => (
                          <PositionRow 
                            key={pos.positionId}
                            symbol={pos.symbol}
                            side={pos.positionSide}
                            size={pos.positionAmt}
                            entryPrice={pos.avgPrice}
                            markPrice={pos.markPrice}
                            pnl={pos.unrealizedProfit}
                            pnlPercent={pos.pnlRatio}
                            leverage={pos.leverage}
                            liquidationPrice={pos.liquidationPrice}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-gray-500">
                            No open positions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}