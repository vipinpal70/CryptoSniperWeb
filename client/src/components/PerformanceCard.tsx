import React from 'react';

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

interface PerformanceCardProps {
    showMarker?: boolean;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ showMarker = false }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Advanced Delta Neutral</h3>

            <div className="mb-4">
                <PerformanceGraph showMarker={showMarker} />
            </div>

            <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm text-gray-600">Number of Trades:</div>
                <div className="text-sm font-medium text-right">451</div>

                <div className="text-sm text-gray-600">Total Returns:</div>
                <div className="text-sm font-medium text-right">61.0234578</div>

                <div className="text-sm text-gray-600">Total Trades:</div>
                <div className="text-sm font-medium text-right">1290</div>

                <div className="text-sm text-gray-600">Max DD:</div>
                <div className="text-sm font-medium text-right text-red-500">451.00</div>
            </div>
        </div>
    );
};

export default PerformanceCard;