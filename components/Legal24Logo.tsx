'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Legal24LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Legal24Logo({ href = '/', className = '', size = 'md' }: Legal24LogoProps) {
  const dimensions = {
    sm: { w: 60,  h: 24 },
    md: { w: 80,  h: 32 },
    lg: { w: 100, h: 40 },
  }[size];

  return (
    <Link href={href} className={`flex items-center flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="Legal24 — Legal Solutions, Simplified."
        width={dimensions.w}
        height={dimensions.h}
        className="object-contain"
        priority
      />
    </Link>
  );
}
