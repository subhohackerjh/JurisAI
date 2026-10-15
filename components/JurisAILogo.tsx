'use client';

import Link from 'next/link';
import Image from 'next/image';

interface JurisAILogoProps {
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function JurisAILogo({ href = '/', className = '', size = 'md' }: JurisAILogoProps) {
  const dimensions = {
    sm: { w: 32, h: 32 },
    md: { w: 40, h: 40 },
    lg: { w: 64, h: 64 },
  }[size];


  return (
    <Link href={href} className={`flex items-center flex-shrink-0 ${className}`}>
      <Image
        src="/jurisai.jpeg"
        alt="JurisAI - AI-Powered Legal Assistance Platform"
        width={dimensions.w}
        height={dimensions.h}
        className="object-contain"
        priority
      />
    </Link>
  );
}
