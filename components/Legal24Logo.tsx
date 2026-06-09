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
    sm: { w: 80,  h: 32  },
    md: { w: 110, h: 44  },
    lg: { w: 150, h: 60  },
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
