import React, { useEffect, useState } from "react";
import { Menu, Phone, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setuserName] = useState("User")

  useEffect(() => {
    const userName = sessionStorage.getItem("signupName")
    if (userName){
      setuserName(userName)
    }
  
    
  }, [])
  
  

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
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center space-x-2">
              {user?.identities?.[0]?.identity_data?.avatar_url ? (
                <img 
                  src={user.identities[0].identity_data.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {user?.identities?.[0]?.identity_data?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-sm text-left hidden sm:block">
                <div className="font-medium">{user?.identities?.[0]?.identity_data?.full_name || user?.user_metadata?.full_name || userName || "User"}</div>
                <div className="text-xs text-neutral-500">
                  {user?.email || "user@example.com"}
                </div>
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

