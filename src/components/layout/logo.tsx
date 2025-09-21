
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src="/images/logo.png"
        alt="Awadh Inter College Logo"
        width={50}
        height={50}
        className="object-contain"
        priority
      />
    </div>
  );
}
