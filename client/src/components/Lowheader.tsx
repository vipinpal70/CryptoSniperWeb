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

  const { data, isLoading, error } = useQuery<PriceData[]>({
    queryKey: ["cryptoPrices"],
    queryFn: () => apiRequest("GET", "/cryptolive-data"),
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is in background
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const cryptoPrices = data || [];

  return (
    // <div className="flex items-center justify-between space-x-2 px-4 md:px-6 bg-[#DCE6FF] rounded-md py-3">
    //   <div className="px-3 flex space-x-6 overflow-x-auto">
    //     <div className="text-sm whitespace-nowrap">
    //       <span className="font-medium text-blue-500 text-xl">Crypto</span>
    //       {cryptoPrices?.map((crypto) => (
    //         <span key={crypto.symbol} className="ml-4 inline-flex items-center">
    //           <span className="font-mono text-xl">
    //             {crypto.symbol}:
    //             <span
    //               className={
    //                 crypto.change >= 0 ? "text-green-500" : "text-red-500"
    //               }
    //             >
    //               {" "}
    //               {crypto.price.toFixed(2)}
    //               ({crypto.change >= 0 ? "+" : ""}
    //               {crypto.change.toFixed(2)}%)
    //             </span>{" "}
    //           </span>
    //         </span>
    //       ))}
    //     </div>
    //   </div>
    //   <div className="flex items-center justify-evenly space-x-2">
    //     <a
    //       href="#"
    //       className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center"
    //     >
    //       <Phone className="w-5 h-5 mr-1 text-blue-500" />
    //       Call us at +912233445566
    //     </a>
    //     <a
    //       href="#"
    //       className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center"
    //     >
    //       <MessageSquare className="w-5 h-5 mr-1 text-blue-500" />
    //       Chat with us
    //     </a>
    //   </div>
    // </div>
    // <div className="flex flex-wrap items-center justify-between space-x-2 px-4 md:px-6 bg-[#DCE6FF] rounded-md py-3 overflow-x-hidden">
    //   <div className="px-3 flex flex-wrap space-x-6 max-w-full overflow-x-auto scrollbar-hide">
    //     <div className="text-sm text-wrap break-words">
    //       <span className="font-medium text-blue-500 text-sm sm:text-base md:text-lg">
    //         Crypto
    //       </span>
    //       {cryptoPrices?.map((crypto) => (
    //         <span
    //           key={crypto.symbol}
    //           className="ml-4 inline-flex items-center whitespace-nowrap text-sm sm:text-base md:text-lg"
    //         >
    //           <span className="font-mono">
    //             {crypto.symbol}:
    //             <span
    //               className={
    //                 crypto.change >= 0 ? "text-green-500" : "text-red-500"
    //               }
    //             >
    //               {" "}
    //               {crypto.price.toFixed(2)} ({crypto.change >= 0 ? "+" : ""}
    //               {crypto.change.toFixed(2)}%)
    //             </span>
    //           </span>
    //         </span>
    //       ))}
    //     </div>
    //   </div>

    //   <div className="flex flex-wrap items-center justify-evenly space-x-2">
    //     <a
    //       href="#"
    //       className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center text-sm md:text-base"
    //     >
    //       <Phone className="w-4 h-4 md:w-5 md:h-5 mr-1 text-blue-500" />
    //       Call us at +912233445566
    //     </a>
    //     <a
    //       href="#"
    //       className="text-neutral-600 hover:text-neutral-900 hidden sm:flex items-center text-sm md:text-base"
    //     >
    //       <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-1 text-blue-500" />
    //       Chat with us
    //     </a>
    //   </div>
    // </div>


    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 md:px-6 bg-[#DCE6FF] rounded-md py-3 overflow-hidden">
      {/* Crypto Data */}
      <div className="overflow-x-auto whitespace-nowrap text-sm sm:text-base md:text-base flex items-center gap-4">
        <span className="font-medium text-blue-500">Crypto</span>
        {cryptoPrices?.map((crypto) => (
          <span key={crypto.symbol} className="font-mono inline-flex items-center gap-1">
            {crypto.symbol}:
            <span className={crypto.change >= 0 ? "text-green-500" : "text-red-500"}>
              {crypto.price.toFixed(2)} ({crypto.change >= 0 ? "+" : ""}
              {crypto.change.toFixed(2)}%)
            </span>
          </span>
        ))}
      </div>

      {/* Contact Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm">
        <a href="#" className="text-neutral-600 hover:text-neutral-900 flex items-center">
          <Phone className="w-4 h-4 mr-1 text-blue-500" />
          Call us at +912233445566
        </a>
        <a href="#" className="text-neutral-600 hover:text-neutral-900 flex items-center">
          <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
          Chat with us
        </a>
      </div>
    </div>
  );
}



