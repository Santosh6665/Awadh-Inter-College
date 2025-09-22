
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Use a static version number for cache busting.
  // Manually increment this number when you update the logo image.
  const cacheBuster = `?v=1`;
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
