'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
  size = 'md',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1.5',
    md: 'p-2 text-xs gap-2',
    lg: 'px-3 py-2 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    lg: 'w-5 h-5',
  }[size];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 border cursor-pointer select-none
        ${
          isDark
            ? 'bg-[#17232E] hover:bg-[#1E2E3D] text-[#00D2C4] border-[#243444] hover:border-[#00D2C4]/40 shadow-xs'
            : 'bg-white hover:bg-slate-100 text-[#112233] border-slate-200 hover:border-slate-300 shadow-xs'
        }
        focus:outline-none focus:ring-2 focus:ring-[#00D2C4] focus:ring-offset-1 dark:focus:ring-offset-[#0B131A]
        ${sizeClasses} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className={`${iconSizes} text-[#00D2C4] transition-transform duration-300 rotate-0`} />
        ) : (
          <Sun className={`${iconSizes} text-amber-500 transition-transform duration-300 rotate-0`} />
        )}
      </div>

      {showLabel && (
        <span className="font-semibold text-xs tracking-wide">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
}

export { ThemeToggle };
