'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Legal24Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
      {/* Legal24 Logo Image */}
      <div className="relative w-10 h-10">
        <Image
          src="/image.png"
          alt="Legal24 Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* LEGAL 24 Text */}
      <div className="flex flex-col">
        <span className="text-xl font-bold text-amber-500 tracking-wider">LEGAL</span>
        <span className="text-2xl font-bold text-amber-500">24</span>
      </div>
    </Link>
  );
}
