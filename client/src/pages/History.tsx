import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { CalendarIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
// import { format } from 'date-fns';
import { format, subDays, isAfter } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast, useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import * as Tabs from "@radix-ui/react-tabs";
import { log } from "console";
import Lowheader from "@/components/Lowheader";

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

const timeOptions = {
  "24 hours": 1,
  "7 Days": 7,
  "30 Days": 30,
  "90 Days": 90,
  "1 year": 365,
} as const;

type TimeKey = keyof typeof timeOptions;

const timeLabels: TimeKey[] = Object.keys(timeOptions) as TimeKey[];

type AssetDateMap = {
  [date: string]: number;
};

type PnlData = {
  total: number;
  [asset: string]: AssetDateMap | number; // allows "total" and asset keys like "ETH-USDT"
};

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [symbol, setSymbol] = useState("All");
  const [positionSide, setPositionSide] = useState("All");
  const [leverage, setLeverage] = useState("All");
  const [side, setSide] = useState("All");
  const [features, setFeatures] = useState("All");
  const [type, setType] = useState("All");
  const [marginSource, setMarginSource] = useState("All");
  const [margin, setMargin] = useState("All");
  const [filteredData, setFilteredData] = useState<Position[]>([]);
  // const [selectedTime, setSelectedTime] = React.useState("30 Days");
  const [selectedTime, setSelectedTime] = useState<TimeKey>("24 hours");
  const [pnlData, setPnlData] = useState<PnlData>({ total: 0 });
  const [selectedAsset, setSelectedAsset] = useState("");
  // const [selectedAsset, setSelectedAsset] = React.useState("BTC");

  const buildApiUrl = (path: string): string => {
    // Remove any leading slashes from the path to prevent double slashes
    const cleanPath = path.replace(/^\/+/, "");
    const BASE_URL = import.meta.env.VITE_API_URL || "";

    if (BASE_URL.startsWith("http")) {
      // If base URL is a full URL, ensure it ends with exactly one slash
      const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
      return `${base}/${cleanPath}`;
    }

    // For relative URLs, ensure BASE_URL starts with exactly one slash
    const base = BASE_URL.startsWith("/") ? BASE_URL : `/${BASE_URL}`;
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    return `${window.location.origin}${cleanBase}/${cleanPath}`;
  };

  // Query for fetching position history
  const { data: positionHistory = [], isLoading } = useQuery({
    queryKey: ["position-history"],
    queryFn: async () => {
      try {
        if (!user?.email) return [];
        const BASE_URL = import.meta.env.VITE_API_URL;

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        // Debug logs
        console.log("Session data:", session);
        console.log("Session error:", sessionError);

        if (!session || sessionError) {
          console.error("No active session or session error:", sessionError);
          throw new Error(sessionError?.message || "No active session");
        }

        const buildApiUrl = (path: string): string => {
          // Remove any leading slashes from the path to prevent double slashes
          const cleanPath = path.replace(/^\/+/, "");
          const BASE_URL = import.meta.env.VITE_API_URL || "";

          if (BASE_URL.startsWith("http")) {
            // If base URL is a full URL, ensure it ends with exactly one slash
            const base = BASE_URL.endsWith("/")
              ? BASE_URL.slice(0, -1)
              : BASE_URL;
            return `${base}/${cleanPath}`;
          }

          // For relative URLs, ensure BASE_URL starts with exactly one slash
          const base = BASE_URL.startsWith("/") ? BASE_URL : `/${BASE_URL}`;
          const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
          return `${window.location.origin}${cleanBase}/${cleanPath}`;
        };

        const url = buildApiUrl(
          `/api/positions?email=${encodeURIComponent(user.email)}`
        );
        const headers = {
          accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        };

        console.log("Making request to:", url);
        console.log("With headers:", headers);

        const response = await fetch(url, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            symbols: ["BTC-USDT", "ETH-USDT", "SOL-USDT"],
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          console.error("Failed to fetch positions:", errorMessage);
          throw new Error(errorMessage);
        }
        const data = await response.json();
        console.log("Positions data:", data);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch positions";
        throw new Error(errorMessage);
      }
    },
    enabled: !!user?.email,
    staleTime: 30000, // Cache for 30 seconds
  });

  // const [performanceData, setPerformanceData] = useState({
  //   totalROI: 0,
  //   totalValue: 0,

  //   btcValue: 0
  // });

  //** fetching performance historoy */

  const usePerformanceData = () => {
    return useQuery({
      queryKey: ["account-pnl"],
      queryFn: async () => {
        const email = localStorage.getItem("signupEmail");
        console.log("Email from localStorage:", email);

        if (!email) return {};

        const performanceUrl = `/api/account-profit-loss?email=${encodeURIComponent(
          email
        )}`;

        const headers = {
          accept: "application/json",
          "Content-Type": "application/json",
        };

        const res = await fetch(performanceUrl, {
          method: "GET",
          headers,
          credentials: "include",
        });

        console.log("Response status:", res.status);

        const raw = await res.text();
        console.log("Raw response:", raw);

        if (!res.ok) {
          console.error("Fetch failed with status", res.status);
          throw new Error("Failed to fetch PnL data");
        }

        const data = JSON.parse(raw);
        console.log("Parsed data==>>>", data);
        return data;
      },
      staleTime: 30000,
    });
  };

  const { data: performanceData = {}, error } = usePerformanceData();

  const getFilteredPnlTotal = () => {
    if (!selectedAsset || !pnlData) return 0;

    const pairKey = Object.keys(pnlData).find((key) =>
      key.startsWith(selectedAsset)
    );

    if (!pairKey || !(pairKey in pnlData)) return 0;

    const assetData = pnlData[pairKey] || {};

    const days = timeOptions[selectedTime];
    const startDate = subDays(new Date(), days);

    let total = 0;

    Object.entries(assetData).forEach(([dateStr, value]) => {
      const dateOnly = new Date(dateStr + "T00:00:00");
      if (dateOnly >= startDate) {
        total += Number(value);
      }
    });

    return total;
  };

  const totalPnl = getFilteredPnlTotal();

  // Filter positions based on selected criteria
  useEffect(() => {
    let filtered = [...positionHistory];

    if (symbol !== "All") {
      filtered = filtered.filter((position) => position.symbol === symbol);
    }

    if (positionSide !== "All") {
      filtered = filtered.filter(
        (position) => position.positionSide === positionSide
      );
    }

    if (leverage !== "All") {
      filtered = filtered.filter(
        (position) => position.leverage === parseInt(leverage)
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (position) => position.openTime >= startDate.getTime()
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (position) => position.openTime <= endDate.getTime()
      );
    }

    setFilteredData(filtered);
  }, [
    JSON.stringify(positionHistory),
    symbol,
    positionSide,
    leverage,
    startDate?.getTime(),
    endDate?.getTime(),
  ]);

  const formatDate = (timestamp: number) => {
    if (isNaN(timestamp) || typeof timestamp !== "number") {
      return "Invalid Date"; // Or handle as appropriate
    }
    return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
  };

  const getSymbols = (): string[] => {
    const symbols = new Set<string>(
      positionHistory.map((position: { symbol: string }) => position.symbol)
    );
    return ["All", ...Array.from(symbols)];
  };

  const getLeverages = (): string[] => {
    const leverages = new Set<string>(
      positionHistory.map((position: Position) => position.leverage.toString())
    );
    return ["All", ...Array.from(leverages)];
  };

  // Handle date changes with validation
  const handleStartDateChange = (date: Date | undefined) => {
    if (date && endDate && date > endDate) {
      toast({
        title: "Invalid date range",
        description: "Start date cannot be after end date",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }
    setEndDate(date);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 md:ml-[14rem]">
        <Header />
        <Lowheader />

        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">History</h1>

          <Tabs.Root defaultValue="transactions" className="w-full">
            <Tabs.List className="flex items-center gap-4 mb-6">
              <Tabs.Trigger
                value="performance"
                className="flex items-center gap-2 px-4 py-2 text-gray-500 bg-gray-100 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full data-[state=active]:bg-blue-500"></div>
                Performance
              </Tabs.Trigger>
              <Tabs.Trigger
                value="transactions"
                className="flex items-center gap-2 px-4 py-2 text-gray-500 bg-gray-100 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full data-[state=active]:bg-blue-500"></div>
                Transactions
              </Tabs.Trigger>
            </Tabs.List>

            {/* Performance tab content */}
            <Tabs.Content value="performance">
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex items-center gap-4">
                  {/* Date pickers */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">Start Date</div>
                    {/* Start Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 gap-1 px-2 text-sm"
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>
                            {startDate
                              ? format(startDate, "MMM dd, yyyy")
                              : ""}
                          </span>
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
                  </div>

                  <div className="flex gap-2 items-center">
                    <div className="text-sm text-gray-600">End Date</div>
                    {/* End Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 gap-1 px-2 text-sm"
                        >
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>
                            {endDate
                              ? format(endDate, "MMM dd, yyyy")
                              : ""}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleEndDateChange}
                          disabled={(date) =>
                            startDate ? date < startDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Time filters */}
                  <div className="flex items-center space-x-2 bg-white border rounded-full px-2 py-1">
                    {timeLabels.map((label) => (
                      <Button
                        key={label}
                        variant={selectedTime === label ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedTime(label)}
                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-4 py-1 text-xs"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  {/* Performance Summary Cards */}
                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Total Value
                      </div>
                      <div
                        className={`text-2xl font-semibold ${totalPnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {totalPnl.toFixed(2)} USDT
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Total ROI
                      </div>
                      <div className="text-2xl font-semibold text-green-600">
                        + 3.94%
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        {selectedAsset} Value
                      </div>
                      <div className="text-2xl font-semibold text-gray-800">
                        {totalPnl.toFixed(4)} {selectedAsset}
                      </div>
                    </div>
                  </div> */}

                  {/* Portfolio Performance */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold">Portfolio Performance</h2>
                        <p className="text-gray-600 text-sm">Track your portfolio value over time.</p>
                      </div>
                      {/* Asset selector */}
                      <div className="mb-6">
                        <Select
                          value={selectedAsset}
                          onValueChange={setSelectedAsset}
                        >
                          <SelectTrigger className="w-48 h-8 text-sm">
                            <SelectValue placeholder="Select Asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(pnlData)
                              .filter((key) => key !== "total")
                              .map((key) => {
                                const asset = key.split("-")[0];
                                return (
                                  <SelectItem key={asset} value={asset}>
                                    {asset}
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-6">
                      <Card className="bg-gray-100">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">$</span>
                            </div>
                            <span className="text-sm text-gray-600">Total Value:</span>
                          </div>
                          <div
                            className={`text-2xl font-semibold ${totalPnl >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {totalPnl.toFixed(2)} USDT
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-100">
                        <CardContent className="p-6">
                          <div className="text-sm text-gray-600 mb-2">Total ROI:</div>
                          <div className="text-3xl font-bold text-green-500">+ 3.94 %</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-100">
                        <CardContent className="p-6">
                          <div className="text-sm text-gray-600 mb-2">BTC Value:</div>
                          <div className="text-3xl font-bold">0.00 BTC</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                </div>
              </div>
            </Tabs.Content>

            {/* Transactions tab content */}
            <Tabs.Content value="transactions">
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
                    <div className="flex items-center gap-4 px-4 py-2 bg-blue-50 rounded-lg flex-1">
                      <div className="flex gap-2 items-center">
                        <div className="text-sm text-gray-700">Time</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-8 gap-1 px-2 text-sm"
                            >
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>
                                  {startDate
                                    ? format(startDate, "MMM dd, yyyy")
                                    : "Start Date"}
                                </span>
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
                            <Button
                              variant="outline"
                              className="h-8 gap-1 px-2 text-sm"
                            >
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>
                                  {endDate
                                    ? format(endDate, "MMM dd, yyyy")
                                    : "End Date"}
                                </span>
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={handleEndDateChange}
                              disabled={(date) => {
                                // Disable dates that are before the start date
                                return startDate ? date < startDate : false;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="text-sm text-gray-700">Symbol:</div>
                        <Select value={symbol} onValueChange={setSymbol}>
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {getSymbols().map((s: string) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="text-sm text-gray-700">Side:</div>
                        <Select
                          value={positionSide}
                          onValueChange={setPositionSide}
                        >
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
                        <div className="text-sm text-gray-700">Leverage:</div>
                        <Select value={leverage} onValueChange={setLeverage}>
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            {getLeverages().map((l) => (
                              <SelectItem key={l} value={l}>
                                {l}x
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Trading History Table */}
                  <div className="bg-white rounded-lg shadow overflow-x-auto p-4 md:p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-blue-50 text-gray-600 text-left">
                          <th className="py-3 px-4 font-medium">Filled Time</th>
                          <th className="py-3 px-4 font-medium">
                            Futures Direction
                          </th>
                          {/* <th className="py-3 px-4 font-medium">Filled</th> */}
                          <th className="py-3 px-4 font-medium">
                            Filled Price
                          </th>
                          <th className="py-3 px-4 font-medium">
                            Realised P&L ($)
                          </th>
                          <th className="py-3 px-4 font-medium">Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((row) => {
                            // Parse the date parts
                            const dateParts = formatDate(row.updateTime).split(
                              " "
                            );
                            const date = dateParts[0];
                            const time = dateParts[1];

                            // Determine PnL color - green for positive, red for negative
                            const isPnlPositive =
                              parseFloat(row.realisedProfit) >= 0;
                            const pnlColor = isPnlPositive
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50";

                            return (
                              <tr
                                key={row.positionId}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                                    <span className="text-gray-900">
                                      {date} {time}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {row.symbol}
                                    </div>
                                    <div
                                      className={`text-sm ${row.positionSide === "LONG"
                                          ? "text-green-600"
                                          : "text-red-600"
                                        }`}
                                    >
                                      {row.positionSide} {row.leverage}X
                                    </div>
                                  </div>
                                </td>
                                {/* <td className="py-4 px-4 text-gray-900">
                                  {parseFloat(row.positionAmt).toFixed(4)} {row.symbol.split("-")[0]}
                                </td> */}
                                <td className="py-4 px-4 text-gray-900">
                                  {parseFloat(row.avgPrice).toFixed(3)}
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <div
                                      className={`font-medium ${parseFloat(row.realisedProfit) >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                        }`}
                                    >
                                      {parseFloat(row.realisedProfit).toFixed(
                                        3
                                      )}{" "}
                                      {row.symbol.split("-")[1]}
                                    </div>
                                    <div
                                      className={`text-xs px-2 py-1 rounded mt-1 inline-block ${pnlColor}`}
                                    >
                                      {(
                                        (parseFloat(row.realisedProfit) /
                                          parseFloat(row.positionAmt)) *
                                        100
                                      ).toFixed(2)}
                                      %
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-gray-500">
                                  $
                                  {Math.abs(
                                    parseFloat(row.positionCommission)
                                  ).toFixed(3)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-6 px-4 text-center text-gray-500"
                            >
                              No trading history found for the selected filters
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </main>
      </div>
    </div>
  );
}
