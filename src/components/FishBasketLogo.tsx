import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
}

export default function FishBasketLogo({ className = '', variant = 'full' }: LogoProps) {
  const isWhite = variant === 'white';

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      aria-label="Fish Basket Home"
    >
      {/* Premium SVG Logo: Leaping Fish over Woven Basket with Aqua & Coral */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00D2C4] to-[#0d9488] shadow-md group-hover:scale-105 transition-transform duration-200">
        <svg
          viewBox="0 0 40 40"
          className="w-7 h-7 text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Basket Base */}
          <path
            d="M8 22C8 28.5 13 33 20 33C27 33 32 28.5 32 22H8Z"
            fill="currentColor"
            opacity="0.95"
          />
          {/* Basket Weave lines */}
          <path
            d="M13 22L16 32M20 22V33M27 22L24 32"
            stroke="#0b1e2d"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Leaping Fresh Fish in coral */}
          <path
            d="M7 16C11 11 18 10 26 12C28 12.5 31 14 33 13C31 16 29 18 26 18C18 19 12 17 7 16Z"
            fill="#ff6b4a"
          />
          {/* Fish Tail */}
          <path
            d="M6 16L3 12C4 15 4 17 3 20L6 16Z"
            fill="#ff6b4a"
          />
          {/* Fish Eye */}
          <circle cx="28" cy="14" r="1.2" fill="#ffffff" />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col">
          <span
            className={`font-black text-xl tracking-tight leading-none ${
              isWhite ? 'text-white' : 'text-[#112233] dark:text-[#EAF2F8] group-hover:text-[#00D2C4]'
            } transition-colors`}
          >
            Fish<span className="text-[#00D2C4]">Basket</span>
          </span>
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase leading-tight mt-0.5 ${
              isWhite ? 'text-teal-200' : 'text-[#52667A] dark:text-[#9DB0C0]'
            }`}
          >
            Fresh Catch. Delivered Fresh.
          </span>
        </div>
      )}
    </Link>
  );
}
