import { useState } from "react";
import { ArrowRight, Lock, ChevronRight } from "lucide-react";
import CryptoSniperWelcome from "@/components/CryptoSniperWelcome";
import Sidebar from "@/components/Sidebar";
import PerformanceCard from "@/components/PerformanceCard";



export default function Visitor() {
    return (
        <div className="flex min-h-screen bg-neutral-50">
            <Sidebar />

            <div className="bg-gray-100 flex-1 p-2 md:ml-64 font-sans">
                {/* Header */}
                <header className="bg-white p-3 flex justify-between items-center border-b">
                    <div className="flex items-center space-x-4">
                        <span className="font-bold text-blue-700">Crypto</span>
                        <div className="flex items-center space-x-2">
                            <span>BTC: 2448.60</span>
                            <span className="text-red-500">(+0.03%)</span>
                            <ChevronRight size={14} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>ETH: 2448.60</span>
                            <span className="text-green-500">(+0.03%)</span>
                            <ChevronRight size={14} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>SOL: 2448.60</span>
                            <span className="text-green-500">(+0.03%)</span>
                            <ChevronRight size={14} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span className="text-sm">Call us at +912234456566</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm">Chat with us</span>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
                        onClick={() => {
                            window.location.href = "/signin"
                        }}
                        >Sign in</button>
                        <button className="border border-blue-600 text-blue-600 px-4 py-1 rounded-full text-sm"
                        onClick={() => {
                            window.location.href = "/signup"
                        }}
                        >Create account</button>
                    </div>
                </header>

                <CryptoSniperWelcome />

                {/* Strategies Section */}
                <div className="mx-4 my-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Strategies</h2>
                        <button className="flex items-center text-sm text-blue-600">
                            View All
                            <ArrowRight size={16} className="ml-1" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Strategy Card 1 */}
                        <PerformanceCard />

                        {/* Strategy Card 2 */}
                        <PerformanceCard showMarker={true} />

                        {/* Strategy Card 3 */}
                        <PerformanceCard />
                    </div>
                </div>
            </div>

        </div>
    );
}

function StrategyCard({ showMarker = false }) {
    // Example data for the chart - this would be replaced with actual data
    const chartPoints = [0, 20, 40, 20, 60, 40, 20];
    const maxHeight = 100;

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold mb-4">Advanced Delta Neutral</h3>

            {/* Chart Area */}
            <div className="h-40 relative mb-4">
                {/* Chart Visualization */}
                <div className="flex items-end justify-between h-full relative">
                    {chartPoints.map((point, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                            {index > 0 && (
                                <div
                                    className="absolute h-1 bg-blue-200"
                                    style={{
                                        width: `${100 / chartPoints.length}%`,
                                        left: `${(index - 0.5) * (100 / chartPoints.length)}%`,
                                        bottom: `${(point / maxHeight) * 100}%`,
                                        background: "linear-gradient(180deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)"
                                    }}
                                />
                            )}
                            <div
                                className="w-1 bg-blue-400 rounded-t-full"
                                style={{ height: `${(point / maxHeight) * 100}%` }}
                            />
                        </div>
                    ))}

                    {/* Year Labels */}
                    <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500">
                        <span>April</span>
                        <span>2023</span>
                        <span>2024</span>
                    </div>

                    {/* Current Marker */}
                    {showMarker && (
                        <div className="absolute h-full w-px bg-blue-500 border-dashed border-blue-400" style={{ left: '70%', borderLeftWidth: '1px' }}>
                            <div className="bg-blue-500 text-white text-xs rounded px-2 py-0.5 absolute -top-6 -translate-x-1/2" style={{ left: '50%' }}>
                                1 Mar
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <p className="text-gray-500">Number of Trades:</p>
                    <p className="font-bold">451</p>
                </div>
                <div>
                    <p className="text-gray-500">Total Returns:</p>
                    <p className="font-bold">81.02349478</p>
                </div>
                <div>
                    <p className="text-gray-500">Total Trades:</p>
                    <p className="font-bold">1290</p>
                </div>
                <div>
                    <p className="text-gray-500">Max DD:</p>
                    <p className="font-bold text-red-500">0.00</p>
                </div>
            </div>
        </div>
    );
}