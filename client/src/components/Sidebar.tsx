import React from "react";
import { useLocation } from "wouter";
import { Logo } from "./Logo";
import { 
  Home, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Youtube, 
  Twitter, 
  Instagram, 
  Lock, 
  Settings 
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5 mr-3" /> },
    { name: "Strategies", path: "/strategies", icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { name: "Positions", path: "/positions", icon: <TrendingUp className="w-5 h-5 mr-3" /> },
    { name: "History", path: "/history", icon: <Clock className="w-5 h-5 mr-3" /> },
  ];

  const socialLinks = [
    { name: "How to use CryptoSniper", icon: <Youtube className="w-4 h-4 mr-2 text-red-500" /> },
    { name: "Realtime Updates", icon: <Twitter className="w-4 h-4 mr-2 text-accent" /> },
    { name: "Join Instagram", icon: <Instagram className="w-4 h-4 mr-2 text-pink-500" /> },
  ];

  const footerLinks = [
    { name: "Terms & Conditions", icon: <Lock className="w-4 h-4 mr-2" /> },
    { name: "Settings", icon: <Settings className="w-4 h-4 mr-2" /> },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 bg-secondary text-white hidden md:flex flex-col z-10">
      <div className="p-4">
        <Logo />
      </div>
      
      <div className="mt-6 px-4 text-sm text-white/60">Overview</div>
      <nav className="mt-2 space-y-1 px-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={ user ? item.path : "/visitor"}
            className={`flex items-center px-3 py-2 rounded-lg ${
              location === item.path
                ? "bg-primary/10 text-white"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </nav>
      
      <div className="mt-auto px-4 py-6">
        <div className="mt-6 text-sm text-white/60 mb-2">Join Us</div>
        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href="#"
              className="text-white/80 hover:text-white flex items-center text-sm px-2 py-1.5 rounded-md"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-4 space-y-2">
          {footerLinks.map((link, index) => (
            <a
              key={index}
              href="#"
              className="text-white/80 hover:text-white flex items-center text-sm px-2 py-1.5 rounded-md"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
