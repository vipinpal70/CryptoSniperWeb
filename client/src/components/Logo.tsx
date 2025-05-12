import React from "react";

export function Logo() {
  return (
    <div className="flex items-center">
      <svg
        className="w-8 h-8 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="#0055FF" />
        <path
          d="M12 3V7M12 17V21M3 12H7M17 12H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="ml-2 text-xl font-bold">SNIPERS</span>
    </div>
  );
}
