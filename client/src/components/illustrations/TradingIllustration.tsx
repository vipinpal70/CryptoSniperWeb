import React from "react";

export default function TradingIllustration() {
  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Shape */}
      <path
        d="M150 60C150 60 200 80 230 140C260 200 220 240 220 240L100 250C100 250 60 240 40 190C20 140 70 90 70 90L150 60Z"
        fill="#7B61FF"
        fillOpacity="0.2"
      />
      
      {/* Character */}
      <g transform="translate(100, 120)">
        {/* Head */}
        <circle cx="30" cy="0" r="25" fill="#FFFFFF" />
        <path
          d="M20 -5 C 23 -10, 37 -10, 40 -5 C 40 0, 35 10, 30 10 C 25 10, 20 0, 20 -5 Z"
          fill="#0055FF"
        />
        <circle cx="23" cy="-2" r="2" fill="#000000" />
        <circle cx="37" cy="-2" r="2" fill="#000000" />
        <path
          d="M25 5 C 28 8, 32 8, 35 5"
          stroke="#000000"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Body */}
        <path
          d="M0 30 L 60 30 L 50 90 L 10 90 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="1"
        />
        
        {/* Arms */}
        <path
          d="M0 40 C -20 30, -30 50, -40 40"
          stroke="#000000"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M60 40 C 80 30, 90 50, 100 40"
          stroke="#000000"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Hand gesture */}
        <circle cx="-45" cy="35" r="8" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        <path
          d="M-49 35 L -41 35"
          stroke="#000000"
          strokeWidth="1.5"
        />
        <path
          d="M-45 31 L -45 39"
          stroke="#000000"
          strokeWidth="1.5"
        />
        
        {/* Legs */}
        <path
          d="M20 90 L 15 130 C 15 135, 20 140, 25 140 C 30 140, 35 135, 35 130 L 40 90"
          fill="#0055FF"
        />
        
        {/* Feet */}
        <ellipse cx="20" cy="140" rx="10" ry="5" fill="#FFFFFF" />
        <ellipse cx="40" cy="140" rx="10" ry="5" fill="#FFFFFF" />
      </g>
      
      {/* Crypto Elements */}
      <circle cx="50" cy="170" r="15" fill="#00C4FF" />
      <text x="44" y="175" fontSize="14" fontWeight="bold" fill="#121942">₿</text>
      
      <circle cx="230" cy="100" r="10" fill="#0055FF" />
      <text x="226" y="104" fontSize="12" fontWeight="bold" fill="white">$</text>
      
      <circle cx="180" cy="220" r="12" fill="#22C55E" />
      <text x="176" y="224" fontSize="12" fontWeight="bold" fill="white">Ξ</text>
      
      {/* Light bulb idea */}
      <circle cx="70" cy="70" r="15" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
      <path
        d="M70 65 L 70 75 M 65 70 L 75 70"
        stroke="#0055FF"
        strokeWidth="2"
      />
      
      {/* Chart lines */}
      <path
        d="M10 220 L 50 200 L 100 210 L 150 180 L 200 190 L 250 170"
        stroke="#121942"
        strokeWidth="1"
        fill="none"
        strokeDasharray="2 2"
      />
      
      {/* Random elements */}
      <circle cx="40" cy="120" r="5" fill="#7B61FF" />
      <circle cx="250" cy="140" r="7" fill="#7B61FF" />
      <path
        d="M220 50 C 230 60, 240 45, 250 55"
        stroke="#121942"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
