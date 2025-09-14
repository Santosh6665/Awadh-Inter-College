import { CollegeLogo } from '@/components/icons';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <CollegeLogo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg">ANP Inter College</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
            <Link href="/admissions" className="text-muted-foreground hover:text-foreground">
              Admissions
            </Link>
            <Link href="/gallery" className="text-muted-foreground hover:text-foreground">
              Gallery
            </Link>
            <Link href="/notices" className="text-muted-foreground hover:text-foreground">
              Notices
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Login
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ANP Inter College. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
