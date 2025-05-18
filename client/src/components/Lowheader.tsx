import React, { useEffect, useState } from "react";
import { Menu, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PriceData {
  symbol: string;
  price: number;
  change: number;
}

export default function Lowheader() {
  const { user } = useAuth();

  useEffect(() => {
    
  }, [user]);

  const { data } = useQuery<PriceData[]>({
    queryKey: ["/api/cryptolive-data"],
    staleTime: 60000,
    queryFn: () => apiRequest("GET", "/api/cryptolive-data"),
  });

  const cryptoPrices = data || [];

  return (
    <div className="flex items-center justify-between space-x-4 px-4 md:px-6 bg-[#B3C8FF] rounded-md py-3">
      <div className="px-3 flex space-x-6 overflow-x-auto">
        <div className="text-sm whitespace-nowrap">
          <span className="font-medium text-blue-500 text-xl">Crypto</span>
          {cryptoPrices?.map((crypto) => (
            <span key={crypto.symbol} className="ml-4 inline-flex items-center">
              <span className="font-mono text-xl">
                {crypto.symbol}:
                <span
                  className={
                    crypto.change >= 0 ? "text-green-500" : "text-red-500"
                  }
                >
                  {" "}
                  {crypto.price.toFixed(2)}
                  ({crypto.change >= 0 ? "+" : ""}
                  {crypto.change.toFixed(2)}%)
                </span>{" "}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-evenly space-x-3">
        <a
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center"
        >
          <Phone className="w-5 h-5 mr-1 text-blue-500" />
          Call us at +912233445566
        </a>
        <a
          href="#"
          className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center"
        >
          <MessageSquare className="w-5 h-5 mr-1 text-blue-500" />
          Chat with us
        </a>
      </div>
    </div>
  );
}
