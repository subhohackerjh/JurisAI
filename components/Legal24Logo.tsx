'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Legal24LogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'light' = on light bg (multiply removes white), 'dark' = on dark bg (screen removes white) */
  bg?: 'light' | 'dark';
}

export default function Legal24Logo({ href = '/', className = '', size = 'md', bg = 'light' }: Legal24LogoProps) {
  const dimensions = {
    sm: { w: 60,  h: 24 },
    md: { w: 80,  h: 32 },
    lg: { w: 100, h: 40 },
  }[size];

  // mix-blend-multiply → white bg disappears on light backgrounds
  // mix-blend-screen   → white bg disappears on dark backgrounds
  const blendClass = bg === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply';

  return (
    <Link href={href} className={`flex items-center flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="Legal24 — Legal Solutions, Simplified."
        width={dimensions.w}
        height={dimensions.h}
        className={`object-contain ${blendClass}`}
        priority
      />
    </Link>
  );
}
