'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Legal24LogoProps {
  href?: string;
  className?: string;
}

export default function Legal24Logo({ href = '/', className = '' }: Legal24LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 flex-shrink-0 ${className}`}>
      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden shadow-lg shadow-slate-200/50 p-1">
        <Image
          src="/image.png"
          alt="Legal24 Logo"
          width={40}
          height={40}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
        Legal24
      </span>
    </Link>
  );
}
