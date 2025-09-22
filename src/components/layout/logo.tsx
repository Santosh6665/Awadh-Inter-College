
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  // Use a dynamic timestamp to ensure the browser always fetches the latest logo.
  const cacheBuster = `?t=${new Date().getTime()}`;
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
