'use client';

import Link from 'next/link';

export default function Legal24Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
      {/* Golden Circle with Lady Justice */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-amber-500 bg-black flex items-center justify-center">
          {/* Lady Justice Icon - Simplified */}
          <div className="relative">
            {/* Scales */}
            <div className="absolute top-2 left-1/2 w-5 h-3 border border-amber-500">
              <div className="absolute top-0 left-1/2 w-1 h-2 bg-amber-500"></div>
              <div className="absolute top-0 right-1/2 w-1 h-2 bg-amber-500"></div>
              <div className="absolute -top-1 left-1/2 w-3 h-0.5 border-t border-amber-500"></div>
            </div>
            {/* Sword */}
            <div className="absolute bottom-1 right-1/2 w-0.5 h-4 bg-amber-500 transform rotate-12"></div>
          </div>
        </div>
      </div>

      {/* LEGAL 24 Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-amber-500 tracking-wider">LEGAL</span>
        <span className="text-2xl font-bold text-amber-500">24</span>
      </div>
    </Link>
  );
}
