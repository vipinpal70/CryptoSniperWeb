import React, { useState } from 'react';
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import CongratulationsPopup from '@/components/congratulationsPopup';

interface PerformanceGraphProps {
    showMarker?: boolean;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ showMarker = false }) => {
    return (
        <div className="bg-white p-4 rounded-lg relative">
            <svg
                viewBox="0 0 300 200"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Y-axis labels */}
                <text x="20" y="30" fontSize="12" fill="#666">60.00k</text>
                <text x="20" y="90" fontSize="12" fill="#666">40.00k</text>
                <text x="20" y="150" fontSize="12" fill="#666">20.00k</text>
                <text x="30" y="190" fontSize="12" fill="#666">0</text>

                {/* Y-axis line */}
                <line x1="50" y1="20" x2="50" y2="190" stroke="#e5e7eb" strokeWidth="1" />

                {/* X-axis labels */}
                <text x="70" y="190" fontSize="12" fill="#666">April</text>
                <text x="170" y="190" fontSize="12" fill="#666">2023</text>
                <text x="260" y="190" fontSize="12" fill="#666">2024</text>

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Area chart path */}
                <path
                    d="M 50,180 
             L 80,160 
             L 120,140 
             L 170,40 
             L 200,130 
             L 240,80 
             L 280,110 
             L 280,190 
             L 50,190 Z"
                    fill="url(#blueGradient)"
                />

                {/* Line chart path */}
                <path
                    d="M 50,180 
             L 80,160 
             L 120,140 
             L 170,40 
             L 200,130 
             L 240,80 
             L 280,110"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                />

                {/* Marker line (if showMarker is true) */}
                {showMarker && (
                    <g>
                        <line x1="210" y1="20" x2="210" y2="190" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                        <rect x="195" y="10" width="30" height="16" rx="3" fill="#3b82f6" />
                        <text x="210" y="22" fontSize="10" fill="white" textAnchor="middle">1 Mar</text>
                    </g>
                )}
            </svg>

            {/* Alternative implementation using absolute positioning (optional) */}
            {/*
      {showMarker && (
        <div className="absolute h-full w-px border-l border-dashed border-blue-500" style={{ left: '70%', top: '10%', bottom: '10%' }}>
          <div className="bg-blue-500 text-white text-xs rounded px-2 py-0.5 absolute -top-6 -translate-x-1/2" style={{ left: '50%' }}>
            1 Mar
          </div>
        </div>
      )}
      */}
        </div>
    );
};

export interface PerformanceData {
    _id: string;
    name: string;
    type: string;
    description: string;
    leverage: string;
    margin: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    isDeployed: boolean;
    BTC: boolean;
    ETH: boolean;
    SOL: boolean;
    TotalTrades: number;
    Returns: number;
    WinRate: number;
    MaxDrawdown: number;
}

interface PerformanceCardProps {
    data: PerformanceData;
    showMarker?: boolean;
    onDeploy?: () => void;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ data, showMarker = false, onDeploy }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isCongratsPopupOpen, setIsCongratsPopupOpen] = useState(false);

    const handleDeployStrategy = async () => {
        try {
            if (!user?.email) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to deploy strategies.",
                    variant: "destructive"
                });
                return;
            }

            const totalBalance = Number(sessionStorage.getItem("balance"));
            if (isNaN(totalBalance) || totalBalance < Number(data.margin)) {
                toast({
                    title: "Your Balance is Low",
                    description: `Minimum ${data.margin} balance required.`,
                    variant: "destructive"
                });
                return;
            }

            const baseUrl = import.meta.env.VITE_API_URL || '';
            const apiUrl = baseUrl && baseUrl.startsWith('http')
                ? new URL('/api/add-strategy', baseUrl)
                : new URL('/api/add-strategy', window.location.origin);

            apiUrl.searchParams.append('email', user.email);
            apiUrl.searchParams.append('strategy_name', data.name);

            const response = await fetch(apiUrl.toString(), {
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

            // toast({
            //     title: "Strategy Deployed",
            //     description: `${data.name} has been successfully deployed.`,
            //     variant: "default"
            // });
            setIsCongratsPopupOpen(true);

            if (onDeploy) {
                onDeploy();
            }

        } catch (error) {
            console.error('Error deploying strategy:', error);
            toast({
                title: "Deployment Failed",
                description: error instanceof Error ? error.message : "Failed to deploy strategy. Please try again.",
                variant: "destructive"
            });
        }
    };


    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6 w-full">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-medium text-gray-800">{data.name}</h3>
                        <p className="text-sm text-gray-500">{data.type}</p>
                    </div>
                    <div className="flex space-x-2">
                        {data.ETH && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">ETH</span>}
                        {data.BTC && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">BTC</span>}
                        {data.SOL && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">SOL</span>}
                    </div>
                </div>
                {/* <p className="text-sm text-gray-600 mb-4">{data.description}</p> */}
                <div className="flex space-x-4 mb-4">
                    <div className="text-sm">
                        <span className="text-[#06C10F] font-medium">Leverage: {data.leverage}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-red-500 font-medium">Margin: ${data.margin}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <PerformanceGraph showMarker={showMarker} />
                </div>

                <div className="grid grid-cols-2 gap-y-2 mb-4">
                    <div className="text-sm text-gray-600">Total Trades:</div>
                    <div className="text-sm font-medium text-right">{data.TotalTrades.toLocaleString()}</div>

                    <div className="text-sm text-gray-600">Total Returns:</div>
                    <div className="text-sm font-medium text-right text-green-600">{data.Returns}%</div>

                    <div className="text-sm text-gray-600">Win Rate:</div>
                    <div className="text-sm font-medium text-right">{data.WinRate}%</div>


                    <div className="text-sm text-gray-600">Max Drawdown:</div>
                    <div className="text-sm font-medium text-right text-red-500">{data.MaxDrawdown}%</div>
                </div>

                <Button
                    variant="outline"
                    className="w-full border border-blue-600 text-blue-600 font-medium py-2 rounded-full transition-colors duration-200 hover:bg-blue-600 hover:text-white active:bg-blue-700"
                    onClick={handleDeployStrategy}
                >
                    Deploy Strategy
                </Button>
            </div>
            <CongratulationsPopup isOpen={isCongratsPopupOpen} onClose={() => setIsCongratsPopupOpen(false)} />
        </>
    );
};

export default PerformanceCard;