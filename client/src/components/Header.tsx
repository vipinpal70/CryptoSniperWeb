import React, { useState } from "react";
import { Menu, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface PriceData {
  symbol: string;
  price: number;
  change: number;
}

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const cryptoPrices: PriceData[] = [
    { symbol: "BTC", price: 2448.60, change: -0.03 },
    { symbol: "ETH", price: 2448.60, change: 0.03 },
    { symbol: "SOL", price: 2448.60, change: 0.03 },
  ];
  
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center">
          <button 
            className="text-neutral-500 hover:text-neutral-700 md:hidden mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="bg-blue-50 rounded-md px-3 py-1.5 flex space-x-6 overflow-x-auto">
            <div className="text-sm whitespace-nowrap">
              <span className="font-medium">Crypto</span>
              {cryptoPrices.map((crypto) => (
                <span key={crypto.symbol} className="ml-4 inline-flex items-center">
                  <span className="font-mono">
                    {crypto.symbol}: 
                    <span className={crypto.change >= 0 ? "text-green-500" : "text-red-500"}>
                      {" "}{crypto.price.toFixed(2)}
                    </span>
                    {" "}({crypto.change >= 0 ? "+" : ""}{crypto.change.toFixed(2)}%)
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <a href="#" className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center">
            <Phone className="w-5 h-5 mr-1" />
            Call us at +912233445566
          </a>
          <a href="#" className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center">
            <MessageSquare className="w-5 h-5 mr-1" />
            Chat with us
          </a>
          
          <div className="relative">
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="text-sm text-left hidden sm:block">
                <div className="font-medium">{user?.name || "User"}</div>
                <div className="text-xs text-neutral-500">{user?.email || "user@example.com"}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - would be implemented in a real app */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-2">
          {/* Mobile menu items */}
        </div>
      )}
    </header>
  );
}
