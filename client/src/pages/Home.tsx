import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { BarChart3, Play, RefreshCw, X, Zap } from "lucide-react";
import Lowheader from "@/components/Lowheader";
import TradingGreetingCard from "@/components/TradingGreetingCard";
import { apiRequest } from "@/lib/queryClient";
import DeployedStrategies from "@/components/DeployedStrategies";
import CryptoSniperWelcome from "@/components/CryptoSniperWelcome";
import PerformanceCard from "@/components/PerformanceCard";
import { useToast } from "@/hooks/use-toast";



export default function Home() {
  const { user, updateUserPhone } = useAuth();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [brokerName, setBrokerName] = useState<string | undefined>(undefined);
  const [brokerIsActive, setBrokerIsActive] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [phone, setPhone] = useState<string | undefined>(undefined)
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false);
  const [pnl, setPnl] = useState(0)

  // In wouter, you need to get the state from the history.state object
  // Effect to handle user data from auth context
  useEffect(() => {
    // If user is available from auth context, store their email in session storage
    if (user?.email) {
      sessionStorage.setItem("signupEmail", user.email);
      setEmail(user.email);
    }

    // Get user data from session storage as fallback
    const emailFromStorage = sessionStorage.getItem("signupEmail");
    const phone = sessionStorage.getItem("signupPhone");
    const userName = sessionStorage.getItem("signupName")
    const brokerName = sessionStorage.getItem("broker_name");
    const brokerIsActive = sessionStorage.getItem("api_verified");
    const balanceFromStorage = sessionStorage.getItem("balance");
    const pnlFromStorage = sessionStorage.getItem("pnl");
    const notification = sessionStorage.getItem("showNotifications")
    const userDataStr = sessionStorage.getItem("user_dict");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    
    console.log('Home session storage check:', {
      email: emailFromStorage || user?.email,
      phone,
      brokerName,
      brokerIsActive,
      balance: balanceFromStorage,
      pnl: pnlFromStorage
    });

    setShowNotifications(notification === 'true')

    // Set state from session storage or user object
    if (userName) {
      setUserName(userName)
    } else if (user?.user_metadata?.name) {
      setUserName(user.user_metadata.name);
      sessionStorage.setItem("signupName", user.user_metadata.name);
    }

    // Only set email from storage if not already set from user object
    if (emailFromStorage && !email) {
      setEmail(emailFromStorage)
    }

    if (phone) {
      setPhone(phone)
    } else if (user?.user_metadata?.phone) {
      setPhone(user.user_metadata.phone);
      sessionStorage.setItem("signupPhone", user.user_metadata.phone);
    }

    if (brokerName) {
      setBrokerName(brokerName)
    }

    if (brokerIsActive) {
      setBrokerIsActive(brokerIsActive)
    }

    if (balanceFromStorage) {
      setBalance(Number(balanceFromStorage))
    }

    if (pnlFromStorage) {
      try {
        const parsedPnl = parseFloat(pnlFromStorage);
        if (!isNaN(parsedPnl)) {
          setPnl(parsedPnl);
          console.log('Setting PNL from session storage:', parsedPnl);
        }
      } catch (error) {
        console.error('Error parsing PNL value from session storage:', error);
      }
    }
  }, [setShowNotifications]);


  useEffect(() => {
    const completeProfileIfNeeded = async () => {
      if (userName && email && phone) {
        const user_dict = {
          "name": user?.identities?.[0]?.identity_data?.full_name || userName,
          "email": email,
          "phone": phone,
          "status": "pending",
          "referral_code": "",
          "invited_by": "",
          "referral_count": 0,
          "broker_name": ""
        };

        try {
          const completeResponse = await apiRequest("POST", "/api/auth/complete-profile", user_dict);
          if (completeResponse?.message === "Registration completed successfully") {
            // Mark profile as completed in local storage
            const userEmail = user?.email || email;
            if (userEmail) {
              localStorage.setItem(`profile_completed_${userEmail}`, 'true');
            }
          }
        } catch (error) {
          console.error("Profile completion error:", error);
          console.log(user_dict);

          toast({
            title: "Error",
            description: "Failed to complete profile",
            variant: "destructive",
          });
        }
      }
    };

    completeProfileIfNeeded();
  }, [userName, email, phone, user, toast]);

  useEffect(() => {
    // This function handles the profile completion process
    const handleProfileCompletion = async () => {
      // Check if user exists
      if (!user) {
        console.log("No user found in auth context");
        return;
      }

      // Check if we've already completed the profile for this user
      const userEmail = user.email || user.user_metadata?.email;
      if (!userEmail) {
        console.log("No email found for user");
        return;
      }

      const profileCompletedKey = `profile_completed_${userEmail}`;
      const isProfileCompleted = localStorage.getItem(profileCompletedKey) === 'true';

      if (isProfileCompleted) {
        // Profile already completed, just set the user data without API call
        let fullName;

        // Handle both Supabase and custom auth user objects
        if (user.user_metadata?.custom_auth) {
          // Custom auth user
          fullName = user.user_metadata?.name || user.user_metadata?.user?.name;
          setUserName(fullName);
          setEmail(userEmail);
        } else if (user.identities && user.identities.length > 0) {
          // Supabase auth user
          fullName = user.identities[0].identity_data?.full_name;
          if (typeof fullName === 'string') {
            setUserName(fullName);
          }
          setEmail(userEmail);
        }

        return;
      }

      // Set user data based on auth type
      let fullName;

      if (user.user_metadata?.custom_auth) {
        // Custom auth user
        fullName = user.user_metadata?.name || user.user_metadata?.user?.name;
        setUserName(fullName);
        setEmail(userEmail);
      } else if (user.identities && user.identities.length > 0) {
        // Supabase auth user
        fullName = user.identities[0].identity_data?.full_name;
        if (typeof fullName === 'string') {
          setUserName(fullName);
        }
        setEmail(userEmail);
      }

      // Only proceed if we have the necessary user information
      if (userEmail && (fullName || userName)) {
        const user_dict = {
          "name": fullName || userName || "",
          "email": userEmail || "",
          "phone": phone || "",
          "password": password || "",
          "status": "pending",
          "referral_code": "",
          "invited_by": "",
          "referral_count": 0,
          "broker_name": ""
        };

        try {
          const completeResponse = await apiRequest("POST", "/api/auth/complete-profile", user_dict);
          if (completeResponse?.message === "Registration completed successfully") {
            // Mark this profile as completed in localStorage
            localStorage.setItem(profileCompletedKey, 'true');
          }
        } catch (error) {
          console.error("Profile completion error:", error);
          // Don't show error toast for now as this is a one-time operation
          // toast({
          //   title: "Error",
          //   description: "Failed to complete profile",
          //   variant: "destructive",
          // });
        }
      } else {
        console.log("Missing required user information for profile completion");
        console.log("user", user);
        console.log("userName", userName);
        console.log("email", email);
      }
    };

    // Execute the profile completion handler
    handleProfileCompletion();
  }, [user, userName, email, phone, password]); // Keep the user dependency to ensure the effect runs when user becomes available


  // fetch user broker is connected or not
  const { data: brokerData, isLoading: isLoadingBroker } = useQuery({
    queryKey: ['/get-broker', email],
    staleTime: 30000,
    enabled: !!email, // Only run the query when email is available
    queryFn: () => {
      // Make sure email is not null before using it
      if (!email) {
        throw new Error('Email is required for this API call');
      }
      return apiRequest("GET", `/api/broker?email=${encodeURIComponent(email)}`);
    }
  });

  useEffect(() => {
    if (brokerData) {
      setBrokerName(brokerData.broker_name);
      setBrokerIsActive(String(brokerData.api_verified));
      // setBalace(brokerData.balance)
      sessionStorage.setItem("broker_name", brokerData.broker_name);
      sessionStorage.setItem("api_verified", brokerData.api_verified);
      // sessionStorage.setItem("balance", brokerData.balance);

    }
  }, [brokerData]);

  // fetch user balance - note: this endpoint is currently failing with 500 error
  const { data: Balances, isLoading: isLoadingBalance, isError: isBalanceError } = useQuery({
    queryKey: ['/user-balance', email],
    staleTime: 30000,
    enabled: !!email,
    queryFn: () => {
      if (!email) {
        throw new Error('Email is required for this API call');
      }
      return apiRequest("GET", `/api/user/balance?email=${encodeURIComponent(email)}`);
    },
    retry: 1, // Only retry once to avoid excessive failed requests
    onError: (error) => {
      console.error('Error fetching balance:', error);
      // We'll use the session storage value or PNL as fallback
    }
  })

  // fetch pnl 
  const { data: pnlData, isLoading: isLoadingPnl } = useQuery({
    queryKey: ['/user-pnl', email],
    staleTime: 30000,
    enabled: !!email,
    queryFn: () => {
      if (!email) {
        throw new Error('Email is required for this API call');
      }
      return apiRequest("GET", `/api/user/pnl?email=${encodeURIComponent(email)}`);
    }
  })



  useEffect(() => {
    // Handle balance data if available
    if (Balances) {
      try {
        console.log('Balance data from API:', Balances);
        
        // Check if Balances is an object with balance property
        if (typeof Balances === 'object' && Balances.balance !== undefined) {
          const balanceValue = parseFloat(Balances.balance);
          if (!isNaN(balanceValue)) {
            console.log('Setting balance from API object:', balanceValue);
            setBalance(balanceValue);
            sessionStorage.setItem("balance", balanceValue.toString());
          }
        } else {
          // Try to parse as direct number (fallback)
          const balanceValue = typeof Balances === 'number' ? Balances : parseFloat(Balances);
          if (!isNaN(balanceValue)) {
            console.log('Setting balance from API direct value:', balanceValue);
            setBalance(balanceValue);
            sessionStorage.setItem("balance", balanceValue.toString());
          }
        }
      } catch (error) {
        console.error('Error parsing balance data:', error);
      }
    } else if (isBalanceError || isLoadingBalance) {
      // If there's an error or still loading, try to get balance from broker data
      if (brokerData && brokerData.balances && brokerData.balances.USDT) {
        try {
          const balanceFromBroker = parseFloat(brokerData.balances.USDT);
          if (!isNaN(balanceFromBroker)) {
            console.log('Setting balance from broker data:', balanceFromBroker);
            setBalance(balanceFromBroker);
            sessionStorage.setItem("balance", balanceFromBroker.toString());
          }
        } catch (error) {
          console.error('Error parsing broker balance data:', error);
        }
      } else {
        // As a last resort, try to get from session storage
        const storedBalance = sessionStorage.getItem("balance");
        if (storedBalance) {
          try {
            const parsedBalance = parseFloat(storedBalance);
            if (!isNaN(parsedBalance)) {
              console.log('Setting balance from session storage:', parsedBalance);
              setBalance(parsedBalance);
            }
          } catch (error) {
            console.error('Error parsing stored balance:', error);
          }
        }
      }
    }

    // Handle PNL data if available
    if (pnlData !== undefined) {
      try {
        // The PNL endpoint returns a number directly
        const pnlValue = typeof pnlData === 'number' ? pnlData : parseFloat(pnlData);
        if (!isNaN(pnlValue)) {
          console.log('Setting PNL from API:', pnlValue);
          setPnl(pnlValue);
          // Store as simple string, not JSON string
          sessionStorage.setItem("pnl", pnlValue.toString());
          
          // Also update email in session storage if available but not yet set
          if (user?.email && !sessionStorage.getItem("signupEmail")) {
            sessionStorage.setItem("signupEmail", user.email);
            setEmail(user.email);
            console.log('Updated email in session storage from PNL handler:', user.email);
          }
        }
      } catch (error) {
        console.error('Error parsing PNL data:', error);
      }
    }
  }, [Balances, pnlData]);


  // Fetch portfolio data
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['/portfolio', email],
    staleTime: 60000,
    enabled: !!email,
    queryFn: () => {
      if (!email) {
        throw new Error('Email is required for this API call');
      }
      // This endpoint might not exist in the backend yet
      // Consider creating it or using an alternative endpoint
      return apiRequest("GET", `/api/user/portfolio?email=${encodeURIComponent(email)}`);
    }
  });

  const mockChartData = [
    { date: "Jan", btc: 0, usd: -5 },
    { date: "Feb", btc: 2, usd: -3 },
    { date: "Mar", btc: -2, usd: -7 },
    { date: "Apr", btc: 5, usd: 3 },
    { date: "May", btc: 3, usd: 0 },
    { date: "Jun", btc: 7, usd: 5 },
    { date: "Jul", btc: 4, usd: 2 },
  ];

  // Extract asset data from portfolio
  const assetData = portfolioData?.assets ?
    Object.entries(portfolioData.assets).map(([symbol, data]: [string, any]) => ({
      symbol,
      percentage: data.percentage,
      value: data.value
    })) : [];

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />
        <Lowheader />

        <main className="p-4 md:p-6">

          <div className="flex justify-between w-full ">
            {/* user connection here flex-col lg:flex-row gap-6 */}
            <div className="basis-[62%] ">
              {brokerIsActive === "true" ? (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium">Trading Account</h2>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span> Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Manage your trading account and performance</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Total Balance</p>
                      <p className="text-xl font-semibold">$ {Math.abs(balance || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">+$0.00 (0.00%) today</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Available</p>
                      <p className="text-xl font-semibold">$ {Math.abs(balance || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">USDT</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">24h P&L</p>
                      <p className="text-xl font-semibold text-green-600">+$0.00</p>
                      <p className="text-xs text-gray-400">+0.00%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t pt-3">
                    <div className="flex items-center gap-2 bg-blue-600 text-white p-1 px-2 rounded">
                      <span className="font-bold text-xs">X</span>
                    </div>
                    <div>
                      <p className="font-medium">BingX</p>
                      <p className="text-xs text-gray-500">ID: 57662104980</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <button className="text-blue-600 px-3 py-1 rounded border border-blue-600 text-sm flex items-center gap-1">
                        <Play size={14} /> Stop
                      </button>
                      <button className="text-gray-600 px-3 py-1 rounded border border-gray-300 text-sm flex items-center gap-1">
                        <RefreshCw size={14} /> Refresh
                      </button>
                    </div>
                  </div>
                </div>

                // <div className="mb-6 flex justify-between items-center">
                //   <div>
                //     <h1 className="text-2xl font-semibold">Hi, {userName || "there"}!</h1>
                //     <p className="text-neutral-500">Hey, Trade Smarter, Execute Faster- Powering your Crypto Strategies!</p>
                //   </div>
                //   <div className="text-right">
                //     <div className="text-sm text-gray-500">Total P&L</div>
                //     <div className={`text-2xl font-bold ${(pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                //       {pnl ? `${pnl}` : "0.00"}
                //     </div>
                //   </div>
                // </div>
              ) : (
                (user || userName) ? <TradingGreetingCard userName={userName} pnl={pnl} brokerName={brokerName} /> : <CryptoSniperWelcome />
              )}

              {/* Portfolio Overview Card */}

              <Card className="col-span-1 lg:col-span-2 rounded-3xl shadow-sm mt-6">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-medium">Total Value</h2>
                    <div className="text-3xl font-semibold mt-2">
                      {isLoadingPortfolio
                        ? "Loading..."
                        : balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      <span className="text-sm font-normal text-neutral-500 ml-1">
                        {'USDT'}
                      </span>
                    </div>
                    {/* <div className="text-sm text-neutral-500">
                      ≈{isLoadingPortfolio 
                        ? "Loading..." 
                        : `$${Object.values(balance)[0]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    </div> */}
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h3 className="font-medium">Cumulative ROI</h3>
                        <div className="ml-1 text-gray-400 cursor-pointer rounded-full bg-gray-100 w-4 h-4 flex items-center justify-center text-xs">?</div>
                      </div>
                      <div className="text-lg font-semibold text-green-500">+3.94%</div>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <Button variant="default" size="sm" className="text-xs h-7 px-2.5 rounded-full bg-blue-600 text-white">7 days</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 rounded-full">30 days</Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5 rounded-full">Custom</Button>

                      <div className="ml-auto flex items-center space-x-2">
                        <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-blue-600 text-white border-none">
                          <span className="text-xs font-medium">BTC</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-neutral-100">
                          <span className="text-xs font-medium text-neutral-600">USD</span>
                        </Button>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={mockChartData}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="btc"
                            stroke="#0147FF"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="usd"
                            stroke="#FF4D4D"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="basis-[35%]">
              <DeployedStrategies />
            </div>
          </div>

          {/* Assets Distribution Section */}
          <div className="mt-6">
            <Card className="rounded-3xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium">Assets Distribution</h3>
                  <div className="ml-1 text-gray-400 cursor-pointer rounded-full bg-gray-100 w-4 h-4 flex items-center justify-center text-xs">?</div>
                </div>

                <div className="h-2 bg-neutral-100 rounded-full mb-4 flex overflow-hidden">
                  {assetData.map((asset, index) => (
                    <div
                      key={asset.symbol}
                      className={`h-full ${index % 6 === 0 ? "bg-red-400" :
                        index % 6 === 1 ? "bg-purple-400" :
                          index % 6 === 2 ? "bg-pink-400" :
                            index % 6 === 3 ? "bg-green-400" :
                              index % 6 === 4 ? "bg-yellow-400" :
                                "bg-blue-400"
                        }`}
                      style={{ width: `${asset.percentage}%` }}
                    ></div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[{ symbol: "BTC", percentage: 6, value: 245.87 },
                  { symbol: "ETH", percentage: 6, value: 245.87 },
                  { symbol: "BNB", percentage: 6, value: 245.87 },
                  { symbol: "SOL", percentage: 6, value: 245.87 },
                  { symbol: "ARB", percentage: 6, value: 245.87 },
                  { symbol: "SAND", percentage: 6, value: 245.87 },
                  { symbol: "DOGE", percentage: 6, value: 245.87 },
                  { symbol: "Others", percentage: 6, value: 245.87 }].map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center p-2 rounded bg-neutral-50">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${index % 6 === 0 ? "bg-red-400" :
                          index % 6 === 1 ? "bg-purple-400" :
                            index % 6 === 2 ? "bg-pink-400" :
                              index % 6 === 3 ? "bg-green-400" :
                                index % 6 === 4 ? "bg-yellow-400" :
                                  "bg-blue-400"
                          }`}
                      ></div>
                      <div className="mr-auto">{asset.symbol}</div>
                      <div className="text-neutral-500">{asset.percentage}% • {asset.value.toFixed(2)} USD</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
