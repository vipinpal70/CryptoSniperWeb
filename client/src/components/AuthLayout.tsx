import React, { ReactNode } from "react";
import { Logo } from "./Logo";
import TradingIllustration from "./illustrations/TradingIllustration";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar with branding and illustration */}
      <div className="w-full md:w-2/5 bg-secondary flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="fixed top-0 left-0 p-4 z-50">
            <Logo />
          </div>
          
          {/* Illustration */}
          <div className="flex justify-center items-center">
            <TradingIllustration />
          </div>
        </div>
      </div>
      
      {/* Right side with content */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
