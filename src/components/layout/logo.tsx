
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Add a version query to bust the cache when the logo is updated.
  const cacheBuster = `?v=2`;
  return (
    <div className={cn('relative', className)}>
      <Image
        src={`/images/logo.png${cacheBuster}`}
        alt="Awadh Inter College Logo"
        width={50}
        height={50}
        className="object-contain"
        priority
      />
    </div>
  );
}
