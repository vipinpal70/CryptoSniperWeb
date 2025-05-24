import React from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/auth";
import { Lock, Settings, Home, BarChart, LineChart, History, Youtube, Instagram, MessageCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const { user } = useAuth();
  const location = window.location.pathname;

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-5 h-5 mr-2" /> },
    { name: "Strategies", path: "/strategies", icon: <BarChart className="w-5 h-5 mr-2" /> },
    { name: "Positions", path: "/positions", icon: <LineChart className="w-5 h-5 mr-2" /> },
    { name: "History", path: "/history", icon: <History className="w-5 h-5 mr-2" /> },
  ];

  const socialLinks = [
    { name: "How to use CryptoSniper", icon: <Youtube className="w-5 h-5 mr-2 text-red-500" /> },
    { name: "Realtime Updates", icon: <MessageCircle className="w-5 h-5 mr-2 text-blue-500" /> },
    { name: "Join Instagram", icon: <Instagram className="w-5 h-5 mr-2 text-pink-500" /> },
  ];

  const footerLinks = [
    { name: "Terms & Conditions", icon: <Lock className="w-5 h-5 mr-2" /> },
    { name: "LogOut", icon: <LogOut className="w-5 h-5 mr-2" /> },
  ];

  return (
    <aside className="w-64 fixed inset-y-0 bg-white text-black hidden md:flex flex-col z-10">
      <div className="p-4">
        <Logo />
      </div>

      <div className="mt-6 px-4 text-sm text-gray-500">Overview</div>
      <nav className="mt-2 space-y-1 px-2">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={user ? item.path : "/visitor"}
            className={`flex items-center px-3 py-2 rounded-lg ${location === item.path
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {item.icon}
            {item.name}
          </a>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="px-4 text-sm text-gray-500 mb-2">Join Us</div>
        <div className="bg-gray-50 rounded-lg mx-2 p-4 space-y-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href="#"
              className="flex items-center text-sm text-gray-700 hover:text-blue-600"
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>

        <div className="mt-4 px-4 space-y-3 mb-4">
          {footerLinks.map((link) => (
            <a
              key={link.name}
              href="#"
              onClick={link.name === "LogOut" ? handleLogout : undefined}
              className="flex items-center text-sm text-gray-700 hover:text-blue-600"
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

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    // Optionally, redirect to a login page or home page
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
