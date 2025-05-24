import React, { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
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

// Trading history mock data
const historyData = [
  {
    id: 1,
    time: '2025-05-08 06:30:09',
    pair: 'BTCUSDT',
    direction: 'Closed Short 125X',
    filled: '0.0500 BTC',
    filledPrice: '97,803.7',
    realisedPnL: '-53.9650 USDT',
    pnlPercent: '-139.48%',
    fee: '-2,189.78 USDT'
  },
  {
    id: 2,
    time: '2025-05-07 20:30:09',
    pair: 'XRPUSDT',
    direction: 'Close Long 100X',
    filled: '2.000 XRP',
    filledPrice: '2.1393',
    realisedPnL: '+22.5999 USDT',
    pnlPercent: '+83.10%',
    fee: '-0.8557 USDT'
  },
  {
    id: 3,
    time: '2025-05-08 06:30:09',
    pair: 'BTCUSDT',
    direction: 'Closed Short 125X',
    filled: '0.0500 BTC',
    filledPrice: '97,803.7',
    realisedPnL: '-53.9650 USDT',
    pnlPercent: '-139.48%',
    fee: '-2,189.78 USDT'
  },
  {
    id: 4,
    time: '2025-05-07 20:30:09',
    pair: 'XRPUSDT',
    direction: 'Close Long 100X',
    filled: '2.000 XRP',
    filledPrice: '2.1393',
    realisedPnL: '+22.5999 USDT',
    pnlPercent: '+83.10%',
    fee: '-0.8557 USDT'
  },
  {
    id: 5,
    time: '2025-05-08 06:30:09',
    pair: 'BTCUSDT',
    direction: 'Closed Short 125X',
    filled: '0.0500 BTC',
    filledPrice: '97,803.7',
    realisedPnL: '-53.9650 USDT',
    pnlPercent: '-139.48%',
    fee: '-2,189.78 USDT'
  },
  {
    id: 6,
    time: '2025-05-07 20:30:09',
    pair: 'XRPUSDT',
    direction: 'Close Long 100X',
    filled: '2.000 XRP',
    filledPrice: '2.1393',
    realisedPnL: '+22.5999 USDT',
    pnlPercent: '+83.10%',
    fee: '-0.8557 USDT'
  }
];

export default function History() {
  const [features, setFeatures] = useState('All');
  const [type, setType] = useState('All');
  const [side, setSide] = useState('All');
  const [marginSource, setMarginSource] = useState('Regular');
  const [margin, setMargin] = useState('USDT');
  
  // Filter handlers
  const handleFeaturesChange = (value: string) => setFeatures(value);
  const handleTypeChange = (value: string) => setType(value);
  const handleSideChange = (value: string) => setSide(value);
  const handleMarginSourceChange = (value: string) => setMarginSource(value);
  const handleMarginChange = (value: string) => setMargin(value);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">History</h1>
          </div>
          
          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Time</div>
              <Button variant="outline" className="h-8 gap-1 px-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Start Date</span>
                </div>
              </Button>
              <Button variant="outline" className="h-8 gap-1 px-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>End Date</span>
                </div>
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Features:</div>
              <Select value={features} onValueChange={handleFeaturesChange}>
                <SelectTrigger className="h-8 w-24">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Futures">Futures</SelectItem>
                  <SelectItem value="Spot">Spot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Type:</div>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-8 w-24">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Limit">Limit</SelectItem>
                  <SelectItem value="Stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Side:</div>
              <Select value={side} onValueChange={handleSideChange}>
                <SelectTrigger className="h-8 w-24">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Buy">Buy</SelectItem>
                  <SelectItem value="Sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Margin Source:</div>
              <Select value={marginSource} onValueChange={handleMarginSourceChange}>
                <SelectTrigger className="h-8 w-28">
                  <SelectValue placeholder="Regular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Cross">Cross</SelectItem>
                  <SelectItem value="Isolated">Isolated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm text-gray-500">Margin:</div>
              <Select value={margin} onValueChange={handleMarginChange}>
                <SelectTrigger className="h-8 w-24">
                  <SelectValue placeholder="USDT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">USDT</SelectItem>
                  <SelectItem value="BTC">BTC</SelectItem>
                  <SelectItem value="ETH">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trading History Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {historyData.map((row) => {
                  // Parse the date parts
                  const dateParts = row.time.split(' ');
                  const date = dateParts[0];
                  const time = dateParts[1];
                  
                  // Calculate date and time parts
                  const [year, month, day] = date.split('-');
                  
                  // Determine PnL color - green for positive, red for negative
                  const isPnlPositive = row.realisedPnL.startsWith('+');
                  const pnlColor = isPnlPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
                  
                  return (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="py-3 px-4">
                        <div>{`${year}-${month}-${day}`}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-1 h-8 bg-blue-500 mr-2 rounded-sm"></div>
                          <div>
                            <div>{row.pair}</div>
                            <div className="text-sm text-gray-500">{row.direction}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{row.filled}</td>
                      <td className="py-3 px-4">{row.filledPrice}</td>
                      <td className="py-3 px-4">
                        <div>{row.realisedPnL}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-sm inline-block ${pnlColor}`}>
                          {row.pnlPercent}
                        </div>
                      </td>
                      <td className="py-3 px-4">{row.fee}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
